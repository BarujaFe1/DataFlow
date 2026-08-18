import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ResponsibleAnalyticsCenter from "@/components/dashboard/ResponsibleAnalyticsCenter";
import type { ColumnProfile } from "@/types/analysis";

const columns: ColumnProfile[] = [
  {
    name: "name",
    inferred_type: "string",
    missing_count: 0,
    missing_rate: 0,
    unique_count: 1,
    unique_rate: 1,
    flags: [],
  },
  {
    name: "email",
    inferred_type: "string",
    missing_count: 0,
    missing_rate: 0,
    unique_count: 1,
    unique_rate: 1,
    flags: [],
  },
  {
    name: "score_test",
    inferred_type: "number",
    missing_count: 0,
    missing_rate: 0,
    unique_count: 1,
    unique_rate: 1,
    flags: [],
  },
];

const baseProps = {
  columns,
  isPrivacyEnabled: true,
  onTogglePrivacy: () => {},
  duplicateCount: 0,
};

describe("ResponsibleAnalyticsCenter — privacy disclosure", () => {
  it("uses configured-policy wording without absolute masking claims for demo mode", () => {
    render(<ResponsibleAnalyticsCenter {...baseProps} privacyMode="demo" />);
    expect(screen.getByText(/Modo Demo/)).toBeInTheDocument();
    expect(
      screen.getByText(/política de mascaramento configurada no backend/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/garantido|sempre/i)).not.toBeInTheDocument();
  });

  it("discloses the exposed (raw) behavior for raw mode", () => {
    render(<ResponsibleAnalyticsCenter {...baseProps} privacyMode="raw" />);
    expect(screen.getByText(/Modo RAW/)).toBeInTheDocument();
    expect(
      screen.getByText(/dados completos \(incluindo PII\) expostos/)
    ).toBeInTheDocument();
  });

  it("describes the local export as potentially raw when raw records are enabled", () => {
    render(<ResponsibleAnalyticsCenter {...baseProps} privacyMode="local" />);
    expect(
      screen.getByText(/pode conter registros brutos quando habilitados/)
    ).toBeInTheDocument();
  });

  it("uses configured-policy wording for production mode without presenting it as demo", () => {
    render(<ResponsibleAnalyticsCenter {...baseProps} privacyMode="production" />);
    expect(screen.getByText(/Modo Produção/)).toBeInTheDocument();
    expect(
      screen.getByText(/política de mascaramento configurada no backend/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/sempre mascara/i)).not.toBeInTheDocument();
  });

  it("does not infer masking state for an unknown backend mode", () => {
    render(<ResponsibleAnalyticsCenter {...baseProps} privacyMode="preview" />);
    expect(screen.getByText(/Modo não identificado/)).toBeInTheDocument();
    expect(screen.getByText(/estado de mascaramento não foi inferido/)).toBeInTheDocument();
    expect(screen.queryByText(/sempre mascara/i)).not.toBeInTheDocument();
  });

  it("uses masking terminology instead of an LGPD state", () => {
    render(<ResponsibleAnalyticsCenter {...baseProps} privacyMode="demo" />);
    expect(
      screen.getByText(
        /Divulgação de Privacidade — Política de Mascaramento/
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(/Modo LGPD/i)).not.toBeInTheDocument();
  });

  it("demonstrates the PII transform applied by the backend masking", () => {
    render(<ResponsibleAnalyticsCenter {...baseProps} privacyMode="demo" />);
    // maskName("Maria Oliveira", "C-1042") -> "Candidato C-1042"
    expect(screen.getByText("Candidato C-1042")).toBeInTheDocument();
    // maskEmail("maria.oliveira@empresa.com") -> "m***@empresa.com"
    expect(screen.getByText("m***@empresa.com")).toBeInTheDocument();
  });
});
