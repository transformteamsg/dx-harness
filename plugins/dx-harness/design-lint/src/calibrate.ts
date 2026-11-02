import type { Browser } from "playwright-core";
import type { Config, RuleMeta, Surface } from "./types.ts";

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

export function loadCorpus(_file: string): Corpus {
  throw new Error("not implemented");
}

export function loadVerdicts(_file: string): Verdict[] {
  throw new Error("not implemented");
}

export async function calibrate(_input: CalibrationInput): Promise<CalibrationReport> {
  throw new Error("not implemented");
}

export function formatCalibration(_report: CalibrationReport): string[] {
  throw new Error("not implemented");
}
