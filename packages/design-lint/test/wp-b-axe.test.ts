import { describe, expect, it } from "vitest";
import { installedAxeRules } from "../src/engines/axe.ts";
import { installedJsxA11yRules } from "../src/engines/jsx-a11y.ts";
import { WP_B_AXE_IDS, WP_B_JSX_IDS } from "../src/modules/wp/b.ts";

/* The engine rule ids that WP-10 to WP-19 name must exist in the installed versions. */

describe("the engine rule ids of WP-10 to WP-19", () => {
  const axe = new Set(installedAxeRules());
  for (const [code, ids] of Object.entries(WP_B_AXE_IDS)) {
    it(`${code} names only axe-core rules that exist`, () => {
      expect(ids.filter((id) => !axe.has(id))).toEqual([]);
    });
  }
  const jsx = new Set(installedJsxA11yRules());
  for (const [code, ids] of Object.entries(WP_B_JSX_IDS)) {
    it(`${code} names only jsx-a11y rules that exist`, () => {
      expect(ids.filter((id) => !jsx.has(id))).toEqual([]);
    });
  }
});
