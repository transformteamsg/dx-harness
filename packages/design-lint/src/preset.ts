import fs from "node:fs";
import path from "node:path";
import { isMap, isScalar, isSeq, LineCounter, parseDocument } from "yaml";
import type { Node } from "yaml";
import type { Params, Preset } from "./types.ts";

const KEYS = new Set(["name", "parameters", "rules", "ignore"]);

const isPlainMap = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

/* Reads the preset <dir>/<name>.md. The frontmatter holds the values, and the body
   is for people. A preset that does not exist, or that is not valid, throws, so the
   command stops with exit code 2. */
export function loadPreset(name: string, dir: string): Preset {
  const file = path.join(dir, `${name}.md`);
  if (!fs.existsSync(file)) throw new Error(`preset "${name}" does not exist: there is no ${file}`);
  const match = /^---\n([\s\S]*?)\n---\n/.exec(fs.readFileSync(file, "utf8"));
  if (!match) throw new Error(`${file}: no frontmatter`);

  const lineCounter = new LineCounter();
  const doc = parseDocument(match[1], { lineCounter });
  if (doc.errors.length > 0) throw new Error(`${file}: ${doc.errors[0].message}`);
  const fm: unknown = doc.toJS();
  if (!isPlainMap(fm)) throw new Error(`${file}: frontmatter is not a map`);

  const errors: string[] = [];
  for (const key of Object.keys(fm)) {
    if (!KEYS.has(key)) errors.push(`${file}: "${key}" is not a preset key. A preset sets parameters, rules, and ignore`);
  }
  if (fm.name !== name) errors.push(`${file}: name "${String(fm.name)}" does not match the file name`);
  const parameters = fm.parameters ?? {};
  if (!isPlainMap(parameters)) errors.push(`${file}: parameters is not a map`);
  const rules = fm.rules ?? {};
  if (!isPlainMap(rules) || !Object.values(rules).every(isPlainMap)) {
    errors.push(`${file}: rules is not a map of rule codes to parameter maps`);
  }
  const ignore = fm.ignore ?? [];
  if (!Array.isArray(ignore) || !ignore.every((code) => typeof code === "string")) {
    errors.push(`${file}: ignore is not a list of rule codes`);
  }
  if (errors.length > 0) throw new Error(errors.join("\n"));

  /* Line 1 of the file is the opening ---, so a frontmatter line is one more in the file. */
  const lineOf = (node: unknown) =>
    isScalar(node) || isMap(node) || isSeq(node) ? lineCounter.linePos((node as Node).range![0]).line + 1 : 0;
  const lines: Record<string, number> = {};
  const ignoreNode = doc.get("ignore", true);
  if (isSeq(ignoreNode)) {
    for (const item of ignoreNode.items) if (isScalar(item)) lines[`ignore ${String(item.value)}`] = lineOf(item);
  }
  const rulesNode = doc.get("rules", true);
  if (isMap(rulesNode)) {
    for (const rule of rulesNode.items) {
      if (!isScalar(rule.key) || !isMap(rule.value)) continue;
      for (const param of rule.value.items) {
        if (isScalar(param.key)) lines[`rules.${String(rule.key.value)}.${String(param.key.value)}`] = lineOf(param.key);
      }
    }
  }

  return {
    name,
    file,
    parameters: parameters as Params,
    rules: rules as Record<string, Params>,
    ignore: ignore as string[],
    lines,
  };
}
