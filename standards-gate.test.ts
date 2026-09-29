import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* CI runs the plugin's checks: the Vitest tests, every check script's
   --self-test, and validate.py. The gate runs from `pnpm check`, and the
   self-tests run with the rest of the tests. See issues #224 and #401. */

function readRoot(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

const scripts: Record<string, string> = JSON.parse(readRoot("package.json")).scripts;

describe("pnpm check", () => {
  it("runs validate.py, and nothing runs it from a build lifecycle", () => {
    expect(scripts.check).toBe("python3 plugins/dx-harness/checks/validate.py");
    expect(scripts.prebuild).toBeUndefined();
    expect(scripts.build).toBeUndefined();
  });
});

describe(".github/workflows/ci.yml", () => {
  const ci = readRoot(".github/workflows/ci.yml");

  it("runs pnpm check as its own named step", () => {
    expect(ci).toMatch(/- name: [^\n]+\n\s+run: pnpm check\n/);
  });

  it("runs no site step: lint, build, or the rendered contract", () => {
    const siteSteps = ["run: pnpm lint", "run: pnpm build", "run: pnpm test:e2e", "playwright"].filter((step) =>
      ci.includes(step),
    );
    expect(siteSteps, `ci.yml still runs site steps: ${siteSteps.join(", ")}`).toEqual([]);
  });

  it("lets a failing check fail the job", () => {
    expect(ci).not.toContain("continue-on-error");
  });
});

/* Every check script that carries a self-test, found on disk rather than
   listed here, so a new check's self-test cannot be left out of the run. */
const CHECKS = "plugins/dx-harness/checks";
const SELF_TESTS = fs
  .readdirSync(path.join(process.cwd(), CHECKS))
  .filter((file) => file.endsWith(".py"))
  .filter((file) => /["']--self-test["']/.test(readRoot(path.join(CHECKS, file))))
  .map((file) => `python3 ${CHECKS}/${file} --self-test`);

describe("the check scripts' self-tests", () => {
  it("are found on disk", () => {
    expect(SELF_TESTS).toContain(`python3 ${CHECKS}/audit-record.py --self-test`);
    expect(SELF_TESTS).toContain(`python3 ${CHECKS}/validate.py --self-test`);
  });

  it("all run from test:checks, which pnpm test calls after vitest", () => {
    expect(scripts.test).toBe("vitest run && pnpm run test:checks");
    const listed = scripts["test:checks"]?.split(" && ") ?? [];
    const missing = SELF_TESTS.filter((command) => !listed.includes(command));
    expect(missing, `test:checks leaves out: ${missing.join(", ")}`).toEqual([]);
  });

  it("do not run from pnpm check or any check:* script", () => {
    const gateScripts = Object.entries(scripts).filter(([name]) => name === "check" || name.startsWith("check:"));
    expect(gateScripts.filter(([, command]) => command.includes("--self-test"))).toEqual([]);
  });

  it("run in CI after Python and PyYAML are set up", () => {
    const ci = readRoot(".github/workflows/ci.yml");
    const test = ci.indexOf("run: pnpm test\n");
    expect(test).toBeGreaterThan(-1);
    for (const setup of ["uses: actions/setup-python", "run: pip install pyyaml"]) {
      expect(ci.indexOf(setup)).toBeGreaterThan(-1);
      expect(ci.indexOf(setup)).toBeLessThan(test);
    }
  });
});
