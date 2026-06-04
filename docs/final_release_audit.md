# Auditoria Final de Release — DataFlow V1.3

Este documento registra a auditoria final obrigatória de consistência, arquitetura e qualidade para o lançamento oficial do **DataFlow** (versão V1.3) no GitHub.

---

## 1. Stack Tecnológica Detectada
* **Frontend**: Next.js 15.5.19 (com suporte experimental a Turbopack in-dev, TypeScript 5.x, React 19), Tailwind CSS v4, Recharts v3.8.1 e TanStack Table v8.21.3.
* **Backend**: Python 3.12, FastAPI, Uvicorn, pandas, NumPy, SciPy (para os testes estatísticos e profiling de dados).
* **Orquestração local**: Script em lotes Windows (`start.bat`).

---

## 2. Estrutura de Apps e Pacotes
A arquitetura do DataFlow está estruturada como um monorrepósio simples:
```text
DataFlow/
├── apps/
│   ├── web/                         # Frontend em Next.js 15
│   │   ├── app/                     # Rotas e Páginas (App Router)
│   │   ├── components/              # Componentes de interface do Dashboard e Relatórios
│   │   │   ├── charts/              # Boxplot, Correlação, Funil SVG, Waterfall
│   │   │   ├── dashboard/           # Heros, KPICards, SidebarNav, Responsible Analytics
│   │   │   ├── report/              # ReportView (Impressão do PDF)
│   │   │   ├── table/               # DataTable (Exibição e ações sobre a tabela)
│   │   │   └── upload/              # Componente de upload de CSV
│   │   ├── lib/                     # Utilitários (privacidade, masking, conclusions, api)
│   │   └── types/                   # Tipagens TypeScript para dados e análises
│   └── api/                         # Backend em FastAPI/Python
│       ├── app/                     # Código fonte da API
│       │   ├── api/                 # Rotas da API (/health, /demo, /analyze)
│       │   ├── models/              # Esquemas de dados Pydantic
│       │   └── services/            # Pipeline analítico (profiler, cleaner, inference, aggregator)
│       └── tests/                   # Testes automatizados com pytest
├── data/
│   └── seed/                        # Dataset demo sintético (processo_seletivo_demo.csv)
├── docs/                            # Documentação complementar do projeto
├── README.md                        # Documentação técnica e de portfólio no GitHub
└── start.bat                        # Script de inicialização integrada local
```

---

## 3. Scripts Disponíveis
### Frontend (`apps/web`):
* `npm run dev`: Inicia o servidor Next.js em modo desenvolvimento com Turbopack.
* `npm run build`: Compila o frontend para produção de forma estática.
* `npm run start`: Inicia o servidor Next.js compilado.
* `npm run lint`: Executa as verificações estáticas de estilo do ESLint.

### Backend (`apps/api`):
* `uvicorn app.main:app --reload`: Inicia o servidor de desenvolvimento FastAPI na porta 8000.
* `pytest`: Executa a suíte de testes unitários.

---

## 4. Como Rodar o Frontend
1. Vá até a pasta do frontend: `cd apps/web`
2. Instale as dependências: `npm install`
3. Rode em modo desenvolvimento: `npm run dev`
4. Acesse: `http://localhost:3000`

---

## 5. Como Rodar o Backend
1. Vá até a pasta do backend: `cd apps/api`
2. Ative o ambiente virtual: `.venv\Scripts\activate` (Windows)
3. Instale as dependências: `pip install -r requirements.txt`
4. Inicie o servidor: `uvicorn app.main:app --reload --port 8000`
5. Acesse a documentação em: `http://127.0.0.1:8000/docs`

---

## 6. Como Gerar o PDF
1. Abra o dashboard no navegador no modo demo ou após o upload de um CSV.
2. Clique no botão **"Exportar PDF Executivo"** no menu superior ou lateral.
3. O diálogo de impressão do navegador abrirá. Selecione **"Salvar como PDF"**, defina o layout como **Retrato** (Portrait) e papel **A4**.
4. Garanta que a opção **"Gráficos de segundo plano"** esteja marcada para renderizar as visualizações corretamente.

---

## 7. Como Rodar os Testes
### Backend:
1. Vá até `apps/api`.
2. Execute o comando: `.venv\Scripts\python -m pytest`
3. Verifique se todos os testes no diretório `tests/` são bem-sucedidos.

---

## 8. Como o Demo Dataset é Carregado
O dataset de demonstração (`processo_seletivo_demo.csv`) é uma base sintética localizada em `C:\dev\DataFlow\data\seed\processo_seletivo_demo.csv`. 
* O frontend faz uma chamada `GET` ao endpoint `/api/demo` do backend.
* O backend lê o arquivo CSV fisicamente no disco, executa o pipeline analítico completo (parse, mapeamento de colunas, limpeza, profiling, agregações estatísticas e insights) e retorna o JSON estruturado para o frontend renderizar as visualizações.

---

## 9. Como o Masking LGPD Funciona
O mascaramento LGPD é executado diretamente na camada de apresentação no frontend usando funções utilitárias em `apps/web/lib/masking.ts`:
* **Nomes**: Convertidos para a string estruturada `"Candidato CANXXXX"`, em que `CANXXXX` é o identificador técnico unívoco (ID Candidato) gerado.
* **E-mails**: Reduzidos para o formato de privacidade, exibindo apenas o primeiro caractere antes do `@` (ex: `g***@empresa.com`), ocultando o nome completo do usuário.
* **Expectativa Salarial**: Os dados brutos continuam disponíveis para cálculos agregados em gráficos e métricas, mas os nomes e e-mails associados estão permanentemente mascarados na tabela de auditoria por padrão. O toggle de privacidade (`isPrivacyEnabled`) na interface ativa ou desativa o mascaramento em tempo real (com aviso ético).

---

## 10. Como o PDF é Gerado (Detalhado)
A geração utiliza o CSS do navegador (`window.print()`).
* A folha de estilo em `globals.css` define `@page { size: A4 portrait; margin: 0; }` sob a consulta de mídia `@media print`. Isso força o navegador a suprimir completamente o cabeçalho de URL (`localhost:3000/...`) e rodapés de data/hora que estragam relatórios profissionais.
* O contêiner de impressão `ReportView.tsx` usa padding interno rígido de `20mm` nas páginas para restabelecer margens limpas.
* O relatório é estruturado em 9 páginas isoladas através do uso do utilitário CSS `page-break-after: always;` (ou a propriedade Tailwind `break-after-page`), gerando divisões perfeitas para cada seção: Capa, Conclusões Executivas, Qualidade dos Dados, Funil Operacional, Evidências Estatísticas, etc.

---

## 11. Como o Health Score é Calculado
O cálculo do Health Score está centralizado no backend, em `apps/api/app/services/profiler.py`. Ele parte de uma nota máxima **100** e sofre as seguintes deduções:
* **Incompletude (Nulos)**: Dedução proporcional à taxa geral de células nulas (`overall_missing_rate`), com penalidade máxima de **-25** pontos.
* **Duplicatas**: Dedução mínima de **-2** pontos se houver qualquer registro duplicado, subindo dinamicamente de acordo com a taxa de duplicidade até o máximo de **-15** pontos.
* **Colunas Completamente Vazias**: Penalidade de **-10** pontos por coluna vazia, com limite de **-20** pontos.
* **Colunas Constantes**: Penalidade de **-5** pontos por coluna cujo valor não varia, com limite de **-15** pontos.
* **E-mails Inválidos**: Penalidade de **-10** pontos se forem detectados e-mails com formatos corrompidos.
* **Outliers Numéricos**: Penalidade fixa de **-5** pontos caso outliers sejam encontrados pelas regras de IQR.

O score final é limitado para ficar no intervalo de `[0, 100]`.

---

## 12. Como o Statistical Evidence Center é Alimentado
* O backend FastAPI usa **SciPy** dentro de `apps/api/app/services/inference.py`.
* Executa testes de hipótese estatísticos robustos para validar teorias de negócio:
  * **Welch t-test**: Para avaliar diferenças de médias em testes/entrevistas entre candidatos com status "Aprovado" vs. outros (não assume variâncias iguais).
  * **Chi-Square (Qui-Quadrado)**: Para examinar associação estatística entre escolaridade (`education_level`) e o status final (`final_status`).
  * **ANOVA**: Para testar a variância de notas entre múltiplos canais de atração.
* O backend retorna o p-valor, a estatística de teste, o effect size (d de Cohen, Cramér's V) e a interpretação preliminar.
* No frontend, o componente `InferencePanel.tsx` consome esses resultados e utiliza o utilitário centralizado `executiveConclusions.ts` para recalcular a significância aplicando a correção de Bonferroni (dividindo $\alpha = 0.05$ por 6 comparações $\approx 0.0083$).

---

## 13. Como o README Deve Refletir o Projeto
O README.md deve posicionar o DataFlow como um projeto premium de portfólio para *Analytics Engineering* e *Data Science*. Ele precisa:
* Evitar clichês e tom exagerado de inteligência artificial.
* Explicar o pipeline analítico de ponta a ponta (Ingestão -> Limpeza -> Estatística -> Dashboard -> PDF).
* Destacar as decisões éticas (Governança, Mascaramento, Responsible Analytics).
* Informar claramente que os dados são sintéticos e que a ferramenta audita processos de recrutamento agregados, e **não decide ou ranqueia candidatos**.

---

## 14. Quais Arquivos Não Devem Entrar no Commit
* Ambientes virtuais: `.venv/`, `venv/`, `env/`
* Cache e temporários do Python: `__pycache__/`, `.pytest_cache/`, `*.pyc`
* Cache de compilação Next.js: `.next/`, `out/`, `dist/`
* Módulos Node: `node_modules/`
* Variáveis de ambiente sensíveis: `.env`, `.env.local`
* Arquivos de configuração de IDE: `.vscode/`, `.idea/`
* Arquivos exportados localmente pelo usuário (ex: PDFs ou CSVs gerados na máquina).

---

## 15. Riscos Técnicos Restantes
* **Compatibilidade de Impressão**: Layouts complexos do Recharts podem ser cortados ou renderizados em preto e branco dependendo do motor de renderização de PDF do navegador utilizado (ex: Chrome vs Safari vs Firefox).
* **Sobrecarga de Eventos no ScrollSpy**: O scroll do dashboard pode causar pequenas lentidões (jank) se os observadores de interseção ou eventos de rolagem não forem otimizados com `requestAnimationFrame` ou `IntersectionObserver`.
* **PII Residual**: Upload de CSVs reais por usuários pode expor informações sensíveis se a interface do dashboard for mantida em servidores abertos sem TLS ou com gravação persistente de logs. O DataFlow deve ser rodado estritamente de forma local-first.

---

## 16. Checklist de Release
- [ ] Validar conformidade textual das conclusões com os p-valores reais na base demo.
- [ ] Testar geração do PDF e confirmar se possui exatamente 9 páginas.
- [ ] Verificar se as células na tabela aplicam destaque em nível de célula (anomaly highlights).
- [ ] Testar interatividade do Drawer de Contexto por Coluna na tabela.
- [ ] Rodar testes locais do backend com `pytest` e garantir que 6/6 passaram.
- [ ] Rodar compilação de produção com `npm run build` na pasta `apps/web`.
- [ ] Verificar logs do Git com `git status` para limpar arquivos residuais desnecessários.
- [ ] Efetuar o commit local com mensagens estruturadas de Conventional Commit.
