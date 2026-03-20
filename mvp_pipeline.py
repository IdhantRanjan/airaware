"""
Air Quality ML MVP — accurate pipeline using data from https://github.com/DrKoz/ACS_AQ

- Loads all 5 sensor CSVs from GitHub
- Preprocesses with temporal features and lags (no future leakage)
- Trains PM2.5 forecasting model with strict temporal train/test split
- Runs anomaly detection (Isolation Forest)
- Reports MAE, RMSE, R² and anomaly counts
"""

import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler

# Use our data loader
from load_data import load_all_sensors, SENSOR_IDS

# --------------- 1. Load data from GitHub ---------------
def load_data():
    print("Loading data from GitHub (DrKoz/ACS_AQ)...")
    df = load_all_sensors()
    return df


# --------------- 2. Preprocess: single-sensor series for forecasting ---------------
def build_forecast_dataset(df: pd.DataFrame, sensor_id: int, target_col: str = "pm_cf1",
                           n_lags: int = 12, horizon: int = 1):
    """
    Build feature matrix for predicting PM2.5 at t+horizon using only past info.
    horizon=1 means predict next timestep (next 2 min).
    """
    s = df[df["sensor_index"] == sensor_id].copy()
    s = s.sort_values("time_stamp").reset_index(drop=True)
    s = s.dropna(subset=[target_col])
    # Weather: use average of A and B
    s["temp"] = (s["temperature_a"] + s["temperature_b"]) / 2
    s["humidity"] = (s["humidity_a"] + s["humidity_b"]) / 2
    s["hour"] = s["time_stamp"].dt.hour
    s["day_of_week"] = s["time_stamp"].dt.dayofweek
    s["minute"] = s["time_stamp"].dt.minute

    # Lags: only past values (no leakage)
    for i in range(1, n_lags + 1):
        s[f"pm_lag_{i}"] = s[target_col].shift(i)
    # Target: future value
    s["target"] = s[target_col].shift(-horizon)
    s = s.dropna()
    return s


def get_forecast_features_target(s: pd.DataFrame, n_lags: int):
    """Return X and y for forecasting; feature set is only past + time + weather."""
    feature_cols = [f"pm_lag_{i}" for i in range(1, n_lags + 1)] + ["temp", "humidity", "hour", "day_of_week"]
    X = s[feature_cols]
    y = s["target"]
    return X, y, s["time_stamp"]


# --------------- 3. Temporal split ---------------
def temporal_split(X: pd.DataFrame, y: pd.Series, test_frac: float = 0.2):
    """Split by time: first (1-test_frac) train, last test_frac test. No shuffle."""
    n = len(X)
    split_idx = int(n * (1 - test_frac))
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    return X_train, X_test, y_train, y_test


# --------------- 4. Train and evaluate forecast model ---------------
def train_evaluate_forecast(df: pd.DataFrame, sensor_id: int = 230019,
                            n_lags: int = 12, horizon: int = 1, test_frac: float = 0.2):
    """Train RF regressor for PM2.5 forecast; report MAE, RMSE, R²."""
    s = build_forecast_dataset(df, sensor_id=sensor_id, n_lags=n_lags, horizon=horizon)
    X, y, times = get_forecast_features_target(s, n_lags)

    X_train, X_test, y_train, y_test = temporal_split(X, y, test_frac=test_frac)
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    model = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    model.fit(X_train_s, y_train)
    y_pred = model.predict(X_test_s)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    return {
        "mae": mae,
        "rmse": rmse,
        "r2": r2,
        "n_train": len(y_train),
        "n_test": len(y_test),
        "y_test": y_test,
        "y_pred": y_pred,
    }


# --------------- 5. Anomaly detection ---------------
def run_anomaly_detection(df: pd.DataFrame, sensor_id: int = 230019,
                          contamination: float = 0.02, n_lags: int = 6):
    """Isolation Forest on (pm_cf1, temp, humidity, hour, lags). Returns anomaly count and labels."""
    s = build_forecast_dataset(df, sensor_id=sensor_id, n_lags=n_lags, horizon=1)
    feature_cols = [f"pm_lag_{i}" for i in range(1, n_lags + 1)] + ["temp", "humidity", "hour", "day_of_week"]
    # Add current pm_cf1 for anomaly detection
    s["pm_current"] = s["pm_cf1"]
    feature_cols = ["pm_current"] + feature_cols
    X = s[feature_cols].dropna()
    if len(X) == 0:
        return {"n_anomalies": 0, "n_total": 0}
    scaler = StandardScaler()
    X_s = scaler.fit_transform(X)
    clf = IsolationForest(contamination=contamination, random_state=42, n_estimators=100)
    labels = clf.fit_predict(X_s)
    n_anomalies = (labels == -1).sum()
    return {"n_anomalies": int(n_anomalies), "n_total": len(X), "anomaly_frac": n_anomalies / len(X)}


# --------------- 6. Main ---------------
def main():
    print("=" * 60)
    print("Air Quality MVP — Data: https://github.com/DrKoz/ACS_AQ")
    print("=" * 60)

    df = load_data()
    print(f"Total rows: {len(df)}")
    print(f"Sensors: {df['sensor_index'].unique().tolist()}")
    print(f"Date range: {df['time_stamp'].min()} to {df['time_stamp'].max()}")
    print(f"pm_cf1: count={df['pm_cf1'].notna().sum()}, mean={df['pm_cf1'].mean():.2f}, std={df['pm_cf1'].std():.2f}")
    print()

    # Use sensors with enough data (exclude 290694 for forecasting to avoid gaps)
    full_sensors = [230019, 249443, 249445, 297697]
    results = []

    for sensor_id in full_sensors:
        n_rows = (df["sensor_index"] == sensor_id).sum()
        if n_rows < 5000:
            print(f"Skipping sensor {sensor_id} (only {n_rows} rows)")
            continue
        print(f"--- Sensor {sensor_id} (n={n_rows}) ---")
        metrics = train_evaluate_forecast(df, sensor_id=sensor_id, n_lags=12, horizon=1, test_frac=0.2)
        results.append({"sensor_id": sensor_id, **metrics})
        print(f"  MAE: {metrics['mae']:.4f} µg/m³  RMSE: {metrics['rmse']:.4f} µg/m³  R²: {metrics['r2']:.4f}")
        print()

    # Summary forecasting accuracy
    if results:
        all_mae = [r["mae"] for r in results]
        all_r2 = [r["r2"] for r in results]
        print("Forecasting summary (next-step PM2.5):")
        print(f"  Mean MAE across sensors: {np.mean(all_mae):.4f} µg/m³")
        print(f"  Mean R² across sensors:  {np.mean(all_r2):.4f}")
        print()

    # Anomaly detection
    print("Anomaly detection (Isolation Forest, contamination=2%):")
    for sensor_id in full_sensors:
        out = run_anomaly_detection(df, sensor_id=sensor_id, contamination=0.02)
        print(f"  Sensor {sensor_id}: {out['n_anomalies']} anomalies in {out['n_total']} points ({100*out.get('anomaly_frac',0):.1f}%)")
    print()

    # Save a simple summary
    summary_path = Path("mvp_results.txt")
    with open(summary_path, "w") as f:
        f.write("Air Quality MVP Results\n")
        f.write("Data: https://github.com/DrKoz/ACS_AQ\n\n")
        for r in results:
            f.write(f"Sensor {r['sensor_id']}: MAE={r['mae']:.4f}, RMSE={r['rmse']:.4f}, R²={r['r2']:.4f}\n")
    print(f"Results written to {summary_path}")
    print("Done.")


if __name__ == "__main__":
    main()
