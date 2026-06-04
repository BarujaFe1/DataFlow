# Auditoria de Upgrade V2 — DataFlow V1.3

Este documento registra a análise técnica detalhada do estado atual do **DataFlow** e planeja as melhorias da Fase 2 de consolidação de portfólio.

---

## 1. Stack Tecnológica Detectada
*   **Frontend**: Next.js 15 (Turbopack, TypeScript 5.x, React 19), Tailwind CSS v4, Recharts v3.8.1, TanStack Table v8.21.3.
*   **Backend**: Python 3.12, FastAPI, Uvicorn, pandas, NumPy, SciPy.

---

## 2. Scripts Disponíveis no package.json (apps/web)
*   `dev`: `next dev --turbopack`
*   `build`: `next build`
*   `start`: `next start`
*   `lint`: `eslint`

---

## 3. Como o PDF é gerado atualmente
*   O PDF é gerado a partir do componente [ReportView.tsx](file:///C:/dev/DataFlow/apps/web/components/report/ReportView.tsx). O usuário clica no botão "Imprimir / Exportar PDF", o qual dispara a função nativa do navegador `window.print()`.

---

## 4. Tecnologias de PDF em uso
*   O projeto utiliza **`window.print()` (browser print)** nativo combinado com folhas de estilo CSS `@media print` definidas em [globals.css](file:///C:/dev/DataFlow/apps/web/app/globals.css) e no próprio [ReportView.tsx](file:///C:/dev/DataFlow/apps/web/components/report/ReportView.tsx). Não há dependências pesadas de geração de PDF instaladas.

---

## 5. Onde o sumário executivo do PDF é gerado
*   O sumário executivo é gerado no arquivo [ReportView.tsx](file:///C:/dev/DataFlow/apps/web/components/report/ReportView.tsx) na Página 2 (seção "Sumário Executivo e KPIs"). Atualmente, os textos das conclusões estão parcialmente hardcoded ou baseados em simplificações que causaram um erro analítico (Welch descrito erroneamente como significativo).

---

## 6. Onde os textos automáticos de conclusões são gerados
*   No frontend, os textos são gerados em [ReportView.tsx](file:///C:/dev/DataFlow/apps/web/components/report/ReportView.tsx) e em [generateInsights.ts](file:///C:/dev/DataFlow/apps/web/lib/insights/generateInsights.ts). No backend, eles são gerados nos arquivos do diretório `apps/api/app/services/` (especialmente `inference.py` para as interpretações de testes).

---

## 7. Onde os resultados estatísticos são calculados
*   Os resultados estatísticos são calculados exclusivamente no backend Python através do arquivo [inference.py](file:///C:/dev/DataFlow/apps/api/app/services/inference.py) utilizando a biblioteca **SciPy** (Welch, ANOVA, Pearson/Cramer's V).

---

## 8. Onde os p-valores e tamanhos de efeito ficam armazenados
*   Ficam contidos no objeto retornado pela API na chave `inference`, que segue a tipagem `InferenceResult[]` definida em [analysis.ts](file:///C:/dev/DataFlow/apps/web/types/analysis.ts).

---

## 9. Onde o dicionário de dados é gerado
*   O dicionário é gerado em [ReportView.tsx](file:///C:/dev/DataFlow/apps/web/components/report/ReportView.tsx) mapeando o array `quality.columns` contra o dicionário semântico constante `COLUMN_DICTIONARY` em [masking.ts](file:///C:/dev/DataFlow/apps/web/lib/masking.ts).

---

## 10. Onde as tabelas e gráficos são renderizados
*   **Tabelas**: Rendedizadas no componente [DataTable.tsx](file:///C:/dev/DataFlow/apps/web/components/table/DataTable.tsx).
*   **Gráficos**: Renderizados no componente [ChartsPanel.tsx](file:///C:/dev/DataFlow/apps/web/components/charts/ChartsPanel.tsx) e inline dentro dos componentes específicos de estatística e qualidade.

---

## 11. Como a tabela aplica mascaramento LGPD
*   Através do prop `isPrivacyEnabled` passado da página principal para o componente [DataTable.tsx](file:///C:/dev/DataFlow/apps/web/components/table/DataTable.tsx), que condicionalmente aplica as funções `maskName` e `maskEmail` ao renderizar as células.

---

## 12. Quais componentes já existem
*   `ExecutiveHero.tsx`, `PipelineTimeline.tsx`, `QualityFlags.tsx` (Data Quality Cockpit), `ResponsibleAnalyticsCenter.tsx`, `InferencePanel.tsx` (Statistical Evidence), `ReportView.tsx` (PDF).

---

## 13. Quais dependências de gráficos já existem
*   `recharts` v3.8.1.

---

## 14. Quais dependências de PDF já existem
*   Nenhuma (browser window.print nativo).

---

## 15. Plano de Implementação por Fase

### Fase 1: Credibilidade Analítica e Textual Dinâmica
*   Criar função `generateExecutiveConclusions()` em um novo arquivo de utilitário.
*   Corrigir o erro analítico do sumário do PDF para refletir p-valores reais de Welch (`p=0.4515` e `p=0.0624`).
*   Implementar badge e copy de múltiplas comparações (Bonferroni / alfa ajustado) para o sinal estatístico de escolaridade.
*   Substituir interpretadores estáticos no dashboard e no PDF por essa fonte única de verdade.
*   Ajustar os alertas de falso positivo para que sejam contextuais ao p-valor (não-significativos ocultam ou avisam que H0 não foi rejeitada).

### Fase 2: PDF Executivo Real Sem Artefatos
*   Adicionar estilos CSS `@page` avançados em `globals.css` para ocultar cabeçalho, rodapé e URL do navegador.
*   Substituir a paginação automática duplicada e corrigir o problema de página em branco no final.
*   Criar `buildReportModel()` no frontend para estruturar um payload limpo e serializável para renderização do relatório.
*   Integrar as 17 colunas mapeadas no Dicionário de Dados sem cortes.

### Fase 3: Visualizações Avançadas e Identidade Visual
*   Criar um componente de Funil de Recrutamento real usando SVG customizado (proporcional ao volume, drop-off).
*   Aplicar paleta de cores DataFlow nos gráficos do Recharts (neutro para volume, verde para aprovação, vermelho para risco, âmbar para atenção, violeta/cyan para privacidade).
*   Adicionar visualizações compactas de distribuição/outliers (boxplot/IQR simplificado) para salário e experiência.
*   Calcular e exibir uma matriz de correlação 4x4 (Spearman) no frontend para as variáveis numéricas.
*   Inserir mini-visualizações nos cards de testes estatísticos.

### Fase 4: Navegação Sidebar e Experiência Premium
*   Criar componente de navegação lateral (Sidebar) com ScrollSpy em desktop e menu compacto reativo em mobile.
*   Reorganizar a primeira dobra (Briefing Hero) para passar no teste de 5 segundos.
*   Refinar tipografia, contrastes, espaçamentos e acessibilidade (foco, keyboard).

### Fase 5: Demo, Showcase e Portfólio
*   Garantir a coesão das rotas `/demo` e `/showcase` com botões interativos para cópia de pitches.

---

## 16. Riscos de Regressão
*   **Múltiplas Renderizações de Gráficos**: Recharts pode quebrar se instanciado incorretamente dentro de divs flex/grid com tamanhos não fixados (`ResponsiveContainer`).
*   **Quebra de Layout de Impressão**: Alterar o CSS global `@media print` pode afetar outros layouts ou estourar o número de páginas se os paddings e quebras não forem rigidamente testados.

---

## 17. Critérios de Aceite
1. O PDF gerado tem 9 páginas exatas, sem localhost, sem cabeçalhos/rodapés automáticos e sem folha em branco.
2. O sumário descreve Welch com p=0.4515 como não-significativo.
3. Há matriz de correlação 4x4 funcional para experiência, salário, teste e entrevista.
4. O funil exibe drop-offs e volume de forma visual e sequencial.
5. O dashboard e o PDF compilam sem erros de build no Next.js.
