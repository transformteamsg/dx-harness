import { defineConfig } from "vitest/config";

/* Node environment only: the tests read rule files from disk and need no DOM. */
export default defineConfig({
  test: {
    environment: "node",
    /* The rendered tests start a browser. */
    testTimeout: 120000,
    /* Closing a browser can wait on a busy machine. */
    hookTimeout: 60000,
    include: ["test/**/*.test.ts"],
  },
});
