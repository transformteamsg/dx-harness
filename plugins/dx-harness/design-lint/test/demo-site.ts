import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, expect } from "vitest";
import { loadConfig } from "../src/config.ts";
import { fileForPath } from "../src/project.ts";
import type { Config, Finding } from "../src/types.ts";
import { lint } from "../src/lint.ts";
import { applyPatch, patchedConfig, readPatch } from "../src/patch.ts";
import type { Patch } from "../src/patch.ts";
import { launchBrowser } from "../src/rendered.ts";
import type { Browser } from "playwright-core";
import { loadRules } from "../src/rules/load.ts";
import { BASE, compare } from "./helpers.ts";
import type { Expected } from "./helpers.ts";

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

/* The codes of the rules in one category folder, such as bd, that have a break
   patch. The folder of the rule file decides, so a new folder needs no change here. */
export function categoryCodes(category: string): string[] {
  const inFolder = new Set(rules.filter((r) => path.basename(path.dirname(r.file)) === category).map((r) => r.code));
  return everyCode.filter((c) => inFolder.has(c));
}

/* The whole-site test of one category: every rule of the category passes on
   every page of the site. The message names the category and each failing rule. */
export async function checkSite(category: string, site: string = copySite()): Promise<void> {
  const result = await run(site, categoryCodes(category));
  const failing = [...new Set([...result.findings, ...result.notes].map((f) => f.code))];
  expect({ findings: result.findings, notes: result.notes }, `${category}: rules that fail on the demo site: ${failing.join(", ")}`).toEqual({
    findings: [],
    notes: [],
  });
}

export const everyCode = patches.map((p) => p.code);

/* A patch edits one or two files. Its test runs the rules of the same DSS control
   (WP-6a, WP-6b, and WP-6c for a patch of WP-6b), and any rule that its
   expectations name, on the pages that the edited files make, and the first page.
   It expects exactly the findings of the patch, so a patch that breaks a second
   rule of its control shows up. A second run checks the source and project rules
   of the other controls on the whole site, which cost little, so a patch that
   breaks one of them shows up too (#517). It leaves out the rendered rules of the
   other controls: running every rule on every page for each patch took over 20
   minutes and overloaded the machine. The other pages already pass, and the tests of the failing site run
   every rule on every page once, with and without every patch. This keeps the time
   of a patch test at a few seconds, however many pages and rules the site has. An
   edit to a file that is not a page, such as a stylesheet, can change any page, so
   it keeps every page. */
/* WP-6b belongs to the control WP-6. */
const control = (code: string) => code.replace(/[a-z]$/, "");
const codesOf = (patch: Patch) => [
  ...new Set([
    ...everyCode.filter((c) => control(c) === control(patch.code)),
    ...patch.expect.map((e) => e.code ?? patch.code),
  ]),
];

/* The findings of other controls that a patch makes today. Each is a break that
   the patch is not meant to make, and the patch stays as it is until it is fixed.
   A known finding that no longer appears fails the test, so remove it from here
   when the patch is fixed. */
const KNOWN_OTHER_CONTROLS: Record<string, Expected[]> = {
  "BD-2a": [{ file: ".", line: 1, column: 1, code: "WO-11b" }],
  "COL-3a": [
    { file: "slp/index.html", line: 26, column: 5, code: "BD-6b" },
    { file: "slp/index.html", line: 26, column: 5, code: "BD-6b" },
  ],
  "COL-4a": [
    { file: "slp/index.html", line: 27, column: 5, code: "BD-6b" },
    { file: "slp/index.html", line: 27, column: 5, code: "BD-6b" },
  ],
  "MOT-4a": [{ file: "slp/index.html", line: 31, column: 43, code: "MOT-1a" }],
  "TL-2a": [{ file: "tl/privacy.html", line: 22, column: 42, code: "WU-8a" }],
  "TYP-2a": [{ file: "typ/typ.css", line: 3, column: 13, code: "WP-14b" }],
  "WO-7a": [{ file: "wo/list.html", line: 1, column: 1, code: "WU-7a" }],
  "WP-10b": [
    { file: "wp-b/Contact.tsx", line: 5, column: 5, code: "TX-6a" },
    { file: "wp-b/Contact.tsx", line: 5, column: 5, code: "WU-14b" },
  ],
  "WR-1a": [{ file: "wp-a/structure.html", line: 45, column: 7, code: "WU-8a" }],
};

/* The findings of the rules of the other controls that run on the source and the
   project, on the whole site. */
async function otherControls(patch: Patch, site: string): Promise<Finding[]> {
  const own = new Set(codesOf(patch));
  const codes = everyCode.filter((code) => !own.has(code) && rules.find((r) => r.code === code)?.surface !== "rendered");
  return (await run(site, codes, patchedConfig(config, patch))).findings;
}

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
  const own = await run(site, codesOf(patch), patchedConfig(scoped(changed, site), patch));
  const findings = [...own.findings, ...(await otherControls(patch, site))];
  const expected = [...patch.expect, ...(KNOWN_OTHER_CONTROLS[patch.code] ?? [])];
  const { missing, extra } = compare(findings, site, rules, expected, patch.code);
  expect({ missing, extra }, `${patch.code}: missing ${JSON.stringify(missing)}, extra ${JSON.stringify(extra)}`).toEqual({ missing: [], extra: [] });
}
