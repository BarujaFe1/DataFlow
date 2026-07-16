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

License to be defined — no `LICENSE` file in this repository yet.
