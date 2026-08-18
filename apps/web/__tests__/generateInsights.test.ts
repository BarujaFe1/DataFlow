import { describe, expect, it } from "vitest";
import { generateStructuredInsights } from "@/lib/insights/generateInsights";
import type { AnalysisResponse } from "@/types/analysis";

const highHealthData = {
  metadata: { generated_at: "2026-08-17T00:00:00Z", source: "demo", rows: 120, columns: 1 },
  quality: {
    health_score: 90,
    summary: "",
    columns: [],
    dataset_flags: [],
    score: { overall: 90, dimension_scores: {}, weights: {}, policy_version: "v2", issues: [], penalties: [], confidence: 1, applicability: "all" },
  },
  kpis: { total_candidates: 120, valid_candidates: 120, duplicate_count: 0 },
  charts: { missingness: [], funnel: [], sources: [], roles: [] },
  inference: [],
  insights: [],
  limitations: [],
  records: [],
} satisfies AnalysisResponse;

describe("generateStructuredInsights", () => {
  it("presents a high Health Score as a versioned heuristic that supports, not guarantees, analysis", () => {
    const [healthInsight] = generateStructuredInsights(highHealthData);

    expect(healthInsight.description).toContain(
      "heurística versionada de qualidade que apoia a leitura dos testes estatísticos"
    );
    expect(healthInsight.description).not.toMatch(/garante|confiabilidade/i);
  });

  it("uses insufficient-evidence titles for non-significant education, test-score, and interview results", () => {
    const insights = generateStructuredInsights({
      ...highHealthData,
      inference: [
        {
          test_name: "Qui-Quadrado education_level",
          test_type: "chi_square",
          variables: ["education_level", "final_status"],
          statistic: 1,
          p_value: 0.4,
          significance: false,
          interpretation: "",
          limitations: "",
        },
        {
          test_name: "Teste t score_test",
          test_type: "t_test",
          variables: ["score_test", "final_status"],
          statistic: 1,
          p_value: 0.4,
          significance: false,
          interpretation: "",
          limitations: "",
        },
        {
          test_name: "Teste t score_interview",
          test_type: "t_test",
          variables: ["score_interview", "final_status"],
          statistic: 1,
          p_value: 0.4,
          significance: false,
          interpretation: "",
          limitations: "",
        },
      ],
    });

    expect(insights.map((insight) => insight.title)).toEqual(
      expect.arrayContaining([
        "Sem evidência estatística suficiente sobre escolaridade",
        "Sem evidência estatística suficiente nas notas técnicas",
        "Sem evidência estatística suficiente nas entrevistas",
      ])
    );
  });
});
