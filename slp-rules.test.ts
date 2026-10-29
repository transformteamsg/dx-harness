import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { modules } from "./packages/design-lint/src/registry.ts";
import { loadRules } from "./packages/design-lint/src/rules/load.ts";
import { BASE, missingFixtures } from "./packages/design-lint/test/helpers.ts";

/* The anti-slop controls SLP-1 to SLP-11 become base rules in the folder of the
   category that each one grades. SLP is not a category (ADR-0001 D10). See issue #550. */

const ROOT = process.cwd();
const FIXTURES = path.join(ROOT, "packages/design-lint/fixtures");
const PATCHES = path.join(ROOT, "packages/design-lint/demo/patches");
const PLUGIN = path.join(ROOT, "plugins/dx-harness");
const RULES = path.join(PLUGIN, "standards/rules");

/* The codes that each control becomes, as the issue settled them. */
const EXPECTED: Record<string, { lint: string[]; judged: string[] }> = {
  "SLP-1": { lint: ["COL-3a"], judged: ["COL-3b"] },
  "SLP-2": { lint: ["COL-4a"], judged: [] },
  "SLP-3": { lint: ["CMP-12a"], judged: [] },
  "SLP-4": { lint: ["CMP-13a"], judged: [] },
  "SLP-5": { lint: [], judged: ["LAY-8a"] },
  "SLP-6": { lint: ["TYP-7a"], judged: ["TYP-7b"] },
  "SLP-7": { lint: [], judged: ["LAY-9a"] },
  "SLP-8": { lint: ["MOT-4a"], judged: [] },
  "SLP-9": { lint: ["CNT-15a"], judged: ["CNT-15b"] },
  "SLP-10": { lint: [], judged: ["CMP-14a"] },
  "SLP-11": { lint: [], judged: ["CMP-15a"] },
};

const catalog = parse(fs.readFileSync(path.join(PLUGIN, "standards/catalog.yaml"), "utf8")) as {
  controls: { id: string; check: string }[];
};
const controls = catalog.controls.filter((c) => c.id.startsWith("SLP-"));

const redirectsFile = path.join(RULES, "redirects.yaml");
const redirects = parse(fs.readFileSync(redirectsFile, "utf8")) as { codes?: Record<string, string[]> };
const codes = redirects.codes ?? {};

/* Each rule file, with its frontmatter. */
const ruleFiles = fs
  .readdirSync(RULES, { recursive: true, encoding: "utf8" })
  .filter((rel) => rel.endsWith(".md") && !["README.md", "MAPPING.md"].includes(path.basename(rel)))
  .map((rel) => {
    const text = fs.readFileSync(path.join(RULES, rel), "utf8");
    const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
    const fm = (match ? parse(match[1]) : {}) as Record<string, unknown>;
    return { rel, text, fm };
  });

const fileFor = (code: string) => ruleFiles.find((f) => f.fm.code === code);
const folderOf = (code: string) => code.split("-")[0].toLowerCase();

/* The table row of a code in the MAPPING.md of its category, or "" when there is none. */
function mappingRow(code: string) {
  const file = path.join(RULES, folderOf(code), "MAPPING.md");
  if (!fs.existsSync(file)) return "";
  return (
    fs
      .readFileSync(file, "utf8")
      .split("\n")
      .find((line) => line.startsWith("|") && line.includes(`\`${code}\``)) ?? ""
  );
}

/* The cells of a table row, without the outer pipes. */
const cells = (row: string) => row.split("|").slice(1, -1).map((c) => c.trim());

describe("1. each control becomes rules, and redirects.yaml maps it to them", () => {
  it("reads the 11 controls from catalog.yaml", () => {
    expect(controls.map((c) => c.id)).toEqual(Object.keys(EXPECTED));
  });

  it.each(Object.keys(EXPECTED))("maps %s to its codes", (id) => {
    const want = [...EXPECTED[id].lint, ...EXPECTED[id].judged].sort();
    expect([...(codes[id] ?? [])].sort()).toEqual(want);
  });

  const lint = Object.entries(EXPECTED).flatMap(([id, e]) => e.lint.map((code) => [code, id]));
  it.each(lint)("gives the lint rule %s a file with check lint and dss %s", (code, id) => {
    const file = fileFor(code);
    expect(file, `no rule file carries ${code}`).toBeDefined();
    expect(file?.fm.check).toBe("lint");
    expect(file?.fm.dss).toBe(id);
    expect(path.dirname(file?.rel ?? "")).toBe(folderOf(code));
  });

  const judged = Object.values(EXPECTED).flatMap((e) => e.judged);
  it.each(judged)("gives the judged rule %s a MAPPING.md row and no file", (code) => {
    const row = mappingRow(code);
    expect(row, `no MAPPING.md row for ${code}`).not.toBe("");
    expect(cells(row)).toContain("judged");
    expect(fileFor(code)).toBeUndefined();
  });

  it.each(lint)("gives the lint rule %s a MAPPING.md row that links its file", (code) => {
    const row = mappingRow(code);
    expect(row, `no MAPPING.md row for ${code}`).not.toBe("");
    expect(row).toContain(`[\`${code}\`](${path.basename(fileFor(code)?.rel ?? "")})`);
    expect(cells(row)).toContain("lint");
  });
});

describe("2. each lint rule proves itself with a fixture pair", () => {
  const lint = Object.values(EXPECTED).flatMap((e) => e.lint);
  const { rules } = loadRules(BASE);

  it.each(lint)("gives %s a pass site, a fail site, and expected.json", (code) => {
    const rule = rules.filter((r) => r.code === code);
    expect(rule, `the linter does not load ${code}`).toHaveLength(1);
    expect(missingFixtures(rule, FIXTURES)).toEqual([]);
  });

  it.each(lint)("registers a module for %s, with a break patch for the demo", (code) => {
    expect(modules.map((m) => m.code)).toContain(code);
    expect(fs.existsSync(path.join(PATCHES, `${code}.json`))).toBe(true);
  });

  it.each(lint)("expects at least one finding from the fail site of %s", (code) => {
    const file = path.join(FIXTURES, code, "expected.json");
    const expected = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as unknown[]) : [];
    expect(expected.length).toBeGreaterThan(0);
  });
});
