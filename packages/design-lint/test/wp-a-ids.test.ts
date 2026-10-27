import { describe, expect, it } from "vitest";
import { installedAxeRules } from "../src/engines/axe.ts";
import { installedJsxA11yRules } from "../src/engines/jsx-a11y.ts";
import { WP_AXE_IDS, WP_JSX_IDS, checkVtt } from "../src/modules/wp/a.ts";

/* A rename in a new engine version would silently stop a rule from finding
   anything, so the test fails when an id is missing. */

describe("the axe rule ids of WP-1 to WP-9", () => {
  const have = new Set(installedAxeRules());
  for (const [code, ids] of Object.entries(WP_AXE_IDS)) {
    it(`${code} names only rules that the installed axe-core has`, () => {
      expect(ids.filter((id) => !have.has(id))).toEqual([]);
    });
  }
});

describe("the jsx-a11y rule ids of WP-1 to WP-9", () => {
  const have = new Set(installedJsxA11yRules());
  for (const [code, ids] of Object.entries(WP_JSX_IDS)) {
    it(`${code} names only rules that the installed plugin has`, () => {
      expect(ids.filter((id) => !have.has(id))).toEqual([]);
    });
  }
});

describe("checkVtt", () => {
  it("accepts a valid file with a note and cue settings", () => {
    const text = "WEBVTT - title\n\nNOTE a note\n\nid\n00:00.000 --> 00:01.000 align:start\n<b>Hi</b>\n";
    expect(checkVtt(text, 2, 42)).toEqual([]);
  });
  it("accepts an hour in a timestamp", () => {
    expect(checkVtt("WEBVTT\n\n01:00:00.000 --> 01:00:02.000\nHi\n", 2, 42)).toEqual([]);
  });
  it("reports a cue that ends before it starts", () => {
    expect(checkVtt("WEBVTT\n\n00:02.000 --> 00:01.000\nHi\n", 2, 42)).toHaveLength(1);
  });
});
