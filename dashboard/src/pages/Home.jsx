import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { C, T, AQI, card, glassCard, label, sectionHeading, bodyText, gradientText } from "../tokens.js";

const TEAM = [
  { key: "ir",  name: "Idhant Ranjan",    role: "Student Researcher",       initials: "IR" },
  { key: "am",  name: "Arun Muthukumar",  role: "Data Analyst",             initials: "AM" },
  { key: "vk",  name: "Varun Kalidindi", role: "Machine Learning Engineer", initials: "VK" },
  { key: "jk",  name: "Dr. Kozminski",   role: "Faculty Mentor",            initials: "JK" },
  { key: "cc",  name: "Cathy Clarkin",   role: "Research Advisor",          initials: "CC" },
];

const AQI_GUIDE = [
  { ...AQI.good,         range: "0-50",  pm: "0-9.0"    },
  { ...AQI.moderate,     range: "51-100",pm: "9.1-35.4" },
  { ...AQI.sensitive,    range: "101-150",pm:"35.5-55.4" },
  { ...AQI.unhealthy,    range: "151-200",pm:"55.5-125.4"},
  { ...AQI.veryUnhealthy,range: "201-300",pm:"125.5-225.4"},
  { ...AQI.hazardous,    range: "301-500",pm:"225.5-500" },
];

const KEY_STATS = [
  { value: "85,014",    lbl: "Sensor readings collected",  gradient: C.gradientA },
  { value: "0.51",      lbl: "Best MAE (RF model)",        gradient: C.gradientC },
  { value: "3",         lbl: "Event types detected",       gradient: C.gradientWarm },
  { value: "97.5%",     lbl: "Network data coverage",      gradient: C.gradientB },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

function Avatar({ person }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{
        width: 80, height: 80, borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${C.border}`,
        background: C.elevated,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        position: "relative",
      }}>
        <img
          src={`/photos/${person.key}.jpg`}
          alt={person.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.parentElement.querySelector(".initials").style.display = "flex";
          }}
        />
        <span
          className="initials"
          style={{
            display: "none", width: "100%", height: "100%",
            alignItems: "center", justifyContent: "center",
            fontFamily: T.mono, fontWeight: 700, fontSize: 18,
            ...gradientText(),
          }}
        >{person.initials}</span>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 15, color: C.text }}>
          {person.name}
        </div>
        <div style={{ fontFamily: T.display, fontSize: 13, color: C.sub, marginTop: 3 }}>
          {person.role}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const nav = useNavigate();

  return (
    <div style={{ background: "transparent", color: C.text }}>

      {/* Hero */}
      <section style={{
        padding: "100px 48px 80px",
        maxWidth: 1200,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 400px",
        gap: 64,
        alignItems: "center",
      }}>
        <motion.div {...fadeUp}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: `${C.surface}80`,
            border: `1px solid ${C.border}`,
            borderRadius: 100,
            padding: "6px 16px 6px 10px",
            marginBottom: 28,
            backdropFilter: "blur(10px)",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#34d399",
              boxShadow: "0 0 12px rgba(52,211,153,0.4)",
              animation: "pulse 2s infinite",
            }} />
            <span style={{ fontFamily: T.mono, fontSize: 12, color: C.sub, letterSpacing: "0.02em" }}>
              Live Network · SW Chicago Suburbs
            </span>
          </div>

          <h1 style={{
            fontFamily: T.display,
            fontWeight: 900,
            fontSize: "clamp(38px, 4.5vw, 56px)",
            letterSpacing: "-0.04em",
            lineHeight: 1.08,
            margin: "0 0 24px",
          }}>
            <span style={{ color: C.text }}>Air quality{" "}</span>
            <span style={{
              ...gradientText(),
              display: "inline",
            }}>monitoring</span>
            <br />
            <span style={{ color: C.text }}>for southwest Chicago.</span>
          </h1>

          <p style={{ ...bodyText, fontSize: 17, maxWidth: 520, marginBottom: 40, lineHeight: 1.7 }}>
            AirAware tracks PM2.5 in real time across Romeoville, Joliet, Lockport,
            and Bolingbrook. Built by the ACS Research Group at Lewis University —
            live data, documented methods, honest caveats.
          </p>

          <div style={{ display: "flex", gap: 12 }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => nav("/live")}
              style={{
                background: C.gradientA,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "14px 30px",
                fontFamily: T.display,
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 4px 24px rgba(56,189,248,0.2)",
              }}
            >
              Open Live Monitor
              <span style={{ marginLeft: 8, opacity: 0.8 }}>&#8594;</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => nav("/research")}
              style={{
                background: `${C.surface}`,
                color: C.sub,
                border: `1px solid ${C.border2}`,
                borderRadius: 10,
                padding: "14px 24px",
                fontFamily: T.display,
                fontWeight: 500,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Read the Research
            </motion.button>
          </div>
        </motion.div>

        {/* Right: Stats panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          {[
            { lbl: "SENSORS ONLINE",  value: "11",        sub: "SW Chicago suburbs" },
            { lbl: "UPDATE INTERVAL", value: "5 min",     sub: "GitHub Actions cron" },
            { lbl: "DATA SINCE",      value: "Nov 2025",  sub: "85,014 historical readings" },
            { lbl: "BEST MODEL MAE",  value: "0.51 ug/m3",sub: "Lewis University sensor" },
          ].map(({ lbl, value, sub }, i) => (
            <motion.div
              key={lbl}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                background: `linear-gradient(135deg, ${C.surface} 0%, ${C.elevated}80 100%)`,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
              }}
            >
              <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.08em", color: C.muted }}>{lbl}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 16, color: C.text }}>{value}</div>
                <div style={{ fontFamily: T.display, fontSize: 11, color: C.muted, marginTop: 1 }}>{sub}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Key stats */}
      <section style={{ padding: "0 48px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {KEY_STATS.map(({ value, lbl, gradient }, i) => (
            <motion.div key={lbl} {...stagger} transition={{ delay: i * 0.1, duration: 0.5 }}
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
              <div style={{
                fontFamily: T.mono,
                fontWeight: 700,
                fontSize: 40,
                ...gradientText(gradient),
                lineHeight: 1,
                marginBottom: 8,
              }}>{value}</div>
              <div style={{ fontFamily: T.display, fontSize: 14, color: C.sub }}>{lbl}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What we built */}
      <section style={{ padding: "0 48px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div {...fadeUp}>
          <h2 style={{ ...sectionHeading, marginBottom: 8 }}>What we built</h2>
          <p style={{ ...bodyText, marginBottom: 40, maxWidth: 560 }}>
            Two complementary tools — a live regional network and a completed research study.
          </p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Live card */}
          <motion.div {...stagger} transition={{ delay: 0.1, duration: 0.5 }}
            style={{
              ...glassCard(),
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 3,
              background: C.gradientA,
            }}/>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, marginTop: 4 }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: C.accent,
                background: `${C.accent}15`, border: `1px solid ${C.accent}25`,
                borderRadius: 6, padding: "4px 12px", fontWeight: 600 }}>LIVE</span>
            </div>
            <h3 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 22,
              letterSpacing: "-0.02em", margin: "0 0 12px", color: C.text }}>
              Live Network Monitor
            </h3>
            <p style={{ ...bodyText, fontSize: 15, marginBottom: 24 }}>
              Real-time PM2.5 readings from 11 PurpleAir sensors across
              Romeoville, Joliet, Lockport, and Bolingbrook. Data updates every
              2 minutes via our Python collector feeding directly into Supabase.
            </p>
            <ul style={{ ...bodyText, fontSize: 14, paddingLeft: 18, margin: "0 0 24px" }}>
              <li style={{ marginBottom: 6 }}>Dual-channel trust scoring per reading</li>
              <li style={{ marginBottom: 6 }}>Automated anomaly detection</li>
              <li style={{ marginBottom: 6 }}>Supabase Realtime — no page refresh needed</li>
              <li>Statistics grow richer as data accumulates</li>
            </ul>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => nav("/live")} style={{
              background: C.gradientA, color: "#fff", border: "none",
              borderRadius: 8, padding: "10px 22px", cursor: "pointer",
              fontFamily: T.display, fontWeight: 600, fontSize: 14,
              boxShadow: "0 2px 16px rgba(56,189,248,0.15)",
            }}>Open Live Monitor &#8594;</motion.button>
          </motion.div>

          {/* Research card */}
          <motion.div {...stagger} transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              ...glassCard(),
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 3,
              background: C.gradientB,
            }}/>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, marginTop: 4 }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: C.accent2,
                background: `${C.accent2}15`, border: `1px solid ${C.accent2}25`,
                borderRadius: 6, padding: "4px 12px", fontWeight: 600 }}>RESEARCH</span>
            </div>
            <h3 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 22,
              letterSpacing: "-0.02em", margin: "0 0 12px", color: C.text }}>
              November 2025 Study
            </h3>
            <p style={{ ...bodyText, fontSize: 15, marginBottom: 24 }}>
              Dr. Kozminski's dataset: 85,014 readings from 5 sensors, November
              2025. We developed and validated trust scoring, event detection,
              and Random Forest forecasting — all methods fully documented.
            </p>
            <ul style={{ ...bodyText, fontSize: 14, paddingLeft: 18, margin: "0 0 24px" }}>
              <li style={{ marginBottom: 6 }}>MAE 0.51-1.12 ug/m3 across 4 sensors</li>
              <li style={{ marginBottom: 6 }}>R2 0.77-0.98 on 20% held-out test set</li>
              <li style={{ marginBottom: 6 }}>SARIMA baseline comparison</li>
              <li>Cross-sensor divergence analysis</li>
            </ul>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => nav("/research")} style={{
              background: `${C.accent2}18`, color: C.accent2,
              border: `1px solid ${C.accent2}30`,
              borderRadius: 8, padding: "10px 22px", cursor: "pointer",
              fontFamily: T.display, fontWeight: 600, fontSize: 14,
            }}>View Research &#8594;</motion.button>
          </motion.div>
        </div>
      </section>

      {/* Understanding PM2.5 */}
      <section style={{ padding: "0 48px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div {...fadeUp}>
          <h2 style={{ ...sectionHeading, marginBottom: 8 }}>Understanding PM2.5</h2>
          <p style={{ ...bodyText, marginBottom: 40, maxWidth: 560 }}>
            Fine particulate matter — particles 2.5 micrometers or smaller — can
            penetrate deep into the lungs. The EPA Air Quality Index (AQI) translates
            PM2.5 concentrations into six health categories.
          </p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {AQI_GUIDE.map(({ color, label: lbl, range, pm }, i) => (
            <motion.div key={lbl} {...stagger} transition={{ delay: i * 0.06, duration: 0.4 }}
              style={{
                background: `linear-gradient(135deg, ${C.surface} 0%, ${color}08 100%)`,
                border: `1px solid ${C.border}`,
                borderLeft: `3px solid ${color}`,
                borderRadius: "0 12px 12px 0",
                padding: "18px 22px",
              }}
            >
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 15,
                color, marginBottom: 4 }}>{lbl}</div>
              <div style={{ fontFamily: T.mono, fontSize: 13, color: C.sub }}>AQI {range}</div>
              <div style={{ fontFamily: T.mono, fontSize: 12, color: C.muted, marginTop: 2 }}>
                PM2.5 {pm} ug/m3
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: "0 48px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div {...fadeUp}>
          <h2 style={{ ...sectionHeading, marginBottom: 8 }}>Research team</h2>
          <p style={{ ...bodyText, marginBottom: 48, maxWidth: 480 }}>
            ACS Research Group, Lewis University &middot; Spring 2026
          </p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 32 }}>
          {TEAM.map((p, i) => (
            <motion.div key={p.key} {...stagger} transition={{ delay: i * 0.08, duration: 0.5 }}>
              <Avatar person={p} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: "32px 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div style={{ fontFamily: T.display, fontSize: 13, color: C.muted }}>
          &copy; 2026 AirAware Research Group &middot; Lewis University, Romeoville, IL
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {[
            ["GitHub", "https://github.com/IdhantRanjan/airaware"],
            ["PurpleAir", "https://www2.purpleair.com"],
            ["Lewis University", "https://lewisu.edu"],
          ].map(([name, href]) => (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: T.display, fontSize: 13, color: C.sub, textDecoration: "none",
                transition: "color 0.2s" }}
              onMouseEnter={(e) => e.target.style.color = C.text}
              onMouseLeave={(e) => e.target.style.color = C.sub}
            >{name}</a>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
