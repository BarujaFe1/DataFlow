import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ScoreBreakdown from "@/components/dashboard/ScoreBreakdown";
import type { QualityScore } from "@/types/analysis";

const fullScore: QualityScore = {
  overall: 82,
  dimension_scores: {
    completeness: 90,
    validity: 85,
    uniqueness: 95,
    consistency: 80,
    plausibility: 78,
    schema: 88,
  },
  weights: {
    completeness: 0.3,
    validity: 0.25,
    uniqueness: 0.15,
    consistency: 0.1,
    plausibility: 0.1,
    schema: 0.1,
  },
  policy_version: "2.0",
  issues: [],
  penalties: [],
  confidence: 1.0,
  applicability: "Ready for screening.",
};

describe("ScoreBreakdown", () => {
  it("renders all six backend-weighted dimensions", () => {
    render(<ScoreBreakdown score={fullScore} />);
    for (const label of [
      "Completude",
      "Validade",
      "Unicidade",
      "Consistência",
      "Plausibilidade",
      "Esquema",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("tolerates a missing score without crashing (empty fallback)", () => {
    render(<ScoreBreakdown score={undefined as unknown as QualityScore} />);
    expect(
      screen.getByText(/Composição do Score de Qualidade/)
    ).toBeInTheDocument();
    expect(screen.getByText("Score Final")).toBeInTheDocument();
  });

  it("exposes the robustness indicator (robustez), explicitly NOT a probability", () => {
    const { rerender } = render(
      <ScoreBreakdown score={{ ...fullScore, confidence: 1.0 }} />
    );
    expect(
      screen.getByText(/Robustez da avaliação 100%/)
    ).toBeInTheDocument();

    rerender(<ScoreBreakdown score={{ ...fullScore, confidence: 0.5 }} />);
    const smallSampleBadge = screen.getByText(/Robustez da avaliação 50%/);
    expect(smallSampleBadge).toBeInTheDocument();
    // Tooltip must clarify it is NOT a probability / confidence interval.
    expect(smallSampleBadge).toHaveAttribute(
      "title",
      expect.stringContaining(
        "Não representa probabilidade nem intervalo de confiança"
      )
    );
  });
});
