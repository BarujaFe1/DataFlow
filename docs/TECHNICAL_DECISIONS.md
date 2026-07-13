# DataFlow — Technical Decisions

## Why FastAPI + Next.js (not a notebook)

Notebooks prove analysis once. DataFlow proves a **product loop**: upload → map → clean → score → infer → mask → report. Recruiters can click a live demo; engineers can read typed services and tests.

## Health score as explainable penalties

Score starts at 100 and subtracts capped penalties (missingness, duplicates, empty/constant columns, invalid emails, outliers). The API returns `health_score_breakdown` so the waterfall UI does not recompute with magic constants (previously hardcoded `305` demo rows).

**Trade-off:** Heuristic score, not a certified DQ framework (Great Expectations / Soda). Chosen for clarity in interviews and demos.

## Mapping before cleaning

Brazilian CSVs use heterogeneous headers. Auto-detect + wizard mapping to a canonical schema keeps the rest of the pipeline deterministic.

**Trade-off:** Schema is recruitment-specific. Extending to arbitrary domains needs a pluggable schema pack.

## SciPy inference is exploratory

χ² / Welch t / ANOVA ship with explicit limitations. Bonferroni adjustment is applied in the **frontend executive conclusions** layer to reduce false-positive storytelling — not silently rewriting API p-values.

**Trade-off:** Two layers can disagree on “significance” wording. Documented honestly for interviews.

## LGPD-aware masking at the API boundary

Client-only masking looked good in screenshots but leaked PII in Network tab. Masking now happens in `services/masking.py` before serialization. Reveal mode is env-gated.

**Trade-off:** Aggregates (e.g. median salary) still reflect real cleaned values — by design for analytics. Individual rows are protected in public payloads.

## Removed unused `statsmodels`

Declared but unused. Dropped to shrink install surface; SciPy covers V1 tests.

## CORS allow-list instead of `*` + credentials

Invalid/problematic browser pattern replaced with localhost + production Vercel origin, overridable via `DATAFLOW_CORS_ORIGINS`.

## Keep-warm cron vs always-on API

Render free cold starts hurt demos. Cron pings `/api/health` every 14 minutes. Not perfect; documented in deployment notes.

## Why no auth in V1

Portfolio lab + synthetic seed data. Real uploads to a public API remain discouraged; README warns operators.
