# Real Data Setup — Get Real Data on the Dashboard ASAP

## Quick Start (3 steps)

### 1. Export real data from the ML pipeline

```bash
cd /Users/idhantranjan/LewisU
python3 export_dashboard_data.py
```

This fetches data from [DrKoz/ACS_AQ](https://github.com/DrKoz/ACS_AQ), runs trust scores + event detection + forecasts, and writes `dashboard/public/data.json` (~30 seconds).

### 2. Build the dashboard

```bash
cd dashboard
npm run build
```

### 3. Deploy (or preview locally)

**Local preview:**
```bash
npm run preview
```
Open http://localhost:4173

**Deploy to Vercel:**
```bash
npx vercel --prod
```

---

## What the dashboard shows with real data

- **Overview:** 5 sensors with real PM2.5, AQI, trust scores, sparklines
- **Detail:** Time series from Nov 2025, A/B channels, temp/humidity
- **Events:** ML-detected smoke spikes, rain washout, sensor failures
- **Forecast:** Random Forest forecasts with 80% uncertainty bands
- **Map:** Purple Air regional map (embedded)

---

## Refreshing data

To update with fresh data:

```bash
python3 export_dashboard_data.py
cd dashboard && npm run build
# Redeploy if using Vercel
```

---

## If data.json is missing

The dashboard falls back to **mock data** (simulated). You'll see "LIVE · HH:MM LOCAL" instead of "REAL DATA" in the header. Run the export script to get real data.
