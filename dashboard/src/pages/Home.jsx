import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { C, T, AQI, glass, card, label as labelStyle, sectionHeading, bodyText } from "../tokens.js";

const TEAM = [
  { key: "ir",  name: "Idhant Ranjan",    role: "Student Researcher",       initials: "IR" },
  { key: "am",  name: "Arun Muthukumar",  role: "Data Analyst",             initials: "AM" },
  { key: "vk",  name: "Varun Kalidindi", role: "Machine Learning Engineer", initials: "VK" },
  { key: "jk",  name: "Dr. Kozminski",   role: "Faculty Mentor",            initials: "JK" },
  { key: "cc",  name: "Cathy Clarkin",   role: "Research Advisor",          initials: "CC" },
];

const AQI_GUIDE = [
  { ...AQI.good,         range: "0-50",   pm: "0-9.0"      },
  { ...AQI.moderate,     range: "51-100", pm: "9.1-35.4"   },
  { ...AQI.sensitive,    range: "101-150",pm: "35.5-55.4"  },
  { ...AQI.unhealthy,    range: "151-200",pm: "55.5-125.4" },
  { ...AQI.veryUnhealthy,range: "201-300",pm: "125.5-225.4"},
  { ...AQI.hazardous,    range: "301-500",pm: "225.5-500"  },
];

const KEY_STATS = [
  { value: "85,014", lbl: "Sensor readings collected" },
  { value: "0.51",   lbl: "Best MAE µg/m³ (RF model)" },
  { value: "3",      lbl: "Event types detected"       },
  { value: "97.5%",  lbl: "Network data coverage"      },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
};

function Avatar({ person }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 72, height: 72,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(255,255,255,0.9)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
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
        <span className="initials" style={{
          display: "none", width: "100%", height: "100%",
          alignItems: "center", justifyContent: "center",
          fontFamily: T.mono, fontWeight: 700, fontSize: 17,
          color: C.accent,
        }}>{person.initials}</span>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 14, color: C.text }}>{person.name}</div>
        <div style={{ fontFamily: T.display, fontSize: 12, color: C.sub, marginTop: 2 }}>{person.role}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const nav = useNavigate();

  return (
    <div style={{ color: C.text }}>

      {/* Hero */}
      <section style={{
        padding: "88px 48px 72px",
        maxWidth: 1200,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        gap: 60,
        alignItems: "center",
      }}>
        <motion.div {...fadeUp}>
          {/* Live badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 100,
            padding: "5px 14px 5px 10px",
            marginBottom: 28,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#16a34a",
              boxShadow: "0 0 0 3px rgba(22,163,74,0.15)",
              animation: "pulse 2s infinite",
              flexShrink: 0,
            }}/>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: C.sub, letterSpacing: "0.02em" }}>
              Live Network · SW Chicago Suburbs
            </span>
          </div>

          <h1 style={{
            fontFamily: T.display,
            fontWeight: 900,
            fontSize: "clamp(36px, 4vw, 52px)",
            letterSpacing: "-0.04em",
            lineHeight: 1.08,
            color: C.text,
            margin: "0 0 20px",
          }}>
            Air quality monitoring<br />
            for southwest Chicago.
          </h1>

          <p style={{ ...bodyText, fontSize: 16, maxWidth: 500, marginBottom: 36 }}>
            AirAware tracks PM2.5 in real time across Romeoville, Joliet,
            Lockport, and Bolingbrook. Built by the ACS Research Group at
            Lewis University — live data, documented methods, honest caveats.
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => nav("/live")}
              style={{
                background: C.accent,
                color: "#fff",
                border: "none",
                borderRadius: 9,
                padding: "13px 28px",
                fontFamily: T.display,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 2px 12px rgba(30,64,175,0.25)",
              }}
            >Open Live Monitor &rarr;</motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => nav("/research")}
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(10px)",
                color: C.sub,
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 9,
                padding: "12px 22px",
                fontFamily: T.display,
                fontWeight: 500,
                fontSize: 14,
                cursor: "pointer",
              }}
            >Read the Research</motion.button>
          </div>
        </motion.div>

        {/* Right stats panel */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          {[
            { lbl: "SENSORS ONLINE",  value: "11",          sub: "SW Chicago suburbs"          },
            { lbl: "UPDATE INTERVAL", value: "5 min",       sub: "GitHub Actions cron"         },
            { lbl: "DATA SINCE",      value: "Nov 2025",    sub: "85,014 historical readings"  },
            { lbl: "BEST MODEL MAE",  value: "0.51 µg/m³",  sub: "Lewis University sensor"     },
          ].map(({ lbl, value, sub }, i) => (
            <motion.div key={lbl}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.07 }}
              style={{
                ...glass({ padding: "14px 18px" }),
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.08em", color: C.muted }}>{lbl}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 15, color: C.text }}>{value}</div>
                <div style={{ fontFamily: T.display, fontSize: 11, color: C.muted, marginTop: 1 }}>{sub}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Key stats */}
      <section style={{ padding: "0 48px 72px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {KEY_STATS.map(({ value, lbl }, i) => (
            <motion.div key={lbl}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              style={glass()}
            >
              <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 36,
                color: C.accent, lineHeight: 1, marginBottom: 6 }}>{value}</div>
              <div style={{ fontFamily: T.display, fontSize: 13, color: C.sub }}>{lbl}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What we built */}
      <section style={{ padding: "0 48px 72px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div {...fadeUp}>
          <h2 style={{ ...sectionHeading, marginBottom: 6 }}>What we built</h2>
          <p style={{ ...bodyText, marginBottom: 36, maxWidth: 520 }}>
            Two complementary tools — a live regional network and a completed research study.
          </p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Live card */}
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.45 }}
            style={{ ...glass(), borderTop: `3px solid ${C.accent}`, paddingTop: 22 }}
          >
            <span style={{
              fontFamily: T.mono, fontSize: 11, fontWeight: 600,
              color: C.accent, background: C.accentLight,
              border: `1px solid ${C.accentBorder}`,
              borderRadius: 5, padding: "3px 10px", letterSpacing: "0.04em",
            }}>LIVE</span>
            <h3 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 21,
              letterSpacing: "-0.02em", margin: "14px 0 10px", color: C.text }}>
              Live Network Monitor
            </h3>
            <p style={{ ...bodyText, fontSize: 14, marginBottom: 20 }}>
              Real-time PM2.5 from 11 PurpleAir sensors across Romeoville, Joliet,
              Lockport, and Bolingbrook. Updates every 2 minutes via Python collector into Supabase.
            </p>
            <ul style={{ ...bodyText, fontSize: 13, paddingLeft: 18, margin: "0 0 22px" }}>
              <li style={{ marginBottom: 5 }}>Dual-channel trust scoring per reading</li>
              <li style={{ marginBottom: 5 }}>Automated anomaly detection</li>
              <li style={{ marginBottom: 5 }}>Supabase Realtime — no page refresh needed</li>
              <li>Statistics grow richer as data accumulates</li>
            </ul>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => nav("/live")} style={{
              background: C.accent, color: "#fff", border: "none",
              borderRadius: 8, padding: "10px 20px", cursor: "pointer",
              fontFamily: T.display, fontWeight: 600, fontSize: 13,
              boxShadow: "0 2px 10px rgba(30,64,175,0.2)",
            }}>Open Live Monitor &rarr;</motion.button>
          </motion.div>

          {/* Research card */}
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.08 }}
            style={{ ...glass(), borderTop: `3px solid #6d28d9`, paddingTop: 22 }}
          >
            <span style={{
              fontFamily: T.mono, fontSize: 11, fontWeight: 600,
              color: "#6d28d9", background: "rgba(109,40,217,0.07)",
              border: "1px solid rgba(109,40,217,0.2)",
              borderRadius: 5, padding: "3px 10px", letterSpacing: "0.04em",
            }}>RESEARCH</span>
            <h3 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 21,
              letterSpacing: "-0.02em", margin: "14px 0 10px", color: C.text }}>
              November 2025 Study
            </h3>
            <p style={{ ...bodyText, fontSize: 14, marginBottom: 20 }}>
              Dr. Kozminski's dataset: 85,014 readings from 5 sensors, November 2025.
              Trust scoring, event detection, and Random Forest forecasting — all methods fully documented.
            </p>
            <ul style={{ ...bodyText, fontSize: 13, paddingLeft: 18, margin: "0 0 22px" }}>
              <li style={{ marginBottom: 5 }}>MAE 0.51-1.12 µg/m³ across 4 sensors</li>
              <li style={{ marginBottom: 5 }}>R² 0.77-0.98 on 20% held-out test set</li>
              <li style={{ marginBottom: 5 }}>SARIMA baseline comparison</li>
              <li>Cross-sensor divergence analysis</li>
            </ul>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => nav("/research")} style={{
              background: "rgba(109,40,217,0.08)", color: "#6d28d9",
              border: "1px solid rgba(109,40,217,0.2)",
              borderRadius: 8, padding: "10px 20px", cursor: "pointer",
              fontFamily: T.display, fontWeight: 600, fontSize: 13,
            }}>View Research &rarr;</motion.button>
          </motion.div>
        </div>
      </section>

      {/* PM2.5 Guide */}
      <section style={{ padding: "0 48px 72px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div {...fadeUp}>
          <h2 style={{ ...sectionHeading, marginBottom: 6 }}>Understanding PM2.5</h2>
          <p style={{ ...bodyText, marginBottom: 36, maxWidth: 520 }}>
            Fine particulate matter 2.5 micrometers or smaller. The EPA AQI translates
            PM2.5 concentrations into six health categories.
          </p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {AQI_GUIDE.map(({ color, label: lbl, range, pm }, i) => (
            <motion.div key={lbl}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.35 }}
              style={{
                ...glass({ padding: "16px 20px" }),
                borderLeft: `3px solid ${color}`,
                borderRadius: "0 10px 10px 0",
              }}
            >
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 14, color, marginBottom: 3 }}>{lbl}</div>
              <div style={{ fontFamily: T.mono, fontSize: 12, color: C.sub }}>AQI {range}</div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: C.muted, marginTop: 2 }}>PM2.5 {pm} µg/m³</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: "0 48px 88px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div {...fadeUp}>
          <h2 style={{ ...sectionHeading, marginBottom: 6 }}>Research team</h2>
          <p style={{ ...bodyText, marginBottom: 44, maxWidth: 440 }}>
            ACS Research Group, Lewis University · Spring 2026
          </p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 28 }}>
          {TEAM.map((p, i) => (
            <motion.div key={p.key}
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.4 }}
            >
              <Avatar person={p} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(0,0,0,0.07)",
        background: "rgba(255,255,255,0.5)",
        padding: "28px 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10,
      }}>
        <div style={{ fontFamily: T.display, fontSize: 12, color: C.muted }}>
          &copy; 2026 AirAware Research Group · Lewis University, Romeoville, IL
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[["GitHub","https://github.com/IdhantRanjan/airaware"],["PurpleAir","https://www2.purpleair.com"],["Lewis University","https://lewisu.edu"]].map(([name,href]) => (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: T.display, fontSize: 12, color: C.muted, textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={(e) => e.target.style.color = C.sub}
              onMouseLeave={(e) => e.target.style.color = C.muted}
            >{name}</a>
          ))}
        </div>
      </footer>

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }`}</style>
    </div>
  );
}
