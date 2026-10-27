import fs from "node:fs";
import path from "node:path";
import { readPages } from "../project.ts";
import type { RuleModule } from "../types.ts";

/* BD-6a: the declared design system is imported. The value is a stylesheet path
   or a package name. */

const CODE = /\.(?:[cm]?[jt]sx?|vue|svelte)$/;

export const bd6a: RuleModule = {
  code: "BD-6a",
  surface: "project",

  locate({ files, root, params }) {
    const system = String(params.designSystem).trim();
    let problem: string | null = null;

    if (/\.css$/i.test(system)) {
      const sheet = path.join(root, system);
      if (!fs.existsSync(sheet)) problem = `The design system stylesheet ${system} does not exist.`;
      else {
        const linked = readPages(files).some((p) =>
          p.els.some((e) => e.tag === "link" && e.attrs.rel?.toLowerCase() === "stylesheet" && path.basename(e.attrs.href ?? "") === path.basename(system)),
        );
        const imported = files.filter((f) => /\.css$/i.test(f)).some((f) => new RegExp(`@import[^;]*${path.basename(system)}`).test(fs.readFileSync(f, "utf8")));
        if (!linked && !imported) problem = `No page links the design system stylesheet ${system}.`;
      }
    } else {
      const pkgFile = path.join(root, "package.json");
      const deps = fs.existsSync(pkgFile)
        ? (() => {
            const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8")) as Record<string, Record<string, string> | undefined>;
            return { ...pkg.dependencies, ...pkg.devDependencies };
          })()
        : {};
      if (!(system in deps)) problem = `The design system package ${system} is not in the dependencies.`;
      else if (!files.filter((f) => CODE.test(f)).some((f) => fs.readFileSync(f, "utf8").includes(system))) {
        problem = `No source file imports the design system package ${system}.`;
      }
    }
    return [{ file: root, line: 1, column: 1, data: { problem } }];
  },

  decide(candidate) {
    return (candidate.data as { problem: string | null }).problem;
  },
};
