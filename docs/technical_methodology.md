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
O cálculo do Health Score parte de **100** e sofre deduções conforme a gravidade das inconsistências da base:

$$\text{Health Score} = \max\left(0, \min\left(100, 100 - \sum \text{Penalidades}\right)\right)$$

### Penalidades Aplicadas:
1. **Incompletude (Nulos):**
   $$\text{Penalidade} = \text{floor}\left(\frac{\text{Células Ausentes}}{\text{Total de Células}} \times 25\right)$$
   *Representa a perda de preenchimento do grid. Limite máximo: -25 pontos.*
2. **Duplicidade (Registros Redundantes):**
   $$\text{Penalidade} = \min\left(15, \text{floor}\left(\frac{\text{Candidatos Duplicados}}{\text{Total de Registros}} \times 50\right) + 2\right)$$
   *Aplica dedução mínima de -2 pontos por qualquer redundância. Limite máximo: -15 pontos.*
3. **Colunas Vazias:** Deduz **-10** pontos por coluna totalmente sem preenchimento (limite -20).
4. **Colunas Constantes:** Deduz **-5** pontos por coluna de variância nula (limite -15).
5. **Formato de E-mail:** Deduz **-10** pontos se e-mails inválidos forem detectados pela regra Regex.
6. **Outliers:** Deduz **-5** pontos se existirem valores contínuos discrepantes identificados pela regra IQR.

---

## 4. Detecção de Outliers (IQR)
Para variáveis numéricas contínuas, os limites operacionais são calculados de acordo com os quartis da amostra:

$$\text{IQR} = Q3 - Q1$$
$$\text{Limite Inferior} = Q1 - 1.5 \times \text{IQR}$$
$$\text{Limite Superior} = Q3 + 1.5 \times \text{IQR}$$

Registros cujos valores ultrapassam esses limites são destacados como anomalias de preenchimento na interface.

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
A conformidade com a LGPD baseia-se na anonimização das variáveis no frontend:
* **Nome do Candidato:** Ocultado e substituído de forma irreversível na tela por `"Candidato CANXXXX"`, onde `CANXXXX` é o `candidate_id` técnico.
* **E-mail:** Ofuscado mantendo apenas o primeiro caractere visível antes do domínio (ex: `g***@domain.com`).
* **Segurança de CSV:** Os dados mascarados são aplicados nas exportações CSV padrão para evitar vazamento acidental de dados pessoais sob custódia corporativa.
