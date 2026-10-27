import fs from "node:fs";
import path from "node:path";
import { collectFiles } from "./files.ts";
import { modules } from "./registry.ts";
import type { Browser } from "playwright-core";
import { run } from "./run.ts";
import type { RunResult } from "./run.ts";
import type { Config, RuleMeta, Surface } from "./types.ts";

export interface LintInput {
  rules: RuleMeta[];
  config: Config | null;
  /* The directory of the config file. config.serve is relative to it. */
  configDir: string;
  paths: string[];
  surfaces: Surface[];
  select: string[];
  ignore: string[];
  ci: boolean;
  /* A browser that the caller owns. The run uses it and does not close it. */
  browser?: Browser;
}

/* The directory that the rendered rules serve: config.serve, or the first path. */
export function projectRoot(input: Pick<LintInput, "config" | "configDir" | "paths">): string {
  if (input.config?.serve) return path.resolve(input.configDir, input.config.serve);
  const first = path.resolve(input.paths[0] ?? ".");
  return fs.statSync(first).isDirectory() ? first : path.dirname(first);
}

export function lint(input: LintInput): Promise<RunResult> {
  const select = input.select.length > 0 ? input.select : (input.config?.select ?? []);
  return run(input.rules, modules, input.config, {
    surfaces: input.surfaces,
    select,
    ignore: input.ignore,
    ci: input.ci,
    files: collectFiles(input.paths.map((p) => path.resolve(p))),
    root: projectRoot(input),
    waitUntil: input.config?.render?.waitUntil,
    browser: input.browser,
  });
}
