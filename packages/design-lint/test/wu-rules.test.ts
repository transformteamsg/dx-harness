import { describe, expect, it } from "vitest";
import { installedAxeRules } from "../src/engines/axe.ts";
import { installedJsxA11yRules } from "../src/engines/jsx-a11y.ts";
import { validLanguageTag, WU_AXE_IDS, WU_JSX_IDS } from "../src/modules/wu/lang.ts";
import { wu14a } from "../src/modules/wu/flows.ts";
import { isCredentialField } from "../src/modules/wu/scripts.ts";

/* The rules of WU that name engine ids, and the checks that have no fixture. */

describe("the engine ids that the rules of WU name", () => {
  const axe = new Set(installedAxeRules());
  for (const [code, ids] of Object.entries(WU_AXE_IDS)) {
    it(`${code} names only axe rules that the installed axe-core has`, () => {
      expect(ids.filter((id) => !axe.has(id))).toEqual([]);
    });
  }
  const jsx = new Set([...installedJsxA11yRules()]);
  it("names only jsx-a11y rules that the installed plugin has", () => {
    const ids = [...Object.values(WU_JSX_IDS).flat(), "autocomplete-valid"];
    expect(ids.filter((id) => !jsx.has(id))).toEqual([]);
  });
});

describe("validLanguageTag", () => {
  it("accepts well-formed tags", () => {
    for (const t of ["en", "en-SG", "zh-Hans-CN", "ms", "x-private"]) expect(validLanguageTag(t)).toBe(true);
  });
  it("rejects malformed tags", () => {
    for (const t of ["", "english", "en_SG", "e", "en-"]) expect(validLanguageTag(t)).toBe(false);
  });
});

describe("WU-14a", () => {
  const verdict = (methods: string[]) => {
    const params = { authMethods: methods, accessibleMethods: ["passkey", "otp-sms"] };
    const [c] = wu14a.locate({ files: [], root: ".", params }) as never[];
    return wu14a.decide(c, params);
  };
  it("passes when one method is accessible", () => expect(verdict(["password", "passkey"])).toBeNull());
  it("passes when the service has no login", () => expect(verdict([])).toBeNull());
  it("fails when every method needs memory or transcription", () => expect(verdict(["password", "captcha"])).toMatch(/memory or transcription/));
});

describe("isCredentialField", () => {
  it("recognises password and code fields", () => {
    expect(isCredentialField({ tag: "input", attrs: { type: "password" } })).toBe(true);
    expect(isCredentialField({ tag: "input", attrs: { name: "otp" } })).toBe(true);
    expect(isCredentialField({ tag: "input", attrs: { name: "email", type: "email" } })).toBe(false);
  });
});
