# Visual Context for Design — Air Quality Monitoring Dashboard

*Concise brief for Claude Sonnet to plan the visual and interaction design. Do not implement yet.*

---

## One-Line Idea
Real-time air-quality dashboard for a low-cost PM2.5 sensor network: **trust scores** from dual-sensor fusion, **ML-detected events** (rain washout, smoke spikes, sensor failures), and **short-term forecasts with uncertainty** plus community alerts.

---

## Data We Have
- **Source**: [ACS_AQ](https://github.com/DrKoz/ACS_AQ) — 5 sensors (IDs: 230019, 249443, 249445, 290694, 297697), 2-minute resolution, Nov 1–29, 2025.
- **Variables**: `pm_cf1` (EPA-corrected PM2.5, µg/m³), dual channels A/B (`corr_pm2.5_a/b`, `pm2.5_cf_1_a/b`), `temperature_a/b`, `humidity_a/b`, `time_stamp`, `sensor_index`.
- **Caveat**: Sensor 290694 has ~18% coverage; others ~97–99%.

---

## Visual Language (Accuracy + Purple Air Feel)
- **EPA AQI**: Convert PM2.5 → AQI using **current EPA breakpoints** (2024). Use standard AQI colors: Good (green), Moderate (yellow), Unhealthy for Sensitive Groups (orange), Unhealthy (red), Very Unhealthy (purple), Hazardous (maroon).
- **Units**: Show PM2.5 in µg/m³; AQI as 0–500+ with category label.
- **Trust**: Each reading/sensor has a **trust score** (from A/B agreement). Show as badge, color intensity, or scale (e.g. High / Medium / Low) so “trustworthy” is visible at a glance.
- **Time**: Support 1h / 6h / 24h / 7d; indicate timezone (e.g. “Local” or “UTC”).

---

## Core Screens / Areas

1. **Overview**
   - All 5 sensors: current PM2.5 (or AQI), trust score, maybe mini sparkline.
   - One “network” or “worst sensor” summary for alerts.
   - Clear “last updated” and data freshness.

2. **Sensor Detail**
   - Single-sensor time series: PM2.5 and/or AQI over time.
   - Optional: A vs B channels to show agreement/drift.
   - Secondary: temp/humidity (small series or tooltip).
   - Mark sensor 290694 as low coverage where relevant.

3. **Events & Alerts**
   - List or feed of detected events with **type** (washout / smoke spike / sensor failure), **time**, **sensor(s)**, **severity/confidence**.
   - Community-facing **alert banner** when forecasts or events warrant (e.g. “Unhealthy air next 2 hours”).

4. **Forecasts**
   - Short-term (e.g. 1–6 h) PM2.5 or AQI with **uncertainty band** (e.g. 80% or 95% interval).
   - Per sensor or network average; label the model/source.

---

## What Design Should Decide
- Layout: single scroll vs tabs vs sidebar navigation.
- Chart types: line for time series; how to show A/B and uncertainty (bands, dashed lines).
- Event list: compact table vs timeline vs cards.
- Alert banner: placement, when it appears, and hierarchy with event list.
- Responsiveness: desktop-first vs mobile-inclusive.
- Accessibility: contrast, labels, and keyboard/screen-reader use.

---

## Out of Scope for This Doc
- Implementation (backend, frontend stack, APIs).
- ML model design (only that the dashboard *consumes* trust scores, event labels, and forecast + uncertainty).
- Map view (no lat/lon in current dataset).

Use this plus `dashboard_plan.md` and `research_context_for_submission.md` to propose a concrete **visual and interaction design** (wireframes, component hierarchy, and key interactions). After that, we implement the dashboard to match.
