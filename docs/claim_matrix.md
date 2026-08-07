# Matriz de Claims — DataFlow (Verdade Documental)

**PT-BR:** Documento de reconciliação entre as afirmações feitas sobre o DataFlow
(context pack, docs de release, pitch) e a **realidade atual do código** na branch
`feat/dataflow-v1-hardening`. Objetivo: eliminar claims obsoletos/imprecisos antes de o
projeto ser apresentado como evidência de portfólio. Esta matriz é a fonte de verdade
para a Fase 1 (correção documental) e deve ser consultada sempre que um doc citar um
recurso estatístico ou de governança.

**EN:** Reconciliation matrix between claims made about DataFlow (context pack, release
docs, pitch) and the **current code reality** on `feat/dataflow-v1-hardening`. Goal:
remove stale/inaccurate claims before the project is presented as portfolio evidence.
This matrix is the source of truth for Phase 1 (documentary correction).

## Legenda de status
- ✅ **Verdadeiro** — confirmado no código atual.
- ⚠️ **Parcial / Impreciso** — há um núcleo verdadeiro, mas a descrição exagera ou omite.
- ❌ **Falso / Obsoleto** — o claim contraria o código.
- 🔄 **Mudou de arquitetura** — o claim antigo não descreve mais o sistema atual.

## Matriz

| # | Claim (como documentado) | Fonte(s) | Realidade no código | Status | Ação |
|---|---|---|---|---|---|
| **C1** | CORS usa `*` (wildcard) + credentials | context pack (stale) | `sec.get_allowed_origins()` retorna lista explícita (`localhost:3000`, `127.0.0.1:3000`, `dataflow.vercel.app`, `dataflow-glu1.vercel.app`) ou `DATAFLOW_ALLOWED_ORIGINS`; `main.py` usa `allow_origins=sec.get_allowed_origins()`. Nunca `"*"`. | ❌ Falso | Esclarecido aqui; `portfolio_pitch.md:127` já está correto. |
| **C2** | ANOVA "testada via Levene" (teste inexistente) | context pack (histórico) | `statistics.run_anova` chama `levene_test(groups)` (`center="median"`); se rejeita homocedasticidade, troca para Welch ANOVA. `levene_p_value` exposto na resposta. | ✅ Verdadeiro (agora) | Resolvido em Rodada 4/5 (`portfolio_pitch.md:113`). |
| **C3** | Correção de Bonferroni aplicada | final_release_summary.md:27 · release_notes_v1.3.md:14 · upgrade_summary_v2.md:9/47 | Backend-authoritative desde commit `79fb033`: `statistics.correct_pvalues` (statsmodels `multipletests`, bonferroni default; fallback manual) + `routes._apply_family_correction`; `bonferroni_alpha` exposto (0.0083 p/ 6 testes). | ✅ Verdadeiro | — |
| **C4** | Bonferroni é calculado no **frontend** (`executiveConclusions.ts`) | final_release_audit.md:133 · upgrade_summary_v2.md:23/36/47 | Frontend **consome** `bonferroni_alpha`/`corrected_significance` do backend e só refaz o cálculo se ausentes (fallback, implementado em Rodada 4). Autoridade está no backend. | 🔄 Mudou | Corrigir docs → "backend-authoritative; frontend consome + fallback". |
| **C5** | Mascaramento LGPD feito no **frontend** (`masking.ts`) | final_release_audit.md:98 | Backend mascara por padrão: `security.mask_records` (`mask_name`→`Candidato {ID}`, `mask_email`→`g***@domínio`) aplicado em `routes` via `should_mask_records()` (True salvo `local`+raw). `masking.ts` do frontend ainda existe como camada extra (defesa em profundidade). | 🔄 Mudou | Corrigir final_release_audit.md:98-101. |
| **C6** | Mascaramento "persistente" / em "CSVs de exportação por padrão" | final_release_audit.md:101 · final_release_summary.md:34 · technical_methodology.md:119 | Backend mascara antes de exportar: `GET /api/export` serve `records_out` já mascarados no modo demo e só expõe raw em `local`+`DATAFLOW_ENABLE_RAW_RECORDS=true`. Verificado por `tests/test_export.py` (demo mascara; local+raw expõe; Content-Disposition `dataflow_export.csv`). | ✅ Verdadeiro (testado) | Corrigir claim de "persistente" (não vale p/ todos os modos); CSV de exportação agora testado. |
| **C7** | Cobertura de testes ≥ 80% passa no CI | CI (`ci.yml`) impõe `pytest --cov=app --cov-fail-under=80`; medido local **89,86%**. | ✅ **Verdadeiro** — gate de 80% configurado **e comprovado no GitHub Actions** no SHA `2ecb984`: `ruff` limpo, `48 passed`, cobertura **89,86%** (≥80% atingido). Local e remoto concordam. | Ver C15. |
| **C8** | Contagem de testes hardcoded ("13 testes", "36 testes") | portfolio_pitch.md:120 · progress_2026-08-06.md (≤36) | Contagem móvel: 6 → 13 → 36 → **46** (esta branch). | ⚠️ Stale/moving | Remover hardcodes do pitch; referenciar badge CI. |
| **C9** | Welch t-test / Welch ANOVA / Cramér's V / Cohen's d / eta² | portfolio_pitch.md:75 · final_release_audit.md:129-131 | Todos em `statistics.py`; cobertos por `tests/test_statistics.py`. | ✅ Verdadeiro | — |
| **C10** | Health Score 98 (demo) | progress_2026-08-06.md:48 | Demo retorna 98 (6 dimensões ponderadas, versionado). Sem breakdown na UI. | ✅ Verdadeiro (carece de contexto) | Fase 8 (UX): ScoreBreakdown. |
| **C11** | Grupos degenerados / colunas booleanas tratados | (novo nesta branch) | `run_t_test` retorna `None` p/ grupo constante; `infer_type` classifica `boolean`; `detect_outliers` protege bool. | ✅ Verdadeiro (novo) | — |
| **C12** | Erros estruturados + request_id; 413; extensão case-insensitive; non-CSV 400 | (novo nesta branch) | `structured_error` com `request_id`; `get_max_upload_bytes` (413); extensão case-insensitive aceita; não-CSV → 400. Testado em `tests/test_api.py`. | ✅ Verdadeiro (novo) | — |
| **C13** | Veto a ML preditivo / não ranqueia candidatos | final_release_summary.md:33 · final_release_audit.md:142 | Presente na documentação de princípios; sem evidência de código que ranqueie/aprove automaticamente. | ✅ Verdadeiro (princípio) | — |
| **C14** | "O ambiente backend é reproduível em CI." | (não reclamado) | `requirements-dev.txt` (pytest/pytest-cov/ruff/httpx) + `constraints.txt` (versões fixas) instalam o mesmo conjunto em runner limpo e local; CI roda `python -m pytest` com `PYTHONPATH=.`. | ✅ **Verdadeiro** | Comprovado: backend verde no SHA `2ecb984` (48 passed, 89,86%), sem erro de httpx ou `ModuleNotFoundError: app`. |
| **C15** | "Ruff, testes e cobertura ≥80% passam no GitHub Actions." | (nível de evidência pública) | Workflow **verde no SHA `2ecb984`**: backend (Python 3.13) `ruff` limpo + `48 passed` + cobertura `89,86%` ≥80%; frontend (Node 20/22) lint/typecheck/build passam. | ✅ **Verdadeiro** | "CI configurado" virou "CI passou" — evidência pública real, não aspirational. |

## Decisões de reconciliação
- **CORS (C1):** Versões anteriores usavam wildcard; o comportamento foi endurecido na
  branch de qualidade (commit `8f97eeb`, Rodada 1+2: *"main.py: strict CORS allow_origins
  (localhost+Vercel) instead of wildcard"*). O estado atual usa apenas origens explícitas
  configuráveis por ambiente (`DATAFLOW_ALLOWED_ORIGINS`). O context pack estava
  desatualizado em relação ao código local auditado — o caso vira: encontrou problema →
  corrigiu → documentou. Nunca usar `*`+credentials.
- **Bonferroni (C3/C4):** Autoridade única no backend desde Rodada 4; o frontend é
  consumidor com fallback. Docs de release V1.3 ainda descrevem o frontend como o
  calculador — impreciso, corrigido nesta Fase 1.
- **PII (C5/C6):** Mascaramento **backend-enforced** (defesa em profundidade) e
  **demo-por-padrão**; não é "persistente em todos os modos" (`local`+raw desativa).
  O CSV de exportação agora é testado (`tests/test_export.py`): demo mascara, local+raw
  expõe. O claim de "persistente" foi corrigido nos docs (Fase 1).
- **Cobertura (C7):** Portão CI de 80% **configurado e comprovado** no GitHub Actions (SHA
  `2ecb984`): `ruff` limpo, 48 passed, 89,86% de cobertura. Local (89,86%) e remoto concordam —
  **não hardcodar no CV**; referenciar o badge de cobertura do CI.
- **Testes (C8):** Contagem é móvel; o CV/pitch deve referenciar o badge de cobertura do CI,
  não um número fixo.
- **Reprodutibilidade (C14/C15):** CI *configurado* ≠ CI *verde* — essa distinção guiou a
  correção. `httpx` declarado em `requirements-dev.txt`, `constraints.txt` trava as versões
  verificadas (instaladas também no runner limpo), e o CI roda `python -m pytest` com
  `PYTHONPATH=.`. **C14 e C15 agora ✅**: workflow verde no SHA `2ecb984` (backend 48 passed,
  89,86%; frontend Node 20/22). "CI configurado" virou "CI passou".

## Como usar esta matriz
Sempre que um doc afirmar algo sobre CORS, Levene/ANOVA, Bonferroni, PII/LGPD ou cobertura,
cruzar com o número de claim acima. Claims marcados 🔄/⚠️/❌ devem ser corrigidos no doc de
origem e apontar para este arquivo.
