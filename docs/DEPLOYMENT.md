# DataFlow — Deployment

## Local

### Option A — Windows helper

```bat
start.bat
```

Uses `%~dp0` (portable). Creates API venv / `npm install` if missing.

### Option B — Manual

```bash
# API
cd apps/api
python -m venv .venv
.\.venv\Scripts\activate   # or source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000

# Web (other terminal)
cd apps/web
cp ../../.env.example .env.local   # adjust if needed
npm install
npm run dev
```

Open http://localhost:3000 — demo: http://localhost:3000/?demo=true

## Environment

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | Web | API base including `/api` |
| `DATAFLOW_CORS_ORIGINS` | API | Comma-separated origins |
| `DATAFLOW_ALLOW_PII_REVEAL` | API | `true` only for local audit unmask |

See root `.env.example`.

## Vercel (web)

- Root directory: `apps/web`
- Framework: Next.js
- Env: `NEXT_PUBLIC_API_URL=https://<your-api>/api`
- `vercel.json` already present under `apps/web`

## Render (API)

- `apps/api/render.yaml` + `Procfile`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Free tier cold starts: mitigated by `.github/workflows/keep-warm.yml`

## Production warnings

- Do not enable `DATAFLOW_ALLOW_PII_REVEAL` on public hosts.
- Prefer synthetic / anonymized CSVs on public demos.
- Keep-warm is best-effort; first request after idle may still be slow.
