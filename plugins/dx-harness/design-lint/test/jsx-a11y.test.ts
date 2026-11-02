import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { installedJsxA11yRules, jsxRule, runJsxA11y } from "../src/engines/jsx-a11y.ts";

/* The wrapper, on its own. Each rule that wraps jsx-a11y has its own fixtures. */

function site(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-jsx-"));
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), text);
  return dir;
}

describe("runJsxA11y", () => {
  it("reports a violation in a TSX file with its position", async () => {
    const dir = site({ "a.tsx": 'export const A = () => <img src="x.png" />;\n' });
    const [result] = await runJsxA11y(dir, [path.join(dir, "a.tsx")], ["alt-text"]);
    expect(result.messages).toEqual([expect.objectContaining({ ruleId: "alt-text", line: 1 })]);
  });

  it("reports nothing for a file that passes", async () => {
    const dir = site({ "a.jsx": 'export const A = () => <img src="x.png" alt="A chart" />;\n' });
    const [result] = await runJsxA11y(dir, [path.join(dir, "a.jsx")], ["alt-text"]);
    expect(result.messages).toEqual([]);
  });

  it("ignores a file that is not JSX or TSX", async () => {
    const dir = site({ "a.html": '<img src="x.png">' });
    expect(await runJsxA11y(dir, [path.join(dir, "a.html")], ["alt-text"])).toEqual([]);
  });

  it("runs only the rules that it is given", async () => {
    const dir = site({ "a.tsx": 'export const A = () => <div onClick={go}>x</div>;\n' });
    const [result] = await runJsxA11y(dir, [path.join(dir, "a.tsx")], ["alt-text"]);
    expect(result.messages).toEqual([]);
  });
});

describe("jsxRule", () => {
  it("makes a rule module that finds a violation", async () => {
    const dir = site({ "a.tsx": 'export const A = () => <img src="x.png" />;\n' });
    const rule = jsxRule("XX-1a", ["alt-text"]);
    const [candidate] = await rule.locate({ files: [path.join(dir, "a.tsx")], root: dir, params: {} });
    expect(rule.decide(candidate, {})).toMatch(/alt-text/);
  });
});

describe("the jsx-a11y rule ids that the rules name", () => {
  it("includes the ids used in these tests", () => {
    const have = new Set(installedJsxA11yRules());
    expect(["alt-text", "no-static-element-interactions"].filter((id) => !have.has(id))).toEqual([]);
  });
});
