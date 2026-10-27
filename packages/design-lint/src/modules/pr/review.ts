import fs from "node:fs";
import path from "node:path";
import type { RuleModule } from "../../types.ts";

/* PR-1b: the recorded review date is not older than the interval. The date comes
   from reviewDateFile when that file exists and holds lastReviewDate, and from
   the config otherwise. The rule checks the recorded date, not the review. */

const DAY = 86_400_000;

export function reviewProblem(date: unknown, intervalDays: number, today: Date): string | null {
  const text = String(date);
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(Date.parse(text)) && new Date(text).toISOString().slice(0, 10) === text;
  if (!valid) return `The review date "${text}" is not a valid date. Write it as YYYY-MM-DD.`;
  const age = Math.floor((today.getTime() - Date.parse(text)) / DAY);
  if (age > intervalDays) return `The last review was ${age} days ago on ${text}, which is more than the interval of ${intervalDays} days. Review the service and update lastReviewDate.`;
  return null;
}

export const pr1b: RuleModule = {
  code: "PR-1b",
  surface: "project",
  locate({ root, params }) {
    let date: unknown = params.lastReviewDate;
    let source = "the config";
    const rel = String(params.reviewDateFile ?? "");
    if (rel) {
      const file = path.join(root, rel);
      if (fs.existsSync(file)) {
        try {
          const record = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
          if (record.lastReviewDate !== undefined) {
            date = record.lastReviewDate;
            source = rel;
          }
        } catch {
          return [{ file: root, line: 1, column: 1, data: { problem: `${rel} is not valid JSON.` } }];
        }
      }
    }
    const problem = reviewProblem(date, Number(params.reviewIntervalDays), new Date());
    return [{ file: root, line: 1, column: 1, data: { problem: problem && source !== "the config" ? `${problem} Read from ${source}.` : problem } }];
  },
  decide(candidate) {
    return (candidate.data as { problem: string | null }).problem;
  },
};
