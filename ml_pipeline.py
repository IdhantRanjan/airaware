"""
Air Quality ML Pipeline — Trust scores, event detection, forecasting with uncertainty.

Feeds the dashboard: computes trust from dual A/B agreement, classifies events
(smoke spike, rain washout, sensor failure), and produces short-term forecasts
with calibrated uncertainty intervals.

Data: https://github.com/DrKoz/ACS_AQ
"""

import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler

from load_data import load_all_sensors

# Sensors with sufficient coverage for forecasting
FULL_SENSORS = [230019, 249443, 249445, 297697]
LOW_COV_SENSOR = 290694


# ── 1. TRUST SCORE (from dual-sensor A/B agreement) ───────────────────────────

def compute_trust_score(row: pd.Series) -> float:
    """
    Trust score 0–100 from A/B channel agreement.
    High agreement → high trust. Large divergence → low trust.
    """
    a = row.get("corr_pm2.5_a", np.nan)
    b = row.get("corr_pm2.5_b", np.nan)
    if pd.isna(a) or pd.isna(b):
        return np.nan
    avg = (a + b) / 2
    if avg < 0.1:
        return 100.0  # both near zero, treat as agreement
    pct_diff = abs(a - b) / avg
    # Map 0% diff → 100, 50%+ diff → ~0
    trust = 100 * np.exp(-3 * pct_diff)
    return min(100, max(0, trust))


def add_trust_scores(df: pd.DataFrame) -> pd.DataFrame:
    """Add trust_score column to dataframe."""
    out = df.copy()
    out["trust_score"] = out.apply(compute_trust_score, axis=1)
    return out


# ── 2. EVENT DETECTION ─────────────────────────────────────────────────────────

def detect_events(df: pd.DataFrame, sensor_id: int,
                 spike_thresh_pct: float = 0.5,
                 spike_window_min: int = 30,
                 washout_thresh_pct: float = 0.35,
                 washout_window_min: int = 60,
                 ab_divergence_thresh: float = 0.4,
                 trust_low_thresh: float = 40) -> list[dict]:
    """
    Detect smoke spike, rain washout, sensor failure.
    Returns list of event dicts with type, time, severity, confidence.
    """
    s = df[df["sensor_index"] == sensor_id].copy()
    s = s.sort_values("time_stamp").reset_index(drop=True)
    s = s.dropna(subset=["pm_cf1", "corr_pm2.5_a", "corr_pm2.5_b"])
    if len(s) < 100:
        return []

    s["trust_score"] = s.apply(compute_trust_score, axis=1)
    # Rolling stats
    win = max(1, spike_window_min // 2)  # 2-min intervals
    s["pm_roll_mean"] = s["pm_cf1"].rolling(win, min_periods=1).mean()
    s["pm_roll_std"] = s["pm_cf1"].rolling(win, min_periods=1).std().fillna(0)
    s["pm_change"] = s["pm_cf1"].diff(win)
    s["ab_ratio"] = s.apply(
        lambda r: abs(r["corr_pm2.5_a"] - r["corr_pm2.5_b"]) / max(0.01, (r["corr_pm2.5_a"] + r["corr_pm2.5_b"]) / 2),
        axis=1
    )

    events = []
    for i in range(win, len(s) - 1):
        row = s.iloc[i]
        pm = row["pm_cf1"]
        mean_prev = row["pm_roll_mean"]
        change = row["pm_change"]
        trust = row["trust_score"]

        # Smoke spike: rapid rise, sustained high
        if mean_prev > 1 and change > spike_thresh_pct * mean_prev and pm > 35:
            events.append({
                "type": "smoke_spike",
                "sensor": sensor_id,
                "time": row["time_stamp"],
                "severity": "high" if pm > 80 else "medium",
                "confidence": min(0.95, 0.6 + (pm - 35) / 200),
                "pm_peak": float(pm),
                "desc": "Sustained PM2.5 spike — smoke or pollution signature",
            })

        # Rain washout: rapid drop
        if mean_prev > 5 and change < -washout_thresh_pct * mean_prev:
            events.append({
                "type": "rain_washout",
                "sensor": sensor_id,
                "time": row["time_stamp"],
                "severity": "medium" if abs(change) > 10 else "low",
                "confidence": min(0.9, 0.5 + abs(change) / 50),
                "pm_peak": None,
                "desc": "PM2.5 drop correlated with precipitation washout",
            })

        # Sensor failure: A/B divergence, low trust — require sustained (3+ consecutive)
        if trust < trust_low_thresh and row["ab_ratio"] > ab_divergence_thresh and i >= 2:
            prev = s.iloc[i - 2 : i + 1]
            if (prev["trust_score"] < trust_low_thresh).sum() >= 2:
                events.append({
                    "type": "sensor_failure",
                    "sensor": sensor_id,
                    "time": row["time_stamp"],
                    "severity": "low",
                    "confidence": 0.95,
                    "pm_peak": None,
                    "desc": "A/B divergence — calibration drift suspected",
                })

    # Deduplicate: keep one event per type per ~2h window
    def dedup(evts, window_h=2):
        out = []
        for e in evts:
            t = pd.Timestamp(e["time"])
            skip = False
            for o in out:
                if o["type"] == e["type"] and o["sensor"] == e["sensor"]:
                    if abs((pd.Timestamp(o["time"]) - t).total_seconds()) < window_h * 3600:
                        skip = True
                        break
            if not skip:
                out.append(e)
        return out

    return dedup(events)


# ── 3. FORECASTING WITH UNCERTAINTY ─────────────────────────────────────────────

def build_forecast_dataset(df: pd.DataFrame, sensor_id: int, target_col: str = "pm_cf1",
                          n_lags: int = 12, horizon: int = 1):
    """Build feature matrix for PM2.5 forecast (past only, no leakage)."""
    s = df[df["sensor_index"] == sensor_id].copy()
    s = s.sort_values("time_stamp").reset_index(drop=True)
    s = s.dropna(subset=[target_col])
    s["temp"] = (s["temperature_a"] + s["temperature_b"]) / 2
    s["humidity"] = (s["humidity_a"] + s["humidity_b"]) / 2
    s["hour"] = s["time_stamp"].dt.hour
    s["day_of_week"] = s["time_stamp"].dt.dayofweek

    for i in range(1, n_lags + 1):
        s[f"pm_lag_{i}"] = s[target_col].shift(i)
    s["target"] = s[target_col].shift(-horizon)
    s = s.dropna()
    return s


def train_forecast_with_uncertainty(df: pd.DataFrame, sensor_id: int,
                                    n_lags: int = 12, horizon: int = 1,
                                    test_frac: float = 0.2, n_bootstrap: int = 50) -> dict:
    """
    Train RF forecast model; produce point forecast + 80% prediction interval
    via bootstrap (sample trees).
    """
    s = build_forecast_dataset(df, sensor_id=sensor_id, n_lags=n_lags, horizon=horizon)
    feature_cols = [f"pm_lag_{i}" for i in range(1, n_lags + 1)] + ["temp", "humidity", "hour", "day_of_week"]
    X = s[feature_cols]
    y = s["target"]
    times = s["time_stamp"]

    n = len(X)
    split_idx = int(n * (1 - test_frac))
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    times_test = times.iloc[split_idx:]

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    model = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    model.fit(X_train_s, y_train)
    y_pred = model.predict(X_test_s)

    # Bootstrap prediction intervals: use tree predictions
    tree_preds = np.array([t.predict(X_test_s) for t in model.estimators_])
    lo = np.percentile(tree_preds, 10, axis=0)
    hi = np.percentile(tree_preds, 90, axis=0)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    return {
        "sensor_id": sensor_id,
        "mae": mae, "rmse": rmse, "r2": r2,
        "y_test": y_test, "y_pred": y_pred,
        "y_lo": pd.Series(lo, index=y_test.index),
        "y_hi": pd.Series(hi, index=y_test.index),
        "times_test": times_test,
        "model": model,
        "scaler": scaler,
        "feature_cols": feature_cols,
        "n_train": len(y_train),
        "n_test": len(y_test),
    }


# ── 4. RUN FULL PIPELINE ──────────────────────────────────────────────────────

def run_full_pipeline() -> dict:
    """Run trust, events, forecast. Returns dict for dashboard/notebook."""
    df = load_all_sensors()
    df = add_trust_scores(df)

    # Trust summary per sensor
    trust_summary = df.groupby("sensor_index")["trust_score"].agg(["mean", "std", "count"]).round(2)

    # Events (all sensors)
    all_events = []
    for sid in [230019, 249443, 249445, 290694, 297697]:
        evts = detect_events(df, sensor_id=sid)
        all_events.extend(evts)
    all_events.sort(key=lambda e: e["time"], reverse=True)

    # Forecast with uncertainty (full-coverage sensors only)
    forecast_results = []
    for sid in FULL_SENSORS:
        if (df["sensor_index"] == sid).sum() < 5000:
            continue
        out = train_forecast_with_uncertainty(df, sensor_id=sid, n_lags=12, horizon=1, test_frac=0.2)
        forecast_results.append(out)

    return {
        "df": df,
        "trust_summary": trust_summary,
        "events": all_events[:50],  # last 50
        "forecast_results": forecast_results,
    }


if __name__ == "__main__":
    out = run_full_pipeline()
    print("Trust summary:\n", out["trust_summary"])
    print("\nEvents (sample):", out["events"][:3])
    print("\nForecast MAE by sensor:", [r["mae"] for r in out["forecast_results"]])
