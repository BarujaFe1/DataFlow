# Metodologia Técnica e Lógica Analítica — DataFlow V1.3

Este documento descreve detalhadamente o arcabouço matemático, estatístico e computacional utilizado no backend e no frontend do **DataFlow** para profiling, higienização e interpretação de dados tabulares.

---

## 1. Mapeamento Semântico e Aliases
Quando um arquivo CSV é carregado, o DataFlow mapeia os cabeçalhos brutos para um domínio de 17 colunas padronizadas utilizando aliases inteligentes (regex tolerante a sinônimos em inglês e português):

```python
# Domínio do mapeador dinâmico:
candidate_id         # ID Técnico
timestamp            # Data de Cadastro
name                 # Nome do Candidato (PII)
email                # E-mail (PII)
city, state          # Geolocalização
education_level      # Escolaridade
experience_years     # Anos de Experiência
source_channel       # Canal de Atração
role_applied         # Vaga Pretendida
stage                # Etapa Atual
score_test           # Nota da Avaliação Técnica
score_interview      # Nota da Entrevista
final_status         # Status do Processo (Aprovado/Reprovado/Em Processo)
salary_expectation   # Expectativa Salarial
availability         # Disponibilidade
remote_preference    # Preferência de Modelo de Trabalho
```

---

## 2. Lógica de Higienização (Data Cleaning)
O pipeline realiza as seguintes etapas de limpeza automática na API:
* **Trimming e Conversão de Strings:** Remoção de espaços extras em branco. Campos com strings vazias (`""`) são convertidos para nulos nativos (`None` em Python, que vira `null` no JSON).
* **Normalização Casing/Textos:** Converte strings de categorias comuns para padrões semânticos (ex: `"superior completo"`, `"ENSINO SUPERIOR"`, `"superior"` viram `"Ensino Superior"`; `"linkedin"`, `"indeed"` e afins são formatados em Title Case).
* **Conversão Numérica Tolerante:** Converte strings numéricas contendo caracteres de moeda ou pontos em floats válidos (`"R$ 5.500,00"` &rarr; `5500.0`).
* **Saneamento de Datas:** Executa um loop de parse contra 8 formatos comuns de data/hora, normalizando-os para o formato ISO `YYYY-MM-DD HH:MM:SS`.

---

## 3. Algoritmo do Health Score (Nota de Integridade)
O Health Score v2 é uma heurística versionada de 0 a 100 para apoiar o diagnóstico de qualidade; não é certificação, probabilidade ou garantia. O backend calcula uma média ponderada de seis dimensões:

$$\text{Health Score} = \sum_i (\text{ScoreDimensão}_i \times \text{Peso}_i) \times 100, \quad \sum_i \text{Peso}_i = 1$$

| Dimensão | Peso | Sinal observado |
|---|---:|---|
| Completude | 30% | células ausentes |
| Unicidade | 15% | registros duplicados |
| Validade | 25% | formato de e-mail inválido |
| Consistência | 10% | falhas de parsing numérico |
| Plausibilidade | 10% | valores impossíveis, como valores negativos nos campos definidos pelo contrato |
| Esquema | 10% | colunas integralmente vazias |

Para cada dimensão, a penalidade exposta pelo backend é `(1 − score_da_dimensão) × peso × 100`. O `overall` é arredondado para inteiro e cada `penalty_points` é arredondado independentemente para duas casas; por isso, a soma das penalidades só reconcilia aproximadamente com `100 − overall`. O relatório preserva as penalidades recebidas e, quando necessário, mostra um **Ajuste de arredondamento** explícito em vez de alterar uma penalidade.

---

## 4. Detecção de Outliers (IQR)
Para variáveis numéricas contínuas, os limites operacionais são calculados de acordo com os quartis da amostra:

$$\text{IQR} = Q3 - Q1$$
$$\text{Limite Inferior} = Q1 - 1.5 \times \text{IQR}$$
$$\text{Limite Superior} = Q3 + 1.5 \times \text{IQR}$$

Registros cujos valores ultrapassam esses limites são destacados como anomalias de preenchimento na interface. Eles não geram penalidade automática no Health Score.

---

## 5. Coeficiente de Correlação de Spearman
A matriz de associação 4x4 no Cockpit EDA calcula a correlação ordinal de Spearman entre as variáveis numéricas (`experience_years`, `salary_expectation`, `score_test`, `score_interview`):

$$\rho = 1 - \frac{6 \sum d_i^2}{n(n^2 - 1)}$$

Em que $d_i$ é a diferença entre as classificações (ranks) de cada observação correspondente. A correlação de Spearman foi preferida por ser robusta contra a influência de outliers extremos na base.

---

## 6. Testes Inferenciais de Hipótese (SciPy)
O backend Python rodado em SciPy executa testes para validar hipóteses de negócios a 95% de confiança:

### Welch t-test (Comparação de Médias)
Compara se a nota média do teste técnico e da entrevista diferem de forma estatisticamente significativa entre candidatos classificados como "Aprovados" vs "Outros". A estatística de teste é dada por:

$$t = \frac{\bar{X}_1 - \bar{X}_2}{\sqrt{\frac{s_1^2}{N_1} + \frac{s_2^2}{N_2}}}$$

Calcula o effect size via **Cohen's d**:

$$d = \frac{\bar{X}_1 - \bar{X}_2}{s_{pooled}}$$

### Teste Qui-Quadrado ($\chi^2$) de Independência
Mede a associação entre variáveis categóricas (ex: escolaridade e o status final de aprovação).

$$\chi^2 = \sum \frac{(O_{ij} - E_{ij})^2}{E_{ij}}$$

Calcula o tamanho do efeito via **V de Cramér**:

$$V = \sqrt{\frac{\chi^2}{n \min(c-1, r-1)}}$$

### ANOVA de Uma Via (Análise de Variância)
Verifica se as notas dos testes diferem de forma estatisticamente relevante entre múltiplos grupos de canais ou vagas. Calcula o efeito via **Eta Quadrado ($\eta^2$)**.

---

## 7. Correção de Comparações Múltiplas (Bonferroni)
Ao rodar múltiplos testes de hipóteses no mesmo conjunto de dados, a probabilidade de rejeitar a hipótese nula erroneamente (Erro Tipo I) aumenta. Para manter a probabilidade global de erro tipo I a $\alpha = 0.05$, dividimos o alfa pelo número de comparações executadas ($m = 6$):

$$\alpha_{adj} = \frac{0.05}{6} \approx 0.00833$$

Qualquer teste cujo p-valor nominal seja maior que $0.0083$ não é classificado como estatisticamente significativo sob correção conservadora no relatório.

---

## 8. Governança e Mascaramento de Identificadores (PII)
O produto aplica mascaramento de apresentação conforme a política configurada pelo backend; isso não constitui anonimização, pseudonimização na acepção legal, certificação de conformidade ou garantia de prevenção de vazamentos.
* **Nome do Candidato:** em modos mascarados, a interface apresenta um identificador mascarado, como `"Candidato CANXXXX"`.
* **E-mail:** em modos mascarados, a interface pode mostrar apenas parte do endereço, como `g***@domain.com`.
* **Exportação:** demo e produção seguem a política de mascaramento configurada no backend. Em modo local com dados brutos explicitamente habilitados, a exportação pode conter dados brutos; quem opera o ambiente é responsável por controles adequados.
