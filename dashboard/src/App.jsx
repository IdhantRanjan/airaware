import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ─── Supabase (graceful if not configured) ──────────────────────────────────
let supabase = null;
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (SUPABASE_URL && SUPABASE_ANON) {
  import("@supabase/supabase-js").then(({ createClient }) => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
  });
}

// ─── Fonts ───────────────────────────────────────────────────────────────────
const FONT_LINK = document.createElement("link");
FONT_LINK.rel  = "stylesheet";
FONT_LINK.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;700&display=swap";
document.head.appendChild(FONT_LINK);

// ─── All 11 sensors ──────────────────────────────────────────────────────────
const ALL_SENSORS = [
  { id: 230019, name: "Lewis University",         location: "Romeoville",   isKoz: true  },
  { id: 249443, name: "Joliet WWJ-222397",         location: "Joliet",       isKoz: true  },
  { id: 249445, name: "Joliet South",              location: "Joliet",       isKoz: true  },
  { id: 290694, name: "White Oak Lockport",        location: "Lockport",     isKoz: true, lowCoverage: true },
  { id: 297697, name: "Joliet Township",           location: "Joliet",       isKoz: true  },
  { id: 290986, name: "White Oak Romeoville",      location: "Romeoville",   isKoz: false },
  { id: 288454, name: "White Oak Crest Hill",      location: "Crest Hill",   isKoz: false },
  { id: 249125, name: "Bolingbrook",               location: "Bolingbrook",  isKoz: false },
  { id: 267810, name: "Bolingbrook North",         location: "Bolingbrook",  isKoz: false },
  { id: 287190, name: "Joliet Kinsey Ave",         location: "Joliet",       isKoz: false },
  { id: 288452, name: "Joliet SW",                 location: "Joliet",       isKoz: false },
];
const SENSOR_IDS = ALL_SENSORS.map((s) => s.id);

// ─── AQI helpers ─────────────────────────────────────────────────────────────
const AQI_BREAKS = [
  [0, 9.0, 0, 50,   "Good",           "#16a34a", "#052e16"],
  [9.1, 35.4, 51, 100,  "Moderate",   "#ca8a04", "#1c1400"],
  [35.5, 55.4, 101, 150, "Unhealthy for SG", "#ea580c", "#1c0a00"],
  [55.5, 125.4, 151, 200, "Unhealthy", "#dc2626", "#1c0000"],
  [125.5, 225.4, 201, 300, "Very Unhealthy", "#9333ea", "#150020"],
  [225.5, 500, 301, 500, "Hazardous",  "#991b1b", "#1c0000"],
];

function pmToAqi(pm) {
  if (!pm || isNaN(pm)) return 0;
  for (const [cLo, cHi, iLo, iHi] of AQI_BREAKS) {
    if (pm >= cLo && pm <= cHi)
      return Math.round(((iHi - iLo) / (cHi - cLo)) * (pm - cLo) + iLo);
  }
  return 500;
}

function aqiMeta(aqi) {
  for (const [,, iLo, iHi, label, color, bg] of AQI_BREAKS) {
    if (aqi >= iLo && aqi <= iHi) return { label, color, bg };
  }
  return { label: "Hazardous", color: "#991b1b", bg: "#1c0000" };
}

function trustLabel(t) {
  if (t >= 80) return { text: "HIGH",   color: "#16a34a" };
  if (t >= 55) return { text: "MED",    color: "#ca8a04" };
  return            { text: "LOW",    color: "#dc2626" };
}

function relTime(ts) {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60)  return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  return `${(diff / 3600).toFixed(1)}h ago`;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:       "#09090f",
  surface:  "#111118",
  elevated: "#18181f",
  border:   "#22222e",
  border2:  "#2c2c3a",
  text:     "#dde0ec",
  sub:      "#7878a0",
  muted:    "#44445a",
  accent:   "#4f8ef7",
};

const T = {
  heading: "Outfit, sans-serif",
  mono:    "'DM Mono', monospace",
};

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color = "#4f8ef7", height = 36, width = "100%" }) {
  if (!data || data.length < 2) return null;
  const vals = data.map((d) => (typeof d === "number" ? d : d.pm_cf1 ?? 0));
  const min  = Math.min(...vals);
  const max  = Math.max(...vals) || 1;
  const W    = 120, H = 36;
  const pts  = vals
    .map((v, i) => `${(i / (vals.length - 1)) * W},${H - ((v - min) / (max - min || 1)) * (H - 4) - 2}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width, height, display: "block" }} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// ─── AQI Gauge ────────────────────────────────────────────────────────────────
function AQIGauge({ aqi, size = 140 }) {
  const meta  = aqiMeta(aqi);
  const pct   = Math.min(aqi / 300, 1);
  const r     = 52, cx = 70, cy = 78;
  const startA = Math.PI, sweepA = Math.PI * pct;
  const x1 = cx + r * Math.cos(startA), y1 = cy + r * Math.sin(startA);
  const x2 = cx + r * Math.cos(startA + sweepA), y2 = cy + r * Math.sin(startA + sweepA);
  const large = sweepA > Math.PI ? 1 : 0;
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 140 100">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke={C.border2} strokeWidth="10" strokeLinecap="round" />
      {aqi > 0 && (
        <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
          fill="none" stroke={meta.color} strokeWidth="10" strokeLinecap="round" />
      )}
      <text x={cx} y={cy - 6} textAnchor="middle" fontFamily={T.mono} fontWeight="700"
        fontSize="26" fill={meta.color}>{aqi}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontFamily={T.heading} fontWeight="600"
        fontSize="9" fill={C.sub} letterSpacing="0.08em">{meta.label.toUpperCase()}</text>
    </svg>
  );
}

// ─── Time series chart ────────────────────────────────────────────────────────
function TimeChart({ data, color = "#4f8ef7", showAB = false, height = 180 }) {
  if (!data || data.length < 2) return (
    <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center",
      color: C.muted, fontFamily: T.heading, fontSize: 13 }}>No data</div>
  );
  const W = 600, H = height;
  const PAD = { t: 12, r: 16, b: 32, l: 44 };
  const IW = W - PAD.l - PAD.r, IH = H - PAD.t - PAD.b;

  const pms = data.map((d) => d.pm_cf1 ?? 0);
  const yMin = 0, yMax = Math.max(Math.ceil(Math.max(...pms) * 1.15), 10);
  const xMin = data[0].t_ms ?? new Date(data[0].captured_at).getTime();
  const xMax = data[data.length - 1].t_ms ?? new Date(data[data.length - 1].captured_at).getTime();
  const xRange = xMax - xMin || 1;

  const toX = (t)  => PAD.l + ((t - xMin) / xRange) * IW;
  const toY = (pm) => PAD.t + IH - ((pm - yMin) / (yMax - yMin)) * IH;

  const mainPts = data.map((d) => `${toX(d.t_ms ?? new Date(d.captured_at).getTime())},${toY(d.pm_cf1 ?? 0)}`).join(" ");
  const aPts    = showAB ? data.filter(d => d.pm_a != null).map((d) => `${toX(d.t_ms ?? new Date(d.captured_at).getTime())},${toY(d.pm_a)}`).join(" ") : "";
  const bPts    = showAB ? data.filter(d => d.pm_b != null).map((d) => `${toX(d.t_ms ?? new Date(d.captured_at).getTime())},${toY(d.pm_b)}`).join(" ") : "";

  const yTicks = [0, Math.round(yMax * 0.33), Math.round(yMax * 0.67), yMax];
  const EPA_LINES = [{ pm: 9.0, label: "Good", color: "#16a34a" }, { pm: 35.4, label: "Moderate", color: "#ca8a04" }, { pm: 55.4, label: "USG", color: "#ea580c" }];

  const nXLabels = 5;
  const xLabels = Array.from({ length: nXLabels }, (_, i) => {
    const t = xMin + (i / (nXLabels - 1)) * xRange;
    return { t, label: new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={PAD.l} y1={toY(v)} x2={W - PAD.r} y2={toY(v)} stroke={C.border} strokeWidth="0.5" />
          <text x={PAD.l - 6} y={toY(v) + 4} textAnchor="end" fontFamily={T.mono}
            fontSize="8" fill={C.muted}>{v}</text>
        </g>
      ))}
      {EPA_LINES.map(({ pm, label, color }) => pm <= yMax && (
        <line key={label} x1={PAD.l} y1={toY(pm)} x2={W - PAD.r} y2={toY(pm)}
          stroke={color} strokeWidth="0.6" strokeDasharray="3,3" opacity="0.5" />
      ))}
      {xLabels.map(({ t, label }) => (
        <text key={t} x={toX(t)} y={H - 4} textAnchor="middle" fontFamily={T.mono}
          fontSize="8" fill={C.muted}>{label}</text>
      ))}
      {showAB && aPts && <polyline points={aPts} fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />}
      {showAB && bPts && <polyline points={bPts} fill="none" stroke="#f472b6" strokeWidth="1" opacity="0.6" />}
      <polyline points={mainPts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Forecast chart ──────────────────────────────────────────────────────────
function ForecastChart({ forecast }) {
  if (!forecast?.forecast?.length) return null;
  const W = 400, H = 120;
  const PAD = { t: 8, r: 12, b: 28, l: 36 };
  const IW = W - PAD.l - PAD.r, IH = H - PAD.t - PAD.b;
  const pts = forecast.forecast;
  const yMax = Math.max(...pts.map((p) => p.hi ?? p.mean), 10) * 1.1;
  const toX = (i) => PAD.l + (i / (pts.length - 1 || 1)) * IW;
  const toY = (v) => PAD.t + IH - (Math.max(0, v) / yMax) * IH;
  const mean = pts.map((p, i) => `${toX(i)},${toY(p.mean)}`).join(" ");
  const hi   = pts.map((p, i) => `${toX(i)},${toY(p.hi ?? p.mean)}`).join(" ");
  const lo   = pts.map((p, i) => `${toX(i)},${toY(p.lo ?? p.mean)}`).join(" ");
  const band = [...pts.map((p, i) => `${toX(i)},${toY(p.hi ?? p.mean)}`),
                ...pts.map((p, i) => `${toX(pts.length - 1 - i)},${toY(pts[pts.length - 1 - i].lo ?? pts[pts.length - 1 - i].mean)}`)]
    .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }} preserveAspectRatio="none">
      <polygon points={band} fill="#4f8ef7" opacity="0.1" />
      <polyline points={hi} fill="none" stroke="#4f8ef7" strokeWidth="1" strokeDasharray="3,2" opacity="0.4" />
      <polyline points={lo} fill="none" stroke="#4f8ef7" strokeWidth="1" strokeDasharray="3,2" opacity="0.4" />
      <polyline points={mean} fill="none" stroke="#4f8ef7" strokeWidth="2" strokeLinejoin="round" />
      {pts.filter((_, i) => i % 3 === 0).map((p, i) => (
        <text key={i} x={toX(i * 3)} y={H - 4} textAnchor="middle"
          fontFamily={T.mono} fontSize="7" fill={C.muted}>+{i * 3 * 20}m</text>
      ))}
    </svg>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,             setTab]            = useState("overview");
  const [selectedSensor,  setSelectedSensor] = useState(230019);
  const [timeRange,       setTimeRange]      = useState("6h");
  const [showAB,          setShowAB]         = useState(false);
  const [liveReadings,    setLiveReadings]   = useState({}); // {sensorId: [row, ...]}
  const [liveEvents,      setLiveEvents]     = useState([]);
  const [staticData,      setStaticData]     = useState(null);
  const [isLive,          setIsLive]         = useState(false);
  const [lastUpdated,     setLastUpdated]    = useState(null);
  const [readingCount,    setReadingCount]   = useState(0);
  const channelRef = useRef(null);

  // ── Load static data.json fallback ──
  useEffect(() => {
    fetch("/data.json")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d?.sensors && setStaticData(d))
      .catch(() => {});
  }, []);

  // ── Load live data from Supabase ──
  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON) return;

    let sb;
    import("@supabase/supabase-js").then(({ createClient }) => {
      sb = createClient(SUPABASE_URL, SUPABASE_ANON);

      // Fetch last 120 readings per sensor
      sb.from("readings")
        .select("*")
        .in("sensor_id", SENSOR_IDS)
        .order("captured_at", { ascending: true })
        .limit(120 * SENSOR_IDS.length)
        .then(({ data, error }) => {
          if (error || !data?.length) return;
          const byId = {};
          for (const row of data) {
            if (!byId[row.sensor_id]) byId[row.sensor_id] = [];
            byId[row.sensor_id].push({ ...row, t_ms: new Date(row.captured_at).getTime() });
          }
          setLiveReadings(byId);
          setIsLive(true);
          setReadingCount(data.length);
          setLastUpdated(new Date());
        });

      // Fetch recent events
      sb.from("events")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(50)
        .then(({ data }) => data && setLiveEvents(data));

      // Realtime subscription
      channelRef.current = sb
        .channel("readings-live")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "readings" },
          (payload) => {
            const row = { ...payload.new, t_ms: new Date(payload.new.captured_at).getTime() };
            setLiveReadings((prev) => {
              const sid = row.sensor_id;
              const arr = [...(prev[sid] || []), row].slice(-120);
              return { ...prev, [sid]: arr };
            });
            setLastUpdated(new Date());
            setReadingCount((n) => n + 1);
          }
        )
        .subscribe();
    });

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, []);

  // ── Derive per-sensor summaries ──
  const sensorData = useMemo(() => {
    return ALL_SENSORS.map((sensor) => {
      const sid = sensor.id;

      // Live path
      if (isLive && liveReadings[sid]?.length) {
        const readings = liveReadings[sid];
        const latest   = readings[readings.length - 1];
        const aqi      = latest.aqi ?? pmToAqi(latest.pm_cf1);
        return {
          ...sensor,
          readings,
          latest,
          aqi,
          meta: aqiMeta(aqi),
          trust: latest.trust_score ?? 0,
          hasData: true,
        };
      }

      // Static path
      if (staticData?.sensors?.[sid]) {
        const s = staticData.sensors[sid];
        const readings = (s.data || []).map((d) => ({ ...d, t_ms: d.t }));
        const latest   = s.latest || readings[readings.length - 1] || {};
        const aqi      = s.aqi ?? pmToAqi(latest.pm ?? latest.pm_cf1);
        return {
          ...sensor,
          readings,
          latest: { ...latest, pm_cf1: latest.pm ?? latest.pm_cf1, pm_a: latest.a, pm_b: latest.b,
                    temperature_c: latest.temp, trust_score: latest.trust },
          aqi,
          meta: aqiMeta(aqi),
          trust: latest.trust ?? 0,
          hasData: true,
        };
      }

      return { ...sensor, readings: [], latest: {}, aqi: 0, meta: aqiMeta(0), trust: 0, hasData: false };
    });
  }, [liveReadings, staticData, isLive]);

  const networkAvgPM = useMemo(() => {
    const active = sensorData.filter((s) => s.hasData && s.latest?.pm_cf1 != null);
    if (!active.length) return null;
    return (active.reduce((a, s) => a + (s.latest.pm_cf1 ?? 0), 0) / active.length).toFixed(1);
  }, [sensorData]);

  const maxAQISensor = useMemo(() => {
    return sensorData.reduce((best, s) => (!best || s.aqi > best.aqi) ? s : best, null);
  }, [sensorData]);

  const events = useMemo(() => {
    if (liveEvents.length) return liveEvents;
    return staticData?.events || [];
  }, [liveEvents, staticData]);

  // ── Selected sensor for detail view ──
  const detailSensor = useMemo(() => sensorData.find((s) => s.id === selectedSensor) || sensorData[0], [sensorData, selectedSensor]);

  const filteredReadings = useMemo(() => {
    if (!detailSensor?.readings?.length) return [];
    const ranges = { "1h": 30, "6h": 180, "24h": 720, "7d": 5040 };
    const count  = ranges[timeRange] || 180;
    return detailSensor.readings.slice(-count);
  }, [detailSensor, timeRange]);

  // ── Enough data checks ──
  const totalReadings = readingCount || (staticData ? Object.values(staticData.sensors || {}).reduce((a, s) => a + (s.data?.length || 0), 0) : 0);
  const hasHourData   = isLive ? totalReadings >= 30  : true;
  const hasDayData    = isLive ? totalReadings >= 720 : false;

  // ─── Shared styles ──────────────────────────────────────────────────────────
  const s = {
    card: {
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "20px 24px",
    },
    label: {
      fontFamily: T.heading,
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: C.sub,
    },
    bigNum: (color = C.text) => ({
      fontFamily: T.mono,
      fontSize: 42,
      fontWeight: 700,
      color,
      lineHeight: 1,
    }),
    medNum: (color = C.text) => ({
      fontFamily: T.mono,
      fontSize: 28,
      fontWeight: 700,
      color,
      lineHeight: 1,
    }),
    body: {
      fontFamily: T.heading,
      fontSize: 15,
      color: C.sub,
      lineHeight: 1.7,
    },
  };

  const EVENT_META = {
    smoke_spike:    { icon: "●", color: "#f97316", label: "Smoke Spike"    },
    rain_washout:   { icon: "●", color: "#38bdf8", label: "Rain Washout"   },
    sensor_failure: { icon: "●", color: "#fbbf24", label: "Sensor Failure" },
  };

  // ─── Tabs ────────────────────────────────────────────────────────────────────
  const TABS = ["overview", "detail", "events", "forecast", "map"];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: T.heading }}>
      {/* ── Header ── */}
      <header style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "0 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 60,
        position: "sticky",
        top: 0,
        background: C.bg,
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div>
            <span style={{ fontFamily: T.heading, fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em" }}>
              Air<span style={{ color: C.accent }}>Aware</span>
            </span>
          </div>
          <nav style={{ display: "flex", gap: 4 }}>
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: tab === t ? C.elevated : "transparent",
                border: tab === t ? `1px solid ${C.border2}` : "1px solid transparent",
                color: tab === t ? C.text : C.sub,
                padding: "6px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: T.heading,
                fontWeight: 500,
                fontSize: 13,
                textTransform: "capitalize",
                transition: "all 0.15s",
              }}>
                {t === "map" ? "Map" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isLive ? (
            <span style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#052e16", border: "1px solid #166534",
              borderRadius: 6, padding: "4px 12px",
              fontFamily: T.mono, fontSize: 11, color: "#4ade80",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80",
                animation: "pulse 2s infinite" }} />
              LIVE
            </span>
          ) : (
            <span style={{
              background: C.elevated, border: `1px solid ${C.border2}`,
              borderRadius: 6, padding: "4px 12px",
              fontFamily: T.mono, fontSize: 11, color: C.sub,
            }}>STATIC — Nov 2025</span>
          )}
          {lastUpdated && (
            <span style={{ ...s.label, fontSize: 10 }}>
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 40px 80px" }}>

        {/* ══════════ OVERVIEW ══════════ */}
        {tab === "overview" && (
          <div>
            <div style={{ marginBottom: 40 }}>
              <h1 style={{ fontFamily: T.heading, fontWeight: 800, fontSize: 36,
                letterSpacing: "-0.03em", margin: 0, marginBottom: 8 }}>
                Network Overview
              </h1>
              <p style={{ ...s.body, margin: 0 }}>
                Southwest Chicago suburbs · {ALL_SENSORS.length} sensors ·{" "}
                {isLive ? `${totalReadings.toLocaleString()} readings collected` : "Research dataset — Nov 2025"}
              </p>
            </div>

            {/* Network stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
              {[
                { label: "Network Avg PM2.5",  value: networkAvgPM ? `${networkAvgPM} µg/m³` : "—",
                  sub: networkAvgPM ? `AQI ${pmToAqi(parseFloat(networkAvgPM))}` : "Collecting..." },
                { label: "Highest AQI",
                  value: maxAQISensor?.aqi > 0 ? String(maxAQISensor.aqi) : "—",
                  sub: maxAQISensor?.name || "—",
                  color: maxAQISensor ? aqiMeta(maxAQISensor.aqi).color : C.text },
                { label: "Active Sensors",
                  value: String(sensorData.filter((s) => s.hasData).length),
                  sub: `of ${ALL_SENSORS.length} total` },
                { label: "Events (24h)",
                  value: String(events.filter((e) => {
                    const t = new Date(e.started_at || e.time).getTime();
                    return Date.now() - t < 86400e3;
                  }).length),
                  sub: isLive ? "Live detection" : "Research dataset" },
              ].map(({ label, value, sub, color }) => (
                <div key={label} style={{ ...s.card }}>
                  <div style={s.label}>{label}</div>
                  <div style={{ ...s.bigNum(color || C.text), marginTop: 10, marginBottom: 4 }}>{value}</div>
                  <div style={{ fontFamily: T.heading, fontSize: 13, color: C.sub }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Sensor grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {sensorData.map((sensor) => {
                const tl = trustLabel(sensor.trust);
                const sparkData = sensor.readings.slice(-60);
                return (
                  <div key={sensor.id}
                    onClick={() => { setSelectedSensor(sensor.id); setTab("detail"); }}
                    style={{
                      ...s.card,
                      cursor: "pointer",
                      borderTop: `3px solid ${sensor.hasData ? sensor.meta.color : C.border}`,
                      paddingTop: 18,
                      transition: "border-color 0.2s, background 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = C.elevated}
                    onMouseLeave={(e) => e.currentTarget.style.background = C.surface}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontFamily: T.heading, fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 2 }}>
                          {sensor.name}
                        </div>
                        <div style={{ fontFamily: T.heading, fontSize: 12, color: C.sub }}>
                          {sensor.location}
                          {sensor.isKoz && <span style={{ color: C.accent, marginLeft: 6, fontSize: 10 }}>●</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ ...s.bigNum(sensor.hasData ? sensor.meta.color : C.muted), fontSize: 36 }}>
                          {sensor.hasData ? sensor.aqi : "—"}
                        </div>
                        <div style={{ fontFamily: T.heading, fontSize: 11, color: sensor.hasData ? sensor.meta.color : C.muted }}>
                          {sensor.hasData ? sensor.meta.label : "No data"}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <span style={{ fontFamily: T.mono, fontWeight: 500, fontSize: 20, color: C.text }}>
                        {sensor.hasData ? `${(sensor.latest?.pm_cf1 ?? 0).toFixed(1)}` : "—"}
                      </span>
                      <span style={{ fontFamily: T.heading, fontSize: 12, color: C.sub, marginLeft: 4 }}>µg/m³</span>
                    </div>

                    {sparkData.length > 2 && (
                      <div style={{ marginBottom: 10 }}>
                        <Sparkline data={sparkData} color={sensor.meta.color} height={32} />
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: T.mono, fontSize: 11, color: tl.color }}>
                        {tl.text} {sensor.hasData ? `${Math.round(sensor.trust)}%` : ""}
                      </span>
                      {sensor.lowCoverage && (
                        <span style={{ fontFamily: T.heading, fontSize: 10, color: "#fbbf24" }}>⚠ low coverage</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent events */}
            {events.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h2 style={{ fontFamily: T.heading, fontWeight: 700, fontSize: 20,
                  letterSpacing: "-0.02em", marginBottom: 16 }}>Recent Events</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {events.slice(0, 4).map((ev, i) => {
                    const m = EVENT_META[ev.event_type] || EVENT_META.smoke_spike;
                    const ts = ev.started_at || ev.time;
                    return (
                      <div key={ev.id || i} style={{
                        ...s.card,
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "14px 20px",
                        borderLeft: `3px solid ${m.color}`,
                      }}>
                        <span style={{ color: m.color, fontSize: 18 }}>{m.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: T.heading, fontWeight: 600, fontSize: 14, color: m.color }}>{m.label}</div>
                          <div style={{ fontFamily: T.heading, fontSize: 13, color: C.sub, marginTop: 2 }}>
                            {ev.description || ev.desc} · Sensor {ev.sensor_id ?? ev.sensor}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: T.heading, fontSize: 12,
                            background: ev.severity === "high" ? "#450a0a" : ev.severity === "medium" ? "#1c1000" : C.elevated,
                            color: ev.severity === "high" ? "#f87171" : ev.severity === "medium" ? "#fbbf24" : C.sub,
                            padding: "2px 10px", borderRadius: 4, marginBottom: 4 }}>
                            {(ev.severity || "low").toUpperCase()}
                          </div>
                          <div style={s.label}>{relTime(ts)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════ DETAIL ══════════ */}
        {tab === "detail" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: T.heading, fontWeight: 800, fontSize: 36,
                letterSpacing: "-0.03em", margin: 0, marginBottom: 16 }}>Sensor Detail</h1>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ALL_SENSORS.map((s) => (
                  <button key={s.id} onClick={() => setSelectedSensor(s.id)} style={{
                    background: selectedSensor === s.id ? C.accent : C.surface,
                    color: selectedSensor === s.id ? "#fff" : C.sub,
                    border: `1px solid ${selectedSensor === s.id ? C.accent : C.border}`,
                    padding: "6px 14px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontFamily: T.heading,
                    fontWeight: 500,
                    fontSize: 13,
                    transition: "all 0.15s",
                  }}>
                    {s.name}
                    {s.lowCoverage && <span style={{ marginLeft: 4, color: "#fbbf24" }}>⚠</span>}
                  </button>
                ))}
              </div>
            </div>

            {detailSensor && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
                  {/* AQI panel */}
                  <div style={{ ...s.card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <AQIGauge aqi={detailSensor.aqi} size={150} />
                    <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 32,
                      color: detailSensor.meta.color, marginTop: 4 }}>
                      {(detailSensor.latest?.pm_cf1 ?? 0).toFixed(1)}
                      <span style={{ fontFamily: T.heading, fontSize: 14, fontWeight: 400,
                        color: C.sub, marginLeft: 4 }}>µg/m³</span>
                    </div>
                    <div style={{ ...s.label, marginTop: 6 }}>Current PM2.5</div>
                  </div>

                  {/* Reliability */}
                  <div style={s.card}>
                    <div style={s.label}>Sensor Reliability</div>
                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                      {[
                        { label: "Trust Score",  value: `${Math.round(detailSensor.trust)}%`, color: trustLabel(detailSensor.trust).color },
                        { label: "Channel A",    value: `${(detailSensor.latest?.pm_a ?? detailSensor.latest?.pm_cf1 ?? 0).toFixed(2)} µg/m³` },
                        { label: "Channel B",    value: `${(detailSensor.latest?.pm_b ?? detailSensor.latest?.pm_cf1 ?? 0).toFixed(2)} µg/m³` },
                        { label: "A/B Delta",    value: `${Math.abs((detailSensor.latest?.pm_a ?? 0) - (detailSensor.latest?.pm_b ?? 0)).toFixed(2)} µg/m³` },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={s.label}>{label}</span>
                          <span style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 18, color: color || C.text }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Meteorology */}
                  <div style={s.card}>
                    <div style={s.label}>Meteorology</div>
                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                      {[
                        { label: "Temperature", value: detailSensor.latest?.temperature_c != null
                          ? `${detailSensor.latest.temperature_c.toFixed(1)} °C` : "—" },
                        { label: "Humidity",    value: detailSensor.latest?.humidity != null
                          ? `${Math.round(detailSensor.latest.humidity)}%` : "—" },
                        { label: "Location",    value: detailSensor.location },
                        { label: "Sensor ID",   value: String(detailSensor.id) },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={s.label}>{label}</span>
                          <span style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 15, color: C.text }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Time series */}
                <div style={s.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={s.label}>PM2.5 Time Series</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["1h", "6h", "24h", "7d"].map((r) => (
                        <button key={r} onClick={() => setTimeRange(r)} style={{
                          background: timeRange === r ? C.accent : C.elevated,
                          color: timeRange === r ? "#fff" : C.sub,
                          border: `1px solid ${timeRange === r ? C.accent : C.border}`,
                          padding: "4px 12px", borderRadius: 6, cursor: "pointer",
                          fontFamily: T.mono, fontSize: 12,
                        }}>{r}</button>
                      ))}
                      <button onClick={() => setShowAB((v) => !v)} style={{
                        background: showAB ? "#1e3a2e" : C.elevated,
                        color: showAB ? "#4ade80" : C.sub,
                        border: `1px solid ${showAB ? "#166534" : C.border}`,
                        padding: "4px 12px", borderRadius: 6, cursor: "pointer",
                        fontFamily: T.mono, fontSize: 12,
                      }}>A/B</button>
                    </div>
                  </div>
                  <TimeChart data={filteredReadings} showAB={showAB} height={200} />
                </div>

                {/* Live stats if enough data */}
                {isLive && !hasHourData && (
                  <div style={{ ...s.card, marginTop: 16, textAlign: "center", padding: 32 }}>
                    <div style={{ fontFamily: T.heading, fontSize: 22, fontWeight: 700, color: C.sub, marginBottom: 8 }}>
                      Collecting data...
                    </div>
                    <div style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 700, color: C.accent }}>
                      {totalReadings.toLocaleString()}
                    </div>
                    <div style={{ ...s.label, marginTop: 4 }}>readings so far · need ~30 for rolling average</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════ EVENTS ══════════ */}
        {tab === "events" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: T.heading, fontWeight: 800, fontSize: 36,
                letterSpacing: "-0.03em", margin: 0, marginBottom: 8 }}>Detected Events</h1>
              <p style={{ ...s.body, margin: 0 }}>Anomalies flagged by the rule-based detection pipeline.</p>
            </div>

            {/* Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
              {[
                { label: "Smoke Spikes",    count: events.filter((e) => e.event_type === "smoke_spike").length,    color: "#f97316" },
                { label: "Rain Washouts",   count: events.filter((e) => e.event_type === "rain_washout").length,   color: "#38bdf8" },
                { label: "Sensor Failures", count: events.filter((e) => e.event_type === "sensor_failure").length, color: "#fbbf24" },
                { label: "Total Alerts",    count: events.length,                                                   color: C.accent  },
              ].map(({ label, count, color }) => (
                <div key={label} style={s.card}>
                  <div style={s.label}>{label}</div>
                  <div style={{ ...s.bigNum(color), marginTop: 10 }}>{count}</div>
                </div>
              ))}
            </div>

            {events.length === 0 ? (
              <div style={{ ...s.card, textAlign: "center", padding: 48 }}>
                <div style={{ fontFamily: T.heading, fontSize: 18, color: C.sub }}>
                  {isLive ? "No events detected yet — collector is running." : "No events in dataset."}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {events.map((ev, i) => {
                  const m = EVENT_META[ev.event_type] || EVENT_META.smoke_spike;
                  const ts = ev.started_at || ev.time;
                  return (
                    <div key={ev.id || i} style={{
                      ...s.card,
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      borderLeft: `3px solid ${m.color}`,
                    }}>
                      <div style={{ fontFamily: T.heading, fontWeight: 700, fontSize: 15,
                        color: m.color, minWidth: 120 }}>{m.label}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: T.heading, fontSize: 14, color: C.text }}>
                          {ev.description || ev.desc || "—"}
                        </div>
                        <div style={{ fontFamily: T.heading, fontSize: 12, color: C.sub, marginTop: 4 }}>
                          Sensor {ev.sensor_id ?? ev.sensor}
                          {ev.pm_peak != null && ` · Peak ${ev.pm_peak.toFixed(1)} µg/m³`}
                          {ev.confidence != null && ` · ${Math.round(ev.confidence * 100)}% confidence`}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", minWidth: 80 }}>
                        <div style={{ fontFamily: T.heading, fontSize: 11, fontWeight: 600,
                          color: ev.severity === "high" ? "#f87171" : ev.severity === "medium" ? "#fbbf24" : C.sub }}>
                          {(ev.severity || "").toUpperCase()}
                        </div>
                        <div style={{ ...s.label, marginTop: 4 }}>{relTime(ts)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════ FORECAST ══════════ */}
        {tab === "forecast" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: T.heading, fontWeight: 800, fontSize: 36,
                letterSpacing: "-0.03em", margin: 0, marginBottom: 8 }}>6-Hour Forecast</h1>
              <p style={{ ...s.body, margin: 0 }}>
                Random Forest model trained on Nov 2025 data · 80% confidence intervals · MAE 0.51–1.12 µg/m³
              </p>
            </div>

            {isLive && !hasHourData ? (
              <div style={{ ...s.card, textAlign: "center", padding: 64 }}>
                <div style={{ fontFamily: T.heading, fontSize: 22, fontWeight: 700, color: C.sub, marginBottom: 12 }}>
                  Forecasting requires sufficient historical data.
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 36, fontWeight: 700, color: C.accent, marginBottom: 8 }}>
                  {totalReadings.toLocaleString()}
                </div>
                <div style={s.label}>readings collected · need ~30 per sensor to begin</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                {sensorData
                  .filter((s) => !s.lowCoverage && s.hasData)
                  .map((sensor) => {
                    const fc = staticData?.forecasts?.[sensor.id];
                    const tl = trustLabel(sensor.trust);
                    return (
                      <div key={sensor.id} style={s.card}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                          <div>
                            <div style={{ fontFamily: T.heading, fontWeight: 600, fontSize: 15 }}>{sensor.name}</div>
                            <div style={{ fontFamily: T.heading, fontSize: 12, color: C.sub }}>{sensor.location}</div>
                          </div>
                          <span style={{ fontFamily: T.mono, fontSize: 11, color: tl.color,
                            alignSelf: "flex-start" }}>TRUST {tl.text}</span>
                        </div>
                        {fc ? (
                          <>
                            <ForecastChart forecast={fc} />
                            <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
                              <div>
                                <div style={s.label}>Last PM2.5</div>
                                <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 18, color: C.text, marginTop: 2 }}>
                                  {fc.lastPM?.toFixed(1)} µg/m³
                                </div>
                              </div>
                              <div>
                                <div style={s.label}>Next Forecast</div>
                                <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 18, color: C.accent, marginTop: 2 }}>
                                  {fc.nextMean?.toFixed(1)} µg/m³
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div style={{ textAlign: "center", padding: 24, color: C.sub, fontFamily: T.heading, fontSize: 13 }}>
                            {isLive ? "Collecting data for forecast..." : "No forecast available"}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            <div style={{ ...s.card, marginTop: 24, padding: 20, background: C.elevated }}>
              <div style={{ ...s.label, marginBottom: 8 }}>Model Notes</div>
              <p style={{ ...s.body, margin: 0, fontSize: 13 }}>
                Random Forest regressor with 12 lag features + temperature + humidity. Uncertainty estimated via
                tree bootstrap (80% CI). Sensor 290694 excluded due to low data coverage (17.9%).
                {isLive && " Live retraining will be added as data accumulates."}
              </p>
            </div>
          </div>
        )}

        {/* ══════════ MAP ══════════ */}
        {tab === "map" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: T.heading, fontWeight: 800, fontSize: 36,
                letterSpacing: "-0.03em", margin: 0, marginBottom: 8 }}>Regional Map</h1>
              <p style={{ ...s.body, margin: 0 }}>
                Live PurpleAir sensor map · southwest Chicago suburbs · opens in real time.
              </p>
            </div>
            <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
              <iframe
                src="https://map.purpleair.com/1/mAQI/a10/p604800/cC0#10/41.6/-88.1"
                style={{ width: "100%", aspectRatio: "16/9", border: "none", display: "block" }}
                title="PurpleAir Live Map"
              />
            </div>
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <a href="https://map.purpleair.com/1/mAQI/a10/p604800/cC0#10/41.6/-88.1"
                target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: T.heading, fontSize: 13, color: C.accent }}>
                Open full map ↗
              </a>
            </div>
          </div>
        )}

      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        button { outline: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border2}; border-radius: 3px; }
      `}</style>
    </div>
  );
}
