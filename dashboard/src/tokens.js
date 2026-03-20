// Design tokens — shared across all pages
export const C = {
  bg:       "#09090f",
  surface:  "#13131f",
  elevated: "#1a1a28",
  border:   "#1e1e30",
  border2:  "#2a2a3e",
  text:     "#e2e2ee",
  sub:      "#9090b0",
  muted:    "#5a5a7a",
  accent:   "#3b82f6",
  accentHover: "#2563eb",
};

export const AQI = {
  good:        { color: "#22c55e", bg: "#052e16", label: "Good",              pmMax: 9.0,   aqiMax: 50  },
  moderate:    { color: "#eab308", bg: "#1c1400", label: "Moderate",           pmMax: 35.4,  aqiMax: 100 },
  sensitive:   { color: "#f97316", bg: "#1c0a00", label: "Unhealthy for SG",  pmMax: 55.4,  aqiMax: 150 },
  unhealthy:   { color: "#ef4444", bg: "#1c0000", label: "Unhealthy",          pmMax: 125.4, aqiMax: 200 },
  veryUnhealthy:{ color: "#a855f7", bg: "#150020", label: "Very Unhealthy",    pmMax: 225.4, aqiMax: 300 },
  hazardous:   { color: "#7e0023", bg: "#1c0000", label: "Hazardous",          pmMax: 500,   aqiMax: 500 },
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
  display: "Outfit, sans-serif",
  mono:    "'DM Mono', monospace",
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
  if (t >= 80) return { text: "HIGH", color: "#22c55e" };
  if (t >= 55) return { text: "MED",  color: "#eab308" };
  return              { text: "LOW",  color: "#ef4444" };
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
  borderRadius: 14,
  padding: "28px 32px",
  ...extra,
});

export const label = {
  fontFamily: T.display,
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#6060a0",
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
