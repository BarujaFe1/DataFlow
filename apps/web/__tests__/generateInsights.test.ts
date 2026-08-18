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
});
