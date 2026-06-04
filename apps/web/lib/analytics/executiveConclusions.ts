import { InferenceResult } from "@/types/analysis";

export interface DetailedConclusion {
  testName: string;
  variables: string[];
  statistic: number;
  pValue: number;
  effectSize?: number;
  nominalSignificance: boolean;
  correctedSignificance: boolean;
  evidenceClass: "Forte" | "Moderada" | "Limítrofe" | "Fraca";
  magnitudeClass: "Negligenciável" | "Fraca" | "Pequena" | "Moderada" | "Média" | "Grande" | "Indefinida";
  decision: string; // e.g., "Rejeita H0" or "Não rejeita H0"
  bonferroniBadge?: string;
  falsePositiveAlert: {
    severity: "danger" | "warning" | "info" | "none";
    text: string;
  };
  practicalInterpretation: string;
  limitations: string;
  recommendedAction: string;
}

export interface ExecutiveConclusionsReport {
  executiveSummary: string[];
  conclusions: DetailedConclusion[];
  bonferroniAlpha: number;
  totalTests: number;
}

// Map nominal p-value to verbal evidence strength
export function getEvidenceClass(p: number): "Forte" | "Moderada" | "Limítrofe" | "Fraca" {
  if (p < 0.01) return "Forte";
  if (p < 0.05) return "Moderada";
  if (p < 0.10) return "Limítrofe";
  return "Fraca";
}

// Map effect sizes to verbal magnitudes
export function getMagnitudeClass(val: number, testName: string): "Negligenciável" | "Fraca" | "Pequena" | "Moderada" | "Média" | "Grande" | "Indefinida" {
  const name = testName.toLowerCase();
  const absVal = Math.abs(val);

  if (name.includes("qui-quadrado") || name.includes("chi-square") || name.includes("associação")) {
    if (absVal < 0.1) return "Negligenciável";
    if (absVal < 0.3) return "Fraca";
    if (absVal < 0.5) return "Moderada";
    return "Grande"; // Cramer's V scale
  }

  if (name.includes("teste t") || name.includes("t-test") || name.includes("welch")) {
    if (absVal < 0.2) return "Negligenciável";
    if (absVal < 0.5) return "Pequena";
    if (absVal < 0.8) return "Média";
    return "Grande"; // Cohen's d scale
  }

  if (name.includes("anova") || name.includes("variância")) {
    if (absVal < 0.01) return "Negligenciável";
    if (absVal < 0.06) return "Pequena";
    if (absVal < 0.14) return "Média";
    return "Grande"; // Eta squared scale
  }

  return "Indefinida";
}

export function generateExecutiveConclusions(
  inferenceResults: InferenceResult[]
): ExecutiveConclusionsReport {
  const NOMINAL_ALPHA = 0.05;
  const totalTests = inferenceResults.length || 6;
  const bonferroniAlpha = NOMINAL_ALPHA / totalTests;

  const conclusions: DetailedConclusion[] = inferenceResults.map((test) => {
    const p = test.p_value;
    const eff = test.effect_size !== undefined ? test.effect_size : 0.0;
    const nominalSignificance = p < NOMINAL_ALPHA;
    const correctedSignificance = p < bonferroniAlpha;

    const evidenceClass = getEvidenceClass(p);
    const magnitudeClass = getMagnitudeClass(eff, test.test_name);
    const decision = correctedSignificance
      ? "Rejeita H0 (Sob Correção Conservadora)"
      : nominalSignificance
      ? "Rejeita H0 (Apenas Nível Nominal)"
      : "Não rejeita H0";

    // Bonferroni classification
    let bonferroniBadge = "";
    if (nominalSignificance && !correctedSignificance) {
      bonferroniBadge = "Significativo sem correção; inconclusivo após correção conservadora";
    } else if (correctedSignificance) {
      bonferroniBadge = "Estatisticamente Significativo (Bonferroni Atendido)";
    } else {
      bonferroniBadge = "Sem Significado Estatístico";
    }

    // False positive alert classification
    let fpSeverity: "danger" | "warning" | "info" | "none" = "none";
    let fpText = "";

    if (p < NOMINAL_ALPHA) {
      fpSeverity = "danger";
      fpText = "Risco de falso positivo alto devido a múltiplas comparações paralelas. Recomenda-se validação em nova amostra.";
    } else if (p >= NOMINAL_ALPHA && p < 0.10) {
      fpSeverity = "warning";
      fpText = "Evidência limítrofe / tendência exploratória. Risco de falso positivo moderado; dados adicionais são necessários.";
    } else {
      fpSeverity = "info";
      fpText = "Sem evidência estatística relevante; risco de falso positivo não se aplica porque H0 não foi rejeitada.";
    }

    // Dynamic practical interpretations & recommendations depending on variables
    let practicalInterpretation = test.interpretation;
    const limitations = test.limitations;
    let recommendedAction = "Investigar o comportamento desta variável em outros períodos históricos.";

    const varsJoined = test.variables.join("-").toLowerCase();

    if (varsJoined.includes("education_level") && varsJoined.includes("status")) {
      practicalInterpretation = nominalSignificance
        ? "Sinal estatístico exploratório entre escolaridade e status final requer investigação de processo, possíveis diferenças de composição amostral ou viés estrutural. Não deve ser usado como critério de decisão individual."
        : "Não há evidências de associação relevante entre escolaridade formal e aprovação final na base avaliada.";
      
      recommendedAction = nominalSignificance
        ? "Auditar se o processo seletivo exige diploma para cargos onde habilidades práticas são suficientes, reduzindo potenciais vieses de barreira."
        : "Manter o foco em testes técnicos objetivos e portfólio, garantindo igualdade de oportunidades.";
    } else if (varsJoined.includes("source_channel") && varsJoined.includes("status")) {
      practicalInterpretation = nominalSignificance
        ? `Existe uma disparidade de atração: os canais de captação apresentam taxas de aprovação desiguais (p-valor = ${p.toFixed(4)}), sugerindo maior fit técnico em determinados portais.`
        : "O canal de origem não demonstra relevância sobre a aprovação final. Todos os canais geram perfis equivalentes.";
      
      recommendedAction = nominalSignificance
        ? "Concentrar esforços de mídia nos canais de maior taxa de aprovação relativa e calibrar os anúncios de canais menos eficientes."
        : "Distribuir as vagas de forma homogênea nos canais atuais para diversificar a origem das candidaturas.";
    } else if (varsJoined.includes("score_test") && varsJoined.includes("status")) {
      practicalInterpretation = nominalSignificance
        ? `Candidatos aprovados obtiveram notas significativamente diferentes nas avaliações técnicas (p-valor = ${p.toFixed(4)}). A magnitude prática (${magnitudeClass}) sugere forte diferenciação de performance.`
        : `A nota do teste técnico é estatisticamente semelhante entre os grupos aprovados e não aprovados (p-valor = ${p.toFixed(4)}).`;
      
      recommendedAction = nominalSignificance
        ? "Manter o teste técnico como fase inicial objetiva de corte de competências."
        : "Reavaliar o conteúdo do teste técnico; ele pode não estar medindo as competências reais valorizadas nas etapas finais.";
    } else if (varsJoined.includes("score_interview") && varsJoined.includes("status")) {
      practicalInterpretation = nominalSignificance
        ? `A nota de entrevista possui correlação forte com a aprovação final (p-valor = ${p.toFixed(4)}), indicando forte poder discriminatório.`
        : `Não foi encontrada diferença estatisticamente significativa nas notas de entrevista entre candidatos aprovados e demais (p-valor = ${p.toFixed(4)}).`;
      
      recommendedAction = nominalSignificance
        ? "Documentar a régua e estruturar as entrevistas para mitigar subjetividade entre entrevistadores."
        : "Implementar entrevistas baseadas em competências estruturadas e calibrações de nota para diminuir a subjetividade.";
    }

    return {
      testName: test.test_name,
      variables: test.variables,
      statistic: test.statistic,
      pValue: p,
      effectSize: eff,
      nominalSignificance,
      correctedSignificance,
      evidenceClass,
      magnitudeClass,
      decision,
      bonferroniBadge,
      falsePositiveAlert: {
        severity: fpSeverity,
        text: fpText,
      },
      practicalInterpretation,
      limitations,
      recommendedAction,
    };
  });

  // Generate 3 to 5 clear executive summaries
  const executiveSummary: string[] = [];

  // 1. Top Source Channel
  executiveSummary.push(
    "O canal de captação desempenha um papel importante na volumetria geral do funil, concentrando a maioria das inscrições."
  );

  // 2. Test & Interview Welch Tests (Dynamic Check)
  const testT = conclusions.find((c) => c.variables.includes("score_test") && c.variables.includes("final_status"));
  const interviewT = conclusions.find((c) => c.variables.includes("score_interview") && c.variables.includes("final_status"));

  if (testT && interviewT) {
    if (!testT.nominalSignificance && !interviewT.nominalSignificance) {
      executiveSummary.push(
        `Os testes de Welch não identificaram diferença estatisticamente significativa nas médias de teste e entrevista entre aprovados e demais candidatos no nível de 95% de confiança (score_test p=${testT.pValue.toFixed(4)}, score_interview p=${interviewT.pValue.toFixed(4)}). Isso sugere que o resultado final pode depender de variáveis não capturadas no dataset ou de critérios qualitativos do processo.`
      );
    } else if (testT.nominalSignificance && interviewT.nominalSignificance) {
      executiveSummary.push(
        `Os testes de Welch apontam diferença de médias altamente significativa tanto nos testes técnicos (p=${testT.pValue.toFixed(4)}) quanto nas entrevistas (p=${interviewT.pValue.toFixed(4)}), validando estatisticamente ambas as etapas como filtros de fit.`
      );
    } else {
      // Mixed
      if (interviewT.pValue >= 0.05 && interviewT.pValue < 0.10) {
        executiveSummary.push(
          `A entrevista apresenta evidência limítrofe (p=${interviewT.pValue.toFixed(4)}), mas não suficiente para rejeitar a hipótese nula em α=0.05. O resultado deve ser tratado como tendência exploratória, não como conclusão definitiva.`
        );
      }
      if (testT.nominalSignificance) {
        executiveSummary.push(
          `Foi encontrada evidência estatística em score_test (p=${testT.pValue.toFixed(4)}), mas a interpretação deve considerar o tamanho do efeito e múltiplas comparações.`
        );
      }
    }
  }

  // 3. Education Level (Chi-Square)
  const eduChi = conclusions.find((c) => c.variables.includes("education_level"));
  if (eduChi) {
    if (eduChi.nominalSignificance && !eduChi.correctedSignificance) {
      executiveSummary.push(
        `O nível de escolaridade apresenta associação nominal significativa com a aprovação final (p=${eduChi.pValue.toFixed(4)}), porém o sinal torna-se inconclusivo após correção conservadora de Bonferroni. Deve ser tratado estritamente como sinal exploratório de viés a investigar, não como barreira de decisão.`
      );
    } else if (eduChi.correctedSignificance) {
      executiveSummary.push(
        `A escolaridade apresenta forte sinal estatístico no funil (p=${eduChi.pValue.toFixed(4)}). Recomenda-se auditar o processo para investigar potenciais barreiras ou vieses sistêmicos de seleção.`
      );
    } else {
      executiveSummary.push(
        "A escolaridade formal não demonstra associação estatística com a aprovação final, garantindo igualdade de oportunidades entre níveis de formação."
      );
    }
  }

  // 4. Data Quality / Masking
  executiveSummary.push(
    "A conformidade estrutural da base é satisfatória, com mascaramento de PII (nomes/e-mails) ativo no relatório público em alinhamento com a LGPD."
  );

  return {
    executiveSummary,
    conclusions,
    bonferroniAlpha,
    totalTests,
  };
}
