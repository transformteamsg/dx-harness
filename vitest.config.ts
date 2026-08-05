import path from "node:path";
import { defineConfig } from "vitest/config";

/* Node environment only — the modules under test (lib/markdown-twin.ts,
   lib/catalog.ts) read content/ and harness/standards/ from disk; no DOM
   needed. Alias mirrors tsconfig.json's "@/*": ["./*"]. */
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
