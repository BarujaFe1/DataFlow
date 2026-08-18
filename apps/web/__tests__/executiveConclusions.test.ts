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

  it("treats nominal-only technical evidence as exploratory after an explicit failed correction", () => {
    const report = generateExecutiveConclusions([{
      ...nonSignificantEducation,
      test_name: "Teste t score_test x final_status",
      variables: ["score_test", "final_status"],
      p_value: 0.014,
      significance: true,
      corrected_significance: false,
    }]);

    expect(report.conclusions[0].practicalInterpretation).toMatch(/exploratório|inconclusivo/i);
    expect(report.conclusions[0].practicalInterpretation).not.toMatch(/significativamente diferentes|forte diferenciação/i);
    expect(report.conclusions[0].recommendedAction).not.toMatch(/manter o teste técnico como fase inicial/i);
  });

  it("does not claim report masking when presentation masking is disabled", () => {
    const summary = generateExecutiveConclusions([], false).executiveSummary.join(" ");
    expect(summary).toMatch(/PII pode.*visível|não.*mascarad/i);
    expect(summary).not.toMatch(/relatório aplica mascaramento/i);
    expect(generateExecutiveConclusions([], true).executiveSummary.join(" ")).toMatch(/mascaramento de PII/i);
  });
});
