import { describe, expect, it } from "vitest";
import { exitCode, formatFinding, formatNote, summariseUnset } from "../src/report.ts";
import type { Finding, Note, RuleMeta, Tier } from "../src/types.ts";

const finding = (tier: Tier): Finding => ({
  code: "BD-1a",
  tier,
  file: "index.html",
  line: 12,
  column: 5,
  message: "Viewport meta tag blocks zoom.",
});
const tiers = new Map<string, Tier>([
  ["BD-1a", "L1"],
  ["BD-4a", "L2"],
]);

describe("formatFinding", () => {
  it("prints file:line:column: CODE [tier] message", () => {
    expect(formatFinding(finding("L1"))).toBe("index.html:12:5: BD-1a [L1] Viewport meta tag blocks zoom.");
  });
});

describe("formatNote", () => {
  it("names the kind and the detail", () => {
    const n: Note = { code: "BD-4a", kind: "not-configured", detail: ["maxGrade", "locale"] };
    expect(formatNote(n)).toBe("note: BD-4a not configured: maxGrade, locale");
  });
});

describe("exitCode", () => {
  it("is 0 with no finding and no note", () => {
    expect(exitCode([], [], tiers)).toBe(0);
  });
  it("is 1 for an L1 finding", () => {
    expect(exitCode([finding("L1")], [], tiers)).toBe(1);
  });
  it("is 0 for an L2 finding, which only warns", () => {
    expect(exitCode([finding("L2")], [], tiers)).toBe(0);
  });
  it("is 1 for an L1 rule that is not configured", () => {
    const n: Note = { code: "BD-1a", kind: "not-configured", detail: ["x"] };
    expect(exitCode([], [n], tiers)).toBe(1);
  });
  it("is 0 for an L2 rule that is not configured", () => {
    const n: Note = { code: "BD-4a", kind: "not-configured", detail: ["x"] };
    expect(exitCode([], [n], tiers)).toBe(0);
  });
  it("ignores a rule that has no module yet", () => {
    const n: Note = { code: "BD-1a", kind: "no-module", detail: [] };
    expect(exitCode([], [n], tiers)).toBe(0);
  });
});

describe("summariseUnset", () => {
  it("groups the unset parameters by rule", () => {
    const rules = [{ code: "BD-4a" }] as RuleMeta[];
    const notes: Note[] = [{ code: "BD-4a", kind: "not-configured", detail: ["maxGrade", "locale"] }];
    expect(summariseUnset(notes, rules)).toEqual([
      "1 rule needs configuration. Run design-lint init, or set these values:",
      "  BD-4a   maxGrade, locale",
    ]);
  });
  it("uses the plural for more than one rule", () => {
    const rules = [{ code: "BD-4a" }, { code: "BD-3a" }] as RuleMeta[];
    const notes: Note[] = [
      { code: "BD-4a", kind: "not-configured", detail: ["maxGrade"] },
      { code: "BD-3a", kind: "not-configured", detail: ["locales"] },
    ];
    expect(summariseUnset(notes, rules)[0]).toBe("2 rules need configuration. Run design-lint init, or set these values:");
  });
  it("keeps a space after a code of eight characters or more, and aligns the rest to it", () => {
    const rules = [{ code: "BD-4a" }, { code: "A11Y-11b" }] as RuleMeta[];
    const notes: Note[] = [
      { code: "BD-4a", kind: "not-configured", detail: ["maxGrade"] },
      { code: "A11Y-11b", kind: "not-configured", detail: ["actions"] },
    ];
    expect(summariseUnset(notes, rules).slice(1)).toEqual(["  BD-4a    maxGrade", "  A11Y-11b actions"]);
  });
  it("prints nothing when every rule is configured", () => {
    expect(summariseUnset([], [])).toEqual([]);
  });
});
