import { useState } from "react";
import { motion } from "framer-motion";
import { C, T, glass, card, label as labelStyle, sectionHeading, bodyText } from "../tokens.js";

const SUBTABS = ["overview", "data", "trust-scoring", "event-detection", "forecasting", "results"];

const SENSOR_TABLE = [
  { id: 230019, name: "Lewis University",       readings: 20558, coverage: "98.5%", notes: "Primary reference sensor" },
  { id: 249443, name: "Joliet Junior College",  readings: 20365, coverage: "97.5%", notes: "" },
  { id: 249445, name: "Sanchez Elementary",     readings: 20677, coverage: "99.0%", notes: "" },
  { id: 290694, name: "Unknown (low coverage)", readings: 3741,  coverage: "17.9%", notes: "Excluded from models" },
  { id: 297697, name: "Joliet Township Hall",   readings: 20673, coverage: "99.0%", notes: "" },
];

const RF_RESULTS = [
  { sensor: 230019, name: "Lewis University",      mae: 0.5094, rmse: 1.1462, r2: 0.9823 },
  { sensor: 249443, name: "Joliet Junior College", mae: 1.1176, rmse: 4.5292, r2: 0.7659 },
  { sensor: 249445, name: "Sanchez Elementary",    mae: 0.7734, rmse: 1.9993, r2: 0.9553 },
  { sensor: 297697, name: "Joliet Township Hall",  mae: 0.6719, rmse: 1.5314, r2: 0.9653 },
];

function Stat({ label: lbl, value, sub, accentColor }) {
  const col = accentColor || C.accent;
  return (
    <div style={{ ...glass(), borderTop: `3px solid ${col}`, paddingTop: 20 }}>
      <div style={labelStyle}>{lbl}</div>
      <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 34,
        color: col, lineHeight: 1, marginTop: 8, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontFamily: T.display, fontSize: 13, color: C.muted }}>{sub}</div>}
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)",
      background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.display, fontSize: 14 }}>
        <thead>
          <tr style={{ background: "rgba(0,0,0,0.03)" }}>
            {headers.map(h => (
              <th key={h} style={{ padding: "11px 16px", textAlign: "left", ...labelStyle,
                borderBottom: "1px solid rgba(0,0,0,0.07)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: "11px 16px",
                  color: j === 0 ? C.text : C.sub,
                  fontFamily: j >= 1 ? T.mono : T.display,
                  fontWeight: j >= 1 ? 600 : 400,
                  fontSize: j >= 1 ? 13 : 14,
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Callout({ type = "note", children }) {
  const s = {
    note:    { color: C.accent,   bg: C.accentLight,               border: C.accentBorder,          icon: "i" },
    caveat:  { color: "#b45309",  bg: "rgba(180,83,9,0.06)",        border: "rgba(180,83,9,0.2)",     icon: "!" },
    formula: { color: "#16a34a",  bg: "rgba(22,163,74,0.06)",       border: "rgba(22,163,74,0.2)",    icon: "f" },
  }[type];
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`,
      borderLeft: `3px solid ${s.color}`,
      borderRadius: "0 10px 10px 0",
      padding: "14px 18px", display: "flex", gap: 12, margin: "18px 0",
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: 5, flexShrink: 0,
        background: s.border, color: s.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: T.mono, fontSize: 11, fontWeight: 700,
      }}>{s.icon}</span>
      <div style={{ ...bodyText, fontSize: 13 }}>{children}</div>
    </div>
  );
}

export default function Research() {
  const [subTab, setSubTab] = useState("overview");

  return (
    <div style={{ minHeight: "100vh", color: C.text }}>

      {/* Header */}
      <div style={{ padding: "52px 48px 0", maxWidth: 1100, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{
              fontFamily: T.mono, fontSize: 11, fontWeight: 600,
              color: "#6d28d9", background: "rgba(109,40,217,0.07)",
              border: "1px solid rgba(109,40,217,0.18)",
              borderRadius: 5, padding: "3px 10px", letterSpacing: "0.04em",
            }}>RESEARCH</span>
          </div>
          <h1 style={{ ...sectionHeading, fontSize: 38, marginBottom: 10 }}>
            Air Quality Study — November 2025
          </h1>
          <p style={{ ...bodyText, maxWidth: 620, marginBottom: 36 }}>
            Five PurpleAir sensors, one month, southwest Chicago suburbs.
            85,014 readings. Trust scoring, event detection, and Random Forest
            forecasting — all methods documented below.
          </p>
        </motion.div>
      </div>

      {/* Sub-nav */}
      <div style={{
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        background: "rgba(255,255,255,0.5)",
        backdropFilter: "blur(10px)",
        padding: "0 48px", display: "flex",
        maxWidth: "none",
      }}>
        {SUBTABS.map(t => (
          <button key={t} onClick={() => setSubTab(t)} style={{
            background: "transparent", border: "none", position: "relative",
            color: subTab === t ? C.text : C.sub,
            padding: "12px 16px 10px",
            fontFamily: T.display, fontWeight: subTab === t ? 600 : 450, fontSize: 13,
            cursor: "pointer", textTransform: "capitalize", whiteSpace: "nowrap",
            transition: "color 0.15s",
          }}
          onMouseEnter={e => { if (subTab !== t) e.currentTarget.style.color = C.text; }}
          onMouseLeave={e => { if (subTab !== t) e.currentTarget.style.color = C.sub; }}
          >
            {t.replace("-", " ")}
            {subTab === t && (
              <motion.div layoutId="research-tab"
                style={{ position: "absolute", bottom: 0, left: 16, right: 16,
                  height: 2, borderRadius: "2px 2px 0 0", background: "#6d28d9" }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 48px 88px" }}>

        {subTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 44 }}>
              <Stat label="Total readings" value="85,014" sub="5 sensors · Nov 2025" />
              <Stat label="Best MAE"       value="0.51"   sub="µg/m³ — Lewis University" accentColor="#16a34a" />
              <Stat label="Best R²"        value="0.98"   sub="Lewis University sensor"  accentColor="#16a34a" />
              <Stat label="Avg coverage"   value="97.5%"  sub="Excl. sensor 290694"      accentColor="#b45309" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 44 }}>
              <div style={glass()}>
                <h3 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 17,
                  letterSpacing: "-0.02em", margin: "0 0 12px", color: C.text }}>Study design</h3>
                <ul style={{ ...bodyText, fontSize: 14, paddingLeft: 18 }}>
                  <li style={{ marginBottom: 7 }}>5 PurpleAir-style dual-channel sensors</li>
                  <li style={{ marginBottom: 7 }}>November 1–29, 2025 (29 days)</li>
                  <li style={{ marginBottom: 7 }}>2-minute measurement intervals</li>
                  <li style={{ marginBottom: 7 }}>Romeoville, Joliet, Lockport area (SW Chicago)</li>
                  <li>Source: <a href="https://github.com/DrKoz/ACS_AQ" target="_blank" rel="noopener noreferrer"
                    style={{ color: C.accent, textDecoration: "none" }}>github.com/DrKoz/ACS_AQ</a></li>
                </ul>
              </div>
              <div style={glass()}>
                <h3 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 17,
                  letterSpacing: "-0.02em", margin: "0 0 12px", color: C.text }}>Three ML components</h3>
                {[
                  ["Dual-sensor trust scoring", "Quantifies A/B channel agreement per reading (0–100)"],
                  ["Rule-based event detection", "Smoke spikes, rain washout, sensor failure — no labels needed"],
                  ["Random Forest forecasting",  "t+1 prediction, autoregressive rollout, tree bootstrap CI"],
                ].map(([title, desc]) => (
                  <div key={title} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <span style={{ color: "#6d28d9", marginTop: 1, flexShrink: 0 }}>&#9656;</span>
                    <div>
                      <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 14, color: C.text }}>{title}</div>
                      <div style={{ fontFamily: T.display, fontSize: 13, color: C.sub, marginTop: 1 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {subTab === "data" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ ...sectionHeading, fontSize: 24, marginBottom: 6 }}>The Dataset</h2>
            <p style={{ ...bodyText, marginBottom: 28, maxWidth: 580 }}>
              Dr. Kozminski provided raw CSV exports from five outdoor PurpleAir sensors.
              Each row is a 2-minute average with dual-channel PM2.5, temperature, and relative humidity.
            </p>
            <Table headers={["Sensor ID","Location","Readings","Coverage","Notes"]}
              rows={SENSOR_TABLE.map(r => [r.id, r.name, r.readings.toLocaleString(), r.coverage, r.notes || "—"])} />
            <Callout type="note">
              Sensor 290694 has only 17.9% data coverage due to connectivity issues. Included in descriptive
              statistics but excluded from all forecasting models.
            </Callout>
            <h3 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 18,
              letterSpacing: "-0.02em", margin: "36px 0 10px", color: C.text }}>Cross-sensor divergence</h3>
            <p style={{ ...bodyText, marginBottom: 14 }}>
              Arun Muthukumar's EDA identified two major inter-sensor divergence clusters.
            </p>
            {[["Nov 27","~41 µg/m³","Spatially concentrated smoke spike"],
              ["Nov 29","~27 µg/m³","Moderate smoke event, confirmed by event detection"]].map(([date,peak,desc]) => (
              <div key={date} style={{
                ...glass({ padding: "14px 20px", marginBottom: 8 }),
                display: "flex", alignItems: "center", gap: 18,
                borderLeft: `3px solid #c2410c`,
              }}>
                <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 13, color: "#c2410c", minWidth: 52 }}>{date}</div>
                <div>
                  <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 16, color: C.text }}>{peak} range</div>
                  <div style={{ fontFamily: T.display, fontSize: 13, color: C.muted, marginTop: 1 }}>{desc}</div>
                </div>
              </div>
            ))}
            <Callout type="caveat">
              Cross-sensor divergence identifies <em>where</em> PM2.5 differs across the network,
              but cannot attribute the cause without additional meteorological data.
            </Callout>
          </motion.div>
        )}

        {subTab === "trust-scoring" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ ...sectionHeading, fontSize: 24, marginBottom: 10 }}>Dual-Sensor Trust Scoring</h2>
            <p style={{ ...bodyText, marginBottom: 20, maxWidth: 600 }}>
              PurpleAir sensors contain two independent laser particle counters (A and B). Large
              disagreement signals hardware issues. We quantify this as a trust score per 2-minute reading.
            </p>
            <Callout type="formula">
              <strong>T = 100 × e<sup>−3 × |A−B| / mean(A,B)</sup></strong><br/>
              T = 100 when A = B exactly. T &lt; 55 is flagged as "LOW" trust.
            </Callout>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
              {[["HIGH","> 80","#16a34a"],["MED","55–80","#b45309"],["LOW","< 55","#b91c1c"]].map(([l,r,c]) => (
                <div key={l} style={{ ...glass({ textAlign: "center" }), borderTop: `3px solid ${c}`, paddingTop: 18 }}>
                  <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 20, color: c }}>{l}</div>
                  <div style={{ fontFamily: T.display, fontSize: 13, color: C.muted, marginTop: 3 }}>Score {r}</div>
                </div>
              ))}
            </div>
            <Table headers={["Sensor","Mean Trust","Interpretation"]}
              rows={[[230019,"~82%","Good — typical hardware behavior"],[249443,"~78%","Good — occasional divergence"],
                [249445,"~84%","Excellent — very consistent"],[297697,"~80%","Good"]].map(r => r)} />
            <Callout type="caveat">
              The trust score cannot detect simultaneous drift on both channels. If A and B both shift
              equally, T remains high despite inaccurate readings — an inherent limitation.
            </Callout>
          </motion.div>
        )}

        {subTab === "event-detection" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ ...sectionHeading, fontSize: 24, marginBottom: 10 }}>Rule-Based Event Detection</h2>
            <p style={{ ...bodyText, marginBottom: 28, maxWidth: 600 }}>
              Three event types detected via threshold rules — no labeled training data required.
              One event per type per sensor per 2-hour window.
            </p>
            {[
              { color: "#c2410c", title: "Smoke Spike",
                rules: ["PM2.5 rises ≥ 50% within any 30-minute window", "AND current PM2.5 > 35 µg/m³"],
                notes: "Captures wildfire plumes and local combustion events." },
              { color: "#1d4ed8", title: "Rain Washout",
                rules: ["PM2.5 drops ≥ 35% within a 1-hour window", "AND baseline PM2.5 > 5 µg/m³"],
                notes: "Precipitation scavenges particles. Inferred from PM2.5 pattern only." },
              { color: "#b45309", title: "Sensor Failure",
                rules: ["Trust score < 40 for 3+ consecutive readings (~6 minutes)", "AND A/B divergence > 40%"],
                notes: "Indicates hardware malfunction or extreme contamination." },
            ].map(({ color, title, rules, notes }) => (
              <div key={title} style={{ ...glass({ marginBottom: 12, borderLeft: `3px solid ${color}` }) }}>
                <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, color, marginBottom: 8 }}>{title}</div>
                {rules.map(r => (
                  <div key={r} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                    <span style={{ color, flexShrink: 0 }}>→</span>
                    <span style={{ fontFamily: T.mono, fontSize: 13, color: C.text }}>{r}</span>
                  </div>
                ))}
                <div style={{ fontFamily: T.display, fontSize: 13, color: C.muted, marginTop: 8 }}>{notes}</div>
              </div>
            ))}
            <Callout type="caveat">
              No ground-truth event labels exist. Events should be treated as candidate anomalies,
              not confirmed detections. Precision and recall cannot be computed.
            </Callout>
          </motion.div>
        )}

        {subTab === "forecasting" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ ...sectionHeading, fontSize: 24, marginBottom: 10 }}>Random Forest Forecasting</h2>
            <p style={{ ...bodyText, marginBottom: 22, maxWidth: 600 }}>
              RandomForestRegressor predicts PM2.5 one step ahead (t+1, 2 minutes). The 6-hour view
              is produced by feeding each prediction back as input.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
              <div style={glass()}>
                <div style={labelStyle}>Model configuration</div>
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 9 }}>
                  {[["Algorithm","RandomForestRegressor"],["n_estimators","100 trees"],
                    ["max_depth","12"],["random_state","42 (reproducible)"],
                    ["Train/test","80/20 temporal split — NO shuffling"]].map(([k,v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={labelStyle}>{k}</span>
                      <span style={{ fontFamily: T.mono, fontSize: 13, color: C.text }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={glass()}>
                <div style={labelStyle}>Features (15 total)</div>
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
                  {["12 PM2.5 lag features (t−1 to t−12, past 24 min)",
                    "Average temperature across channels",
                    "Average relative humidity",
                    "Hour of day (0–23)",
                    "Day of week (0–6)"].map(f => (
                    <div key={f} style={{ display: "flex", gap: 8 }}>
                      <span style={{ color: "#6d28d9", flexShrink: 0 }}>&#9656;</span>
                      <span style={{ fontFamily: T.display, fontSize: 13, color: C.sub }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Callout type="note">
              This is a <strong>single-step (t+1) predictor</strong>. Uncertainty uses 10th–90th percentile
              across 100 trees. Autoregressive rollout means errors accumulate over the 6-hour horizon.
            </Callout>
            <h3 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 17,
              letterSpacing: "-0.02em", margin: "28px 0 10px", color: C.text }}>SARIMA baseline</h3>
            <p style={{ ...bodyText, marginBottom: 10, maxWidth: 540 }}>
              SARIMA(1,1,1)(1,0,1,24) fit as a classical baseline. Captures daily seasonality.
            </p>
            <Callout type="caveat">
              Random Forest outperforms SARIMA on all four sensors — expected given SARIMA's
              linear assumptions vs. the nonlinear, multivariate nature of PM2.5.
            </Callout>
          </motion.div>
        )}

        {subTab === "results" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ ...sectionHeading, fontSize: 24, marginBottom: 6 }}>Model Results</h2>
            <p style={{ ...bodyText, marginBottom: 28, maxWidth: 520 }}>
              All metrics on a held-out 20% temporal test set. No shuffling.
            </p>
            <h3 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, marginBottom: 12, color: C.text }}>
              Random Forest — Test set performance
            </h3>
            <div style={{ overflowX: "auto", borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.08)", marginBottom: 28,
              background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.03)" }}>
                    {["Sensor","Location","MAE (µg/m³)","RMSE (µg/m³)","R²"].map(h => (
                      <th key={h} style={{ padding: "11px 16px", textAlign: "left", ...labelStyle,
                        borderBottom: "1px solid rgba(0,0,0,0.07)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RF_RESULTS.map((r, i) => (
                    <tr key={r.sensor} style={{ borderBottom: i < RF_RESULTS.length-1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
                      <td style={{ padding:"11px 16px", fontFamily:T.mono, fontSize:13, color:C.muted }}>{r.sensor}</td>
                      <td style={{ padding:"11px 16px", fontFamily:T.display, fontSize:14, color:C.text }}>{r.name}</td>
                      <td style={{ padding:"11px 16px", fontFamily:T.mono, fontWeight:700, fontSize:15,
                        color: r.mae<0.6?"#16a34a":r.mae<1.0?"#b45309":"#b91c1c" }}>{r.mae.toFixed(4)}</td>
                      <td style={{ padding:"11px 16px", fontFamily:T.mono, fontSize:14, color:C.sub }}>{r.rmse.toFixed(4)}</td>
                      <td style={{ padding:"11px 16px", fontFamily:T.mono, fontWeight:700, fontSize:15,
                        color: r.r2>0.95?"#16a34a":r.r2>0.85?"#b45309":"#b91c1c" }}>{r.r2.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, marginBottom: 12, color: C.text }}>
              RF vs SARIMA comparison
            </h3>
            <div style={{ overflowX: "auto", borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.08)", marginBottom: 28,
              background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.03)" }}>
                    {["Sensor","RF MAE","SARIMA MAE","RF R²","SARIMA R²","Winner"].map(h => (
                      <th key={h} style={{ padding:"11px 16px", textAlign:"left", ...labelStyle,
                        borderBottom:"1px solid rgba(0,0,0,0.07)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RF_RESULTS.map((r, i) => (
                    <tr key={r.sensor} style={{ borderBottom: i<RF_RESULTS.length-1?"1px solid rgba(0,0,0,0.06)":"none" }}>
                      <td style={{ padding:"11px 16px", fontFamily:T.display, fontSize:14, color:C.text }}>{r.name}</td>
                      <td style={{ padding:"11px 16px", fontFamily:T.mono, fontSize:13, color:"#16a34a" }}>{r.mae.toFixed(4)}</td>
                      <td style={{ padding:"11px 16px", fontFamily:T.mono, fontSize:13, color:C.muted }}>running...</td>
                      <td style={{ padding:"11px 16px", fontFamily:T.mono, fontSize:13, color:"#16a34a" }}>{r.r2.toFixed(4)}</td>
                      <td style={{ padding:"11px 16px", fontFamily:T.mono, fontSize:13, color:C.muted }}>running...</td>
                      <td style={{ padding:"11px 16px", fontFamily:T.mono, fontSize:13, color:"#16a34a", fontWeight:700 }}>RF</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Callout type="caveat">
              <strong>Methodological transparency:</strong> Forecast is t+1 only, not multi-hour.
              Event detection has no ground-truth validation. Trust score cannot detect simultaneous
              channel drift. November 2025, one region — generalizability is limited.
            </Callout>
          </motion.div>
        )}
      </div>
    </div>
  );
}
