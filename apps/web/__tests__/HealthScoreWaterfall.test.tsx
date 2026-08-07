import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HealthScoreWaterfall from "@/components/charts/HealthScoreWaterfall";
import type { ScorePenalty } from "@/lib/reporting/scorePenalties";

// Penalties that sum to 2.4 while the headline score is 98 -> residual +0.4,
// which must render as an explicit "Ajuste de arredondamento" step.
const penaltiesWithResidual: ScorePenalty[] = [
  { dimension: "completeness", label: "Ausência / Nulos", points: 1.2, rate: 0.012 },
  { dimension: "uniqueness", label: "Duplicidades", points: 0.6, rate: 0.004 },
  { dimension: "validity", label: "E-mails Inválidos", points: 0.6, rate: 0.0024 },
];

// Penalties that sum exactly to 2.0 while the headline score is 98 -> no
// residual, so no rounding step should be shown.
const penaltiesExact: ScorePenalty[] = [
  { dimension: "completeness", label: "Ausência / Nulos", points: 1.0, rate: 0.01 },
  { dimension: "uniqueness", label: "Duplicidades", points: 0.6, rate: 0.004 },
  { dimension: "validity", label: "E-mails Inválidos", points: 0.4, rate: 0.0016 },
];

describe("HealthScoreWaterfall", () => {
  it("renders an explicit 'Ajuste de arredondamento' step when penalties do not reconcile", () => {
    render(<HealthScoreWaterfall score={98} penalties={penaltiesWithResidual} />);
    expect(screen.getByText("Ajuste de arredondamento")).toBeInTheDocument();
  });

  it("does NOT render a rounding step when penalties already reconcile", () => {
    render(<HealthScoreWaterfall score={98} penalties={penaltiesExact} />);
    expect(screen.queryByText("Ajuste de arredondamento")).not.toBeInTheDocument();
  });

  it("renders the start, the penalties, and the authoritative 'Score Final'", () => {
    render(<HealthScoreWaterfall score={98} penalties={penaltiesWithResidual} />);
    expect(screen.getByText("Ref. Inicial (100)")).toBeInTheDocument();
    expect(screen.getByText("Score Final")).toBeInTheDocument();
    // The headline score is shown as the final value.
    expect(screen.getByText("98")).toBeInTheDocument();
  });

  it("renders the plausibility label without 'Outliers'", () => {
    const withPlausibility: ScorePenalty[] = [
      ...penaltiesExact,
      { dimension: "plausibility", label: "Valores Implausíveis", points: 0.0, rate: 0 },
    ];
    render(<HealthScoreWaterfall score={98} penalties={withPlausibility} />);
    expect(screen.getByText("Valores Implausíveis")).toBeInTheDocument();
  });

  it("tolerates empty penalties without crashing", () => {
    render(<HealthScoreWaterfall score={100} penalties={[]} />);
    expect(screen.getByText("Score Final")).toBeInTheDocument();
    expect(screen.queryByText("Ajuste de arredondamento")).not.toBeInTheDocument();
  });
});
