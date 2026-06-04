# prd.md

# PRD — DataFlow

## 1. Visão geral

**Nome do produto:** DataFlow  
**Diretório local:** `C:\dev\DataFlow`  
**Tipo:** Projeto âncora de portfólio em Análise de Dados, Ciência de Dados e Engenharia de Dados aplicada.  
**Interface:** Dark mode por padrão, Apple-like, elegante, moderna e minimalista.  
**Usuário principal:** Felipe Alirio Baruja, estudante de Estatística e Ciência de Dados na USP, interessado em vagas de Análise de Dados, Ciência de Dados e Engenharia de Dados.

O DataFlow é um produto web que transforma datasets tabulares brutos em um diagnóstico analítico completo. Ele deve demonstrar, em uma única peça de portfólio, a capacidade de receber dados reais ou sintéticos, validar qualidade, limpar, analisar, visualizar, interpretar estatisticamente e entregar um relatório final profissional.

O projeto deve unir padrões e aprendizados dos repositórios existentes de Felipe, especialmente Form2Dashboard, DataHealth-Profiler, StatLab-Experiments, SignalHub-APIs e AureaFinance.

## 2. Problema

Muitos processos analíticos começam com arquivos tabulares desorganizados: CSVs exportados de formulários, planilhas de processos seletivos, bases operacionais, relatórios manuais e dados com inconsistências. Antes de gerar insights, o analista precisa responder perguntas básicas:

- O dataset está utilizável?
- Quais colunas têm problemas?
- Há nulos, duplicatas, formatos inconsistentes ou outliers?
- Quais métricas resumem o processo?
- Existem padrões relevantes entre grupos?
- O resultado pode ser apresentado para alguém não técnico?

Normalmente, esse trabalho fica espalhado entre notebooks, planilhas, scripts e dashboards pouco reaproveitáveis. O DataFlow transforma esse fluxo em um produto único, apresentável e repetível.

## 3. Proposta de solução

O DataFlow permite que o usuário envie um arquivo CSV ou carregue um dataset demo. Em seguida, o sistema executa um pipeline de dados:

1. Ingestão.
2. Mapeamento de colunas.
3. Validação.
4. Limpeza básica.
5. Profiling de qualidade.
6. Geração de health score.
7. Cálculo de KPIs.
8. Análise descritiva.
9. Análise inferencial, quando cabível.
10. Visualização em dashboard.
11. Geração de relatório analítico executivo.

A V1 deve focar em datasets de processo seletivo/recrutamento, mas a arquitetura deve aceitar outros datasets tabulares no futuro.

## 4. Objetivos do produto

### 4.1 Objetivo principal

Criar um produto de portfólio forte, funcional e visualmente refinado que demonstre o ciclo completo de dados: do arquivo bruto até decisão e relatório.

### 4.2 Objetivos secundários

- Demonstrar domínio de Python, pandas, estatística, APIs e visualização.
- Demonstrar capacidade de construir produto full-stack com UX premium.
- Demonstrar maturidade em qualidade de dados e interpretação responsável.
- Reaproveitar padrões dos projetos existentes de Felipe.
- Servir como projeto principal do portfólio e GitHub.

## 5. Público-alvo

### 5.1 Usuário direto

Felipe, como autor do projeto, usando DataFlow para mostrar competência técnica em entrevistas, LinkedIn, GitHub e portfólio.

### 5.2 Usuário demonstrativo

Recrutadores, tech leads, analistas seniores, gestores de dados ou professores que desejam avaliar rapidamente a capacidade do projeto.

### 5.3 Usuário funcional futuro

Pequenas equipes, analistas ou pessoas de RH que recebem dados tabulares e querem uma primeira leitura de qualidade, métricas e relatório.

## 6. Posicionamento de portfólio

O DataFlow não deve parecer um experimento solto. Deve parecer um produto analítico com narrativa clara:

> “DataFlow transforma dados tabulares brutos em diagnóstico, dashboard e relatório executivo, combinando profiling de qualidade, análise estatística e visualização premium.”

A apresentação pública deve destacar:

- Problema real.
- Pipeline claro.
- Stack moderna.
- Rigor estatístico.
- Design premium.
- Cuidados éticos.
- Código limpo.
- Documentação profissional.

## 7. Escopo da V1

### 7.1 Incluído

- Upload de CSV.
- Dataset demo sintético.
- Mapeamento de colunas para schema padrão.
- Validação de dados.
- Limpeza básica.
- Profiling inicial.
- Health score.
- Flags de qualidade por coluna.
- KPIs executivos.
- Análise descritiva.
- Visualizações principais.
- Tabela interativa.
- Inferência estatística básica quando possível.
- Relatório HTML imprimível/exportável.
- README profissional.
- Documentação de arquitetura.
- Testes básicos.

### 7.2 Fora do escopo da V1

- Login/autenticação.
- Banco de dados persistente obrigatório.
- Upload de dados sensíveis reais.
- Governança enterprise.
- Data catalog completo.
- Monitoramento contínuo de pipelines.
- Treinamento de modelos preditivos complexos.
- Decisão automatizada sobre candidatos.
- Deploy obrigatório com backend complexo.
- Multiusuário.
- Integração obrigatória com Google Sheets na V1.

## 8. Dataset demo

A V1 deve incluir um dataset sintético de processo seletivo/recrutamento.

### 8.1 Campos sugeridos

- `candidate_id`
- `timestamp`
- `name`
- `email`
- `city`
- `state`
- `education_level`
- `experience_years`
- `source_channel`
- `role_applied`
- `stage`
- `score_test`
- `score_interview`
- `final_status`
- `salary_expectation`
- `availability`
- `remote_preference`

### 8.2 Anomalias intencionais

O dataset demo deve conter problemas controlados para demonstrar valor:

- E-mails duplicados.
- E-mails inválidos.
- Datas em formatos inconsistentes.
- Campos nulos.
- Categorias com casing inconsistente.
- Outliers em score ou expectativa salarial.
- Coluna com alta cardinalidade.
- Etapas do funil desbalanceadas.

### 8.3 Regras

- Dados devem ser sintéticos.
- README deve informar que são dados fictícios.
- Não usar nomes reais de candidatos.
- Não gerar inferências discriminatórias.

## 9. Requisitos funcionais

### RF01 — Tela inicial

A tela inicial deve explicar rapidamente o valor do produto e permitir:

- Carregar dataset demo.
- Fazer upload de CSV.
- Ver uma prévia do fluxo: Upload → Profiling → Dashboard → Relatório.

Critério de aceite: usuário consegue iniciar análise com dataset demo em até dois cliques.

### RF02 — Upload de CSV

O usuário deve poder enviar arquivo CSV.

Validações mínimas:

- Verificar extensão.
- Detectar arquivo vazio.
- Detectar erro de parse.
- Exibir mensagem amigável de erro.

Critério de aceite: arquivo válido gera preview; arquivo inválido gera erro claro.

### RF03 — Mapeamento de colunas

O sistema deve mapear colunas para um schema padrão.

Deve incluir:

- Auto-detecção por aliases comuns.
- Interface para correção manual.
- Indicação de campos obrigatórios e opcionais.

Critério de aceite: usuário consegue ajustar mapeamento antes de analisar.

### RF04 — Profiling de dados

O sistema deve calcular:

- Número de linhas.
- Número de colunas.
- Tipos inferidos.
- Missingness por coluna.
- Cardinalidade.
- Duplicatas.
- Estatísticas básicas para numéricas.
- Top valores para categóricas.

Critério de aceite: dashboard mostra diagnóstico inicial claro do dataset.

### RF05 — Health score

O sistema deve consolidar problemas em um score geral de saúde do dataset.

Exemplos de fatores:

- Completude.
- Duplicidade.
- Colunas vazias.
- Colunas constantes.
- Outliers extremos.
- Parsing inconsistente.

Critério de aceite: usuário entende rapidamente se a base está boa, média ou problemática.

### RF06 — Flags de qualidade

Cada coluna pode receber flags como:

- Alta taxa de nulos.
- Coluna vazia.
- Coluna constante.
- Possível identificador.
- Alta cardinalidade.
- Outliers.
- Distribuição muito assimétrica.
- Parsing suspeito.

Critério de aceite: tabela de colunas mostra flags interpretáveis.

### RF07 — Limpeza básica

O sistema deve aplicar normalizações seguras:

- Trim de strings.
- Padronização leve de casing.
- Parsing de datas comuns.
- Normalização de categorias conhecidas.
- Remoção ou marcação de duplicatas.

Critério de aceite: relatório deve informar o que foi limpo ou marcado.

### RF08 — KPIs executivos

Para dataset de processo seletivo, mostrar:

- Total de candidatos.
- Candidatos válidos.
- Taxa de aprovação/conversão.
- Etapa mais comum.
- Fonte com maior volume.
- Score médio.
- Duplicatas removidas/marcadas.
- Completude geral.

Critério de aceite: cards de KPI são claros, grandes e úteis.

### RF09 — Visualizações

Gráficos mínimos:

- Inscrições ao longo do tempo.
- Funil por etapa.
- Distribuição por fonte.
- Taxa de aprovação por fonte.
- Distribuição de scores.
- Missingness por coluna.

Critério de aceite: gráficos são legíveis em desktop e mobile.

### RF10 — Tabela interativa

A tabela deve permitir:

- Busca global.
- Filtro por etapa/status.
- Filtro por fonte/cargo quando aplicável.
- Ordenação.
- Paginação.

Critério de aceite: usuário consegue explorar registros sem travar a interface.

### RF11 — Análise inferencial

Quando houver dados suficientes, o sistema deve calcular testes estatísticos básicos e interpretar resultados.

Testes esperados:

- Qui-quadrado para associação entre variáveis categóricas e status final.
- Teste t ou Mann-Whitney para scores entre grupos binários.
- ANOVA ou Kruskal-Wallis para múltiplos grupos.
- Regressão logística simples se houver volume e variáveis adequadas.
- Intervalos de confiança para taxas relevantes.

Critério de aceite: inferência aparece apenas quando defensável e com aviso de limitação.

### RF12 — Interpretação textual

O sistema deve gerar frases interpretativas como:

- “A fonte X teve maior volume, mas menor taxa de avanço.”
- “A associação entre etapa e status final foi estatisticamente relevante, mas isso não implica causalidade.”
- “A base possui alta taxa de nulos em Y, exigindo cautela.”

Critério de aceite: uma pessoa não técnica entende os principais achados.

### RF13 — Relatório final

Gerar relatório HTML com aparência profissional, contendo:

- Sumário executivo.
- Qualidade dos dados.
- KPIs.
- Gráficos principais.
- Insights descritivos.
- Inferências quando disponíveis.
- Limitações.
- Recomendações.

Critério de aceite: relatório pode ser impresso como PDF pelo navegador ou exportado se implementado.

### RF14 — README e documentação

O README deve conter:

- Descrição do problema.
- Solução.
- Screenshots ou placeholders.
- Stack.
- Como rodar.
- Como usar demo data.
- Arquitetura.
- Decisões técnicas.
- Limitações éticas.
- Roadmap.

Critério de aceite: README é forte o suficiente para recrutadores entenderem o projeto sem rodar localmente.

## 10. Requisitos não funcionais

### RNF01 — Performance

- Dataset demo deve carregar rapidamente.
- Para V1, suportar confortavelmente pelo menos 5.000 linhas.
- Interface não deve congelar com dataset demo.

### RNF02 — Acessibilidade

- Contraste suficiente no dark mode.
- Componentes com labels claros.
- Estados de foco visíveis.
- Texto legível.

### RNF03 — Manutenibilidade

- Código tipado.
- Separação entre UI e lógica analítica.
- Funções pequenas e testáveis.
- Nomes explícitos.
- Sem abstrações desnecessárias.

### RNF04 — Confiabilidade analítica

- Não exibir inferência quando pressupostos mínimos não forem atendidos.
- Mostrar limitações.
- Não confundir correlação com causalidade.
- Não esconder problemas de qualidade.

### RNF05 — Segurança e privacidade

- V1 deve ser stateless sempre que possível.
- Não armazenar dados enviados sem necessidade.
- Dataset demo não pode conter dados reais.
- Não enviar dados para terceiros.

### RNF06 — Design

- Dark mode por padrão.
- Apple-like.
- Visual premium.
- Layout responsivo.
- Estados vazios, loading e erro bem acabados.

## 11. Métricas de sucesso

O projeto será bem-sucedido quando:

- Um recrutador entender o valor em menos de 60 segundos.
- O app rodar localmente com instruções claras.
- O dataset demo gerar dashboard completo.
- O upload de CSV funcionar.
- O relatório final parecer profissional.
- O código demonstrar maturidade técnica.
- O README contar uma boa história de portfólio.
- A análise estatística for cautelosa e útil.

## 12. Riscos

### Risco 1 — Escopo grande demais

Mitigação: construir fatia vertical primeiro: demo dataset → profiling → dashboard simples → relatório.

### Risco 2 — Inferência estatística frágil

Mitigação: implementar apenas testes com pressupostos mínimos e exibir avisos.

### Risco 3 — UI bonita mas sem substância

Mitigação: priorizar qualidade do pipeline, profiling e interpretação.

### Risco 4 — Produto técnico demais para recrutador

Mitigação: README e relatório devem traduzir resultados em linguagem clara.

### Risco 5 — Uso indevido em recrutamento real

Mitigação: incluir disclaimers éticos e não fazer decisão automatizada sobre candidatos.

## 13. Princípios do produto

1. Clareza acima de complexidade.
2. Análise útil acima de sofisticação vazia.
3. Estatística responsável acima de conclusão apressada.
4. UX premium acima de interface genérica.
5. Código simples acima de arquitetura exagerada.
6. Documentação forte acima de projeto “só código”.
7. Portfólio real acima de tutorial copiado.

## 14. Referências internas

Use como referência conceitual e técnica:

- Form2Dashboard: ingestão, mapeamento, limpeza, dashboard e dark mode.
- DataHealth-Profiler: profiling, flags e health score.
- StatLab-Experiments: testes, interpretação e guardrails estatísticos.
- SignalHub-APIs: backend analítico, observabilidade e qualidade.
- AureaFinance: local-first, importação, staging e auditabilidade.
- Felipe portfolio: narrativa e acabamento de apresentação.

## 15. Decisão de escopo final

A V1 do DataFlow deve ser um produto demonstrável, não uma plataforma infinita.

Entrega mínima obrigatória:

1. Dataset demo.
2. Upload CSV.
3. Profiling.
4. Health score.
5. Dashboard.
6. Inferência básica.
7. Relatório.
8. README premium.

## 16. Premium Upgrade — Executive Analytics Experience

Esta seção documenta as melhorias premium implementadas para elevar o DataFlow para um patamar de portfólio corporativo avançado:
- **Dashboard Executivo Elevado**: Dashboard agora conta com uma narrativa analítica clara, "Executive Data Briefing" (Hero) sumarizando o status do dataset em tempo real, "Insight Cards" de ação e diagnóstico baseados em regras, e uma "Pipeline Timeline" visual.
- **Cockpit de Qualidade de Dados (Data Quality Cockpit)**: Visualização rica das anomalias do dataset com o score de qualidade (Health Score) detalhando o breakdown das penalidades (nulos, duplicatas, e-mails inválidos, outliers) e comparação lado a lado de "Antes vs Depois da Limpeza".
- **Perfil das Colunas com Agrupamento**: Accordions de colunas agrupados logicamente (Identificadores, Datas, Categoriais, Métricas, Status e Colunas Sensíveis) para rápida orientação analítica.
- **Estatística Explicável**: Refinamento de testes estatísticos de hipóteses no painel de estatísticas, explicitando as Hipóteses Nula ($H_0$) e Alternativa ($H_1$), tamanho do efeito e impacto prático na decisão de negócios com nota de ética e responsabilidade.
- **Relatório PDF de Qualidade Corporativa**: Estilização robusta para impressão via `window.print()` gerando uma capa de relatório de consultoria, sumários executivos visuais e apêndice técnico de metodologias analíticas.
- **Modo Portfolio Showcase**: Página física `/showcase` criada para recepcionar recrutadores de dados, detalhando a arquitetura monorepo Next.js + FastAPI, stack, metodologia de modelagem e valor agregado do case.
- **Acessibilidade e Ética**: Contraste semântico legível e "Responsible Analytics Section" alertando sobre o uso de dados sensíveis e proibição de desclassificação automatizada baseada em IA.

