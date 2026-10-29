import { describe, expect, it } from "vitest";
import { resolveParameters } from "../src/config.ts";
import type { Config, RuleMeta } from "../src/types.ts";

function rule(over: Partial<RuleMeta> = {}): RuleMeta {
  return {
    code: "XX-1a",
    slug: "a-rule",
    dss: "XX-1",
    tier: "L1",
    surface: "rendered",
    engine: "custom",
    judgedRemainder: [],
    redirects: [],
    parameters: { maxGrade: null, serviceType: null, pages: null, minWords: 30 },
    title: "a title",
    file: "XX-1a.md",
    ...over,
  };
}

describe("resolveParameters", () => {
  it("reports every null default as unset when there is no config", () => {
    const r = resolveParameters(rule(), null);
    expect(r.unset).toEqual(["maxGrade", "serviceType", "pages"]);
    expect(r.values).toEqual({ minWords: 30 });
  });

  it("takes rules.R.P before product.P before the rule default", () => {
    const config: Config = {
      product: { minWords: 50, serviceType: "website" },
      rules: { "XX-1a": { minWords: 70 } },
    };
    const r = resolveParameters(rule(), config);
    expect(r.values.minWords).toBe(70);
    expect(r.values.serviceType).toBe("website");
  });

  it("reads a page parameter from its page group", () => {
    const r = resolveParameters(rule(), { pages: { all: ["/", "/search"] } });
    expect(r.values.pages).toEqual(["/", "/search"]);
  });

  it("treats an empty list as a value", () => {
    const r = resolveParameters(rule({ parameters: { authenticatedPages: null } }), {
      pages: { authenticated: [] },
    });
    expect(r.unset).toEqual([]);
    expect(r.values.authenticatedPages).toEqual([]);
  });

  it("ignores an override on an L0 rule and reports it", () => {
    const r = resolveParameters(rule({ tier: "L0", parameters: { minWords: 30 } }), {
      rules: { "XX-1a": { minWords: 1 } },
    });
    expect(r.values.minWords).toBe(30);
    expect(r.skippedOverrides).toEqual(["minWords"]);
  });
});
