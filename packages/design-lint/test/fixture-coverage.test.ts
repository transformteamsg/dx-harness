import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { loadRules } from "../src/rules/load.ts";
import type { RuleMeta } from "../src/types.ts";
import { BASE, missingFixtures } from "./helpers.ts";

/* A lint rule proves itself with a fixture pair (docs/testing.md). A rule
   with no pair fails the run, and the failure names the rule. */

const FIXTURES = path.resolve(import.meta.dirname, "../fixtures");
/* WP-15a has no module yet: the OCR library is an open item in wp/README.md. */
const NO_FIXTURE_YET = ["WP-15a"];

const rule = (code: string): RuleMeta => ({
  code,
  slug: code.toLowerCase(),
  dss: code.replace(/[a-z]$/, ""),
  tier: "L1",
  surface: "source",
  engine: "custom",
  judgedRemainder: [],
  redirects: [],
  parameters: {},
  title: code,
  file: `${code}.md`,
});

describe("3. a lint rule with no fixture pair fails", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fixture-coverage-"));
  afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  const pair = (code: string, parts: string[]) => {
    for (const part of parts) {
      const full = path.join(dir, code, part);
      if (part.endsWith(".json")) {
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, "[]\n");
      } else fs.mkdirSync(full, { recursive: true });
    }
  };
  pair("CMP-1a", ["pass", "fail", "expected.json"]);
  pair("CMP-1b", ["pass", "expected.json"]);

  it("names a rule that has no fixture directory", () => {
    expect(missingFixtures([rule("CMP-1a"), rule("CMP-1c")], dir)).toEqual(["CMP-1c"]);
  });

  it("names a rule whose fixture directory has no failing site", () => {
    expect(missingFixtures([rule("CMP-1a"), rule("CMP-1b")], dir)).toEqual(["CMP-1b"]);
  });

  it("does not name an exempt rule", () => {
    expect(missingFixtures([rule("CMP-1c")], dir, ["CMP-1c"])).toEqual([]);
  });

  it("finds no lint rule in the base without a fixture pair", () => {
    const { rules } = loadRules(BASE);
    expect(missingFixtures(rules, FIXTURES, NO_FIXTURE_YET)).toEqual([]);
  });
});
