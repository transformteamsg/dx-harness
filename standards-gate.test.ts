import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* The standards gate runs from `pnpm check`, not from npm's build lifecycle,
   so asking for a build no longer means asking for verification, and the
   check scripts' own self-tests run with the rest of the tests. See issue
   #224. */

function readRoot(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

const scripts: Record<string, string> = JSON.parse(readRoot("package.json")).scripts;

const GATES = [
  "node scripts/check-standards.mjs",
  "pnpm run check:design",
  "pnpm run check:records",
  "pnpm run check:python",
  "pnpm run check:notices",
];

describe("pnpm check", () => {
  it("runs the five gates, in order, and nothing runs them from prebuild", () => {
    expect(scripts.prebuild).toBeUndefined();
    expect(scripts.check?.split(" && ")).toEqual(GATES);
  });
});
