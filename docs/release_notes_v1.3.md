# Notas de Lançamento (Release Notes) — DataFlow V1.3

Este documento registra as alterações e melhorias implementadas na versão **V1.3** do **DataFlow** para consolidação como produto premium de portfólio.

---

## 1. Resumo da Release
O DataFlow V1.3 representa a estabilização técnica, visual e científica do pipeline analítico. O foco desta versão foi eliminar inconsistências de credibilidade textual nos relatórios, aumentar a interatividade da grade de dados com ferramentas avançadas de auditoria e garantir que as exportações em PDF apresentem um visual de nível de consultoria de dados sênior.

---

## 2. Melhorias Analíticas e Científicas
* **Correção Factual dos Testes de Welch:** Ajustados os sumários do dashboard e do PDF para classificar as notas de testes técnicos ($p=0.4515$) e entrevista ($p=0.0624$) na base demo como **não estatisticamente significativas** em $\alpha=0.05$.
* **Mitigação de Múltiplas Comparações:** Implementada a **Correção de Bonferroni** para os 6 testes paralelos executados no backend, ajustando a significância para $\alpha_{Bonferroni} \approx 0.0083$. A escolaridade ($p=0.0141$) agora é classificada corretamente como inconclusiva sob correção conservadora.
* **Alertas Dinâmicos de Falso Positivo:** Os cards de hipótese mostram avisos específicos dependendo da faixa do p-valor do teste (perigo para nominal, atenção para tendências limítrofes e informativos para não-rejeitados).
* **Matriz de Spearman Client-Side:** Cálculo instantâneo da matriz 4x4 de correlações ordinais no frontend.

---

## 3. Melhorias Éticas e de Governança (Responsible Analytics)
* **Veto a Decisões Automatizadas:** Removidos todos os insights sugerindo modelos preditivos de aprovação/reprovação automática de candidatos ou ranqueamento automático de talentos, alinhando a ferramenta aos guardrails éticos do prd.md.
* **Mascaramento LGPD por Padrão:** Oculpa identificadores pessoais (PII) convertendo nomes em `Candidato CANXXXX` e e-mails em formato ofuscado (`g***@domain.com`).
* **Checklist de Variáveis Sensíveis:** Inclusão de auditoria de colunas demográficas no Responsible Analytics Center.

---

## 4. Melhorias Visuais e Experiência de Dados (Data UX)
* **Visualizações Avançadas na Tabela:**
  * **Cell-Level Highlights:** Anomalias como outliers (salário/experiência), nulos em campos cruciais e e-mails fora do padrão são destacados em cores semânticas sutilmente contrastadas com tooltips descritivos detalhados.
  * **Modo Saneado vs Bruto:** Toggle para alternar visualmente entre dados limpos normalizados e brutos originais com indicações de transformação.
  * **Context Drawer de Colunas:** Drawer lateral com distribuição local, completude, qualidade, sensibilidade e testes estatísticos relacionados de cada coluna.
* **Funil SVG Operacional:** Gráfico de funil proporcional com drop-offs e tooltips de hover nativos no dashboard.
* **Briefing Hero Consolidado:** Gauge do Health Score redimensionado (maior e mais dominante) e badges premium integrados no topo do painel.
* **Sidebar com ScrollSpy:** Menu lateral fixo que rastreia dinamicamente a rolagem do usuário e adiciona links rápidos para metodologias.

---

## 5. Relatório PDF A4 Sem Artefatos
* **Ocultação de URLs Locais:** Regras de CSS global de impressão `@page { margin: 0; }` suprimem completamente os cabeçalhos de navegador (`localhost:3000`, data, hora). Margens são restauradas por padding interno nas páginas.
* **Orçamento Rígido de 9 Páginas:** Divisões de quebras de página testadas com o último container parametrizado com `page-break-after: avoid` para evitar páginas em branco extras.
* **Visualizações Injetadas:** Waterfall de qualidade, Funil SVG de recrutamento e matrizes de correlação Spearman foram adaptadas para renderizar em tons compatíveis com impressão sobre papel branco.

---

## 6. Limitações Conhecidas
* **Desempenho de Carga Cliente-side:** A renderização da tabela é otimizada para datasets de até 2.000 linhas; volumes maiores requerem paginação server-side.
* **Relações Não-Monótonas:** A matriz de correlação de Spearman assume associações monotônicas; relações não-lineares ou complexas podem retornar coeficientes próximos de zero.

---

## 7. Próximos Passos (Roadmap V1.4+)
* **Tabela Virtualizada:** Integração de renderização virtualizada (ex: `@tanstack/react-virtual`) na grade para suportar 100k+ registros.
* **Paginação de Backend:** Implementação de paginação de banco de dados física para uploads volumosos.
* **Customizações de PDF:** Botões para exportar One-Pagers executivos personalizados.
