import fs from "node:fs";
import path from "node:path";

const SKIP = new Set(["node_modules", ".git", "dist", ".work"]);

/* Every file under the given paths. A path that is a file stands for itself. */
export function collectFiles(paths: string[]): string[] {
  const out: string[] = [];
  const walk = (p: string) => {
    const stat = fs.statSync(p);
    if (!stat.isDirectory()) {
      out.push(p);
      return;
    }
    for (const entry of fs.readdirSync(p).sort()) {
      if (!SKIP.has(entry)) walk(path.join(p, entry));
    }
  };
  for (const p of paths) walk(p);
  return out;
}

export const isHtml = (file: string) => /\.html?$/i.test(file);
