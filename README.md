<div align="center">
  <img src="./assets/icon.png" alt="DataFlow Logo" width="120" height="120" />

  <h1>DataFlow</h1>

  <p><strong>Profiling, limpeza, evidência estatística e governança responsável para dados tabulares.</strong></p>
  <p><strong>Responsible data profiling, cleaning and statistical evidence for tabular datasets.</strong></p>

  <p>
    <a href="#pt-br">PT-BR</a>
     · 
    <a href="#english">English</a>
     · 
    <a href="#live-demo">Live Demo</a>
     · 
    <a href="#stack">Stack</a>
     · 
    <a href="#architecture">Architecture</a>
     · 
    <a href="#quick-start">Quick Start</a>
     · 
    <a href="#author">Author</a>
  </p>

  <p>
    <img alt="Next.js-15" src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
    <img alt="SciPy" src="https://img.shields.io/badge/SciPy-8CAAE6?style=for-the-badge&logo=scipy&logoColor=white" />
    <img alt="Status-Lab%20demo" src="https://img.shields.io/badge/Status-Lab%20demo-22C55E?style=for-the-badge" />
  </p>

  <p>
    <a href="https://dataflow-sand.vercel.app"><strong>Live Demo</strong></a>
     · 
    <a href="https://github.com/BarujaFe1/DataFlow"><strong>Repo</strong></a>
     · 
    <a href="https://barujafe.vercel.app/"><strong>Portfolio</strong></a>
     · 
    <a href="https://www.linkedin.com/in/barujafe/"><strong>LinkedIn</strong></a>
  </p>

  <p>
    <a href="https://github.com/BarujaFe1/DataFlow/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/BarujaFe1/DataFlow/actions/workflows/ci.yml/badge.svg?branch=main" /></a>
    <a href="https://dataflow-glu1.onrender.com/api/health"><img alt="API Health" src="https://img.shields.io/website?url=https%3A%2F%2Fdataflow-glu1.onrender.com%2Fapi%2Fhealth&label=API%20Live" /></a>
    <a href="https://github.com/BarujaFe1/DataFlow/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-22C55E?style=flat-square" /></a>
    <img alt="Tests" src="https://img.shields.io/badge/Pytest-13%20passing-3776AB?style=flat-square" />
  </p>
</div>


<p align="center">
  <img src="./assets/hero-cover.png" alt="DataFlow overview" width="100%" />
</p>

> **Lab / demo notice:** public Vercel surface is a **data-quality lab**. Scores and statistical tests support interpretation — they are **not** compliance certification or automated data-governance for production PII workflows.

---

## PT-BR

### Visão geral
O **DataFlow** é um laboratório local-first / full-stack para **ingestão de CSV**, profiling, score de saúde explicável, limpeza auditável, evidência estatística (SciPy/statsmodels) e mascaramento LGPD-aware — com briefing executivo.

### Problema
Times recebem CSVs “sujos”, geram gráficos sem trilha de qualidade e tomam decisão com p-valores soltos — sem registro de issues, before/after nem limites de interpretação.

### Para quem
Analistas de dados, data engineers em estágio inicial de produto e profissionais que precisam **explicar qualidade** antes de modelar ou reportar.

### Funcionalidades
- Upload / ingestão tabular e profiling por coluna
- **Data Quality Score** com flags explicáveis
- Registro de issues de qualidade e auditoria before/after de limpeza
- Evidência estatística com correção de Bonferroni (quando aplicável)
- Mascaramento orientado a PII / LGPD (lab)
- Briefing executivo e visualizações (Recharts)
- API FastAPI (`apps/api`) + web Next.js (`apps/web`)

### Escopo e limites (honestos)
- Lab / demo — **não** é suite enterprise de data governance
- Score e testes são **suporte à interpretação**, não certificação
- Mascaramento ajuda demonstração responsável; não substitui DPO/processo legal
- Deploy público pode rodar em modo demo; SciPy completo depende do backend local/host

---

## English

### Overview
**DataFlow** is a local-first / full-stack lab for **CSV ingestion**, profiling, an explainable health score, auditable cleaning, statistical evidence (SciPy/statsmodels) and LGPD-aware masking — plus an executive briefing.

### Problem
Teams get messy CSVs, chart without a quality trail and decide from lonely p-values — with no issue register, before/after audit or interpretation limits.

### Who it is for
Data analysts, early-stage data engineers and professionals who must **explain data quality** before modeling or reporting.

### Features
- Tabular upload/ingestion and per-column profiling
- Explainable **Data Quality Score** and quality flags
- Quality issues register and before/after cleaning audit
- Statistical evidence with Bonferroni correction when applicable
- PII / LGPD-oriented masking (lab)
- Executive briefing and Recharts visuals
- FastAPI (`apps/api`) + Next.js web (`apps/web`)

### Scope and honest limits
- Lab / demo — **not** an enterprise data-governance suite
- Scores/tests support interpretation — not certification
- Masking aids responsible demos; it does not replace legal process
- Public deploy may be demo-mode; full SciPy needs the API host

---

## Live Demo

| Surface | URL |
|---|---|
| **Public lab** | [https://dataflow-sand.vercel.app](https://dataflow-sand.vercel.app) |
| **GitHub** | see Repo badge above |

**How to try:** open the lab → load a sample/CSV → inspect quality score & issues → review statistical evidence → skim the executive briefing.



## Screenshots

<table>
  <tr>
    <td width="50%"><img src="./assets/screenshots/01-hero-executive-briefing.png" alt="Executive briefing" /><br /><sub><strong>Executive briefing</strong></sub></td>
    <td width="50%"><img src="./assets/screenshots/02-quality-cockpit.png" alt="Quality cockpit" /><br /><sub><strong>Quality cockpit</strong></sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="./assets/screenshots/03-quality-issues-register.png" alt="Issues register" /><br /><sub><strong>Issues register</strong></sub></td>
    <td width="50%"><img src="./assets/screenshots/04-funnel-and-channels.png" alt="Funnel & channels" /><br /><sub><strong>Funnel & channels</strong></sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="./assets/screenshots/05-statistical-evidence.png" alt="Statistical evidence" /><br /><sub><strong>Statistical evidence</strong></sub></td>
    <td width="50%"><img src="./assets/hero-cover.png" alt="Hero cover" /><br /><sub><strong>Hero cover</strong></sub></td>
  </tr>
</table>



## Stack

| Layer | Technology |
|---|---|
| Web | Next.js 15, React 19, TypeScript, Tailwind, Recharts |
| API | FastAPI, Pandas, NumPy, SciPy, statsmodels, Pydantic |
| Ops | `start.bat` (Windows), pytest for API |

---

## Architecture

```txt
apps/
  web/     Next.js UI (briefing, quality cockpit, charts)
  api/     FastAPI profiling / cleaning / stats services
assets/    icon, hero, screenshots
data/      sample datasets (when present)
```

Flow: CSV → parse/profile → quality flags + score → optional clean → statistical evidence → executive report.

---

## Quick Start

**Prerequisites:** Node.js 20+, Python 3.10+, Git.

### Windows integrated
```bash
.\start.bat
```

### Manual
```bash
# API
cd apps/api
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Web (other terminal)
cd apps/web
npm install
npm run dev
```

---

## Technical decisions

- **Explainable score + issue register** over a single opaque metric
- **Bonferroni-aware inference** to reduce naive false positives in multi-test screens
- **LGPD-aware masking in-lab** to practice responsible handling of sensitive columns
- Split **Next.js + FastAPI** so heavy stats stay on Python

---

## Roadmap

- Deeper cleaning recipes with stronger audit diffs
- More sample case studies and report templates
- Tighter parity between demo mode and full API
- Optional auth for shared lab workspaces

---

## Author

**Felipe Alirio Baruja** — data / product / full-stack portfolio.

- Portfolio: [https://barujafe.vercel.app/](https://barujafe.vercel.app/)
- GitHub: [https://github.com/BarujaFe1](https://github.com/BarujaFe1)
- LinkedIn: [https://www.linkedin.com/in/barujafe/](https://www.linkedin.com/in/barujafe/)


## License

---

## 💼 Valor para Portfólio / Portfolio Value

O DataFlow demonstra competências críticas para funções de **Analytics Engineering, Data Science e Data Engineering**:
- **Design de Produto de Dados:** Tradução de necessidades de negócios em recursos interativos premium.
- **Rigor Analítico:** Aplicação consciente de estatística sem falsos positivos.
- **Governança Ética:** Conformidade ativa com LGPD e design de IA responsável.
- **Arquitetura Full-Stack:** Comunicação limpa entre Next.js 15 e FastAPI em monorepo.

---

## 📚 Documentação Complementar

- [docs/portfolio_pitch.md](docs/portfolio_pitch.md) — roteiros de entrevista, LinkedIn e guia de apresentação.
- [docs/final_release_audit.md](docs/final_release_audit.md) — auditoria detalhada de código, schemas e testes.
- [docs/technical_methodology.md](docs/technical_methodology.md) — documentação aprofundada da lógica matemática.
- [docs/release_notes_v1.3.md](docs/release_notes_v1.3.md) — evolução histórica da versão.

---

## 🖼️ GitHub Social Preview

Uma imagem para visualização social está disponível em:
```txt
assets/social-preview.png
```
*Dimensão recomendada: 1280x640, <1MB. Faça upload em: Repository Settings → Social Preview.*

---

## 🔖 GitHub Repository Metadata

### About sugerido
```txt
Responsible data profiling, cleaning, statistical evidence and LGPD-aware analytics for tabular datasets.
```

### Topics sugeridos
```txt
data-quality
analytics-engineering
data-profiling
statistics
fastapi
nextjs
typescript
python
scipy
responsible-analytics
lgpd
dashboard
portfolio-project
data-visualization
csv-processing
```

---

## 👤 Autor / Author

Desenvolvido por **Felipe Alirio Baruja**.

- **Portfolio:** [barujafe.vercel.app](https://barujafe.vercel.app/)
- **GitHub:** [@BarujaFe1](https://github.com/BarujaFe1)
- **LinkedIn:** [Gustavo Felipe Alirio Baruja](https://www.linkedin.com/in/barujafe/)

---

## 📄 Licença / License

MIT License. Copyright (c) 2026 Felipe Alirio Baruja.
O código está disponível sob a licença MIT caso o arquivo `LICENSE` esteja presente no repositório.
