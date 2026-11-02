import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Browser } from "playwright-core";
import { mergeConfig } from "./config.ts";
import { lint } from "./lint.ts";
import { launchBrowser } from "./rendered.ts";
import type { Config, Finding, RuleMeta, Surface } from "./types.ts";

/* The calibration run: the L2 rules on real pages that the team did not write,
   and a person's verdict on each finding. See docs/testing.md. */

/* A page of the corpus. It has a url to fetch, or a file, relative to the corpus file. */
export interface CorpusPage {
  id: string;
  url?: string;
  file?: string;
}

export interface Corpus {
  file: string;
  /* The design-lint config that each page runs with. */
  config: Config;
  /* The share of false findings, from 0 to 1, above which a rule is flagged.
     Null means that no limit is agreed, so no rule is flagged. */
  falseShareLimit: number | null;
  pages: CorpusPage[];
}

/* "true" and "false" are a person's verdict. Null means that nobody judged the finding yet. */
export type VerdictValue = "true" | "false" | null;

/* One finding on one corpus page, and its verdict. page, code, at, and message
   identify the finding. at is the element name or "page" for a rendered
   finding, and line:column for any other finding. */
export interface Verdict {
  page: string;
  code: string;
  at: string;
  message: string;
  verdict: VerdictValue;
  note?: string;
}

export interface CalibrationInput {
  corpus: Corpus;
  verdicts: Verdict[];
  rules: RuleMeta[];
  surfaces: Surface[];
  browser?: Browser;
}

export interface RuleTally {
  code: string;
  findings: number;
  trueFindings: number;
  falseFindings: number;
  unjudged: number;
  /* falseFindings over the judged findings. Null when no finding is judged. */
  falseShare: number | null;
  flagged: boolean;
}

export interface CalibrationReport {
  limit: number | null;
  /* Each corpus page, and why it could not be loaded or linted. */
  pages: { id: string; error?: string }[];
  rules: RuleTally[];
  /* The findings that have no verdict, in the shape of the verdict record. */
  unjudged: Verdict[];
  /* The rules that gave no verdict on a page, and why. */
  notRun: { code: string; page: string; reason: string }[];
}

const FETCH_TIMEOUT_MS = 30000;
const VERDICTS: VerdictValue[] = ["true", "false", null];

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function loadCorpus(file: string): Corpus {
  const raw = readJson(file) as Partial<Corpus> | null;
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.pages)) throw new Error(`${file}: the corpus has no pages list`);
  const limit = raw.falseShareLimit ?? null;
  if (limit !== null && (typeof limit !== "number" || limit < 0 || limit > 1)) {
    throw new Error(`${file}: falseShareLimit must be null or a number from 0 to 1`);
  }
  const ids = new Set<string>();
  for (const p of raw.pages) {
    if (typeof p?.id !== "string" || p.id === "") throw new Error(`${file}: a page has no id`);
    if (ids.has(p.id)) throw new Error(`${file}: the page id "${p.id}" is used twice`);
    ids.add(p.id);
    if ((p.url === undefined) === (p.file === undefined)) throw new Error(`${file}: page "${p.id}" needs one of url or file`);
  }
  return { file: path.resolve(file), config: raw.config ?? {}, falseShareLimit: limit, pages: raw.pages };
}

export function loadVerdicts(file: string): Verdict[] {
  const raw = readJson(file);
  if (!Array.isArray(raw)) throw new Error(`${file}: the verdict record is not a list`);
  raw.forEach((v, i) => {
    for (const key of ["page", "code", "at", "message"]) {
      if (typeof v?.[key] !== "string") throw new Error(`${file}: entry ${i + 1} has no ${key}`);
    }
    if (!VERDICTS.includes(v.verdict)) throw new Error(`${file}: entry ${i + 1} has the verdict ${JSON.stringify(v.verdict)}. Use "true", "false", or null`);
  });
  return raw as Verdict[];
}

/* Where a finding is, in a form that stays the same from run to run of one page. */
function locationOf(f: Finding, surface: Surface | undefined): string {
  if (f.element) return f.element.name;
  if (surface === "rendered" && f.line === 0 && f.column === 0) return "page";
  return `${f.line}:${f.column}`;
}

const keyOf = (v: Pick<Verdict, "page" | "code" | "at" | "message">) => JSON.stringify([v.page, v.code, v.at, v.message]);

/* A page that a url names is fetched once and saved as index.html. A base
   element makes its styles, scripts, and images load from the origin. */
async function preparePage(corpus: Corpus, page: CorpusPage, dir: string): Promise<void> {
  const target = path.join(dir, "index.html");
  if (page.file !== undefined) {
    fs.copyFileSync(path.resolve(path.dirname(corpus.file), page.file), target);
    return;
  }
  const response = await fetch(page.url!, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), redirect: "follow" });
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${page.url}`);
  const html = await response.text();
  const base = `<base href="${response.url.replace(/"/g, "&quot;")}">`;
  fs.writeFileSync(target, /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => `${m}${base}`) : `${base}${html}`);
}

export async function calibrate(input: CalibrationInput): Promise<CalibrationReport> {
  const { corpus, rules, surfaces } = input;
  const surfaceOf = new Map(rules.map((r) => [r.code, r.surface]));
  /* The L2 rules by default, because they are the heuristics that need calibration. */
  const select = corpus.config.select && corpus.config.select.length > 0 ? corpus.config.select : rules.filter((r) => r.tier === "L2").map((r) => r.code);
  /* Each page is saved as index.html, so the page path of a rendered rule is "/". */
  const config = mergeConfig({ pages: { all: ["/"] } }, { ...corpus.config, select });
  const recorded = new Map(input.verdicts.map((v) => [keyOf(v), v]));

  let browser = input.browser;
  let ownBrowser = false;
  if (!browser && surfaces.includes("rendered")) {
    try {
      browser = await launchBrowser();
      ownBrowser = true;
    } catch {
      /* The run reports each rendered rule as not run, with the reason. */
      browser = undefined;
    }
  }

  const report: CalibrationReport = { limit: corpus.falseShareLimit, pages: [], rules: [], unjudged: [], notRun: [] };
  const tallies = new Map<string, RuleTally>();
  const tally = (code: string) => {
    let t = tallies.get(code);
    if (!t) {
      t = { code, findings: 0, trueFindings: 0, falseFindings: 0, unjudged: 0, falseShare: null, flagged: false };
      tallies.set(code, t);
    }
    return t;
  };

  try {
    for (const page of corpus.pages) {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-corpus-"));
      try {
        await preparePage(corpus, page, dir);
        const result = await lint({ rules, config, configDir: dir, paths: [dir], surfaces, select: [], ignore: [], ci: false, browser });
        for (const code of result.ran) tally(code);
        for (const n of result.notes) {
          if (n.kind === "not-run" || n.kind === "not-configured") {
            const reason = n.kind === "not-run" ? n.detail.join(", ") : `not configured: ${n.detail.join(", ")}`;
            report.notRun.push({ code: n.code, page: page.id, reason });
          }
        }
        for (const f of result.findings) {
          if (f.notRun) {
            report.notRun.push({ code: f.code, page: page.id, reason: f.message });
            continue;
          }
          const entry = { page: page.id, code: f.code, at: locationOf(f, surfaceOf.get(f.code)), message: f.message };
          const t = tally(f.code);
          t.findings += 1;
          const verdict = recorded.get(keyOf(entry))?.verdict ?? null;
          if (verdict === "true") t.trueFindings += 1;
          else if (verdict === "false") t.falseFindings += 1;
          else {
            t.unjudged += 1;
            report.unjudged.push({ ...entry, verdict: null });
          }
        }
        report.pages.push({ id: page.id });
      } catch (error) {
        report.pages.push({ id: page.id, error: error instanceof Error ? error.message : String(error) });
      } finally {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  } finally {
    if (ownBrowser) await browser?.close();
  }

  for (const t of tallies.values()) {
    const judged = t.trueFindings + t.falseFindings;
    t.falseShare = judged === 0 ? null : t.falseFindings / judged;
    t.flagged = report.limit !== null && t.falseShare !== null && t.falseShare > report.limit;
  }
  report.rules = [...tallies.values()].sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
  return report;
}

const percent = (share: number | null) => (share === null ? "-" : `${Math.round(share * 100)}%`);

export function formatCalibration(report: CalibrationReport): string[] {
  const lines: string[] = [];
  const width = Math.max(8, ...report.rules.map((r) => r.code.length + 1));
  lines.push(`${"rule".padEnd(width)}findings  false  unjudged  false share`);
  for (const r of report.rules) {
    const flag = r.flagged ? `  flagged: above the limit of ${percent(report.limit)}. Move it to a lower tier or to the judged list` : "";
    lines.push(`${r.code.padEnd(width)}${String(r.findings).padStart(8)}  ${String(r.falseFindings).padStart(5)}  ${String(r.unjudged).padStart(8)}  ${percent(r.falseShare).padStart(11)}${flag}`);
  }
  if (report.limit === null) lines.push("No limit of false findings is agreed, so no rule is flagged.");
  for (const p of report.pages.filter((p) => p.error)) lines.push(`page ${p.id} did not load: ${p.error}`);
  const notRun = new Map<string, number>();
  for (const n of report.notRun) notRun.set(`${n.code}: ${n.reason}`, (notRun.get(`${n.code}: ${n.reason}`) ?? 0) + 1);
  for (const [what, count] of notRun) lines.push(`not run on ${count} ${count === 1 ? "page" : "pages"}: ${what}`);
  if (report.unjudged.length > 0) lines.push(`${report.unjudged.length} findings have no verdict. Add them to the verdict record with --record.`);
  return lines;
}

/* The verdict record after a run: the recorded entries, then each new finding
   with a verdict of null for a person to fill in. */
export function mergeRecord(verdicts: Verdict[], report: CalibrationReport): Verdict[] {
  const known = new Set(verdicts.map(keyOf));
  return [...verdicts, ...report.unjudged.filter((v) => !known.has(keyOf(v)))];
}
