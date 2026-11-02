import os from "node:os";
import { resolveParameters } from "./config.ts";
import type { Browser } from "playwright-core";
import { startSession } from "./rendered.ts";
import type { Session } from "./rendered.ts";
import type { Config, Finding, Note, Params, Preset, RenderedSession, RuleMeta, RuleModule, Surface } from "./types.ts";

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
  /* How many rendered rules run at the same time. The default suits the machine. */
  lanes?: number;
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

/* A rule that passed its checks and runs, with the findings that it makes. */
interface Job {
  rule: RuleMeta;
  module: RuleModule;
  values: Params;
  findings: Finding[];
}

/* Half the cores, from two to four. On the demo site, six lanes were no faster
   than four, because the browser processes then compete for the cores. */
function defaultLanes(): number {
  return Math.max(2, Math.min(4, Math.floor(os.availableParallelism() / 2)));
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

  const jobs: Job[] = [];
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
    const module = byCode.get(rule.code);
    if (unset.length === 0 && module?.unconfigured) unset.push(...module.unconfigured(values));
    if (unset.length > 0) {
      result.notes.push({ code: rule.code, kind: "not-configured", detail: unset });
      continue;
    }
    if (!module) {
      result.notes.push({ code: rule.code, kind: "no-module", detail: [] });
      result.skipped.push(rule.code);
      continue;
    }
    if (rule.surface === "rendered" && !(await getSession())) {
      result.notes.push({ code: rule.code, kind: "not-run", detail: [sessionError ?? "no browser"] });
      continue;
    }
    result.ran.push(rule.code);
    jobs.push({ rule, module, values, findings: [] });
  }

  const check = async (job: Job, rendered?: RenderedSession) => {
    const context = { files: options.files, root: options.root, params: job.values, rendered };
    for (const candidate of await job.module.locate(context)) {
      const message = job.module.decide(candidate, job.values);
      if (message !== null) {
        job.findings.push({
          code: job.rule.code,
          tier: job.rule.tier,
          file: candidate.file,
          line: candidate.line,
          column: candidate.column,
          ...(candidate.element ? { element: candidate.element } : {}),
          message,
          ...(candidate.notRun ? { notRun: true as const } : {}),
        });
      }
    }
  };
  const rendered = jobs.filter((j) => j.rule.surface === "rendered");
  for (const job of jobs.filter((j) => j.rule.surface !== "rendered")) await check(job);
  /* The rendered rules run in lanes, and each lane takes the next rule when it
     is free. The rules that interact go first, because they take the longest. */
  const queue = rendered.filter((j) => !j.module.runsAlone);
  queue.sort((a, b) => Number(Boolean(b.module.interacts)) - Number(Boolean(a.module.interacts)));
  const lanes = Math.min(options.lanes ?? defaultLanes(), queue.length);
  await Promise.all(
    Array.from({ length: lanes }, async () => {
      const lane = session!.lane();
      for (let job = queue.shift(); job; job = queue.shift()) {
        await check(job, lane);
        await lane.release();
      }
    }),
  );
  for (const job of rendered.filter((j) => j.module.runsAlone)) await check(job, session!);
  /* The findings keep the order of the rules, whatever order the rules finished in. */
  for (const job of jobs) result.findings.push(...job.findings);
  if (session) await (session as Session).close();
  return result;
}
