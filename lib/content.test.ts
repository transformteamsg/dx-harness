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

    const writing = getDoc("standards", "writing");
    expect(writing).not.toBeNull();
    expect(writing).not.toHaveProperty("status");
  });
});

describe("skills documentation", () => {
  it("names every skill shipped by the plugin", () => {
    const skillsRoot = path.join(process.cwd(), "plugins", "dx-harness", "skills");
    const shippedNames = fs
      .readdirSync(skillsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((category) =>
        fs
          .readdirSync(path.join(skillsRoot, category.name), { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => {
            const source = fs.readFileSync(
              path.join(skillsRoot, category.name, entry.name, "SKILL.md"),
              "utf8",
            );
            const name = source.match(/^name:\s*(.+)$/m)?.[1].trim();
            expect(name, `${category.name}/${entry.name}/SKILL.md has no name`).toBeTruthy();
            return name!;
          }),
      );
    const skillsDoc = fs.readFileSync(
      path.join(CONTENT_DIR, "harness", "skills.mdx"),
      "utf8",
    );

    expect(shippedNames).toHaveLength(21);
    for (const name of shippedNames) {
      expect(skillsDoc, `${name} is shipped but missing from the Skills page`).toMatch(
        new RegExp(`${name}(?![\\w-])`),
      );
    }
  });
});
