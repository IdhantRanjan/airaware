#!/usr/bin/env python3
"""
Run full ML analysis and save figures. No Jupyter required.
Usage: python3 run_ml_analysis.py
"""

import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from load_data import load_all_sensors
from ml_pipeline import (
    add_trust_scores,
    detect_events,
    run_full_pipeline,
    train_forecast_with_uncertainty,
    FULL_SENSORS,
)

# Dark, technical style — matches dashboard
plt.rcParams.update({
    "font.family": "sans-serif",
    "font.size": 10,
    "axes.facecolor": "#0d0d0d",
    "figure.facecolor": "#0a0a0a",
    "axes.edgecolor": "#2a2a2a",
    "axes.labelcolor": "#b0b0b0",
    "xtick.color": "#888",
    "ytick.color": "#888",
    "grid.color": "#1a1a1a",
    "grid.alpha": 0.8,
})


def fig_trust(df):
    fig, axes = plt.subplots(1, 2, figsize=(11, 4.5), facecolor="#0a0a0a")
    sensors = [230019, 249443, 249445, 290694, 297697]
    colors = ["#4fc3f7", "#81c784", "#ffb74d", "#e57373", "#ba68c8"]
    for i, sid in enumerate(sensors):
        vals = df[df["sensor_index"] == sid]["trust_score"].dropna()
        if len(vals) > 0:
            axes[0].hist(vals, bins=50, alpha=0.6, color=colors[i], label=str(sid), edgecolor="none")
    axes[0].set_xlabel("Trust score")
    axes[0].set_ylabel("Count")
    axes[0].set_title("Trust distribution by sensor")
    axes[0].legend(loc="upper left", fontsize=8)
    axes[0].set_xlim(0, 105)
    axes[0].grid(True, alpha=0.3)

    s = df[df["sensor_index"] == 249443].copy()
    s = s.sort_values("time_stamp").tail(2000)
    axes[1].fill_between(s["time_stamp"], s["trust_score"], alpha=0.4, color="#4fc3f7")
    axes[1].plot(s["time_stamp"], s["trust_score"], color="#4fc3f7", linewidth=0.8)
    axes[1].set_xlabel("Time")
    axes[1].set_ylabel("Trust score")
    axes[1].set_title("Trust over time — Sensor 249443")
    axes[1].set_ylim(0, 105)
    axes[1].grid(True, alpha=0.3)
    plt.xticks(rotation=20)
    plt.tight_layout()
    plt.savefig("fig_trust.png", dpi=150, facecolor="#0a0a0a", edgecolor="none", bbox_inches="tight")
    plt.close()
    print("Saved fig_trust.png")


def fig_events(events):
    event_df = pd.DataFrame(events)
    if len(event_df) == 0:
        print("No events — skipping fig_events.png")
        return
    type_counts = event_df["type"].value_counts()
    fig, ax = plt.subplots(figsize=(6, 4), facecolor="#0a0a0a")
    colors = {"smoke_spike": "#ff6b35", "rain_washout": "#4fc3f7", "sensor_failure": "#ffd54f"}
    ax.bar(range(len(type_counts)), type_counts.values,
           color=[colors.get(t, "#666") for t in type_counts.index], edgecolor="none")
    ax.set_xticks(range(len(type_counts)))
    ax.set_xticklabels([t.replace("_", " ").title() for t in type_counts.index], fontsize=10)
    ax.set_ylabel("Count")
    ax.set_title("Event types detected")
    ax.grid(True, axis="y", alpha=0.3)
    plt.tight_layout()
    plt.savefig("fig_events.png", dpi=150, facecolor="#0a0a0a", edgecolor="none", bbox_inches="tight")
    plt.close()
    print("Saved fig_events.png")


def fig_forecast(results, df):
    if not results:
        print("No forecast results — skipping")
        return
    best = max(results, key=lambda x: x["r2"])
    y_test = best["y_test"]
    y_pred = best["y_pred"]
    y_lo = best["y_lo"]
    y_hi = best["y_hi"]
    times = best["times_test"]
    sid = best["sensor_id"]

    n_show = min(400, len(y_test))
    t = times.iloc[-n_show:]
    y_t = y_test.iloc[-n_show:]
    y_p = y_pred[-n_show:]
    y_l = y_lo.iloc[-n_show:]
    y_h = y_hi.iloc[-n_show:]

    fig, ax = plt.subplots(figsize=(10, 4.5), facecolor="#0a0a0a")
    ax.fill_between(t, y_l, y_h, alpha=0.25, color="#4fc3f7")
    ax.plot(t, y_t, color="#e0e0e0", linewidth=1.0, label="Actual")
    ax.plot(t, y_p, color="#4fc3f7", linewidth=0.9, alpha=0.9, label="Forecast")
    ax.set_xlabel("Time")
    ax.set_ylabel("PM₂.₅ (µg/m³)")
    ax.set_title(f"Sensor {sid}: Forecast vs actual (80% prediction interval)")
    ax.legend(loc="upper right", fontsize=9)
    ax.grid(True, alpha=0.3)
    plt.xticks(rotation=20)
    plt.tight_layout()
    plt.savefig("fig_forecast.png", dpi=150, facecolor="#0a0a0a", edgecolor="none", bbox_inches="tight")
    plt.close()
    print("Saved fig_forecast.png")


def fig_scatter(results):
    if not results:
        return
    best = max(results, key=lambda x: x["r2"])
    y_test = best["y_test"]
    y_pred = best["y_pred"]
    sid = best["sensor_id"]

    fig, ax = plt.subplots(figsize=(5, 5), facecolor="#0a0a0a")
    ax.scatter(y_test, y_pred, alpha=0.35, s=6, color="#4fc3f7", edgecolors="none")
    lo = min(y_test.min(), y_pred.min())
    hi = max(y_test.max(), y_pred.max())
    pad = (hi - lo) * 0.02 or 0.5
    ax.plot([lo - pad, hi + pad], [lo - pad, hi + pad], color="#888", ls="--", lw=1.2, label="1:1")
    ax.set_xlim(lo - pad, hi + pad)
    ax.set_ylim(lo - pad, hi + pad)
    ax.set_xlabel("Actual PM₂.₅ (µg/m³)")
    ax.set_ylabel("Predicted PM₂.₅ (µg/m³)")
    ax.set_title(f"Forecast accuracy — Sensor {sid}")
    ax.text(0.05, 0.95, f"R² = {best['r2']:.3f}\nMAE = {best['mae']:.3f} µg/m³", transform=ax.transAxes,
            fontsize=9, verticalalignment="top", color="#b0b0b0",
            bbox=dict(boxstyle="round,pad=0.35", facecolor="#111", edgecolor="#2a2a2a"))
    ax.legend(loc="lower right", fontsize=9)
    ax.grid(True, alpha=0.3)
    ax.set_aspect("equal")
    plt.tight_layout()
    plt.savefig("fig_scatter.png", dpi=150, facecolor="#0a0a0a", edgecolor="none", bbox_inches="tight")
    plt.close()
    print("Saved fig_scatter.png")


def main():
    print("Loading data...")
    df = load_all_sensors()
    df = add_trust_scores(df)

    print("Running full pipeline...")
    out = run_full_pipeline()

    print("\nTrust summary:")
    print(out["trust_summary"])

    print("\nForecast accuracy:")
    for r in out["forecast_results"]:
        print(f"  Sensor {r['sensor_id']}: MAE={r['mae']:.3f} µg/m³  R²={r['r2']:.3f}")

    print("\nGenerating figures...")
    fig_trust(df)
    fig_events(out["events"])
    fig_forecast(out["forecast_results"], df)
    fig_scatter(out["forecast_results"])

    print("\nDone.")


if __name__ == "__main__":
    main()
