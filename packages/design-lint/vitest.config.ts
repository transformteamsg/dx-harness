import { defineConfig } from "vitest/config";
import { designLintProjects } from "./vitest.projects.ts";

/* Node environment only: the tests read rule files from disk and need no DOM. */
export default defineConfig({
  test: {
    environment: "node",
    /* The rendered tests start a browser. */
    testTimeout: 120000,
    /* Closing a browser can wait on a busy machine. */
    hookTimeout: 60000,
    projects: designLintProjects("."),
  },
});
