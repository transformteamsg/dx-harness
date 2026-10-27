import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.ts";
import { fileForPath } from "../src/project.ts";
import type { Config } from "../src/types.ts";
import { lint } from "../src/lint.ts";
import { applyPatch, patchedConfig, readPatch } from "../src/patch.ts";
import type { Patch } from "../src/patch.ts";
import { launchBrowser } from "../src/rendered.ts";
import type { Browser } from "playwright-core";
import { modules } from "../src/registry.ts";
import { loadRules } from "../src/rules/load.ts";
import { BASE, compare } from "./helpers.ts";

/* The demo site passes every rule that exists. Each break patch makes one rule
   fail, and the failing site is the passing site with every patch applied. */

const DEMO = path.resolve(import.meta.dirname, "../demo");
const SITE = path.join(DEMO, "site");
const { rules } = loadRules(BASE);
const config: Config = { ...loadConfig(path.join(DEMO, "design-lint.config.json")), serve: undefined };
const patches = fs
  .readdirSync(path.join(DEMO, "patches"))
  .sort()
  .map((f) => readPatch(path.join(DEMO, "patches", f)));
/* A missing browser skips the rendered tests on a developer machine, and fails them in CI, where a skip would hide a gap. */
let shared: Browser | null = null;
try {
  shared = await launchBrowser();
} catch {
  shared = null;
}
afterAll(async () => {
  await shared?.close();
});
const browser = shared !== null || Boolean(process.env.CI);
const needsBrowser = (code: string) => rules.find((r) => r.code === code)?.surface === "rendered";

function copySite(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-site-"));
  fs.cpSync(SITE, dir, { recursive: true });
  return dir;
}

const run = (site: string, select: string[], over: Config = config) =>
  lint({
    rules,
    config: over,
    configDir: DEMO,
    paths: [site],
    surfaces: ["source", "project", "rendered"],
    select,
    ignore: [],
    ci: false,
    browser: shared ?? undefined,
  });

const everyCode = patches.map((p) => p.code);

/* A patch edits one or two files. Its test runs the rules of the same DSS control
   (WP-6a, WP-6b, and WP-6c for a patch of WP-6b), and any rule that its
   expectations name, on the pages that the edited files make, and the first page.
   It expects exactly the findings of the patch, so a patch that breaks a second
   rule of its control shows up. A patch that breaks a rule of another control or
   category does not show up here: running every rule on every patch took over 20
   minutes and overloaded the machine, and running a whole category timed out for
   the large ones. The
   other pages already pass, and the tests below run every rule on every page once,
   with and without every patch. This keeps the time of a patch test at a few
   seconds, however many pages and rules the site has. An edit to a file that is
   not a page, such as a stylesheet, can change any page, so it keeps every page. */
/* WP-6b belongs to the control WP-6. */
const control = (code: string) => code.replace(/[a-z]$/, "");
const codesOf = (patch: Patch) => [
  ...new Set([
    ...everyCode.filter((c) => control(c) === control(patch.code)),
    ...patch.expect.map((e) => e.code ?? patch.code),
  ]),
];

function scoped(changed: string[], site: string): Config {
  /* No page changed, as when a patch sets a config value, or a file that is not a page changed. */
  if (changed.length === 0 || !changed.every((f) => /\.html?$/i.test(f))) return config;
  const edited = new Set(changed.map((f) => path.join(site, f)));
  const pages = config.pages?.all ?? [];
  /* The first page is the reference for a rule that compares pages, such as the
     position of the search form or the wording of the navigation. */
  const all = pages.filter((p, i) => {
    const file = fileForPath(site, p);
    return i === 0 || (file !== null && edited.has(file));
  });
  return { ...config, pages: { ...config.pages, all } };
}

describe("the demo site", () => {
  it.skipIf(!browser)("passes every rule that exists", async () => {
    const result = await run(copySite(), everyCode);
    expect(result.findings).toEqual([]);
    expect(result.notes).toEqual([]);
  });

  it("has a break patch for each rule that has a module", () => {
    const withModule = modules.map((m) => m.code).sort();
    expect([...everyCode].sort()).toEqual(withModule);
  });
});

/* The patches run side by side. Each works on its own copy of the site. */
describe.concurrent("a break patch", () => {
  for (const patch of patches) {
    it.skipIf(needsBrowser(patch.code) && !browser)(`${patch.code} makes exactly that rule fail: ${patch.describe}`, async () => {
      const site = copySite();
      const changed = applyPatch(site, patch);
      const result = await run(site, codesOf(patch), patchedConfig(scoped(changed, site), patch));
      expect(compare(result.findings, site, rules, patch.expect, patch.code)).toEqual({ missing: [], extra: [] });
    });
  }

  it("fails when the text to replace is not found exactly once", () => {
    const site = copySite();
    const bad = { ...patches[0], edits: [{ file: "index.html", find: "this text is not on the page", replace: "" }] };
    expect(() => applyPatch(site, bad)).toThrow(/has 0 matches/);
  });
});

describe("the failing site", () => {
  /* Patches that edit the same file change each other's results, so the failing
     site holds only the patches that share no file with another patch. An
     exclusive patch is left out too. BD-2a removes the search form that other rules
     need. WU-5a makes a page submit when a field gets focus, and other rules focus
     every field. */
  const changedBy = new Map<string, Set<string>>();
  for (const patch of patches) changedBy.set(patch.code, new Set(applyPatch(copySite(), patch)));
  const together = patches.filter((patch) => {
    if (patch.exclusive) return false;
    return patches.every((other) => other === patch || other.exclusive || [...changedBy.get(patch.code)!].every((f) => !changedBy.get(other.code)!.has(f)));
  });

  /* Most patches share a file with another one: a page that several rules need, or a
     stylesheet. The failing site holds the rest, and it must not be empty. */
  it("holds some patches", () => {
    expect(together.length).toBeGreaterThan(0);
  });

  it.skipIf(!browser)("is the passing site with those patches applied, and every expected finding is there", async () => {
    const site = copySite();
    for (const patch of together) applyPatch(site, patch);
    const merged = together.reduce<Config>((c, p) => patchedConfig(c, p), config);
    const result = await run(site, everyCode, merged);
    /* The file and the rule only: the patches shift each other's lines, and the
       single-patch tests above check the positions and the extra findings. */
    const wanted = together.flatMap((p) => p.expect.map((e) => ({ file: e.file, code: e.code ?? p.code })));
    expect(compare(result.findings, site, rules, wanted).missing).toEqual([]);
  });

  it("leaves out only the patches that are marked exclusive", () => {
    /* The patches that may be exclusive, in the categories that exist so far. */
    const known = ["BD-2a", "WU-5a"].filter((code) => patches.some((p) => p.code === code));
    expect(patches.filter((p) => p.exclusive).map((p) => p.code)).toEqual(known);
  });
});
