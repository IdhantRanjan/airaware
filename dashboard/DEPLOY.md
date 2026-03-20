# Deploy to Vercel

## Option A: From terminal (recommended)

1. **Install Vercel CLI** (one-time):
   ```bash
   npm i -g vercel
   ```
   Or use `npx vercel` — no install needed.

2. **Deploy from the dashboard folder**:
   ```bash
   cd dashboard
   npx vercel
   ```

3. Follow the prompts:
   - **Set up and deploy?** → Yes
   - **Which scope?** → Your account
   - **Link to existing project?** → No (first time)
   - **Project name?** → `acs-aq-dashboard` (or any name)
   - **Directory?** → `./` (current folder)

4. Vercel will build and give you a URL like `https://acs-aq-dashboard-xxx.vercel.app`

5. **Production deploy**:
   ```bash
   npx vercel --prod
   ```

---

## Option B: From Vercel dashboard (GitHub)

1. Push this repo to GitHub (if not already).

2. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.

3. Import your repo.

4. **Root Directory**: Click **Edit** and set to `dashboard`.

5. Vercel auto-detects Vite. Click **Deploy**.

6. Every push to `main` will auto-deploy.

---

## Quick test locally

```bash
cd dashboard
npm run dev
```

Open http://localhost:5173
