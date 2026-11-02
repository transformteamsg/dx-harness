import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { shardSpecs } from "../plugins/dx-harness/design-lint/vitest.projects";

/* The design-lint tests run in their own job, only when a file they read
   changes, and a gate job reports for the whole run. These act out the path
   filter with path.matchesGlob and run the gate's script with bash; whether
   GitHub skips the job is confirmed on the pull request. See issue #566. */

function readRoot(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

type Step = { name?: string; id?: string; if?: string; "working-directory"?: string; uses?: string; run?: string; with?: Record<string, string>; env?: Record<string, string> };
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
const scripts: Record<string, string> = JSON.parse(readRoot("package.json")).scripts;

/* A step is found by what it runs, not by its name. */
const installsChromium = (run = "") => /playwright(-core)? install(?!-deps)\b[^\n]*\bchromium/.test(run);
const runsDesignLintTests = (run = "") => run.includes("test:design-lint");

/* The globs of the root Vitest config. */
const rootGlobs = [...(readRoot("vitest.config.ts").match(/include:\s*\[([^\]]*)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]);

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
    const runs = runsOf(jobs.checks);
    expect(runs.some((run) => installsChromium(run) || runsDesignLintTests(run) || /^pnpm (run )?test$/m.test(run))).toBe(false);
    expect(rootGlobs.length).toBeGreaterThan(0);
    expect(rootGlobs.some((glob) => path.matchesGlob("plugins/dx-harness/design-lint/test/run.test.ts", glob))).toBe(false);
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
    "plugins/dx-harness/design-lint/src/cli.ts",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    ".github/workflows/ci.yml",
  ])("matches the design-lint filter for %s", (file) => {
    expect(runsDesignLint([file])).toBe(true);
  });
  it("runs the design-lint tests in the design-lint job, after Chromium is installed", () => {
    const runs = runsOf(jobs["design-lint"]);
    const chromium = runs.findIndex((run) => installsChromium(run));
    const tests = runs.findIndex((run) => runsDesignLintTests(run));
    expect(chromium).toBeGreaterThanOrEqual(0);
    expect(tests).toBeGreaterThan(chromium);
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
const cachePaths = (cacheStep?.with?.path ?? "").split("\n").map((p) => p.trim()).filter(Boolean);
const lock: { importers: Record<string, { dependencies: Record<string, { version: string }> }> } = parse(readRoot("pnpm-lock.yaml"));
const lockedPlaywright = lock.importers["plugins/dx-harness/design-lint"].dependencies["playwright-core"].version;

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
  const stepIndex = (test: (run: string) => boolean) => designLintSteps.findIndex((step) => test(step.run ?? ""));
  it("restores the Playwright browser folder after the dependencies and before the Chromium install", () => {
    const cache = designLintSteps.indexOf(cacheStep as Step);
    expect(cachePaths).toContain("~/.cache/ms-playwright");
    expect(cache).toBeGreaterThan(stepIndex((run) => /pnpm install/.test(run)));
    expect(cache).toBeLessThan(stepIndex(installsChromium));
  });
  it("still installs the system packages Chromium needs before the tests", () => {
    const deps = stepIndex((run) => /playwright-core install-deps chromium/.test(run));
    expect(deps).toBeGreaterThanOrEqual(0);
    expect(deps).toBeLessThan(stepIndex(runsDesignLintTests));
  });
});

/* The runner image has the libraries Chromium needs, so install-deps adds only
   fonts. The cache keeps those fonts with the browser, and a cache hit skips
   the step. These read the workflow and run the step's script with a stand-in
   pnpm; the time of a cached run and the browser that starts on it are
   confirmed on the pull request. See issue #575. */
const depsStep = designLintSteps.find((step) => /playwright-core install-deps chromium/.test(step.run ?? ""));

/* Runs the system packages step with a pnpm on PATH that adds a font, as
   install-deps does, and returns the user font folder. */
function runDepsStep() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ci-fonts-"));
  const system = path.join(root, "system");
  const home = path.join(root, "home");
  fs.mkdirSync(path.join(system, "truetype/old"), { recursive: true });
  fs.mkdirSync(home);
  fs.writeFileSync(path.join(system, "truetype/old/old.ttf"), "old");
  const bin = path.join(root, "bin");
  fs.mkdirSync(bin);
  const pnpm = [
    "#!/bin/sh",
    `mkdir -p "${system}/truetype/new"`,
    `printf new > "${system}/truetype/new/new.ttf"`,
    `ln -s "${system}/truetype/new/new.ttf" "${system}/truetype/alias.ttf"`,
  ].join("\n");
  fs.writeFileSync(path.join(bin, "pnpm"), `${pnpm}\n`, { mode: 0o755 });
  const step = spawnSync("bash", ["-e", "-c", depsStep?.run ?? "exit 2"], {
    env: { PATH: `${bin}:${process.env.PATH}`, HOME: home, ...depsStep?.env, SYSTEM_FONTS: system },
    encoding: "utf8",
  });
  expect(step.status, step.stderr).toBe(0);
  return path.join(home, ".local/share/fonts");
}

describe("a run after one that cached Chromium and its packages", () => {
  it("skips the system packages when the cache is restored", () => {
    expect(cacheStep?.id).toBeDefined();
    expect(depsStep?.if?.replace(/\s+/g, " ")).toBe(`steps.${cacheStep?.id}.outputs.cache-hit != 'true'`);
  });
  it("keeps the fonts that install-deps adds in the browser cache", () => {
    expect(cachePaths).toEqual(expect.arrayContaining(["~/.cache/ms-playwright", "~/.local/share/fonts"]));
  });
  it("gives the cache with the fonts a key apart from the cache without them", () => {
    expect(cacheStep?.with?.key).not.toBe("playwright-chromium-${{ runner.os }}-${{ runner.arch }}-${{ steps.playwright.outputs.version }}");
    expect(cacheStep?.with?.key).toContain("fonts");
  });
});

describe("a run that does not restore the cache", () => {
  it("copies the fonts that install-deps adds to the cached font folder", () => {
    const fonts = runDepsStep();
    expect(fs.readFileSync(path.join(fonts, "truetype/new/new.ttf"), "utf8")).toBe("new");
    expect(fs.readFileSync(path.join(fonts, "truetype/alias.ttf"), "utf8")).toBe("new");
  });
  it("copies no font that was there before install-deps", () => {
    const fonts = runDepsStep();
    expect(fs.existsSync(path.join(fonts, "truetype/new/new.ttf"))).toBe(true);
    expect(fs.existsSync(path.join(fonts, "truetype/old/old.ttf"))).toBe(false);
  });
  it("reads the system fonts from the folder the packages install to", () => {
    expect(depsStep?.env?.SYSTEM_FONTS).toBe("/usr/share/fonts");
  });
});

describe("a lockfile with a new playwright-core version", () => {
  it("keys the cache on the playwright-core version in the lockfile", () => {
    expect(versionStep).toBeDefined();
    expect(cacheKeyIn(process.cwd())).toContain(lockedPlaywright);
  });
  it("gives the new version a new cache key", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "ci-cache-"));
    const playwright = path.join(root, "plugins/dx-harness/design-lint/node_modules/playwright-core");
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

/* The design-lint job runs as a matrix of shards, each on a runner of its own,
   and the gate names a shard that fails. These split the spec files that vitest
   list collects with the package's own shard function, and run the gate's
   script with a stand-in gh; the time of each shard is confirmed on the pull
   request. See issue #574. */
type Matrix = { strategy?: { matrix?: { shard?: number[] } } };
const designLintJob: Job & Matrix = jobs["design-lint"] ?? {};
const shards = designLintJob.strategy?.matrix?.shard ?? [];
const designLintDir = path.join(process.cwd(), "plugins/dx-harness/design-lint");

/* The spec files of one unsharded run, as the project name and the file. */
function listSpecs() {
  const list = spawnSync("pnpm", ["exec", "vitest", "list", "--filesOnly", "--json"], { cwd: designLintDir, encoding: "utf8" });
  expect(list.status, list.stderr).toBe(0);
  const specs: { file: string; projectName: string }[] = JSON.parse(list.stdout.slice(list.stdout.indexOf("[")));
  return specs.map((s) => ({ project: s.projectName, file: path.relative(designLintDir, s.file) }));
}

describe("a pull request that changes a file under plugins/dx-harness/design-lint", () => {
  it("runs the design-lint tests as more than one shard", () => {
    expect(shards.length).toBeGreaterThan(1);
    expect(shards).toEqual(shards.map((_, i) => i + 1));
  });
  it("passes each shard its index and the count to vitest", () => {
    const test = runsOf(designLintJob).find((run) => runsDesignLintTests(run)) ?? "";
    const count = test.match(/--shard[= ]\$\{\{\s*matrix\.shard\s*\}\}\/(\d+)/)?.[1];
    expect(Number(count)).toBe(shards.length);
  });
});

describe("the shards together", () => {
  it("run the same spec files as one unsharded run, none twice", () => {
    const whole = listSpecs();
    const key = (s: { project: string; file: string }) => `${s.project} ${s.file}`;
    const sharded = shards.flatMap((shard) => shardSpecs(whole, shard, shards.length));
    expect(whole.length).toBeGreaterThan(shards.length);
    expect(sharded.map(key).sort()).toEqual(whole.map(key).sort());
  }, 120000);
  it("put the projects of the categories on more than one shard", () => {
    const categories = listSpecs().filter((s) => s.project.startsWith("design-lint:"));
    expect(shards.length).toBeGreaterThan(1);
    const used = shards.filter((shard) => shardSpecs(categories, shard, shards.length).length > 0);
    expect(used.length).toBe(shards.length);
  }, 120000);
});

/* Runs the gate's script with a gh on PATH that prints the given job names,
   as gh does for the failed jobs of the run. */
function gateWithJobs(results: string[], failedJobs: string[]) {
  const bin = fs.mkdtempSync(path.join(os.tmpdir(), "ci-gate-"));
  fs.writeFileSync(path.join(bin, "gh"), `#!/bin/sh\nprintf '%s\\n' ${failedJobs.map((j) => `'${j}'`).join(" ")}\n`, { mode: 0o755 });
  return spawnSync("bash", ["-e", "-c", gateStep?.run ?? "exit 2"], {
    env: { PATH: `${bin}:${process.env.PATH}`, RESULTS: results.join(" ") },
    encoding: "utf8",
  });
}

describe("a shard whose tests fail", () => {
  it("makes the gate report failure and name that shard", () => {
    const result = gateWithJobs(["success", "success", "failure"], ["design-lint 2/4"]);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("design-lint 2/4");
  });
});
