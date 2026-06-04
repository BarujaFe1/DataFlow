# DataFlow

### Profiling, limpeza, evidência estatística e governança responsável para dados tabulares.
*Responsible data profiling, cleaning and statistical evidence for tabular datasets.*

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![SciPy](https://img.shields.io/badge/SciPy-1.12+-8CAAE6?style=for-the-badge&logo=scipy)](https://scipy.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4.0-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![LGPD-Aware](https://img.shields.io/badge/LGPD-Protected-06B6D4?style=for-the-badge)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

---

## 1. Visão Geral / Overview

O **DataFlow** é um projeto de portfólio completo para *Analytics Engineering*, *Data Science* e *Data Engineering*. Ele automatiza o ciclo completo de ingestão de dados tabulares (CSV), convertendo planilhas brutas de recrutamento em um diagnóstico executivo confiável, painéis interativos premium e relatórios estruturados em PDF para tomada de decisão fundamentada.

O sistema aborda um problema clássico de mercado: dados que chegam de formulários públicos com cabeçalhos incoerentes, registros duplicados, e-mails inválidos, outliers discrepantes e nulos abundantes. O DataFlow atua como um validador de integridade local-first que normaliza esses dados, executa testes estatísticos inferenciais de processo na API do Python (**SciPy**) e aplica regras rígidas de proteção à privacidade de dados pessoais em conformidade com a **LGPD** (Lei Geral de Proteção de Dados).

---

## 2. Por que este projeto importa? / Why this project matters

* **Planilhas são a realidade:** A maioria dos processos de negócios consome dados tabulares imperfeitos. Saber higienizar, monitorar a completude e estruturar pipelines locais é uma habilidade fundamental.
* **Estatística sem contexto gera decisões ruins:** O DataFlow não apenas gera estatísticas descritivas básicas, mas calcula hipóteses inferenciais robustas mitigando riscos de falsos positivos (aplicando **Correção de Bonferroni**).
* **IA e Ética de Dados (Responsible Analytics):** Ele foi desenhado sob preceitos rígidos de governança. O DataFlow audita processos e calibragem, **nunca decide ou ranqueia pessoas**. Todas as informações demográficas ou sensíveis são protegidas.
* **Masterpiece de Engenharia:** Ele substitui os tradicionais scripts estáticos de notebooks por uma solução digital real, interativa e completa.

---

## 3. Principais Funcionalidades / Key Features

- **Executive Data Briefing (Hero Premium):** Diagnóstico instantâneo e pontuação de integridade explicável em menos de 5 segundos.
- **Data Quality Score (Health Score):** Pontuação de 0 a 100 com waterfall interativa de penalidades calculadas na API.
- **Before/After Cleaning Audit:** Grade comparativa mostrando o saneamento estrutural de volumes, nulos, e-mails e categorias.
- **Modo Raw vs Cleaned na Tabela:** Tabela de auditoria interativa baseada em TanStack Table v8, permitindo alternar visualmente entre dados saneados e brutos com tooltips descritivos das transformações de limpeza aplicadas.
- **Context Drawer por Coluna:** Clique nos cabeçalhos da tabela para abrir um drawer lateral com metadados semânticos, tipo inferido, taxas de completude, distribuição local, impactos no Health Score e ações de engenharia recomendadas.
- **Funil Operacional SVG Customizado:** Gráfico de funil proporcional ao volume absoluto com taxas de drop-off e nota metodológica integrada.
- **Matriz de Correlação Spearman 4x4:** Mapa de calor interativo que calcula coeficientes ordinais de Spearman client-side, sendo robusto contra outliers.
- **Outlier Boxplot (IQR):** Visualizador estatístico de quartis e outliers (expectativa salarial, anos de experiência) baseado na regra de amplitude interquartil.
- **Statistical Evidence Center:** Hypothesis testing (Welch t-test, ANOVA de uma via, Qui-Quadrado de Pearson) interpretados em linguagem executiva com badges de múltiplas comparações (Bonferroni) e alertas de falso positivo dinâmicos.
- **Relatório PDF Executivo de 9 Páginas:** Design para impressão A4 que suprime localhost e URLs de navegador via regras `@page` e divide perfeitamente o relatório em seções executivas contendo todos os gráficos e o dicionário de 17 colunas.

---

## 4. Arquitetura do Projeto / Project Architecture

O projeto adota uma arquitetura monorepo simplificada e desacoplada:

```text
DataFlow/
├── apps/
│   ├── web/                         # Frontend em Next.js 15 (App Router)
│   │   ├── app/                     # Rotas e páginas (/demo, /showcase, /methodology)
│   │   ├── components/              # Componentes de interface do painel e PDF
│   │   │   ├── charts/              # Funil SVG, Correlação, Boxplot, Waterfall
│   │   │   ├── dashboard/           # Heros, KPICards, Sidebar, Responsible Analytics
│   │   │   ├── report/              # ReportView (Impressão do PDF)
│   │   │   └── table/               # DataTable (Grade interativa + Drawer)
│   │   └── lib/                     # Utilitários (masking, conclusions, api)
│   └── api/                         # Backend em FastAPI/Python 3.12
│       ├── app/                     # Código fonte da API REST
│       │   ├── api/                 # Endpoints (/health, /demo, /analyze)
│       │   ├── models/              # Modelos de validação Pydantic
│       │   └── services/            # Engine de processamento (profiler, cleaner, inference)
│       └── tests/                   # Testes unitários baseados em pytest
├── data/
│   └── seed/                        # Base sintética (processo_seletivo_demo.csv)
├── docs/                            # Documentação técnica e de portfólio
├── assets/
│   └── screenshots/                 # Imagens ilustrativas do produto
├── start.bat                        # Script de inicialização integrada Windows
└── README.md                        # Esta documentação
```

---

## 5. Pipeline de Dados / Data Pipeline

```text
CSV Upload / Demo
  ➜ Parser de Encodings e Delimitadores
  ➜ Wizard de Mapeamento de Cabeçalhos
  ➜ Normalização Casing & Formatos de Data
  ➜ Exclusão de Duplicados & Outliers (Cleaning)
  ➜ Profiling de Completude & Health Scoring
  ➜ Testes Estatísticos Inferidos (SciPy)
  ➜ Mascaramento Ativo de PII (LGPD)
  ➜ Apresentação (Dashboard & PDF de 9 Páginas)
```

---

## 6. Primeiros Passos / Getting Started

### Pré-requisitos
- **Node.js** v20 ou superior.
- **Python** 3.10 ou superior (preferencialmente Python 3.12).

### Execução Integrada (Windows)
Se você estiver no Windows, basta dar dois cliques no arquivo `start.bat` na raiz do projeto. Ele inicializará automaticamente o ambiente virtual Python, instalará as dependências do backend, rodará o frontend e abrirá a aplicação em seu navegador padrão.

---

### Execução Manual por Componente

#### 1. Backend FastAPI (`apps/api`)
1. Acesse o diretório:
   ```bash
   cd apps/api
   ```
2. Crie e ative o ambiente virtual:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate   # Windows
   source .venv/bin/activate # Linux/macOS
   ```
3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
4. Inicie o servidor:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *O backend FastAPI estará ativo em [http://127.0.0.1:8000](http://127.0.0.1:8000). A documentação interativa fica em `/docs`.*

#### 2. Frontend Next.js (`apps/web`)
1. Acesse o diretório em um novo terminal:
   ```bash
   cd apps/web
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor em desenvolvimento com Turbopack:
   ```bash
   npm run dev
   ```
   *O frontend estará disponível em [http://localhost:3000](http://localhost:3000).*

---

## 7. Scripts e Testes / Scripts and Testing

### Rodar Testes de Backend (FastAPI/Pytest)
A API conta com testes unitários para validar a lógica analítica do pipeline.
```bash
cd apps/api
.venv\Scripts\python -m pytest
```

### Validações de Frontend (Next.js)
```bash
cd apps/web
npm run lint         # Verificação de linter (0 avisos tolerados)
npm run typecheck    # Verificação estrita de tipos
npm run build        # Compilação estática de produção
```

---

## 8. Responsible Analytics & Diretrizes LGPD

O DataFlow foi desenhado com foco em **Ética de Dados**:
* **Mascaramento Nativo:** Os nomes e e-mails são anonimizados do lado do cliente (Nome &rarr; Candidato CANXXXX | E-mail &rarr; f***@example.com).
* **Auditoria de Processos:** Os testes estatísticos não determinam aprovação individual, mas validam se o processo global apresenta vieses estatísticos sistêmicos.
* **Veto a Decisões Automatizadas:** É vedado o uso deste sistema para ranqueamento direto ou descarte automático de candidatos com base em scores estatísticos. A decisão humana estruturada é obrigatória.

---

## 9. Metodologia Estatística

- **Welch t-test:** Avaliação de diferenças de médias em testes práticos, adequado para variâncias populacionais e tamanhos amostrais distintos.
- **Chi-Square Association:** Teste qui-quadrado de independência para avaliar associação categórica de escolaridade versus status de aprovação.
- **ANOVA de Uma Via:** Compara médias de notas entre múltiplos grupos (cargos, escolaridade) para avaliar dispersões.
- **Bonferroni Correction:** Dividimos $\alpha = 0.05$ por 6 comparações ($\alpha_{adj} \approx 0.0083$) para anular a inflação de erros do Tipo I ao rodar múltiplos testes.
- **outlier IQR limits:** Quartis calculados localmente. Valores discrepantes sofrem penalizações no Health Score e são sinalizados.

---

## 10. Documentação de Portfólio Complementar

* [Portfolio Pitch (docs/portfolio_pitch.md)](file:///C:/dev/DataFlow/docs/portfolio_pitch.md): Roteiros de apresentação de 30s, 60s, LinkedIn posts e respostas para perguntas difíceis em entrevistas.
* [Final Release Audit (docs/final_release_audit.md)](file:///C:/dev/DataFlow/docs/final_release_audit.md): Auditoria técnica completa de stack, regras de score e release.
* [Upgrade Summary V2 (docs/upgrade_summary_v2.md)](file:///C:/dev/DataFlow/docs/upgrade_summary_v2.md): Registro das evoluções da versão V1.3.

---

## 🤝 Créditos

Este projeto foi construído por **Felipe Alirio Baruja** como projeto de portfólio profissional âncora, combinando engenharia de software full-stack e ciência de dados responsável.
* GitHub: [BarujaFe1](https://github.com/BarujaFe1)
* Repositório Oficial: [DataFlow](https://github.com/BarujaFe1/DataFlow)
* E-mail: felipe.baruja@example.com (sintético/portfólio)

MIT License. Copyright (c) 2026 Felipe Alirio Baruja.
