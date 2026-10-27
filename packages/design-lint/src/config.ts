import fs from "node:fs";
import path from "node:path";
import type { Config, Params, RuleMeta } from "./types.ts";

/* A page parameter in a rule file reads the page group of the same meaning in
   the config. See lint/config.md. */
export const PAGE_GROUPS: Record<string, string> = {
  pages: "all",
  entryPages: "entry",
  authenticatedPages: "authenticated",
  loginPages: "login",
  startPages: "start",
  successPages: "success",
  failurePages: "failure",
  paymentPages: "payment",
  transactionalPages: "transactional",
  errorPages: "error",
};

const union = (a: string[] = [], b: string[] = []) => [...new Set([...a, ...b])];

/* The later config wins. select and each page group are unions, so a fragment adds
   to them. product and render merge by key. rules merge by rule, and by parameter
   within a rule. serve and extends belong to the file that sets them. */
export function mergeConfig(base: Config, over: Config): Config {
  const pages: Record<string, string[]> = { ...base.pages };
  for (const [group, list] of Object.entries(over.pages ?? {})) pages[group] = union(pages[group], list);
  const rules: Record<string, Params> = { ...base.rules };
  for (const [code, params] of Object.entries(over.rules ?? {})) rules[code] = { ...rules[code], ...params };
  return {
    ...base,
    ...over,
    select: union(base.select, over.select),
    product: { ...base.product, ...over.product },
    render: { ...base.render, ...over.render },
    pages,
    flows: { ...base.flows, ...over.flows },
    rules,
  };
}

/* A config can list other config files in extends, as paths relative to itself.
   Each is loaded first, in order, and this file is merged over them. The page
   lists of this file keep their place at the start of each group. */
export function loadConfig(file: string): Config | null {
  if (!fs.existsSync(file)) return null;
  const parsed: unknown = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${file}: the config is not an object`);
  }
  const own = parsed as Config;
  let merged: Config = {};
  for (const ref of own.extends ?? []) {
    const target = path.resolve(path.dirname(file), ref);
    const extended = loadConfig(target);
    if (!extended) throw new Error(`${file}: extends ${ref}, which does not exist`);
    merged = mergeConfig(merged, extended);
  }
  const { extends: _extends, ...rest } = own;
  const result = mergeConfig(merged, rest);
  /* The page lists of this file come first. The first page is the reference for a
     rule that compares pages, and the home page is the one that a file names first. */
  for (const [group, list] of Object.entries(rest.pages ?? {})) {
    result.pages![group] = union(list, result.pages![group]);
  }
  return result;
}

export interface Resolved {
  values: Params;
  /* Parameters that no layer sets. The rule reports "not configured". */
  unset: string[];
  /* Overrides that the runner ignored because the rule is L0. */
  skippedOverrides: string[];
}

/* The first value wins, in this order: rules.R.P, product.P, the page group,
   the default in the rule file. A default of null is not a value. */
export function resolveParameters(rule: RuleMeta, config: Config | null): Resolved {
  const values: Params = {};
  const unset: string[] = [];
  const skippedOverrides: string[] = [];
  const override = config?.rules?.[rule.code] ?? {};
  const l0 = rule.tier === "L0";
  if (l0) skippedOverrides.push(...Object.keys(override));

  for (const [name, fallback] of Object.entries(rule.parameters)) {
    let value: unknown;
    if (!l0 && name in override) value = override[name];
    else if (config?.product && name in config.product) value = config.product[name];
    else if (name in PAGE_GROUPS && config?.pages?.[PAGE_GROUPS[name]] !== undefined) {
      value = config.pages[PAGE_GROUPS[name]];
    } else value = fallback;

    if (value === null || value === undefined) unset.push(name);
    else values[name] = value;
  }
  return { values, unset, skippedOverrides };
}
