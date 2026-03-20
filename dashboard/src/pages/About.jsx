import { motion } from "framer-motion";
import { C, T, card, glassCard, label as labelStyle, sectionHeading, bodyText, gradientText } from "../tokens.js";

const TEAM = [
  {
    key: "ir",
    name: "Idhant Ranjan",
    role: "Student Researcher",
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
    contributions: [
      "Research framework and academic guidance",
      "Community connection and outreach coordination",
      "Project scope and priorities",
    ],
    initials: "CC",
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

function Avatar({ person, large = false }) {
  const size = large ? 100 : 72;
  return (
    <div style={{
      width: size, height: size,
      borderRadius: 16,
      overflow: "hidden",
      border: `1px solid ${C.border}`,
      background: `linear-gradient(135deg, ${C.surface} 0%, ${C.elevated} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
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
      <span className="initials" style={{
        display: "none", width: "100%", height: "100%",
        alignItems: "center", justifyContent: "center",
        fontFamily: T.mono, fontWeight: 700,
        fontSize: large ? 24 : 17,
        ...gradientText(),
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
            letterSpacing: "-0.04em", marginBottom: 16,
          }}>
            <span style={{ color: C.text }}>About </span>
            <span style={gradientText()}>AirAware</span>
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
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gA)" strokeWidth="1.5">
                    <defs><linearGradient id="gA" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#38bdf8"/><stop offset="1" stopColor="#818cf8"/></linearGradient></defs>
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                ),
                title: "Transparency",
                desc: "Every method is documented. Every caveat is stated. We don't overstate what the models can do.",
                gradient: C.gradientA,
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gB)" strokeWidth="1.5">
                    <defs><linearGradient id="gB" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#34d399"/><stop offset="1" stopColor="#38bdf8"/></linearGradient></defs>
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/>
                  </svg>
                ),
                title: "Community",
                desc: "The southwest Chicago suburbs deserve localized air quality data. We built for Romeoville, Joliet, and the surrounding area.",
                gradient: C.gradientC,
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gC)" strokeWidth="1.5">
                    <defs><linearGradient id="gC" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#818cf8"/><stop offset="1" stopColor="#c084fc"/></linearGradient></defs>
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                ),
                title: "Open source",
                desc: "All code, data processing scripts, and methodology notes are published on GitHub under an open license.",
                gradient: C.gradientB,
              },
            ].map(({ icon, title, desc, gradient }, i) => (
              <motion.div key={title} {...stagger} transition={{ delay: i * 0.1, duration: 0.5 }}
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
                <div style={{ marginBottom: 16, marginTop: 4 }}>{icon}</div>
                <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{title}</div>
                <div style={{ ...bodyText, fontSize: 14 }}>{desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div {...fadeUp} style={{ marginBottom: 72 }}>
          <h2 style={{ ...sectionHeading, fontSize: 28, marginBottom: 8 }}>Team</h2>
          <p style={{ ...bodyText, marginBottom: 36 }}>Lewis University &middot; Spring 2026</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {TEAM.map((person, i) => (
              <motion.div key={person.key} {...stagger} transition={{ delay: i * 0.08, duration: 0.5 }}
                style={{
                  ...glassCard({ padding: "24px 28px" }),
                  display: "flex", alignItems: "flex-start", gap: 24,
                  position: "relative", overflow: "hidden",
                }}
              >
                <Avatar person={person} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
                    <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 17, color: C.text }}>
                      {person.name}
                    </span>
                    <span style={{
                      fontFamily: T.display, fontSize: 12, fontWeight: 600,
                      ...gradientText(),
                      padding: "2px 0",
                    }}>{person.role}</span>
                  </div>
                  <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                    {person.contributions.map((c) => (
                      <li key={c} style={{ fontFamily: T.display, fontSize: 14, color: C.sub,
                        lineHeight: 1.7, marginBottom: 2 }}>{c}</li>
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
              <motion.div key={name} {...stagger} transition={{ delay: i * 0.08, duration: 0.4 }}
                style={{
                  ...glassCard({ padding: "18px 24px" }),
                  display: "flex", alignItems: "center", gap: 20,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 15, color: C.text }}>{name}</div>
                  <div style={{ fontFamily: T.display, fontSize: 13, color: C.sub, marginTop: 2 }}>{desc}</div>
                </div>
                <a href={link} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: T.mono, fontSize: 12, color: C.accent, textDecoration: "none",
                    whiteSpace: "nowrap", transition: "opacity 0.2s" }}
                  onMouseEnter={(e) => e.target.style.opacity = "0.7"}
                  onMouseLeave={(e) => e.target.style.opacity = "1"}
                >
                  {linkLabel} &#8599;
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Open source CTA */}
        <motion.div {...fadeUp}
          style={{
            ...glassCard({ padding: "44px 40px" }),
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: C.gradientA,
          }}/>
          <div style={{
            fontFamily: T.display, fontWeight: 800, fontSize: 24,
            letterSpacing: "-0.03em", marginBottom: 12,
          }}>
            <span style={gradientText()}>Open source</span>
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
              background: C.gradientA, color: "#fff",
              padding: "13px 28px", borderRadius: 10,
              fontFamily: T.display, fontWeight: 600, fontSize: 15,
              textDecoration: "none",
              boxShadow: "0 4px 24px rgba(56,189,248,0.2)",
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
