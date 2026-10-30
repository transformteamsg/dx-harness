import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, expect } from "vitest";
import { loadConfig } from "../src/config.ts";
import { fileForPath } from "../src/project.ts";
import type { Config } from "../src/types.ts";
import { lint } from "../src/lint.ts";
import { applyPatch, patchedConfig, readPatch } from "../src/patch.ts";
import type { Patch } from "../src/patch.ts";
import { launchBrowser } from "../src/rendered.ts";
import type { Browser } from "playwright-core";
import { loadRules } from "../src/rules/load.ts";
import { BASE, compare } from "./helpers.ts";

/* The demo site passes every rule that exists. Each break patch makes one rule
   fail, and the failing site is the passing site with every patch applied. A test
   file that imports this module starts a browser of its own. */

const DEMO = path.resolve(import.meta.dirname, "../demo");
const SITE = path.join(DEMO, "site");
export const { rules } = loadRules(BASE);
export const config: Config = { ...loadConfig(path.join(DEMO, "design-lint.config.json")), serve: undefined };
export const patches = fs
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
export const browser = shared !== null || Boolean(process.env.CI);
export const needsBrowser = (code: string) => rules.find((r) => r.code === code)?.surface === "rendered";

export function copySite(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-site-"));
  fs.cpSync(SITE, dir, { recursive: true });
  return dir;
}

export const run = (site: string, select: string[], over: Config = config) =>
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

/* The codes of the rules in one category folder, such as bd. */
export function categoryCodes(category: string): string[] {
  throw new Error(`categoryCodes(${category}) is not implemented`);
}

/* The whole-site test of one category: every rule of the category passes on
   every page of the site. The message names the category and each failing rule. */
export async function checkSite(category: string, site: string = copySite()): Promise<void> {
  throw new Error(`checkSite(${category}, ${site}) is not implemented`);
}

export const everyCode = patches.map((p) => p.code);

/* A patch edits one or two files. Its test runs the rules of the same DSS control
   (WP-6a, WP-6b, and WP-6c for a patch of WP-6b), and any rule that its
   expectations name, on the pages that the edited files make, and the first page.
   It expects exactly the findings of the patch, so a patch that breaks a second
   rule of its control shows up. A patch that breaks a rule of another control or
   category does not show up here: running every rule on every patch took over 20
   minutes and overloaded the machine, and running a whole category timed out for
   the large ones. The
   other pages already pass, and the tests of the failing site run every rule on
   every page once, with and without every patch. This keeps the time of a patch
   test at a few seconds, however many pages and rules the site has. An edit to a
   file that is not a page, such as a stylesheet, can change any page, so it keeps
   every page. */
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

/* Runs the test of one break patch: the patched site makes exactly the findings
   that the patch expects. The message names the patch and the findings, because
   the tests of many patches run side by side. */
export async function checkPatch(patch: Patch): Promise<void> {
  const site = copySite();
  const changed = applyPatch(site, patch);
  const result = await run(site, codesOf(patch), patchedConfig(scoped(changed, site), patch));
  const { missing, extra } = compare(result.findings, site, rules, patch.expect, patch.code);
  expect({ missing, extra }, `${patch.code}: missing ${JSON.stringify(missing)}, extra ${JSON.stringify(extra)}`).toEqual({ missing: [], extra: [] });
}
