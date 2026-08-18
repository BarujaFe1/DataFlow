import { describe, expect, it } from "vitest";
import { getDrawerScoreImpact, maskTopValuesForPresentation } from "@/components/table/DataTable";

describe("Context Drawer presentation safeguards", () => {
  it("masks sensitive top values for presentation without changing non-sensitive values", () => {
    expect(maskTopValuesForPresentation("email", [{ value: "ana@example.com", count: 2, rate: 0.5 }], true))
      .toEqual([{ value: "a***@example.com", count: 2, rate: 0.5 }]);
    expect(maskTopValuesForPresentation("source_channel", [{ value: "Portal", count: 2, rate: 0.5 }], true))
      .toEqual([{ value: "Portal", count: 2, rate: 0.5 }]);
  });

  it("uses non-numeric backend-authoritative contribution wording", () => {
    expect(getDrawerScoreImpact(0.4, ["E-mails inválidos"])).toMatch(/dimensão|backend/i);
    expect(getDrawerScoreImpact(0.4, ["E-mails inválidos"])).not.toMatch(/-10|missing_rate|pts/i);
  });
});
