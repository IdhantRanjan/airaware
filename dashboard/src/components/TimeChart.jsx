import { C, T } from "../tokens.js";

const EPA_REFS = [
  { pm: 9.0,  label: "Good",     color: "#22c55e" },
  { pm: 35.4, label: "Moderate", color: "#eab308" },
  { pm: 55.4, label: "USG",      color: "#f97316" },
];

export default function TimeChart({ data = [], color = "#3b82f6", showAB = false, height = 200 }) {
  if (!data || data.length < 2) {
    return (
      <div style={{
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: C.muted,
        fontFamily: T.display,
        fontSize: 14,
      }}>No data available</div>
    );
  }

  const W = 640, H = height;
  const P = { t: 12, r: 20, b: 36, l: 48 };
  const IW = W - P.l - P.r, IH = H - P.t - P.b;

  const pms  = data.map((d) => d.pm_cf1 ?? d.pm ?? 0);
  const yMin = 0;
  const yMax = Math.max(Math.ceil(Math.max(...pms) * 1.2), 15);

  const toMs  = (d) => d.t_ms ?? d.t ?? new Date(d.captured_at || 0).getTime();
  const xMin  = toMs(data[0]);
  const xMax  = toMs(data[data.length - 1]);
  const xSpan = xMax - xMin || 1;

  const toX = (d) => P.l + ((toMs(d) - xMin) / xSpan) * IW;
  const toY = (v)  => P.t + IH - ((Math.max(0, v) - yMin) / (yMax - yMin)) * IH;

  const mainPts = data.map((d) => `${toX(d)},${toY(d.pm_cf1 ?? d.pm ?? 0)}`).join(" ");
  const aPts    = showAB ? data.filter((d) => d.pm_a != null).map((d) => `${toX(d)},${toY(d.pm_a)}`).join(" ") : "";
  const bPts    = showAB ? data.filter((d) => d.pm_b != null && d.b != null ? false : d.pm_b != null).map((d) => `${toX(d)},${toY(d.pm_b)}`).join(" ") : "";

  const yTicks = [0, Math.round(yMax * 0.33), Math.round(yMax * 0.67), yMax];
  const xLabels = Array.from({ length: 5 }, (_, i) => {
    const t = xMin + (i / 4) * xSpan;
    return { x: P.l + (i / 4) * IW, label: new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      {/* Grid + Y labels */}
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={P.l} y1={toY(v)} x2={W - P.r} y2={toY(v)}
            stroke={C.border} strokeWidth="0.5"/>
          <text x={P.l - 8} y={toY(v) + 4}
            textAnchor="end" fontFamily={T.mono} fontSize="9" fill={C.muted}>{v}</text>
        </g>
      ))}
      {/* EPA reference lines */}
      {EPA_REFS.filter((r) => r.pm <= yMax).map(({ pm, label, color }) => (
        <g key={label}>
          <line x1={P.l} y1={toY(pm)} x2={W - P.r} y2={toY(pm)}
            stroke={color} strokeWidth="0.7" strokeDasharray="4,3" opacity="0.45"/>
          <text x={W - P.r + 2} y={toY(pm) + 3}
            fontFamily={T.mono} fontSize="7" fill={color} opacity="0.7">{label}</text>
        </g>
      ))}
      {/* X labels */}
      {xLabels.map(({ x, label }) => (
        <text key={label} x={x} y={H - 6}
          textAnchor="middle" fontFamily={T.mono} fontSize="8" fill={C.muted}>{label}</text>
      ))}
      {/* A/B channels */}
      {showAB && aPts && <polyline points={aPts} fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.55"/>}
      {showAB && bPts && <polyline points={bPts} fill="none" stroke="#f472b6" strokeWidth="1" opacity="0.55"/>}
      {/* Main line */}
      <polyline points={mainPts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
}
