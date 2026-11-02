import path from "node:path";
import { createInterface } from "node:readline";
import { parseArgs } from "node:util";
import { loadConfig, resolveParameters } from "./config.ts";
import { init } from "./init.ts";
import type { Ask } from "./init.ts";
import { lint } from "./lint.ts";
import { loadPreset } from "./preset.ts";
import { modules } from "./registry.ts";
import { exitCode, formatFinding, formatNote, summariseUnset } from "./report.ts";
import { loadRules } from "./rules/load.ts";
import type { Surface } from "./types.ts";

/* The rule files and the presets are the plugin's own, beside this package. */
const DEFAULT_RULES = path.resolve(import.meta.dirname, "../../standards/rules");
const DEFAULT_PRESETS = path.resolve(import.meta.dirname, "../../standards/presets");

const USAGE = `design-lint [path...]          Run the source and project rules
design-lint --rendered         Add the rendered rules
design-lint --ci               Add the rules that run only in CI
design-lint list               List the rules and their status
design-lint init [dir]         Find the pages and write design-lint.config.json

Options: --json  --select <code|category>  --ignore <code|category>
         --config <file>  --rules <dir>  --presets <dir>  --help`;

async function main(argv: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      rendered: { type: "boolean", default: false },
      ci: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      select: { type: "string", multiple: true, default: [] },
      ignore: { type: "string", multiple: true, default: [] },
      config: { type: "string", default: "design-lint.config.json" },
      rules: { type: "string", default: DEFAULT_RULES },
      presets: { type: "string", default: DEFAULT_PRESETS },
      help: { type: "boolean", default: false },
    },
  });
  if (values.help) {
    console.log(USAGE);
    return 0;
  }

  const [first, ...rest] = positionals;
  const { rules, errors } = loadRules(values.rules);
  if (errors.length > 0) {
    for (const e of errors) console.error(`error: ${e}`);
    return 2;
  }

  if (first === "init") {
    const lines = createInterface({ input: process.stdin });
    try {
      await init({
        root: path.resolve(rest[0] ?? "."),
        configFile: path.resolve(values.config),
        rules,
        presets: values.presets,
        ask: asker(lines),
        print: (line) => console.log(line),
      });
    } finally {
      lines.close();
    }
    return 0;
  }
  const config = loadConfig(values.config);
  const preset = config?.preset ? loadPreset(config.preset, values.presets) : null;

  if (first === "list") {
    const registered = new Set(modules.map((m) => m.code));
    const width = Math.max(8, ...rules.map((r) => r.code.length + 1));
    for (const rule of rules) {
      const { unset } = resolveParameters(rule, config, preset);
      const status = registered.has(rule.code) ? "module" : "no module";
      const need = unset.length > 0 ? `  unset: ${unset.join(", ")}` : "";
      console.log(`${rule.code.padEnd(width)}${rule.tier}  ${rule.surface.padEnd(9)}${status}${need}`);
    }
    return 0;
  }

  const surfaces: Surface[] = ["source", "project"];
  if (values.rendered) surfaces.push("rendered");
  const result = await lint({
    rules,
    config,
    preset,
    configDir: path.dirname(path.resolve(values.config)),
    paths: first === undefined ? ["."] : [first, ...rest],
    surfaces,
    select: values.select,
    ignore: values.ignore,
    ci: values.ci,
  });
  const tiers = new Map(rules.map((r) => [r.code, r.tier]));
  const code = exitCode(result.findings, result.notes, tiers);

  if (values.json) {
    console.log(JSON.stringify({ findings: result.findings, notes: result.notes }, null, 2));
    return code;
  }
  for (const line of summariseUnset(result.notes, rules)) console.log(line);
  /* A source or project finding names a file. Print it relative to the working
     directory. A rendered finding names a page path, which stays as it is. */
  const surfaceOf = new Map(rules.map((r) => [r.code, r.surface]));
  for (const f of result.findings) {
    const file = surfaceOf.get(f.code) === "rendered" ? f.file : path.relative(process.cwd(), f.file) || ".";
    console.log(formatFinding({ ...f, file }));
  }
  for (const n of result.notes) {
    if (n.kind !== "no-module" && n.kind !== "not-configured") console.log(formatNote(n));
  }
  const pending = result.notes.filter((n) => n.kind === "no-module").length;
  if (pending > 0) console.log(`note: ${pending} rules have no linter module yet`);
  return code;
}

/* Each answer is one line of stdin. Lines that arrive before their question,
   as from a pipe, wait in a queue. At the end of the input, an answer is blank. */
function asker(lines: ReturnType<typeof createInterface>): Ask {
  const queue: string[] = [];
  const waiting: ((line: string) => void)[] = [];
  let ended = false;
  lines.on("line", (line) => (waiting.length > 0 ? waiting.shift()!(line) : queue.push(line)));
  lines.on("close", () => {
    ended = true;
    for (const resolve of waiting.splice(0)) resolve("");
  });
  /* A terminal echoes the answer and its line break. A pipe does not. */
  const echo = (answer: string) => {
    if (!process.stdin.isTTY) process.stdout.write("\n");
    return answer;
  };
  return async (question) => {
    process.stdout.write(question);
    if (queue.length > 0) return echo(queue.shift()!);
    if (ended) return echo("");
    return echo(await new Promise<string>((resolve) => waiting.push(resolve)));
  };
}

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    console.error(`error: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 2;
  },
);
