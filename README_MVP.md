# Air Quality ML MVP

Uses data from **[DrKoz/ACS_AQ](https://github.com/DrKoz/ACS_AQ)** (5 PM2.5 sensors, Nov 2025, 2‑minute intervals).

## Quick start

```bash
cd LewisU
pip install -r requirements.txt
python mvp_pipeline.py
```

Data is loaded directly from GitHub; no local clone needed.

## What the MVP does

1. **Load data**  
   Fetches all 5 CSVs from `https://raw.githubusercontent.com/DrKoz/ACS_AQ/main/`  
   (files: `230019.csv.csv`, `249443.csv.csv`, etc.).

2. **PM2.5 forecasting**  
   - Predicts **next timestep** PM2.5 (`pm_cf1`) using:
     - 12 lagged values (past 24 minutes)
     - Temperature and humidity (avg of A/B)
     - Hour and day of week  
   - **Temporal split:** last 20% of each sensor’s series is held out as test (no shuffle, no leakage).  
   - Model: **Random Forest**; metrics: **MAE, RMSE, R²**.

3. **Anomaly detection**  
   **Isolation Forest** on (current PM2.5, lags, temp, humidity, hour, day).  
   Reports number (and %) of anomalies per sensor (e.g. 2% contamination).

## Accuracy (example run)

- **Forecasting (next 2‑min PM2.5):**  
  Mean MAE ≈ 0.77 µg/m³, mean R² ≈ 0.92 across the 4 sensors with full data (290694 excluded).
- **Anomaly detection:**  
  ~2% of points flagged per sensor (configurable).

## Files

| File | Purpose |
|------|--------|
| `load_data.py` | Load one or all sensors from GitHub; optional cache to `data/`. |
| `mvp_pipeline.py` | Full pipeline: load → preprocess → forecast → anomaly → print metrics. |
| `requirements.txt` | pandas, numpy, scikit-learn, xgboost, matplotlib, seaborn, requests. |
| `mvp_results.txt` | Written by pipeline: per‑sensor MAE, RMSE, R². |

## Data details

- **Target variable:** `pm_cf1` (EPA‑corrected, averaged PM2.5).
- **Sensors:** 230019, 249443, 249445, 290694, 297697.  
  Sensor **290694** has far fewer rows; the pipeline uses the other four for forecasting.
- **Columns used:** `time_stamp`, `sensor_index`, `pm_cf1`, `humidity_a/b`, `temperature_a/b`.

## Reproducibility

- Temporal train/test split (no shuffle).
- Fixed `random_state=42` for RF and Isolation Forest.
- Same preprocessing and feature set for all sensors.
