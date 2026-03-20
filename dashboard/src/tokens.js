// Design tokens — Light Glassmorphism
export const C = {
  bg:       "#ece9e3",        // warm off-white linen
  bgAlt:    "#e8e4dd",        // slightly deeper for contrast sections
  glass:    "rgba(255,255,255,0.68)",
  glassSolid: "#ffffff",
  border:   "rgba(0,0,0,0.09)",
  borderSolid: "#d4d0c8",
  text:     "#18181b",        // near-black
  sub:      "#52525b",        // zinc-600
  muted:    "#a1a1aa",        // zinc-400
  accent:   "#1e40af",        // deep blue — not electric, not sky
  accentHover: "#1e3a8a",
  accentLight: "rgba(30,64,175,0.08)",
  accentBorder: "rgba(30,64,175,0.2)",
};

export const AQI = {
  good:         { color: "#16a34a", bg: "rgba(22,163,74,0.08)",   label: "Good",             pmMax: 9.0,   aqiMax: 50  },
  moderate:     { color: "#b45309", bg: "rgba(180,83,9,0.08)",    label: "Moderate",          pmMax: 35.4,  aqiMax: 100 },
  sensitive:    { color: "#c2410c", bg: "rgba(194,65,12,0.08)",   label: "Unhealthy for SG", pmMax: 55.4,  aqiMax: 150 },
  unhealthy:    { color: "#b91c1c", bg: "rgba(185,28,28,0.08)",   label: "Unhealthy",         pmMax: 125.4, aqiMax: 200 },
  veryUnhealthy:{ color: "#6d28d9", bg: "rgba(109,40,217,0.08)", label: "Very Unhealthy",    pmMax: 225.4, aqiMax: 300 },
  hazardous:    { color: "#9f1239", bg: "rgba(159,18,57,0.08)",   label: "Hazardous",         pmMax: 500,   aqiMax: 500 },
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
  display: "'Inter', sans-serif",
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
  if (t >= 80) return { text: "HIGH", color: "#16a34a" };
  if (t >= 55) return { text: "MED",  color: "#b45309" };
  return              { text: "LOW",  color: "#b91c1c" };
}

export function relTime(ts) {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60)   return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${(diff / 3600).toFixed(1)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

// True glass card — frosted white panel
export const glass = (extra = {}) => ({
  background: C.glass,
  backdropFilter: "blur(20px) saturate(1.6)",
  WebkitBackdropFilter: "blur(20px) saturate(1.6)",
  border: `1px solid rgba(255,255,255,0.85)`,
  boxShadow: "0 2px 20px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
  borderRadius: 14,
  padding: "24px 28px",
  ...extra,
});

// Solid white card for areas where blur isn't needed
export const card = (extra = {}) => ({
  background: "rgba(255,255,255,0.85)",
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: "24px 28px",
  boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
  ...extra,
});

export const label = {
  fontFamily: T.display,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: C.muted,
};

export const sectionHeading = {
  fontFamily: T.display,
  fontWeight: 800,
  fontSize: 30,
  letterSpacing: "-0.03em",
  color: C.text,
  margin: 0,
};

export const bodyText = {
  fontFamily: T.display,
  fontSize: 15,
  lineHeight: 1.7,
  color: C.sub,
};
