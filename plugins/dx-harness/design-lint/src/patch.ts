import fs from "node:fs";
import path from "node:path";
import { mergeConfig } from "./config.ts";
import type { Config } from "./types.ts";

/* A break patch: the smallest change that makes one rule fail. */
export interface Patch {
  code: string;
  describe: string;
  /* An edit names one file, or a glob of files. A glob edit replaces the text in
     every matching file that holds it, and needs at least one such file. */
  edits: { file?: string; files?: string; find: string; replace: string }[];
  /* Config values that the patch sets, merged over the config of the site. Use it
     when the failure is a product choice, not a change to a page. */
  config?: Config;
  /* line and column are optional. A rendered finding has the page as its file.
     code is the rule of the finding. It defaults to the code of the patch, and
     names another rule when the patch also breaks that rule. */
  expect: { file: string; line?: number; column?: number; code?: string }[];
  /* The patch conflicts with others, so the failing site leaves it out. */
  exclusive?: boolean;
}

export function readPatch(file: string): Patch {
  return JSON.parse(fs.readFileSync(file, "utf8")) as Patch;
}

function filesUnder(dir: string, rel = ""): string[] {
  return fs.readdirSync(path.join(dir, rel), { withFileTypes: true }).flatMap((e) => {
    const next = path.join(rel, e.name);
    return e.isDirectory() ? filesUnder(dir, next) : [next];
  });
}

/* Each edit is an exact text replacement. A single-file edit fails when the text
   occurs other than once, so a patch never changes nothing, or too much, without a
   signal. A glob edit fails when no file matches. Returns the files that changed,
   relative to the site. */
export function applyPatch(siteDir: string, patch: Patch): string[] {
  const changed = new Set<string>();
  for (const edit of patch.edits) {
    if (edit.files !== undefined) {
      const hits = filesUnder(siteDir).filter((f) => path.matchesGlob(f, edit.files as string));
      let n = 0;
      for (const f of hits) {
        const target = path.join(siteDir, f);
        const text = fs.readFileSync(target, "utf8");
        const count = text.split(edit.find).length - 1;
        if (count === 0) continue;
        if (count !== 1) throw new Error(`${patch.code}: "${f}" has ${count} matches for the text to replace, and a patch needs exactly 1 in each file`);
        fs.writeFileSync(target, text.replace(edit.find, () => edit.replace));
        changed.add(f);
        n++;
      }
      if (n === 0) throw new Error(`${patch.code}: no file that matches "${edit.files}" holds the text to replace`);
      continue;
    }
    const target = path.join(siteDir, edit.file as string);
    const text = fs.readFileSync(target, "utf8");
    const count = text.split(edit.find).length - 1;
    if (count !== 1) {
      throw new Error(`${patch.code}: "${edit.file}" has ${count} matches for the text to replace, and a patch needs exactly 1`);
    }
    fs.writeFileSync(target, text.replace(edit.find, () => edit.replace));
    changed.add(edit.file as string);
  }
  return [...changed];
}

/* The config of the site with the config values of the patch merged over it. */
export function patchedConfig(config: Config, patch: Patch): Config {
  return patch.config ? mergeConfig(config, patch.config) : config;
}
