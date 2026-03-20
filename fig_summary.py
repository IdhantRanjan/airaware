#!/usr/bin/env python3
"""
Single summary figure: trust, events, forecast, scatter. Publication-style 2x2 layout.
"""

import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from load_data import load_all_sensors
from ml_pipeline import add_trust_scores, run_full_pipeline

plt.rcParams.update({
    "font.family": "sans-serif",
    "font.size": 9,
    "axes.facecolor": "#0d0d0d",
    "figure.facecolor": "#0a0a0a",
    "axes.edgecolor": "#2a2a2a",
    "axes.labelcolor": "#b0b0b0",
    "xtick.color": "#888",
    "ytick.color": "#888",
    "grid.color": "#1a1a1a",
    "grid.alpha": 0.8,
})


def main():
    df = load_all_sensors()
    df = add_trust_scores(df)
    out = run_full_pipeline()

    fig = plt.figure(figsize=(10, 9), facecolor="#0a0a0a")
    gs = fig.add_gridspec(2, 2, hspace=0.32, wspace=0.28, left=0.08, right=0.95, top=0.92, bottom=0.06)

    # A: Trust by sensor (bar)
    ax = fig.add_subplot(gs[0, 0])
    trust = df.groupby("sensor_index")["trust_score"].mean()
    colors = ["#4fc3f7", "#81c784", "#ffb74d", "#e57373", "#ba68c8"]
    x = np.arange(len(trust))
    ax.bar(x, trust.values, color=[colors[i % 5] for i in range(len(trust))], edgecolor="none")
    ax.set_xticks(x)
    ax.set_xticklabels([str(s) for s in trust.index])
    ax.set_ylabel("Mean trust score")
    ax.set_xlabel("Sensor ID")
    ax.set_title("A. Dual-sensor trust by sensor")
    ax.set_ylim(0, 100)
    ax.grid(True, axis="y", alpha=0.3)
    ax.text(-0.12, 1.02, "A", transform=ax.transAxes, fontsize=12, fontweight="bold", color="#b0b0b0")

    # B: Event types
    ax = fig.add_subplot(gs[0, 1])
    events = out["events"]
    if events:
        ev_df = pd.DataFrame(events)
        tc = ev_df["type"].value_counts()
        colors_ev = {"smoke_spike": "#ff6b35", "rain_washout": "#4fc3f7", "sensor_failure": "#ffd54f"}
        ax.bar(range(len(tc)), tc.values, color=[colors_ev.get(t, "#666") for t in tc.index], edgecolor="none")
        ax.set_xticks(range(len(tc)))
        ax.set_xticklabels([t.replace("_", " ").title() for t in tc.index])
    else:
        ax.text(0.5, 0.5, "No events detected", ha="center", va="center", transform=ax.transAxes, color="#666")
    ax.set_ylabel("Count")
    ax.set_xlabel("Event type")
    ax.set_title("B. Detected events")
    ax.grid(True, axis="y", alpha=0.3)
    ax.text(-0.12, 1.02, "B", transform=ax.transAxes, fontsize=12, fontweight="bold", color="#b0b0b0")

    # C: Forecast time series
    ax = fig.add_subplot(gs[1, 0])
    res = out["forecast_results"]
    if res:
        best = max(res, key=lambda x: x["r2"])
        n = min(300, len(best["y_test"]))
        t = best["times_test"].iloc[-n:]
        y_t = best["y_test"].iloc[-n:]
        y_p = best["y_pred"][-n:]
        y_l = best["y_lo"].iloc[-n:]
        y_h = best["y_hi"].iloc[-n:]
        ax.fill_between(t, y_l, y_h, alpha=0.25, color="#4fc3f7")
        ax.plot(t, y_t, color="#e0e0e0", linewidth=0.9, label="Actual")
        ax.plot(t, y_p, color="#4fc3f7", linewidth=0.8, alpha=0.9, label="Forecast")
        ax.set_ylabel("PM₂.₅ (µg/m³)")
        ax.set_xlabel("Time")
        ax.set_title(f"C. Forecast vs actual — Sensor {best['sensor_id']} (80% CI)")
        ax.legend(loc="upper right", fontsize=8)
    ax.grid(True, alpha=0.3)
    ax.text(-0.12, 1.02, "C", transform=ax.transAxes, fontsize=12, fontweight="bold", color="#b0b0b0")

    # D: Scatter
    ax = fig.add_subplot(gs[1, 1])
    if res:
        best = max(res, key=lambda x: x["r2"])
        y_test = best["y_test"]
        y_pred = best["y_pred"]
        ax.scatter(y_test, y_pred, alpha=0.3, s=5, color="#4fc3f7", edgecolors="none")
        lo = min(y_test.min(), y_pred.min())
        hi = max(y_test.max(), y_pred.max())
        pad = (hi - lo) * 0.02 or 0.5
        ax.plot([lo - pad, hi + pad], [lo - pad, hi + pad], color="#888", ls="--", lw=1.2, label="1:1")
        ax.set_xlim(lo - pad, hi + pad)
        ax.set_ylim(lo - pad, hi + pad)
        ax.text(0.05, 0.95, f"R² = {best['r2']:.3f}\nMAE = {best['mae']:.3f} µg/m³", transform=ax.transAxes,
                fontsize=9, va="top", color="#b0b0b0",
                bbox=dict(boxstyle="round,pad=0.3", facecolor="#111", edgecolor="#2a2a2a"))
        ax.legend(loc="lower right", fontsize=8)
    ax.set_xlabel("Actual PM₂.₅ (µg/m³)")
    ax.set_ylabel("Predicted PM₂.₅ (µg/m³)")
    ax.set_title("D. Forecast accuracy")
    ax.set_aspect("equal")
    ax.grid(True, alpha=0.3)
    ax.text(-0.12, 1.02, "D", transform=ax.transAxes, fontsize=12, fontweight="bold", color="#b0b0b0")

    fig.suptitle("Air Quality ML Pipeline — Trust, Events & Forecast\nData: DrKoz/ACS_AQ · Nov 2025 · 5 sensors",
                 fontsize=11, color="#b0b0b0", y=0.98)
    plt.savefig("fig_summary.png", dpi=150, facecolor="#0a0a0a", edgecolor="none", bbox_inches="tight")
    plt.close()
    print("Saved fig_summary.png")


if __name__ == "__main__":
    main()
