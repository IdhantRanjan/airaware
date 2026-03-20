import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  C, T, SENSORS_META, pmToAqi, aqiMeta, trustLabel, relTime,
  card, glassCard, label as labelStyle, bodyText, gradientText,
} from "../tokens.js";
import Sparkline    from "../components/Sparkline.jsx";
import AQIGauge     from "../components/AQIGauge.jsx";
import TimeChart    from "../components/TimeChart.jsx";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SENSOR_IDS    = Object.keys(SENSORS_META).map(Number);

const EVENT_META = {
  smoke_spike:    { icon: "●", color: "#fb923c", label: "Smoke Spike"    },
  rain_washout:   { icon: "●", color: "#38bdf8", label: "Rain Washout"   },
  sensor_failure: { icon: "●", color: "#fbbf24", label: "Sensor Failure" },
};

const stagger = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export default function Live() {
  const [liveReadings, setLiveReadings]  = useState({});
  const [liveEvents,   setLiveEvents]    = useState([]);
  const [staticData,   setStaticData]    = useState(null);
  const [isLive,       setIsLive]        = useState(false);
  const [lastUpdated,  setLastUpdated]   = useState(null);
  const [totalRows,    setTotalRows]     = useState(0);

  const [subTab,           setSubTab]          = useState("overview");
  const [selectedSensor,   setSelectedSensor]  = useState(230019);
  const [timeRange,        setTimeRange]        = useState("6h");
  const [showAB,           setShowAB]           = useState(false);
  const channelRef = useRef(null);

  // Load static fallback
  useEffect(() => {
    fetch("/data.json")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d?.sensors && setStaticData(d))
      .catch(() => {});
  }, []);

  // Load from Supabase
  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON) return;
    let sb;
    import("@supabase/supabase-js").then(({ createClient }) => {
      sb = createClient(SUPABASE_URL, SUPABASE_ANON);

      sb.from("readings")
        .select("*")
        .in("sensor_id", SENSOR_IDS)
        .order("captured_at", { ascending: true })
        .limit(120 * SENSOR_IDS.length)
        .then(({ data }) => {
          if (!data?.length) return;
          const byId = {};
          for (const row of data) {
            if (!byId[row.sensor_id]) byId[row.sensor_id] = [];
            byId[row.sensor_id].push({ ...row, t_ms: new Date(row.captured_at).getTime() });
          }
          setLiveReadings(byId);
          setIsLive(true);
          setTotalRows(data.length);
          setLastUpdated(new Date());
        });

      sb.from("events").select("*").order("started_at", { ascending: false }).limit(50)
        .then(({ data }) => data && setLiveEvents(data));

      channelRef.current = sb.channel("readings-live")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "readings" },
          (payload) => {
            const row = { ...payload.new, t_ms: new Date(payload.new.captured_at).getTime() };
            setLiveReadings((prev) => ({
              ...prev,
              [row.sensor_id]: [...(prev[row.sensor_id] || []), row].slice(-120),
            }));
            setLastUpdated(new Date());
            setTotalRows((n) => n + 1);
          })
        .subscribe();
    });

    return () => { channelRef.current?.unsubscribe(); };
  }, []);

  // Build sensor summaries
  const sensors = useMemo(() => {
    return SENSOR_IDS.map((sid) => {
      const meta = SENSORS_META[sid];

      if (isLive && liveReadings[sid]?.length) {
        const rows   = liveReadings[sid];
        const latest = rows[rows.length - 1];
        const aqi    = latest.aqi ?? pmToAqi(latest.pm_cf1);
        // For sparklines: use static data as source when live has fewer than 10 readings
        const staticRows = staticData?.sensors?.[sid]
          ? (staticData.sensors[sid].data || []).map((d) => ({ ...d, t_ms: d.t, pm_cf1: d.pm, pm_a: d.a, pm_b: d.b }))
          : [];
        const sparkReadings = rows.length >= 10 ? rows : staticRows;
        return { ...meta, id: sid, readings: rows, sparkReadings, latest, aqi, aqiMeta: aqiMeta(aqi), trust: latest.trust_score ?? 0, hasData: true };
      }

      if (staticData?.sensors?.[sid]) {
        const s      = staticData.sensors[sid];
        const rows   = (s.data || []).map((d) => ({ ...d, t_ms: d.t, pm_cf1: d.pm, pm_a: d.a, pm_b: d.b, temperature_c: d.temp, trust_score: d.trust }));
        const latest = { ...s.latest, pm_cf1: s.latest?.pm, pm_a: s.latest?.a, pm_b: s.latest?.b, temperature_c: s.latest?.temp, trust_score: s.latest?.trust };
        const aqi    = s.aqi ?? pmToAqi(latest.pm_cf1);
        return { ...meta, id: sid, readings: rows, sparkReadings: rows, latest, aqi, aqiMeta: aqiMeta(aqi), trust: s.latest?.trust ?? 0, hasData: true };
      }

      return { ...meta, id: sid, readings: [], sparkReadings: [], latest: {}, aqi: 0, aqiMeta: aqiMeta(0), trust: 0, hasData: false };
    });
  }, [liveReadings, staticData, isLive]);

  const netAvgPM   = useMemo(() => {
    const active = sensors.filter((s) => s.hasData && s.latest?.pm_cf1 != null);
    if (!active.length) return null;
    return (active.reduce((a, s) => a + (s.latest.pm_cf1 ?? 0), 0) / active.length).toFixed(1);
  }, [sensors]);

  const maxAQISensor = useMemo(() => sensors.reduce((b, s) => (!b || s.aqi > b.aqi) ? s : b, null), [sensors]);
  const events       = useMemo(() => liveEvents.length ? liveEvents : (staticData?.events || []), [liveEvents, staticData]);
  const detailSensor = useMemo(() => sensors.find((s) => s.id === selectedSensor) || sensors[0], [sensors, selectedSensor]);

  const filteredReadings = useMemo(() => {
    if (!detailSensor?.readings?.length) return [];
    const counts = { "1h": 30, "6h": 180, "24h": 720, "7d": 5040 };
    return detailSensor.readings.slice(-(counts[timeRange] || 180));
  }, [detailSensor, timeRange]);

  const hasHourData = isLive ? totalRows >= 30 * 5 : true;

  const SUBTABS = ["overview", "detail", "events", "forecast", "statistics"];

  return (
    <div style={{ background: "transparent", minHeight: "100vh", color: C.text }}>
      {/* Status bar */}
      <div style={{
        background: `${C.surface}d0`,
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.border}60`,
        padding: "12px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: isLive ? "#34d399" : "#fbbf24",
              boxShadow: isLive ? "0 0 12px rgba(52,211,153,0.4)" : "0 0 12px rgba(251,191,36,0.3)",
              animation: "pulse 2s infinite",
            }} />
            <span style={{ fontFamily: T.display, fontWeight: 600, fontSize: 13,
              color: isLive ? "#34d399" : "#fbbf24" }}>
              {isLive ? "Supabase — Live" : "Static fallback — Nov 2025"}
            </span>
          </div>
          {lastUpdated && (
            <span style={{ fontFamily: T.mono, fontSize: 11, color: C.muted }}>
              Last update {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {[
            { l: "Avg PM2.5", v: netAvgPM ? `${netAvgPM} ug/m3` : "—" },
            { l: "Max AQI",   v: maxAQISensor?.aqi > 0 ? String(maxAQISensor.aqi) : "—", color: maxAQISensor ? maxAQISensor.aqiMeta.color : C.sub },
            { l: "Sensors",   v: `${sensors.filter((s) => s.hasData).length} / ${SENSOR_IDS.length}` },
            { l: "Readings",  v: totalRows > 0 ? totalRows.toLocaleString() : "—" },
          ].map(({ l, v, color }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 16,
                color: color || C.text, lineHeight: 1 }}>{v}</div>
              <div style={{ ...labelStyle, marginTop: 3, fontSize: 10 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-tab nav */}
      <div style={{
        background: `${C.bg}e0`,
        borderBottom: `1px solid ${C.border}60`,
        padding: "0 48px",
        display: "flex",
        gap: 2,
      }}>
        {SUBTABS.map((t) => (
          <button key={t} onClick={() => setSubTab(t)} style={{
            background: "transparent",
            border: "none",
            position: "relative",
            color: subTab === t ? C.text : C.sub,
            padding: "14px 20px 12px",
            fontFamily: T.display,
            fontWeight: subTab === t ? 600 : 450,
            fontSize: 14,
            cursor: "pointer",
            textTransform: "capitalize",
            transition: "all 0.2s",
          }}>
            {t}
            {subTab === t && (
              <motion.div
                layoutId="live-tab-underline"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 20, right: 20,
                  height: 2,
                  borderRadius: 1,
                  background: C.gradientA,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 48px 80px" }}>

        {/* OVERVIEW */}
        {subTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {sensors.map((sensor, i) => {
                const tl   = trustLabel(sensor.trust);
                const spark = (sensor.sparkReadings || sensor.readings).slice(-60);
                return (
                  <motion.div
                    key={sensor.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                    onClick={() => { setSelectedSensor(sensor.id); setSubTab("detail"); }}
                    style={{
                      ...glassCard({ padding: 0, overflow: "hidden", cursor: "pointer" }),
                      transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.borderColor = C.border2;
                      e.currentTarget.style.boxShadow = `0 8px 32px rgba(56,189,248,0.06)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Gradient top bar */}
                    <div style={{
                      height: 3,
                      background: sensor.hasData
                        ? `linear-gradient(90deg, ${sensor.aqiMeta.color}80, ${sensor.aqiMeta.color})`
                        : C.border,
                    }} />
                    <div style={{ padding: "20px 24px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                        <div>
                          <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 3 }}>
                            {sensor.name}
                            {sensor.isKoz && (
                              <span style={{ fontFamily: T.mono, fontSize: 9,
                                ...gradientText(),
                                background: `${C.accent}12`, border: `1px solid ${C.accent}20`,
                                borderRadius: 4, padding: "2px 7px", marginLeft: 7,
                                WebkitTextFillColor: C.accent,
                              }}>CORE</span>
                            )}
                          </div>
                          <div style={{ fontFamily: T.display, fontSize: 12, color: C.sub }}>
                            {sensor.location}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{
                            fontFamily: T.mono, fontWeight: 700, fontSize: 34,
                            color: sensor.hasData ? sensor.aqiMeta.color : C.muted,
                            lineHeight: 1,
                          }}>{sensor.hasData ? sensor.aqi : "—"}</div>
                          <div style={{ fontFamily: T.display, fontSize: 11,
                            color: sensor.hasData ? sensor.aqiMeta.color : C.muted }}>
                            {sensor.hasData ? sensor.aqiMeta.label : "No data"}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <span style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 22, color: C.text }}>
                          {sensor.hasData ? (sensor.latest?.pm_cf1 ?? 0).toFixed(1) : "—"}
                        </span>
                        <span style={{ fontFamily: T.display, fontSize: 12, color: C.sub, marginLeft: 5 }}>ug/m3</span>
                      </div>

                      {spark.length > 2 && (
                        <div style={{ marginBottom: 12 }}>
                          <Sparkline data={spark} color={sensor.aqiMeta.color} height={36} />
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: 16 }}>
                          <span style={{ fontFamily: T.mono, fontSize: 11, color: tl.color }}>
                            &#9679; {tl.text} {sensor.hasData ? `${Math.round(sensor.trust)}%` : ""}
                          </span>
                          {sensor.latest?.temperature_c != null && (
                            <span style={{ fontFamily: T.mono, fontSize: 11, color: C.sub }}>
                              {sensor.latest.temperature_c.toFixed(0)}C &middot; {Math.round(sensor.latest?.humidity ?? 0)}%
                            </span>
                          )}
                        </div>
                        {sensor.lowCoverage && (
                          <span style={{ fontFamily: T.display, fontSize: 10, color: "#fbbf24" }}>low coverage</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* DETAIL */}
        {subTab === "detail" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {/* Sensor picker */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
              {sensors.map((s) => (
                <motion.button key={s.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedSensor(s.id)} style={{
                  background: selectedSensor === s.id
                    ? C.gradientA
                    : `${C.surface}`,
                  color: selectedSensor === s.id ? "#fff" : C.sub,
                  border: `1px solid ${selectedSensor === s.id ? "transparent" : C.border}`,
                  padding: "8px 18px", borderRadius: 10, cursor: "pointer",
                  fontFamily: T.display, fontWeight: 500, fontSize: 13,
                  transition: "all 0.15s",
                  boxShadow: selectedSensor === s.id ? "0 2px 12px rgba(56,189,248,0.2)" : "none",
                }}>
                  {s.name}
                  {s.lowCoverage && <span style={{ marginLeft: 4, color: "#fbbf24" }}>!</span>}
                </motion.button>
              ))}
            </div>

            {detailSensor && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                  {/* AQI Gauge */}
                  <div style={{ ...glassCard(), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <AQIGauge aqi={detailSensor.aqi} size={160} />
                    <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 30,
                      color: detailSensor.aqiMeta.color, marginTop: 4 }}>
                      {(detailSensor.latest?.pm_cf1 ?? 0).toFixed(1)}
                      <span style={{ fontFamily: T.display, fontWeight: 400, fontSize: 14, color: C.sub, marginLeft: 5 }}>ug/m3</span>
                    </div>
                    <div style={{ ...labelStyle, marginTop: 6 }}>Current PM2.5</div>
                  </div>

                  {/* Reliability */}
                  <div style={glassCard()}>
                    <div style={labelStyle}>Sensor Reliability</div>
                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                      {[
                        { l: "Trust Score", v: `${Math.round(detailSensor.trust)}%`, c: trustLabel(detailSensor.trust).color },
                        { l: "Channel A",   v: `${(detailSensor.latest?.pm_a ?? detailSensor.latest?.pm_cf1 ?? 0).toFixed(2)} ug/m3` },
                        { l: "Channel B",   v: `${(detailSensor.latest?.pm_b ?? detailSensor.latest?.pm_cf1 ?? 0).toFixed(2)} ug/m3` },
                        { l: "A/B Delta",   v: `${Math.abs((detailSensor.latest?.pm_a ?? 0) - (detailSensor.latest?.pm_b ?? 0)).toFixed(2)} ug/m3` },
                      ].map(({ l, v, c }) => (
                        <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={labelStyle}>{l}</span>
                          <span style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 17, color: c || C.text }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conditions */}
                  <div style={glassCard()}>
                    <div style={labelStyle}>Conditions</div>
                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                      {[
                        { l: "Temperature", v: detailSensor.latest?.temperature_c != null ? `${detailSensor.latest.temperature_c.toFixed(1)} C` : "—" },
                        { l: "Humidity",    v: detailSensor.latest?.humidity != null ? `${Math.round(detailSensor.latest.humidity)}%` : "—" },
                        { l: "Sensor ID",   v: String(detailSensor.id) },
                        { l: "Location",    v: detailSensor.location },
                      ].map(({ l, v }) => (
                        <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={labelStyle}>{l}</span>
                          <span style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 14, color: C.text }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Time series */}
                <div style={glassCard()}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={labelStyle}>PM2.5 Time Series</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["1h","6h","24h","7d"].map((r) => (
                        <button key={r} onClick={() => setTimeRange(r)} style={{
                          background: timeRange === r ? C.gradientA : C.elevated,
                          color: timeRange === r ? "#fff" : C.sub,
                          border: `1px solid ${timeRange === r ? "transparent" : C.border}`,
                          padding: "5px 14px", borderRadius: 8, cursor: "pointer",
                          fontFamily: T.mono, fontSize: 12,
                          transition: "all 0.15s",
                        }}>{r}</button>
                      ))}
                      <button onClick={() => setShowAB((v) => !v)} style={{
                        background: showAB ? "#0d2818" : C.elevated,
                        color: showAB ? "#34d399" : C.sub,
                        border: `1px solid ${showAB ? "#166534" : C.border}`,
                        padding: "5px 14px", borderRadius: 8, cursor: "pointer",
                        fontFamily: T.mono, fontSize: 12,
                      }}>A/B</button>
                    </div>
                  </div>
                  <TimeChart data={filteredReadings} showAB={showAB} height={210}
                    color={detailSensor.aqiMeta.color} />
                  {showAB && (
                    <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                      {[["#60a5fa","Channel A"],["#f472b6","Channel B"],[detailSensor.aqiMeta.color,"Fused PM2.5"]].map(([c,lbl]) => (
                        <span key={lbl} style={{ fontFamily: T.display, fontSize: 12, color: C.sub }}>
                          <span style={{ color: c }}>-</span> {lbl}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* EVENTS */}
        {subTab === "events" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
              {[
                { l: "Smoke Spikes",    n: events.filter(e => e.event_type === "smoke_spike").length,    gradient: C.gradientWarm },
                { l: "Rain Washouts",   n: events.filter(e => e.event_type === "rain_washout").length,   gradient: C.gradientA },
                { l: "Sensor Failures", n: events.filter(e => e.event_type === "sensor_failure").length, gradient: "linear-gradient(135deg, #fbbf24, #fb923c)" },
                { l: "Total",           n: events.length,                                                  gradient: C.gradientB  },
              ].map(({ l, n, gradient }, i) => (
                <motion.div key={l} {...stagger} transition={{ delay: i * 0.08 }}
                  style={{
                    ...glassCard(),
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 2,
                    background: gradient,
                  }}/>
                  <div style={labelStyle}>{l}</div>
                  <div style={{
                    fontFamily: T.mono, fontWeight: 700, fontSize: 40,
                    ...gradientText(gradient),
                    lineHeight: 1, marginTop: 10,
                  }}>{n}</div>
                </motion.div>
              ))}
            </div>

            {events.length === 0 ? (
              <div style={{ ...glassCard(), textAlign: "center", padding: 56 }}>
                <div style={{ fontFamily: T.display, fontSize: 17, color: C.sub }}>
                  {isLive ? "No events detected yet — collector is running." : "No events in this dataset."}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {events.map((ev, i) => {
                  const m  = EVENT_META[ev.event_type] || EVENT_META.smoke_spike;
                  const ts = ev.started_at || ev.time;
                  return (
                    <motion.div key={ev.id || i} {...stagger} transition={{ delay: i * 0.04 }}
                      style={{
                        ...glassCard({ padding: "18px 24px", borderLeft: `3px solid ${m.color}` }),
                        display: "flex", alignItems: "center", gap: 20,
                      }}
                    >
                      <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 15,
                        color: m.color, minWidth: 130 }}>{m.label}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: T.display, fontSize: 14, color: C.text }}>
                          {ev.description || ev.desc}
                        </div>
                        <div style={{ fontFamily: T.display, fontSize: 12, color: C.sub, marginTop: 3 }}>
                          Sensor {ev.sensor_id ?? ev.sensor}
                          {ev.pm_peak != null && ` · Peak ${ev.pm_peak.toFixed(1)} ug/m3`}
                          {ev.confidence != null && ` · ${Math.round(ev.confidence * 100)}% confidence`}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", minWidth: 80 }}>
                        <div style={{
                          fontFamily: T.display, fontSize: 11, fontWeight: 600,
                          color: ev.severity === "high" ? "#f87171" : ev.severity === "medium" ? "#fbbf24" : C.sub,
                          marginBottom: 4,
                        }}>{(ev.severity || "").toUpperCase()}</div>
                        <div style={{ ...labelStyle, fontSize: 10 }}>{relTime(ts)}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* FORECAST */}
        {subTab === "forecast" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div style={{ ...glassCard({ marginBottom: 24, padding: "18px 28px" }),
              borderLeft: `3px solid ${C.accent2}`, position: "relative", overflow: "hidden" }}>
              <div style={{
                fontFamily: T.display, fontWeight: 600, fontSize: 15, color: C.text, marginBottom: 4,
              }}>
                Random Forest — Single-step (t+1) autoregressive rollout
              </div>
              <div style={{ ...bodyText, fontSize: 14 }}>
                This model predicts one 2-minute step at a time. The 6-hour view is an autoregressive
                rollout (each predicted value feeds the next step). Uncertainty estimated via 10th-90th
                percentile across 100 trees. Sensor 290694 excluded (17.9% coverage).
              </div>
            </div>

            {!hasHourData && isLive ? (
              <div style={{ ...glassCard(), textAlign: "center", padding: 64 }}>
                <div style={{ fontFamily: T.display, fontSize: 20, fontWeight: 700, color: C.sub, marginBottom: 12 }}>
                  Forecast requires more historical data.
                </div>
                <div style={{
                  fontFamily: T.mono, fontSize: 40, fontWeight: 700,
                  ...gradientText(),
                }}>{totalRows.toLocaleString()}</div>
                <div style={{ ...labelStyle, marginTop: 6 }}>readings collected</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", gap: 16 }}>
                {sensors.filter((s) => !s.lowCoverage && s.hasData).map((sensor, idx) => {
                  const fc = staticData?.forecasts?.[sensor.id];
                  if (!fc) return (
                    <motion.div key={sensor.id} {...stagger} transition={{ delay: idx * 0.06 }}
                      style={glassCard()}>
                      <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{sensor.name}</div>
                      <div style={{ fontFamily: T.display, fontSize: 13, color: C.sub, padding: "24px 0" }}>
                        {isLive ? "Forecast generates after sufficient data collects." : "No forecast data available."}
                      </div>
                    </motion.div>
                  );
                  const pts = fc.forecast || [];
                  const W = 360, H = 110, P = { t: 8, r: 12, b: 28, l: 36 };
                  const IW = W - P.l - P.r, IH = H - P.t - P.b;
                  const yMax = Math.max(...pts.map((p) => p.hi ?? p.mean), 10) * 1.1;
                  const toX = (i) => P.l + (i / (pts.length - 1 || 1)) * IW;
                  const toY = (v) => P.t + IH - (Math.max(0, v) / yMax) * IH;
                  const band = [
                    ...pts.map((p, i) => `${toX(i)},${toY(p.hi ?? p.mean)}`),
                    ...pts.map((p, i) => `${toX(pts.length - 1 - i)},${toY(pts[pts.length - 1 - i].lo ?? pts[pts.length - 1 - i].mean)}`),
                  ].join(" ");
                  const mean = pts.map((p, i) => `${toX(i)},${toY(p.mean)}`).join(" ");
                  return (
                    <motion.div key={sensor.id} {...stagger} transition={{ delay: idx * 0.06 }}
                      style={glassCard()}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 15 }}>{sensor.name}</div>
                          <div style={{ fontFamily: T.display, fontSize: 12, color: C.sub }}>{sensor.location}</div>
                        </div>
                        <span style={{ fontFamily: T.mono, fontSize: 11, color: trustLabel(sensor.trust).color, alignSelf: "flex-start" }}>
                          TRUST {trustLabel(sensor.trust).text}
                        </span>
                      </div>
                      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }} preserveAspectRatio="none">
                        <polygon points={band} fill={C.accent} opacity="0.1"/>
                        <polyline points={mean} fill="none" stroke={C.accent} strokeWidth="2" strokeLinejoin="round"/>
                      </svg>
                      <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
                        <div>
                          <div style={labelStyle}>Last PM2.5</div>
                          <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 18, color: C.text, marginTop: 2 }}>
                            {fc.lastPM?.toFixed(1)} ug/m3
                          </div>
                        </div>
                        <div>
                          <div style={labelStyle}>Next (t+1)</div>
                          <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 18,
                            ...gradientText(), marginTop: 2 }}>
                            {fc.nextMean?.toFixed(1)} ug/m3
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* STATISTICS */}
        {subTab === "statistics" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {!isLive || totalRows < 30 ? (
              <div style={{ ...glassCard(), textAlign: "center", padding: 72 }}>
                <div style={{ fontFamily: T.display, fontSize: 20, fontWeight: 700, color: C.sub, marginBottom: 16 }}>
                  Collecting baseline data...
                </div>
                <div style={{
                  fontFamily: T.mono, fontSize: 48, fontWeight: 700,
                  ...gradientText(),
                  lineHeight: 1,
                }}>
                  {totalRows.toLocaleString()}
                </div>
                <div style={{ ...labelStyle, marginTop: 8 }}>readings collected</div>
                <div style={{ ...bodyText, fontSize: 14, maxWidth: 420, margin: "20px auto 0" }}>
                  Rolling 1-hour averages appear after ~30 readings per sensor.
                  Daily comparisons unlock after 24h. The weekly heatmap after 7 days.
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {sensors.filter((s) => s.hasData && s.readings.length > 2).slice(0, 6).map((sensor, idx) => {
                  const recent = sensor.readings.slice(-30);
                  const pms = recent.map((r) => r.pm_cf1 ?? 0).filter(Boolean);
                  const avg = pms.reduce((a, v) => a + v, 0) / (pms.length || 1);
                  const max = Math.max(...pms);
                  const min = Math.min(...pms);
                  return (
                    <motion.div key={sensor.id} {...stagger} transition={{ delay: idx * 0.06 }}
                      style={glassCard()}>
                      <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 15, marginBottom: 14 }}>
                        {sensor.name}
                      </div>
                      <Sparkline data={recent} color={sensor.aqiMeta.color} height={48} />
                      <div style={{ display: "flex", gap: 24, marginTop: 14 }}>
                        {[["Avg", avg.toFixed(1)], ["Max", max.toFixed(1)], ["Min", min.toFixed(1)]].map(([l, v]) => (
                          <div key={l}>
                            <div style={labelStyle}>{l} (1h)</div>
                            <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 20,
                              color: C.text, marginTop: 3 }}>{v} <span style={{ fontFamily: T.display, fontSize: 11, color: C.sub }}>ug/m3</span></div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}
