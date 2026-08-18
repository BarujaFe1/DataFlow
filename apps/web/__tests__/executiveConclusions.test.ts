import { describe, expect, it } from "vitest";
import { generateExecutiveConclusions } from "@/lib/analytics/executiveConclusions";
import type { InferenceResult } from "@/types/analysis";

const nonSignificantEducation: InferenceResult = {
  test_name: "Qui-Quadrado education_level x status",
  test_type: "chi_square",
  variables: ["education_level", "final_status"],
  statistic: 0.8,
  p_value: 0.37,
  significance: false,
  interpretation: "Sem associação detectada.",
  limitations: "Amostra histórica.",
};

describe("generateExecutiveConclusions", () => {
  it("frames non-significant education results as insufficient evidence, not guaranteed opportunity", () => {
    const report = generateExecutiveConclusions([nonSignificantEducation]);

    expect(report.executiveSummary).toContain(
      "A escolaridade formal não apresentou evidência estatística suficiente de associação com a aprovação final nesta base; o resultado não permite concluir sobre oportunidades entre níveis de formação."
    );
  });
});
