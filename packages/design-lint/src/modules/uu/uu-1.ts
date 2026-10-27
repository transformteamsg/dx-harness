import fs from "node:fs";
import path from "node:path";
import type { RuleModule } from "../../types.ts";

/* UU-1c: a research record exists at researchRecordPath, relative to the
   project root, and is not empty. It tests presence, not quality. */
export const uu1c: RuleModule = {
  code: "UU-1c",
  surface: "project",

  locate({ root, params }) {
    const file = path.join(root, String(params.researchRecordPath));
    const exists = fs.existsSync(file) && fs.statSync(file).isFile();
    const empty = exists ? fs.readFileSync(file, "utf8").trim() === "" : false;
    return [{ file: exists ? file : root, line: 1, column: 1, data: { exists, empty } }];
  },

  decide(candidate, params) {
    const { exists, empty } = candidate.data as { exists: boolean; empty: boolean };
    if (!exists) return `No research record at ${String(params.researchRecordPath)}. Add one.`;
    return empty ? `The research record at ${String(params.researchRecordPath)} is empty.` : null;
  },
};
