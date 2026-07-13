# DataFlow — Testing

## API (pytest)

```bash
cd apps/api
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
pip install -r requirements.txt
set PYTHONPATH=.
pytest -q
```

Coverage focus:

| Area | What we assert |
|------|----------------|
| Parser / mapper / cleaner | Happy paths + empty CSV |
| Health score | Penalties, breakdown, bounds |
| Masking | Name/email/salary + env-gated reveal |
| Routes | `/health`, `/demo` masked PII, reject non-CSV |
| Inference | Welch t-test smoke |

## Web

```bash
cd apps/web
npm ci
npm run lint
npm run typecheck
npm run build
```

There is no Jest/Vitest suite yet — CI gates on lint + `tsc --noEmit` + production build.

## Manual demo checklist

1. `start.bat` or API + `npm run dev`
2. Open `http://localhost:3000/?demo=true`
3. Confirm Health Score waterfall matches API breakdown
4. Confirm table columns populate after Portuguese header upload
5. Network tab: `name` / `email` masked in JSON
6. Generate PDF report with privacy on

## Future tests (roadmap)

- Golden health-score fixtures with exact penalty math
- Playwright smoke for demo path
- Unit tests for `maskSalary` / insights generators (Vitest)
