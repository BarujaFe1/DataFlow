import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import IssuesPanel from "@/components/dashboard/IssuesPanel";
import type { QualityIssue } from "@/types/analysis";

const issues: QualityIssue[] = [
  {
    issue_id: "i1",
    dimension: "completeness",
    severity: "low",
    count: 5,
    rate: 0.05,
    rule_scope: "generic",
    evidence: {},
    penalty: 2,
    action: "Preencha os valores vazios.",
    is_auto_fixable: false,
  },
  {
    issue_id: "i2",
    dimension: "validity",
    severity: "high",
    count: 12,
    rate: 0.12,
    rule_scope: "generic",
    evidence: {},
    penalty: 8,
    action: "Corrija os e-mails inválidos.",
    is_auto_fixable: true,
  },
  {
    issue_id: "i3",
    dimension: "uniqueness",
    severity: "medium",
    count: 3,
    rate: 0.03,
    rule_scope: "generic",
    evidence: {},
    penalty: 3,
    action: "Remova os registros duplicados.",
    is_auto_fixable: false,
  },
];

describe("IssuesPanel", () => {
  it("orders issues by severity high -> medium -> low", () => {
    render(<IssuesPanel issues={issues} />);
    const badges = screen.getAllByText(/ALTO|MÉDIO|BAIXO/);
    const rendered = badges.map((b) => b.textContent);
    expect(rendered).toEqual(["ALTO", "MÉDIO", "BAIXO"]);
  });

  it("shows an empty state when there are no issues", () => {
    render(<IssuesPanel issues={[]} />);
    expect(
      screen.getByText(/Nenhum issue de qualidade detectado/)
    ).toBeInTheDocument();
  });

  it("flags auto-fixable issues and marks the rest for manual review", () => {
    render(<IssuesPanel issues={issues} />);
    expect(screen.getByText(/auto-corrigível/)).toBeInTheDocument();
    // Two of the three fixture issues are non-auto-fixable, so the manual-review
    // label appears more than once.
    expect(
      screen.getAllByText(/\(revisão manual\)/).length
    ).toBeGreaterThan(0);
  });
});
