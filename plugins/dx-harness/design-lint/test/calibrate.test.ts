import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { calibrate, formatCalibration, loadCorpus, loadVerdicts } from "../src/calibrate.ts";
import type { CalibrationReport, Verdict } from "../src/calibrate.ts";
import { loadRules } from "../src/rules/load.ts";
import { BASE } from "./helpers.ts";

/* The calibration run of issue #516. The corpus here is local files, and the
   rule is BD-5a, a source rule, so no browser and no network are needed. */

const { rules } = loadRules(BASE);

const page = (title: string, description: string) =>
  `<!doctype html>\n<html lang="en">\n<head>\n  <title>${title}</title>\n  <meta name="description" content="${description}">\n  <link rel="canonical" href="https://example.invalid/">\n</head>\n<body><p>Text.</p></body>\n</html>\n`;
const LONG_DESCRIPTION = "A description of the page that is long enough to pass the length check of the rule.";

/* Three pages. "short-a" and "short-b" each have a title that is too short, and
   "good" passes. */
function writeCorpus(extra: object = {}, pages?: object[]): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-calibrate-"));
  fs.writeFileSync(path.join(dir, "short-a.html"), page("Home", LONG_DESCRIPTION));
  fs.writeFileSync(path.join(dir, "short-b.html"), page("About", LONG_DESCRIPTION));
  fs.writeFileSync(path.join(dir, "good.html"), page("A title of a good length", LONG_DESCRIPTION));
  const corpus = {
    config: { product: { audience: "public" }, select: ["BD-5a"] },
    falseShareLimit: null,
    pages: pages ?? [
      { id: "short-a", file: "short-a.html" },
      { id: "short-b", file: "short-b.html" },
      { id: "good", file: "good.html" },
    ],
    ...extra,
  };
  const file = path.join(dir, "corpus.json");
  fs.writeFileSync(file, JSON.stringify(corpus, null, 2));
  return file;
}

async function runOnce(corpusFile: string, judge: (v: Verdict) => Verdict["verdict"]): Promise<CalibrationReport> {
  const corpus = loadCorpus(corpusFile);
  /* The first run has no verdicts. It returns every finding as unjudged, in the
     shape of the record, and a person fills in the verdict. */
  const first = await calibrate({ corpus, verdicts: [], rules, surfaces: ["source", "project"] });
  expect(first.unjudged.length).toBeGreaterThan(0);
  const verdicts = first.unjudged.map((v) => ({ ...v, verdict: judge(v) }));
  return calibrate({ corpus, verdicts, rules, surfaces: ["source", "project"] });
}

describe("a calibration run", () => {
  it("counts, for each rule, the findings, the false ones, and the share of false findings", async () => {
    const report = await runOnce(writeCorpus(), (v) => (v.page === "short-a" ? "false" : "true"));
    const bd5a = report.rules.find((r) => r.code === "BD-5a");
    expect(bd5a).toMatchObject({ findings: 2, trueFindings: 1, falseFindings: 1, unjudged: 0, falseShare: 0.5 });
    expect(report.unjudged).toEqual([]);
  });

  it("prints a line for each rule with the findings, the false ones, and the share", async () => {
    const report = await runOnce(writeCorpus(), (v) => (v.page === "short-a" ? "false" : "true"));
    const line = formatCalibration(report).find((l) => l.includes("BD-5a"));
    expect(line).toBeDefined();
    expect(line).toMatch(/\b2\b/);
    expect(line).toMatch(/\b1\b/);
    expect(line).toMatch(/50%/);
  });

  it("counts a finding with no verdict as unjudged, not as true or false", async () => {
    const corpus = loadCorpus(writeCorpus());
    const report = await calibrate({ corpus, verdicts: [], rules, surfaces: ["source", "project"] });
    const bd5a = report.rules.find((r) => r.code === "BD-5a");
    expect(bd5a).toMatchObject({ findings: 2, trueFindings: 0, falseFindings: 0, unjudged: 2, falseShare: null });
    expect(report.unjudged.map((v) => v.page).sort()).toEqual(["short-a", "short-b"]);
    expect(report.unjudged.every((v) => v.verdict === null && v.code === "BD-5a" && v.message.length > 0)).toBe(true);
  });

  it("reads a verdict record from a file", () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-verdicts-")), "verdicts.json");
    const record: Verdict[] = [{ page: "short-a", code: "BD-5a", at: "5:3", message: "m", verdict: "false", note: "A home page." }];
    fs.writeFileSync(file, JSON.stringify(record));
    expect(loadVerdicts(file)).toEqual(record);
  });

  it("rejects a verdict that is not true, false, or null", () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-verdicts-")), "verdicts.json");
    fs.writeFileSync(file, JSON.stringify([{ page: "a", code: "BD-5a", at: "1:1", message: "m", verdict: "maybe" }]));
    expect(() => loadVerdicts(file)).toThrow(/verdict/);
  });
});

