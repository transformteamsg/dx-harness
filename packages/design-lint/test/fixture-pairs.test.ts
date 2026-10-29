import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadRules } from "../src/rules/load.ts";
import { BASE, missingFixturePairs } from "./helpers.ts";

/* fixtures.test.ts runs each fixture directory that exists, so a lint rule with
   no fixture pair would pass without a word. This guard names it. See issue #549. */

const FIXTURES = path.resolve(import.meta.dirname, "../fixtures");
const { rules } = loadRules(BASE);

/* Lint rules with no module, so no fixture can prove them yet. Each has its reason in its category README. */
const UNBUILT = ["WP-15a"];

describe("each lint rule has a fixture pair", () => {
  it.each(rules.map((r) => r.code).filter((code) => !UNBUILT.includes(code)))("%s has a fixture pair", (code) => {
    const rule = rules.find((r) => r.code === code)!;
    expect(missingFixturePairs([rule], FIXTURES)).toEqual([]);
  });

  it("lists only unbuilt rules as exceptions", () => {
    for (const code of UNBUILT) expect(rules.map((r) => r.code)).toContain(code);
  });
});

describe("a new lint rule with no fixture pair", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-pairs-"));
  fs.mkdirSync(path.join(dir, "rules", "lay"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, "rules", "lay", "a-title.md"),
    "---\ncode: LAY-9a\nslug: a-title\ndss: LAY-9\ntier: L2\ncheck: lint\nsurface: source\nengine: custom\nparameters: {}\n---\n\n# LAY-9a: a title\n",
  );
  const fixtures = path.join(dir, "fixtures");
  fs.mkdirSync(path.join(fixtures, "LAY-8a", "pass"), { recursive: true });
  const loaded = loadRules(path.join(dir, "rules")).rules;

  it("is named by the guard", () => {
    expect(missingFixturePairs(loaded, fixtures)).toEqual(["LAY-9a"]);
  });

  it("is named when its fixture directory has no fail site", () => {
    fs.mkdirSync(path.join(fixtures, "LAY-9a", "pass"), { recursive: true });
    fs.writeFileSync(path.join(fixtures, "LAY-9a", "expected.json"), "[]\n");
    expect(missingFixturePairs(loaded, fixtures)).toEqual(["LAY-9a"]);
  });

  it("is not named once the pair is complete", () => {
    fs.mkdirSync(path.join(fixtures, "LAY-9a", "fail"), { recursive: true });
    expect(missingFixturePairs(loaded, fixtures)).toEqual([]);
  });
});
