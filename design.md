# design.md

# Design Técnico — DataFlow

## 1. Objetivo arquitetural

O DataFlow deve ser um produto de análise tabular com arquitetura simples, modular e demonstrável. A arquitetura deve separar claramente:

- Interface.
- Pipeline de ingestão.
- Validação e limpeza.
- Profiling.
- Agregações.
- Inferência estatística.
- Relatório.
- Documentação.

O sistema deve ser fácil de explicar em entrevista e fácil de evoluir no GitHub.

## 2. Stack recomendada

### 2.1 Stack preferencial

Recomenda-se usar monorepo com:

- `apps/web`: Next.js 15, React, TypeScript, Tailwind CSS.
- `apps/api`: FastAPI, Python, pandas, scipy, statsmodels, pydantic.

Essa escolha favorece o posicionamento de Felipe em dados, pois demonstra front-end suficiente para produto, mas mantém a análise pesada em Python.

### 2.2 Stack alternativa simplificada

Se o ambiente ou tempo não permitir backend Python, a V1 pode ser implementada como Next.js-only, com pipeline em TypeScript. Nesse caso, manter a estrutura de pastas preparada para futura API Python.

### 2.3 Decisão padrão

Use **Next.js + FastAPI** se possível.

Justificativa:

- Python é central para análise de dados.
- FastAPI demonstra API e engenharia de dados aplicada.
- Next.js entrega UX premium.
- A separação ajuda a explicar arquitetura.

## 3. Estrutura de pastas recomendada

```text
DataFlow/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── report/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   ├── upload/
│   │   │   ├── mapping/
│   │   │   ├── report/
│   │   │   ├── charts/
│   │   │   ├── table/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── formatters.ts
│   │   │   ├── chart-data.ts
│   │   │   └── utils.ts
│   │   ├── store/
│   │   │   └── analysis-store.ts
│   │   ├── types/
│   │   │   └── analysis.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── api/
│       ├── app/
│       │   ├── main.py
│       │   ├── api/
│       │   │   └── routes.py
│       │   ├── core/
│       │   │   ├── config.py
│       │   │   └── errors.py
│       │   ├── models/
│       │   │   ├── schemas.py
│       │   │   └── domain.py
│       │   ├── services/
│       │   │   ├── parser.py
│       │   │   ├── mapper.py
│       │   │   ├── validator.py
│       │   │   ├── cleaner.py
│       │   │   ├── profiler.py
│       │   │   ├── aggregator.py
│       │   │   ├── inference.py
│       │   │   └── report_builder.py
│       │   └── tests/
│       │       ├── test_profiler.py
│       │       ├── test_aggregator.py
│       │       └── test_inference.py
│       ├── pyproject.toml
│       └── README.md
├── data/
│   ├── seed/
│   │   └── processo_seletivo_demo.csv
│   └── README.md
├── docs/
│   ├── architecture.md
│   ├── screenshots/
│   └── case-study.md
├── prd.md
├── product_roadmap.md
├── design.md
├── CLAUDE.md
├── README.md
└── .gitignore
```

Se usar estrutura mais simples, preservar os conceitos de separação mesmo que as pastas mudem.

## 4. Arquitetura lógica

```text
[CSV Upload ou Demo Dataset]
        ↓
[Parser]
        ↓
[Column Mapper]
        ↓
[Validator]
        ↓
[Cleaner]
        ↓
[Profiler]
        ↓
[Aggregator]
        ↓
[Inference Engine]
        ↓
[Dashboard + Report]
```

## 5. Fluxo de dados

### 5.1 Entrada

A entrada pode vir de:

- CSV enviado pelo usuário.
- CSV demo local.

Futuro:

- XLSX.
- Google Sheets.
- API externa.

### 5.2 Parsing

Responsabilidades:

- Ler arquivo.
- Detectar delimitador quando possível.
- Tratar encoding comum.
- Detectar arquivo vazio.
- Retornar linhas brutas.

### 5.3 Mapeamento

Responsabilidades:

- Mapear colunas brutas para schema padrão.
- Usar aliases.
- Permitir revisão manual.
- Registrar campos ausentes.

Exemplo de aliases:

```ts
const aliases = {
  timestamp: ['timestamp', 'data', 'data_inscricao', 'carimbo de data/hora'],
  email: ['email', 'e-mail', 'mail'],
  name: ['nome', 'name', 'candidato'],
  source_channel: ['origem', 'source', 'canal', 'utm_source'],
  final_status: ['status', 'resultado', 'final_status', 'aprovado'],
};
```

### 5.4 Validação

Responsabilidades:

- Validar campos obrigatórios.
- Validar formatos.
- Detectar nulos.
- Detectar e-mails inválidos.
- Marcar linhas problemáticas.

Não ocultar erros. O usuário deve ver o que aconteceu.

### 5.5 Limpeza

Responsabilidades:

- Trim.
- Normalização leve.
- Parsing de datas.
- Conversão numérica.
- Padronização de categorias.
- Marcação de duplicatas.

Limpeza deve ser segura. Não inventar valores sem explicar.

### 5.6 Profiling

Responsabilidades:

- Inferir tipos.
- Calcular completude.
- Calcular cardinalidade.
- Detectar constantes.
- Detectar possíveis IDs.
- Calcular estatísticas.
- Calcular top categorias.
- Detectar outliers simples.
- Gerar flags.

### 5.7 Agregação

Responsabilidades:

- KPIs principais.
- Séries temporais.
- Funil.
- Distribuições.
- Taxas por grupo.
- Dados prontos para gráficos.

### 5.8 Inferência

Responsabilidades:

- Verificar se o teste é aplicável.
- Rodar teste.
- Calcular estatística, p-valor e tamanho de efeito quando possível.
- Gerar interpretação.
- Gerar avisos.

### 5.9 Relatório

Responsabilidades:

- Transformar outputs analíticos em narrativa.
- Organizar sumário executivo.
- Incluir limitações.
- Preparar HTML imprimível.

## 6. API proposta

Se usar FastAPI, endpoints sugeridos:

### GET `/health`

Retorna status da API.

Resposta:

```json
{
  "status": "ok",
  "service": "dataflow-api"
}
```

### POST `/analyze`

Recebe arquivo CSV e configuração de mapeamento opcional.

Resposta:

```json
{
  "dataset": {
    "rows": 320,
    "columns": 16,
    "valid_rows": 298
  },
  "quality": {
    "health_score": 82,
    "flags": []
  },
  "kpis": {},
  "charts": {},
  "inference": {},
  "insights": []
}
```

### GET `/demo`

Retorna análise do dataset demo ou o próprio dataset demo.

### POST `/report`

Opcional. Gera HTML do relatório com base nos resultados.

## 7. Modelos de dados

### 7.1 CandidateRecord

```ts
export type CandidateRecord = {
  candidate_id?: string;
  timestamp?: string;
  name?: string;
  email?: string;
  city?: string;
  state?: string;
  education_level?: string;
  experience_years?: number;
  source_channel?: string;
  role_applied?: string;
  stage?: string;
  score_test?: number;
  score_interview?: number;
  final_status?: string;
  salary_expectation?: number;
  availability?: string;
  remote_preference?: string;
};
```

### 7.2 ColumnProfile

```ts
export type ColumnProfile = {
  name: string;
  inferred_type: 'string' | 'number' | 'date' | 'boolean' | 'unknown';
  missing_count: number;
  missing_rate: number;
  unique_count: number;
  unique_rate: number;
  flags: string[];
  stats?: {
    mean?: number;
    median?: number;
    min?: number;
    max?: number;
    std?: number;
  };
  top_values?: Array<{ value: string; count: number; rate: number }>;
};
```

### 7.3 AnalysisResult

```ts
export type AnalysisResult = {
  metadata: {
    generated_at: string;
    source: 'demo' | 'upload';
    rows: number;
    columns: number;
  };
  quality: {
    health_score: number;
    summary: string;
    columns: ColumnProfile[];
    dataset_flags: string[];
  };
  kpis: Record<string, number | string>;
  charts: Record<string, unknown>;
  inference: InferenceResult[];
  insights: string[];
  limitations: string[];
};
```

## 8. Health score

O health score deve ser simples, explicável e não parecer mágico.

Pontuação inicial: 100.

Penalidades sugeridas:

- Alta taxa geral de nulos: até -25.
- Duplicatas: até -15.
- Colunas vazias: -10 por coluna relevante.
- Colunas constantes: -5 por coluna.
- Parsing problemático: até -15.
- Outliers extremos: até -10.
- Campos obrigatórios ausentes: até -20.

Score final:

- 85–100: saudável.
- 70–84: atenção leve.
- 50–69: atenção moderada.
- 0–49: crítico.

Sempre explicar os principais fatores que reduziram o score.

## 9. Inferência estatística

### 9.1 Regras gerais

- Nunca rodar teste sem amostra mínima.
- Nunca apresentar p-valor como verdade absoluta.
- Sempre incluir interpretação prática.
- Sempre incluir limitação.
- Não usar variáveis sensíveis como base decisória.

### 9.2 Testes

#### Qui-quadrado

Uso:

- Associação entre `source_channel`, `education_level`, `role_applied` ou `stage` e `final_status`.

Saída:

- Estatística.
- p-valor.
- graus de liberdade.
- interpretação.

#### Teste t ou Mann-Whitney

Uso:

- Comparar `score_test` ou `score_interview` entre aprovados e não aprovados.

Escolha:

- Teste t quando pressupostos mínimos parecerem aceitáveis.
- Mann-Whitney como alternativa não paramétrica.

#### ANOVA ou Kruskal-Wallis

Uso:

- Comparar score entre múltiplas fontes, cargos ou etapas.

#### Regressão logística

Uso opcional:

- Estimar associação entre variáveis explicativas e status binário.

Condições:

- Volume suficiente.
- Variáveis codificáveis.
- Sem prometer causalidade.
- Exibir como análise exploratória.

## 10. Design visual

### 10.1 Direção

- Dark mode default.
- Apple-like.
- Premium.
- Minimalista.
- Foco em dados.

### 10.2 Tokens sugeridos

```css
--background: #050506;
--surface: #0d0d10;
--surface-elevated: #141418;
--border-subtle: rgba(255, 255, 255, 0.08);
--text-primary: #f5f5f7;
--text-secondary: #a1a1aa;
--text-muted: #71717a;
--accent: #8ab4ff;
--accent-success: #7ee787;
--accent-warning: #f2cc60;
--accent-danger: #ff7b72;
```

### 10.3 Componentes principais

- Hero section.
- Upload dropzone.
- Demo dataset card.
- Pipeline progress indicator.
- KPI cards.
- Health score ring/bar.
- Quality flags table.
- Charts grid.
- Interactive data table.
- Inference cards.
- Report preview.
- Empty/loading/error states.

### 10.4 Regras visuais

- Nada de cores excessivas.
- Gráficos devem usar poucas cores.
- Usar hierarquia visual forte.
- Evitar bordas grossas.
- Usar sombras discretas.
- Garantir legibilidade.
- Evitar estética “admin dashboard genérico”.

## 11. Estados de UI

Implementar estados para:

- Sem arquivo carregado.
- Carregando demo.
- Fazendo upload.
- Processando análise.
- Erro de parse.
- Erro de API.
- Dataset sem colunas suficientes.
- Inferência indisponível.
- Relatório pronto.

## 12. Testes

### 12.1 Testes mínimos

- Parser lê CSV válido.
- Parser rejeita CSV vazio.
- Mapper detecta aliases comuns.
- Profiler calcula missingness corretamente.
- Health score penaliza problemas.
- Aggregator calcula KPIs.
- Inferência não roda sem dados suficientes.

### 12.2 Comandos esperados

Ajustar conforme stack real:

```bash
npm run lint
npm run typecheck
npm run test
npm run dev
```

Se houver API Python:

```bash
python -m pytest
python -m ruff check .
uvicorn app.main:app --reload
```

## 13. README final

O README deve funcionar como peça de venda técnica.

Estrutura sugerida:

1. Banner ou título forte.
2. Frase curta de valor.
3. Screenshots.
4. Problema.
5. Solução.
6. Funcionalidades.
7. Pipeline.
8. Stack.
9. Arquitetura.
10. Como rodar.
11. Dataset demo.
12. Análises estatísticas.
13. Limitações éticas.
14. Roadmap.
15. Autor.

## 14. Integração com repositórios existentes

Não copiar código sem revisar. Buscar padrões:

- `Form2Dashboard`: parser, mapper, validator, cleaner, aggregator, dashboard.
- `DataHealth-Profiler`: profiling, flags, score, relatório visual.
- `StatLab-Experiments`: inferência, decisão, guardrails.
- `SignalHub-APIs`: API, organização, status e observabilidade.
- `AureaFinance`: local-first, importação, staging e rastreabilidade.
- `Soniva`: job tracking e feedback de processamento.
- `felipe-baruja-portfolio`: narrativa e acabamento.

Se clonar repositórios de referência, colocá-los em `.reference_repos/` e adicionar essa pasta ao `.gitignore`.

## 15. Segurança e ética

Como o domínio envolve dados de candidatos:

- Não usar dados reais.
- Não expor PII no README.
- Não criar ranking individual de candidatos.
- Não recomendar contratação/reprovação automática.
- Não incentivar uso de variáveis sensíveis.
- Exibir disclaimers em relatório.
- Tratar resultados como diagnóstico de processo.

## 16. Critérios técnicos finais

O projeto estará pronto para V1 quando:

- Rodar localmente.
- Dataset demo carregar.
- Upload CSV funcionar.
- Pipeline gerar resultado.
- Dashboard mostrar KPIs, gráficos e tabela.
- Health score e flags aparecerem.
- Inferência aparecer quando aplicável.
- Relatório for gerado.
- README estiver profissional.
- Testes básicos passarem.
- UI estiver dark Apple-like.

## 17. Decisão arquitetural importante

Evitar complexidade especulativa.

Não adicionar:

- autenticação;
- banco persistente;
- fila de jobs;
- microsserviços;
- permissões;
- deploy complexo;
- IA generativa dentro do app;
- automações externas;
- integrações não necessárias.

A V1 deve ser enxuta, funcional e impressionante pelo acabamento e pela clareza analítica.

## 18. Premium Upgrade — Executive Analytics Experience

Esta seção define as diretrizes de arquitetura visual e lógica criadas no upgrade de portfólio:
- **Camadas de Superfície Dark**: Utilização de profundidade de cor HSL personalizada no Tailwind para criar cards elevados e glassmorphism refinado, além de contraste de texto validado (acima de 4.5:1).
- **Roteamento Showcase**: Criação de uma rota física de Next.js (`apps/web/app/showcase/page.tsx`) dedicada a explicar a arquitetura monorepo e metodologia do projeto.
- **Engine de Insights no Client**: Módulo `apps/web/lib/insights/generateInsights.ts` que lê a resposta da API e gera insights categorizados ("Risco", "Oportunidade", "Ação") sem sobrecarregar o backend.
- **Formatação de Impressão (PDF)**: Layout de impressão do relatório reorganizado com capa profissional, apêndice técnico e conversão automática para tema claro durante a geração de PDF.

