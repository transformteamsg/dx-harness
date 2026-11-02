import { describe, expect, it } from "vitest";
import { readRules } from "../src/modules/wp/b-css.ts";

describe("the style sheet reader of WP-10 to WP-19", () => {
  it("reads selectors and declarations with positions, and flags !important", () => {
    const rules = readRules("p {\n  line-height: 1.2 !important;\n  color: red;\n}\n");
    expect(rules).toHaveLength(1);
    expect(rules[0].declarations[0]).toMatchObject({ property: "line-height", value: "1.2", important: true, line: 2, column: 3 });
    expect(rules[0].declarations[1]).toMatchObject({ property: "color", important: false });
  });

  it("reads the rules inside an at-rule and ignores comments", () => {
    const rules = readRules("/* a { color: red } */\n@media (min-width: 1px) {\n  b { opacity: 0; }\n}\n");
    expect(rules.map((r) => r.selector)).toEqual(["b"]);
    expect(rules[0].line).toBe(3);
  });
});
