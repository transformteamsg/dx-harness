import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveParameters } from "../src/config.ts";
import { loadPreset } from "../src/preset.ts";
import { exitCode } from "../src/report.ts";
import { loadRules } from "../src/rules/load.ts";
import { run } from "../src/run.ts";
import type { RuleMeta } from "../src/types.ts";
import { BASE } from "./helpers.ts";

const CLI = path.resolve(import.meta.dirname, "../src/cli.ts");
const WU_1A_FAIL = path.resolve(import.meta.dirname, "../fixtures/WU-1a/fail");

const { rules } = loadRules(BASE);
const bd4a = rules.find((r) => r.code === "BD-4a")!;

/* Writes one preset file and returns its directory. */
function presetDir(name: string, frontmatter: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-preset-"));
  fs.writeFileSync(path.join(dir, `${name}.md`), `---\n${frontmatter}---\n\n# The ${name} preset\n`);
  return dir;
}

function designLint(args: string[], config: unknown) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-cfg-"));
  const file = path.join(dir, "design-lint.config.json");
  fs.writeFileSync(file, JSON.stringify(config));
  return spawnSync(process.execPath, [CLI, ...args, "--config", file], { encoding: "utf8" });
}

describe("a domain preset", () => {
  it("1. sets a value that the product does not set", () => {
    const preset = loadPreset("teacher", presetDir("teacher", "name: teacher\nparameters:\n  maxGrade: 9\n"));
    const r = resolveParameters(bd4a, { product: { locale: "en" } }, preset);
    expect(r.values.maxGrade).toBe(9);
    expect(r.unset).not.toContain("maxGrade");
  });

  it("1. sets a value for one rule only", () => {
    const preset = loadPreset("teacher", presetDir("teacher", "name: teacher\nrules:\n  BD-4a:\n    maxGrade: 9\n"));
    expect(resolveParameters(bd4a, null, preset).values.maxGrade).toBe(9);
  });

  it("2. loses to a value that the product sets in product", () => {
    const preset = loadPreset("teacher", presetDir("teacher", "name: teacher\nparameters:\n  maxGrade: 9\n"));
    expect(resolveParameters(bd4a, { product: { maxGrade: 7 } }, preset).values.maxGrade).toBe(7);
  });

  it("2. loses to a value that the product sets for the rule", () => {
    const preset = loadPreset("teacher", presetDir("teacher", "name: teacher\nrules:\n  BD-4a:\n    maxGrade: 9\n"));
    const r = resolveParameters(bd4a, { rules: { "BD-4a": { maxGrade: 7 } } }, preset);
    expect(r.values.maxGrade).toBe(7);
  });

  it("3. cannot ignore or override an L0 rule: the rule runs and the command reports the skipped line", () => {
    /* Line 1 is the opening ---. The ignore entry is on line 4, and the override on line 7. */
    const presets = presetDir("teacher", "name: teacher\nignore:\n  - WU-1a\nrules:\n  WU-1a:\n    strict: false\n");
    const r = designLint([WU_1A_FAIL, "--presets", presets, "--select", "WU-1a"], { preset: "teacher" });
    expect(r.status).toBe(1);
    expect(r.stdout).toMatch(/no-lang\.html:2:1: WU-1a \[L0\]/);
    expect(r.stdout).toMatch(/WU-1a.*teacher\.md:4/);
    expect(r.stdout).toMatch(/WU-1a.*teacher\.md:7/);
  });

  it("4. a preset that no file defines stops the command with exit code 2 and names it", () => {
    const presets = presetDir("teacher", "name: teacher\n");
    const r = designLint([WU_1A_FAIL, "--presets", presets], { preset: "nursery" });
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/nursery/);
  });
});

/* The paths below came with the implementation. They are not contract items of #512. */
describe("the preset ignore list", () => {
  const rule = (code: string, tier: RuleMeta["tier"]): RuleMeta => ({ ...bd4a, code, tier, surface: "source", parameters: {} });
  const options = { surfaces: ["source" as const], select: [], ignore: [], ci: false, files: [], root: "." };

  it("removes an L1 rule by code or by category, and keeps an L0 rule with a skipped note", async () => {
    const preset = loadPreset("teacher", presetDir("teacher", "name: teacher\nignore:\n  - XX\n  - YY-1a\n"));
    const rules = [rule("XX-1a", "L1"), rule("YY-1a", "L2"), rule("XX-2a", "L0")];
    const r = await run(rules, [], null, { ...options, preset });
    expect(r.notes.map((n) => [n.code, n.kind])).toEqual([
      ["XX-2a", "skipped"],
      ["XX-2a", "no-module"],
    ]);
    expect(r.notes[0].detail).toEqual([`${preset.file}:4 ignore XX`]);
  });

  it("does not change the exit code with a skipped note", () => {
    const note = { code: "XX-2a", kind: "skipped" as const, detail: ["teacher.md:4 ignore XX"] };
    expect(exitCode([], [note], new Map([["XX-2a", "L0"]]))).toBe(0);
  });
});

describe("a preset that is not valid", () => {
  it("fails on a key that a preset does not have", () => {
    const dir = presetDir("teacher", "name: teacher\nadd: [TCH-1]\n");
    expect(() => loadPreset("teacher", dir)).toThrow(/"add" is not a preset key/);
  });

  it("fails when the name does not match the file", () => {
    expect(() => loadPreset("teacher", presetDir("teacher", "name: school\n"))).toThrow(/does not match the file name/);
  });

  it("fails when a rule override is not a map", () => {
    expect(() => loadPreset("teacher", presetDir("teacher", "name: teacher\nrules:\n  BD-4a: 9\n"))).toThrow(
      /rules is not a map/,
    );
  });
});
