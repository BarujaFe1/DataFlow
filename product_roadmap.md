# product_roadmap.md

# Product Roadmap — DataFlow

## 1. Estratégia geral

O DataFlow deve ser construído por fases, sempre com entregas verificáveis. A prioridade é criar primeiro uma fatia vertical funcional e depois adicionar profundidade analítica, polimento visual e documentação.

A ordem correta é:

1. Base do projeto.
2. Dataset demo.
3. Pipeline mínimo.
4. Dashboard inicial.
5. Profiling/health score.
6. Visualizações e tabela.
7. Inferência estatística.
8. Relatório.
9. Polimento de portfólio.
10. Testes e validação final.

Não pular para features avançadas antes da fatia vertical funcionar.

## 2. Fase 0 — Preparação e leitura de contexto

### Objetivo

Preparar o ambiente, confirmar escopo e alinhar a execução com os documentos do projeto.

### Tarefas

- Verificar que o diretório ativo é `C:\dev\DataFlow`.
- Ler `CLAUDE.md` existente no projeto.
- Ler `prd.md`, `product_roadmap.md` e `design.md`.
- Listar arquivos existentes.
- Identificar se já existe package.json, pyproject.toml, app Next ou API Python.
- Declarar suposições.
- Escolher stack final entre:
  - Next.js full-stack simples.
  - Monorepo Next.js + FastAPI.
- Antes de instalar dependências, pedir confirmação.

### Dependências

Nenhuma.

### Critérios de aceite

- Plano de execução curto gerado.
- Stack justificada.
- Riscos identificados.
- Nenhuma alteração grande feita sem confirmação.

## 3. Fase 1 — Bootstrap do projeto

### Objetivo

Criar a estrutura inicial e fazer o projeto rodar localmente.

### Tarefas

- Criar estrutura base conforme `design.md`.
- Configurar Next.js com TypeScript strict.
- Configurar Tailwind CSS.
- Configurar base visual dark mode.
- Criar layout principal.
- Criar página inicial.
- Criar README inicial.
- Se usar FastAPI, criar app básico com endpoint `/health`.
- Criar scripts de desenvolvimento.

### Dependências

Fase 0 concluída.

### Entregáveis

- Projeto inicial rodando.
- Página inicial dark Apple-like.
- Endpoint de saúde, se houver backend.
- README com instruções provisórias.

### Critérios de aceite

- `npm run dev` ou equivalente funciona.
- App abre no navegador.
- Tela inicial tem identidade DataFlow.
- Dark mode é padrão.

## 4. Fase 2 — Dataset demo e schema analítico

### Objetivo

Criar base demo sintética e schema padrão para análise.

### Tarefas

- Criar `data/seed/processo_seletivo_demo.csv`.
- Garantir que o dataset é sintético.
- Incluir anomalias controladas.
- Definir tipos internos do domínio.
- Definir schema de mapeamento.
- Definir aliases de colunas.
- Criar documentação curta do dataset.

### Dependências

Fase 1 concluída.

### Entregáveis

- Dataset demo com 200 a 500 linhas.
- Schema TypeScript e/ou Pydantic.
- Lista de aliases.
- Botão “Carregar demo”.

### Critérios de aceite

- Dataset demo carrega sem upload.
- Dataset contém problemas suficientes para demonstrar profiling.
- README deixa claro que os dados são fictícios.

## 5. Fase 3 — Ingestão, parsing e mapeamento

### Objetivo

Permitir que o usuário envie CSV e mapeie colunas.

### Tarefas

- Implementar upload de CSV.
- Implementar parser robusto.
- Tratar erro de arquivo vazio.
- Tratar erro de parse.
- Criar preview tabular.
- Criar auto-mapping baseado em aliases.
- Criar UI para revisão de mapeamento.
- Diferenciar campos obrigatórios e opcionais.

### Dependências

Fase 2 concluída.

### Entregáveis

- Upload funcional.
- Preview de dados.
- Auto-mapping.
- Mapeamento manual.

### Critérios de aceite

- CSV demo e CSV externo funcionam.
- Usuário consegue corrigir mapeamento.
- Erros aparecem de forma amigável.

## 6. Fase 4 — Validação, limpeza e profiling

### Objetivo

Transformar dados brutos em diagnóstico estruturado de qualidade.

### Tarefas

- Validar campos obrigatórios.
- Detectar duplicatas.
- Validar e-mails, se existirem.
- Fazer parsing de datas.
- Inferir tipos.
- Calcular missingness.
- Calcular cardinalidade.
- Calcular estatísticas numéricas.
- Calcular top valores categóricos.
- Detectar colunas constantes.
- Detectar possíveis identificadores.
- Detectar outliers simples.
- Gerar quality flags.
- Gerar health score.

### Dependências

Fase 3 concluída.

### Entregáveis

- Pipeline de profiling.
- Quality flags por coluna.
- Health score geral.
- Resumo de limpeza.

### Critérios de aceite

- Dataset demo gera flags previsíveis.
- Problemas são explicados claramente.
- Funções principais têm testes básicos.

## 7. Fase 5 — Dashboard analítico

### Objetivo

Apresentar resultados em uma interface premium e útil.

### Tarefas

- Criar layout de dashboard.
- Criar cards de KPI.
- Criar gráfico de inscrições no tempo.
- Criar gráfico de funil por etapa.
- Criar distribuição por fonte.
- Criar taxa de aprovação por fonte.
- Criar missingness por coluna.
- Criar distribuição de score.
- Criar tabela interativa com filtros.
- Criar painel de qualidade.
- Criar detalhe por coluna.

### Dependências

Fase 4 concluída.

### Entregáveis

- Dashboard funcional.
- Gráficos principais.
- Tabela interativa.
- UI responsiva.

### Critérios de aceite

- Dados demo aparecem em todos os componentes.
- Interface é dark, elegante e consistente.
- Tabela permite explorar dados.
- Layout funciona em desktop e mobile.

## 8. Fase 6 — Análise inferencial

### Objetivo

Adicionar rigor estatístico com interpretação responsável.

### Tarefas

- Criar módulo de inferência.
- Implementar critérios mínimos para rodar cada teste.
- Implementar qui-quadrado para categóricas.
- Implementar teste t ou Mann-Whitney para dois grupos.
- Implementar ANOVA ou Kruskal-Wallis para múltiplos grupos.
- Implementar intervalo de confiança para taxas.
- Opcional: regressão logística simples.
- Gerar interpretação textual.
- Gerar avisos de limitação.

### Dependências

Fase 4 concluída. Idealmente Fase 5 em andamento ou concluída.

### Entregáveis

- Cards de inferência.
- Tabela de resultados estatísticos.
- Interpretações em linguagem natural.
- Guardrails éticos.

### Critérios de aceite

- Inferência não roda quando dados são insuficientes.
- Resultados têm interpretação cautelosa.
- Não há linguagem de causalidade indevida.

## 9. Fase 7 — Relatório analítico

### Objetivo

Gerar relatório executivo exportável/imprimível.

### Tarefas

- Criar página `/report` ou modal de relatório.
- Incluir sumário executivo.
- Incluir qualidade dos dados.
- Incluir KPIs.
- Incluir gráficos principais.
- Incluir insights descritivos.
- Incluir inferência, se disponível.
- Incluir limitações.
- Incluir recomendações.
- Criar estilo de impressão.
- Permitir exportar/imprimir para PDF.

### Dependências

Fases 5 e 6 concluídas.

### Entregáveis

- Relatório HTML.
- Botão “Gerar relatório”.
- CSS de impressão.

### Critérios de aceite

- Relatório parece profissional.
- Pode ser salvo como PDF via navegador.
- Texto é compreensível para não técnicos.

## 10. Fase 8 — Polimento de UX e estética Apple-like

### Objetivo

Elevar acabamento visual para nível de portfólio premium.

### Tarefas

- Refinar tokens de design.
- Ajustar espaçamentos.
- Melhorar tipografia.
- Criar estados vazios.
- Criar skeleton loaders.
- Criar erros amigáveis.
- Melhorar responsividade.
- Adicionar microinterações discretas.
- Verificar contraste.
- Remover aparência genérica.

### Dependências

Dashboard e relatório funcionais.

### Entregáveis

- UI polida.
- Dark mode consistente.
- Experiência fluida.

### Critérios de aceite

- Interface parece moderna e autoral.
- Nenhum componente parece template bruto.
- UX comunica confiança e precisão.

## 11. Fase 9 — README, documentação e case study

### Objetivo

Preparar o projeto para GitHub e portfólio.

### Tarefas

- Escrever README premium.
- Incluir narrativa do problema.
- Incluir screenshots ou placeholders.
- Incluir stack.
- Incluir arquitetura.
- Incluir comandos.
- Incluir limitações éticas.
- Incluir roadmap futuro.
- Criar `docs/architecture.md`, se necessário.
- Criar seção de case study.

### Dependências

Produto minimamente funcional.

### Entregáveis

- README final.
- Documentação complementar.
- Texto pronto para portfólio.

### Critérios de aceite

- Recrutador entende o projeto sem rodar.
- Dev consegue rodar localmente.
- README comunica valor técnico e de negócio.

## 12. Fase 10 — Testes e validação final

### Objetivo

Garantir que a entrega está estável e verificável.

### Tarefas

- Testar parser.
- Testar mapper.
- Testar profiler.
- Testar health score.
- Testar agregações.
- Testar inferência mínima.
- Rodar lint.
- Rodar typecheck.
- Rodar testes.
- Verificar build.
- Revisar README.

### Dependências

Fases anteriores concluídas.

### Entregáveis

- Testes básicos.
- Scripts funcionando.
- Relatório de validação.

### Critérios de aceite

- Comandos documentados funcionam.
- Não há erros de lint/typecheck críticos.
- Dataset demo cobre fluxo principal.

## 13. Ordem sugerida de implementação técnica

1. Criar estrutura do projeto.
2. Criar tela inicial dark.
3. Criar dataset demo.
4. Criar loader do dataset demo.
5. Criar parser CSV.
6. Criar schema e mapper.
7. Criar profiler.
8. Criar KPIs.
9. Criar dashboard básico.
10. Criar tabela.
11. Criar charts.
12. Criar inferência.
13. Criar relatório.
14. Criar testes.
15. Criar README final.

## 14. Marcos de entrega

### M1 — “O app existe”

- App roda.
- UI inicial existe.
- README inicial existe.

### M2 — “Dados entram”

- Dataset demo carrega.
- Upload CSV funciona.
- Preview aparece.

### M3 — “Dados são entendidos”

- Profiling funciona.
- Health score aparece.
- Flags aparecem.

### M4 — “Dados viram decisão”

- Dashboard tem KPIs e gráficos.
- Tabela filtra e ordena.
- Insights são exibidos.

### M5 — “Dados têm rigor”

- Inferência básica funciona.
- Limitações são exibidas.

### M6 — “Dados viram entrega”

- Relatório está pronto.
- README está forte.
- Projeto é apresentável.

## 15. Backlog futuro

Após V1:

- Importação XLSX.
- Google Sheets URL import.
- Exportação PDF nativa.
- Comparação entre dois datasets.
- Salvamento local de sessões.
- Templates por domínio: RH, vendas, eventos, educação.
- Regras customizadas de qualidade.
- Mais testes estatísticos.
- Integração com portfólio pessoal.
- Deploy com demo pública.

## 16. Regra de prioridade

Se houver conflito entre beleza, escopo e funcionamento:

1. Funcionamento mínimo.
2. Correção analítica.
3. Clareza de UX.
4. Beleza visual.
5. Features extras.

Não implementar features extras antes da V1 estar sólida.

## 17. Premium Upgrade — Executive Analytics Experience

Esta rodada de melhorias insere novas fases e marcos de portfólio no roadmap de desenvolvimento do DataFlow:
- **Design System Premium Dark**: Polimento completo com variáveis de profundidade semântica para UI Apple-like.
- **Narrativa Analítica**: Criação do dashboard inteligente (briefing executivo, timeline de execução do pipeline, cockpit side-by-side de limpeza de dados).
- **Rigor Científico Didático**: Refinamento de testes estatísticos com hipóteses, tamanho de efeito, e notas de ética aplicada.
- **Modo Showcase (/showcase)**: Uma landing page de portfólio para recrutadores explorarem o case técnico e metodologias rapidamente.
- **Impressão PDF de Nível Executivo**: Formatação de impressão com quebras de página automáticas e folha de rosto.

