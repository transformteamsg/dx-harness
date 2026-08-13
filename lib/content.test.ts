import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { getDoc } from "./content";

const CONTENT_DIR = path.join(process.cwd(), "content");

function contentFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    return entry.isDirectory()
      ? contentFiles(entryPath)
      : entry.name.endsWith(".mdx")
        ? [entryPath]
        : [];
  });
}

describe("content frontmatter", () => {
  it("does not expose a settled/proposed status axis", () => {
    for (const file of contentFiles(CONTENT_DIR)) {
      const { data } = matter(fs.readFileSync(file, "utf8"));
      expect(data, path.relative(process.cwd(), file)).not.toHaveProperty("status");
    }

    expect(getDoc("guidelines", "ui-text")).not.toHaveProperty("status");
  });
});
