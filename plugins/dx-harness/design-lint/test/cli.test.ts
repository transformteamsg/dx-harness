import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { browserAvailable } from "../src/rendered.ts";
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
    const codes = loadRules(BASE).rules.map((r) => r.code);
    expect(codes).not.toEqual([]);
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

/* A rendered finding names the page and the element, not a line and a column
   that read like a source position. The box stays in the JSON. See issue #519. */
describe("a finding from a rendered rule", async () => {
  /* A missing browser skips on a developer machine, and fails in CI, where a skip would hide a gap. */
  const skip = !(await browserAvailable()) && !process.env.CI;

  /* A site that breaks BD-2e: the search input is too narrow for the characters it must fit. */
  const site = (body: string) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-element-"));
    fs.writeFileSync(
      path.join(dir, "index.html"),
      `<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><title>Home</title></head>\n<body>\n${body}\n</body>\n</html>\n`,
    );
    const config = path.join(dir, "design-lint.config.json");
    fs.writeFileSync(
      config,
      JSON.stringify({ render: { waitUntil: "load" }, product: { serviceType: "website" }, pages: { all: ["/"] } }),
    );
    return { dir, config };
  };
  const lint = (body: string, ...flags: string[]) => {
    const { dir, config } = site(body);
    return spawnSync(process.execPath, ["src/cli.ts", dir, "--rendered", "--config", config, "--select", "BD-2e", ...flags], {
      cwd: PACKAGE,
      encoding: "utf8",
    });
  };
  const narrow = 'style="width: 8ch"';

  it.skipIf(skip)("names the page and the element, and says what to change", () => {
    const run = lint(`<header><form role="search"><input class="search-box" type="search" ${narrow}></form></header>`);
    expect(run.stderr).toBe("");
    expect(run.stdout.trim().split("\n")).toEqual([
      expect.stringMatching(/^\/ input\.search-box: BD-2e \[L2\] The search input is \d+px wide\. It needs \d+px to fit 27 characters\.$/),
    ]);
  });

  it.skipIf(skip)("names an element with no id, class, or role by its tag and its order on the page", () => {
    const run = lint(`<label>Name <input type="text"></label>\n<form role="search"><input type="search" ${narrow}></form>`);
    expect(run.stderr).toBe("");
    expect(run.stdout.trim().split("\n")).toEqual([expect.stringMatching(/^\/ input \(2nd on the page\): BD-2e \[L2\] /)]);
  });

  it.skipIf(skip)("keeps the position and the size of the element in the JSON", () => {
    const run = lint(`<form role="search"><input class="search-box" type="search" ${narrow}></form>`, "--json");
    expect(run.stderr).toBe("");
    const findings = (JSON.parse(run.stdout || "{}") as { findings?: { element?: Record<string, unknown> }[] }).findings ?? [];
    expect(findings).toHaveLength(1);
    const element = findings[0].element ?? {};
    for (const key of ["top", "left", "width", "height"]) expect(typeof element[key], key).toBe("number");
    expect(element.width as number).toBeGreaterThan(0);
  });
});
