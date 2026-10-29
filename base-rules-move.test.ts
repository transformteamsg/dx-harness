import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parse } from "yaml";

/* The base rules move from skills/design-restructure/base/ to
   standards/rules/<category>/<slug>.md, under ADR-0002. See issue #536. */

const ROOT = process.cwd();
const PLUGIN = path.join(ROOT, "plugins/dx-harness");
const RULES = path.join(PLUGIN, "standards/rules");
const OLD = path.join(PLUGIN, "skills/design-restructure");
const FIXTURES = path.join(ROOT, "packages/design-lint/fixtures");

/* The code in a rule file's frontmatter, or null when the file has none. */
function codeOf(file: string) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(fs.readFileSync(file, "utf8"));
  const fm = match ? (parse(match[1]) as Record<string, unknown> | null) : null;
  return fm && typeof fm.code === "string" ? fm.code : null;
}

/* The moved files are the DSS rules. The catalogue rules are new, so no old
   file name redirects to them. */
const DSS = ["bd", "wp", "wo", "wu", "wr", "pr", "tx", "tl", "uu"];
const ruleFiles = fs.existsSync(RULES)
  ? fs
      .readdirSync(RULES, { recursive: true, encoding: "utf8" })
      .filter((rel) => rel.endsWith(".md") && !["README.md", "MAPPING.md"].includes(path.basename(rel)))
      .filter((rel) => DSS.includes(rel.split(path.sep)[0]))
  : [];

describe("2. a rule left at the old path fails the gate", () => {
  let work = "";

  beforeAll(() => {
    work = fs.mkdtempSync(path.join(os.tmpdir(), "base-rules-move-"));
    fs.cpSync(PLUGIN, path.join(work, "dx-harness"), { recursive: true });
  });

  afterAll(() => {
    fs.rmSync(work, { recursive: true, force: true });
  });

  it("fails pnpm check and names the file", () => {
    const plugin = path.join(work, "dx-harness");
    const left = path.join(plugin, "skills/design-restructure/base/bd/BD-1a.md");
    fs.mkdirSync(path.dirname(left), { recursive: true });
    fs.writeFileSync(left, "---\ncode: BD-1a\n---\n\n# BD-1a: viewport meta present and zoom allowed\n");
    const run = spawnSync("python3", [path.join(plugin, "checks/design-catalog-validate.py")], {
      cwd: plugin,
      encoding: "utf8",
    });
    const out = `${run.stdout ?? ""}${run.stderr ?? ""}`;
    expect(run.status, out).toBe(1);
    expect(out).toMatch(/ERROR skills\/design-restructure\/base\/bd\/BD-1a\.md: /);
  });

  /* Written after the code: the `codes` map of redirects.yaml came with #545. */
  it("fails pnpm check on a code redirect to a rule that no MAPPING.md lists, and names it", () => {
    const plugin = path.join(work, "dx-harness");
    fs.rmSync(path.join(plugin, "skills"), { recursive: true, force: true });
    fs.cpSync(path.join(PLUGIN, "skills"), path.join(plugin, "skills"), { recursive: true });
    const file = path.join(plugin, "standards/rules/redirects.yaml");
    fs.writeFileSync(file, `${fs.readFileSync(file, "utf8")}  OLD-1: [TYP-99z]\n`);
    const run = spawnSync("python3", [path.join(plugin, "checks/design-catalog-validate.py")], {
      cwd: plugin,
      encoding: "utf8",
    });
    const out = `${run.stdout ?? ""}${run.stderr ?? ""}`;
    expect(run.status, out).toBe(1);
    expect(out).toContain("'OLD-1' redirects to 'TYP-99z', which has no row in standards/rules/typ/MAPPING.md");
  });
});

describe("3. a reference by the old file name resolves through redirects.yaml", () => {
  const file = path.join(RULES, "redirects.yaml");
  const redirects = fs.existsSync(file) ? (parse(fs.readFileSync(file, "utf8")) as { files?: Record<string, string> }) : {};
  const files = redirects.files ?? {};

  it("resolves BD-1a.md to the file that carries the code BD-1a", () => {
    const target = files["BD-1a.md"];
    expect(target, "no redirect for BD-1a.md").toBeDefined();
    expect(fs.existsSync(path.join(RULES, target))).toBe(true);
    expect(codeOf(path.join(RULES, target))).toBe("BD-1a");
  });

  /* The fixtures are keyed by the old file name, so they are a list of old
     names that does not come from redirects.yaml. */
  const fixtureCodes = fs
    .readdirSync(FIXTURES)
    .filter((name) => /^[A-Z]{2}-\d+[a-z]$/.test(name))
    .sort();

  it.each(fixtureCodes)("resolves %s.md to the file that carries its code", (code) => {
    const target = files[`${code}.md`];
    expect(target, `no redirect for ${code}.md`).toBeDefined();
    expect(codeOf(path.join(RULES, target))).toBe(code);
  });

  it("is the target of exactly one redirect for each moved rule file", () => {
    expect(ruleFiles.length).toBe(158);
    expect(Object.values(files).sort()).toEqual([...ruleFiles].sort());
  });
});

describe("4. skills/design-restructure/ no longer exists", () => {
  it("is gone", () => {
    expect(fs.existsSync(OLD)).toBe(false);
  });
});

describe("6. the base-layer README names a home for each lint document", () => {
  const readme = path.join(PLUGIN, "standards/rules.md");
  const text = fs.existsSync(readme) ? fs.readFileSync(readme, "utf8") : "";

  it.each(["building-a-rule.md", "config.md", "run.md", "testing.md"])("links %s, and the file exists", (doc) => {
    const link = `../../../packages/design-lint/docs/${doc}`;
    expect(text).toContain(`](${link})`);
    expect(fs.existsSync(path.resolve(path.dirname(readme), link))).toBe(true);
  });
});
