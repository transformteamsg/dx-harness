import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import type { Browser } from "playwright-core";
import { loadConfig } from "../src/config.ts";
import { lint } from "../src/lint.ts";
import { applyPatch, readPatch } from "../src/patch.ts";
import { launchBrowser } from "../src/rendered.ts";
import { loadRules } from "../src/rules/load.ts";
import { BASE, compare } from "./helpers.ts";
import type { Expected } from "./helpers.ts";

/* PR-6b runs only in CI, and the shared fixture and patch tests run with ci off,
   so they skip it. This file runs the same fixtures and the demo patch with ci on.
   The fixture config sets engines to chromium, which is always installed where
   the rendered tests run. */

const { rules } = loadRules(BASE);
let browser: Browser | null = null;
try {
  browser = await launchBrowser();
} catch {
  browser = null;
}
afterAll(async () => {
  await browser?.close();
}, 60000);

const PACKAGE = path.resolve(import.meta.dirname, "..");
const FIXTURE = path.resolve(import.meta.dirname, "../fixtures/PR-6b");
const DEMO = path.resolve(import.meta.dirname, "../demo");

const run = (dir: string, configFile: string, configDir: string, ci: boolean) =>
  lint({
    rules,
    config: { ...loadConfig(configFile), serve: undefined },
    configDir,
    paths: [dir],
    surfaces: ["source", "project", "rendered"],
    select: ["PR-6b"],
    ignore: [],
    ci,
    browser: browser ?? undefined,
  });

describe.skipIf(!browser)("PR-6b with ci on", () => {
  const config = path.join(FIXTURE, "config.json");
  it("passes the passing site", async () => {
    const result = await run(path.join(FIXTURE, "pass"), config, FIXTURE, true);
    expect(result.ran).toEqual(["PR-6b"]);
    expect(result.findings).toEqual([]);
    expect(result.notes).toEqual([]);
  });

  it("fails the failing site with one finding for each smoke check", async () => {
    const expected = JSON.parse(fs.readFileSync(path.join(FIXTURE, "expected-ci.json"), "utf8")) as Expected[];
    const result = await run(path.join(FIXTURE, "fail"), config, FIXTURE, true);
    expect(compare(result.findings, path.join(FIXTURE, "fail"), rules, expected, "PR-6b")).toEqual({ missing: [], extra: [] });
    const messages = result.findings.map((f) => f.message).join("\n");
    expect(messages).toMatch(/In chromium, loads-without-errors fails/);
    expect(messages).toMatch(/no-horizontal-scroll fails: the page scrolls sideways at 320 px/);
    expect(messages).toMatch(/axe-critical fails: critical axe violations: image-alt/);
  });

  it("skips the rule when ci is off", async () => {
    const result = await run(path.join(FIXTURE, "fail"), config, FIXTURE, false);
    expect(result.ran).toEqual([]);
  });

  it("fails the demo site with the demo patch", async () => {
    const site = fs.mkdtempSync(path.join(os.tmpdir(), "pr6b-site-"));
    fs.cpSync(path.join(DEMO, "site"), site, { recursive: true });
    const demoConfig = path.join(DEMO, "design-lint.config.json");
    expect((await run(site, demoConfig, DEMO, true)).findings).toEqual([]);
    applyPatch(site, readPatch(path.join(DEMO, "patches/PR-6b.json")));
    const result = await run(site, demoConfig, DEMO, true);
    expect(result.findings.map((f) => [f.code, f.file])).toEqual([["PR-6b", "/pr/performance.html"]]);
  });

  /* An engine that does not start. The config lists firefox before chromium, and
     DESIGN_LINT_FIREFOX names an executable that does not exist. PR-6b is tier L2,
     so its findings warn, but an engine that did not run must not pass. See issue #520. */
  describe("with an engine that does not start", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pr6b-engine-"));
    const fixtureConfig = JSON.parse(fs.readFileSync(path.join(FIXTURE, "config.json"), "utf8"));
    fixtureConfig.rules["PR-6b"].engines = ["firefox", "chromium"];
    const config = path.join(dir, "design-lint.config.json");
    fs.writeFileSync(config, JSON.stringify(fixtureConfig));
    const missing = path.join(dir, "no-such-firefox");
    const cli = (site: string) =>
      spawnSync(process.execPath, ["src/cli.ts", path.join(FIXTURE, site), "--rendered", "--ci", "--select", "PR-6b", "--config", config], {
        cwd: PACKAGE,
        encoding: "utf8",
        env: { ...process.env, DESIGN_LINT_FIREFOX: missing },
      });

    it("reports the engine as not run and does not pass", () => {
      const run = cli("pass");
      expect(run.stderr).toBe("");
      expect(run.stdout).toMatch(/Not run: the engine firefox did not start/);
      expect(run.stdout).not.toMatch(/In chromium/);
      expect(run.status).toBe(1);
    });

    it("still reports the findings of the engines that start", () => {
      const run = cli("fail");
      expect(run.stdout).toMatch(/Not run: the engine firefox did not start/);
      expect(run.stdout).toMatch(/In chromium, loads-without-errors fails/);
      expect(run.stdout).toMatch(/In chromium, no-horizontal-scroll fails: the page scrolls sideways at 320 px/);
      expect(run.stdout).toMatch(/In chromium, axe-critical fails: critical axe violations: image-alt/);
    });
  });
});
