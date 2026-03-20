import { aqiMeta, T, C } from "../tokens.js";

export default function AQIGauge({ aqi = 0, size = 160 }) {
  const meta  = aqiMeta(aqi);
  const pct   = Math.min(aqi / 300, 1);
  const r     = 54, cx = 80, cy = 88;
  const startA = Math.PI;
  const sweepA  = Math.PI * pct;
  const x1 = cx + r * Math.cos(startA), y1 = cy + r * Math.sin(startA);
  const x2 = cx + r * Math.cos(startA + sweepA), y2 = cy + r * Math.sin(startA + sweepA);
  const large = sweepA > Math.PI ? 1 : 0;
  const uid = `gauge-grad-${Math.random().toString(36).slice(2,6)}`;

  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 160 120">
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8"/>
          <stop offset="50%" stopColor="#818cf8"/>
          <stop offset="100%" stopColor={meta.color}/>
        </linearGradient>
      </defs>
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke={C.border2} strokeWidth="10" strokeLinecap="round"
      />
      {/* Fill */}
      {aqi > 0 && (
        <path
          d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
          fill="none" stroke={`url(#${uid})`} strokeWidth="10" strokeLinecap="round"
        />
      )}
      {/* AQI number */}
      <text x={cx} y={cy - 4}
        textAnchor="middle"
        fontFamily={T.mono}
        fontWeight="700"
        fontSize="28"
        fill={meta.color}
      >{aqi || "—"}</text>
      {/* Category */}
      <text x={cx} y={cy + 14}
        textAnchor="middle"
        fontFamily={T.display}
        fontWeight="600"
        fontSize="9"
        fill={C.sub}
        letterSpacing="0.08em"
      >{meta.label.toUpperCase()}</text>
    </svg>
  );
}
