import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

/* The design-lint tests run in their own job, only when a file they read
   changes, and a gate job reports for the whole run. These act out the path
   filter with path.matchesGlob and run the gate's script with bash; whether
   GitHub skips the job is confirmed on the pull request. See issue #566. */

function readRoot(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

type Step = { name?: string; id?: string; "working-directory"?: string; uses?: string; run?: string; with?: Record<string, string>; env?: Record<string, string> };
type Job = { if?: string; needs?: string[]; outputs?: Record<string, string>; steps?: Step[] };
const ci: { jobs?: Record<string, Job> } = parse(readRoot(".github/workflows/ci.yml"));
const jobs = ci.jobs ?? {};

const filterStep = jobs.changes?.steps?.find((step) => step.uses?.startsWith("dorny/paths-filter"));
const filters: Record<string, string[]> = parse(filterStep?.with?.filters ?? "") ?? {};
const designLintGlobs = filters["design-lint"] ?? [];

/* paths-filter sets the output when any changed file matches any glob. */
const runsDesignLint = (files: string[]) => files.some((file) => designLintGlobs.some((glob) => path.matchesGlob(file, glob)));

const gateStep = jobs.gate?.steps?.find((step) => step.env?.RESULTS !== undefined);
const gate = (results: string[]) =>
  spawnSync("bash", ["-e", "-c", gateStep?.run ?? "exit 2"], { env: { PATH: process.env.PATH, RESULTS: results.join(" ") }, encoding: "utf8" });

const runsOf = (job: Job | undefined) => (job?.steps ?? []).map((step) => step.run ?? "");
const rootVitest = readRoot("vitest.config.ts");
const scripts: Record<string, string> = JSON.parse(readRoot("package.json")).scripts;

describe("a pull request that changes only a SKILL.md", () => {
  it("does not match the design-lint filter", () => {
    expect(designLintGlobs.length).toBeGreaterThan(0);
    expect(runsDesignLint(["plugins/dx-harness/skills/engineering/dx-create-pr/SKILL.md"])).toBe(false);
  });
  it("leaves the design-lint job to run only on the filter output", () => {
    expect(jobs["design-lint"]?.needs).toContain("changes");
    expect(jobs["design-lint"]?.if).toContain("needs.changes.outputs.design-lint == 'true'");
  });
  it("runs no design-lint test and installs no Chromium in the checks job", () => {
    expect(runsOf(jobs.checks).join("\n")).not.toMatch(/playwright|chromium|test:design-lint|^pnpm test$/m);
    expect(rootVitest).not.toContain("packages/design-lint");
  });
  it("lets the gate report success when the design-lint job is skipped", () => {
    expect(jobs.gate?.if).toBe("always()");
    expect(jobs.gate?.needs).toEqual(expect.arrayContaining(["changes", "checks", "design-lint"]));
    expect(gate(["success", "success", "skipped"]).status).toBe(0);
  });
});

describe("a pull request that changes a rule", () => {
  it.each([
    "plugins/dx-harness/standards/rules/typ/TYP-1a.md",
    "packages/design-lint/src/cli.ts",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    ".github/workflows/ci.yml",
  ])("matches the design-lint filter for %s", (file) => {
    expect(runsDesignLint([file])).toBe(true);
  });
  it("runs the design-lint tests in the design-lint job, after Chromium is installed", () => {
    const runs = runsOf(jobs["design-lint"]);
    const chromium = runs.findIndex((run) => /playwright-core install( --with-deps)? chromium/.test(run));
    const tests = runs.findIndex((run) => run.includes("pnpm run test:design-lint"));
    expect(chromium).toBeGreaterThanOrEqual(0);
    expect(tests).toBeGreaterThan(chromium);
    expect(scripts["test:design-lint"]).toBe("pnpm --filter design-lint test");
  });
  it("keeps pnpm test running the design-lint tests locally", () => {
    expect(scripts.test).toContain("test:design-lint");
  });
});

describe("a pull request whose design-lint tests fail", () => {
  it.each([["failure"], ["cancelled"]])("makes the gate report failure when the job is %s", (result) => {
    expect(gate(["success", "success", result]).status).toBe(1);
  });
  it("makes the gate report failure when the checks job fails", () => {
    expect(gate(["success", "failure", "skipped"]).status).toBe(1);
  });
});

/* The design-lint job caches the Playwright browser folder, keyed on the
   playwright-core version. These run the version step and render the key;
   the time a cache hit saves is confirmed on the pull request. See issue #568. */
const designLintSteps = jobs["design-lint"]?.steps ?? [];
const cacheStep = designLintSteps.find((step) => step.uses?.startsWith("actions/cache"));
const versionStep = designLintSteps.find((step) => step.id !== undefined && cacheStep?.with?.key?.includes(`steps.${step.id}.outputs.`));
const lock: { importers: Record<string, { dependencies: Record<string, { version: string }> }> } = parse(readRoot("pnpm-lock.yaml"));
const lockedPlaywright = lock.importers["packages/design-lint"].dependencies["playwright-core"].version;

/* Runs the version step in a repository root and renders the cache key from
   what it writes to GITHUB_OUTPUT. */
function cacheKeyIn(root: string) {
  const output = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "ci-cache-")), "output");
  fs.writeFileSync(output, "");
  const step = spawnSync("bash", ["-e", "-c", versionStep?.run ?? "exit 2"], {
    cwd: path.join(root, versionStep?.["working-directory"] ?? "."),
    env: { PATH: process.env.PATH, GITHUB_OUTPUT: output },
    encoding: "utf8",
  });
  expect(step.status, step.stderr).toBe(0);
  const outputs = Object.fromEntries(fs.readFileSync(output, "utf8").trim().split("\n").map((line) => line.split("=", 2)));
  return (cacheStep?.with?.key ?? "").replace(/\$\{\{\s*steps\.[\w-]+\.outputs\.([\w-]+)\s*\}\}/g, (_, name: string) => outputs[name] ?? "");
}

describe("a run after one that cached Chromium", () => {
  const stepIndex = (name: string) => designLintSteps.findIndex((step) => step.name === name);
  it("restores the Playwright browser folder before Install Chromium", () => {
    expect(cacheStep?.with?.path).toBe("~/.cache/ms-playwright");
    expect(designLintSteps.indexOf(cacheStep as Step)).toBeGreaterThan(stepIndex("Install dependencies"));
    expect(designLintSteps.indexOf(cacheStep as Step)).toBeLessThan(stepIndex("Install Chromium"));
  });
  it("installs no system packages in Install Chromium, so a restored browser needs no download", () => {
    const install = designLintSteps[stepIndex("Install Chromium")]?.run ?? "";
    expect(install).toMatch(/playwright-core install chromium/);
    expect(install).not.toContain("--with-deps");
  });
  it("still installs the system packages Chromium needs before the tests", () => {
    const runs = runsOf(jobs["design-lint"]);
    const deps = runs.findIndex((run) => /playwright-core install-deps chromium/.test(run));
    expect(deps).toBeGreaterThanOrEqual(0);
    expect(deps).toBeLessThan(runs.findIndex((run) => run.includes("pnpm run test:design-lint")));
  });
});

describe("a lockfile with a new playwright-core version", () => {
  it("keys the cache on the playwright-core version in the lockfile", () => {
    expect(versionStep).toBeDefined();
    expect(cacheKeyIn(process.cwd())).toContain(lockedPlaywright);
  });
  it("gives the new version a new cache key", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "ci-cache-"));
    const playwright = path.join(root, "packages/design-lint/node_modules/playwright-core");
    fs.mkdirSync(playwright, { recursive: true });
    fs.writeFileSync(path.join(playwright, "package.json"), JSON.stringify({ name: "playwright-core", version: "9.9.9" }));
    const newKey = cacheKeyIn(root);
    expect(newKey).toContain("9.9.9");
    expect(newKey).not.toBe(cacheKeyIn(process.cwd()));
  });
});

describe("a push to main", () => {
  it("runs the design-lint job whatever the filter reports", () => {
    expect(jobs["design-lint"]?.if).toContain("github.event_name == 'push'");
  });
});
