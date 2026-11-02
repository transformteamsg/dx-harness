import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, expect } from "vitest";
import { loadConfig, resolveParameters } from "../src/config.ts";
import { collectFiles, isHtml } from "../src/files.ts";
import { elements } from "../src/html.ts";
import { fileForPath } from "../src/project.ts";
import type { Config, Finding, RuleMeta } from "../src/types.ts";
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
   rule of its control shows up. A second run checks the rules of the other
   controls, so a patch that breaks one of them shows up too (#517). Running every
   rule on every page for each patch took over 20 minutes and overloaded the
   machine, so the second run takes every source and project rule, which cost
   little, and only the rendered rules that read a page that the patch changes, on
   those pages. The other pages already pass, and the tests of the failing site run
   every rule on every page once, with and without every patch. This keeps the time
   of a patch test at a few seconds, however many pages and rules the site has. An
   edit to a file that is not a page, such as a stylesheet, can change any page, so
   the first run keeps every page. */
/* WP-6b belongs to the control WP-6. */
const control = (code: string) => code.replace(/[a-z]$/, "");
const codesOf = (patch: Patch) => [
  ...new Set([
    ...everyCode.filter((c) => control(c) === control(patch.code)),
    ...patch.expect.map((e) => e.code ?? patch.code),
  ]),
];

/* The files that a page or a stylesheet loads when it renders: a stylesheet, a
   script, an image, or a frame. A link to another page is not a load. */
function loads(site: string, file: string): string[] {
  const text = fs.readFileSync(file, "utf8");
  const refs = /\.css$/i.test(file)
    ? [...text.matchAll(/url\(\s*["']?([^"')]+)|@import\s+["']([^"']+)/g)].map((m) => m[1] ?? m[2])
    : elements(text).flatMap((el) => [el.attrs.src, el.tag === "link" ? el.attrs.href : undefined]);
  return refs
    .filter((ref): ref is string => ref !== undefined && !/^[a-z][a-z0-9+.-]*:|^\/\/|^#/i.test(ref))
    .map((ref) => fileForPath(ref.startsWith("/") ? site : path.dirname(file), ref))
    .filter((f): f is string => f !== null);
}

/* The pages that a patch changes, as absolute paths: a page that it edits, and a
   page that loads an edited file, directly or through a stylesheet. */
function changedPages(site: string, changed: string[]): Set<string> {
  const edited = new Set(changed.map((f) => path.join(site, f)));
  const reaches = (file: string, seen: Set<string>): boolean => {
    if (seen.has(file)) return false;
    seen.add(file);
    return loads(site, file).some((f) => edited.has(f) || (/\.css$/i.test(f) && reaches(f, seen)));
  };
  return new Set(collectFiles([site]).filter((p) => isHtml(p) && (edited.has(p) || reaches(p, new Set()))));
}

/* Every string in a parameter value, so that a page path in a list or an object is found. */
const strings = (v: unknown): string[] =>
  typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(strings) : v !== null && typeof v === "object" ? Object.values(v).flatMap(strings) : [];

/* A rendered finding names a page path, which is the same in every copy of the site. */
const identity = (f: Finding) => `${f.code} ${f.file} ${f.line}:${f.column} ${f.message}`;

/* The findings of the rendered rules on the unpatched site, with the shorter page
   list. A rule that needs one page of many, such as the page that states the
   hours, can fail when its page is left out, and that finding is not the patch's.
   The patches of a category edit the same few pages, so each list runs once. */
const baselines = new Map<string, Promise<Set<string>>>();
function baseline(codes: string[], over: Config): Promise<Set<string>> {
  const key = JSON.stringify(over.pages?.all);
  let found = baselines.get(key);
  if (!found) {
    found = run(copySite(), codes, over).then((r) => new Set(r.findings.map(identity)));
    baselines.set(key, found);
  }
  return found;
}

/* The findings of the rules of the other controls. The source and project rules
   all run, on the whole site. A rendered rule runs when a page that it reads is a
   changed page, on the first page and the changed pages only, and a finding that
   the unpatched site also makes with those pages is left out. */
async function otherControls(patch: Patch, site: string, changed: string[]): Promise<Finding[]> {
  const own = new Set(codesOf(patch));
  const pages = changedPages(site, changed);
  const full = patchedConfig(config, patch);
  const reads = (rule: RuleMeta) =>
    strings(resolveParameters(rule, full).values).some((s) => {
      const file = s.startsWith("/") ? fileForPath(site, s) : null;
      return file !== null && pages.has(file);
    });
  const lintRules = everyCode.map((code) => rules.find((r) => r.code === code)!);
  const sourceAndProject = lintRules.filter((r) => r.surface !== "rendered" && !own.has(r.code)).map((r) => r.code);
  const findings = (await run(site, sourceAndProject, full)).findings;
  if (pages.size === 0) return findings;
  const all = (config.pages?.all ?? []).filter((p, i) => {
    const file = fileForPath(site, p);
    return i === 0 || (file !== null && pages.has(file));
  });
  const short = { ...config, pages: { ...config.pages, all } };
  /* Every rendered rule that reads a changed page, own control too, so that the
     patches that edit the same pages share one baseline. */
  const rendered = lintRules.filter((r) => r.surface === "rendered" && reads(r)).map((r) => r.code);
  const before = await baseline(rendered, short);
  const after = await run(site, rendered.filter((c) => !own.has(c)), patchedConfig(short, patch));
  return [...findings, ...after.findings.filter((f) => !before.has(identity(f)))];
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
  const findings = [...own.findings, ...(await otherControls(patch, site, changed))];
  const { missing, extra } = compare(findings, site, rules, patch.expect, patch.code);
  expect({ missing, extra }, `${patch.code}: missing ${JSON.stringify(missing)}, extra ${JSON.stringify(extra)}`).toEqual({ missing: [], extra: [] });
}
