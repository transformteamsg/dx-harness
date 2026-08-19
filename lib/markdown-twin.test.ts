import { describe, expect, it } from "vitest";
import {
  allTwins,
  controlMarkdown,
  mdAlternate,
  mdPaths,
  NO_EXTENDED_DETAIL,
  resolveTwin,
  stripJsx,
  toMarkdown,
} from "./markdown-twin";

/* Characterization tests: these lock in CURRENT behaviour of the JSX-stripping
   and twin-derivation machinery, read against the real content/ and
   plugins/dx-harness/standards/ corpus (deterministic, checked in). They are not a
   spec of "correct" output — see plan 051. */

describe("stripJsx", () => {
  it("preserves fenced code blocks verbatim, including JSX-looking literals inside", () => {
    const input = "before\n```\n<Component/>\n```\nafter";
    expect(stripJsx(input)).toBe(input);
  });

  it("removes a JSX element block spanning multiple lines, including nested same-tag blocks", () => {
    const input = ["before", "<div>", "  <div>", "    inner", "  </div>", "</div>", "after"].join(
      "\n",
    );
    const expected = [
      "before",
      "*(interactive element omitted — view it on the page)*",
      "after",
    ].join("\n");
    expect(stripJsx(input)).toBe(expected);
  });

  it("strips a self-closing component line with no leftover fragment", () => {
    const input = "before\n<Component />\nafter";
    const result = stripJsx(input);
    expect(result).toBe(
      "before\n*(interactive element omitted — view it on the page)*\nafter",
    );
    // No leftover "<Component" / "/>" fragment on its own line.
    expect(result).not.toContain("Component");
    expect(result.split("\n")).toHaveLength(3);
  });
});

describe("toMarkdown", () => {
  it("starts with '# <title>' and includes the description when present", () => {
    const out = toMarkdown("Title", "Desc here", "Body content");
    expect(out).toBe("# Title\n\n> Desc here\n\nBody content");
  });

  it("omits the blockquote description line when description is undefined", () => {
    const out = toMarkdown("Title", undefined, "Body content");
    expect(out).toBe("# Title\n\nBody content");
  });
});

describe("allTwins / mdPaths / resolveTwin against the real corpus", () => {
  it("mdPaths() is non-empty", () => {
    expect(mdPaths().length).toBeGreaterThan(0);
  });

  it("resolveTwin resolves a real mdPath derived from allTwins() to a twin with non-empty markdown", () => {
    const paths = mdPaths();
    const first = paths[0];
    // mdPath is always absolute ("/…"); route segments are the path with the
    // leading slash stripped, split on "/" — mirrors how the [...path] route
    // handler receives params.
    const segments = first.slice(1).split("/");
    const twin = resolveTwin(segments);
    expect(twin).not.toBeNull();
    expect(twin!.mdPath).toBe(first);
    expect(twin!.render().length).toBeGreaterThan(0);
  });

  it("every twin in allTwins() round-trips through resolveTwin by its own mdPath", () => {
    for (const twin of allTwins()) {
      const segments = twin.mdPath.slice(1).split("/");
      expect(resolveTwin(segments)?.mdPath).toBe(twin.mdPath);
    }
  });

  it("resolveTwin returns null for an unknown path", () => {
    expect(resolveTwin(["nope", "nothing"])).toBeNull();
  });

  it("resolveTwin returns null for a well-formed but nonexistent .md path", () => {
    expect(resolveTwin(["nope", "nothing.md"])).toBeNull();
  });
});

describe("controlMarkdown", () => {
  it("includes the control id for a control with a detail file (TOK-1)", () => {
    const md = controlMarkdown("tok-1");
    expect(md.startsWith("# TOK-1")).toBe(true);
    expect(md).toContain("TOK-1");
  });

  it("falls back to the no-extended-detail note for an id not in the catalog", () => {
    const md = controlMarkdown("nope-99");
    expect(md).toBe(`# NOPE-99\n\n${NO_EXTENDED_DETAIL}\n`);
  });
});

describe("mdAlternate", () => {
  it("maps an html path to its .md twin url via alternates.types['text/markdown']", () => {
    expect(mdAlternate("/standards/voice-tone")).toEqual({
      alternates: { types: { "text/markdown": "/standards/voice-tone.md" } },
    });
  });
});

describe("combined standards catalog twin", () => {
  it("includes the standards overview before the list", () => {
    const twin = resolveTwin(["standards", "catalog.md"]);
    const markdown = twin?.render() ?? "";
    expect(markdown).toContain("# Standards");
    expect(markdown).toContain("## All standards");
    expect(markdown.indexOf("# Standards")).toBeLessThan(
      markdown.indexOf("## All standards"),
    );
  });

  it("keeps the old standards twin as a compatibility alias", () => {
    const canonical = resolveTwin(["standards", "catalog.md"]);
    const compatibilityAlias = resolveTwin(["standards.md"]);

    expect(compatibilityAlias?.htmlPath).toBe("/standards/catalog");
    expect(compatibilityAlias?.render()).toBe(canonical?.render());
    expect(allTwins().some((twin) => twin.mdPath === "/standards.md")).toBe(false);
    expect(mdPaths()).toContain("/standards.md");
  });
});
