import { defineConfig } from "vitest/config";
import { designLintProjects } from "./packages/design-lint/vitest.projects";

/* Node environment only: the tests read the repository from disk and need no
   DOM. They live at the repository root, and the design-lint package keeps its
   own under packages/design-lint/test. */
export default defineConfig({
  test: {
    environment: "node",
    /* The rendered tests start a browser. */
    testTimeout: 120000,
    /* Closing a browser can wait on a busy machine. */
    hookTimeout: 60000,
    projects: [{ extends: true, test: { name: "repository", include: ["*.test.ts"] } }, ...designLintProjects("packages/design-lint")],
  },
});
