import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

/* CI skips a change that touches only files no check reads, and a small
   records workflow covers the one check such a change can still break. These
   act out GitHub's paths-ignore rule with path.matchesGlob; whether GitHub
   starts a run is confirmed by opening the pull requests. See issue #334. */

function readRoot(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

type Workflow = { on?: Record<string, { branches?: string[]; paths?: string[]; "paths-ignore"?: string[] } | null> };
const ci: Workflow = parse(readRoot(".github/workflows/ci.yml"));
const ignored = ci.on?.pull_request?.["paths-ignore"] ?? [];

/* GitHub skips the workflow only when every changed file matches the list. */
const skips = (files: string[]) => files.every((file) => ignored.some((glob) => path.matchesGlob(file, glob)));

describe("ci.yml paths-ignore", () => {
  it("skips a change to docs/ROADMAP.md alone", () => {
    expect(skips(["docs/ROADMAP.md"])).toBe(true);
  });
  it("runs when an ignored file and a read file change together", () => {
    expect(skips(["docs/ROADMAP.md", "app/page.tsx"])).toBe(false);
  });
});
