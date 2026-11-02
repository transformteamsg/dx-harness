import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* The generator writes `.dx/design.json` from a product's DESIGN.md. An
   override names a rule that a design run lists: a base rule, or a placeholder
   control in catalog.yaml. An old catalogue code that base rules replace is
   rejected, and the error names the codes to use. See issue #537. */

const ROOT = process.cwd();
const SCRIPT = path.join(ROOT, "plugins/dx-harness/scripts/generate-design-json.py");

function generate(overrides: string) {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "generate-design-json-"));
  fs.writeFileSync(path.join(repo, "DESIGN.md"), `# DESIGN.md\n\n## Overrides\n${overrides}\n`);
  const run = spawnSync("python3", [SCRIPT, repo], { cwd: ROOT, encoding: "utf8" });
  const out = path.join(repo, ".dx", "design.json");
  return {
    status: run.status,
    out: `${run.stdout ?? ""}${run.stderr ?? ""}`,
    json: fs.existsSync(out) ? (JSON.parse(fs.readFileSync(out, "utf8")) as { overrides?: { control: string }[] }) : null,
  };
}

describe("a standing override in DESIGN.md", () => {
  it("names a base rule, and the projection carries it", () => {
    const run = generate("- CNT-12a (L2): title case in the product name - reason: brand lockup");
    expect(run.status, run.out).toBe(0);
    expect(run.json?.overrides?.map((o) => o.control)).toEqual(["CNT-12a"]);
  });

  it("names a placeholder control, and the projection carries it", () => {
    const run = generate("- TOK-2 (L1): print sheet spacing - reason: no token layer; approver: J. Tan");
    expect(run.status, run.out).toBe(0);
    expect(run.json?.overrides?.map((o) => o.control)).toEqual(["TOK-2"]);
  });

  it("names an old catalogue code, and the run stops with the new codes", () => {
    const run = generate("- CNT-12 (L2): title case - reason: brand lockup");
    expect(run.status).toBe(3);
    expect(run.out).toMatch(/CNT-12 is an old catalogue code/);
    expect(run.out).toContain("CNT-12a, CNT-12b");
    expect(run.json, "the projection was written").toBeNull();
  });
});
