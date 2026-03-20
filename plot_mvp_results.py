"""
Plot forecast accuracy: predicted vs actual PM2.5 for one sensor.
Run after mvp_pipeline.py (uses same data and model).
"""

import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from load_data import load_all_sensors
from mvp_pipeline import (
    build_forecast_dataset,
    get_forecast_features_target,
    temporal_split,
    train_evaluate_forecast,
)

def main():
    df = load_all_sensors()
    sensor_id = 230019
    n_lags = 12
    test_frac = 0.2

    out = train_evaluate_forecast(df, sensor_id=sensor_id, n_lags=n_lags, horizon=1, test_frac=test_frac)
    y_test = out["y_test"]
    y_pred = out["y_pred"]

    fig, axes = plt.subplots(1, 2, figsize=(10, 4))

    # Left: scatter actual vs predicted
    axes[0].scatter(y_test, y_pred, alpha=0.3, s=5)
    mn = min(y_test.min(), y_pred.min())
    mx = max(y_test.max(), y_pred.max())
    axes[0].plot([mn, mx], [mn, mx], "k--", label="Perfect")
    axes[0].set_xlabel("Actual PM2.5 (µg/m³)")
    axes[0].set_ylabel("Predicted PM2.5 (µg/m³)")
    axes[0].set_title(f"Sensor {sensor_id}: Forecast vs Actual")
    axes[0].legend()
    axes[0].set_aspect("equal")

    # Right: time series slice (last 500 test points)
    n_show = min(500, len(y_test))
    x = np.arange(n_show)
    axes[1].plot(x, y_test.values[-n_show:], label="Actual", alpha=0.8)
    axes[1].plot(x, y_pred[-n_show:], label="Predicted", alpha=0.8)
    axes[1].set_xlabel("Test time index")
    axes[1].set_ylabel("PM2.5 (µg/m³)")
    axes[1].set_title("Last 500 test points")
    axes[1].legend()

    plt.tight_layout()
    plt.savefig("mvp_forecast_plot.png", dpi=120)
    print("Saved mvp_forecast_plot.png")


if __name__ == "__main__":
    main()
