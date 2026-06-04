# Auditoria de Upgrade Sistemática — DataFlow V1.2

Este documento registra a análise técnica do estado atual do projeto **DataFlow** antes do início da implementação das melhorias premium.

---

## 1. Stack Tecnológica Detectada
*   **Frontend**:
    *   **Core**: Next.js 15.5.19 (App Router, React 19.1.0, TypeScript 5.x).
    *   **Estilização**: Tailwind CSS v4 (configuração inline via CSS).
    *   **Visualização**: Recharts v3.8.1.
    *   **Tabela**: TanStack Table v8.21.3 (`@tanstack/react-table`).
    *   **Delimitadores/Parser**: PapaParse 5.5.3.
*   **Backend**:
    *   **Core**: Python 3.12.10, FastAPI 0.136.3, Uvicorn 0.49.0.
    *   **Dados e Matemática**: pandas 3.0.3, NumPy 2.4.6, SciPy 1.17.1, statsmodels 0.14.6.
    *   **Testes**: pytest 9.0.3.

---

## 2. Scripts Disponíveis no package.json (apps/web)
*   `dev`: `next dev --turbopack`
*   `build`: `next build --turbopack`
*   `start`: `next start`
*   `lint`: `eslint`

---

## 3. Rotas Existentes
*   **Backend (`apps/api`)**:
    *   `GET /api/health` - Check de status.
    *   `GET /api/demo` - Retorna análise do dataset demo padrão.
    *   `POST /api/analyze` - Recebe arquivo CSV e opcionalmente mapeamento JSON para analisar.
*   **Frontend (`apps/web`)**:
    *   `/` (Home/Dashboard/Relatório SPA)
    *   `/showcase` (Showcase Landing Page de Portfólio)

---

## 4. Componentes Principais do Dashboard
*   `KPICards.tsx` - Exibe cards principais de KPIs.
*   `HealthScore.tsx` - Exibe gauge de progresso circular de saúde de dados.
*   `QualityFlags.tsx` - Tabela agrupada de perfil de colunas.
*   `ChartsPanel.tsx` - Renderização de gráficos usando Recharts.
*   `InferencePanel.tsx` - Renderização de testes estatísticos.
*   `DataTable.tsx` - Exibição de dados limpos em grade interativa.

---

## 5. Componentes Principais do PDF (Report)
*   `ReportView.tsx` - Layout imprimível que encapsula capa, KPIs, integridade de colunas, testes e apêndice técnico.

---

## 6. Onde o Health Score é Calculado
*   **Backend**: Em `apps/api/app/services/profiler.py` no método `profile_dataset`. Ele inicia com 100 e desconta pontos com base em nulos, duplicatas, colunas vazias, colunas constantes, e-mails inválidos e outliers.

---

## 7. Onde a Auditoria Before/After é Calculada
*   **Dashboard / Frontend**: Os contadores de anomalias (duplicados, e-mails inválidos, outliers) são extraídos de metadados retornados pelo backend e calculados sob demanda comparativamente no frontend (`app/page.tsx`). A limpeza bruta ocorre em `apps/api/app/services/cleaner.py`.

---

## 8. Onde os Testes Estatísticos são Executados
*   **Backend**: Em `apps/api/app/services/inference.py` usando SciPy. Roda Qui-Quadrado de Pearson, Teste t de Welch e ANOVA de uma via.
*   **Frontend**: Apresentados didaticamente em `InferencePanel.tsx`.

---

## 9. Onde os Gráficos são Renderizados
*   **Frontend**: Em `apps/web/components/charts/ChartsPanel.tsx` usando Recharts. Renderiza linha de tempo de inscrições, barra de funil por etapa, barra dupla de eficiência de canais, histograma de notas do teste e completude de colunas.

---

## 10. Onde CSV/JSON/PDF são Exportados
*   **CSV e JSON**: Exportados via browser Blobs diretamente no frontend no arquivo `apps/web/components/table/DataTable.tsx`.
*   **PDF**: Gerado através de print do navegador via `window.print()` em `apps/web/components/report/ReportView.tsx`.

---

## 11. Onde ficam os Tipos TypeScript
*   **Frontend**: Definidos centralizadamente em `apps/web/types/analysis.ts`.

---

## 12. Dependências Já Instaladas
*   `next`, `react`, `react-dom`, `@tanstack/react-table`, `recharts`, `papaparse`, `lucide-react`.

---

## 13. Dependências que NÃO serão Adicionadas
*   Bibliotecas pesadas de geração de PDF (como Puppeteer, WeasyPrint, jsPDF, html2pdf.js). Usaremos CSS de impressão (@media print) nativo e limpo.
*   Bibliotecas extras de gerenciamento de estado global (como Zustand ou Redux).
*   Bibliotecas pesadas de design (como Material UI ou Bootstrap).

---

## 14. Riscos de Quebrar Funcionalidades
*   **Mascaramento de PII**: Risco de quebrar a busca ou os filtros da tabela se o mascaramento for mal aplicado. Deve ser feito apenas na renderização ou de forma isolada sem afetar as chaves de busca/filtro do TanStack Table.
*   **Remoção de localhosts e print breaks**: Ajustes no CSS de impressão podem causar desconfigurações visuais ou cortes no layout do dashboard se aplicados incorretamente nas media queries globais.
*   **Refatoração de Gráficos**: Risco de incompatibilidade visual com a biblioteca Recharts v3.

---

## 15. Plano de Implementação em Fases

### Fase 1: Correções de Finalização, Credibilidade e Mascaramento (LGPD)
*   Criar utilitário de mascaramento `apps/web/lib/masking.ts`.
*   Implementar toggle de privacidade "Modo LGPD / Mascaramento" no dashboard e usá-lo na DataTable, ReportView e exportações.
*   Remover localhost do PDF, corrigir textos truncados e preencher descrições reais do Dicionário de Dados.

### Fase 2: Hero Executive Briefing & Stepper de Pipeline
*   Criar componente `ExecutiveHero.tsx` e integrá-lo no topo da página.
*   Criar componente `PipelineTimeline.tsx` indicando as 6 etapas do pipeline.

### Fase 3: Data Quality Cockpit Premium
*   Criar representação visual (waterfall/breakdown) de perda de pontos do Health Score.
*   Exibir cockpit de "What Changed After Cleaning" de forma gráfica.
*   Criar o "Quality Issues Register" com severidades, evidências e ações recomendadas.
*   Reagrupar colunas em 8 categorias reais nas Column Quality Cards.

### Fase 4: Statistical Evidence Center & Responsible Analytics
*   Evoluir `InferencePanel.tsx` para apresentar hipóteses ($H_0/H_1$), tamanhos de efeito em badges verbais (Cohen's d, Cramer's V, Eta^2), aviso de comparações múltiplas e leituras executivas claras.
*   Criar a seção "Responsible Analytics" com regras de finalidades permitidas/proibidas.

### Fase 5: PDF Executivo Premium
*   Refatorar `ReportView.tsx` para ter capa executiva, sumário de KPIs em cards alinhados, tabelas de eficiência e apêndice metodológico completo.

### Fase 6: Rota /demo, /showcase e README
*   Refinar `/showcase` com botão para rodar demo com parâmetros de URL.
*   Criar `/demo` (ou garantir que `/` carregue em modo demo com banner apropriado).
*   Gerar `docs/portfolio_pitch.md` e atualizar o `README.md`.

---

## 16. Critérios de Aceite
1. O dashboard e a showcase compilam sem qualquer erro de build do Next.js.
2. Nomes e e-mails de candidatos aparecem mascarados por padrão no modo demo e no PDF.
3. O PDF do relatório possui capa corporativa, paginação correta, nenhuma menção a localhost e quebras de página perfeitas.
4. O painel estatístico exibe as hipóteses nula/alternativa e o tamanho do efeito de forma didática.
5. O cockpit de qualidade exibe o waterfall de perda de pontos do score e tabela completa de registro de problemas.
