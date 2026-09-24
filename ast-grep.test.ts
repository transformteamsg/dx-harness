import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* ast-grep comes from a pinned devDependency, not from global installs that
   each restate the version. See issue #227. */

const ROOT = process.cwd();

function readRoot(file: string) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

describe("the checks' ast-grep", () => {
  it("resolves from node_modules/.bin with no global ast-grep on PATH", () => {
    const python = execFileSync("sh", ["-c", "command -v python3"], { encoding: "utf8" }).trim();
    const bin = path.join(ROOT, "node_modules", ".bin");
    const probe = [
      "import sys",
      "sys.path.insert(0, 'plugins/dx-harness/checks')",
      "import checklib",
      "print(checklib._resolve_astgrep('probe'))",
    ].join("; ");
    const run = spawnSync(python, ["-c", probe], {
      cwd: ROOT,
      encoding: "utf8",
      env: { ...process.env, PATH: [bin, path.dirname(process.execPath), "/usr/bin", "/bin"].join(":") },
    });
    expect(run.stderr.match(/ERROR .*/)?.[0] ?? "").toBe("");
    expect(run.stdout.trim()).toBe(path.join(bin, "ast-grep"));
  });
});
