import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { lint } from "../src/lint.ts";
import { loadRules } from "../src/rules/load.ts";
import { BASE } from "./helpers.ts";

const { rules } = loadRules(BASE);

function go(code: string, files: Record<string, string>, params: Record<string, unknown>) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "uu-"));
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), text);
  return lint({
    rules, config: { rules: { [code]: params } }, configDir: dir, paths: [dir],
    surfaces: ["project"], select: [code], ignore: [], ci: false,
  });
}

describe("UU-1c", () => {
  it("fails a missing file", async () => {
    expect((await go("UU-1c", {}, { researchRecordPath: "r.md" })).findings.length).toBe(1);
  });
});

describe("UU-2d", () => {
  it("fails a missing file and a report with no findings", async () => {
    expect((await go("UU-2d", {}, { findingsReportPath: "f.md" })).findings.length).toBe(1);
    expect((await go("UU-2d", { "f.md": "# Report\n" }, { findingsReportPath: "f.md" })).findings.length).toBe(1);
  });
  it("reads a JSON report", async () => {
    const good = JSON.stringify({ findings: [{ title: "A", severity: "high" }] });
    expect((await go("UU-2d", { "f.json": good }, { findingsReportPath: "f.json" })).findings).toEqual([]);
    const bad = JSON.stringify([{ title: "A", severity: "huge" }, { title: "B" }]);
    expect((await go("UU-2d", { "f.json": bad }, { findingsReportPath: "f.json" })).findings.length).toBe(2);
  });
  it("accepts a severity in another case", async () => {
    const r = await go("UU-2d", { "f.md": "### A\n\nSeverity: High\n" }, { findingsReportPath: "f.md" });
    expect(r.findings).toEqual([]);
  });
});
