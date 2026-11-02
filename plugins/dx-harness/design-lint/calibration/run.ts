/* The calibration run. It lints each page of the corpus with the L2 rules, and
   prints, for each rule, the findings, the false ones, and the share of false
   findings. See docs/testing.md.

     pnpm --filter design-lint calibrate                     the corpus and the record in this folder
     pnpm --filter design-lint calibrate -- --record         also add each new finding to the record, unjudged
     pnpm --filter design-lint calibrate -- --corpus <file> --verdicts <file>
*/
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { calibrate, formatCalibration, loadCorpus, loadVerdicts, mergeRecord } from "../src/calibrate.ts";
import { loadRules } from "../src/rules/load.ts";
import type { Surface } from "../src/types.ts";

const here = import.meta.dirname;
const { values } = parseArgs({
  /* pnpm passes a literal "--" through to the script, so drop it. */
  args: process.argv.slice(2).filter((a) => a !== "--"),
  options: {
    corpus: { type: "string", default: path.join(here, "corpus.json") },
    verdicts: { type: "string", default: path.join(here, "verdicts.json") },
    rules: { type: "string", default: path.resolve(here, "../../standards/rules") },
    record: { type: "boolean", default: false },
    "no-rendered": { type: "boolean", default: false },
  },
});

const { rules, errors } = loadRules(values.rules);
if (errors.length > 0) {
  for (const e of errors) console.error(`error: ${e}`);
  process.exit(2);
}
const corpus = loadCorpus(values.corpus);
const verdicts = fs.existsSync(values.verdicts) ? loadVerdicts(values.verdicts) : [];
const surfaces: Surface[] = values["no-rendered"] ? ["source", "project"] : ["source", "project", "rendered"];

const report = await calibrate({ corpus, verdicts, rules, surfaces });
for (const line of formatCalibration(report)) console.log(line);
if (values.record) {
  fs.writeFileSync(values.verdicts, `${JSON.stringify(mergeRecord(verdicts, report), null, 2)}\n`);
  console.log(`Wrote ${path.relative(process.cwd(), values.verdicts)}. Set each verdict to "true" or "false".`);
}
