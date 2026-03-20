import { useNavigate } from "react-router-dom";
import { C, T, AQI, card, label, sectionHeading, bodyText } from "../tokens.js";

const TEAM = [
  { key: "ir",  name: "Idhant Ranjan",    role: "Student Researcher",       initials: "IR" },
  { key: "am",  name: "Arun Muthukumar",  role: "Data Analyst",             initials: "AM" },
  { key: "vk",  name: "Varun Kalidindi", role: "Machine Learning Engineer", initials: "VK" },
  { key: "jk",  name: "Dr. Kozminski",   role: "Faculty Mentor",            initials: "JK" },
  { key: "cc",  name: "Cathy Clarkin",   role: "Research Advisor",          initials: "CC" },
];

const AQI_GUIDE = [
  { ...AQI.good,         range: "0–50",  pm: "0–9.0"    },
  { ...AQI.moderate,     range: "51–100",pm: "9.1–35.4" },
  { ...AQI.sensitive,    range: "101–150",pm:"35.5–55.4" },
  { ...AQI.unhealthy,    range: "151–200",pm:"55.5–125.4"},
  { ...AQI.veryUnhealthy,range: "201–300",pm:"125.5–225.4"},
  { ...AQI.hazardous,    range: "301–500",pm:"225.5–500" },
];

const KEY_STATS = [
  { value: "85,014",    label: "Sensor readings collected" },
  { value: "0.51",      label: "Best MAE µg/m³ (RF model)"  },
  { value: "3",         label: "Event types detected"        },
  { value: "97.5%",     label: "Network data coverage"       },
];

function Avatar({ person }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        overflow: "hidden",
        border: `2px solid ${C.border2}`,
        background: C.elevated,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
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
            display: "none",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: T.mono,
            fontWeight: 700,
            fontSize: 18,
            color: C.accent,
          }}
        >{person.initials}</span>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 15, color: C.text }}>
          {person.name}
        </div>
        <div style={{ fontFamily: T.display, fontSize: 13, color: C.sub, marginTop: 4, lineHeight: 1.5 }}>
          {person.role}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const nav = useNavigate();

  return (
    <div style={{ background: C.bg, color: C.text }}>

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section style={{
        padding: "80px 48px 72px",
        maxWidth: 1100,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        gap: 64,
        alignItems: "center",
      }}>
        <div>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "transparent",
            border: `1px solid ${C.border2}`,
            borderRadius: 4,
            padding: "4px 12px",
            marginBottom: 28,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e",
              animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: T.mono, fontSize: 11, color: C.sub, letterSpacing: "0.05em" }}>
              LIVE NETWORK · SW CHICAGO SUBURBS
            </span>
          </div>

          <h1 style={{
            fontFamily: T.display,
            fontWeight: 800,
            fontSize: "clamp(36px, 4.5vw, 52px)",
            letterSpacing: "-0.03em",
            lineHeight: 1.12,
            margin: "0 0 20px",
            color: C.text,
          }}>
            Air quality monitoring<br />
            for southwest Chicago.
          </h1>

          <p style={{
            ...bodyText,
            fontSize: 16,
            maxWidth: 520,
            marginBottom: 36,
          }}>
            AirAware tracks PM2.5 in real time across Romeoville, Joliet, Lockport,
            and Bolingbrook. Built by the ACS Research Group at Lewis University —
            live data, documented methods, honest caveats.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => nav("/live")}
            style={{
              background: C.accent,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "13px 28px",
              fontFamily: T.display,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "background 0.15s",
              borderRadius: 6,
            }}
            onMouseEnter={(e) => e.target.style.background = "#3668e8"}
            onMouseLeave={(e) => e.target.style.background = C.accent}
          >
            Open Live Monitor →
          </button>
          <button
            onClick={() => nav("/research")}
            style={{
              background: "transparent",
              color: C.sub,
              border: `1px solid ${C.border2}`,
              borderRadius: 6,
              padding: "11px 22px",
              fontFamily: T.display,
              fontWeight: 500,
              fontSize: 14,
              cursor: "pointer",
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => { e.target.style.color = C.text; e.target.style.borderColor = C.border2; }}
            onMouseLeave={(e) => { e.target.style.color = C.sub; }}
          >
            Read the Research
          </button>
          </div>
        </div>

        {/* Hero right side — live mini-stats */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          {[
            { label: "SENSORS ONLINE",  value: "11",        sub: "SW Chicago suburbs" },
            { label: "UPDATE INTERVAL", value: "5 min",     sub: "GitHub Actions cron" },
            { label: "DATA SINCE",      value: "Nov 2025",  sub: "85,014 historical readings" },
            { label: "BEST MODEL MAE",  value: "0.51 µg/m³",sub: "Lewis University sensor" },
          ].map(({ label: lbl, value, sub }) => (
            <div key={lbl} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 18px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
            }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.08em", color: C.muted }}>{lbl}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 16, color: C.text }}>{value}</div>
                <div style={{ fontFamily: T.display, fontSize: 11, color: C.muted, marginTop: 1 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Key stats ────────────────────────────────────────── */}
      <section style={{ padding: "0 48px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {KEY_STATS.map(({ value, label: lbl }) => (
            <div key={lbl} style={card()}>
              <div style={{
                fontFamily: T.mono,
                fontWeight: 700,
                fontSize: 38,
                color: C.accent,
                lineHeight: 1,
                marginBottom: 8,
              }}>{value}</div>
              <div style={{ fontFamily: T.display, fontSize: 14, color: C.sub }}>{lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── What we built ────────────────────────────────────── */}
      <section style={{ padding: "0 48px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ ...sectionHeading, marginBottom: 8 }}>What we built</h2>
        <p style={{ ...bodyText, marginBottom: 40, maxWidth: 560 }}>
          Two complementary tools — a live regional network and a completed
          research study.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Live card */}
          <div style={{
            ...card(),
            borderTop: `3px solid ${C.accent}`,
            paddingTop: 26,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: C.accent,
                background: "#0f1f3d", border: `1px solid ${C.accent}30`,
                borderRadius: 5, padding: "3px 10px" }}>LIVE</span>
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
              <li>Dual-channel trust scoring per reading</li>
              <li>Automated anomaly detection</li>
              <li>Supabase Realtime — no page refresh needed</li>
              <li>Statistics grow richer as data accumulates</li>
            </ul>
            <button onClick={() => nav("/live")} style={{
              background: C.accent, color: "#fff", border: "none",
              borderRadius: 8, padding: "10px 20px", cursor: "pointer",
              fontFamily: T.display, fontWeight: 600, fontSize: 14,
            }}>Open Live Monitor →</button>
          </div>

          {/* Research card */}
          <div style={{
            ...card(),
            borderTop: `3px solid #6366f1`,
            paddingTop: 26,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: "#6366f1",
                background: "#1e1b4b", border: `1px solid #6366f130`,
                borderRadius: 5, padding: "3px 10px" }}>RESEARCH</span>
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
              <li>MAE 0.51–1.12 µg/m³ across 4 sensors</li>
              <li>R² 0.77–0.98 on 20% held-out test set</li>
              <li>SARIMA baseline comparison</li>
              <li>Cross-sensor divergence analysis</li>
            </ul>
            <button onClick={() => nav("/research")} style={{
              background: "#1e1b4b", color: "#818cf8", border: "1px solid #6366f140",
              borderRadius: 8, padding: "10px 20px", cursor: "pointer",
              fontFamily: T.display, fontWeight: 600, fontSize: 14,
            }}>View Research →</button>
          </div>
        </div>
      </section>

      {/* ─── What is PM2.5 ────────────────────────────────────── */}
      <section style={{ padding: "0 48px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ ...sectionHeading, marginBottom: 8 }}>Understanding PM2.5</h2>
        <p style={{ ...bodyText, marginBottom: 40, maxWidth: 560 }}>
          Fine particulate matter — particles 2.5 micrometers or smaller — can
          penetrate deep into the lungs. The EPA Air Quality Index (AQI) translates
          PM2.5 concentrations into six health categories.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {AQI_GUIDE.map(({ color, bg, label: lbl, range, pm }) => (
            <div key={lbl} style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderLeft: `4px solid ${color}`,
              borderRadius: "0 10px 10px 0",
              padding: "16px 20px",
            }}>
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 15,
                color, marginBottom: 4 }}>{lbl}</div>
              <div style={{ fontFamily: T.mono, fontSize: 13, color: C.sub }}>AQI {range}</div>
              <div style={{ fontFamily: T.mono, fontSize: 12, color: C.muted, marginTop: 2 }}>
                PM2.5 {pm} µg/m³
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Team ─────────────────────────────────────────────── */}
      <section style={{
        padding: "0 48px 100px",
        maxWidth: 1200,
        margin: "0 auto",
      }}>
        <h2 style={{ ...sectionHeading, marginBottom: 8 }}>Research team</h2>
        <p style={{ ...bodyText, marginBottom: 48, maxWidth: 480 }}>
          ACS Research Group, Lewis University · Spring 2026
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 32,
        }}>
          {TEAM.map((p) => <Avatar key={p.key} person={p} />)}
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────── */}
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
          © 2026 AirAware Research Group · Lewis University, Romeoville, IL
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="https://github.com/IdhantRanjan/airaware" target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: T.display, fontSize: 13, color: C.sub, textDecoration: "none" }}>
            GitHub
          </a>
          <a href="https://www2.purpleair.com" target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: T.display, fontSize: 13, color: C.sub, textDecoration: "none" }}>
            PurpleAir
          </a>
          <a href="https://lewisu.edu" target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: T.display, fontSize: 13, color: C.sub, textDecoration: "none" }}>
            Lewis University
          </a>
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
