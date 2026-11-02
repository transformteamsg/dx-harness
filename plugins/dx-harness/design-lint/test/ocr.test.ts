import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import type { Browser } from "playwright-core";
import { loadConfig } from "../src/config.ts";
import { lint } from "../src/lint.ts";
import { launchBrowser } from "../src/rendered.ts";
import { loadRules } from "../src/rules/load.ts";
import { BASE } from "./helpers.ts";

/* WP-15a runs OCR on the images of a rendered page. The fixture pair checks the
   findings. This file checks what the designer sees from the command, the
   exemption, and a machine where OCR cannot start. See issue #513. */

const PACKAGE = path.resolve(import.meta.dirname, "..");
const FIXTURE = path.resolve(import.meta.dirname, "../fixtures/WP-15a");
const CONFIG = path.join(FIXTURE, "config.json");
const { rules } = loadRules(BASE);

let browser: Browser | null = null;
try {
  browser = await launchBrowser();
} catch {
  browser = null;
}
afterAll(async () => {
  await browser?.close();
});

const cli = (site: string, env: Record<string, string> = {}) =>
  spawnSync(process.execPath, ["src/cli.ts", path.join(FIXTURE, site), "--rendered", "--select", "WP-15a", "--config", CONFIG], {
    cwd: PACKAGE,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });

/* A missing browser skips these on a developer machine, and fails them in CI. */
describe.skipIf(!browser && !process.env.CI)("WP-15a finds images of text", () => {
  it("reports an image of text with the recognised text, as a warning that does not block", () => {
    const run = cli("fail");
    expect(run.stderr).toBe("");
    expect(run.stdout).toMatch(/^\/ img.*: WP-15a \[L2\] .*"Book your appointment today"/m);
    expect(run.stdout).toMatch(/^\/ div\.promo.*: WP-15a \[L2\] .*"Apply for a grant online"/m);
    expect(run.status).toBe(0);
  });

  it("does not report an image that matches exemptSelector", async () => {
    const site = path.join(FIXTURE, "pass");
    const config = loadConfig(CONFIG)!;
    const runWith = (exemptSelector?: string) =>
      lint({
        rules,
        config: exemptSelector === undefined ? config : { ...config, rules: { "WP-15a": { exemptSelector } } },
        configDir: FIXTURE,
        paths: [site],
        surfaces: ["rendered"],
        select: ["WP-15a"],
        ignore: [],
        ci: false,
        browser: browser ?? undefined,
      });
    /* With no exemption, the logo is an image of text, so the exemption is what keeps it out. */
    const open = await runWith("");
    expect(open.findings.map((f) => f.message).join("\n")).toMatch(/Community Grants Office Singapore/);
    const exempt = await runWith();
    expect(exempt.ran).toEqual(["WP-15a"]);
    expect(exempt.findings).toEqual([]);
  });

  /* DESIGN_LINT_OCR_DATA names a directory with no language data, as on a
     machine where the data package did not install. WP-15a is tier L2, but a
     check that did not run must not pass. */
  it("reports that OCR did not run, and why, and does not pass", () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), "wp15a-no-data-"));
    const run = cli("pass", { DESIGN_LINT_OCR_DATA: empty });
    expect(run.stderr).toBe("");
    expect(run.stdout).toMatch(/WP-15a \[L2\] Not run: OCR did not start/);
    expect(run.stdout).toContain("eng");
    expect(run.status).toBe(1);
  });
});
