import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { loadConfig, mergeConfig } from "../src/config.ts";
import { lint } from "../src/lint.ts";
import { loadRules } from "../src/rules/load.ts";
import { launchBrowser } from "../src/rendered.ts";
import { modules } from "../src/registry.ts";
import type { Browser } from "playwright-core";
import { BASE, compare } from "./helpers.ts";
import type { Expected } from "./helpers.ts";

/* Each directory under fixtures/ holds a site that passes one rule, a site that
   fails it, and the findings that the failing site must produce. */

const FIXTURES = path.resolve(import.meta.dirname, "../fixtures");
const { rules } = loadRules(BASE);
let shared: Browser | null = null;
try {
  shared = await launchBrowser();
} catch {
  shared = null;
}
afterAll(async () => {
  await shared?.close();
});
const browser = shared !== null;

/* A lint rule proves itself with a fixture pair (lint/testing.md), and a rule
   file with no pair fails here by name. The one exception is a rule that its
   category README records as not built. WP-15a needs OCR, and no OCR library
   is installed. */
const UNBUILT = ["WP-15a"];
const unproven = (codes: string[]) =>
  codes.filter(
    (code) => !UNBUILT.includes(code) && !["pass", "fail", "expected.json"].every((part) => fs.existsSync(path.join(FIXTURES, code, part))),
  );

describe("every lint rule", () => {
  it("has a fixture pair", () => {
    expect(unproven(rules.map((r) => r.code))).toEqual([]);
  });

  it("is named when it has no fixture pair", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-"));
    fs.mkdirSync(path.join(dir, "mot"));
    fs.writeFileSync(
      path.join(dir, "mot", "a-new-rule.md"),
      "---\ncode: MOT-9a\nslug: a-new-rule\ndss: MOT-9\ntier: L2\ncheck: lint\nsurface: source\nengine: custom\nparameters: {}\n---\n\n# MOT-9a: a new rule\n",
    );
    expect(unproven(loadRules(dir).rules.map((r) => r.code))).toEqual(["MOT-9a"]);
  });

  it("is built when it is not on the unbuilt list", () => {
    expect(UNBUILT.filter((code) => modules.some((m) => m.code === code))).toEqual([]);
  });
});

/* A dot entry, such as a folder that a local tool leaves, is not a fixture. */
for (const code of fs.readdirSync(FIXTURES).filter((name) => !name.startsWith(".")).sort()) {
  const dir = path.join(FIXTURES, code);
  const meta = rules.find((r) => r.code === code);
  const config = loadConfig(path.join(dir, "config.json"));
  const expected = JSON.parse(fs.readFileSync(path.join(dir, "expected.json"), "utf8")) as Expected[];
  /* A missing browser skips the rendered tests on a developer machine, and fails them in CI, where a skip would hide a gap. */
  const skip = meta?.surface === "rendered" && !browser && !process.env.CI;

  /* A rule that reads a value from the config can need a different value for the
     passing site and the failing site: pass.config.json and fail.config.json merge
     over config.json. */
  const configFor = (site: string) => {
    const extra = loadConfig(path.join(dir, `${site}.config.json`));
    return extra ? mergeConfig(config ?? {}, extra) : config;
  };

  const run = (site: string) =>
    lint({
      rules,
      config: configFor(site),
      configDir: dir,
      paths: [path.join(dir, site)],
      surfaces: ["source", "project", "rendered"],
      select: [code],
      ignore: [],
      ci: false,
      browser: shared ?? undefined,
    });

  describe(`${code} fixtures`, () => {
    it("has a rule file", () => {
      expect(meta).toBeDefined();
    });

    it.skipIf(skip)("passes the passing site with no finding and no note", async () => {
      const result = await run("pass");
      expect(result.findings).toEqual([]);
      expect(result.notes).toEqual([]);
    });

    it.skipIf(skip)("fails the failing site with exactly the expected findings", async () => {
      const result = await run("fail");
      expect(compare(result.findings, path.join(dir, "fail"), rules, expected, code)).toEqual({ missing: [], extra: [] });
      expect(result.notes).toEqual([]);
    });
  });
}
