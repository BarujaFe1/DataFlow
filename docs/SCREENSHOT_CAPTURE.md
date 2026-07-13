# Screenshot capture guide — DataFlow

Use synthetic demo only (`/?demo=true`). Confirm Network tab shows masked names before capturing.

## Required frames (1280×720 or 1600×900)

| # | File | Section | Notes |
|---|------|---------|-------|
| 01 | `assets/screenshots/01-hero-executive-briefing.png` | Briefing | Health Score 82 visible |
| 02 | `assets/screenshots/02-quality-cockpit.png` | Qualidade | Waterfall + issues |
| 03 | `assets/screenshots/03-quality-issues-register.png` | Issues register | Filter severity |
| 04 | `assets/screenshots/04-funnel-and-channels.png` | Funil | |
| 05 | `assets/screenshots/05-statistical-evidence.png` | Estatística | |
| 06 | `assets/screenshots/06-responsible-analytics.png` | Ética | |
| 07 | `assets/screenshots/07-records-auditability-table.png` | Tabela | Masked PII |
| 08 | `assets/screenshots/08-pdf-executive-report.png` | PDF print | |

## Checklist

- [ ] No real personal data
- [ ] Numbers match `data/demo_case_snapshot.json`
- [ ] LGPD badge / masked cells visible where relevant
- [ ] Replace outdated screenshots after merge to `main`

Existing assets in `assets/screenshots/` are acceptable until re-capture; document date in PR if unchanged.
