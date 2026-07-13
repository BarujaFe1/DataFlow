# DataFlow — Audit Report (Portfolio Quality Pass)

**Date:** 2026-07-13  
**Branch:** `chore/portfolio-quality-pass`  
**Auditor role:** architecture, full-stack, data/analytics, QA, UX, DX, docs, recruiter lens, security/privacy

---

## Executive summary

DataFlow is a strong portfolio anchor: Next.js 15 + FastAPI pipeline for CSV profiling, cleaning, health scoring, statistical inference, LGPD-aware presentation, and executive PDF reporting. Product narrative and visual polish are above average.

Engineering maturity lagged the pitch: keep-warm-only CI, thin tests, client-only masking, broken `start.bat` paths, upload table header mismatch, missing `typecheck` script, and README `file:///` links. This pass closes those gaps without changing the product thesis.

**Current grade (pre-fix):** **6.5 / 10**  
**Target grade (post-pass):** **8.5–9 / 10** for a public portfolio lab (not production SaaS)

---

## Main risks

| Risk | Severity | Notes |
|------|----------|-------|
| PII in API JSON while UI claims LGPD | High | Masking was presentation-only |
| Upload path shows empty/wrong columns | High | Raw headers vs mapped record keys |
| `start.bat` hardcodes `C:\dev\DataFlow` | High | Clone fails first-run |
| No CI for lint/test/build | Medium | Recruiter red flag |
| Thin health-score tests | Medium | Core claim under-tested |
| CORS `*` + credentials | Medium | Invalid/problematic browser pattern |
| Public demo cold start (Render free) | Medium | Mitigated, not eliminated |
| README overclaims vs repo signals | Medium | typecheck script, MIT without LICENSE |

---

## Quick wins

1. Relative `start.bat` paths  
2. Schema keys for DataTable headers  
3. Server-side PII masking + honest privacy copy  
4. `typecheck` script + GitHub Actions CI  
5. Relative docs links + MIT `LICENSE`  
6. Health-score breakdown from API (single source of truth)  
7. Guard `filename is None` + pipeline try/except  
8. Expand pytest (score math, routes, masking)

---

## Structural improvements

- Return `health_score_breakdown` from profiler; stop client recompute with hardcoded `305`  
- Separate domain masking service in API  
- Document architecture, testing, deployment, technical decisions  
- Align Bonferroni story (frontend conclusions vs API `significance`)  
- Optional: remove unused `statsmodels` dependency

---

## Bugs found

1. `start.bat` absolute path to non-existent `C:\dev\DataFlow`  
2. DataTable `headers={available_headers}` = raw CSV keys; `data` = mapped schema → broken uploads  
3. `file.filename.endswith('.csv')` when `filename` is `None` → AttributeError  
4. Pipeline exceptions become opaque 500s  
5. README links `file:///C:/dev/DataFlow/...`  
6. README claims `npm run typecheck` but script missing  
7. MIT claimed without `LICENSE` file  
8. `QualityFlags` waterfall fallback `305` couples to demo size  
9. `html lang="en"` for PT-BR product  
10. Dead components: `HealthScore.tsx`, `RecruitmentFunnel.tsx`  
11. `main.py` `__main__` module path `main:app` incorrect for package layout  
12. CORS `allow_origins=["*"]` with `allow_credentials=True`

---

## Execution plan

| Phase | Work |
|-------|------|
| 1 | Audit report (this file) |
| 2 | Install, lint, test, build |
| 3 | Bug fixes + tests |
| 4 | Architecture docs, CI, env/gitignore |
| 5 | UX/privacy honesty + empty/error states |
| 6 | README portfolio rewrite |
| 7 | CI workflow |
| 8 | Deploy docs (Vercel + Render) |
| 9 | HANDOFF + commit + push |

---

## Final checklist

- [x] Install path documented and verified (API venv; web npm)
- [x] Build / lint / typecheck / pytest gated locally (CI added)
- [x] Main bugs fixed (`start.bat`, table headers, filename, masking)
- [x] README portfolio-grade (interview + LGPD honesty + relative docs)
- [x] Docs: ARCHITECTURE, TECHNICAL_DECISIONS, TESTING, DEPLOYMENT, HANDOFF, AUDIT
- [x] CI: lint + typecheck + pytest + build
- [x] `.env.example` + `.gitignore` safe
- [x] Essential tests for health score + masking
- [x] UX/privacy review
- [x] Commit + push on `chore/portfolio-quality-pass`
