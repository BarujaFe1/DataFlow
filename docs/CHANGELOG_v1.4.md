# Changelog — DataFlow v1.4 (portfolio credibility pass)

**Date:** 2026-07-13  
**Branch:** `chore/portfolio-quality-pass`

## Summary

Eleva o case âncora de qualidade de dados: mascaramento LGPD na API, CI real, métricas de demo verificadas (sem zeros enganosos), copy honesta e roteiro de entrevista.

## Added

- `apps/api/app/services/masking.py` — PII masking at API boundary
- `health_score_breakdown` in API quality payload
- `.github/workflows/ci.yml` — pytest + lint + typecheck + build
- `LICENSE` (MIT)
- `data/demo_case_snapshot.json` + landing `DemoMetricsStrip`
- Docs: ARCHITECTURE, TECHNICAL_DECISIONS, TESTING, DEPLOYMENT, AUDIT_REPORT, HANDOFF, GUIDED_DEMO, PORTFOLIO_HANDOFF, SECURITY_NOTES
- Expanded API tests (13+)

## Fixed

- `start.bat` portable paths (no hardcoded `C:\dev\DataFlow`)
- DataTable headers use mapped schema keys (upload path)
- ExecutiveHero scroll targets (`qualidade`, `estatistica`)
- `filename is None` crash on analyze
- CORS allow-list (no `*` + credentials)
- README: relative docs links, LinkedIn identity, softened overclaims
- Showcase: removed `statsmodels` / ML hashtag / “premium” fluff
- Empty dashboard fallback UI

## Changed

- Default API `privacy_mode=masked`; reveal gated by `DATAFLOW_ALLOW_PII_REVEAL`
- Removed unused `statsmodels` dependency
- Deleted unused `HealthScore.tsx` / `RecruitmentFunnel.tsx`

## Verified demo metrics

| Metric | Value |
|--------|-------|
| Rows | 305 |
| Valid | 300 |
| Duplicates | 5 |
| Health Score | 82 |

## Deploy note

Public Vercel/Render still track `main` until this branch is merged. Document cold start and merge lag in portfolio copy.
