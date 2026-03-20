import { C, T, card, label as labelStyle, sectionHeading, bodyText } from "../tokens.js";

const TEAM = [
  {
    key: "ir",
    name: "Idhant Ranjan",
    role: "Project Lead",
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
    role: "Data Engineer",
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

function Avatar({ person, large = false }) {
  const size = large ? 100 : 72;
  return (
    <div style={{
      width: size, height: size,
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
      <span className="initials" style={{
        display: "none", width: "100%", height: "100%",
        alignItems: "center", justifyContent: "center",
        fontFamily: T.mono, fontWeight: 700,
        fontSize: large ? 24 : 17, color: "#3b82f6",
      }}>{person.initials}</span>
    </div>
  );
}

export default function About() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 48px 96px" }}>

        {/* Header */}
        <div style={{ marginBottom: 72 }}>
          <h1 style={{ ...sectionHeading, fontSize: 40, marginBottom: 16 }}>About AirAware</h1>
          <p style={{ ...bodyText, fontSize: 17, maxWidth: 640 }}>
            An open-source air quality monitoring platform built by the ACS Research Group
            at Lewis University. We combine live sensor data with reproducible ML methods
            to make air quality science transparent and accessible.
          </p>
        </div>

        {/* Mission */}
        <div style={{ marginBottom: 72 }}>
          <h2 style={{ ...sectionHeading, fontSize: 28, marginBottom: 24 }}>Mission</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              {
                icon: "◎",
                title: "Transparency",
                desc: "Every method is documented. Every caveat is stated. We don't overstate what the models can do.",
              },
              {
                icon: "◈",
                title: "Community",
                desc: "The southwest Chicago suburbs deserve localized air quality data. We built for Romeoville, Joliet, and the surrounding area.",
              },
              {
                icon: "◇",
                title: "Open source",
                desc: "All code, data processing scripts, and methodology notes are published on GitHub under an open license.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={card()}>
                <div style={{ fontFamily: T.mono, fontSize: 22, color: "#3b82f6", marginBottom: 12 }}>{icon}</div>
                <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{title}</div>
                <div style={{ ...bodyText, fontSize: 14 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div style={{ marginBottom: 72 }}>
          <h2 style={{ ...sectionHeading, fontSize: 28, marginBottom: 8 }}>Team</h2>
          <p style={{ ...bodyText, marginBottom: 36 }}>Lewis University · Spring 2026</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {TEAM.map((person) => (
              <div key={person.key} style={{
                ...card({ padding: "24px 28px" }),
                display: "flex",
                alignItems: "flex-start",
                gap: 24,
              }}>
                <Avatar person={person} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
                    <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 17, color: C.text }}>
                      {person.name}
                    </span>
                    <span style={{
                      fontFamily: T.display, fontSize: 12, color: "#3b82f6",
                      background: "#0f1f3d", border: "1px solid #3b82f630",
                      borderRadius: 5, padding: "2px 9px",
                    }}>{person.role}</span>
                  </div>
                  <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                    {person.contributions.map((c) => (
                      <li key={c} style={{ fontFamily: T.display, fontSize: 14, color: C.sub,
                        lineHeight: 1.6, marginBottom: 3 }}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data sources & acknowledgements */}
        <div style={{ marginBottom: 72 }}>
          <h2 style={{ ...sectionHeading, fontSize: 28, marginBottom: 24 }}>Data sources</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
            ].map(({ name, desc, link, linkLabel }) => (
              <div key={name} style={{
                ...card({ padding: "18px 24px" }),
                display: "flex", alignItems: "center", gap: 20,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 15, color: C.text }}>{name}</div>
                  <div style={{ fontFamily: T.display, fontSize: 13, color: C.sub, marginTop: 2 }}>{desc}</div>
                </div>
                <a href={link} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: T.mono, fontSize: 12, color: "#3b82f6", textDecoration: "none",
                    whiteSpace: "nowrap" }}>
                  {linkLabel} ↗
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub + open source */}
        <div style={{
          ...card({ padding: "36px 40px", background: "#0f1f3d", border: "1px solid #3b82f630" }),
          textAlign: "center",
        }}>
          <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 22,
            letterSpacing: "-0.02em", marginBottom: 12 }}>Open source</div>
          <p style={{ ...bodyText, maxWidth: 480, margin: "0 auto 24px" }}>
            The full codebase — ML pipeline, dashboard, data collector — is publicly available.
            Issues and pull requests welcome.
          </p>
          <a
            href="https://github.com/IdhantRanjan/airaware"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#3b82f6", color: "#fff",
              padding: "12px 24px", borderRadius: 8,
              fontFamily: T.display, fontWeight: 600, fontSize: 15,
              textDecoration: "none",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            IdhantRanjan/airaware
          </a>
        </div>

      </div>
    </div>
  );
}
