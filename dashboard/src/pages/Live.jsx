import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  C, T, SENSORS_META, pmToAqi, aqiMeta, trustLabel, relTime,
  glass, card, label as labelStyle, bodyText,
} from "../tokens.js";
import Sparkline from "../components/Sparkline.jsx";
import AQIGauge  from "../components/AQIGauge.jsx";
import TimeChart from "../components/TimeChart.jsx";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SENSOR_IDS    = Object.keys(SENSORS_META).map(Number);

const EVENT_META = {
  smoke_spike:    { color: "#c2410c", label: "Smoke Spike"    },
  rain_washout:   { color: "#1d4ed8", label: "Rain Washout"   },
  sensor_failure: { color: "#b45309", label: "Sensor Failure" },
};

export default function Live() {
  const [liveReadings, setLiveReadings] = useState({});
  const [liveEvents,   setLiveEvents]   = useState([]);
  const [staticData,   setStaticData]   = useState(null);
  const [isLive,       setIsLive]       = useState(false);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [totalRows,    setTotalRows]    = useState(0);

  const [subTab,         setSubTab]        = useState("overview");
  const [selectedSensor, setSelectedSensor]= useState(230019);
  const [timeRange,      setTimeRange]     = useState("6h");
  const [showAB,         setShowAB]        = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    fetch("/data.json")
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.sensors && setStaticData(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON) return;
    let sb;
    import("@supabase/supabase-js").then(({ createClient }) => {
      sb = createClient(SUPABASE_URL, SUPABASE_ANON);
      sb.from("readings").select("*").in("sensor_id", SENSOR_IDS)
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
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "readings" }, (payload) => {
          const row = { ...payload.new, t_ms: new Date(payload.new.captured_at).getTime() };
          setLiveReadings(prev => ({
            ...prev,
            [row.sensor_id]: [...(prev[row.sensor_id] || []), row].slice(-120),
          }));
          setLastUpdated(new Date());
          setTotalRows(n => n + 1);
        }).subscribe();
    });
    return () => { channelRef.current?.unsubscribe(); };
  }, []);

  const sensors = useMemo(() => SENSOR_IDS.map(sid => {
    const meta = SENSORS_META[sid];
    if (isLive && liveReadings[sid]?.length) {
      const rows   = liveReadings[sid];
      const latest = rows[rows.length - 1];
      const aqi    = latest.aqi ?? pmToAqi(latest.pm_cf1);
      const staticRows = staticData?.sensors?.[sid]
        ? (staticData.sensors[sid].data || []).map(d => ({ ...d, t_ms: d.t, pm_cf1: d.pm, pm_a: d.a, pm_b: d.b }))
        : [];
      const sparkReadings = rows.length >= 10 ? rows : staticRows;
      return { ...meta, id: sid, readings: rows, sparkReadings, latest, aqi, aqiMeta: aqiMeta(aqi), trust: latest.trust_score ?? 0, hasData: true };
    }
    if (staticData?.sensors?.[sid]) {
      const s      = staticData.sensors[sid];
      const rows   = (s.data || []).map(d => ({ ...d, t_ms: d.t, pm_cf1: d.pm, pm_a: d.a, pm_b: d.b, temperature_c: d.temp, trust_score: d.trust }));
      const latest = { ...s.latest, pm_cf1: s.latest?.pm, pm_a: s.latest?.a, pm_b: s.latest?.b, temperature_c: s.latest?.temp, trust_score: s.latest?.trust };
      const aqi    = s.aqi ?? pmToAqi(latest.pm_cf1);
      return { ...meta, id: sid, readings: rows, sparkReadings: rows, latest, aqi, aqiMeta: aqiMeta(aqi), trust: s.latest?.trust ?? 0, hasData: true };
    }
    return { ...meta, id: sid, readings: [], sparkReadings: [], latest: {}, aqi: 0, aqiMeta: aqiMeta(0), trust: 0, hasData: false };
  }), [liveReadings, staticData, isLive]);

  const netAvgPM     = useMemo(() => {
    const active = sensors.filter(s => s.hasData && s.latest?.pm_cf1 != null);
    if (!active.length) return null;
    return (active.reduce((a, s) => a + (s.latest.pm_cf1 ?? 0), 0) / active.length).toFixed(1);
  }, [sensors]);

  const maxAQISensor  = useMemo(() => sensors.reduce((b, s) => (!b || s.aqi > b.aqi) ? s : b, null), [sensors]);
  const events        = useMemo(() => liveEvents.length ? liveEvents : (staticData?.events || []), [liveEvents, staticData]);
  const detailSensor  = useMemo(() => sensors.find(s => s.id === selectedSensor) || sensors[0], [sensors, selectedSensor]);
  const filteredReadings = useMemo(() => {
    if (!detailSensor?.readings?.length) return [];
    const counts = { "1h": 30, "6h": 180, "24h": 720, "7d": 5040 };
    return detailSensor.readings.slice(-(counts[timeRange] || 180));
  }, [detailSensor, timeRange]);

  const hasHourData = isLive ? totalRows >= 150 : true;
  const SUBTABS = ["overview", "detail", "events", "forecast", "statistics"];

  const TabBtn = ({ t }) => (
    <button onClick={() => setSubTab(t)} style={{
      background: "transparent", border: "none",
      position: "relative",
      color: subTab === t ? C.text : C.sub,
      padding: "13px 18px 11px",
      fontFamily: T.display, fontWeight: subTab === t ? 600 : 450, fontSize: 14,
      cursor: "pointer", textTransform: "capitalize", transition: "color 0.15s",
    }}
    onMouseEnter={e => { if (subTab !== t) e.currentTarget.style.color = C.text; }}
    onMouseLeave={e => { if (subTab !== t) e.currentTarget.style.color = C.sub; }}
    >
      {t}
      {subTab === t && (
        <motion.div layoutId="live-tab"
          style={{ position: "absolute", bottom: 0, left: 18, right: 18,
            height: 2, borderRadius: "2px 2px 0 0", background: C.accent }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", color: C.text }}>

      {/* Status bar */}
      <div style={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        padding: "10px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: isLive ? "#16a34a" : "#b45309",
              boxShadow: isLive ? "0 0 0 3px rgba(22,163,74,0.15)" : "0 0 0 3px rgba(180,83,9,0.15)",
              animation: "pulse 2s infinite",
            }}/>
            <span style={{ fontFamily: T.display, fontWeight: 600, fontSize: 13,
              color: isLive ? "#16a34a" : "#b45309" }}>
              {isLive ? "Supabase — Live" : "Static fallback — Nov 2025"}
            </span>
          </div>
          {lastUpdated && (
            <span style={{ fontFamily: T.mono, fontSize: 11, color: C.muted }}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          {[
            { l: "Avg PM2.5", v: netAvgPM ? `${netAvgPM} µg/m³` : "—" },
            { l: "Max AQI",   v: maxAQISensor?.aqi > 0 ? String(maxAQISensor.aqi) : "—", col: maxAQISensor?.aqiMeta?.color },
            { l: "Sensors",   v: `${sensors.filter(s => s.hasData).length} / ${SENSOR_IDS.length}` },
            { l: "Readings",  v: totalRows > 0 ? totalRows.toLocaleString() : "—" },
          ].map(({ l, v, col }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 15, color: col || C.text, lineHeight: 1 }}>{v}</div>
              <div style={{ ...labelStyle, marginTop: 3, fontSize: 10 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub tabs */}
      <div style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        padding: "0 48px", display: "flex",
      }}>
        {SUBTABS.map(t => <TabBtn key={t} t={t} />)}
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "36px 48px 80px" }}>

        {/* OVERVIEW */}
        {subTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 14 }}>
              {sensors.map((sensor, i) => {
                const tl    = trustLabel(sensor.trust);
                const spark = (sensor.sparkReadings || sensor.readings).slice(-60);
                return (
                  <motion.div key={sensor.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.35 }}
                    onClick={() => { setSelectedSensor(sensor.id); setSubTab("detail"); }}
                    style={{
                      ...glass({ padding: 0, overflow: "hidden", cursor: "pointer" }),
                      transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.95)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 20px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)";
                    }}
                  >
                    <div style={{ height: 3, background: sensor.hasData ? sensor.aqiMeta.color : C.borderSolid }} />
                    <div style={{ padding: "18px 22px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 2 }}>
                            {sensor.name}
                            {sensor.isKoz && (
                              <span style={{
                                fontFamily: T.mono, fontSize: 9, fontWeight: 700,
                                color: C.accent, background: C.accentLight,
                                border: `1px solid ${C.accentBorder}`,
                                borderRadius: 4, padding: "1px 6px", marginLeft: 6,
                              }}>CORE</span>
                            )}
                          </div>
                          <div style={{ fontFamily: T.display, fontSize: 12, color: C.muted }}>{sensor.location}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 32,
                            color: sensor.hasData ? sensor.aqiMeta.color : C.muted, lineHeight: 1 }}>
                            {sensor.hasData ? sensor.aqi : "—"}
                          </div>
                          <div style={{ fontFamily: T.display, fontSize: 11,
                            color: sensor.hasData ? sensor.aqiMeta.color : C.muted }}>
                            {sensor.hasData ? sensor.aqiMeta.label : "No data"}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: 10 }}>
                        <span style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 20, color: C.text }}>
                          {sensor.hasData ? (sensor.latest?.pm_cf1 ?? 0).toFixed(1) : "—"}
                        </span>
                        <span style={{ fontFamily: T.display, fontSize: 12, color: C.muted, marginLeft: 4 }}>µg/m³</span>
                      </div>

                      {spark.length > 2 && (
                        <div style={{ marginBottom: 10 }}>
                          <Sparkline data={spark} color={sensor.aqiMeta.color} height={34} />
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: 14 }}>
                          <span style={{ fontFamily: T.mono, fontSize: 11, color: tl.color }}>
                            &#9679; {tl.text} {sensor.hasData ? `${Math.round(sensor.trust)}%` : ""}
                          </span>
                          {sensor.latest?.temperature_c != null && (
                            <span style={{ fontFamily: T.mono, fontSize: 11, color: C.muted }}>
                              {sensor.latest.temperature_c.toFixed(0)}°C · {Math.round(sensor.latest?.humidity ?? 0)}%
                            </span>
                          )}
                        </div>
                        {sensor.lowCoverage && (
                          <span style={{ fontFamily: T.display, fontSize: 10, color: "#b45309" }}>low coverage</span>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
              {sensors.map(s => (
                <button key={s.id} onClick={() => setSelectedSensor(s.id)} style={{
                  background: selectedSensor === s.id ? C.accent : "rgba(255,255,255,0.7)",
                  color: selectedSensor === s.id ? "#fff" : C.sub,
                  border: `1px solid ${selectedSensor === s.id ? C.accent : "rgba(0,0,0,0.1)"}`,
                  padding: "7px 16px", borderRadius: 8, cursor: "pointer",
                  fontFamily: T.display, fontWeight: 500, fontSize: 13,
                  transition: "all 0.15s",
                  boxShadow: selectedSensor === s.id ? "0 2px 10px rgba(30,64,175,0.2)" : "none",
                }}>
                  {s.name}{s.lowCoverage && " ⚠"}
                </button>
              ))}
            </div>

            {detailSensor && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div style={{ ...glass(), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <AQIGauge aqi={detailSensor.aqi} size={160} />
                    <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 28,
                      color: detailSensor.aqiMeta.color, marginTop: 4 }}>
                      {(detailSensor.latest?.pm_cf1 ?? 0).toFixed(1)}
                      <span style={{ fontFamily: T.display, fontWeight: 400, fontSize: 13, color: C.sub, marginLeft: 4 }}>µg/m³</span>
                    </div>
                    <div style={{ ...labelStyle, marginTop: 5 }}>Current PM2.5</div>
                  </div>

                  <div style={glass()}>
                    <div style={labelStyle}>Sensor Reliability</div>
                    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                      {[
                        { l: "Trust Score", v: `${Math.round(detailSensor.trust)}%`, c: trustLabel(detailSensor.trust).color },
                        { l: "Channel A",   v: `${(detailSensor.latest?.pm_a ?? detailSensor.latest?.pm_cf1 ?? 0).toFixed(2)} µg/m³` },
                        { l: "Channel B",   v: `${(detailSensor.latest?.pm_b ?? detailSensor.latest?.pm_cf1 ?? 0).toFixed(2)} µg/m³` },
                        { l: "A/B Delta",   v: `${Math.abs((detailSensor.latest?.pm_a ?? 0) - (detailSensor.latest?.pm_b ?? 0)).toFixed(2)} µg/m³` },
                      ].map(({ l, v, c }) => (
                        <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={labelStyle}>{l}</span>
                          <span style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 16, color: c || C.text }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={glass()}>
                    <div style={labelStyle}>Conditions</div>
                    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                      {[
                        { l: "Temperature", v: detailSensor.latest?.temperature_c != null ? `${detailSensor.latest.temperature_c.toFixed(1)} °C` : "—" },
                        { l: "Humidity",    v: detailSensor.latest?.humidity != null ? `${Math.round(detailSensor.latest.humidity)}%` : "—" },
                        { l: "Sensor ID",   v: String(detailSensor.id) },
                        { l: "Location",    v: detailSensor.location },
                      ].map(({ l, v }) => (
                        <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={labelStyle}>{l}</span>
                          <span style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 13, color: C.text }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={glass()}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={labelStyle}>PM2.5 Time Series</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["1h","6h","24h","7d"].map(r => (
                        <button key={r} onClick={() => setTimeRange(r)} style={{
                          background: timeRange === r ? C.accent : "rgba(255,255,255,0.7)",
                          color: timeRange === r ? "#fff" : C.sub,
                          border: `1px solid ${timeRange === r ? C.accent : "rgba(0,0,0,0.1)"}`,
                          padding: "4px 12px", borderRadius: 6, cursor: "pointer",
                          fontFamily: T.mono, fontSize: 12, transition: "all 0.15s",
                        }}>{r}</button>
                      ))}
                      <button onClick={() => setShowAB(v => !v)} style={{
                        background: showAB ? "rgba(22,163,74,0.08)" : "rgba(255,255,255,0.7)",
                        color: showAB ? "#16a34a" : C.sub,
                        border: `1px solid ${showAB ? "rgba(22,163,74,0.3)" : "rgba(0,0,0,0.1)"}`,
                        padding: "4px 12px", borderRadius: 6, cursor: "pointer",
                        fontFamily: T.mono, fontSize: 12,
                      }}>A/B</button>
                    </div>
                  </div>
                  <TimeChart data={filteredReadings} showAB={showAB} height={200} color={detailSensor.aqiMeta.color} />
                  {showAB && (
                    <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
                      {[["#2563eb","Channel A"],["#db2777","Channel B"],[detailSensor.aqiMeta.color,"Fused PM2.5"]].map(([c,lbl]) => (
                        <span key={lbl} style={{ fontFamily: T.display, fontSize: 12, color: C.sub }}>
                          <span style={{ color: c }}>—</span> {lbl}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
              {[
                { l: "Smoke Spikes",    n: events.filter(e => e.event_type === "smoke_spike").length,    col: "#c2410c" },
                { l: "Rain Washouts",   n: events.filter(e => e.event_type === "rain_washout").length,   col: "#1d4ed8" },
                { l: "Sensor Failures", n: events.filter(e => e.event_type === "sensor_failure").length, col: "#b45309" },
                { l: "Total",           n: events.length,                                                  col: C.accent  },
              ].map(({ l, n, col }, i) => (
                <motion.div key={l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{ ...glass(), borderTop: `3px solid ${col}`, paddingTop: 20 }}
                >
                  <div style={labelStyle}>{l}</div>
                  <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 38,
                    color: col, lineHeight: 1, marginTop: 8 }}>{n}</div>
                </motion.div>
              ))}
            </div>

            {events.length === 0 ? (
              <div style={{ ...glass({ textAlign: "center", padding: 56 }) }}>
                <div style={{ fontFamily: T.display, fontSize: 16, color: C.muted }}>
                  {isLive ? "No events detected yet — collector is running." : "No events in this dataset."}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {events.map((ev, i) => {
                  const m  = EVENT_META[ev.event_type] || EVENT_META.smoke_spike;
                  const ts = ev.started_at || ev.time;
                  return (
                    <motion.div key={ev.id || i}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      style={{
                        ...glass({ padding: "16px 22px", borderLeft: `3px solid ${m.color}` }),
                        display: "flex", alignItems: "center", gap: 18,
                      }}
                    >
                      <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 14,
                        color: m.color, minWidth: 120 }}>{m.label}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: T.display, fontSize: 14, color: C.text }}>{ev.description || ev.desc}</div>
                        <div style={{ fontFamily: T.display, fontSize: 12, color: C.muted, marginTop: 2 }}>
                          Sensor {ev.sensor_id ?? ev.sensor}
                          {ev.pm_peak != null && ` · Peak ${ev.pm_peak.toFixed(1)} µg/m³`}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", minWidth: 70 }}>
                        <div style={{ fontFamily: T.display, fontSize: 11, fontWeight: 600,
                          color: ev.severity === "high" ? "#b91c1c" : ev.severity === "medium" ? "#b45309" : C.muted,
                          marginBottom: 3 }}>{(ev.severity || "").toUpperCase()}</div>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <div style={{ ...glass({ marginBottom: 20, padding: "16px 24px", borderLeft: `3px solid #6d28d9` }) }}>
              <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 3 }}>
                Random Forest — Single-step (t+1) autoregressive rollout
              </div>
              <div style={{ ...bodyText, fontSize: 13 }}>
                Predicts one 2-minute step at a time. The 6-hour view is an autoregressive rollout.
                Uncertainty from 10th–90th percentile across 100 trees. Sensor 290694 excluded (17.9% coverage).
              </div>
            </div>

            {!hasHourData && isLive ? (
              <div style={{ ...glass({ textAlign: "center", padding: 56 }) }}>
                <div style={{ fontFamily: T.display, fontSize: 18, fontWeight: 700, color: C.sub, marginBottom: 10 }}>
                  Forecast requires more historical data.
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 40, fontWeight: 700, color: C.accent }}>{totalRows.toLocaleString()}</div>
                <div style={{ ...labelStyle, marginTop: 5 }}>readings collected</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 14 }}>
                {sensors.filter(s => !s.lowCoverage && s.hasData).map((sensor, idx) => {
                  const fc = staticData?.forecasts?.[sensor.id];
                  if (!fc) return (
                    <div key={sensor.id} style={glass()}>
                      <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{sensor.name}</div>
                      <div style={{ fontFamily: T.display, fontSize: 13, color: C.muted, padding: "20px 0" }}>
                        {isLive ? "Forecast generates after sufficient data." : "No forecast available."}
                      </div>
                    </div>
                  );
                  const pts = fc.forecast || [];
                  const W = 340, H = 100, P = { t: 8, r: 12, b: 24, l: 32 };
                  const IW = W - P.l - P.r, IH = H - P.t - P.b;
                  const yMax = Math.max(...pts.map(p => p.hi ?? p.mean), 10) * 1.1;
                  const toX = i => P.l + (i / (pts.length - 1 || 1)) * IW;
                  const toY = v => P.t + IH - (Math.max(0, v) / yMax) * IH;
                  const band = [...pts.map((p, i) => `${toX(i)},${toY(p.hi ?? p.mean)}`),
                    ...pts.map((p, i) => `${toX(pts.length-1-i)},${toY(pts[pts.length-1-i].lo ?? pts[pts.length-1-i].mean)}`)].join(" ");
                  const mean = pts.map((p, i) => `${toX(i)},${toY(p.mean)}`).join(" ");
                  return (
                    <motion.div key={sensor.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }} style={glass()}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 14, color: C.text }}>{sensor.name}</div>
                          <div style={{ fontFamily: T.display, fontSize: 12, color: C.muted }}>{sensor.location}</div>
                        </div>
                        <span style={{ fontFamily: T.mono, fontSize: 11, color: trustLabel(sensor.trust).color }}>
                          {trustLabel(sensor.trust).text}
                        </span>
                      </div>
                      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }} preserveAspectRatio="none">
                        <polygon points={band} fill={sensor.aqiMeta.color} opacity="0.1"/>
                        <polyline points={mean} fill="none" stroke={sensor.aqiMeta.color} strokeWidth="1.8" strokeLinejoin="round"/>
                      </svg>
                      <div style={{ display: "flex", gap: 18, marginTop: 8 }}>
                        <div>
                          <div style={labelStyle}>Last PM2.5</div>
                          <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 16, color: C.text, marginTop: 1 }}>{fc.lastPM?.toFixed(1)} µg/m³</div>
                        </div>
                        <div>
                          <div style={labelStyle}>Next (t+1)</div>
                          <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 16, color: C.accent, marginTop: 1 }}>{fc.nextMean?.toFixed(1)} µg/m³</div>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            {!isLive || totalRows < 30 ? (
              <div style={{ ...glass({ textAlign: "center", padding: 64 }) }}>
                <div style={{ fontFamily: T.display, fontSize: 18, fontWeight: 700, color: C.sub, marginBottom: 14 }}>
                  Collecting baseline data...
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 44, fontWeight: 700, color: C.accent, lineHeight: 1 }}>
                  {totalRows.toLocaleString()}
                </div>
                <div style={{ ...labelStyle, marginTop: 6 }}>readings collected</div>
                <div style={{ ...bodyText, fontSize: 13, maxWidth: 380, margin: "16px auto 0" }}>
                  Rolling 1-hour averages appear after ~30 readings per sensor.
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {sensors.filter(s => s.hasData && s.readings.length > 2).slice(0, 6).map((sensor, idx) => {
                  const recent = sensor.readings.slice(-30);
                  const pms = recent.map(r => r.pm_cf1 ?? 0).filter(Boolean);
                  const avg = pms.reduce((a, v) => a + v, 0) / (pms.length || 1);
                  const max = Math.max(...pms);
                  const min = Math.min(...pms);
                  return (
                    <motion.div key={sensor.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }} style={glass()}>
                      <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 12 }}>
                        {sensor.name}
                      </div>
                      <Sparkline data={recent} color={sensor.aqiMeta.color} height={44} />
                      <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
                        {[["Avg", avg.toFixed(1)], ["Max", max.toFixed(1)], ["Min", min.toFixed(1)]].map(([l, v]) => (
                          <div key={l}>
                            <div style={labelStyle}>{l} (1h)</div>
                            <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 18,
                              color: C.text, marginTop: 2 }}>{v} <span style={{ fontFamily: T.display, fontSize: 11, color: C.muted }}>µg/m³</span></div>
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
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
