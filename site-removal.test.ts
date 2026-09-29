import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* The design standard website lives in transformteamsg/dx-harness-website.
   This repository holds the plugin only, so a site file or a site dependency
   that comes back fails here and names itself. See issue #401. */

const ROOT = process.cwd();

function readRoot(file: string) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

const SITE_PATHS = [
  "app",
  "components",
  "content",
  "lib",
  "hooks",
  "public",
  "scripts",
  "tests",
  "proxy.ts",
  "next.config.mjs",
  "postcss.config.mjs",
  "components.json",
  "eslint.config.mjs",
  "playwright.config.ts",
  "airbase.json",
  "Dockerfile",
  ".dockerignore",
  "DESIGN.md",
  "PRODUCT.md",
  "NOTICE.md",
  ".dx",
  "docs/agents/deploy.md",
  "docs/decisions",
  "plans",
  ".github/workflows/records.yml",
];

const SITE_DEPENDENCIES = [
  "next",
  "react",
  "react-dom",
  "tailwindcss",
  "next-mdx-remote",
  "@playwright/test",
  "eslint-config-next",
];

describe("the website", () => {
  it("has no files in this repository", () => {
    const present = SITE_PATHS.filter((file) => fs.existsSync(path.join(ROOT, file)));
    expect(present, `site files came back: ${present.join(", ")}`).toEqual([]);
  });

  it("has no dependencies in package.json", () => {
    const pkg = JSON.parse(readRoot("package.json"));
    const declared = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
    const present = SITE_DEPENDENCIES.filter((name) => name in declared);
    expect(present, `site dependencies came back in package.json: ${present.join(", ")}`).toEqual([]);
  });
});

describe("the plugin marketplace", () => {
  type Marketplace = { plugins?: { name?: string; source?: string }[] };
  const marketplace: Marketplace = JSON.parse(readRoot(".claude-plugin/marketplace.json"));
  const entry = marketplace.plugins?.find((plugin) => plugin.name === "dx-harness");

  it("installs dx-harness from ./plugins/dx-harness", () => {
    expect(entry?.source).toBe("./plugins/dx-harness");
  });

  it("points at a plugin manifest that names dx-harness", () => {
    const manifest = JSON.parse(readRoot(path.join(entry?.source ?? "", ".claude-plugin/plugin.json")));
    expect(manifest.name).toBe("dx-harness");
  });
});

describe("the repository's front-page documents", () => {
  const docs = ["CLAUDE.md", "README.md", "CONTRIBUTING.md"];

  it.each(docs)("%s names no site command or site path", (file) => {
    const text = readRoot(file);
    const leftovers = ["pnpm dev", "pnpm build", "test:e2e", "Next.js", "Airbase", "content/", "docs/agents/deploy.md"].filter(
      (term) => text.includes(term),
    );
    expect(leftovers, `${file} still describes the site: ${leftovers.join(", ")}`).toEqual([]);
  });

  it("README.md links to the live site and names the private website repository", () => {
    const readme = readRoot("README.md");
    expect(readme).toContain("https://dx-harness.app.tc1.airbase.sg");
    expect(readme).toMatch(/private[^\n]*transformteamsg\/dx-harness-website|transformteamsg\/dx-harness-website[^\n]*private/);
  });
});
