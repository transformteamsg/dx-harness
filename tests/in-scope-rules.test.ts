import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

/* The list command prints the rules in scope for a product and a run, so a
   design skill reads a slice of the rules instead of all of them. The rules are
   the base rules in standards/rules/, plus the placeholder controls that stay in
   catalog.yaml. ADR-0003 sets how a run selects them. These run the command
   against throwaway product repositories. See issues #457 and #537. */

const ROOT = process.cwd();
const SCRIPT = path.join(ROOT, "plugins/dx-harness/scripts/in-scope-rules.py");
const RULES = path.join(ROOT, "plugins/dx-harness/standards/rules");

interface Product {
  designMd?: string;
  config?: unknown;
}

/* A product repository with an optional DESIGN.md and design-lint.config.json. */
function product({ designMd, config }: Product = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "in-scope-rules-"));
  if (designMd !== undefined) fs.writeFileSync(path.join(dir, "DESIGN.md"), designMd);
  if (config !== undefined) fs.writeFileSync(path.join(dir, "design-lint.config.json"), JSON.stringify(config));
  return dir;
}

function list(repo: string, ...args: string[]) {
  const run = spawnSync("python3", [SCRIPT, repo, ...args], { cwd: ROOT, encoding: "utf8" });
  return { status: run.status, out: `${run.stdout ?? ""}${run.stderr ?? ""}`, stdout: run.stdout ?? "" };
}

/* The rule codes the list prints, one rule to a row. */
function ruleIds(stdout: string) {
  return [...stdout.matchAll(/^- ([A-Z][A-Z0-9]*-\d+[a-z]?) /gm)].map((m) => m[1]);
}

/* The expected side comes from the rule files and redirects.yaml, read here with
   the yaml package, so it does not come from the code under test. */
const redirects = parse(fs.readFileSync(path.join(RULES, "redirects.yaml"), "utf8")) as {
  codes: Record<string, string[]>;
};

function ruleFiles() {
  return fs
    .readdirSync(RULES, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".md") && !/(README|MAPPING)\.md$/.test(file))
    .map((file) => {
      const match = /^---\n([\s\S]*?)\n---\n/.exec(fs.readFileSync(path.join(RULES, file), "utf8"));
      return (match ? parse(match[1]) : {}) as { code: string; tier: string };
    });
}

const L0 = ruleFiles().filter((rule) => rule.tier === "L0").map((rule) => rule.code);

/* Contract item 1: a run gets base rules. */
describe("a run on a product with no DESIGN.md", () => {
  const run = list(product());

  it("lists base rules, judged and lint", () => {
    expect(run.status, run.out).toBe(0);
    const ids = ruleIds(run.stdout);
    expect(ids, "no lint rule WP-13a").toContain("WP-13a");
    expect(ids, "no judged rule CMP-4a").toContain("CMP-4a");
  });

  it("lists no catalogue control that a base rule replaces", () => {
    expect(run.status, run.out).toBe(0);
    const ids = ruleIds(run.stdout);
    expect(ids.length, "the list is empty").toBeGreaterThan(0);
    const replaced = ids.filter((id) => id in redirects.codes);
    expect(replaced, "these old codes are still on the list").toEqual([]);
  });

  it("names the selection it came from", () => {
    expect(run.status, run.out).toBe(0);
    const selection = run.stdout.split("\n")[0];
    expect(selection).toMatch(/^Selection: /);
    expect(selection).toContain("dimension all");
    expect(selection).toContain("no design-lint.config.json");
  });

  it("gives each rule a detail path that exists", () => {
    expect(run.status, run.out).toBe(0);
    const rows = run.stdout.split("\n").filter((line) => line.startsWith("- "));
    for (const code of ["WP-13a", "CMP-4a"]) {
      const row = rows.find((line) => line.startsWith(`- ${code} `));
      const detail = row?.match(/Detail: (\S+)/)?.[1] ?? "";
      expect(detail, `the ${code} row names no detail`).not.toBe("");
      expect(fs.existsSync(detail), `${detail} does not exist`).toBe(true);
    }
  });
});

describe("a pass that names its dimension", () => {
  const run = list(product(), "--dimension", "polish");

  it("gets its own rules, every L0 rule, and no rule of another pass", () => {
    expect(run.status, run.out).toBe(0);
    const ids = ruleIds(run.stdout);
    expect(ids, "no polish rule TYP-2a").toContain("TYP-2a");
    expect(ids, "a motion rule is on the polish list").not.toContain("MOT-1a");
    expect(L0.length, "the rule files hold no L0 rule").toBeGreaterThan(0);
    expect(L0.filter((code) => !ids.includes(code)), "these L0 rules are missing").toEqual([]);
  });
});

/* Contract item 2: an unknown rule code stops the run. */
describe("a product config that names a rule code that does not exist", () => {
  const run = list(product({ config: { select: ["CNT-99"] } }));

  it("stops, names the code, and prints no rules", () => {
    expect(run.status).not.toBe(0);
    expect(run.out).toMatch(/unknown rule code CNT-99/);
    expect(ruleIds(run.stdout)).toEqual([]);
  });
});

/* Contract item 3: a placeholder control stays reachable. */
describe("a placeholder control that stays in catalog.yaml", () => {
  it.each([[[]], [["--dimension", "polish"]]])("is on the list with flags %j", (flags) => {
    const run = list(product(), ...flags);
    expect(run.status, run.out).toBe(0);
    expect(ruleIds(run.stdout)).toContain("TOK-2");
  });
});

/* Contract item 4: an old code resolves. */
describe("a product config that names an old catalogue code", () => {
  const run = list(product({ config: { select: ["CNT-12"] } }));

  it("gets the rules that redirects.yaml maps the code to", () => {
    expect(run.status, run.out).toBe(0);
    const ids = ruleIds(run.stdout);
    const mapped = redirects.codes["CNT-12"] ?? [];
    expect(mapped.length, "redirects.yaml has no codes for CNT-12").toBeGreaterThan(0);
    expect(mapped.filter((code) => !ids.includes(code)), "these mapped rules are missing").toEqual([]);
    expect(ids, "CNT-12 itself is on the list").not.toContain("CNT-12");
  });

  it("selects nothing beyond those rules and the L0 floor", () => {
    expect(run.status, run.out).toBe(0);
    const allowed = new Set([...(redirects.codes["CNT-12"] ?? []), ...L0]);
    expect(ruleIds(run.stdout).filter((code) => !allowed.has(code))).toEqual([]);
  });
});
