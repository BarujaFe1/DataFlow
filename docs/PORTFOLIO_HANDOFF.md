# DataFlow — Portfolio Handoff (v1.4)

## Recommendation

**Destaque (case âncora)** — analytics engineering / data quality / full-stack analítico.  
Não arquivar. Manter acima de labs secundários; evitar sobreposição com `public-data-quality-auditor-br` (posicionar DataFlow como produto+dashboard, o outro como auditor BR/CSV público se ambos forem citados).

## Before → After

| Antes | Depois |
|-------|--------|
| Masking só no client | Masking na API + defense-in-depth UI |
| CI só keep-warm | CI lint/typecheck/pytest/build |
| Hero scroll IDs quebrados | `qualidade` / `estatistica` |
| Landing sem métricas / risco de “0” no card de portfólio | `DemoMetricsStrip` + `demo_case_snapshot.json` |
| Claims “premium / IA / masterpiece” | Copy lab-honesta |
| LinkedIn “Gustavo Felipe…” | Felipe Alirio Baruja |
| Handoff sem changelog/demo guiada | CHANGELOG + GUIDED_DEMO + este doc |

## Bugs corrected (this pass + prior)

- P0: PII no JSON público → mascarado
- P1: upload table header mismatch
- P1: ExecutiveHero scroll dead links
- P1: `start.bat` path
- P2: métricas zeradas / sem fallback estático no bloco inicial
- P2: typos/claims/README identity

## Gates (local)

```text
API:  pytest → 13+ passed
Web:  lint, typecheck, build → pass
```

## Visual / deploy evidence

- Screenshots: `assets/screenshots/01–08` (histórico; re-capturar após merge se UI mudar)
- Live: https://dataflow-sand.vercel.app — **pode estar em build antigo** até merge
- Capture guide: `docs/SCREENSHOT_CAPTURE.md`

## Limitations

- Lab, não multi-tenant production
- Render cold start
- Bonferroni narrativo no frontend (não reescreve p-values da API)
- Sem Playwright E2E ainda

## Next steps

1. Merge PR → redeploy Vercel/Render
2. Set GitHub About + topics
3. Upload social preview
4. Optional Playwright smoke `/?demo=true`
5. Sync personal portfolio card to `demo_case_snapshot.json` (never hardcode 0)

## Canonical links

- Repo: https://github.com/BarujaFe1/DataFlow
- Demo: https://dataflow-sand.vercel.app/?demo=true
- Branch: `chore/portfolio-quality-pass`
- Supermegaprompt: `C:\dev\prompts_para_port\dataflow-supermegaprompt-portfolio.md`
