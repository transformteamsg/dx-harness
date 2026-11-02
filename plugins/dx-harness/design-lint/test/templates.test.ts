import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { bd6b } from "../src/modules/bd-6b.ts";
import { missingAlt, readTemplate } from "../src/templates.ts";
import type { Candidate } from "../src/types.ts";

/* The reader of Vue and Svelte templates that the source rules share. The
   fixture pairs of WP-1b and BD-6b show the rules on it. See issue #515. */

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-templates-"));
const file = (name: string, source: string) => {
  const p = path.join(dir, name);
  fs.writeFileSync(p, source);
  return p;
};
const missing = (name: string, source: string) =>
  readTemplate(file(name, source)).elements.flatMap((el) => (missingAlt(el) ? [`${el.tag}@${el.line}:${el.column}`] : []));

describe("an image in a template", () => {
  it.each([
    ["A.vue", '<template>\n  <img v-bind="attrs" />\n  <img :alt="caption" />\n  <img aria-label="Logo" />\n</template>\n'],
    ["A.svelte", "<img {...attrs} />\n<img alt={caption} />\n<img alt=\"\" />\n"],
  ])("passes in %s when the alt text is bound, spread, empty, or a label", (name, source) => {
    const { elements, error } = readTemplate(file(name, source));
    expect(error).toBeNull();
    expect(elements.filter((el) => el.tag === "img")).toHaveLength(3);
    expect(missing(name, source)).toEqual([]);
  });

  it("is reported in an {#each} block of a Svelte file", () => {
    expect(missing("B.svelte", "<ul>\n{#each items as item}\n  <li><img src={item.src} /></li>\n{/each}\n</ul>\n")).toEqual(["img@3:7"]);
  });

  it("is reported for an area, an image input, and an object with no text alternative", () => {
    const source = '<template>\n  <area href="/a" />\n  <input type="image" src="b.png" />\n  <object data="c.svg"></object>\n  <object data="d.svg">A chart</object>\n</template>\n';
    expect(missing("C.vue", source)).toEqual(["area@2:3", "input@3:3", "object@4:3"]);
  });
});

describe("a style block in a template", () => {
  it("is read at its position in the file", () => {
    const { styles } = readTemplate(file("D.svelte", "<p>Hi</p>\n\n<style>\n  p { color: red; }\n</style>\n"));
    expect(styles).toEqual([{ text: "\n  p { color: red; }\n", line: 3, column: 8 }]);
  });

  it("is not read when the template does not parse, and BD-6b reports the file as unreadable", () => {
    const broken = file("E.vue", "<template>\n  <div>\n</template>\n<style>\n.a { color: #fff; }\n</style>\n");
    const candidates = bd6b.locate({ files: [broken], root: dir, params: {} }) as Candidate[];
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({ file: broken, line: 2, column: 3, notRun: true });
    expect(bd6b.decide(candidates[0], {})).toMatch(/^The template is unreadable, so BD-6b could not check the file: /);
  });
});
