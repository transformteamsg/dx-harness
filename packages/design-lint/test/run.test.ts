import { describe, expect, it } from "vitest";
import { exitCode } from "../src/report.ts";
import { run } from "../src/run.ts";
import type { RuleMeta, RuleModule } from "../src/types.ts";

function rule(code: string, over: Partial<RuleMeta> = {}): RuleMeta {
  return {
    code,
    slug: "a-rule",
    dss: code.slice(0, 4),
    tier: "L1",
    surface: "source",
    engine: "custom",
    judgedRemainder: [],
    redirects: [],
    parameters: { limit: 2 },
    title: code,
    file: `${code}.md`,
    ...over,
  };
}

/* A module that flags every file whose name is longer than the limit. */
const longName: RuleModule = {
  code: "XX-1a",
  surface: "source",
  locate: ({ files }) => files.map((file) => ({ file, line: 1, column: 1 })),
  decide: (c, params) => (c.file.length > (params.limit as number) ? "name is too long" : null),
};

const options = { surfaces: ["source" as const], select: [], ignore: [], ci: false, files: ["abc.html", "a"], root: "." };

describe("run", () => {
  it("collects a finding from a module", async () => {
    const r = await run([rule("XX-1a")], [longName], null, options);
    expect(r.findings).toEqual([expect.objectContaining({ code: "XX-1a", file: "abc.html", message: "name is too long" })]);
    expect(r.ran).toEqual(["XX-1a"]);
  });

  it("reports a rule with no module as no-module", async () => {
    const r = await run([rule("XX-2a")], [], null, options);
    expect(r.notes).toEqual([{ code: "XX-2a", kind: "no-module", detail: [] }]);
  });

  it("reports an unset parameter as not configured and does not run the module", async () => {
    const r = await run([rule("XX-1a", { parameters: { limit: null } })], [longName], null, options);
    expect(r.notes).toEqual([{ code: "XX-1a", kind: "not-configured", detail: ["limit"] }]);
    expect(r.findings).toEqual([]);
  });

  it("skips a surface that was not selected", async () => {
    const r = await run([rule("XX-3a", { surface: "rendered" })], [], null, options);
    expect(r.notes).toEqual([]);
  });

  it("skips a ci-only rule outside CI", async () => {
    const ciRule = rule("XX-4a", { parameters: { runOn: "ci" } });
    expect((await run([ciRule], [], null, options)).notes).toEqual([]);
    expect((await run([ciRule], [], null, { ...options, ci: true })).notes).toHaveLength(1);
  });

  it("selects by category prefix", async () => {
    const r = await run([rule("XX-1a"), rule("YY-1a")], [], null, { ...options, select: ["YY"] });
    expect(r.notes.map((n) => n.code)).toEqual(["YY-1a"]);
  });

  it("applies --ignore to L1 and not to L0", async () => {
    const rules = [rule("XX-1a"), rule("XX-2a", { tier: "L0" })];
    const r = await run(rules, [], null, { ...options, ignore: ["XX"] });
    expect(r.notes.map((n) => n.code)).toEqual(["XX-2a"]);
  });
});

describe("a rendered rule on a machine with no browser", () => {
  const rendered: RuleModule = {
    code: "XX-9a",
    surface: "rendered",
    locate: () => [],
    decide: () => null,
  };

  it("reports that the rule did not run, and does not pass it", async () => {
    const before = process.env.DESIGN_LINT_CHROMIUM;
    process.env.DESIGN_LINT_CHROMIUM = "/nonexistent/chromium";
    try {
      const rules = [rule("XX-9a", { surface: "rendered", parameters: {} })];
      const r = await run(rules, [rendered], null, { ...options, surfaces: ["rendered"] });
      expect(r.notes).toEqual([{ code: "XX-9a", kind: "not-run", detail: [expect.any(String)] }]);
      expect(r.notes[0].detail[0].length).toBeGreaterThan(0);
      expect(r.ran).toEqual([]);
      expect(exitCode(r.findings, r.notes, new Map([["XX-9a", "L1"]]))).toBe(1);
    } finally {
      if (before === undefined) delete process.env.DESIGN_LINT_CHROMIUM;
      else process.env.DESIGN_LINT_CHROMIUM = before;
    }
  });
});
