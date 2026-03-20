import { motion } from "framer-motion";
import { C, T, glass, card, sectionHeading, bodyText } from "../tokens.js";

const TEAM = [
  {
    key: "ir",
    name: "Idhant Ranjan",
    role: "Student Researcher",
    accentColor: C.accent,
    contributions: [
      "End-to-end ML pipeline (trust scoring, event detection, RF forecasting)",
      "Full-stack dashboard (React + Vite + Supabase)",
      "Live data collector and deployment infrastructure",
    ],
    initials: "IR",
  },
  {
    key: "am",
    name: "Arun Muthukumar",
    role: "Data Analyst",
    accentColor: "#6d28d9",
    contributions: [
      "Exploratory data analysis and cross-sensor divergence study",
      "Playwright web scraper for PurpleAir fallback collection",
      "Identified November 27 and 29 divergence events",
    ],
    initials: "AM",
  },
  {
    key: "vk",
    name: "Varun Kalidindi",
    role: "Machine Learning Engineer",
    accentColor: "#0f766e",
    contributions: [
      "Initial data loading pipeline from DrKoz/ACS_AQ",
      "Exploratory analysis of sensor coverage and data quality",
      "Documentation and research writeup contributions",
    ],
    initials: "VK",
  },
  {
    key: "jk",
    name: "Dr. Kozminski",
    role: "Faculty Mentor",
    accentColor: "#b45309",
    contributions: [
      "Provided the November 2025 dataset (DrKoz/ACS_AQ)",
      "Research direction and methodology guidance",
      "Sensor network design and deployment",
    ],
    initials: "JK",
  },
  {
    key: "cc",
    name: "Cathy Clarkin",
    role: "Research Advisor",
    accentColor: "#b91c1c",
    contributions: [
      "Research framework and academic guidance",
      "Community connection and outreach coordination",
      "Project scope and priorities",
    ],
    initials: "CC",
  },
];

const MISSION = [
  {
    color: C.accent,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
      </svg>
    ),
    title: "Transparency",
    desc: "Every method is documented. Every caveat is stated. We don't overstate what the models can do.",
  },
  {
    color: "#16a34a",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/>
      </svg>
    ),
    title: "Community",
    desc: "The southwest Chicago suburbs deserve localized air quality data. We built for Romeoville, Joliet, and the surrounding area.",
  },
  {
    color: "#6d28d9",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    ),
    title: "Open source",
    desc: "All code, data processing scripts, and methodology notes are published on GitHub under an open license.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
};

const stagger = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

function Avatar({ person }) {
  return (
    <div style={{
      width: 68, height: 68,
      borderRadius: 14,
      overflow: "hidden",
      border: `1px solid rgba(0,0,0,0.09)`,
      background: "rgba(255,255,255,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <img
        src={`/photos/${person.key}.jpg`}
        alt={person.name}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={(e) => {
          e.target.style.display = "none";
          e.target.parentElement.querySelector(".initials-badge").style.display = "flex";
        }}
      />
      <span className="initials-badge" style={{
        display: "none", width: "100%", height: "100%",
        alignItems: "center", justifyContent: "center",
        fontFamily: T.mono, fontWeight: 700, fontSize: 16,
        color: person.accentColor,
      }}>{person.initials}</span>
    </div>
  );
}

export default function About() {
  return (
    <div style={{ background: "transparent", minHeight: "100vh", color: C.text }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 48px 96px" }}>

        {/* Header */}
        <motion.div {...fadeUp} style={{ marginBottom: 72 }}>
          <h1 style={{
            fontFamily: T.display, fontWeight: 900, fontSize: 44,
            letterSpacing: "-0.04em", marginBottom: 16, color: C.text,
          }}>
            About <span style={{ color: C.accent }}>AirAware</span>
          </h1>
          <p style={{ ...bodyText, fontSize: 17, maxWidth: 640 }}>
            An open-source air quality monitoring platform built by the ACS Research Group
            at Lewis University. We combine live sensor data with reproducible ML methods
            to make air quality science transparent and accessible.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div {...fadeUp} style={{ marginBottom: 72 }}>
          <h2 style={{ ...sectionHeading, fontSize: 28, marginBottom: 24 }}>Mission</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {MISSION.map(({ color, icon, title, desc }, i) => (
              <motion.div key={title} {...stagger}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{
                  ...glass({ padding: "24px 24px 28px" }),
                  position: "relative", overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 3,
                  background: color, borderRadius: "14px 14px 0 0",
                }}/>
                <div style={{ color, marginBottom: 16, marginTop: 4 }}>{icon}</div>
                <div style={{
                  fontFamily: T.display, fontWeight: 700, fontSize: 17,
                  color: C.text, marginBottom: 8,
                }}>{title}</div>
                <div style={{ ...bodyText, fontSize: 14 }}>{desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div {...fadeUp} style={{ marginBottom: 72 }}>
          <h2 style={{ ...sectionHeading, fontSize: 28, marginBottom: 6 }}>Team</h2>
          <p style={{ ...bodyText, marginBottom: 32 }}>Lewis University &middot; Spring 2026</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TEAM.map((person, i) => (
              <motion.div key={person.key} {...stagger}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                style={{
                  ...glass({ padding: "20px 24px" }),
                  display: "flex", alignItems: "flex-start", gap: 22,
                  position: "relative", overflow: "hidden",
                }}
              >
                {/* Left accent bar */}
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                  background: person.accentColor, borderRadius: "14px 0 0 14px",
                }}/>
                <div style={{ paddingLeft: 8 }}>
                  <Avatar person={person} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                    <span style={{
                      fontFamily: T.display, fontWeight: 700, fontSize: 16, color: C.text,
                    }}>{person.name}</span>
                    <span style={{
                      fontFamily: T.display, fontSize: 11, fontWeight: 600,
                      letterSpacing: "0.06em", textTransform: "uppercase",
                      color: person.accentColor,
                      padding: "2px 7px", borderRadius: 5,
                      background: `${person.accentColor}14`,
                    }}>{person.role}</span>
                  </div>
                  <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                    {person.contributions.map((c) => (
                      <li key={c} style={{
                        fontFamily: T.display, fontSize: 13, color: C.sub,
                        lineHeight: 1.75, marginBottom: 1,
                      }}>{c}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Data sources */}
        <motion.div {...fadeUp} style={{ marginBottom: 72 }}>
          <h2 style={{ ...sectionHeading, fontSize: 28, marginBottom: 24 }}>Data sources</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                name: "Dr. Kozminski / DrKoz",
                desc: "November 2025 dataset — 5 sensors, 85,014 readings.",
                link: "https://github.com/DrKoz/ACS_AQ",
                linkLabel: "github.com/DrKoz/ACS_AQ",
              },
              {
                name: "PurpleAir",
                desc: "Live sensor network and API v1 for real-time PM2.5 readings.",
                link: "https://www2.purpleair.com",
                linkLabel: "purpleair.com",
              },
              {
                name: "EPA AQI Scale",
                desc: "2024 breakpoints for converting PM2.5 to AQI categories.",
                link: "https://www.airnow.gov/aqi/aqi-basics/",
                linkLabel: "airnow.gov",
              },
            ].map(({ name, desc, link, linkLabel }, i) => (
              <motion.div key={name} {...stagger}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                style={{
                  ...glass({ padding: "16px 22px" }),
                  display: "flex", alignItems: "center", gap: 20,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 15, color: C.text }}>{name}</div>
                  <div style={{ fontFamily: T.display, fontSize: 13, color: C.sub, marginTop: 2 }}>{desc}</div>
                </div>
                <a href={link} target="_blank" rel="noopener noreferrer"
                  style={{
                    fontFamily: T.mono, fontSize: 12, color: C.accent,
                    textDecoration: "none", whiteSpace: "nowrap",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = "0.65"}
                  onMouseLeave={(e) => e.target.style.opacity = "1"}
                >
                  {linkLabel} ↗
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Open source CTA */}
        <motion.div {...fadeUp}
          style={{
            ...glass({ padding: "44px 40px" }),
            textAlign: "center",
            position: "relative", overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: C.accent, borderRadius: "14px 14px 0 0",
          }}/>
          <div style={{
            fontFamily: T.display, fontWeight: 800, fontSize: 26,
            letterSpacing: "-0.03em", color: C.text, marginBottom: 12,
          }}>
            Open source
          </div>
          <p style={{ ...bodyText, maxWidth: 480, margin: "0 auto 28px" }}>
            The full codebase — ML pipeline, dashboard, data collector — is publicly available.
            Issues and pull requests welcome.
          </p>
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="https://github.com/IdhantRanjan/airaware"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: C.accent, color: "#fff",
              padding: "12px 26px", borderRadius: 10,
              fontFamily: T.display, fontWeight: 600, fontSize: 15,
              textDecoration: "none",
              boxShadow: "0 2px 12px rgba(30,64,175,0.25)",
              transition: "background 0.15s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            IdhantRanjan/airaware
          </motion.a>
        </motion.div>

      </div>
    </div>
  );
}
