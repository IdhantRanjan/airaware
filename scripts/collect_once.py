"""
collect_once.py
---------------
Single-cycle collector. Fetches all sensors from Supabase, queries
PurpleAir API, inserts new readings, runs event detection.

Designed to be called on a schedule (GitHub Actions every 5 min,
cron job, etc.). No while loop — just one pass.

Usage:
    python scripts/collect_once.py
"""

import os
import sys
import math
import logging
from datetime import datetime, timezone, timedelta

import requests
from supabase import create_client

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("collect_once")

# ── Load env (works both locally from .env and from GH Actions secrets) ──
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))
except ImportError:
    pass  # dotenv not needed in CI — env vars already set

PURPLEAIR_KEY    = os.environ["PURPLEAIR_API_KEY"]
SUPABASE_URL     = os.environ["SUPABASE_URL"]
SUPABASE_KEY     = os.environ["SUPABASE_SERVICE_KEY"]

PA_HEADERS = {"X-API-Key": PURPLEAIR_KEY}


# ── AQI / trust helpers ───────────────────────────────────────────────────────
AQI_BREAKS = [
    (0, 9.0, 0, 50), (9.1, 35.4, 51, 100), (35.5, 55.4, 101, 150),
    (55.5, 125.4, 151, 200), (125.5, 225.4, 201, 300), (225.5, 500, 301, 500),
]

def pm_to_aqi(pm):
    if not pm or math.isnan(pm) or pm < 0:
        return 0
    for c_lo, c_hi, i_lo, i_hi in AQI_BREAKS:
        if c_lo <= pm <= c_hi:
            return round(((i_hi - i_lo) / (c_hi - c_lo)) * (pm - c_lo) + i_lo)
    return 500

def trust_score(pm_a, pm_b):
    if pm_a is None or pm_b is None:
        return 0.0
    mean = (pm_a + pm_b) / 2
    if mean <= 0:
        return 100.0
    return round(100.0 * math.exp(-3 * abs(pm_a - pm_b) / mean), 2)


# ── PurpleAir fetch ───────────────────────────────────────────────────────────
def fetch_sensor(sensor_id):
    try:
        r = requests.get(
            f"https://api.purpleair.com/v1/sensors/{sensor_id}",
            headers=PA_HEADERS,
            params={"fields": "sensor_index,pm2.5_cf_1,pm2.5_a,pm2.5_b,temperature,humidity"},
            timeout=10,
        )
        if r.status_code != 200:
            return None
        s = r.json().get("sensor", {})
        pm_a  = s.get("pm2.5_a")
        pm_b  = s.get("pm2.5_b")
        pm    = s.get("pm2.5_cf_1")
        temp_f = s.get("temperature")
        return {
            "pm_cf1":        pm,
            "pm_a":          pm_a,
            "pm_b":          pm_b,
            "temperature_c": round((temp_f - 32) * 5 / 9, 1) if temp_f is not None else None,
            "humidity":      s.get("humidity"),
            "trust_score":   trust_score(pm_a, pm_b),
            "aqi":           pm_to_aqi(pm) if pm is not None else 0,
        }
    except Exception as e:
        log.warning(f"  {sensor_id}: API error — {e}")
        return None


# ── Event detection (last 30 readings) ───────────────────────────────────────
def detect_events(sensor_id, recent):
    events = []
    if len(recent) < 3:
        return events

    pms    = [r["pm_cf1"] for r in recent if r.get("pm_cf1") is not None]
    trusts = [r.get("trust_score", 100) for r in recent]
    pm_as  = [r.get("pm_a")  for r in recent if r.get("pm_a")  is not None]
    pm_bs  = [r.get("pm_b")  for r in recent if r.get("pm_b")  is not None]

    if len(pms) < 3:
        return events

    now_ts = recent[-1].get("captured_at", datetime.now(timezone.utc).isoformat())

    # Smoke spike
    window    = min(15, len(pms))
    pm_start  = pms[-window]
    pm_now    = pms[-1]
    if pm_start > 0 and pm_now > 35 and (pm_now - pm_start) / pm_start >= 0.50:
        events.append({
            "sensor_id":  sensor_id,
            "event_type": "smoke_spike",
            "started_at": recent[-window].get("captured_at", now_ts),
            "severity":   "high" if pm_now > 55 else "medium",
            "confidence": round(min(1.0, (pm_now - pm_start) / pm_start), 2),
            "pm_peak":    pm_now,
            "description": f"PM2.5 rose from {pm_start:.1f} to {pm_now:.1f} µg/m³ in {window * 2} min",
        })

    # Rain washout
    hour_window = min(30, len(pms))
    pm_baseline = pms[-hour_window]
    if pm_baseline > 5 and (pm_baseline - pm_now) / pm_baseline >= 0.35:
        events.append({
            "sensor_id":  sensor_id,
            "event_type": "rain_washout",
            "started_at": recent[-hour_window].get("captured_at", now_ts),
            "severity":   "low",
            "confidence": round((pm_baseline - pm_now) / pm_baseline, 2),
            "pm_peak":    pm_baseline,
            "description": f"PM2.5 dropped {round((pm_baseline-pm_now)/pm_baseline*100)}% — washout pattern",
        })

    # Sensor failure
    last3 = trusts[-3:]
    if all(t < 40 for t in last3) and len(pm_as) >= 3 and len(pm_bs) >= 3:
        divs = []
        for a, b in zip(pm_as[-3:], pm_bs[-3:]):
            if a and b and (a + b) > 0:
                divs.append(abs(a - b) / ((a + b) / 2))
        if divs and all(d > 0.40 for d in divs):
            events.append({
                "sensor_id":  sensor_id,
                "event_type": "sensor_failure",
                "started_at": recent[-3].get("captured_at", now_ts),
                "severity":   "high",
                "confidence": round(sum(divs) / len(divs), 2),
                "pm_peak":    None,
                "description": f"A/B channel divergence {round(sum(divs)/len(divs)*100)}% for 3+ readings",
            })

    return events


# ── Hourly rollup ─────────────────────────────────────────────────────────────
def maybe_hourly_rollup(sb, sensor_id):
    now        = datetime.now(timezone.utc)
    is_top_of_hour = now.minute < 6   # within first 6 min of any hour
    if not is_top_of_hour:
        return

    hour_start = now.replace(minute=0, second=0, microsecond=0) - timedelta(hours=1)
    hour_end   = hour_start + timedelta(hours=1)

    rows = sb.table("readings").select("pm_cf1,trust_score") \
        .eq("sensor_id", sensor_id) \
        .gte("captured_at", hour_start.isoformat()) \
        .lt("captured_at",  hour_end.isoformat()) \
        .execute().data

    pms    = [r["pm_cf1"] for r in rows if r.get("pm_cf1") is not None]
    trusts = [r["trust_score"] for r in rows if r.get("trust_score") is not None]
    if not pms:
        return

    mean_pm  = sum(pms) / len(pms)
    variance = sum((p - mean_pm) ** 2 for p in pms) / len(pms)

    sb.table("hourly_stats").upsert({
        "sensor_id":  sensor_id,
        "hour_start": hour_start.isoformat(),
        "pm_mean":    round(mean_pm, 3),
        "pm_max":     round(max(pms), 3),
        "pm_min":     round(min(pms), 3),
        "pm_std":     round(math.sqrt(variance), 3),
        "trust_mean": round(sum(trusts) / len(trusts), 2) if trusts else None,
        "n_readings": len(pms),
    }, on_conflict="sensor_id,hour_start").execute()

    log.info(f"  ↺ Hourly rollup for {sensor_id}: {len(pms)} readings, mean {mean_pm:.2f} µg/m³")


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    sensor_rows = sb.table("sensors").select("id,name").execute().data
    sensor_map  = {r["id"]: r["name"] for r in sensor_rows}
    sensor_ids  = list(sensor_map.keys())

    log.info(f"Collecting {len(sensor_ids)} sensors at "
             f"{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} UTC")

    inserted = skipped = failed = 0
    now_utc  = datetime.now(timezone.utc).replace(microsecond=0)

    for sid in sensor_ids:
        reading = fetch_sensor(sid)
        if reading is None:
            failed += 1
            log.warning(f"  {sid}: FAILED")
            continue

        # Duplicate guard: skip if a reading exists in the last 4 minutes
        four_min_ago = (now_utc - timedelta(minutes=4)).isoformat()
        dup = sb.table("readings").select("id") \
            .eq("sensor_id", sid) \
            .gte("captured_at", four_min_ago) \
            .limit(1).execute()
        if dup.data:
            skipped += 1
            continue

        sb.table("readings").insert({
            "sensor_id":     sid,
            "captured_at":   now_utc.isoformat(),
            "pm_cf1":        reading["pm_cf1"],
            "pm_a":          reading["pm_a"],
            "pm_b":          reading["pm_b"],
            "temperature_c": reading["temperature_c"],
            "humidity":      reading["humidity"],
            "trust_score":   reading["trust_score"],
            "aqi":           reading["aqi"],
            "source":        "api",
        }).execute()
        inserted += 1

        log.info(f"  {sid} ({sensor_map[sid][:25]}): "
                 f"{(reading['pm_cf1'] or 0):.1f} µg/m³  "
                 f"trust={reading['trust_score']:.0f}%  AQI={reading['aqi']}")

        # Event detection
        recent = sb.table("readings").select("*") \
            .eq("sensor_id", sid) \
            .order("captured_at", desc=False) \
            .limit(30).execute().data

        for ev in detect_events(sid, recent):
            one_hr_ago = (now_utc - timedelta(hours=1)).isoformat()
            existing = sb.table("events").select("id") \
                .eq("sensor_id", sid).eq("event_type", ev["event_type"]) \
                .gte("started_at", one_hr_ago).limit(1).execute()
            if not existing.data:
                sb.table("events").insert(ev).execute()
                log.info(f"  ⚠  EVENT: {ev['event_type']} — {ev['description']}")

        # Hourly rollup (only runs near top of hour)
        maybe_hourly_rollup(sb, sid)

    log.info(f"Done — {inserted} inserted, {skipped} skipped (recent dup), {failed} failed")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        log.error(f"Collection failed: {e}")
        sys.exit(1)
