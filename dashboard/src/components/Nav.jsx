import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
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
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: `${C.bg}d0`,
        backdropFilter: "blur(24px) saturate(1.2)",
        WebkitBackdropFilter: "blur(24px) saturate(1.2)",
        borderBottom: `1px solid ${C.border}60`,
        padding: "0 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 60,
      }}>
      {/* Logo */}
      <NavLink to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: C.gradientA,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3" fill="#fff"/>
            <circle cx="8" cy="8" r="6" stroke="#fff" strokeWidth="1" opacity="0.5"/>
          </svg>
        </div>
        <span style={{
          fontFamily: T.display,
          fontWeight: 800,
          fontSize: 17,
          letterSpacing: "-0.04em",
          background: C.gradientText,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          AirAware
        </span>
        <span style={{
          fontFamily: T.display,
          fontSize: 11,
          color: C.muted,
          fontWeight: 500,
          paddingLeft: 10,
          borderLeft: `1px solid ${C.border}`,
          marginLeft: 4,
        }}>Lewis University</span>
      </NavLink>

      {/* Nav links */}
      <nav style={{ display: "flex", gap: 2, height: "100%" }}>
        {LINKS.map(({ to, label }) => {
          const active = to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              style={{
                textDecoration: "none",
                padding: "0 18px",
                fontFamily: T.display,
                fontWeight: active ? 600 : 450,
                fontSize: 14,
                color: active ? C.text : C.sub,
                display: "flex",
                alignItems: "center",
                position: "relative",
                transition: "color 0.2s",
              }}
            >
              {label}
              {active && (
                <motion.div
                  layoutId="nav-underline"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 18, right: 18,
                    height: 2,
                    borderRadius: 1,
                    background: C.gradientA,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* GitHub */}
      <a
        href="https://github.com/IdhantRanjan/airaware"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          textDecoration: "none",
          fontFamily: T.display,
          fontSize: 13,
          fontWeight: 500,
          color: C.sub,
          transition: "color 0.2s",
          padding: "7px 14px",
          borderRadius: 8,
          border: `1px solid ${C.border}`,
          background: `${C.surface}80`,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.border2; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = C.sub; e.currentTarget.style.borderColor = C.border; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
        GitHub
      </a>
    </motion.header>
  );
}
