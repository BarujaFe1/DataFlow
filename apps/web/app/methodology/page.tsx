"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Compass, Scale, ShieldCheck, Database, Award, Lock } from "lucide-react";

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-success/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-border-subtle bg-surface/50 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-text-primary flex items-center space-x-2">
          <span>DataFlow</span>
          <span className="text-accent font-normal text-xs bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-full">
            Metodologia
          </span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link 
            href="/"
            className="text-xs font-semibold text-text-secondary hover:text-text-primary transition"
          >
            Acessar Plataforma
          </Link>
          <Link 
            href="/showcase"
            className="text-xs font-semibold text-text-secondary hover:text-text-primary transition"
          >
            Showcase Pitch
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 z-10 flex flex-col gap-10">
        
        {/* Title */}
        <div className="border-b border-border-subtle pb-6 flex flex-col gap-3">
          <Link 
            href="/"
            className="flex items-center space-x-2 text-xs text-text-secondary hover:text-text-primary transition w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Dashboard</span>
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mt-1 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-8 h-8 text-accent shrink-0" />
            <span>Rigor Estatístico e Documentação Metodológica</span>
          </h1>
          <p className="text-sm text-text-secondary max-w-3xl leading-relaxed">
            Detalhes das equações matemáticas, premissas de modelagem, correções de testes e preceitos éticos utilizados no pipeline analítico do DataFlow.
          </p>
        </div>

        {/* Section 1: Health Score */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <span>1. Cálculo do Data Quality Score (Health Score)</span>
          </h2>
          
          <p className="text-xs text-text-secondary leading-relaxed">
            O <strong>Health Score v2</strong> é uma heurística versionada de <strong>0 a 100</strong> para diagnóstico de qualidade do dataset. Não é probabilidade, intervalo de confiança, certificação ou garantia.
          </p>

          <div className="bg-surface/50 border border-border-subtle p-5 rounded-xl flex flex-col gap-4">
            <div className="text-xs font-mono bg-background p-3 rounded-lg border border-border-subtle text-center text-text-primary font-bold">
              Score = &Sigma; (ScoreDimens&atilde;o&#x1D62; &times; Peso&#x1D62;) &times; 100, com &Sigma; Pesos = 1.0
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              O score combina <strong>seis dimensões de qualidade</strong> por meio de uma média ponderada: <strong>Completude</strong> (nulos), <strong>Unicidade</strong> (duplicados), <strong>Validade</strong> (e-mails inválidos), <strong>Consistência</strong> (falhas de parsing numérico), <strong>Plausibilidade</strong> (valores impossíveis) e <strong>Esquema</strong> (colunas vazias). Outliers por IQR são anomalias reportadas, com penalidade zero no Health Score.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <p><strong>• Penalidade por dimensão:</strong> Penalidade&#x1D62; = (1 &minus; ScoreDimens&atilde;o&#x1D62;) &times; Peso&#x1D62; &times; 100.</p>
                <p><strong>• Reconciliação:</strong> <code>overall</code> e <code>penalty_points</code> são arredondados independentemente; a soma das penalidades é aproximada e o residual aparece explicitamente no gráfico.</p>
              </div>
              <div className="space-y-1.5">
                <p><strong>• Waterfall do relatório:</strong> preserva as penalidades do backend e exibe o ajuste de arredondamento, positivo ou negativo, quando necessário.</p>
                <p><strong>• Pequenas amostras:</strong> a robustez é uma heurística de suporte baseada na quantidade e estrutura dos dados; não representa probabilidade, intervalo de confiança ou garantia.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Outliers */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Database className="w-5 h-5 text-accent" />
            <span>2. Detecção de Outliers via IQR (Interquartile Range)</span>
          </h2>
          
          <p className="text-xs text-text-secondary leading-relaxed">
            Para variáveis de escala contínua (`salary_expectation`, `experience_years`), o DataFlow calcula dispersões baseadas em quartis para isolar anomalias de preenchimento, aplicando a metodologia clássica de Tukey:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-center">
            <div className="bg-surface/30 p-3 rounded-lg border border-border-subtle">
              <span className="text-[10px] text-text-muted uppercase block">IQR (Amplitude)</span>
              <span className="text-text-primary font-bold">IQR = Q3 - Q1</span>
            </div>
            <div className="bg-surface/30 p-3 rounded-lg border border-border-subtle">
              <span className="text-[10px] text-text-muted uppercase block">Limite Mínimo</span>
              <span className="text-text-primary font-bold">Q1 - 1.5 * IQR</span>
            </div>
            <div className="bg-surface/30 p-3 rounded-lg border border-border-subtle">
              <span className="text-[10px] text-text-muted uppercase block">Limite Máximo</span>
              <span className="text-text-primary font-bold">Q3 + 1.5 * IQR</span>
            </div>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            Na base de demonstração sintética do processo seletivo:
            <br />• <strong>Anos de Experiência:</strong> Outliers são classificados quando fora dos limites de 0 a 20 anos.
            <br />• <strong>Expectativa Salarial:</strong> Outliers são detectados para pretensões salariais acima de R$ 100.000 mensais.
          </p>
        </section>

        {/* Section 3: Statistical Hypothesis Testing */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Scale className="w-5 h-5 text-accent" />
            <span>3. Testes de Hipóteses Estatísticos no Backend (SciPy Engine)</span>
          </h2>
          
          <p className="text-xs text-text-secondary leading-relaxed">
            A API de estatística é alimentada pela biblioteca <strong>SciPy</strong> do Python, avaliando as correlações e significâncias do processo seletivo a um nível de confiança nominal de 95% ($\alpha = 0.05$):
          </p>

          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-xl border border-border-subtle bg-surface/30 text-xs">
              <span className="font-bold text-text-primary block text-[12px] mb-1">I. Teste t de Welch (score_test / score_interview por Status Final)</span>
              <p className="text-text-secondary leading-relaxed mb-2">
                Utilizado para comparar a média de notas de avaliações entre candidatos aprovados vs. demais. Difere do teste t de Student por não assumir igualdade de variâncias entre os dois grupos comparados.
              </p>
              <div className="flex gap-4 font-mono text-[10px] text-text-muted">
                <span>Premissa: Dados ordinais/contínuos aproximadamente normais.</span>
                <span>Effect Size: Cohen&apos;s d</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border-subtle bg-surface/30 text-xs">
              <span className="font-bold text-text-primary block text-[12px] mb-1">II. Teste Qui-Quadrado ($\chi^2$) de Associação (escolaridade vs status)</span>
              <p className="text-text-secondary leading-relaxed mb-2">
                Usado para examinar se a distribuição de aprovação é dependente de variáveis categóricas, como escolaridade do candidato.
              </p>
              <div className="flex gap-4 font-mono text-[10px] text-text-muted">
                <span>Premissa: Frequências esperadas nas células da tabela de contingência &ge; 5 em 80% dos casos.</span>
                <span>Effect Size: Cramér&apos;s V</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border-subtle bg-surface/30 text-xs">
              <span className="font-bold text-text-primary block text-[12px] mb-1">III. ANOVA de Uma Via (scores por Canal / Vaga)</span>
              <p className="text-text-secondary leading-relaxed mb-2">
                Analisa a variância de notas técnicas obtidas entre múltiplos grupos (canais de mídia ou vagas pretendidas), validando se ao menos um dos canais apresenta médias distintas dos outros.
              </p>
              <div className="flex gap-4 font-mono text-[10px] text-text-muted">
                <span>Premissa: Homocedasticidade das variâncias (testada via Levene) e independência das amostras.</span>
                <span>Effect Size: Eta Quadrado ($\eta^2$)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Bonferroni */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Compass className="w-5 h-5 text-accent" />
            <span>4. Controle de Falsos Positivos via Correção de Bonferroni</span>
          </h2>
          
          <p className="text-xs text-text-secondary leading-relaxed">
            Ao executar múltiplos testes de hipóteses estatísticos paralelos no mesmo dataset, o risco de encontrar uma correlação significativa por puro acaso (Erro Tipo I) aumenta de forma acumulada. Para mitigar o risco de falsos positivos na tomada de decisão corporativa, o DataFlow aplica a <strong>Correção de Bonferroni</strong>:
          </p>

          <div className="bg-surface/50 border border-border-subtle p-5 rounded-xl flex flex-col gap-3 font-mono text-xs">
            <div className="text-center text-text-primary font-bold">
              &alpha;<sub>Bonferroni</sub> = &alpha; / m
            </div>
            <div className="text-text-secondary text-center">
              Em que &alpha; = 0.05 (nível nominal) e m = 6 (número total de testes executados na base).
            </div>
            <div className="text-center text-accent font-bold mt-1 text-[13px]">
              &alpha;<sub>Bonferroni</sub> &approx; 0.0083
            </div>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            <strong>Caso Prático na Base Demo:</strong>
            <br />A escolaridade formal (`education_level` vs `final_status`) apresenta p-valor nominal de <strong>p=0.0141</strong>. Embora menor que $\alpha = 0.05$, o valor é maior que o limiar corrigido de <strong>p=0.0083</strong>. Conclusão: a associação estatística de escolaridade é classificada como *&quot;significativa sem correção; inconclusiva sob correção conservadora&quot;* e reportada apenas como sinal exploratório de viés, evitando que a escolaridade seja usada erroneamente como régua de corte.
          </p>
        </section>

        {/* Section 5: Spearman */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Scale className="w-5 h-5 text-accent" />
            <span>5. Matriz de Correlação Spearman 4x4</span>
          </h2>
          
          <p className="text-xs text-text-secondary leading-relaxed">
            Diferente da correlação de Pearson, a correlação de Spearman avalia a relação monótona baseada no ranking dos dados, sendo robusta a outliers em dados numéricos. O DataFlow calcula Spearman client-side para permitir atualizações instantâneas de filtragem.
          </p>
        </section>

        {/* Section 6: LGPD */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent" />
            <span>6. Privacidade e Governança LGPD</span>
          </h2>
          
          <p className="text-xs text-text-secondary leading-relaxed">
            Seguindo a política de privacidade do projeto (responsible analytics, postura LGPD-aware), nenhuma identificação pessoal (PII) é exposta por padrão no cockpit ou no PDF do relatório. Os valores são <strong>mascarados para apresentação</strong> (não anonimização irreversível nem certificação de conformidade regulatória):
            <br />• <strong>Nomes:</strong> Mapeados dinamicamente para &quot;Candidato CANXXXX&quot;, em que `CANXXXX` é o ID técnico individual unívoco.
            <br />• <strong>E-mails:</strong> Ocultados exibindo apenas a primeira letra (ex: `g***@example.com`).
          </p>
        </section>

        {/* Section 7: Ethical Statement */}
        <section className="flex flex-col gap-4 border-t border-border-subtle pt-6">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Award className="w-5 h-5 text-success" />
            <span>Declaração de Uso de IA Responsável</span>
          </h2>
          
          <div className="p-4 rounded-xl border border-success/15 bg-success/[0.01] text-xs leading-relaxed text-text-secondary flex flex-col gap-2">
            <p>
              O DataFlow é um projeto de <strong>Auditoria de Processos e Dados</strong>. Ele <strong>NÃO</strong> faz classificação individual de talentos, ranqueamento, scoring de candidatos ou previsões automáticas de sucesso de admissão (regras proibidas em conformidade ética).
            </p>
            <p className="font-bold text-text-primary">
              Mensagem central: &quot;O DataFlow transforma dados tabulares imperfeitos em diagnósticos executivos para calibragem de processo; decisões finais requerem intervenção humana estruturada.&quot;
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8 text-center text-xs text-text-muted mt-12 bg-surface/20">
        <p>DataFlow — Desenvolvido por Felipe Alirio Baruja como Projeto Showcase de Engenharia e Análise de Dados.</p>
      </footer>
    </div>
  );
}
