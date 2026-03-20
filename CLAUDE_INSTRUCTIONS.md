# Claude Code — Project Instructions: ACS Air Quality Monitor
## Lewis University | Ranjan, Muthukumar, Kalidindi | Mentor: Dr. Kozminski

---

## What This Project Is

A PM2.5 air quality monitoring system with three layers:
1. **Python ML pipeline** — loads real sensor data, computes trust scores, detects events, forecasts PM2.5
2. **Export script** — runs pipeline, writes results to `dashboard/public/data.json`
3. **React dashboard** — fetches `data.json`, renders everything with EPA AQI colors, trust badges, events, forecasts, Purple Air map

---

## File Map (know these)

```
load_data.py              # Fetches CSVs from https://github.com/DrKoz/ACS_AQ
ml_pipeline.py            # Trust scores, event detection, forecasting
export_dashboard_data.py  # Runs pipeline → writes dashboard/public/data.json
dashboard/src/App.jsx     # Entire React dashboard (single file)
dashboard/package.json    # Vite + React
dashboard/vercel.json     # Vercel config
writeup.tex               # LaTeX paper (Overleaf-ready)
PRESENTATION_WRITEUP.md   # Plain-English summary of what we did
requirements.txt          # Python deps
```

---

## Data Source

- **Repo:** https://github.com/DrKoz/ACS_AQ
- **5 sensors:** 230019, 249443, 249445, 290694, 297697
- **Format:** CSV files named `{id}.csv.csv` (double extension)
- **Period:** Nov 1–29, 2025, 2-minute intervals, ~85k total rows
- **Key columns:** `pm_cf1` (primary EPA-corrected PM2.5), `corr_pm2.5_a`, `corr_pm2.5_b`, `temperature_a/b`, `humidity_a/b`, `time_stamp`, `sensor_index`
- **Sensor 290694** has only 17.9% coverage — always flag it, exclude from forecasting

---

## ML Pipeline Rules

### Trust Score
```python
trust = 100 * exp(-3 * abs(A - B) / mean(A, B))
```
- Uses `corr_pm2.5_a` and `corr_pm2.5_b`
- Range 0–100. Dashboard badge: HIGH >80, MED >55, LOW ≤55
- Never change the formula without a strong reason

### Event Detection (rule-based)
- **Smoke spike:** PM2.5 rise ≥50% in 30 min AND PM2.5 >35 µg/m³
- **Rain washout:** PM2.5 drop ≥35% in 1h from non-trivial baseline
- **Sensor failure:** Trust <40% AND A/B divergence >40% for 3+ consecutive readings
- Deduplicate to 1 event per type per sensor per 2h window

### Forecasting
- Model: `RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42)`
- Features: 12 PM2.5 lags, avg temp, avg humidity, hour, day-of-week
- Split: first 80% train, last 20% test — **no shuffling ever**
- Uncertainty: 10th–90th percentile across trees (tree bootstrap)
- Actual results: MAE 0.51–1.12 µg/m³, R² 0.77–0.98

---

## AQI Conversion (EPA 2024 breakpoints — do not change)

| PM2.5 (µg/m³) | AQI    | Category                   | Color   |
|---------------|--------|----------------------------|---------|
| 0.0–9.0       | 0–50   | Good                       | #00e400 |
| 9.1–35.4      | 51–100 | Moderate                   | #ffff00 |
| 35.5–55.4     | 101–150| Unhealthy for Sensitive Groups | #ff7e00 |
| 55.5–125.4    | 151–200| Unhealthy                  | #ff0000 |
| 125.5–225.4   | 201–300| Very Unhealthy             | #8f3f97 |
| 225.5+        | 301–500| Hazardous                  | #7e0023 |

---

## Dashboard Rules

- **Real data mode:** dashboard fetches `/data.json` on load. If found → shows "REAL DATA" badge. If missing → falls back to mock data.
- **Tabs:** overview | detail | events | forecast | map (Purple Air)
- **Font:** Syne (display), Space Mono (mono/labels)
- **Background:** #080808. No white backgrounds. Keep the dark aesthetic.
- **Do not add libraries** unless absolutely necessary — zero external chart libs, all charts are hand-rolled SVG
- **Do not shuffle the data** in the forecast pipeline
- **Do not use random seeds other than 42** in scikit-learn

---

## How to Update Real Data

```bash
# 1. From project root
python3 export_dashboard_data.py    # ~30s, writes dashboard/public/data.json

# 2. Build
cd dashboard && npm run build

# 3. Deploy
npx vercel --prod
```

---

## How to Run Locally

```bash
# Python pipeline
python3 export_dashboard_data.py

# Dashboard dev server
cd dashboard && npm run dev    # http://localhost:5173
```

---

## Known Issues / Constraints

- Sensor 290694: low coverage — always warn, never include in forecasting averages
- No precipitation data in the dataset — washout events are inferred from PM2.5 drops, not confirmed by rain gauge
- Forecast horizon is next-step only (t+1, 2 min ahead) — do not claim 6h forecast accuracy in any paper
- The Purple Air map tab is an iframe embed — may be blocked by browsers. The fallback link always works.
- No lat/lon for sensors — no spatial interpolation or map pins for our specific sensors

---

## Writing and Academic Standards

- LaTeX paper: `writeup.tex` (Overleaf-ready, compiles as-is)
- All numbers in the paper come from actual pipeline output in `mvp_results.txt`
- Do not inflate metrics. R² of 0.98 is real for sensor 230019; do not generalize it to all sensors
- Event detection has no ground-truth validation — always state this honestly
- Trust score is heuristic — always state this honestly

---

## Team

- **Idhant Ranjan** — project lead, ML pipeline, dashboard
- **Arun Muthukumar** — team member
- **Varun Kalidindi** — initial data loading and EDA (see https://github.com/varunkal/VK-Lewis-Project-1)
- **Dr. Kozminski** — mentor, data provider (https://github.com/DrKoz/ACS_AQ)
