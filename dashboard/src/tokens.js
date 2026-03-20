// Design tokens — Gradient Modern theme
export const C = {
  bg:       "#060611",
  surface:  "#0c0c1d",
  elevated: "#121228",
  border:   "#1a1a35",
  border2:  "#252545",
  text:     "#eaeaf5",
  sub:      "#8888b0",
  muted:    "#555580",
  accent:   "#38bdf8",     // sky-400
  accent2:  "#818cf8",     // indigo-400
  accent3:  "#34d399",     // emerald-400
  warm:     "#fb923c",     // orange-400
  gradientA: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
  gradientB: "linear-gradient(135deg, #818cf8 0%, #c084fc 100%)",
  gradientC: "linear-gradient(135deg, #34d399 0%, #38bdf8 100%)",
  gradientWarm: "linear-gradient(135deg, #fb923c 0%, #f472b6 100%)",
  gradientText: "linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)",
};

export const AQI = {
  good:        { color: "#34d399", bg: "#052e1640", label: "Good",              pmMax: 9.0,   aqiMax: 50  },
  moderate:    { color: "#fbbf24", bg: "#1c140040", label: "Moderate",           pmMax: 35.4,  aqiMax: 100 },
  sensitive:   { color: "#fb923c", bg: "#1c0a0040", label: "Unhealthy for SG",  pmMax: 55.4,  aqiMax: 150 },
  unhealthy:   { color: "#f87171", bg: "#1c000040", label: "Unhealthy",          pmMax: 125.4, aqiMax: 200 },
  veryUnhealthy:{ color: "#c084fc", bg: "#15002040", label: "Very Unhealthy",    pmMax: 225.4, aqiMax: 300 },
  hazardous:   { color: "#fb7185", bg: "#1c000040", label: "Hazardous",          pmMax: 500,   aqiMax: 500 },
};

export const AQI_BREAKS = [
  [0,     9.0,   0,   50,  "good"],
  [9.1,  35.4,  51,  100,  "moderate"],
  [35.5, 55.4, 101,  150,  "sensitive"],
  [55.5, 125.4, 151, 200,  "unhealthy"],
  [125.5,225.4, 201, 300,  "veryUnhealthy"],
  [225.5, 500,  301, 500,  "hazardous"],
];

export const T = {
  display: "'Inter', 'Outfit', sans-serif",
  mono:    "'JetBrains Mono', 'DM Mono', monospace",
};

export const SENSORS_META = {
  230019: { name: "Lewis University",          location: "Romeoville, IL",  isKoz: true  },
  249443: { name: "Joliet Junior College",     location: "Joliet, IL",      isKoz: true  },
  249445: { name: "Sanchez Elementary",        location: "Joliet, IL",      isKoz: true  },
  290694: { name: "White Oak Lockport",        location: "Lockport, IL",    isKoz: true, lowCoverage: true },
  297697: { name: "Joliet Township Hall",      location: "Joliet, IL",      isKoz: true  },
  290986: { name: "White Oak Romeoville",      location: "Romeoville, IL",  isKoz: false },
  288454: { name: "White Oak Crest Hill",      location: "Crest Hill, IL",  isKoz: false },
  249125: { name: "Bolingbrook Library",       location: "Bolingbrook, IL", isKoz: false },
  267810: { name: "Bolingbrook North",         location: "Bolingbrook, IL", isKoz: false },
  287190: { name: "Joliet Kinsey Ave",         location: "Joliet, IL",      isKoz: false },
  288452: { name: "Joliet Southwest",          location: "Joliet, IL",      isKoz: false },
};

export function pmToAqi(pm) {
  if (!pm || isNaN(pm) || pm < 0) return 0;
  for (const [cLo, cHi, iLo, iHi] of AQI_BREAKS) {
    if (pm >= cLo && pm <= cHi)
      return Math.round(((iHi - iLo) / (cHi - cLo)) * (pm - cLo) + iLo);
  }
  return 500;
}

export function aqiMeta(aqi) {
  for (const [, , iLo, iHi, key] of AQI_BREAKS) {
    if (aqi >= iLo && aqi <= iHi) return AQI[key];
  }
  return AQI.hazardous;
}

export function trustLabel(t) {
  if (t >= 80) return { text: "HIGH", color: "#34d399" };
  if (t >= 55) return { text: "MED",  color: "#fbbf24" };
  return              { text: "LOW",  color: "#f87171" };
}

export function relTime(ts) {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60)   return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${(diff / 3600).toFixed(1)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

// Shared card style factory
export const card = (extra = {}) => ({
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: "28px 32px",
  ...extra,
});

export const glassCard = (extra = {}) => ({
  background: `linear-gradient(135deg, ${C.surface}ee 0%, ${C.elevated}cc 100%)`,
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  padding: "28px 32px",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  ...extra,
});

export const label = {
  fontFamily: T.display,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: C.muted,
};

export const sectionHeading = {
  fontFamily: T.display,
  fontWeight: 800,
  fontSize: 32,
  letterSpacing: "-0.03em",
  color: C.text,
  margin: 0,
};

export const bodyText = {
  fontFamily: T.display,
  fontSize: 16,
  lineHeight: 1.75,
  color: C.sub,
};

// Gradient text helper (returns style object)
export const gradientText = (gradient = C.gradientText) => ({
  background: gradient,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
});
