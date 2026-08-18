import { describe, expect, it } from "vitest";
import { getReportMaskingChecklist } from "@/components/report/ReportView";

describe("report privacy checklist", () => {
  it("labels identifiers as masked only when presentation masking is enabled", () => {
    expect(getReportMaskingChecklist(true)).toEqual(["Nome: Mascarado", "Email: Mascarado"]);
    expect(getReportMaskingChecklist(false)).toEqual(["Nome: PII pode estar visível", "Email: PII pode estar visível"]);
  });
});
