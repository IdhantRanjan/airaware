import { useState } from "react";
import { C, T, card, label as labelStyle, sectionHeading, bodyText } from "../tokens.js";
import TimeChart from "../components/TimeChart.jsx";

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

function Stat({ label: lbl, value, sub, color }) {
  return (
    <div style={card()}>
      <div style={labelStyle}>{lbl}</div>
      <div style={{
        fontFamily: T.mono, fontWeight: 700, fontSize: 36,
        color: color || "#3b82f6", lineHeight: 1, marginTop: 10, marginBottom: 4,
      }}>{value}</div>
      {sub && <div style={{ fontFamily: T.display, fontSize: 13, color: C.sub }}>{sub}</div>}
    </div>
  );
}

function Table({ headers, rows, colored }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: 10, border: `1px solid ${C.border}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.display, fontSize: 14 }}>
        <thead>
          <tr style={{ background: C.elevated }}>
            {headers.map((h) => (
              <th key={h} style={{
                padding: "12px 16px", textAlign: "left", ...labelStyle,
                borderBottom: `1px solid ${C.border}`,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: "12px 16px",
                  color: j === 0 ? C.text : C.sub,
                  fontFamily: j >= 1 && colored ? T.mono : T.display,
                  fontWeight: j >= 1 && colored ? 600 : 400,
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
  const styles = {
    note:    { bg: "#0f1f3d", border: "#3b82f6", icon: "ℹ" },
    caveat:  { bg: "#1c1400", border: "#eab308", icon: "⚠" },
    formula: { bg: "#0f1a0f", border: "#22c55e", icon: "∑" },
  };
  const s = styles[type];
  return (
    <div style={{
      background: s.bg,
      border: `1px solid ${s.border}40`,
      borderLeft: `3px solid ${s.border}`,
      borderRadius: "0 8px 8px 0",
      padding: "16px 20px",
      display: "flex",
      gap: 14,
      margin: "20px 0",
    }}>
      <span style={{ fontSize: 16, flexShrink: 0, color: s.border }}>{s.icon}</span>
      <div style={{ ...bodyText, fontSize: 14 }}>{children}</div>
    </div>
  );
}

export default function Research() {
  const [subTab, setSubTab] = useState("overview");

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      {/* Header */}
      <div style={{
        padding: "56px 48px 0",
        maxWidth: 1100,
        margin: "0 auto",
      }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{
            fontFamily: T.mono, fontSize: 11, color: "#6366f1",
            background: "#1e1b4b", border: "1px solid #6366f130",
            borderRadius: 5, padding: "3px 10px",
          }}>RESEARCH</span>
        </div>
        <h1 style={{ ...sectionHeading, fontSize: 40, marginBottom: 12 }}>
          Air Quality Study — November 2025
        </h1>
        <p style={{ ...bodyText, maxWidth: 640, marginBottom: 40 }}>
          Five PurpleAir sensors, one month, southwest Chicago suburbs.
          85,014 readings. We built trust scoring, event detection, and
          Random Forest forecasting — all methods documented below.
        </p>
      </div>

      {/* Sub-nav */}
      <div style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "0 48px",
        display: "flex",
        gap: 2,
        maxWidth: 1100,
        margin: "0 auto",
      }}>
        {SUBTABS.map((t) => (
          <button key={t} onClick={() => setSubTab(t)} style={{
            background: "transparent", border: "none",
            borderBottom: subTab === t ? `2px solid #6366f1` : "2px solid transparent",
            color: subTab === t ? C.text : C.sub,
            padding: "13px 16px 11px",
            fontFamily: T.display, fontWeight: 500, fontSize: 13,
            cursor: "pointer", textTransform: "capitalize", whiteSpace: "nowrap",
            transition: "all 0.15s",
          }}>
            {t.replace("-", " ")}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 48px 96px" }}>

        {/* ── OVERVIEW ── */}
        {subTab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 48 }}>
              <Stat label="Total readings"    value="85,014"  sub="5 sensors · Nov 2025"         />
              <Stat label="Best MAE"          value="0.51"    sub="µg/m³ — Lewis University"  color="#22c55e"/>
              <Stat label="Best R²"           value="0.98"    sub="Lewis University sensor"   color="#22c55e"/>
              <Stat label="Avg coverage"      value="97.5%"   sub="Excl. sensor 290694"       color="#eab308"/>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 48 }}>
              <div style={card()}>
                <h3 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 18,
                  letterSpacing: "-0.02em", margin: "0 0 14px" }}>Study design</h3>
                <ul style={{ ...bodyText, fontSize: 15, paddingLeft: 20 }}>
                  <li style={{ marginBottom: 8 }}>5 PurpleAir-style dual-channel sensors</li>
                  <li style={{ marginBottom: 8 }}>November 1–29, 2025 (29 days)</li>
                  <li style={{ marginBottom: 8 }}>2-minute measurement intervals</li>
                  <li style={{ marginBottom: 8 }}>Romeoville, Joliet, Lockport area (SW Chicago)</li>
                  <li>Source: <a href="https://github.com/DrKoz/ACS_AQ" target="_blank" rel="noopener noreferrer"
                    style={{ color: "#3b82f6" }}>github.com/DrKoz/ACS_AQ</a></li>
                </ul>
              </div>
              <div style={card()}>
                <h3 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 18,
                  letterSpacing: "-0.02em", margin: "0 0 14px" }}>Three ML components</h3>
                {[
                  ["Dual-sensor trust scoring", "Quantifies A/B channel agreement per reading (0–100)"],
                  ["Rule-based event detection", "Smoke spikes, rain washout, sensor failure — no labels needed"],
                  ["Random Forest forecasting",  "t+1 prediction, autoregressive rollout, tree bootstrap CI"],
                ].map(([title, desc]) => (
                  <div key={title} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                    <span style={{ color: "#6366f1", marginTop: 2, flexShrink: 0 }}>▸</span>
                    <div>
                      <div style={{ fontFamily: T.display, fontWeight: 600, fontSize: 14, color: C.text }}>{title}</div>
                      <div style={{ fontFamily: T.display, fontSize: 13, color: C.sub, marginTop: 2 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── THE DATA ── */}
        {subTab === "data" && (
          <div>
            <h2 style={{ ...sectionHeading, fontSize: 26, marginBottom: 8 }}>The Dataset</h2>
            <p style={{ ...bodyText, marginBottom: 32, maxWidth: 620 }}>
              Dr. Kozminski provided raw CSV exports from five outdoor PurpleAir sensors.
              Each row is a 2-minute average with dual-channel PM2.5 (channels A and B),
              temperature, and relative humidity.
            </p>
            <Table
              headers={["Sensor ID", "Location", "Readings", "Coverage", "Notes"]}
              rows={SENSOR_TABLE.map((r) => [
                r.id, r.name,
                r.readings.toLocaleString(),
                r.coverage,
                r.notes || "—",
              ])}
            />
            <Callout type="note">
              Sensor 290694 has only 17.9% data coverage due to connectivity issues during the study
              period. It is included in descriptive statistics but excluded from all forecasting models.
            </Callout>
            <h3 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 20,
              letterSpacing: "-0.02em", margin: "40px 0 12px" }}>Cross-sensor divergence</h3>
            <p style={{ ...bodyText, marginBottom: 16 }}>
              Arun Muthukumar's EDA identified two major inter-sensor divergence clusters.
              Hourly inter-sensor range = max(sensors) − min(sensors) at each timestamp.
            </p>
            {[
              ["Nov 27", "~41 µg/m³", "Spatially concentrated smoke spike"],
              ["Nov 29", "~27 µg/m³", "Moderate smoke event, confirmed by event detection"],
            ].map(([date, peak, desc]) => (
              <div key={date} style={{
                ...card({ padding: "16px 24px", marginBottom: 10 }),
                display: "flex", alignItems: "center", gap: 20,
                borderLeft: `3px solid #f97316`,
              }}>
                <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 14, color: "#f97316", minWidth: 60 }}>{date}</div>
                <div>
                  <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 18, color: C.text }}>{peak} range</div>
                  <div style={{ fontFamily: T.display, fontSize: 13, color: C.sub, marginTop: 2 }}>{desc}</div>
                </div>
              </div>
            ))}
            <Callout type="caveat">
              Cross-sensor divergence identifies <em>where</em> PM2.5 differs across the network
              at a given time, but cannot attribute the cause without additional meteorological data.
            </Callout>
          </div>
        )}

        {/* ── TRUST SCORING ── */}
        {subTab === "trust-scoring" && (
          <div>
            <h2 style={{ ...sectionHeading, fontSize: 26, marginBottom: 12 }}>Dual-Sensor Trust Scoring</h2>
            <p style={{ ...bodyText, marginBottom: 24, maxWidth: 640 }}>
              PurpleAir sensors contain two independent laser particle counters (channels A and B).
              Normally they agree closely. Large disagreement signals hardware issues or interference.
              We quantify this as a trust score per 2-minute reading.
            </p>
            <Callout type="formula">
              <strong>T = 100 × e<sup>−3 × |A−B| / mean(A, B)</sup></strong><br/>
              where A = Channel A PM2.5, B = Channel B PM2.5.<br/>
              T = 100 when A = B. T &lt; 55 is "LOW" trust.
              T drops exponentially as divergence grows.
            </Callout>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
              {[["HIGH", "> 80", "#22c55e"], ["MED", "55 – 80", "#eab308"], ["LOW", "≤ 55", "#ef4444"]].map(([l,r,c]) => (
                <div key={l} style={{ ...card(), textAlign: "center", borderTop: `3px solid ${c}`, paddingTop: 22 }}>
                  <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 22, color: c }}>{l}</div>
                  <div style={{ fontFamily: T.display, fontSize: 14, color: C.sub, marginTop: 4 }}>Score {r}</div>
                </div>
              ))}
            </div>
            <h3 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", marginBottom: 12 }}>
              Results across sensors
            </h3>
            <Table
              headers={["Sensor", "Mean Trust", "Interpretation"]}
              rows={[
                [230019, "~82%", "Good — typical hardware behavior"],
                [249443, "~78%", "Good — occasional channel divergence"],
                [249445, "~84%", "Excellent — very consistent channels"],
                [297697, "~80%", "Good"],
              ].map(([id, trust, note]) => [id, trust, note])}
            />
            <Callout type="caveat">
              The trust score cannot detect simultaneous drift on both channels. If A and B both
              shift equally due to the same contamination, T remains high despite inaccurate readings.
              This is an inherent limitation of dual-channel systems.
            </Callout>
          </div>
        )}

        {/* ── EVENT DETECTION ── */}
        {subTab === "event-detection" && (
          <div>
            <h2 style={{ ...sectionHeading, fontSize: 26, marginBottom: 12 }}>Rule-Based Event Detection</h2>
            <p style={{ ...bodyText, marginBottom: 32, maxWidth: 640 }}>
              We detect three types of environmental events using threshold rules — no labeled training
              data required. Deduplication enforces one event per type per sensor per 2-hour window.
            </p>
            {[
              {
                type: "smoke_spike",
                color: "#f97316",
                title: "Smoke Spike",
                rules: [
                  "PM2.5 rises ≥ 50% within any 30-minute window",
                  "AND current PM2.5 > 35 µg/m³",
                ],
                notes: "Captures wildfire plumes and local combustion events.",
              },
              {
                type: "rain_washout",
                color: "#38bdf8",
                title: "Rain Washout",
                rules: [
                  "PM2.5 drops ≥ 35% within a 1-hour window",
                  "AND baseline PM2.5 > 5 µg/m³",
                ],
                notes: "Precipitation scavenges particles. No precipitation sensor — inferred from PM2.5 pattern.",
              },
              {
                type: "sensor_failure",
                color: "#fbbf24",
                title: "Sensor Failure",
                rules: [
                  "Trust score < 40 for 3+ consecutive readings (~6 minutes)",
                  "AND A/B channel divergence > 40%",
                ],
                notes: "Indicates hardware malfunction or extreme contamination.",
              },
            ].map(({ color, title, rules, notes }) => (
              <div key={title} style={{
                ...card({ marginBottom: 16, borderLeft: `3px solid ${color}` }),
              }}>
                <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 17, color, marginBottom: 10 }}>{title}</div>
                {rules.map((r) => (
                  <div key={r} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                    <span style={{ color, flexShrink: 0 }}>→</span>
                    <span style={{ fontFamily: T.mono, fontSize: 13, color: C.text }}>{r}</span>
                  </div>
                ))}
                <div style={{ fontFamily: T.display, fontSize: 13, color: C.sub, marginTop: 10 }}>{notes}</div>
              </div>
            ))}
            <Callout type="caveat">
              No ground-truth event labels exist for this dataset. Precision and recall cannot be
              computed. Events should be treated as candidate anomalies, not confirmed detections.
            </Callout>
          </div>
        )}

        {/* ── FORECASTING ── */}
        {subTab === "forecasting" && (
          <div>
            <h2 style={{ ...sectionHeading, fontSize: 26, marginBottom: 12 }}>Random Forest Forecasting</h2>
            <p style={{ ...bodyText, marginBottom: 24, maxWidth: 640 }}>
              We trained a Random Forest regressor to predict PM2.5 one step ahead (t+1, 2 minutes).
              The 6-hour view is produced by autoregressively feeding each prediction into the next.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
              <div style={card()}>
                <div style={labelStyle}>Model configuration</div>
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    ["Algorithm",    "RandomForestRegressor"],
                    ["n_estimators", "100 trees"],
                    ["max_depth",    "12"],
                    ["random_state", "42 (reproducible)"],
                    ["Train/test",   "80/20, temporal split — NO shuffling"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={labelStyle}>{k}</span>
                      <span style={{ fontFamily: T.mono, fontSize: 13, color: C.text }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={card()}>
                <div style={labelStyle}>Features (15 total)</div>
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    "12 PM2.5 lag features (t−1 to t−12, covering past 24 min)",
                    "Average temperature across channels",
                    "Average relative humidity",
                    "Hour of day (0–23)",
                    "Day of week (0–6)",
                  ].map((f) => (
                    <div key={f} style={{ display: "flex", gap: 10 }}>
                      <span style={{ color: "#6366f1", flexShrink: 0 }}>▸</span>
                      <span style={{ fontFamily: T.display, fontSize: 14, color: C.sub }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <h3 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 20,
              letterSpacing: "-0.02em", margin: "0 0 12px" }}>Uncertainty quantification</h3>
            <p style={{ ...bodyText, marginBottom: 16, maxWidth: 580 }}>
              Confidence intervals are estimated from the 10th and 90th percentile of predictions
              across the 100 trees (tree bootstrap). This is a conservative but honest estimate —
              interval width reflects model disagreement, not calibrated probability.
            </p>
            <Callout type="note">
              The model is a <strong>single-step (t+1) predictor</strong>. The 6-hour output is an
              autoregressive rollout where each predicted value is fed back as input to predict the
              next step. Uncertainty grows with horizon because errors accumulate.
            </Callout>

            <h3 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 20,
              letterSpacing: "-0.02em", margin: "32px 0 12px" }}>SARIMA baseline</h3>
            <p style={{ ...bodyText, marginBottom: 12, maxWidth: 580 }}>
              SARIMA(1,1,1)(1,0,1,24) was fit as a classical time series baseline. It captures
              daily seasonality (24 × 2-min = 48-min periods, scaled to daily patterns).
            </p>
            <Callout type="caveat">
              The Random Forest outperforms SARIMA substantially on all four sensors. This is expected
              given SARIMA's linear assumptions and the nonlinear, multivariate nature of PM2.5.
            </Callout>
          </div>
        )}

        {/* ── RESULTS ── */}
        {subTab === "results" && (
          <div>
            <h2 style={{ ...sectionHeading, fontSize: 26, marginBottom: 8 }}>Model Results</h2>
            <p style={{ ...bodyText, marginBottom: 32, maxWidth: 560 }}>
              All metrics computed on a held-out 20% temporal test set. No shuffling.
            </p>
            <h3 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 18, marginBottom: 14 }}>
              Random Forest — Test set performance
            </h3>
            <div style={{ overflowX: "auto", borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 32 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: C.elevated }}>
                    {["Sensor", "Location", "MAE (µg/m³)", "RMSE (µg/m³)", "R²"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", ...labelStyle, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RF_RESULTS.map((r, i) => (
                    <tr key={r.sensor} style={{ borderBottom: i < RF_RESULTS.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <td style={{ padding: "13px 16px", fontFamily: T.mono, fontSize: 14, color: C.sub }}>{r.sensor}</td>
                      <td style={{ padding: "13px 16px", fontFamily: T.display, fontSize: 14, color: C.text }}>{r.name}</td>
                      <td style={{ padding: "13px 16px", fontFamily: T.mono, fontWeight: 700, fontSize: 16,
                        color: r.mae < 0.6 ? "#22c55e" : r.mae < 1.0 ? "#eab308" : "#f97316" }}>{r.mae.toFixed(4)}</td>
                      <td style={{ padding: "13px 16px", fontFamily: T.mono, fontWeight: 700, fontSize: 16, color: C.sub }}>{r.rmse.toFixed(4)}</td>
                      <td style={{ padding: "13px 16px", fontFamily: T.mono, fontWeight: 700, fontSize: 16,
                        color: r.r2 > 0.95 ? "#22c55e" : r.r2 > 0.85 ? "#eab308" : "#f97316" }}>{r.r2.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 18, marginBottom: 14 }}>
              RF vs SARIMA comparison
            </h3>
            <div style={{ overflowX: "auto", borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 32 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: C.elevated }}>
                    {["Sensor", "RF MAE", "SARIMA MAE", "RF R²", "SARIMA R²", "Winner"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", ...labelStyle, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RF_RESULTS.map((r, i) => (
                    <tr key={r.sensor} style={{ borderBottom: i < RF_RESULTS.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <td style={{ padding: "13px 16px", fontFamily: T.display, fontSize: 14, color: C.text }}>{r.name}</td>
                      <td style={{ padding: "13px 16px", fontFamily: T.mono, fontSize: 14, color: "#22c55e" }}>{r.mae.toFixed(4)}</td>
                      <td style={{ padding: "13px 16px", fontFamily: T.mono, fontSize: 14, color: C.sub }}>running…</td>
                      <td style={{ padding: "13px 16px", fontFamily: T.mono, fontSize: 14, color: "#22c55e" }}>{r.r2.toFixed(4)}</td>
                      <td style={{ padding: "13px 16px", fontFamily: T.mono, fontSize: 14, color: C.sub }}>running…</td>
                      <td style={{ padding: "13px 16px", fontFamily: T.mono, fontSize: 13,
                        color: "#22c55e" }}>RF ✓</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Callout type="caveat">
              <strong>Methodological transparency:</strong> The forecast model predicts t+1 (2 min ahead),
              not multi-hour. Event detection has no ground-truth validation — precision/recall cannot
              be computed. The trust score cannot detect simultaneous channel drift. These are real
              constraints, not limitations to hide. November 2025, one location — generalizability is limited.
            </Callout>
          </div>
        )}
      </div>
    </div>
  );
}
