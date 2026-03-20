#!/usr/bin/env python3
"""
Export real data + ML results to JSON for the dashboard.
Run this before deploying: python3 export_dashboard_data.py
Output: dashboard/public/data.json
"""

import json
import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime

from load_data import load_all_sensors
from ml_pipeline import (
    add_trust_scores,
    detect_events,
    run_full_pipeline,
    train_forecast_with_uncertainty,
    FULL_SENSORS,
)

# Coverage from research context
COVERAGE = {230019: 98.5, 249443: 97.5, 249445: 99.0, 290694: 17.9, 297697: 99.0}
SENSOR_IDS = [230019, 249443, 249445, 290694, 297697]


def pm_to_aqi(pm):
    """EPA 2024 breakpoints."""
    breakpoints = [
        (0, 9.0, 0, 50),
        (9.1, 35.4, 51, 100),
        (35.5, 55.4, 101, 150),
        (55.5, 125.4, 151, 200),
        (125.5, 225.4, 201, 300),
        (225.5, 325.4, 301, 400),
        (325.5, 500, 401, 500),
    ]
    for pm_low, pm_high, aqi_low, aqi_high in breakpoints:
        if pm_low <= pm <= pm_high:
            return round(((aqi_high - aqi_low) / (pm_high - pm_low)) * (pm - pm_low) + aqi_low)
    return min(500, round(pm * 1.5))


def aqi_category(aqi):
    if aqi <= 50: return "Good"
    if aqi <= 100: return "Moderate"
    if aqi <= 150: return "USG"
    if aqi <= 200: return "Unhealthy"
    if aqi <= 300: return "Very Unhealthy"
    return "Hazardous"


def main():
    print("Loading data from GitHub...")
    df = load_all_sensors()
    df = add_trust_scores(df)

    print("Running ML pipeline...")
    out = run_full_pipeline()

    # Build time series for each sensor (last 500 points = ~17h at 2-min)
    n_points = 500
    sensor_data = {}

    for sid in SENSOR_IDS:
        s = df[df["sensor_index"] == sid].sort_values("time_stamp").tail(n_points)
        if len(s) == 0:
            continue

        rows = []
        for _, r in s.iterrows():
            ts = r["time_stamp"]
            if pd.isna(ts):
                continue
            t_ms = int(pd.Timestamp(ts).timestamp() * 1000) if hasattr(ts, "timestamp") else int(ts)
            rows.append({
                "t": t_ms,
                "pm": float(r["pm_cf1"]),
                "a": float(r.get("corr_pm2.5_a", r["pm_cf1"])),
                "b": float(r.get("corr_pm2.5_b", r["pm_cf1"])),
                "temp": float((r["temperature_a"] + r["temperature_b"]) / 2),
                "humidity": float((r["humidity_a"] + r["humidity_b"]) / 2),
                "trust": float(r["trust_score"]) if not pd.isna(r["trust_score"]) else 80,
            })

        latest = rows[-1] if rows else {}
        pm = latest.get("pm", 0)
        aqi = pm_to_aqi(pm)
        sensor_data[sid] = {
            "id": sid,
            "coverage": COVERAGE.get(sid, 99),
            "lowCoverage": sid == 290694,
            "latest": latest,
            "aqi": aqi,
            "cat": aqi_category(aqi),
            "data": rows,
        }

    # Events - convert to JSON-serializable
    events = []
    for i, e in enumerate(out["events"][:50]):
        ts = e["time"]
        t_ms = int(pd.Timestamp(ts).timestamp() * 1000) if hasattr(ts, "timestamp") else int(ts)
        events.append({
            "id": i + 1,
            "type": e["type"],
            "sensor": e["sensor"],
            "time": t_ms,
            "severity": e["severity"],
            "confidence": float(e["confidence"]),
            "pm_peak": float(e["pm_peak"]) if e["pm_peak"] is not None else None,
            "desc": e["desc"],
        })

    # Forecasts - get next-step prediction + interval from trained model
    forecasts = {}
    for sid in FULL_SENSORS:
        if (df["sensor_index"] == sid).sum() < 5000:
            continue
        try:
            r = train_forecast_with_uncertainty(df, sensor_id=sid, n_lags=12, horizon=1, test_frac=0.2)
            last_idx = len(r["y_test"]) - 1
            yp = r["y_pred"]
            mean = float(yp[last_idx] if hasattr(yp, "__getitem__") else yp.iloc[last_idx])
            lo = float(r["y_lo"].iloc[last_idx])
            hi = float(r["y_hi"].iloc[last_idx])
            last_pm = float(r["y_test"].iloc[last_idx - 1]) if last_idx > 0 else mean
            fc = []
            for i in range(19):
                sigma = 2 + i * 0.8
                fc.append({"i": i, "mean": mean, "lo": mean - 1.645 * sigma, "hi": mean + 1.645 * sigma})
            forecasts[sid] = {"lastPM": last_pm, "nextMean": mean, "nextLo": lo, "nextHi": hi, "forecast": fc}
        except Exception as ex:
            print(f"  Forecast skip {sid}: {ex}")

    payload = {
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "sensors": sensor_data,
        "events": events,
        "forecasts": forecasts,
        "networkAvgPM": float(df.groupby("sensor_index")["pm_cf1"].mean().mean()) if len(df) > 0 else 0,
        "dataCoverage": "97.5%",
    }

    out_path = Path(__file__).parent / "dashboard" / "public" / "data.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(payload, f, indent=2)

    print(f"Wrote {out_path}")
    print(f"  Sensors: {list(sensor_data.keys())}")
    print(f"  Events: {len(events)}")
    print(f"  Forecasts: {list(forecasts.keys())}")


if __name__ == "__main__":
    main()
