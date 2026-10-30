import fs from "node:fs";
import path from "node:path";
import type { TestProjectInlineConfiguration } from "vitest/config";

declare module "vitest" {
  interface ProvidedContext {
    /* The category folder, such as bd, whose tests a project of test/category.test.ts runs. */
    category: string;
  }
}

const RULES = path.resolve(import.meta.dirname, "../../plugins/dx-harness/standards/rules");

/* The projects of the design-lint tests. Vitest runs the files of each project
   in a worker of their own, so each category folder gets a project that runs
   test/category.test.ts for that category, and with it a browser of its own. A
   new category folder gets a project with no change here. */
export function designLintProjects(): TestProjectInlineConfiguration[] {
  const categories = fs
    .readdirSync(RULES, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  const file = "test/category.test.ts";
  return [
    { extends: true, test: { name: "design-lint", include: ["test/**/*.test.ts"], exclude: [file] } },
    ...categories.map((category) => ({
      extends: true as const,
      test: { name: `design-lint:${category}`, include: [file], provide: { category } },
    })),
  ];
}
