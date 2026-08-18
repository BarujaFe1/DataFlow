import { AnalysisResponse, InferenceResult } from "@/types/analysis";

export interface StructuredInsight {
  id: string;
  type: "statistical_signal" | "quality_alert" | "kpi_milestone" | "actionable_recommendation" | "bias_warning";
  title: string;
  description: string;
  metric: string;
  severity: "info" | "low" | "medium" | "high";
  confidence: "low" | "moderate" | "high";
  relatedSection: "quality" | "statistics" | "kpis" | "charts" | "ethics";
  recommendedAction: string;
}

export function generateStructuredInsights(data: AnalysisResponse): StructuredInsight[] {
  const insights: StructuredInsight[] = [];
  const { kpis, quality, inference, metadata } = data;

  // 1. Health Score Insight
  if (quality.health_score < 70) {
    insights.push({
      id: "low-data-health",
      type: "quality_alert",
      title: "Qualidade crítica detectada no dataset",
      description: `O dataset possui um Health Score de ${quality.health_score}/100, indicando múltiplos problemas de preenchimento, duplicidades ou outliers que podem enviesar análises subsequentes.`,
      metric: `Health Score: ${quality.health_score}/100`,
      severity: "high",
      confidence: "high",
      relatedSection: "quality",
      recommendedAction: "Revisar as regras de coleta na origem e executar o fluxo de saneamento de dados."
    });
  } else if (quality.health_score < 85) {
    insights.push({
      id: "moderate-data-health",
      type: "quality_alert",
      title: "Qualidade de dados moderada",
      description: `O dataset está razoavelmente limpo com Health Score de ${quality.health_score}/100, mas contém alertas menores de inconsistências ou campos faltantes.`,
      metric: `Health Score: ${quality.health_score}/100`,
      severity: "medium",
      confidence: "high",
      relatedSection: "quality",
      recommendedAction: "Investigar as colunas marcadas com alertas no Cockpit de Qualidade."
    });
  } else {
    insights.push({
      id: "high-data-health",
      type: "kpi_milestone",
      title: "Alta integridade dos dados",
      description: `Excelente nível de preenchimento e consistência estrutural. O Health Score de ${quality.health_score}/100 é uma heurística versionada de qualidade que apoia a leitura dos testes estatísticos e auditorias de processos, sem substituir suas limitações.`,
      metric: `Health Score: ${quality.health_score}/100`,
      severity: "info",
      confidence: "high",
      relatedSection: "quality",
      recommendedAction: "Prosseguir com análises estatísticas estruturadas e relatórios executivos finais."
    });
  }

  // 2. Sample Size Warning
  if (metadata.rows < 30) {
    insights.push({
      id: "small-sample-size",
      type: "bias_warning",
      title: "Tamanho amostral reduzido",
      description: `A base conta com apenas ${metadata.rows} registros. Análises estatísticas inferenciais perdem poder de generalização com amostras menores do que 30 observações.`,
      metric: `N = ${metadata.rows}`,
      severity: "high",
      confidence: "high",
      relatedSection: "ethics",
      recommendedAction: "Acumular mais observações históricas antes de tomar decisões estruturais sobre o processo seletivo."
    });
  }

  // 3. Conversion Channels
  if (kpis.top_source_channel) {
    // Find approval rate for top source channel from charts if available
    const topChannelStats = data.charts.sources?.find(s => s.source === kpis.top_source_channel);
    const topChannelRate = topChannelStats ? `${(topChannelStats.approval_rate * 100).toFixed(1)}%` : "N/A";

    insights.push({
      id: "top-source-channel",
      type: "kpi_milestone",
      title: `Maior fonte de candidatos: ${kpis.top_source_channel}`,
      description: `O canal '${kpis.top_source_channel}' lidera a atração de talentos, sendo a principal origem de inscrições na base histórica.`,
      metric: `${kpis.top_source_channel} (Tx. Aprov. aprox. ${topChannelRate})`,
      severity: "info",
      confidence: "high",
      relatedSection: "kpis",
      recommendedAction: "Avaliar o custo de aquisição (CAC) por canal para otimizar a distribuição do orçamento de recrutamento."
    });
  }

  // 4. Statistical Inference Findings
  if (inference && inference.length > 0) {
    inference.forEach((test: InferenceResult, idx: number) => {
      const id = `inference-insight-${idx}`;
      const decisionSignificance = test.corrected_significance ?? test.significance;
      
      // Qui-Quadrado de Escolaridade
      if (test.test_name.includes("education_level") && test.test_name.includes("Qui-Quadrado")) {
        insights.push({
          id,
          type: "statistical_signal",
          title: decisionSignificance
            ? "Escolaridade correlacionada com aprovação"
            : "Sem evidência estatística suficiente sobre escolaridade",
          description: decisionSignificance
            ? "O teste qui-quadrado de associação encontrou relevância estatística entre o nível educacional e o status final do candidato. Isso sugere disparidade de resultados entre perfis de escolaridade."
            : "Não há evidência estatística suficiente nesta base de associação entre nível educacional e aprovação final.",
          metric: `p = ${test.p_value.toFixed(4)}`,
          severity: decisionSignificance ? "medium" : "low",
          confidence: test.p_value < 0.01 ? "high" : "moderate",
          relatedSection: "statistics",
          recommendedAction: decisionSignificance
            ? "Investigar se as exigências de cargos estão alinhadas às competências práticas ou se há vieses estruturais desfavorecendo candidatos sem graduação."
            : "Manter foco em testes técnicos práticos e monitorar o processo em novas amostras antes de concluir sobre barreiras de entrada."
        });
      }

      // Qui-Quadrado de Canal de Origem
      if (test.test_name.includes("source_channel") && test.test_name.includes("Qui-Quadrado")) {
        insights.push({
          id,
          type: "statistical_signal",
          title: decisionSignificance
            ? "Canais de origem com conversões desiguais"
            : "Sem diferença significativa entre canais",
          description: decisionSignificance
            ? "Há uma diferença estatisticamente significativa na taxa de aprovação com base no canal de origem do candidato. Determinados portais geram leads com maior fit cultural/técnico."
            : "Não há evidência estatística suficiente de associação entre o canal de origem e a taxa de aprovação final nesta base (V de Cramer pequeno). O resultado pode refletir poder estatístico insuficiente ou um recorte específico.",
          metric: `p = ${test.p_value.toFixed(4)} (V de Cramer = ${test.effect_size?.toFixed(2) || "N/A"})`,
          severity: decisionSignificance ? "medium" : "low",
          confidence: "moderate",
          relatedSection: "statistics",
          recommendedAction: decisionSignificance
            ? "Dobrar a aposta nos canais de maior conversão e auditar a qualidade de conteúdo/triagem nos canais de baixa conversão."
            : "Manter a diversificação dos canais e reavaliar com mais dados antes de alterar a distribuição de vagas."
        });
      }

      // Teste t ou ANOVA de Notas do Teste
      if (test.test_name.includes("score_test") && test.test_name.includes("Teste t")) {
        insights.push({
          id,
          type: "statistical_signal",
          title: decisionSignificance
            ? "Testes técnicos preditivos da aprovação"
            : "Sem evidência estatística suficiente nas notas técnicas",
          description: decisionSignificance
            ? `A nota média no teste técnico diferencia significativamente candidatos aprovados dos demais. O tamanho do efeito (Cohen's d = ${test.effect_size?.toFixed(2)}) indica forte relevância prática.`
            : "A nota do teste técnico não apresentou diferença estatisticamente significativa entre aprovados e não aprovados no funil final.",
          metric: `t = ${test.statistic.toFixed(2)} (p = ${test.p_value.toFixed(4)})`,
          severity: decisionSignificance ? "medium" : "high",
          confidence: "high",
          relatedSection: "statistics",
          recommendedAction: decisionSignificance
            ? "Manter o teste técnico como filtro inicial objetivo para o processo de seleção."
            : "Reavaliar o conteúdo do teste técnico ou o peso que os entrevistadores dão a essa nota na decisão final."
        });
      }

      // Teste t ou ANOVA de Notas da Entrevista
      if (test.test_name.includes("score_interview") && test.test_name.includes("Teste t")) {
        insights.push({
          id,
          type: "statistical_signal",
          title: decisionSignificance
            ? "Entrevistas alinhadas com o resultado final"
            : "Sem evidência estatística suficiente nas entrevistas",
          description: decisionSignificance
            ? `As avaliações de entrevista apresentam forte poder discriminatório. Candidatos com notas altas de entrevista de fato avançam, justificando o método.`
            : "As notas de entrevista não possuem correlação estatística clara com o status final dos candidatos.",
          metric: `t = ${test.statistic.toFixed(2)} (p = ${test.p_value.toFixed(4)})`,
          severity: decisionSignificance ? "medium" : "high",
          confidence: "high",
          relatedSection: "statistics",
          recommendedAction: decisionSignificance
            ? "Documentar os critérios de avaliação de entrevistas para promover consistência e treinar novos avaliadores."
            : "Instituir entrevistas estruturadas e calibrações de nota para diminuir a subjetividade dos avaliadores."
        });
      }
    });
  }

  // 5. Ethical & Bias Warnings (Sensitive Columns Check)
  const sensitiveCols = ["gender", "age", "ethnicity", "marital_status", "deficiencias", "genero", "idade", "etnia", "raca"];
  const foundSensitive = quality.columns.filter(c => 
    sensitiveCols.some(s => c.name.toLowerCase().includes(s))
  );

  if (foundSensitive.length > 0) {
    insights.push({
      id: "sensitive-columns-detected",
      type: "bias_warning",
      title: "Uso de dados sensíveis na base",
      description: `Foram identificadas colunas com dados sensíveis ou demográficos (${foundSensitive.map(c => c.name).join(", ")}). O processamento destas variáveis exige rigor ético e controles de acesso apropriados.`,
      metric: `${foundSensitive.length} variável(is) sensível(is)`,
      severity: "high",
      confidence: "high",
      relatedSection: "ethics",
      recommendedAction: "Aplicar o mascaramento de apresentação configurado antes de realizar cruzamentos diretos e verificar que essas variáveis não são utilizadas em filtros de aprovação automática."
    });
  }

  // 6. Actionable recommendations if high null rates
  const highNullCols = quality.columns.filter(c => c.missing_rate > 0.15);
  if (highNullCols.length > 0) {
    insights.push({
      id: "high-null-rate-columns",
      type: "actionable_recommendation",
      title: "Colunas com alto índice de campos em branco",
      description: `As colunas [${highNullCols.map(c => c.name).join(", ")}] possuem taxas de omissão acima de 15%. Isso enfraquece cruzamentos estatísticos nestes eixos.`,
      metric: `Tx. de Omissão > 15%`,
      severity: "medium",
      confidence: "high",
      relatedSection: "quality",
      recommendedAction: "Tornar o preenchimento destes campos obrigatório no formulário de inscrição, ou implementar validações automatizadas de formato."
    });
  }

  // Add default opportunity insight if everything is mostly good
  if (insights.length < 5) {
    insights.push({
      id: "optimize-pipeline",
      type: "actionable_recommendation",
      title: "Auditoria contínua de processos",
      description: "A integridade e calibração das variáveis atuais estão estáveis. Recomenda-se expandir o monitoramento de governança de dados.",
      metric: "Geral",
      severity: "info",
      confidence: "moderate",
      relatedSection: "kpis",
      recommendedAction: "Implementar auditoria periódica de vieses inconscientes e controle de integridade dos formulários de captação."
    });
  }

  return insights;
}
