import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { browserAvailable } from "../src/rendered.ts";
import { exitCode } from "../src/report.ts";
import { run } from "../src/run.ts";
import type { RuleMeta, RuleModule } from "../src/types.ts";

function rule(code: string, over: Partial<RuleMeta> = {}): RuleMeta {
  return {
    code,
    slug: "a-rule",
    control: code.slice(0, 4),
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

  it("reports a value that the module cannot use as not configured and does not run the module", async () => {
    const picky: RuleModule = { ...longName, unconfigured: (params) => ((params.limit as number) > 1 ? ["limit"] : []) };
    const r = await run([rule("XX-1a")], [picky], null, options);
    expect(r.notes).toEqual([{ code: "XX-1a", kind: "not-configured", detail: ["limit"] }]);
    expect(r.ran).toEqual([]);
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

/* The rendered rules of a run share one browser. Issue #518. */
describe("the rendered rules of a run", async () => {
  /* A missing browser skips on a developer machine, and fails in CI, where a skip would hide a gap. */
  const skip = !(await browserAvailable()) && !process.env.CI;

  const site = (html: string) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-run-"));
    fs.writeFileSync(path.join(dir, "index.html"), html);
    return dir;
  };
  const renderedRule = (code: string) => rule(code, { surface: "rendered", parameters: {} });
  const VIEWPORT = { width: 800, height: 600 };
  const signal = () => {
    let fire = () => {};
    const fired = new Promise<void>((resolve) => (fire = resolve));
    return { fire, fired };
  };
  const within = (p: Promise<void>, ms: number) =>
    Promise.race([p.then(() => true), new Promise<boolean>((resolve) => setTimeout(() => resolve(false), ms))]);

  it.skipIf(skip)("run at the same time, not one after the other", async () => {
    const root = site("<!doctype html><title>x</title><p>x</p>");
    const started = { a: signal(), b: signal() };
    const saw: string[] = [];
    const waiter = (code: string, mine: keyof typeof started, other: keyof typeof started): RuleModule => ({
      code,
      surface: "rendered",
      async locate({ rendered }) {
        await rendered!.open("/", VIEWPORT);
        started[mine].fire();
        if (await within(started[other].fired, 5000)) saw.push(code);
        return [];
      },
      decide: () => null,
    });
    const r = await run([renderedRule("XX-5a"), renderedRule("XX-5b")], [waiter("XX-5a", "a", "b"), waiter("XX-5b", "b", "a")], null, {
      ...options,
      surfaces: ["rendered"],
      root,
      waitUntil: "load",
    });
    expect(r.ran).toEqual(["XX-5a", "XX-5b"]);
    /* Each rule saw the other start while it was still running. */
    expect(saw.sort()).toEqual(["XX-5a", "XX-5b"]);
  });

  it.skipIf(skip)("do not see what a rule that interacts changed on its own page", async () => {
    /* A banner that a click dismisses, and that stays dismissed through localStorage, as a cookie banner does. */
    const root = site(`<!doctype html><title>x</title>
<div id="banner">Cookies</div><button id="dismiss">Dismiss</button>
<script>
  if (localStorage.getItem("dismissed")) document.getElementById("banner").remove();
  document.getElementById("dismiss").addEventListener("click", () => {
    localStorage.setItem("dismissed", "1");
    document.getElementById("banner").remove();
  });
</script>`);
    const clicked = signal();
    const clicker: RuleModule = {
      code: "XX-6a",
      surface: "rendered",
      async locate({ rendered }) {
        const page = await rendered!.open("/", VIEWPORT, { fresh: true });
        await page.click("#dismiss");
        clicked.fire();
        await page.close();
        return [];
      },
      decide: () => null,
    };
    const reader: RuleModule = {
      code: "XX-6b",
      surface: "rendered",
      async locate({ rendered }) {
        await clicked.fired;
        const page = await rendered!.open("/", VIEWPORT);
        const banner = await page.evaluate(() => document.getElementById("banner") !== null);
        return banner ? [] : [{ file: "/", line: 0, column: 0 }];
      },
      decide: () => "the banner is gone",
    };
    const r = await run([renderedRule("XX-6a"), renderedRule("XX-6b")], [clicker, reader], null, {
      ...options,
      surfaces: ["rendered"],
      root,
      waitUntil: "load",
    });
    expect(r.ran).toEqual(["XX-6a", "XX-6b"]);
    expect(r.findings).toEqual([]);
  });
});
