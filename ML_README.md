# Air Quality ML Pipeline

Machine learning components that feed the monitoring dashboard. Data from [DrKoz/ACS_AQ](https://github.com/DrKoz/ACS_AQ).

## What We Built

| Component | Method | Output |
|-----------|--------|--------|
| **Trust score** | Exponential decay from A/B channel divergence: `100 · e^(-3·|A-B|/x̄)` | 0–100 per reading |
| **Event detection** | Rule-based: smoke spike (≥50% rise), rain washout (≥35% drop), sensor failure (sustained A/B divergence) | Event list with type, time, severity |
| **Forecast** | Random Forest + 12 lags, temp, humidity, hour, day | Point forecast + 80% interval (tree bootstrap) |

## Files

- **`ml_pipeline.py`** — Core logic: `add_trust_scores()`, `detect_events()`, `train_forecast_with_uncertainty()`, `run_full_pipeline()`
- **`ML_Analysis.ipynb`** — Jupyter notebook with explanations and inline figures
- **`run_ml_analysis.py`** — Standalone script: runs pipeline and saves `fig_trust.png`, `fig_events.png`, `fig_forecast.png`, `fig_scatter.png`
- **`fig_summary.py`** — Single 2×2 summary figure: `fig_summary.png`

## Run

```bash
# Generate all figures (no Jupyter)
python3 run_ml_analysis.py

# Or combined summary only
python3 fig_summary.py

# Or open ML_Analysis.ipynb and run all cells
```

## Results (Nov 2025 data)

- **Trust:** Mean 78–84% across sensors; sensor 290694 slightly lower (low coverage)
- **Forecast:** MAE 0.5–1.1 µg/m³, R² 0.77–0.98 depending on sensor
- **Events:** Smoke spikes, rain washout, sensor failures detected and deduplicated

## Dashboard Integration

The React dashboard consumes:

- `trust_score` per reading (from `add_trust_scores`)
- Event list (from `detect_events`)
- Forecast + lo/hi bands (from `train_forecast_with_uncertainty`)

Wire these to your API or data layer; the pipeline outputs Python dicts/DataFrames.
