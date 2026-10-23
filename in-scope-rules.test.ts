import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* The list command prints the rules in scope for a product and a run, so a
   design skill reads a slice of the catalogue instead of all of it. These run
   the command against throwaway product repositories. See issue #457. */

const ROOT = process.cwd();
const SCRIPT = path.join(ROOT, "plugins/dx-harness/scripts/in-scope-rules.py");

/* A product repository with an optional DESIGN.md. */
function product(designMd?: string) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "in-scope-rules-"));
  if (designMd !== undefined) fs.writeFileSync(path.join(dir, "DESIGN.md"), designMd);
  return dir;
}

function list(repo: string, ...args: string[]) {
  const run = spawnSync("python3", [SCRIPT, repo, ...args], { cwd: ROOT, encoding: "utf8" });
  return { status: run.status, out: `${run.stdout ?? ""}${run.stderr ?? ""}`, stdout: run.stdout ?? "" };
}

/* The rule ids the list prints, one rule to a row. */
function ruleIds(stdout: string) {
  return [...stdout.matchAll(/^- ([A-Z][A-Z0-9]*-\d+) /gm)].map((m) => m[1]).sort();
}

/* Written out by hand from the polish pass's SKILL.md and the catalogue's four
   L0 controls, so the expected side does not come from the code under test. */
const POLISH = ["TOK-1", "TOK-2", "TOK-3", "TYP-1", "TYP-2", "TYP-3", "TYP-4", "TYP-5", "COL-1", "COL-2",
  "SLP-1", "SLP-2", "SLP-3", "SLP-6", "SLP-7"];
const L0 = ["A11Y-1", "A11Y-2", "A11Y-3", "CMP-2"];

/* Contract item 1: one dimension reads one dimension. */
describe("a review scoped to the polish dimension", () => {
  const run = list(product(), "--dimension", "polish");

  it("gets the polish rules plus the L0 floor, and no other rules", () => {
    expect(run.status, run.out).toBe(0);
    expect(ruleIds(run.stdout)).toEqual([...POLISH, ...L0].sort());
  });

  it("gets the path to each rule's detail where the rule has one", () => {
    const row = run.stdout.split("\n").find((line) => line.startsWith("- TYP-2 "));
    expect(row, "no row for TYP-2").toBeDefined();
    const detail = row?.match(/Detail: (\S+)/)?.[1] ?? "";
    expect(detail, "the TYP-2 row names no detail file").toMatch(/typ-2\.md$/);
    expect(fs.existsSync(detail), `${detail} does not exist`).toBe(true);
  });
});

/* Contract item 2: the run says what it applied. */
describe("the selection line", () => {
  it("names the selection on a product with no DESIGN.md", () => {
    const run = list(product(), "--dimension", "polish", "--phase", "verify", "--product", "glow");
    expect(run.status, run.out).toBe(0);
    const selection = run.stdout.split("\n")[0];
    expect(selection).toMatch(/^Selection: /);
    expect(selection).toContain("dimension polish");
    expect(selection).toContain("phase verify");
    expect(selection).toContain("product glow");
    expect(selection).toContain("audience teachers");
    expect(selection).toContain("no DESIGN.md");
  });

  it("names the DESIGN.md it read when the product has one", () => {
    const repo = product("# DESIGN.md\n\n## Essence\nCalm.\n");
    const run = list(repo);
    expect(run.status, run.out).toBe(0);
    const selection = run.stdout.split("\n")[0];
    expect(selection).toMatch(/^Selection: /);
    expect(selection).toContain("dimension all");
    expect(selection).toContain(path.join(repo, "DESIGN.md"));
  });
});

