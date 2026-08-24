import path from "node:path";
import { defineConfig } from "vitest/config";

/* Node environment only — the modules and build scripts under test read the
   repository and temporary fixtures from disk; no DOM needed. Alias mirrors
   tsconfig.json's "@/*": ["./*"]. */
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "scripts/**/*.test.mjs", "*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
