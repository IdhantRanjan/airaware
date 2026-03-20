"""
Load air quality data from GitHub: https://github.com/DrKoz/ACS_AQ
Uses raw CSV URLs. Primary target: pm_cf1 (EPA-corrected PM2.5).
"""

import pandas as pd
from pathlib import Path

BASE_URL = "https://raw.githubusercontent.com/DrKoz/ACS_AQ/main"
SENSOR_IDS = ["230019", "249443", "249445", "290694", "297697"]
# Filenames on repo use double extension: 230019.csv.csv
FILENAME_TEMPLATE = "{sensor_id}.csv.csv"


def load_sensor(sensor_id: str) -> pd.DataFrame:
    """Load one sensor CSV from GitHub."""
    url = f"{BASE_URL}/{FILENAME_TEMPLATE.format(sensor_id=sensor_id)}"
    df = pd.read_csv(url)
    df["time_stamp"] = pd.to_datetime(df["time_stamp"])
    return df


def load_all_sensors(sensor_ids=None) -> pd.DataFrame:
    """Load all sensor CSVs and concatenate. Drops rows with missing pm_cf1."""
    if sensor_ids is None:
        sensor_ids = SENSOR_IDS
    frames = []
    for sid in sensor_ids:
        try:
            df = load_sensor(sid)
            frames.append(df)
        except Exception as e:
            print(f"Warning: could not load sensor {sid}: {e}")
    if not frames:
        raise RuntimeError("No sensor data loaded.")
    out = pd.concat(frames, ignore_index=True)
    out = out.sort_values(["sensor_index", "time_stamp"]).reset_index(drop=True)
    return out


def load_and_cache(cache_dir: str = "data") -> pd.DataFrame:
    """Load from GitHub and optionally save to cache dir."""
    Path(cache_dir).mkdir(exist_ok=True)
    df = load_all_sensors()
    cache_path = Path(cache_dir) / "air_quality_merged.csv"
    df.to_csv(cache_path, index=False)
    print(f"Cached merged data to {cache_path} ({len(df)} rows)")
    return df


if __name__ == "__main__":
    df = load_and_cache()
    print(df.info())
    print(df.groupby("sensor_index").agg({"pm_cf1": ["count", "mean", "std"]}).round(4))
