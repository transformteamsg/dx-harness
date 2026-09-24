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

describe("the ast-grep devDependency", () => {
  it("pins @ast-grep/cli at exactly 0.44.1, and the lockfile records it", () => {
    const pkg = JSON.parse(readRoot("package.json"));
    expect(pkg.devDependencies?.["@ast-grep/cli"]).toBe("0.44.1");
    expect(readRoot("pnpm-lock.yaml")).toContain("'@ast-grep/cli@0.44.1':");
  });
});

describe(".github/workflows/ci.yml", () => {
  it("installs no ast-grep of its own", () => {
    const ci = readRoot(".github/workflows/ci.yml");
    expect(ci).not.toContain("@ast-grep/cli");
    expect(ci).not.toMatch(/name: Install ast-grep/);
  });
});

describe("CONTRIBUTING.md", () => {
  const guide = readRoot("CONTRIBUTING.md");

  it("asks no contributor to install ast-grep, and drops the pnpm setup caveat", () => {
    expect(guide).not.toMatch(/(pnpm add|npm install|npm i) (--global|-g) @ast-grep\/cli/);
    expect(guide).not.toContain("pnpm setup");
  });

  it("says to run a check directly through pnpm exec", () => {
    expect(guide).toMatch(/pnpm exec python3 plugins\/dx-harness\/checks\/[a-z-]+\.py/);
  });
});
