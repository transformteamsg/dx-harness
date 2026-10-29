import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { loadConfig, mergeConfig } from "../src/config.ts";
import { lint } from "../src/lint.ts";
import { loadRules } from "../src/rules/load.ts";
import { launchBrowser } from "../src/rendered.ts";
import type { Browser } from "playwright-core";
import { BASE, compare, withoutFixtures } from "./helpers.ts";
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

/* A hidden entry, such as a folder that an editor makes, is not a fixture. */
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

/* The loop above walks the fixture directories, so a rule with no directory
   would not show up there. This walks the rules. WP-15a needs text recognition
   in an image, and no engine for it is installed, so it has no module and no
   fixture. */
const NO_FIXTURE = ["WP-15a"];

describe("every lint rule", () => {
  it("has a fixture pair", () => {
    expect(withoutFixtures(rules.map((r) => r.code), FIXTURES, NO_FIXTURE)).toEqual([]);
  });

  it("names a new rule that has no fixture pair", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-fixtures-"));
    for (const site of ["pass", "fail"]) fs.mkdirSync(path.join(dir, "BD-1a", site), { recursive: true });
    fs.writeFileSync(path.join(dir, "BD-1a", "expected.json"), "[]\n");
    fs.mkdirSync(path.join(dir, "BD-1b", "pass"), { recursive: true });
    expect(withoutFixtures(["BD-1a", "BD-1b", "BD-1d"], dir, [])).toEqual(["BD-1b", "BD-1d"]);
  });

  it("leaves out only rules that still have no fixture pair", () => {
    const listed = rules.filter((r) => NO_FIXTURE.includes(r.code)).map((r) => r.code);
    expect(withoutFixtures(listed, FIXTURES, [])).toEqual(NO_FIXTURE);
  });
});
