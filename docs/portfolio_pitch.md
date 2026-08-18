# Roteiro de Apresentação e Pitch de Portfólio — DataFlow V1.3

Este documento serve como guia estratégico para apresentar o **DataFlow** em entrevistas de emprego para vagas de **Analytics Engineering, Data Science, Data Engineering e Front-end Architecture**.

---

## 1. Pitches de Portfólio

### ⚡ Pitch de 30 Segundos (Foco em Negócios e Agilidade)
> "O **DataFlow** é uma plataforma de Analytics Engineering que automatiza o saneamento e a auditoria de planilhas de recrutamento brutas. Ele recebe arquivos CSV, mapeia campos, aplica regras de integridade e calcula um **Health Score** heurístico. O sistema executa testes inferenciais via SciPy, aplica mascaramento de PII conforme a política configurada e prepara uma visão executiva para impressão. Ele apoia a preparação e a interpretação dos dados, sempre com revisão humana e limites explícitos."

### ⏱️ Pitch de 60 Segundos (Foco em Rigor Estatístico e Valor Técnico)
> "Como engenheiro de dados e cientista de dados, vejo que muitas decisões corporativas são tomadas com base em planilhas corrompidas ou testes estatísticos mal interpretados. O **DataFlow** reúne esse pipeline em um monorepo moderno. Desenvolvido com **Next.js 15** e **FastAPI (Python)**, o sistema higieniza categorias, formata datas, reporta anomalias por IQR e executa testes inferenciais como ANOVA e Welch t-test, com correção de Bonferroni quando aplicável. Ele apresenta PII mascarada nos modos configurados e gera relatórios executivos prontos para impressão; não substitui controles legais, de segurança ou revisão humana."

### 💻 Pitch Técnico (Foco em Arquitetura de Software e Engenharia)
> "Do ponto de vista de arquitetura, o DataFlow foi estruturado como um monorepo desacoplado local-first. O frontend é uma SPA reativa em Next.js 15 que utiliza **Tailwind CSS v4** para estilo Apple-like, **Recharts** para gráficos SVG dinâmicos e **TanStack Table v8** com paginação e ordenação de performance. A API backend em FastAPI realiza o parse tolerante a delimitadores e codificações, profila e limpa dados com **pandas** e roda testes de hipóteses estatísticas com **SciPy**. Mapeamos aliases e expomos logs de normalização no frontend. A comunicação é stateless via JSON, e a renderização do PDF é feita aplicando-se estilos CSS `@media print` para ocultar artefatos do navegador."

### 👥 Pitch para Recrutador Não Técnico (Foco em Impacto de Negócio e Solução)
> "Muitas empresas perdem tempo limpando manualmente planilhas de vagas de emprego exportadas de sistemas como Gupy ou LinkedIn. Criei o **DataFlow** para apoiar esse trabalho: ele analisa planilhas, apresenta uma nota heurística de 0 a 100, aponta problemas de digitação, identifica cadastros repetidos e mascara informações pessoais nos modos configurados. Ao final, prepara um relatório executivo para impressão que ajuda RH e liderança a revisar evidências, sem decidir ou garantir resultados justos por conta própria."

---

## 2. Roteiro de Demonstração ao Vivo (Live Demo Script)

1. **Abertura do Hero (Teste dos 5 Segundos):**
   * "Olá! Vou apresentar a tela inicial do DataFlow carregando o dataset demonstrativo sintético. O **Briefing Hero** mostra o Health Score calculado para o dataset carregado e o pipeline com etapas de ingestão, saneamento e inferência. O valor depende dos dados e a interface identifica quando o mascaramento de PII está configurado."
2. **Cockpit de Qualidade & Before/After:**
   * "Aqui vemos os cards de KPIs. O Cockpit de Qualidade mostra as deduções de pontuação: perdemos pontos por e-mails corrompidos e valores duplicados. O painel 'Antes vs Depois' deixa transparente que o pipeline removeu 5 cadastros duplicados e normalizou de forma silenciosa categorias inconsistentes (como 'superior completo' para 'Ensino Superior')."
3. **Exploração Visual do Funil e Distribuições:**
   * "Mais abaixo, temos o **Funil Operacional SVG** que calcula as perdas por etapa, a matriz de correlação Spearman para monitorar dispersões numéricas e o Boxplot que isola outliers de expectativas salariais absurdas."
4. **Auditoria de Células e o Context Drawer (Data UX):**
   * "Se descermos para a tabela de registros, observamos o mascaramento de nomes e e-mails quando a política do backend o configura. Células com problemas, como e-mails inválidos ou anomalias de salário, podem ser destacadas com tooltips explicativos. Clicando no ícone `(i)` no cabeçalho de uma coluna, abrimos um **Context Drawer lateral** com completude, tipo inferido, testes de hipótese associados e ações de engenharia recomendadas."
5. **Statistical Evidence Center (Mitigação de Falso Positivo):**
   * "Na seção de evidências estatísticas, audito se a escolaridade ou a nota de teste técnico de fato influenciam a aprovação. O Qui-Quadrado de escolaridade retornou p=0.0141, significativo nominalmente, mas classificado como **inconclusivo sob correção de Bonferroni** (onde o limite aceitável de 6 testes paralelos cai para p=0.0083). Isso evita que o gestor crie barreiras rígidas de diploma sem fundamentação matemática forte."
6. **Responsible Analytics & PDF Export:**
   * "Mostro o Responsible Analytics Center com o que é permitido e proibido fazer com a ferramenta. Para fechar, clico em 'Exportar PDF Executivo'. O navegador abre a janela de impressão; a paginação e a fidelidade visual dependem do navegador, dos dados e das configurações de impressão, e devem ser verificadas no artefato gerado."

---

## 3. Perguntas Difíceis e Respostas Técnicas

### 🤔 Por que usar a Correção de Bonferroni?
> "Quando realizamos múltiplos testes de hipóteses estatísticas em uma mesma base (no nosso caso, 6 testes simultâneos), a probabilidade acumulada de cometer um Erro Tipo I (rejeitar a hipótese nula quando ela é verdadeira, ou seja, encontrar um falso positivo) aumenta de forma geométrica. A correção de Bonferroni é um ajuste conservador clássico que rebaixa o limiar de significância dividindo o alfa nominal pelo número de testes ($\alpha_{\text{corrigido}} = 0.05 / 6 \approx 0.0083$). No DataFlow, isso evita que tomadores de decisão assumam correlações casuais como regras definitivas de negócio."

### 🤔 Por que o teste t de Welch foi preferido em relação ao de Student?
> "O teste t de Student assume que as duas populações comparadas possuem variâncias iguais (homocedasticidade). Em processos seletivos de recrutamento reais, o grupo de candidatos 'Aprovados' é muito menor que o grupo de 'Outros' (amostras desbalanceadas) e apresenta dispersões de nota bem distintas. O teste t de Welch não assume variâncias iguais e ajusta os graus de liberdade de forma matemática apropriada, garantindo robustez a desbalanceamentos amostrais e desvios de variância."

### 🤔 Por que focar em Responsible Analytics e não criar um modelo preditivo de aprovação/reprovação?
> "Modelos preditivos (Machine Learning) treinados em bases de contratação históricas tendem a reproduzir e amplificar vieses inconscientes humanos presentes nos dados originais (como discriminações geográficas, de gênero ou de background acadêmico). Em processos de recrutamento, a inteligência analítica deve atuar como uma ferramenta de **auditoria de processos e governança**, e não como um tomador de decisões automatizado individual. O DataFlow atua audtando a calibragem geral do funil — nunca ranqueando ou descartando pessoas sem revisão humana."

### 🤔 Como você escalaria esta tabela para 100k+ registros sem travar a interface?
> "Atualmente o TanStack Table v8 realiza paginação cliente-side e lida muito bem com 305 registros. Para bases de 100k+ linhas, eu implementaria duas estratégias:
> 1. **Paginação Server-Side:** O frontend enviaria os parâmetros de ordenação, paginação e filtros via query parameters para a API FastAPI, que usaria SQL (via SQLAlchemy/PostgreSQL) com limites (`LIMIT` e `OFFSET`) para processar e retornar apenas a fatia de dados necessária (ex: 20 registros por vez).
> 2. **Virtualização de Tabela (Virtual Rendering):** Utilizaria a biblioteca `@tanstack/react-virtual` para renderizar no DOM apenas as linhas visíveis na janela de rolagem (viewport), economizando memória e tempo de renderização do navegador."

### 🤔 O que faria de diferente se este projeto fosse para um ambiente de produção real?
> "Em produção, aplicaria:
> * **Banco de Dados Relacional:** Substituiria o carregamento de CSV por um banco como PostgreSQL para persistência de dados.
> * **Autenticação & Controle de Acesso (RBAC):** Proteção de endpoints via OAuth2/JWT para isolar dados de diferentes empresas.
> * **Processamento Assíncrono (Celery/Redis):** Análise de arquivos pesados rodando em background com workers dedicados para não bloquear a thread da API FastAPI.
> * **Serviço de Geração de Relatórios Separado:** Uso de motores baseados em Node (Puppeteer) ou Python (WeasyPrint) em containers Docker para gerar PDFs estáticos no servidor em vez de depender estritamente de `window.print()` do client."

---

## 4. Post para o LinkedIn (Pronto para Publicar)

> 🚀 **Concluí o DataFlow V1.3 — Projeto Âncora de Analytics Engineering e Responsible Analytics!** 📊🛠️
>
> Em dados corporativos, o maior gargalo não é criar visualizações complexas, mas sustentar a **qualidade**, o **rigor estatístico** e limites éticos claros nas análises.
>
> O DataFlow é uma plataforma local-first desenvolvida com Next.js 15, Tailwind v4 e FastAPI (Python) para converter planilhas brutas em relatórios executivos que apoiam revisão humana.
>
> 💡 **O que diferenciou esta versão (V1.3):**
> 1. **Data Quality Score Explicável:** Health Score dinâmico (0-100) calculado por seis dimensões ponderadas; outliers por IQR são anomalias reportadas, sem penalidade automática.
> 2. **Rigor Inferencial com Bonferroni:** Testes estatísticos Welch t-test, ANOVA e Qui-quadrado rodados via SciPy, corrigindo alfa por comparações múltiplas para mitigar falsos positivos.
> 3. **Data UX Avançada:** Grade de dados interativa com toggle "Saneado vs Bruto" mostrando as transformações do pipeline de dados, célula com anomaly highlights e Context Drawer lateral detalhado por coluna.
> 4. **Capa & Relatório PDF Executivo:** visão para impressão cuja paginação deve ser verificada no navegador e no dataset usados.
> 5. **Governança Responsible Analytics:** mascaramento de dados pessoais (PII) conforme a política configurada; não é certificação de conformidade.
>
> O DataFlow serve como auditoria de calibragem de processo — mostrando que engenharia de dados e responsabilidade social caminham de mãos dadas!
>
> 👉 Confira o repositório no GitHub: https://github.com/BarujaFe1/DataFlow
>
> #DataScience #DataEngineering #AnalyticsEngineering #FastAPI #NextJS #TypeScript #LGPD #EthicsInAI #BigData

---

## 5. Resumo para Currículo (CV Resume)

* **DataFlow (Analytics Engineering & Responsible Data Science Product):** Desenvolveu um monorepo local-first para ingestão, saneamento de dados tabulares e testes estatísticos inferenciais de processos seletivos. Criou um pipeline FastAPI (Python 3.12) com análises de outliers via IQR e testes Welch t-test, ANOVA e Qui-quadrado, com correção de Bonferroni quando aplicável. Projetou uma SPA em Next.js 15, Tailwind CSS v4, Recharts e TanStack Table v8, com grade interativa, destaques de anomalias, drawer de metadados semânticos e relatório executivo para impressão. Implementou mascaramento de PII conforme a política configurada, sem apresentá-lo como certificação legal.

---

## 6. GitHub About Summary (Descrição do Repositório)

> 📊 Web app monorepo (Next.js 15 + FastAPI) de profiling, saneamento e testes estatísticos (SciPy) para dados tabulares de recrutamento, com mascaramento de PII conforme a política configurada e relatórios executivos para impressão.

---

## 7. Atualização Técnica Pós-Auditoria (V1.4)

Após auditoria profunda do projeto, foram aplicadas as seguintes correções que elevam a defensabilidade técnica em entrevistas:

### Arquitetura estatística consolidada
- **Bonferroni movido para o backend**: o `routes.run_pipeline` agora computa `bonferroni_alpha = 0.05 / total_tests` e `corrected_significance` (p < α_adj) e envia no `InferenceResult`. Frontend (`executiveConclusions.ts`) prefere esses valores autoritativos; calcula fallback apenas para respostas antigas. **Resposta-padrão em entrevista**: "Bonferroni está centralizado no backend porque é onde os testes são executados em paralelo; dashboard e PDF consomem o mesmo número, eliminando divergência."

### Honestidade de visualização
- **Mini-vizes estatísticos deixaram de ser decorativos**: o `InferencePanel` agora recebe `charts.sources` da API e exibe as **taxas reais de aprovação por canal** no mini-gráfico do chi-quadrado (`source_channel`). Para `education_level` (sem série per-grupo na API) e para ANOVA (sem médias por grupo), inserimos notas honestas que conduzem o recrutador à tabela de registros em vez de nú硬os fabricados ("~11.8%" / "Dev Backend 73.8" removidos).
- **`parseTTestMeans`** não retorna mais médias fallback inventadas (82.5/58.3 etc.): se não conseguir parsear, o componente exibe placeholder neutro.

### Rigor estatístico reforçado
- **Cochran rule enforced** em `run_chi_square`: quando >20% das células esperadas têm contagem <5, a limitation #4 é adicionada ("considere Fisher exact ou agrupar categorias pequenas").
- **Levene's test real** em `run_anova`: a afirmação "testada via Levene" antes referia-se a um teste inexistente; agora é computado de fato, com p-value e verdict (variâncias homogêneas/heterogêneas) divulgados nas limitations.
- **Desduplicação antes da inferência**: `run_all_inference` agora filtra `is_duplicate == True` (como o aggregator já fazia), eliminando inflação de N e viesamento de p-valores por dup-count.

### Parser numérico BR-correto
- `cleaner.parse_float` agora converte corretamente `"R$ 5.500,00"` → `5500.0`, `"1.234,56"` → `1234.56`, `"1.500"` → `1500` (BR thousand-sep heuristic), mantendo `"1.5"` → `1.5` (US decimal).

### Tests + CI
- **Pytest dobrou**: 6 → **13 testes** (parser delimiter `;`, parse_float BR currency, chi-square, ANOVA+Levene, inference dedup, demo end-to-end smoke, etc.).
- **CI workflow** (`.github/workflows/ci.yml`) roda backend pytest + frontend lint/typecheck/build em Python 3.12 + Node 20 & 22. Status verde no README reflete sem exigir deploy.
- **`npm run typecheck`** finalmente existe (script `"tsc --noEmit"` adicionado ao `package.json`).

### Hygiene de repo
- **`LICENSE` MIT** agora presente (era afirmado no README mas inexistente).
- **5 assets `Imagem {1..5}.png` removidos** (confirmadas duplicatas MD5 redundantes de outros arquivos — ~6MB economizados).
- **CORS estrito** no FastAPI (lista explícita de origens em vez de `["*"]` + `credentials=True`).
- **`start.bat`** portável via `%~dp0` (não mais hardcoded para `C:\dev\DataFlow`).
- **README**: 4 links `file:///C:/dev/DataFlow/docs/...` trocados por caminhos relativos funcionais no GitHub.
- **`<html lang="pt-BR">`** no layout (era `lang="en"` em app PT-BR).
- **Methodology page** sem mais `**bold**` markdown literalmente impresso.

### CTAs quebrados
- `ExecutiveHero` agora rola para `#qualidade` e `#estatistica` (IDs reais no `page.tsx`); antes chamava `#quality-cockpit` / `#statistics-inference` que não existiam → botões pareciam mortos.
- `ResponsibleAnalyticsCenter` exibe o `kpis.duplicate_count` real em vez de "5 duplicatas" hardcoded — antes mentia sobre qualquer upload não-demo.

### Perguntas que Felipe deve saber responder após V1.4
1. **"Por que o Bonferroni no backend?"** → autoridade única; dashboard e PDF concordam; cliente só decora UI.
2. **"Os mini-gráficos do InferencePanel mostram dados reais?"** → sim, chi-square puxa `charts.sources`; ANOVA exibe nota honesta porque o backend ainda não envia médias por grupo (roadmap).
3. **"Comocalerias eu garantir 100k+ linhas?"** → virtualização (`@tanstack/react-virtual`) + paginação server-side (roadmap documentado em `release_notes_v1.3.md:51`).
4. **"Cochran/Levene só detectam problemas ou corrigem?"** → detectam e emitem warning; correção exigiria Fisher exact para χ² e Welch ANOVA/Kruskal-Wallis para ANOVA — roadmap.

### Resumo do resumo para entrevista

> "O DataFlow V1.4 é um produto local-first com pipeline de dados defensável: Bonferroni centralizado no backend, mini-gráficos que refletem dados reais da API (não fabricados), Cochran e Levene de verdade implementados com warnings, parser numérico que entende moeda BR, 13 testes pytest incluindo smoke-test end-to-end, e CI workflow que roda Tudo a cada push. Mantive a honestidade estatística como prioridade, mesmo que isso signifique exibir um placeholder 'ver tabela de registros' em vez de um número bonito que não vem dos dados."
