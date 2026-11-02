import fs from "node:fs";
import path from "node:path";
import { loadConfig, resolveParameters } from "./config.ts";
import { collectFiles, isHtml } from "./files.ts";
import { loadPreset } from "./preset.ts";
import { summariseUnset } from "./report.ts";
import type { Config, Note, RuleMeta } from "./types.ts";

/* The page path of each HTML file under root: index.html is its folder, and any
   other file is its own path. The home page comes first, because a rule that
   compares pages takes the first page as the reference. */
export function findPages(root: string): string[] {
  const pages = collectFiles([root])
    .filter(isHtml)
    .map((file) => {
      const rel = path.relative(root, file).split(path.sep).join("/");
      const dir = path.posix.dirname(rel);
      if (/^index\.html?$/i.test(path.posix.basename(rel))) return dir === "." ? "/" : `/${dir}/`;
      return `/${rel}`;
    });
  return pages.includes("/") ? ["/", ...pages.filter((p) => p !== "/")] : pages;
}

/* A page list as the designer types it: paths separated by commas or spaces. */
export function parsePageList(answer: string): string[] {
  return answer
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((p) => (p.startsWith("/") ? p : `/${p}`));
}

export type Ask = (question: string) => Promise<string>;

export interface InitInput {
  /* The folder that holds the pages. */
  root: string;
  configFile: string;
  rules: RuleMeta[];
  presets: string;
  ask: Ask;
  print: (line: string) => void;
}

/* Finds the pages, asks for the values that it cannot find, and writes the
   config. A value that the config already holds, in the file or in a file that it
   extends, stays as it is. Only the keys that are missing are added. */
export async function init(input: InitInput): Promise<void> {
  const { root, configFile, print } = input;
  const own: Config = fs.existsSync(configFile) ? (JSON.parse(fs.readFileSync(configFile, "utf8")) as Config) : {};
  const held = loadConfig(configFile) ?? {};

  if (held.pages?.all === undefined) {
    let pages = findPages(root);
    if (pages.length > 0) {
      print(`Found ${pages.length} ${pages.length === 1 ? "page" : "pages"}: ${pages.join(", ")}`);
    } else {
      print(`Found no pages in ${root}. design-lint init reads static HTML files only.`);
      pages = parsePageList(await input.ask("List the pages, as paths separated by commas, or leave blank to skip: "));
    }
    if (pages.length > 0) own.pages = { ...own.pages, all: pages };
  }

  if (held.product?.serviceType === undefined) {
    const answer = (
      await input.ask("Service type, such as website, transactional, mobile-app, or single-page, or leave blank to skip: ")
    ).trim();
    if (answer !== "") own.product = { ...own.product, serviceType: answer };
  }

  fs.writeFileSync(configFile, `${JSON.stringify(own, null, 2)}\n`);
  print(`Wrote ${configFile}.`);

  const config = loadConfig(configFile);
  const preset = config?.preset ? loadPreset(config.preset, input.presets) : null;
  const notes: Note[] = input.rules.flatMap((rule) => {
    const { unset } = resolveParameters(rule, config, preset);
    return unset.length > 0 ? [{ code: rule.code, kind: "not-configured" as const, detail: unset }] : [];
  });
  const lines = summariseUnset(notes, input.rules, "Set these values in the config:");
  for (const line of lines.length > 0 ? lines : ["Every rule has the values that it needs."]) print(line);
}
