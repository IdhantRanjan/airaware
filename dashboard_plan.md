# Air Quality Monitoring Dashboard — Plan (What We Will Build)

## Purpose
A single dashboard that surfaces the real-time, trustworthy air-quality “agent”: cleaned/fused dual-sensor data with trust scores, ML-detected events (rain washout, smoke/pollution spikes, sensor failures), and short-term forecasts with calibrated uncertainty and community-facing alerts. Data source: [ACS_AQ](https://github.com/DrKoz/ACS_AQ) (5 sensors, 2-min resolution, Nov 2025).

---

## 1. Dashboard Sections (Planned)

### 1.1 Overview / At-a-Glance
- **Network summary**: Current PM2.5 (or AQI) across all 5 sensors (e.g. cards or list).
- **EPA AQI**: Use **current EPA breakpoints** (2024) for accuracy and alignment with Purple Air / AirNow:
  - Good 0–50 (0–9.0 µg/m³), Moderate 51–100 (9.1–35.4), USG 101–150 (35.5–55.4), Unhealthy 151–200 (55.5–125.4), Very Unhealthy 201–300 (125.5–225.4), Hazardous 301–500 (225.5–325.4), 501+ (325.5+).
- **Trust score** per sensor (from dual-sensor fusion): e.g. 0–100% or “High / Medium / Low” so users see which readings are most reliable.
- **Last updated** and data freshness (e.g. “Live” or “Last 2 min”).

### 1.2 Sensor Detail (Per-Sensor View)
- **Time series**: PM2.5 (µg/m³) and/or AQI over time (configurable range: 1h, 6h, 24h, 7d).
- **Dual-sensor view**: Optional trace for A vs B (e.g. `corr_pm2.5_a` / `corr_pm2.5_b`) to show agreement and drift.
- **Trust score** for that sensor over time (if we compute it per timestamp).
- **Temperature & humidity** (from `temperature_a/b`, `humidity_a/b`) as secondary series or tooltips.
- **Data quality note** for sensor 290694 (low coverage) so it’s clearly marked.

### 1.3 Events & Alerts
- **Event feed / list**: Detected events with type and time:
  - Rain-driven PM2.5 **washout** (e.g. drop in PM2.5 correlated with rain).
  - **Smoke / pollution spike** (e.g. rapid rise, sustained high).
  - **Sensor failure** (e.g. A/B divergence, flatline, or anomaly score).
- **Severity / confidence** (e.g. High/Medium/Low or 0–1) so design can emphasize critical alerts.
- **Community-facing alerts**: Summary line or banner (e.g. “Unhealthy air expected next 2 hours”) derived from forecasts + events.

### 1.4 Forecasts & Uncertainty
- **Short-term forecast**: e.g. next 1–6 hours PM2.5 (or AQI) per sensor or network average.
- **Uncertainty**: Intervals (e.g. 80% or 95%) or shaded band so “calibrated uncertainty” is visible.
- **Forecast source**: Label (e.g. “Model: [name]”) for transparency.

### 1.5 Purple Air–Style Conventions (For Accuracy)
- **Units**: PM2.5 in µg/m³; AQI as 0–500+ index with EPA category label and color.
- **Colors**: Align with EPA AQI (e.g. green / yellow / orange / red / purple / maroon) for consistency with [Purple Air](https://www.purpleair.com/) and [EPA Fire and Smoke Map](https://www.airnow.gov/).
- **Time**: UTC or local; show which. Data is 2-minute; display can aggregate (e.g. 10-min or 1-h) for readability.
- **Sensor IDs**: Show clearly (230019, 249443, 249445, 290694, 297697) so it’s traceable to ACS_AQ repo.

---

## 2. Data Sources (What We’ll Use)

- **Primary**: ACS_AQ CSVs via `load_data.py` (or cached `data/air_quality_merged.csv`).
  - Keys: `time_stamp`, `sensor_index`, `pm_cf1`, `corr_pm2.5_a`, `corr_pm2.5_b`, `pm2.5_cf_1_a`, `pm2.5_cf_1_b`, `humidity_a`, `humidity_b`, `temperature_a`, `temperature_b`.
- **Derived (to be built in pipeline)**:
  - Trust score per reading (from A/B agreement and/or variance).
  - Event labels (washout, spike, sensor failure) from ML/rule pipeline.
  - Forecasts + uncertainty intervals from forecasting model.

---

## 3. Tech Stack (Planned, Not Implemented Yet)

- **Frontend**: Web app (e.g. React/Vue or Streamlit for speed) with responsive layout.
- **Charts**: Time series (e.g. Plotly or similar) for PM2.5/AQI, forecasts, and uncertainty bands.
- **State**: Time range, selected sensor(s), optional A/B toggle.
- **Backend/API** (optional): Small service to serve aggregated + event + forecast data so dashboard stays fast and accurate.

---

## 4. Out of Scope for This Plan

- Actual ML training (anomaly, event classification, forecasting) — only **consumption** of their outputs in the dashboard.
- Real-time ingestion from Purple Air API — dashboard uses ACS_AQ data; design can still follow Purple Air’s visual language.
- Map view — no lat/lon in current data; can add later if locations are provided.

---

## 5. Success Criteria (Design Brief)

- A reader can see **current air quality and trust** at a glance.
- **Events** (washout, spikes, sensor issues) are visible and distinguishable.
- **Forecasts** with uncertainty are clearly shown and labeled.
- **Community alerts** are prominent when relevant.
- Visual style is **accurate** (EPA AQI, units, colors) and **familiar** (Purple Air–like).

Next step: use the concise visual context (below) with Claude Sonnet to plan the **visual and interaction design** in detail; then implement the dashboard to match that design.
