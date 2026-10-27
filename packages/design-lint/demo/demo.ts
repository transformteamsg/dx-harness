/* The live demo, in four steps. It works on a copy of the site, so the site
   itself never changes.

     pnpm --filter design-lint demo -- BD-1a        break one rule and show it
     pnpm --filter design-lint demo -- BD-1b        a rendered rule: needs a browser
     pnpm --filter design-lint demo -- BD-1a --all  run every rule, not only the rule of the patch
*/
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { applyPatch, patchedConfig, readPatch } from "../src/patch.ts";
import { loadConfig } from "../src/config.ts";

/* pnpm passes a literal "--" through to the script, so skip it. */
const code = process.argv.slice(2).find((a) => a !== "--");
const here = import.meta.dirname;
const patchFile = code ? path.join(here, "patches", `${code}.json`) : "";
if (!code || !fs.existsSync(patchFile)) {
  const known = fs.readdirSync(path.join(here, "patches")).map((f) => path.basename(f, ".json"));
  console.error(`Usage: demo <rule code>. Rules with a patch: ${known.join(", ")}`);
  process.exit(2);
}

const work = path.join(here, ".work");
const site = path.join(work, "site");
const cli = path.resolve(here, "../src/cli.ts");

function reset() {
  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work, { recursive: true });
  fs.cpSync(path.join(here, "site"), site, { recursive: true });
  fs.copyFileSync(path.join(here, "design-lint.config.json"), path.join(work, "design-lint.config.json"));
  fs.cpSync(path.join(here, "config.d"), path.join(work, "config.d"), { recursive: true });
}

/* The exit code and the number of findings. An L2 rule prints a finding and
   still exits 0, because it only warns. */
function lint(): { status: number; findings: number } {
  /* Only the rules that the patch names. A run of every rule on the whole site takes
     about a minute, and the demo shows one rule. Pass --all to run every rule. */
  const select = all ? [] : codes.flatMap((c) => ["--select", c]);
  const args = [cli, site, "--rendered", "--config", path.join(work, "design-lint.config.json"), ...select];
  console.log(`\n$ design-lint ${path.relative(process.cwd(), site)} --rendered ${select.join(" ")}`.trimEnd());
  const r = spawnSync(process.execPath, args, { encoding: "utf8" });
  const text = `${r.stdout}${r.stderr}`.trim();
  console.log(text === "" ? "(no output)" : text);
  console.log(`exit code: ${r.status}`);
  return { status: r.status ?? 2, findings: (text.match(/ \[L[012]\] /g) ?? []).length };
}

const step = (n: number, text: string) => console.log(`\n== Step ${n}: ${text}`);

const patch = readPatch(patchFile);
const all = process.argv.includes("--all");
const codes = [...new Set([patch.code, ...patch.expect.map((e) => e.code ?? patch.code)])];

reset();
step(1, "The passing site");
const before = lint();

step(2, `Break one rule: ${patch.describe}`);
applyPatch(site, patch);
if (patch.config) {
  /* A patch that sets config values writes the merged config next to the site. */
  const file = path.join(work, "design-lint.config.json");
  const merged = patchedConfig(loadConfig(file)!, patch);
  fs.writeFileSync(file, JSON.stringify({ ...merged, extends: undefined }, null, 2));
}
const broken = lint();

step(3, "The pre-commit hook");
if (broken.status !== 0) console.log(`The linter exits ${broken.status}, so the pre-commit hook stops the commit.`);
else if (broken.findings > 0) console.log("The linter exits 0, because this rule is tier L2 and only warns. The commit goes through, and the warning shows.");
else console.log("The linter finds nothing. This patch did not break the rule.");

step(4, "Restore the page");
reset();
const after = lint();

fs.rmSync(work, { recursive: true, force: true });
const ok = before.status === 0 && before.findings === 0 && broken.findings > 0 && after.status === 0 && after.findings === 0;
console.log(`\n${ok ? "The demo behaved as expected." : "The demo did NOT behave as expected."}`);
process.exit(ok ? 0 : 1);
