import { describe, expect, it } from "vitest";
import { installedAxeRules } from "../src/engines/axe.ts";
import { WR_AXE_IDS } from "../src/modules/wr-1.ts";

/* A rule names axe rules by id. A rename in a new axe-core would silently stop a
   rule from finding anything, so the test fails when an id is missing. */

describe("the axe rule ids that the rules name", () => {
  const have = new Set(installedAxeRules());
  for (const [code, ids] of Object.entries(WR_AXE_IDS)) {
    it(`${code} names only rules that the installed axe-core has`, () => {
      expect(ids.filter((id) => !have.has(id))).toEqual([]);
    });
  }
});
