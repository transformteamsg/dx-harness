import { resolveParameters } from "./config.ts";
import type { Browser } from "playwright-core";
import { startSession } from "./rendered.ts";
import type { Session } from "./rendered.ts";
import type { Config, Finding, Note, Preset, RuleMeta, RuleModule, Surface } from "./types.ts";

export interface RunOptions {
  surfaces: Surface[];
  select: string[];
  ignore: string[];
  ci: boolean;
  files: string[];
  /* The project root, and the directory that the rendered rules serve. */
  root: string;
  waitUntil?: "load" | "networkidle";
  browser?: Browser;
  /* The domain preset that the config names. */
  preset?: Preset | null;
}

export interface RunResult {
  findings: Finding[];
  notes: Note[];
  ran: string[];
  skipped: string[];
}

/* A selector is a rule code, or a category prefix such as "BD". */
function matches(code: string, selectors: string[]): boolean {
  return selectors.some((s) => code === s || code.startsWith(`${s}-`));
}

export async function run(
  rules: RuleMeta[],
  modules: RuleModule[],
  config: Config | null,
  options: RunOptions,
): Promise<RunResult> {
  const result: RunResult = { findings: [], notes: [], ran: [], skipped: [] };
  const byCode = new Map(modules.map((m) => [m.code, m]));
  let session: Session | null = null;
  let sessionError: string | null = null;
  /* The browser starts once, on the first rendered rule that has a module. */
  const getSession = async (): Promise<Session | null> => {
    if (session || sessionError) return session;
    try {
      session = await startSession(options.root, options.waitUntil, options.browser);
    } catch (error) {
      sessionError = error instanceof Error ? error.message : String(error);
    }
    return session;
  };

  for (const rule of rules) {
    if (options.select.length > 0 && !matches(rule.code, options.select)) continue;
    /* An L0 rule ignores --ignore and the ignore list of the preset. */
    const preset = options.preset;
    const presetIgnores = preset ? preset.ignore.filter((s) => matches(rule.code, [s])) : [];
    if (rule.tier !== "L0" && (matches(rule.code, options.ignore) || presetIgnores.length > 0)) continue;
    if (!options.surfaces.includes(rule.surface)) continue;
    if (rule.parameters.runOn === "ci" && !options.ci) continue;

    const { values, unset, skippedPresetLines } = resolveParameters(rule, config, preset);
    const skippedLines = [
      ...presetIgnores.map((s) => `${preset!.file}:${preset!.lines[`ignore ${s}`]} ignore ${s}`),
      ...skippedPresetLines,
    ];
    if (skippedLines.length > 0) result.notes.push({ code: rule.code, kind: "skipped", detail: skippedLines });
    if (unset.length > 0) {
      result.notes.push({ code: rule.code, kind: "not-configured", detail: unset });
      continue;
    }
    const module = byCode.get(rule.code);
    if (!module) {
      result.notes.push({ code: rule.code, kind: "no-module", detail: [] });
      result.skipped.push(rule.code);
      continue;
    }
    let rendered: Session | undefined;
    if (rule.surface === "rendered") {
      rendered = (await getSession()) ?? undefined;
      if (!rendered) {
        result.notes.push({ code: rule.code, kind: "not-run", detail: [sessionError ?? "no browser"] });
        continue;
      }
    }
    result.ran.push(rule.code);
    const context = { files: options.files, root: options.root, params: values, rendered };
    for (const candidate of await module.locate(context)) {
      const message = module.decide(candidate, values);
      if (message !== null) {
        result.findings.push({
          code: rule.code,
          tier: rule.tier,
          file: candidate.file,
          line: candidate.line,
          column: candidate.column,
          message,
        });
      }
    }
  }
  if (session) await (session as Session).close();
  return result;
}
