import { describe, expect, it } from "vitest";
import * as pageModule from "@/app/page";

type PrivacyDisclosure = (privacyMode: string | undefined, isPrivacyEnabled: boolean) => string;

describe("page privacy disclosure", () => {
  it("describes production as backend-configured policy instead of Demo", () => {
    const getPrivacyDisclosure = (pageModule as { getPrivacyDisclosure?: PrivacyDisclosure })
      .getPrivacyDisclosure;

    expect(getPrivacyDisclosure).toBeTypeOf("function");
    expect(getPrivacyDisclosure?.("production", true)).toBe(
      "Modo Produção: nomes e e-mails seguem a política de mascaramento configurada no backend."
    );
  });

  it("warns that local raw presentation may expose raw values when masking is disabled", () => {
    const getPrivacyDisclosure = (pageModule as { getPrivacyDisclosure?: PrivacyDisclosure })
      .getPrivacyDisclosure;

    expect(getPrivacyDisclosure?.("local", false)).toMatch(/valores brutos.*visíveis/i);
    expect(getPrivacyDisclosure?.("local", false)).not.toMatch(/mascarad/i);
  });
});
