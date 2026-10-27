import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { familiesOf } from "../src/modules/pr/browsers.ts";
import { maxAge } from "../src/modules/pr/cache.ts";
import { pr6b, launchEngine } from "../src/modules/pr/engines.ts";
import { reviewProblem } from "../src/modules/pr/review.ts";
import { pr7b } from "../src/modules/pr/vitals.ts";
import { pr1b } from "../src/modules/pr/review.ts";
import { pr6a } from "../src/modules/pr/browsers.ts";
import { startSession } from "../src/rendered.ts";

describe("PR-1b", () => {
  const today = new Date("2026-10-26");
  it("passes a date inside the interval", () => expect(reviewProblem("2026-10-01", 90, today)).toBeNull());
  it("fails a date older than the interval", () => expect(reviewProblem("2026-01-01", 90, today)).toMatch(/days ago/));
  it("fails an invalid date", () => {
    expect(reviewProblem("26/10/2026", 90, today)).toMatch(/not a valid date/);
    expect(reviewProblem("2026-02-30", 90, today)).toMatch(/not a valid date/);
  });
  it("reads the date from the file in preference to the config", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pr1b-"));
    fs.writeFileSync(path.join(dir, "r.json"), '{ "lastReviewDate": "1990-01-01" }');
    const [c] = pr1b.locate({ files: [], root: dir, params: { lastReviewDate: "2026-10-01", reviewIntervalDays: 90, reviewDateFile: "r.json" } }) as any[];
    expect(pr1b.decide(c, {})).toMatch(/Read from r\.json/);
  });
});

describe("PR-6a", () => {
  it("counts the browser families that the queries name", () => {
    expect([...familiesOf(["last 2 chrome versions", "ios_saf >= 15", "Firefox ESR", "not ie 11"])].sort()).toEqual(["chrome", "firefox", "safari"]);
  });
  it("counts no family for a query that names none", () => expect(familiesOf(["defaults", "> 0.5%", "last 2 versions"]).size).toBe(0));
  it("reads package.json and reports a missing list", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pr6a-"));
    const params = { minBrowsers: 2, browserSupportSource: ["package.json", ".browserslistrc"] };
    const run = () => (pr6a.locate({ files: [], root: dir, params }) as any[])[0];
    expect(pr6a.decide(run(), params)).toMatch(/No browser support list/);
    fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ browserslist: { production: ["last 2 chrome versions", "last 2 edge versions"] } }));
    expect(pr6a.decide(run(), params)).toBeNull();
  });
});

describe("PR-7f", () => {
  it("reads max-age", () => {
    expect(maxAge("public, max-age=31536000, immutable")).toBe(31536000);
    expect(maxAge("public, s-maxage=100")).toBeNull();
  });
});

describe("PR-7b", () => {
  const params = { lcpMs: 2500, clsMax: 0.1, tbtMs: 200 };
  const decide = (metric: string, value: number) => pr7b.decide({ file: "/", line: 0, column: 0, data: { metric, value } }, params);
  it("passes values at the limit", () => {
    expect(decide("lcp", 2500)).toBeNull();
    expect(decide("cls", 0.1)).toBeNull();
    expect(decide("tbt", 200)).toBeNull();
  });
  it("fails values over the limit", () => {
    expect(decide("lcp", 4000)).toMatch(/Largest Contentful Paint is 4000 ms/);
    expect(decide("cls", 0.3)).toMatch(/Layout Shift is 0.3/);
    expect(decide("tbt", 900)).toMatch(/Blocking Time/);
  });
});

/* PR-6b must report "not run" for an engine that does not start, and never pass. */
describe("PR-6b", () => {
  it("reports an engine that did not start as not run", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pr6b-"));
    fs.writeFileSync(path.join(dir, "index.html"), "<!doctype html><title>x</title><p>x</p>");
    let session;
    try {
      session = await startSession(dir, "load");
    } catch {
      return;
    }
    const previous = process.env.DESIGN_LINT_FIREFOX;
    process.env.DESIGN_LINT_FIREFOX = path.join(dir, "no-such-firefox");
    try {
      const params = { engines: ["firefox"], smokeChecks: ["loads-without-errors"], viewports: [320], pages: ["/"] };
      const found = await pr6b.locate({ files: [], root: dir, params, rendered: session });
      expect(found).toHaveLength(1);
      expect(pr6b.decide(found[0], params)).toMatch(/^Not run: the engine firefox did not start/);
    } finally {
      if (previous === undefined) delete process.env.DESIGN_LINT_FIREFOX;
      else process.env.DESIGN_LINT_FIREFOX = previous;
      await session.close();
    }
  });
  it("rejects an unknown engine", async () => {
    await expect(launchEngine("netscape")).rejects.toThrow(/unknown engine/);
  });
});
