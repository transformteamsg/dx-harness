import { defineConfig } from "vitest/config";

/* Node environment only: the tests read the repository from disk and need no
   DOM. They live at the repository root. */
export default defineConfig({
  test: {
    environment: "node",
    include: ["*.test.ts"],
  },
});
