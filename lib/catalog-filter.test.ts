import { describe, expect, it } from "vitest";
import { matchesControl, type CatalogQuery, type ControlLike } from "./catalog-filter";

/* Characterization + behaviour tests for the pure predicate that backs the
   catalog browser's search box and facet chips. See plan 023. */

const baseQuery: CatalogQuery = {
  q: "",
  tier: null,
  category: null,
  check: null,
  product: null,
  audience: null,
};

const slp3: ControlLike = {
  id: "SLP-3",
  tier: "L1",
  category: "Anti-slop",
  check: "judgment",
  statement: "No purple gradient text on hero sections.",
  fails_when: ["Gradient text uses purple hues", "Bounce easing on entrance"],
};

const tok1: ControlLike = {
  id: "TOK-1",
  tier: "L0",
  category: "Tokens",
  check: "deterministic",
  statement: "No raw hex colours in components.",
  fails_when: ["A component file contains a hex literal"],
  products: ["casesync"],
};

const a11y3: ControlLike = {
  id: "A11Y-3",
  tier: "L1",
  category: "Accessibility",
  check: "manual",
  statement: "Every input has a label.",
  fails_when: ["An input has no associated label or aria-label"],
  audiences: ["teachers"],
};

describe("matchesControl — text search", () => {
  it("empty query matches every control", () => {
    expect(matchesControl(slp3, baseQuery)).toBe(true);
    expect(matchesControl(tok1, baseQuery)).toBe(true);
    expect(matchesControl(a11y3, baseQuery)).toBe(true);
  });

  it("matches an exact control id", () => {
    expect(matchesControl(slp3, { ...baseQuery, q: "SLP-3" })).toBe(true);
    expect(matchesControl(tok1, { ...baseQuery, q: "SLP-3" })).toBe(false);
  });

  it("matches a control id typed lowercase", () => {
    expect(matchesControl(slp3, { ...baseQuery, q: "slp-3" })).toBe(true);
  });

  it("matches a statement substring", () => {
    expect(matchesControl(slp3, { ...baseQuery, q: "purple" })).toBe(true);
    expect(matchesControl(tok1, { ...baseQuery, q: "purple" })).toBe(false);
  });

  it("matches a fails_when substring", () => {
    expect(matchesControl(slp3, { ...baseQuery, q: "bounce" })).toBe(true);
    expect(matchesControl(tok1, { ...baseQuery, q: "bounce" })).toBe(false);
  });

  it("requires every whitespace-separated term to match (AND, any field)", () => {
    // "gradient" appears in the statement, "purple" in fails_when — both must
    // hit for the control to match.
    expect(matchesControl(slp3, { ...baseQuery, q: "gradient purple" })).toBe(true);
    expect(matchesControl(slp3, { ...baseQuery, q: "gradient neon" })).toBe(false);
  });

  it("returns false when no field contains the term", () => {
    expect(matchesControl(slp3, { ...baseQuery, q: "nonexistent-term-xyz" })).toBe(false);
    expect(matchesControl(tok1, { ...baseQuery, q: "nonexistent-term-xyz" })).toBe(false);
  });
});

describe("matchesControl — facets", () => {
  it("filters by tier", () => {
    expect(matchesControl(tok1, { ...baseQuery, tier: "L0" })).toBe(true);
    expect(matchesControl(slp3, { ...baseQuery, tier: "L0" })).toBe(false);
  });

  it("combines an active facet with a text query", () => {
    expect(
      matchesControl(slp3, { ...baseQuery, category: "Anti-slop", q: "gradient" })
    ).toBe(true);
    expect(
      matchesControl(tok1, { ...baseQuery, category: "Tokens", q: "gradient" })
    ).toBe(false);
  });

  it("treats controls with no products/audiences as global — they match any scope filter", () => {
    // slp3 has neither products nor audiences, so it should pass regardless.
    expect(matchesControl(slp3, { ...baseQuery, product: "casesync" })).toBe(true);
    expect(matchesControl(slp3, { ...baseQuery, audience: "teachers" })).toBe(true);
  });

  it("scoped controls only match a product filter that names them", () => {
    expect(matchesControl(tok1, { ...baseQuery, product: "casesync" })).toBe(true);
    expect(matchesControl(tok1, { ...baseQuery, product: "glow" })).toBe(false);
  });

  it("scoped controls only match an audience filter that names them", () => {
    expect(matchesControl(a11y3, { ...baseQuery, audience: "teachers" })).toBe(true);
    expect(matchesControl(a11y3, { ...baseQuery, audience: "students" })).toBe(false);
  });
});
