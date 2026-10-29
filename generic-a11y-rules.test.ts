import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

/* The generic A11Y controls become base rules in standards/rules/a11y/, and
   redirects.yaml maps each control to every rule that replaces it. See issue #544. */

const ROOT = process.cwd();
const RULES = path.join(ROOT, "plugins/dx-harness/standards/rules");
const A11Y = path.join(RULES, "a11y");

interface Rule {
  code: string;
  control?: string;
  check?: string;
  judgedRemainder?: string | string[];
  file: string;
}

function frontmatter(file: string): Record<string, unknown> {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(fs.readFileSync(file, "utf8"));
  return match ? ((parse(match[1]) as Record<string, unknown> | null) ?? {}) : {};
}

const docs = new Set(["README.md", "MAPPING.md"]);
const ruleFiles = fs.existsSync(RULES)
  ? fs
      .readdirSync(RULES, { recursive: true, encoding: "utf8" })
      .filter((rel) => rel.endsWith(".md") && !docs.has(path.basename(rel)))
  : [];
const rules: Rule[] = ruleFiles.map((rel) => ({ ...(frontmatter(path.join(RULES, rel)) as Omit<Rule, "file">), file: rel }));
const lintCodes = new Set(rules.map((r) => r.code));

/* A judged rule has no file. Its MAPPING.md row records it, with the check judged. */
const judgedCodes = new Set(
  fs
    .readdirSync(RULES, { recursive: true, encoding: "utf8" })
    .filter((rel) => path.basename(rel) === "MAPPING.md")
    .flatMap((rel) =>
      [...fs.readFileSync(path.join(RULES, rel), "utf8").matchAll(/`([A-Z][A-Z0-9]+-\d+[a-z])`[^|\n]*\|\s*judged\s*\|/g)].map((m) => m[1]),
    ),
);

const redirectsFile = path.join(RULES, "redirects.yaml");
const redirects = fs.existsSync(redirectsFile)
  ? (parse(fs.readFileSync(redirectsFile, "utf8")) as { codes?: Record<string, string[]> })
  : {};
const codes = redirects.codes ?? {};

/* The generic controls of this issue, and the check of each in catalog.yaml. */
const CONTROLS = { "A11Y-3": "deterministic", "A11Y-5": "deterministic", "A11Y-11": "hybrid" } as const;

describe("1. A11Y-3 becomes rules", () => {
  const own = rules.filter((r) => r.control === "A11Y-3");

  it("has a lint rule in a11y/ with a base code of A11Y-3", () => {
    expect(own.map((r) => r.code)).toContain("A11Y-3a");
    for (const r of own) {
      expect(r.code).toMatch(/^A11Y-3[a-z]$/);
      expect(path.dirname(r.file)).toBe("a11y");
      expect(r.check).toBe("lint");
    }
  });

  it("maps A11Y-3 in redirects.yaml to the DSS rules it ports to and to its own rules", () => {
    expect(codes["A11Y-3"]).toEqual(expect.arrayContaining(["WR-1a", "WP-6c", "WO-16a", ...own.map((r) => r.code)]));
  });
});

describe("4. each listed control has rules", () => {
  it.each(Object.keys(CONTROLS))("maps %s to rules that exist, and to each rule that names it", (control) => {
    const targets = codes[control];
    expect(targets, `no codes entry for ${control}`).toBeDefined();
    expect(targets.filter((c) => !lintCodes.has(c) && !judgedCodes.has(c))).toEqual([]);
    const ofControl = (c: string) => c.replace(/[a-z]$/, "") === control;
    const own = [...rules.filter((r) => r.control === control).map((r) => r.code), ...[...judgedCodes].filter(ofControl)];
    expect(own.length, `no rule names ${control}`).toBeGreaterThan(0);
    expect(targets).toEqual(expect.arrayContaining(own));
  });

  it("gives each a11y rule file the control field, and no dss field", () => {
    const a11y = rules.filter((r) => path.dirname(r.file) === "a11y");
    expect(a11y.length).toBeGreaterThan(0);
    for (const r of a11y) {
      expect(r.control, r.file).toBe(r.code.replace(/[a-z]$/, ""));
      expect("dss" in r, r.file).toBe(false);
    }
  });
});

describe("5. each hybrid control's lint rule names its judged rule", () => {
  const hybrid = Object.entries(CONTROLS).filter(([, check]) => check === "hybrid").map(([control]) => control);

  it.each(hybrid)("gives each lint rule of %s a judgedRemainder that is a judged rule of the control", (control) => {
    const own = rules.filter((r) => r.control === control);
    expect(own.length).toBeGreaterThan(0);
    for (const r of own) {
      const remainder = [r.judgedRemainder ?? []].flat();
      expect(remainder.length, `${r.code} has no judgedRemainder`).toBeGreaterThan(0);
      for (const j of remainder) {
        expect(judgedCodes.has(j), `${r.code} names ${j}, which is not a judged rule`).toBe(true);
        expect(j.replace(/[a-z]$/, "")).toBe(control);
      }
    }
  });
});

describe("6. no rule names a teacher where it means any user", () => {
  it("has no teacher in the a11y folder", () => {
    const files = fs.existsSync(A11Y) ? fs.readdirSync(A11Y).filter((f) => f.endsWith(".md")) : [];
    expect(files.length).toBeGreaterThan(0);
    const named = files.filter((f) => /\bteachers?\b/i.test(fs.readFileSync(path.join(A11Y, f), "utf8")));
    expect(named).toEqual([]);
  });
});
