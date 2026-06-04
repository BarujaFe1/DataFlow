import { AnalysisResponse } from "@/types/analysis";
import { generateExecutiveConclusions, DetailedConclusion } from "../analytics/executiveConclusions";
import { COLUMN_DICTIONARY, DictionaryEntry } from "../masking";

export interface ReportModel {
  metadata: {
    generatedAt: string;
    source: "demo" | "upload";
    rows: number;
    columns: number;
  };
  executiveSummary: string[];
  kpis: {
    totalCandidates: number;
    validCandidates: number;
    approvalRate: number;
    avgScoreTest: number;
    avgScoreInterview: number;
    duplicateCount: number;
    medianSalaryExpectation: number;
    topSourceChannel: string;
  };
  healthScore: number;
  qualityPenalties: {
    missingPenalty: number;
    dupPenalty: number;
    emptyPenalty: number;
    constPenalty: number;
    emailPenalty: number;
    outlierPenalty: number;
  };
  cleaningAudit: {
    totalRows: number;
    validRows: number;
    duplicatesRemoved: number;
    maskingEnabled: boolean;
    rulesApplied: string[];
  };
  funnel: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  channelEfficiency: Array<{
    source: string;
    count: number;
    approvalRate: number;
  }>;
  statisticalEvidence: DetailedConclusion[];
  responsibleAnalytics: {
    permittedUses: string[];
    prohibitedUses: string[];
    sensitiveColumns: string[];
  };
  dataDictionary: DictionaryEntry[];
  limitations: string[];
}

export function buildReportModel(
  data: AnalysisResponse,
  isPrivacyEnabled: boolean
): ReportModel {
  const { metadata, quality, kpis, inference, limitations } = data;

  // 1. Generate statistical conclusions and executive summary
  const statsReport = generateExecutiveConclusions(inference);

  // 2. Penalties Breakdown for health score
  const totalCells = metadata.rows * quality.columns.length;
  const missingCells = quality.columns.reduce((sum, c) => sum + c.missing_count, 0);
  const overallMissingRate = totalCells > 0 ? missingCells / totalCells : 0;
  const missingPenalty = Math.floor(overallMissingRate * 25);

  const duplicateCount = kpis.duplicate_count || 0;
  const duplicateRate = kpis.total_candidates > 0 ? duplicateCount / kpis.total_candidates : 0;
  const dupPenalty = duplicateRate > 0 ? Math.min(15, Math.floor(duplicateRate * 50) + 2) : 0;

  let emptyCols = 0;
  let constCols = 0;
  let invalidEmailCols = 0;
  let outlierCols = 0;

  quality.columns.forEach((c) => {
    if (c.flags.includes("Coluna totalmente vazia")) emptyCols++;
    if (c.flags.includes("Coluna constante (mesmo valor em todas as linhas)")) constCols++;
    if (c.flags.some((f) => f.includes("E-mails inválidos"))) invalidEmailCols++;
    if (c.flags.some((f) => f.toLowerCase().includes("outlier"))) outlierCols++;
  });

  const emptyPenalty = Math.min(20, emptyCols * 10);
  const constPenalty = Math.min(15, constCols * 5);
  const emailPenalty = invalidEmailCols > 0 ? 10 : 0;
  const outlierPenalty = outlierCols > 0 ? 5 : 0;

  // 3. Funnel breakdown
  const funnel = (data.charts.funnel || []).map((f) => ({
    stage: f.stage,
    count: f.count,
    percentage: kpis.valid_candidates > 0 ? (f.count / kpis.valid_candidates) * 100 : 0,
  }));

  // 4. Channel efficiency
  const channelEfficiency = (data.charts.sources || []).map((s) => ({
    source: s.source,
    count: s.count,
    approvalRate: s.approval_rate,
  }));

  // 5. Responsible analytics sensitive columns detection
  const sensitiveNames = ["gender", "age", "ethnicity", "marital_status", "deficiencias", "genero", "idade", "etnia", "raca"];
  const sensitiveColumns = quality.columns
    .filter((c) => sensitiveNames.some((s) => c.name.toLowerCase().includes(s)))
    .map((c) => c.name);

  // 6. Data dictionary entries (exclusivamente as 17 colunas principais)
  const columnsToInclude = [
    "candidate_id",
    "timestamp",
    "name",
    "email",
    "city",
    "state",
    "education_level",
    "experience_years",
    "source_channel",
    "role_applied",
    "stage",
    "score_test",
    "score_interview",
    "final_status",
    "salary_expectation",
    "availability",
    "remote_preference",
  ];

  const dataDictionary: DictionaryEntry[] = columnsToInclude.map((colName) => {
    if (COLUMN_DICTIONARY[colName]) {
      return COLUMN_DICTIONARY[colName];
    }
    // fallback if not found in dictionary
    return {
      name: colName,
      type: "Texto / Numérico",
      description: `Variável do processo seletivo mapeada para ${colName}.`,
    };
  });

  return {
    metadata: {
      generatedAt: metadata.generated_at,
      source: metadata.source,
      rows: metadata.rows,
      columns: metadata.columns,
    },
    executiveSummary: statsReport.executiveSummary,
    kpis: {
      totalCandidates: kpis.total_candidates,
      validCandidates: kpis.valid_candidates,
      approvalRate: kpis.approval_rate || 0,
      avgScoreTest: kpis.avg_score_test || 0,
      avgScoreInterview: kpis.avg_score_interview || 0,
      duplicateCount: kpis.duplicate_count || 0,
      medianSalaryExpectation: kpis.median_salary_expectation || 0,
      topSourceChannel: kpis.top_source_channel || "Gupy",
    },
    healthScore: quality.health_score,
    qualityPenalties: {
      missingPenalty,
      dupPenalty,
      emptyPenalty,
      constPenalty,
      emailPenalty,
      outlierPenalty,
    },
    cleaningAudit: {
      totalRows: kpis.total_candidates,
      validRows: kpis.valid_candidates,
      duplicatesRemoved: duplicateCount,
      maskingEnabled: isPrivacyEnabled,
      rulesApplied: [
        "Remoção de registros duplicados por ID do candidato",
        "Sinalização de e-mails em formato inválido",
        "Identificação de outliers em expectativa salarial",
        "Identificação de outliers em anos de experiência",
        "Mascaramento de identificadores de dados pessoais (PII)",
      ],
    },
    funnel,
    channelEfficiency,
    statisticalEvidence: statsReport.conclusions,
    responsibleAnalytics: {
      permittedUses: [
        "Identificar e calibrar as etapas mais exigentes do funil.",
        "Avaliar taxas agregadas de conversão e drop-offs operacionais.",
        "Verificar se avaliações técnicas são estatisticamente preditivas.",
        "Estudos agregados para otimização de verba em canais de mídia.",
      ],
      prohibitedUses: [
        "Classificar, ranquear ou desclassificar candidatos automaticamente.",
        "Tomar decisões de contratação sem revisão humana direta.",
        "Usar escolaridade ou salário como corte rígido automatizado.",
        "Decidir contratações com base estritamente em modelos estatísticos.",
      ],
      sensitiveColumns,
    },
    dataDictionary,
    limitations: limitations && limitations.length > 0 ? limitations : [
      "A base de dados analisada é baseada em dados sintéticos demonstrativos e possui fins de teste.",
      "Estudos inferenciais são baseados em probabilidades agregadas e sua acurácia prática é restrita à base específica.",
      "Correlação não implica causalidade.",
    ],
  };
}
