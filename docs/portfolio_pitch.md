# Roteiro de Apresentação e Pitch de Portfólio — DataFlow V1.3

Este documento serve como guia estratégico para apresentar o **DataFlow** em entrevistas de emprego para vagas de **Analytics Engineering, Data Science, Data Engineering e Front-end Architecture**.

---

## 1. Pitches de Portfólio

### ⚡ Pitch de 30 Segundos (Foco em Negócios e Agilidade)
> "O **DataFlow** é uma plataforma de Analytics Engineering que automatiza o saneamento e auditoria de planilhas de recrutamento brutas. Ele recebe arquivos em CSV, mapeia os campos automaticamente, aplica regras de integridade e calcula um **Health Score de Qualidade**. O sistema executa testes inferenciais estatísticos via SciPy com guardas de privacidade LGPD e compila tudo em um relatório executivo PDF de 9 páginas. Ele reduz o tempo de preparação de dados de horas para segundos, garantindo decisões baseadas em evidências confiáveis."

### ⏱️ Pitch de 60 Segundos (Foco em Rigor Estatístico e Valor Técnico)
> "Como engenheiro de dados e cientista de dados, vejo que muitas decisões corporativas são tomadas com base em planilhas corrompidas ou testes estatísticos mal interpretados. O **DataFlow** resolve isso encapsulando um pipeline analítico em um monorepo moderno. Desenvolvido com **Next.js 15** e **FastAPI (Python)**, o sistema higieniza categorias, formata datas, isola outliers via IQR e executa testes de hipóteses inferenciais robustos (como ANOVA e Welch t-test) corrigidos pelo método de **Bonferroni** para evitar falsos positivos. Ele protege dados pessoais (PII) por padrão sob a **LGPD** e gera relatórios executivos prontos para impressão."

### 💻 Pitch Técnico (Foco em Arquitetura de Software e Engenharia)
> "Do ponto de vista de arquitetura, o DataFlow foi estruturado como um monorepo desacoplado local-first. O frontend é uma SPA reativa em Next.js 15 que utiliza **Tailwind CSS v4** para estilo Apple-like, **Recharts** para gráficos SVG dinâmicos e **TanStack Table v8** com paginação e ordenação de performance. A API backend em FastAPI realiza o parse tolerante a delimitadores e codificações, profila e limpa dados com **pandas** e roda testes de hipóteses estatísticas com **SciPy**. Mapeamos aliases e expomos logs de normalização no frontend. A comunicação é stateless via JSON, e a renderização do PDF é feita aplicando-se estilos CSS `@media print` para ocultar artefatos do navegador."

### 👥 Pitch para Recrutador Não Técnico (Foco em Impacto de Negócio e Solução)
> "Muitas empresas perdem tempo limpando manualmente planilhas de vagas de emprego exportadas de sistemas como Gupy ou LinkedIn. Criei o **DataFlow** para ser um assistente virtual que faz esse trabalho chato instantaneamente. Ele analisa as planilhas, diz o quão confiáveis os dados são (com uma nota de 0 a 100), aponta problemas de digitação, remove cadastros repetidos e oculta informações confidenciais de candidatos para estar dentro da lei LGPD. Ao final, ele cria um relatório executivo de 9 páginas com visual de consultoria sênior, garantindo que o RH e os diretores tomem decisões justas e eficientes."

---

## 2. Roteiro de Demonstração ao Vivo (Live Demo Script)

1. **Abertura do Hero (Teste dos 5 Segundos):**
   * "Olá! Vou apresentar a tela inicial do DataFlow carregando o nosso dataset demonstrativo sintético de recrutamento de 305 candidatos. A primeira coisa que vemos em 5 segundos é o **Briefing Hero** com o Health Score de 82/100, classificado como 'Qualidade Boa'. Vemos badges sinalizando as diretrizes de LGPD ativas e o pipeline com steps de Ingestão, Saneamento e Inferência."
2. **Cockpit de Qualidade & Before/After:**
   * "Aqui vemos os cards de KPIs. O Cockpit de Qualidade mostra as deduções de pontuação: perdemos pontos por e-mails corrompidos e valores duplicados. O painel 'Antes vs Depois' deixa transparente que o pipeline removeu 5 cadastros duplicados e normalizou de forma silenciosa categorias inconsistentes (como 'superior completo' para 'Ensino Superior')."
3. **Exploração Visual do Funil e Distribuições:**
   * "Mais abaixo, temos o **Funil Operacional SVG** que calcula as perdas por etapa, a matriz de correlação Spearman para monitorar dispersões numéricas e o Boxplot que isola outliers de expectativas salariais absurdas."
4. **Auditoria de Células e o Context Drawer (Data UX):**
   * "Se descermos para a tabela de registros, notamos que o mascaramento LGPD de nomes e e-mails está ativo. Células contendo problemas como e-mails inválidos ou salários outliers ficam destacadas em vermelho/rose com tooltips explicativos. Clicando no ícone `(i)` no cabeçalho de uma coluna, abrimos um **Context Drawer lateral** detalhando a completude, tipo inferido, testes de hipótese associados e ações de engenharia recomendadas."
5. **Statistical Evidence Center (Mitigação de Falso Positivo):**
   * "Na seção de evidências estatísticas, audito se a escolaridade ou a nota de teste técnico de fato influenciam a aprovação. O Qui-Quadrado de escolaridade retornou p=0.0141, significativo nominalmente, mas classificado como **inconclusivo sob correção de Bonferroni** (onde o limite aceitável de 6 testes paralelos cai para p=0.0083). Isso evita que o gestor crie barreiras rígidas de diploma sem fundamentação matemática forte."
6. **Responsible Analytics & PDF Export:**
   * "Mostro o Responsible Analytics Center com o que é permitido e proibido fazer com a ferramenta. Para fechar, clico em 'Exportar PDF Executivo'. Como podem ver, o navegador abre a janela de impressão com um relatório de exatamente 9 páginas perfeitamente paginadas, com cabeçalhos limpos de URLs locais, rodapés com marcas de página e todas as visualizações em alta fidelidade."

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
> Em dados corporativos, o maior gargalo não é criar visualizações complexas, mas garantir a **qualidade**, o **rigor estatístico** e a **conformidade ética** das análises.
>
> O DataFlow é uma plataforma local-first desenvolvida com Next.js 15, Tailwind v4 e FastAPI (Python) para converter planilhas brutas em relatórios executivos confiáveis.
>
> 💡 **O que diferenciou esta versão (V1.3):**
> 1. **Data Quality Score Explicável:** Health Score dinâmico (0-100) deduzido com base em taxas de nulos, duplicatas e outliers (IQR).
> 2. **Rigor Inferencial com Bonferroni:** Testes estatísticos Welch t-test, ANOVA e Qui-quadrado rodados via SciPy, corrigindo alfa por comparações múltiplas para mitigar falsos positivos.
> 3. **Data UX Avançada:** Grade de dados interativa com toggle "Saneado vs Bruto" mostrando as transformações do pipeline de dados, célula com anomaly highlights e Context Drawer lateral detalhado por coluna.
> 4. **Capa & Relatório PDF Executivo:** 9 páginas perfeitamente distribuídas livres de cabeçalhos de navegador.
> 5. **Governança Responsible Analytics:** Mascaramento nativo de dados pessoais (PII) sob as diretrizes da LGPD.
>
> O DataFlow serve como auditoria de calibragem de processo — mostrando que engenharia de dados e responsabilidade social caminham de mãos dadas!
>
> 👉 Confira o repositório no GitHub: https://github.com/BarujaFe1/DataFlow
>
> #DataScience #DataEngineering #AnalyticsEngineering #FastAPI #NextJS #TypeScript #LGPD #EthicsInAI #BigData

---

## 5. Resumo para Currículo (CV Resume)

* **DataFlow (Analytics Engineering & Responsible Data Science Product):** Desenvolveu um monorepo local-first para ingestão, saneamento de dados tabulares e testes estatísticos inferenciais de processos seletivos. Criou um pipeline completo em FastAPI (Python 3.12) integrando análises de outliers via IQR (Interquartile Range) e testes inferenciais (Welch t-test, ANOVA, Qui-quadrado) acoplados com mitigação de falsos positivos via correção de Bonferroni. Projetou a interface SPA premium dark mode em Next.js 15, Tailwind CSS v4, Recharts e TanStack Table v8, implementando grade de dados interativa com destaques de anomalias em nível de célula, drawer lateral de metadados semânticos e exportação de relatório A4 executivo de exatamente 9 páginas perfeitamente formatado via print stylesheet. Garantiu conformidade LGPD por padrão com mascaramento nativo de PII.

---

## 6. GitHub About Summary (Descrição do Repositório)

> 📊 Web app monorepo (Next.js 15 + FastAPI) de profiling, saneamento e testes estatísticos (SciPy) para dados tabulares de recrutamento, com mascaramento LGPD nativo de PII e geração de relatórios executivos em PDF de 9 páginas.
