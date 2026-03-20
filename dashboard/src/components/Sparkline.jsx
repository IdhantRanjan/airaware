export default function Sparkline({ data, color = "#38bdf8", height = 36 }) {
  if (!data || data.length < 2) return null;
  const vals = data.map((d) => (typeof d === "number" ? d : (d.pm_cf1 ?? d.pm ?? 0)));
  const min  = Math.min(...vals);
  const max  = Math.max(...vals) || 1;
  const W = 140, H = height;
  const pts = vals
    .map((v, i) => {
      const x = (i / (vals.length - 1)) * W;
      const y = H - ((v - min) / (max - min || 1)) * (H - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");
  const uid = `sg-${color.replace("#","")}-${Math.random().toString(36).slice(2,6)}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height, display: "block" }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon
        points={`0,${H} ${pts} ${W},${H}`}
        fill={`url(#${uid})`}
      />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
      {/* Dot at last point */}
      {vals.length > 0 && (() => {
        const lastX = W;
        const lastY = H - ((vals[vals.length-1] - min) / (max - min || 1)) * (H - 6) - 3;
        return <circle cx={lastX} cy={lastY} r="2.5" fill={color} opacity="0.8"/>;
      })()}
    </svg>
  );
}
