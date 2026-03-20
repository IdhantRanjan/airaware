import { NavLink, useLocation } from "react-router-dom";
import { C, T } from "../tokens.js";

const LINKS = [
  { to: "/",         label: "Home"         },
  { to: "/live",     label: "Live Monitor" },
  { to: "/research", label: "Research"     },
  { to: "/about",    label: "About"        },
];

export default function Nav() {
  const loc = useLocation();

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: `${C.bg}f0`,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: `1px solid ${C.border}`,
      padding: "0 48px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 56,
    }}>
      {/* Wordmark */}
      <NavLink to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" stroke={C.accent} strokeWidth="1.5"/>
          <circle cx="10" cy="10" r="4"  fill={C.accent} opacity="0.2"/>
          <circle cx="10" cy="10" r="2"  fill={C.accent}/>
        </svg>
        <span style={{
          fontFamily: T.display,
          fontWeight: 800,
          fontSize: 16,
          letterSpacing: "-0.03em",
          color: C.text,
        }}>
          Air<span style={{ color: C.accent }}>Aware</span>
        </span>
        <span style={{
          fontFamily: T.display,
          fontSize: 11,
          color: C.muted,
          fontWeight: 400,
          letterSpacing: "0.02em",
          paddingLeft: 2,
          borderLeft: `1px solid ${C.border2}`,
          marginLeft: 4,
          paddingLeft: 8,
        }}>Lewis University</span>
      </NavLink>

      {/* Nav links */}
      <nav style={{ display: "flex", gap: 0 }}>
        {LINKS.map(({ to, label }) => {
          const active = to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              style={{
                textDecoration: "none",
                padding: "18px 18px",
                fontFamily: T.display,
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                color: active ? C.text : C.sub,
                borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
                transition: "color 0.15s, border-color 0.15s",
                lineHeight: 1,
              }}
            >{label}</NavLink>
          );
        })}
      </nav>

      {/* GitHub link */}
      <a
        href="https://github.com/IdhantRanjan/airaware"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          textDecoration: "none",
          fontFamily: T.display,
          fontSize: 13,
          color: C.sub,
          transition: "color 0.2s",
          padding: "6px 12px",
          borderRadius: 6,
          border: `1px solid ${C.border}`,
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = C.text}
        onMouseLeave={(e) => e.currentTarget.style.color = C.sub}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
        GitHub
      </a>
    </header>
  );
}
