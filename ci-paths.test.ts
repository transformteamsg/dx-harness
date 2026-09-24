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
  /* Each of these is read by a check, so a change to it alone must still run
     CI. The list is the issue's coupled table, plus the product trees. */
  const read = [
    "README.md",
    "LICENSE",
    "CONTEXT.md",
    "DESIGN.md",
    "NOTICE.md",
    "package.json",
    "pnpm-lock.yaml",
    "docs/agents/deploy.md",
    "docs/decisions/example.md",
    "docs/index.html",
    "plugins/dx-harness/skills/engineering/dx-create-pr/SKILL.md",
    ".github/workflows/ci.yml",
    "CONTRIBUTING.md",
    ".gitignore",
    "app/page.tsx",
    "components/postcard.tsx",
    "content/overview.mdx",
    "lib/motion.ts",
    "scripts/generate-notices.mjs",
    "tests/site-contract.spec.ts",
    "deploy.test.ts",
  ];

  it.each(read)("runs for a change to %s alone", (file) => {
    expect(skips([file])).toBe(false);
  });
});

describe("ci.yml triggers", () => {
  it("carry the same paths-ignore list on push and on pull_request", () => {
    expect(ignored.length).toBeGreaterThan(0);
    expect(ci.on?.push?.["paths-ignore"]).toEqual(ignored);
  });
});

describe("ci.yml's note on required checks", () => {
  it("records that none is required today, and the gate job to add if one is", () => {
    const text = readRoot(".github/workflows/ci.yml");
    expect(text).toMatch(/no required status check/i);
    expect(text).toMatch(/gate job/i);
  });
});

describe(".github/workflows/records.yml", () => {
  const file = path.join(process.cwd(), ".github/workflows/records.yml");
  const records: (Workflow & { jobs?: Record<string, { steps?: { run?: string }[] }> }) | null = fs.existsSync(file)
    ? parse(fs.readFileSync(file, "utf8"))
    : null;
  const scripts: Record<string, string> = JSON.parse(readRoot("package.json")).scripts;

  it("runs on exactly the paths ci.yml ignores, on push and on pull_request", () => {
    expect(records?.on?.push?.paths).toEqual(ignored);
    expect(records?.on?.pull_request?.paths).toEqual(ignored);
    expect(records?.on?.push?.branches).toEqual(ci.on?.push?.branches);
    expect(records?.on?.pull_request?.branches).toEqual(ci.on?.pull_request?.branches);
  });

  it("runs the same command as check:records", () => {
    const runs = Object.values(records?.jobs ?? {}).flatMap((job) => (job.steps ?? []).map((step) => step.run?.trim()));
    expect(runs).toContain(scripts["check:records"]);
  });
});
