import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getCatalogMeta } from "./catalog";
import { llmsFull, llmsIndex } from "./llms";
import { allTwins } from "./markdown-twin";

describe("llmsIndex", () => {
  it("publishes the TFX identity and the catalog waiver syntax", () => {
    const index = llmsIndex();
    const meta = getCatalogMeta();
    expect(index.startsWith("# TFX Design Standard")).toBe(true);
    expect(index).toContain(`(v${meta.version} draft)`);
    expect(index).toContain(meta.waiver_syntax);
  });

  it("links the full corpus and every page twin", () => {
    const index = llmsIndex();
    expect(index).toContain("(/llms-full.txt)");
    const pageTwins = allTwins().filter(
      ({ mdPath }) => !mdPath.startsWith("/standards/catalog/"),
    );
    for (const twin of pageTwins) {
      expect(index).toContain(`(${twin.mdPath})`);
    }
  });
});

describe("llmsFull", () => {
  it("includes each Markdown twin exactly once with a non-empty rendered body", () => {
    const full = llmsFull();
    for (const twin of allTwins()) {
      const delimiter = `<!-- Source: ${twin.mdPath} -->`;
      expect(full.split(delimiter)).toHaveLength(2);
      expect(twin.render().trim()).not.toBe("");
      expect(full).toContain(twin.render().trim());
    }
  });

  it("is deterministic", () => {
    expect(llmsFull()).toBe(llmsFull());
  });
});

describe("advertised machine routes", () => {
  it("matches README machine-reader routes to route files", () => {
    const readme = fs.readFileSync(path.join(process.cwd(), "README.md"), "utf8");
    const advertisedRoutes = new Set(
      [...readme.matchAll(/`(\/llms(?:-full)?\.txt)`/g)].map((match) => match[1]),
    );
    expect(advertisedRoutes).toEqual(new Set(["/llms.txt", "/llms-full.txt"]));
    for (const route of advertisedRoutes) {
      expect(
        fs.existsSync(path.join(process.cwd(), "app", route.slice(1), "route.ts")),
      ).toBe(true);
    }
  });
});
