import { describe, expect, it } from "vitest";
import { installedAxeRules } from "../src/engines/axe.ts";
import { installedJsxA11yRules } from "../src/engines/jsx-a11y.ts";
import { WO_AXE_IDS } from "../src/modules/wo/axe.ts";
import { WO_JSX_IDS } from "../src/modules/wo/source.ts";

/* The rules of WO name axe and jsx-a11y rules by id. A rename in a new version
   would stop a rule from finding anything, so the test fails when an id is missing. */

describe("the axe rule ids that the rules of WO name", () => {
  const have = new Set(installedAxeRules());
  for (const [code, ids] of Object.entries(WO_AXE_IDS)) {
    it(`${code} names only rules that the installed axe-core has`, () => {
      expect(ids.filter((id) => !have.has(id))).toEqual([]);
    });
  }
});

describe("the jsx-a11y rule ids that the rules of WO name", () => {
  const have = new Set(installedJsxA11yRules());
  for (const [code, ids] of Object.entries(WO_JSX_IDS)) {
    it(`${code} names only rules that the installed plugin has`, () => {
      expect(ids.filter((id) => !have.has(id))).toEqual([]);
    });
  }
});

describe("the experimental axe rule of WO-16a", () => {
  it("is not tagged experimental in the installed axe-core, so runOnly runs it", async () => {
    const axe = (await import("axe-core")).default as { getRules(): { ruleId: string; tags: string[] }[] };
    const rule = axe.getRules().find((r) => r.ruleId === "label-content-name-mismatch");
    expect(rule?.tags).not.toContain("experimental");
  });
});
