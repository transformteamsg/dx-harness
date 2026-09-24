import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* The standards gate runs from `pnpm check`, not from npm's build lifecycle,
   so asking for a build no longer means asking for verification, and the
   check scripts' own self-tests run with the rest of the tests. See issue
   #224. */

function readRoot(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

const scripts: Record<string, string> = JSON.parse(readRoot("package.json")).scripts;

const GATES = [
  "node scripts/check-standards.mjs",
  "pnpm run check:design",
  "pnpm run check:records",
  "pnpm run check:python",
  "pnpm run check:notices",
];

describe("pnpm check", () => {
  it("runs the five gates, in order, and nothing runs them from prebuild", () => {
    expect(scripts.prebuild).toBeUndefined();
    expect(scripts.check?.split(" && ")).toEqual(GATES);
  });
});

describe("pnpm build", () => {
  it("runs next build and the CSP postbuild, and no gate", () => {
    expect(scripts.build).toBe("next build");
    expect(scripts.prebuild).toBeUndefined();
    expect(scripts.postbuild).toBe("node scripts/externalize-next-inline-scripts.mjs");
  });
});

describe(".github/workflows/ci.yml", () => {
  const ci = readRoot(".github/workflows/ci.yml");
  const at = (line: string) => ci.indexOf(line);

  it("runs pnpm check as its own named step, before the build", () => {
    expect(ci).toMatch(/- name: [^\n]+\n\s+run: pnpm check\n/);
    expect(at("run: pnpm check\n")).toBeGreaterThan(-1);
    expect(at("run: pnpm check\n")).toBeLessThan(at("run: pnpm build\n"));
  });

  it("lets a failing check fail the job", () => {
    expect(ci).not.toContain("continue-on-error");
  });
});

const SELF_TESTS = [
  "validate",
  "checklib",
  "token-audit",
  "type-scan",
  "structure-scan",
  "a11y-eslint",
  "a11y-static",
  "contrast",
  "content-lint",
  "audit-record",
].map((name) => `python3 plugins/dx-harness/checks/${name}.py --self-test`);

describe("the check scripts' self-tests", () => {
  it("run from test:checks, which pnpm test calls", () => {
    expect(scripts.test).toContain("pnpm run test:checks");
    expect(scripts["test:checks"]?.split(" && ").sort()).toEqual([...SELF_TESTS].sort());
  });

  it("do not run from pnpm check or any check:* script", () => {
    const gateScripts = Object.entries(scripts).filter(([name]) => name === "check" || name.startsWith("check:"));
    expect(gateScripts.filter(([, command]) => command.includes("--self-test"))).toEqual([]);
  });

  it("run in CI after Python, PyYAML, and ast-grep are set up", () => {
    const ci = readRoot(".github/workflows/ci.yml");
    const test = ci.indexOf("run: pnpm test\n");
    expect(test).toBeGreaterThan(-1);
    for (const setup of ["uses: actions/setup-python", "run: pip install pyyaml", "run: npm install --global @ast-grep/cli"]) {
      expect(ci.indexOf(setup)).toBeGreaterThan(-1);
      expect(ci.indexOf(setup)).toBeLessThan(test);
    }
  });
});
