# Deploying JobGraph (step by step)

This runbook deploys the backend to **Render** and the frontend to **Vercel**, both free tier, and ends with a live smoke test.

**Time:** ~15 minutes once you have a GitHub account.

---

## 0. Push the repo to GitHub

The repo isn't committed yet (a platform outage blocked the automated commit). Run these in the project folder:

```bash
cd "/Users/veramasa/Desktop/job explorer"
git init
git add -A
git commit -m "JobGraph: graph-powered job explorer (React + Express + CognoDB)"
# create an empty repo at github.com/new named jobgraph, then:
git branch -M main
git remote add origin https://github.com/<your-username>/jobgraph.git
git push -u origin main
```

> `.gitignore` already excludes `node_modules/`, `.env`, and `dist/`, so secrets never reach GitHub.

## 1. Backend → Render (free)

1. Go to [render.com](https://render.com) and sign up / log in.
2. **New → Blueprint**, connect your GitHub account, pick the `jobgraph` repo.
3. Render reads `render.yaml` automatically — it creates the `jobgraph-server` service (root `server/`, `npm install`, `npm start`).
4. When it asks for the env vars (`sync: false`), set:
   - `COGNODB_URI` → `bolt+s://db-xxxx.databases.cognodb.cloud`
   - `COGNODB_USERNAME` → `cognodb`
   - `COGNODB_PASSWORD` → your generated password
   - `CLIENT_ORIGIN` → your Vercel URL (can set later; `*` works until then)
   - `PORT` → leave unset (Render injects it)
5. Deploy. Wait for **Deploy** to finish, then open `https://<app>.onrender.com/api/health`.

Expected (once CognoDB is reachable):
```json
{ "status": "ok", "database": { "ok": true, "configured": true, "message": "Connected to CognoDB" } }
```
If it says the URI/password failed, check the **CognoDB dashboard** for an IP allowlist — some instances only accept whitelisted IPs.

## 2. Frontend → Vercel (free)

1. Go to [vercel.com](https://vercel.com), sign up / log in, and **Add New → Project**.
2. Import the `jobgraph` repo. Set:
   - **Root Directory:** `client`
   - Framework preset: **Vite** (auto-detected)
   - Build command / output: defaults (`vite build`, `dist`)
3. Under **Environment Variables**, add:
   - `VITE_API_URL` → `https://<your-render-app>.onrender.com/api`
4. **Deploy.** The included `client/vercel.json` adds SPA rewrites, so deep links like `/jobs/job-001` work on refresh.

## 3. Seed the production database

The seed script runs against whatever `server/.env` points at. Easiest options:

**Option A — from your machine** (recommended):
```bash
cd server
# put your *production* CognoDB credentials in server/.env
npm run seed
```

**Option B — one-off command on Render:** open the service → **Shell**, then run:
```bash
npm run seed
```

You can re-run it anytime — it's `MERGE`-based and never duplicates.

## 4. Point the frontend at the backend

The `VITE_API_URL` env var is baked into the client at build time, so if you change it:
Vercel → Project → Settings → Environment Variables → update → **Redeploy**.

Then update Render's `CLIENT_ORIGIN` to your Vercel URL for tight CORS.

## 5. Smoke test

Once both are live, run this check in your browser:

- [ ] `https://<app>.onrender.com/api/health` → `{ "status": "ok", ... }`
- [ ] Your Vercel URL loads the Dashboard with real numbers (jobs, companies, skills…)
- [ ] Job Explorer filters work; a job's "Related jobs" section shows shared-skill results
- [ ] Job Match returns percentages with the "x of y skills matched" breakdown
- [ ] Graph Explorer shows a rendered neighborhood with a legend

**Paste your live URLs (frontend + backend) back into the chat and I'll run the automated browser smoke test against them** — the test environment can reach public URLs, which is why we deploy before testing.

---

## If something goes wrong

| Symptom | Fix |
|---|---|
| Health returns `configured: false` | `COGNODB_*` env vars missing on Render → Settings → Environment, redeploy |
| Health returns auth/connection error | Wrong password, or CognoDB IP allowlist; verify with the connection string from the CognoDB dashboard |
| Vercel page loads but data says offline | `VITE_API_URL` wrong or missing → update env var + redeploy |
| Related jobs / match return empty | Database not seeded yet → run `npm run seed` |
| CORS errors in the browser console | Set Render's `CLIENT_ORIGIN` to your exact Vercel URL |
