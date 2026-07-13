# DataFlow — Demo guiada (3–5 minutos)

Roteiro para entrevista, LinkedIn ou revisão de portfólio. Use dados sintéticos (`processo_seletivo_demo.csv`).

## Pré-requisitos

- Live: https://dataflow-sand.vercel.app/?demo=true  
  (API Render pode ter cold start ~30–60s na primeira chamada)
- Local: `start.bat` ou API `:8000` + `apps/web` `:3000`

## Minuto a minuto

| Tempo | Ação | O que dizer |
|-------|------|-------------|
| 0:00–0:30 | Abrir `/?demo=true` | “Lab de qualidade de dados: CSV → score → evidência → PDF.” |
| 0:30–1:30 | Briefing / Health Score **82** | “305 ingeridos, 300 válidos, 5 duplicatas. Score = 100 − penalidades documentadas.” |
| 1:30–2:30 | Qualidade & Issues | “Issues register prioriza e-mails inválidos e outliers — acionável, não só gráfico.” |
| 2:30–3:30 | Evidência estatística | “Welch / χ² / ANOVA exploratórios; limitações explícitas; sem decisão individual.” |
| 3:30–4:30 | Tabela + Network (opcional) | “PII mascarado no payload da API (`Candidato CAN…`). Reveal só com env local.” |
| 4:30–5:00 | PDF / fechamento | “Relatório executivo para narrativa de processo. Trade-off: lab, não SaaS multi-tenant.” |

## Checklist do entrevistado

- [ ] Números batem com `data/demo_case_snapshot.json`
- [ ] Não chamar de “enterprise / IA de contratação / produção certificada”
- [ ] Mencionar CI: lint + typecheck + pytest + build
- [ ] Mencionar limitação: cold start Render; merge da branch de qualidade no deploy

## Dataset mínimo reproduzível

```text
data/seed/processo_seletivo_demo.csv
data/demo_case_snapshot.json
```

Regenerar (opcional): `python data/seed/generate_seed.py` — depois revalidar snapshot com pytest.
