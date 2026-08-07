import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import InferencePanel from "@/components/dashboard/InferencePanel";
import type { InferenceResult } from "@/types/analysis";

const adjusted: InferenceResult = {
  test_name: "Qui-Quadrado de Independência (Canal x Status)",
  test_type: "chi_square",
  variables: ["source_channel", "final_status"],
  n_total: 320,
  group_sizes: { Aprovado: 140, Reprovado: 180 },
  statistic: 12.34,
  p_value: 0.0034,
  effect_size: 0.21,
  effect_size_name: "Cramer's V",
  significance: true,
  p_value_adjusted: 0.0123,
  correction_method: "bonferroni",
  interpretation: "Associação detectada entre canal e status.",
  limitations: "Amostra histórica; não implica causalidade.",
};

describe("InferencePanel", () => {
  it("shows the raw vs adjusted p-value block when p_value_adjusted is present", () => {
    render(<InferencePanel inference={[adjusted]} />);
    expect(screen.getByText(/p bruto \(nominal\)/)).toBeInTheDocument();
    expect(
      screen.getByText(/p ajustado \(bonferroni\)/)
    ).toBeInTheDocument();
    // Adjusted value is unique on the card; raw value also appears (metric + block).
    expect(screen.getByText("0.0123")).toBeInTheDocument();
    expect(screen.getAllByText("0.0034").length).toBeGreaterThan(0);
  });

  it("shows the small-sample heuristic alert for n_total < 100", () => {
    const small: InferenceResult = {
      ...adjusted,
      n_total: 80,
      p_value_adjusted: null,
      correction_method: null,
      group_sizes: { A: 40, B: 40 },
    };
    render(<InferencePanel inference={[small]} />);
    expect(screen.getByText(/Amostra limitada/)).toBeInTheDocument();
    // Framed as a transparency heuristic, NOT a universal validity rule.
    expect(
      screen.getByText(/alerta heurístico de transparência/)
    ).toBeInTheDocument();
  });

  it("shows the small-sample alert when the backend emits a Cochran warning (n >= 100)", () => {
    const warned: InferenceResult = {
      ...adjusted,
      n_total: 250,
      p_value_adjusted: null,
      correction_method: null,
      warnings: ["Cochran: expected frequency < 1 in 2 cells"],
    };
    render(<InferencePanel inference={[warned]} />);
    expect(screen.getByText(/Amostra limitada/)).toBeInTheDocument();
  });

  it("renders the empty state when no inference is available", () => {
    render(<InferencePanel inference={[]} />);
    expect(
      screen.getByText(/Análise Inferencial Indisponível/)
    ).toBeInTheDocument();
  });
});
