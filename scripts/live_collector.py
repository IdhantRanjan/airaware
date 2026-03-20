"""
AirAware Live Collector
-----------------------
Runs every 2 minutes, fetches all registered sensors from Supabase,
queries PurpleAir API (with Playwright scraper fallback), computes
trust scores + AQI, inserts readings, rolls up hourly stats, and
detects events.

Usage:
    python scripts/live_collector.py

Stop with Ctrl-C. Logs each cycle to stdout.
"""

import os
import sys
import time
import math
import logging
from datetime import datetime, timezone, timedelta
from collections import defaultdict

import requests
from dotenv import load_dotenv
from supabase import create_client

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("airaware")

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

PURPLEAIR_KEY   = os.environ["PURPLEAIR_API_KEY"]
SUPABASE_URL    = os.environ["SUPABASE_URL"]
SUPABASE_KEY    = os.environ["SUPABASE_SERVICE_KEY"]
COLLECT_INTERVAL = 120  # seconds

PA_HEADERS = {"X-API-Key": PURPLEAIR_KEY}
PA_FIELDS  = "sensor_index,name,pm2.5_cf_1,pm2.5_a,pm2.5_b,temperature,humidity,last_seen"


# ---------------------------------------------------------------------------
# EPA 2024 AQI breakpoints (PM2.5, 24-hr avg equivalent for instantaneous)
# ---------------------------------------------------------------------------
AQI_BREAKPOINTS = [
    (0.0,   9.0,    0,  50),
    (9.1,  35.4,   51, 100),
    (35.5,  55.4,  101, 150),
    (55.5, 125.4,  151, 200),
    (125.5, 225.4, 201, 300),
    (225.5, 325.4, 301, 400),
    (325.5, 500.4, 401, 500),
]

def pm_to_aqi(pm: float) -> int:
    """Convert PM2.5 (µg/m³) to AQI using EPA 2024 breakpoints."""
    if pm is None or math.isnan(pm) or pm < 0:
        return 0
    for c_lo, c_hi, i_lo, i_hi in AQI_BREAKPOINTS:
        if c_lo <= pm <= c_hi:
            return round(((i_hi - i_lo) / (c_hi - c_lo)) * (pm - c_lo) + i_lo)
    return 500

def trust_score(pm_a: float, pm_b: float) -> float:
    """100 × e^(−3 × |A−B| / mean(A,B)).  Returns 0 if inputs invalid."""
    if pm_a is None or pm_b is None:
        return 0.0
    mean = (pm_a + pm_b) / 2
    if mean <= 0:
        return 100.0
    diff = abs(pm_a - pm_b)
    return round(100.0 * math.exp(-3 * diff / mean), 2)


# ---------------------------------------------------------------------------
# PurpleAir API fetch
# ---------------------------------------------------------------------------
def fetch_sensor_api(sensor_id: int) -> dict | None:
    """Fetch a single sensor from PurpleAir API v1. Returns normalized dict or None."""
    try:
        r = requests.get(
            f"https://api.purpleair.com/v1/sensors/{sensor_id}",
            headers=PA_HEADERS,
            params={"fields": PA_FIELDS},
            timeout=10,
        )
        if r.status_code != 200:
            return None
        s = r.json().get("sensor", {})
        pm_a = s.get("pm2.5_a")
        pm_b = s.get("pm2.5_b")
        pm   = s.get("pm2.5_cf_1")
        temp_f = s.get("temperature")
        temp_c = round((temp_f - 32) * 5 / 9, 1) if temp_f is not None else None
        return {
            "sensor_id":    sensor_id,
            "pm_cf1":       pm,
            "pm_a":         pm_a,
            "pm_b":         pm_b,
            "temperature_c": temp_c,
            "humidity":     s.get("humidity"),
            "trust_score":  trust_score(pm_a, pm_b),
            "aqi":          pm_to_aqi(pm) if pm is not None else 0,
            "source":       "api",
        }
    except Exception as e:
        log.warning(f"  API error for {sensor_id}: {e}")
        return None


# ---------------------------------------------------------------------------
# Playwright scraper fallback (Arun Muthukumar)
# ---------------------------------------------------------------------------
def fetch_sensor_scraper(sensor_id: int) -> dict | None:
    """Fallback: scrape PurpleAir map page with Playwright."""
    try:
        scraper_path = os.path.join(os.path.dirname(__file__), "scraper.py")
        if not os.path.exists(scraper_path):
            return None
        import importlib.util
        spec = importlib.util.spec_from_file_location("scraper", scraper_path)
        scraper = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(scraper)
        return scraper.fetch(sensor_id)
    except Exception as e:
        log.warning(f"  Scraper error for {sensor_id}: {e}")
        return None


# ---------------------------------------------------------------------------
# Event detection
# ---------------------------------------------------------------------------
def detect_events(sensor_id: int, recent: list[dict]) -> list[dict]:
    """
    Run event detection rules on the last N readings for a sensor.
    recent: list of dicts sorted by captured_at ascending, newest last.
    """
    events = []
    if len(recent) < 3:
        return events

    pms = [r["pm_cf1"] for r in recent if r.get("pm_cf1") is not None]
    trusts = [r.get("trust_score", 100) for r in recent]
    pm_as  = [r.get("pm_a") for r in recent if r.get("pm_a") is not None]
    pm_bs  = [r.get("pm_b") for r in recent if r.get("pm_b") is not None]

    if len(pms) < 3:
        return events

    now_ts = recent[-1].get("captured_at", datetime.now(timezone.utc).isoformat())

    # --- smoke_spike: PM2.5 rises ≥50% in 30 min AND current PM > 35 ---
    # 30 min window = ~15 readings at 2-min cadence
    window = min(15, len(pms))
    pm_start = pms[-window]
    pm_now   = pms[-1]
    if pm_start > 0 and pm_now > 35 and (pm_now - pm_start) / pm_start >= 0.50:
        events.append({
            "sensor_id":   sensor_id,
            "event_type":  "smoke_spike",
            "started_at":  recent[-window].get("captured_at", now_ts),
            "severity":    "high" if pm_now > 55 else "medium",
            "confidence":  round(min(1.0, (pm_now - pm_start) / pm_start), 2),
            "pm_peak":     pm_now,
            "description": f"PM2.5 rose from {pm_start:.1f} to {pm_now:.1f} µg/m³ over {window * 2} min",
        })

    # --- rain_washout: PM drops ≥35% over 1 hour from baseline >5 ---
    hour_window = min(30, len(pms))
    pm_baseline = pms[-hour_window]
    if pm_baseline > 5 and (pm_baseline - pm_now) / pm_baseline >= 0.35:
        events.append({
            "sensor_id":   sensor_id,
            "event_type":  "rain_washout",
            "started_at":  recent[-hour_window].get("captured_at", now_ts),
            "severity":    "low",
            "confidence":  round((pm_baseline - pm_now) / pm_baseline, 2),
            "pm_peak":     pm_baseline,
            "description": f"PM2.5 dropped from {pm_baseline:.1f} to {pm_now:.1f} µg/m³ — rain washout pattern",
        })

    # --- sensor_failure: trust < 40 AND A/B divergence >40% for 3+ consecutive ---
    last3_trust = trusts[-3:]
    if all(t < 40 for t in last3_trust):
        if len(pm_as) >= 3 and len(pm_bs) >= 3:
            divergences = []
            for a, b in zip(pm_as[-3:], pm_bs[-3:]):
                if a and b and (a + b) > 0:
                    divergences.append(abs(a - b) / ((a + b) / 2))
            if divergences and all(d > 0.40 for d in divergences):
                events.append({
                    "sensor_id":   sensor_id,
                    "event_type":  "sensor_failure",
                    "started_at":  recent[-3].get("captured_at", now_ts),
                    "severity":    "high",
                    "confidence":  round(sum(divergences) / len(divergences), 2),
                    "pm_peak":     None,
                    "description": f"Channel A/B divergence >{round(sum(divergences)/len(divergences)*100)}% for 3+ consecutive readings",
                })

    return events


# ---------------------------------------------------------------------------
# Hourly rollup
# ---------------------------------------------------------------------------
def maybe_hourly_rollup(sb, sensor_id: int):
    """Compute hourly stats for the most recently completed hour."""
    now = datetime.now(timezone.utc)
    hour_start = now.replace(minute=0, second=0, microsecond=0) - timedelta(hours=1)
    hour_end   = hour_start + timedelta(hours=1)

    result = sb.table("readings") \
        .select("pm_cf1,trust_score") \
        .eq("sensor_id", sensor_id) \
        .gte("captured_at", hour_start.isoformat()) \
        .lt("captured_at", hour_end.isoformat()) \
        .execute()

    rows = result.data
    if not rows:
        return

    pms = [r["pm_cf1"] for r in rows if r.get("pm_cf1") is not None]
    trusts = [r["trust_score"] for r in rows if r.get("trust_score") is not None]

    if not pms:
        return

    mean_pm = sum(pms) / len(pms)
    variance = sum((p - mean_pm) ** 2 for p in pms) / len(pms)

    stat = {
        "sensor_id":   sensor_id,
        "hour_start":  hour_start.isoformat(),
        "pm_mean":     round(mean_pm, 3),
        "pm_max":      round(max(pms), 3),
        "pm_min":      round(min(pms), 3),
        "pm_std":      round(math.sqrt(variance), 3),
        "trust_mean":  round(sum(trusts) / len(trusts), 2) if trusts else None,
        "n_readings":  len(pms),
    }

    sb.table("hourly_stats").upsert(stat, on_conflict="sensor_id,hour_start").execute()
    log.info(f"  → hourly rollup for {sensor_id}: {len(pms)} readings, mean {mean_pm:.2f} µg/m³")


# ---------------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------------
def main():
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Load sensor IDs from Supabase
    sensor_rows = sb.table("sensors").select("id,name").execute().data
    sensor_map  = {r["id"]: r["name"] for r in sensor_rows}
    sensor_ids  = list(sensor_map.keys())
    log.info(f"Loaded {len(sensor_ids)} sensors from Supabase: {sensor_ids}")

    cycle = 0
    while True:
        cycle += 1
        cycle_start = time.time()
        now_utc = datetime.now(timezone.utc)
        is_top_of_hour = now_utc.minute < 3  # within first 3 min of hour

        log.info(f"─── Cycle {cycle}  {now_utc.strftime('%Y-%m-%d %H:%M:%S')} UTC ───")

        inserted = 0
        skipped  = 0
        failed   = 0

        for sid in sensor_ids:
            # Try API first, scraper as fallback
            reading = fetch_sensor_api(sid)
            source = "api"
            if reading is None:
                reading = fetch_sensor_scraper(sid)
                source = "scraper"

            if reading is None:
                log.warning(f"  {sid}: FAILED (both methods)")
                failed += 1
                continue

            # Timestamp = now (PurpleAir reports near-realtime)
            captured_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

            # Check for duplicate within last 3 minutes
            three_min_ago = (datetime.now(timezone.utc) - timedelta(minutes=3)).isoformat()
            dup = sb.table("readings") \
                .select("id") \
                .eq("sensor_id", sid) \
                .gte("captured_at", three_min_ago) \
                .limit(1) \
                .execute()
            if dup.data:
                skipped += 1
                continue

            row = {
                "sensor_id":     sid,
                "captured_at":   captured_at,
                "pm_cf1":        reading.get("pm_cf1"),
                "pm_a":          reading.get("pm_a"),
                "pm_b":          reading.get("pm_b"),
                "temperature_c": reading.get("temperature_c"),
                "humidity":      reading.get("humidity"),
                "trust_score":   reading.get("trust_score"),
                "aqi":           reading.get("aqi"),
                "source":        source,
            }
            sb.table("readings").insert(row).execute()
            inserted += 1

            pm   = reading.get("pm_cf1", 0) or 0
            trust = reading.get("trust_score", 0) or 0
            aqi   = reading.get("aqi", 0) or 0
            log.info(f"  {sid}: {pm:.1f} µg/m³  trust={trust:.0f}%  AQI={aqi}  src={source}")

            # Event detection on last 30 readings
            recent_result = sb.table("readings") \
                .select("*") \
                .eq("sensor_id", sid) \
                .order("captured_at", desc=False) \
                .limit(30) \
                .execute()
            recent = recent_result.data

            new_events = detect_events(sid, recent)
            for ev in new_events:
                # Avoid duplicate events within 1 hour
                one_hour_ago = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
                existing = sb.table("events") \
                    .select("id") \
                    .eq("sensor_id", sid) \
                    .eq("event_type", ev["event_type"]) \
                    .gte("started_at", one_hour_ago) \
                    .limit(1) \
                    .execute()
                if not existing.data:
                    sb.table("events").insert(ev).execute()
                    log.info(f"  ⚠  EVENT: {ev['event_type']} on {sid} — {ev['description']}")

        # Hourly rollup
        if is_top_of_hour:
            log.info("  → Running hourly rollup...")
            for sid in sensor_ids:
                try:
                    maybe_hourly_rollup(sb, sid)
                except Exception as e:
                    log.warning(f"  Rollup error for {sid}: {e}")

        elapsed = time.time() - cycle_start
        log.info(
            f"  Cycle {cycle} complete — {inserted} inserted, "
            f"{skipped} skipped, {failed} failed — {elapsed:.1f}s"
        )

        sleep_time = max(0, COLLECT_INTERVAL - elapsed)
        log.info(f"  Sleeping {sleep_time:.0f}s until next cycle...\n")
        time.sleep(sleep_time)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        log.info("Collector stopped by user.")
        sys.exit(0)
