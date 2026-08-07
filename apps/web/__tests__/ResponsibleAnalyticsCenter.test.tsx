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
  it("uses configured-policy wording (no 'garantido') for demo mode", () => {
    render(<ResponsibleAnalyticsCenter {...baseProps} privacyMode="demo" />);
    expect(screen.getByText(/Modo Demo/)).toBeInTheDocument();
    expect(
      screen.getByText(/mascaramento configurado no backend/)
    ).toBeInTheDocument();
    // The component must never claim an absolute "garantia" of masking.
    expect(screen.queryByText(/garantido/i)).not.toBeInTheDocument();
  });

  it("discloses the exposed (raw) behavior for raw mode", () => {
    render(<ResponsibleAnalyticsCenter {...baseProps} privacyMode="raw" />);
    expect(screen.getByText(/Modo RAW/)).toBeInTheDocument();
    expect(
      screen.getByText(/dados completos \(incluindo PII\) expostos/)
    ).toBeInTheDocument();
  });

  it("renders the masking policy disclosure header", () => {
    render(<ResponsibleAnalyticsCenter {...baseProps} privacyMode="demo" />);
    expect(
      screen.getByText(
        /Divulgação de Privacidade — Política de Mascaramento \(LGPD\)/
      )
    ).toBeInTheDocument();
  });

  it("demonstrates the PII transform applied by the backend masking", () => {
    render(<ResponsibleAnalyticsCenter {...baseProps} privacyMode="demo" />);
    // maskName("Maria Oliveira", "C-1042") -> "Candidato C-1042"
    expect(screen.getByText("Candidato C-1042")).toBeInTheDocument();
    // maskEmail("maria.oliveira@empresa.com") -> "m***@empresa.com"
    expect(screen.getByText("m***@empresa.com")).toBeInTheDocument();
  });
});
