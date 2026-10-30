import { defineConfig } from "vitest/config";

/* Node environment only: the tests read the repository from disk and need no
   DOM. They live at the repository root. The design-lint package runs its own
   tests with its own config, through pnpm run test:design-lint. */
export default defineConfig({
  test: {
    environment: "node",
    /* Some tests start a check script in a child process. */
    testTimeout: 120000,
    hookTimeout: 60000,
    include: ["*.test.ts"],
  },
});
