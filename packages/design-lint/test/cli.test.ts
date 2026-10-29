import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadRules } from "../src/rules/load.ts";
import { BASE } from "./helpers.ts";
import type { Expected } from "./helpers.ts";

/* The command reads the rule files from standards/rules/ when no --rules flag is
   given, and reports what the fixture expects. See issue #536. */

const PACKAGE = path.resolve(import.meta.dirname, "..");
const FIXTURE = path.join(PACKAGE, "fixtures/BD-1a");

describe("design-lint list with the default rules folder", () => {
  it("lists each rule in standards/rules/", () => {
    const run = spawnSync(process.execPath, ["src/cli.ts", "list"], { cwd: PACKAGE, encoding: "utf8" });
    const listed = run.stdout.split("\n").filter(Boolean).map((line) => line.split(/\s+/)[0]);
    const codes = fs.existsSync(BASE) ? loadRules(BASE).rules.map((r) => r.code) : [];
    expect(codes).toHaveLength(160);
    expect(listed).toEqual(codes);
  });
});

describe("design-lint with the default rules folder", () => {
  const run = spawnSync(process.execPath, ["src/cli.ts", path.join(FIXTURE, "fail"), "--json", "--select", "BD-1a"], {
    cwd: PACKAGE,
    encoding: "utf8",
  });

  it("loads the rules with no error", () => {
    expect(run.stderr).toBe("");
  });

  it("reports the findings that the BD-1a fixture expects", () => {
    const expected = JSON.parse(fs.readFileSync(path.join(FIXTURE, "expected.json"), "utf8")) as Expected[];
    const findings = (JSON.parse(run.stdout || "{}") as { findings?: { file: string; line: number; column: number; code: string }[] })
      .findings ?? [];
    const actual = findings.map((f) => ({ file: path.relative(path.join(FIXTURE, "fail"), f.file), line: f.line, column: f.column }));
    expect(actual).toEqual(expected);
    expect(findings.every((f) => f.code === "BD-1a")).toBe(true);
  });
});
