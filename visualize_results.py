"""
Publication-style visualization for Air Quality MVP.
Single figure: forecast accuracy, time series, and anomaly summary.
"""

import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from load_data import load_all_sensors
from mvp_pipeline import train_evaluate_forecast, run_anomaly_detection

# Design: restrained palette, clear typography, no chartjunk
COLORS = {
    "primary": "#1a4d6d",      # dark blue
    "secondary": "#4a7c9c",   # medium blue
    "accent": "#c45a2b",      # muted orange for contrast
    "grid": "#e8eef2",
    "text": "#2c3e50",
    "fill": "#f8fafb",
}

FULL_SENSORS = [230019, 249443, 249445, 297697]
SENSOR_LABELS = {sid: str(sid) for sid in FULL_SENSORS}


def setup_style(ax):
    ax.set_facecolor(COLORS["fill"])
    ax.tick_params(axis="both", which="major", labelsize=9, color=COLORS["text"])
    for spine in ax.spines.values():
        spine.set_color(COLORS["grid"])
        spine.set_linewidth(0.8)
    ax.xaxis.label.set_color(COLORS["text"])
    ax.yaxis.label.set_color(COLORS["text"])
    ax.title.set_color(COLORS["text"])


def run_pipeline_and_plot():
    df = load_all_sensors()
    results = []
    for sensor_id in FULL_SENSORS:
        if (df["sensor_index"] == sensor_id).sum() < 5000:
            continue
        out = train_evaluate_forecast(df, sensor_id=sensor_id, n_lags=12, horizon=1, test_frac=0.2)
        results.append({"sensor_id": sensor_id, **out})
    anomaly = []
    for sensor_id in FULL_SENSORS:
        a = run_anomaly_detection(df, sensor_id=sensor_id, contamination=0.02)
        a["sensor_id"] = sensor_id
        anomaly.append(a)

    # Pick one sensor for scatter + time series (best R²)
    best = max(results, key=lambda r: r["r2"])
    sensor_id = best["sensor_id"]
    y_test = best["y_test"]
    y_pred = best["y_pred"]
    r2 = best["r2"]
    mae = best["mae"]

    fig = plt.figure(figsize=(10, 8))
    fig.patch.set_facecolor("white")
    gs = fig.add_gridspec(2, 2, hspace=0.32, wspace=0.28, left=0.08, right=0.95, top=0.90, bottom=0.08)

    # A: Predicted vs Actual (scatter)
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.scatter(y_test, y_pred, alpha=0.35, s=8, color=COLORS["primary"], edgecolors="none")
    lo = min(y_test.min(), y_pred.min())
    hi = max(y_test.max(), y_pred.max())
    pad = (hi - lo) * 0.02 or 0.5
    ax1.plot([lo - pad, hi + pad], [lo - pad, hi + pad], color=COLORS["text"], ls="--", lw=1.2, label="1:1")
    ax1.set_xlim(lo - pad, hi + pad)
    ax1.set_ylim(lo - pad, hi + pad)
    ax1.set_xlabel("Actual PM₂.₅ (µg/m³)", fontsize=10)
    ax1.set_ylabel("Predicted PM₂.₅ (µg/m³)", fontsize=10)
    ax1.set_title(f"Forecast accuracy — Sensor {sensor_id}", fontsize=11, fontweight="medium")
    ax1.text(0.05, 0.95, f"R² = {r2:.3f}\nMAE = {mae:.3f} µg/m³", transform=ax1.transAxes,
             fontsize=9, verticalalignment="top", bbox=dict(boxstyle="round,pad=0.35", facecolor="white", edgecolor=COLORS["grid"]))
    ax1.legend(loc="lower right", frameon=True, fancybox=False, edgecolor=COLORS["grid"], fontsize=9)
    ax1.grid(True, linestyle="-", linewidth=0.5, color=COLORS["grid"], alpha=0.9)
    ax1.set_aspect("equal")
    setup_style(ax1)
    ax1.text(-0.12, 1.02, "A", transform=ax1.transAxes, fontsize=12, fontweight="bold", color=COLORS["text"])

    # B: Time series (last 400 test points)
    ax2 = fig.add_subplot(gs[0, 1])
    n_show = min(400, len(y_test))
    t = np.arange(n_show)
    ax2.plot(t, y_test.values[-n_show:], color=COLORS["primary"], linewidth=1.0, label="Actual")
    ax2.plot(t, y_pred[-n_show:], color=COLORS["accent"], linewidth=0.9, alpha=0.9, label="Predicted")
    ax2.set_xlabel("Test time step (2 min interval)", fontsize=10)
    ax2.set_ylabel("PM₂.₅ (µg/m³)", fontsize=10)
    ax2.set_title("Actual vs predicted (test set)", fontsize=11, fontweight="medium")
    ax2.legend(loc="upper right", frameon=True, fancybox=False, edgecolor=COLORS["grid"], fontsize=9)
    ax2.grid(True, linestyle="-", linewidth=0.5, color=COLORS["grid"], alpha=0.9)
    setup_style(ax2)
    ax2.text(-0.12, 1.02, "B", transform=ax2.transAxes, fontsize=12, fontweight="bold", color=COLORS["text"])

    # C: MAE by sensor
    ax3 = fig.add_subplot(gs[1, 0])
    ids = [r["sensor_id"] for r in results]
    maes = [r["mae"] for r in results]
    x_pos = np.arange(len(ids))
    bars = ax3.bar(x_pos, maes, color=COLORS["secondary"], edgecolor=COLORS["primary"], linewidth=0.8)
    ax3.set_xticks(x_pos)
    ax3.set_xticklabels([str(i) for i in ids], fontsize=9)
    ax3.set_ylabel("MAE (µg/m³)", fontsize=10)
    ax3.set_xlabel("Sensor ID", fontsize=10)
    ax3.set_title("Forecast error by sensor", fontsize=11, fontweight="medium")
    ax3.grid(True, axis="y", linestyle="-", linewidth=0.5, color=COLORS["grid"], alpha=0.9)
    setup_style(ax3)
    ax3.text(-0.12, 1.02, "C", transform=ax3.transAxes, fontsize=12, fontweight="bold", color=COLORS["text"])

    # D: Anomalies per sensor
    ax4 = fig.add_subplot(gs[1, 1])
    a_ids = [a["sensor_id"] for a in anomaly if a.get("n_total", 0) > 0]
    n_anom = [a["n_anomalies"] for a in anomaly if a.get("n_total", 0) > 0]
    x_pos = np.arange(len(a_ids))
    ax4.bar(x_pos, n_anom, color=COLORS["accent"], edgecolor=COLORS["primary"], linewidth=0.8, alpha=0.85)
    ax4.set_xticks(x_pos)
    ax4.set_xticklabels([str(i) for i in a_ids], fontsize=9)
    ax4.set_ylabel("Anomaly count", fontsize=10)
    ax4.set_xlabel("Sensor ID", fontsize=10)
    ax4.set_title("Anomalies detected (Isolation Forest, 2%)", fontsize=11, fontweight="medium")
    ax4.grid(True, axis="y", linestyle="-", linewidth=0.5, color=COLORS["grid"], alpha=0.9)
    setup_style(ax4)
    ax4.text(-0.12, 1.02, "D", transform=ax4.transAxes, fontsize=12, fontweight="bold", color=COLORS["text"])

    fig.suptitle("Air quality MVP — PM₂.₅ forecasting and anomaly detection\nData: DrKoz/ACS_AQ (Nov 2025, 5 sensors)",
                 fontsize=12, fontweight="medium", color=COLORS["text"], y=0.98)
    out_path = "air_quality_mvp_figure.png"
    plt.savefig(out_path, dpi=150, facecolor="white", edgecolor="none", bbox_inches="tight")
    plt.close()
    print(f"Saved {out_path}")
    return out_path


if __name__ == "__main__":
    run_pipeline_and_plot()
