# Resumo de Upgrade V2 — DataFlow V1.3

Este documento consolida as alterações, decisões técnicas e validações realizadas para a entrega da versão **V1.3** do **DataFlow**, elevando-o ao status de projeto de portfólio premium.

---

## 1. Resumo das Mudanças
*   **Correção de Credibilidade Analítica**: Corrigido o erro analítico no sumário do PDF e no dashboard. Os testes de Welch para notas de teste ($p=0.4515$) e notas de entrevista ($p=0.0624$) agora são corretamente descritos como não estatisticamente significativos em $\alpha=0.05$.
*   **Correção de Múltiplas Comparações (Bonferroni)**: Implementada a correção de Bonferroni para 6 testes simultâneos no frontend, resultando em um $\alpha_{Bonferroni} \approx 0.0083$. A escolaridade ($p=0.0141$) é classificada como "Significativo sem correção; inconclusivo após correção conservadora" e tratada como sinal exploratório.
*   **PDF Sem Artefatos de Browser**: Otimizadas as folhas de estilo de impressão com `@page { margin: 0; }` em `globals.css` para ocultar cabeçalhos (como `localhost:3000`) e datas injetados pelo navegador. O preenchimento interno (`print:p-[20mm]`) atua como margem física. O relatório tem exatamente 9 páginas e um dicionário de dados completo com as 17 colunas.
*   **Visualizações Estatísticas Premium**:
    *   **Funil SVG Real**: Substituição do gráfico de barras de etapas por um funil vertical em SVG com drop-offs e volume por fase.
    *   **Matriz de Correlação Spearman**: Mapa de calor 4x4 calculando a correlação ordinal de Spearman no client-side para variáveis numéricas.
    *   **Outliers & Boxplots**: Visualizador de boxplot interativo para dispersion de anos de experiência, salários e notas por status.
    *   **Mini-visualizações**: Inseridos gráficos de barra e blocos de frequência de apoio nos cards de testes de hipótese.
*   **Sidebar de Navegação com ScrollSpy**: Nova Sidebar sticky no desktop que rastreia dinamicamente a seção visível na viewport (Briefing, Qualidade, Funil, Governança, Estatística, Registros) e recolhe no mobile.

---

## 2. Arquivos Alterados e Criados

### 📁 Arquivos Criados:
*   [executiveConclusions.ts](file:///C:/dev/DataFlow/apps/web/lib/analytics/executiveConclusions.ts): Utilitário de classificação de p-valores, Bonferroni e mapeador verbal de conclusões.
*   [reportModel.ts](file:///C:/dev/DataFlow/apps/web/lib/reporting/reportModel.ts): Camada de serialização de dados estruturados para renderização uniforme do PDF.
*   [RecruitmentFunnel.tsx](file:///C:/dev/DataFlow/apps/web/components/charts/RecruitmentFunnel.tsx): Componente visual de funil vertical SVG.
*   [CorrelationMatrix.tsx](file:///C:/dev/DataFlow/apps/web/components/charts/CorrelationMatrix.tsx): Matriz 4x4 de correlação de Spearman.
*   [BoxplotOutliers.tsx](file:///C:/dev/DataFlow/apps/web/components/charts/BoxplotOutliers.tsx): Componente de boxplot estatístico e IQR para outliers.
*   [SidebarNav.tsx](file:///C:/dev/DataFlow/apps/web/components/dashboard/SidebarNav.tsx): Menu de navegação lateral com ScrollSpy.
*   [HealthScoreWaterfall.tsx](file:///C:/dev/DataFlow/apps/web/components/charts/HealthScoreWaterfall.tsx): Gráfico horizontal de steps de penalidade do score.

### 📁 Arquivos Modificados:
*   [globals.css](file:///C:/dev/DataFlow/apps/web/app/globals.css): Configuração de margem `@page` para ocultar localhost e redefinir paddings de impressão.
*   [page.tsx](file:///C:/dev/DataFlow/apps/web/app/page.tsx): Acoplamento do layout com SidebarNav e ScrollSpy IDs.
*   [ChartsPanel.tsx](file:///C:/dev/DataFlow/apps/web/components/charts/ChartsPanel.tsx): Integração do funil SVG, matriz e boxplots.
*   [QualityFlags.tsx](file:///C:/dev/DataFlow/apps/web/components/dashboard/QualityFlags.tsx): Substituição da tabela de penalidades pelo waterfall visual e adição do painel visual side-by-side Before/After.
*   [InferencePanel.tsx](file:///C:/dev/DataFlow/apps/web/components/dashboard/InferencePanel.tsx): Inclusão de mini-viz de testes, classificação de risco por faixa de p-valor e correção de Bonferroni.
*   [ReportView.tsx](file:///C:/dev/DataFlow/apps/web/components/report/ReportView.tsx): Renderização uniforme com base no ReportModel, exclusão de localhost e inclusão das 17 colunas no dicionário de dados.
*   [showcase/page.tsx](file:///C:/dev/DataFlow/apps/web/app/showcase/page.tsx): Atualização da versão showcase para V1.3.
*   [portfolio_pitch.md](file:///C:/dev/DataFlow/docs/portfolio_pitch.md): Alinhamento da seção de resultados STAR com as novas features.
*   [README.md](file:///C:/dev/DataFlow/README.md): Registro das novidades da V1.3.

---

## 3. Decisões de Design e Engenharia

### 🧠 Decisões Estatísticas:
*   **Correção de Bonferroni**: Para evitar inflação do erro tipo I devido a comparações múltiplas em 6 testes simultâneos, reduzimos o $\alpha$ de significância para $\approx 0.0083$. A escolaridade ($p=0.0141$) tornou-se inconclusiva sob essa ótica conservadora.
*   **Spearman Rank Correlation**: Optou-se pela correlação de Spearman sobre Pearson devido à presença de outliers acentuados em expectativa salarial e anos de experiência, permitindo uma análise de tendência ordinal mais robusta.

### 🎨 Decisões de UX/UI & PDF:
*   **Remoção de cabeçalhos A4**: Usar `@page { margin: 0; }` foi a única forma garantida de ocultar o cabeçalho automático injetado pelos navegadores comerciais. Compensamos adicionando margens internas físicas de `20mm` no corpo da folha impressa (`print:p-[20mm]`).
*   **Waterfall e Funil customizados em SVG**: Em vez de instalar pacotes pesados de gráficos adicionais, construímos componentes reativos em SVG nativo. Isso manteve o bundle do Next.js extremamente enxuto e garantiu renderização 100% fiel no vetor de impressão.

---

## 4. Resultados das Validações
*   **Linter (`npm run lint`)**: Passou com sucesso. Zero erros ou avisos nas regras do Next.js / ESLint.
*   **Build (`npm run build`)**: Compilou com sucesso gerando todas as páginas estáticas do Next.js sem nenhuma falha de tipo TypeScript.
*   **Testes Backend (`pytest`)**: Suíte contendo 6 testes executada com sucesso, garantindo estabilidade no pipeline.
