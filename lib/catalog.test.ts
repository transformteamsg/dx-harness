import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import { getCatalog, getCatalogMeta, getPublicCatalogYaml } from "./catalog";

/* Characterization tests for the deny-by-default projection in
   lib/catalog.ts. These mirror the module's private PUBLIC_META /
   PUBLIC_FIELDS allowlists (not exported — deny-by-default lists shouldn't
   grow a public API surface) so keep them in sync by hand if catalog.ts's
   lists change. See plan 051. */
const PUBLIC_META_ALLOWLIST = [
  "version",
  "updated",
  "waiver_syntax",
  "categories",
  "products",
  "audiences",
];
const PUBLIC_FIELDS_ALLOWLIST = [
  "id",
  "source",
  "title",
  "tier",
  "check",
  "phase",
  "applies_to",
  "verify",
  "waiver",
  "fails_when",
  "products",
  "audiences",
  "enforced",
  "script",
  "status",
];

function readRawCatalog() {
  const file = path.join(process.cwd(), "plugins", "dx-harness", "standards", "catalog.yaml");
  return parse(fs.readFileSync(file, "utf8")) as {
    meta: Record<string, unknown>;
    controls: Record<string, unknown>[];
  };
}

describe("getPublicCatalogYaml — meta projection", () => {
  it("exposes only PUBLIC_META keys at the meta level", () => {
    const raw = readRawCatalog();
    const projected = parse(getPublicCatalogYaml()) as { meta: Record<string, unknown> };
    const projectedKeys = Object.keys(projected.meta).sort();
    const expectedKeys = PUBLIC_META_ALLOWLIST.filter((k) => k in raw.meta).sort();
    expect(projectedKeys).toEqual(expectedKeys);
    // Every projected key must be in the allowlist (set-difference is empty).
    for (const k of projectedKeys) {
      expect(PUBLIC_META_ALLOWLIST).toContain(k);
    }
  });
});

describe("getPublicCatalogYaml — control projection", () => {
  it("every control's keys are a subset of PUBLIC_FIELDS", () => {
    const projected = parse(getPublicCatalogYaml()) as { controls: Record<string, unknown>[] };
    expect(projected.controls.length).toBeGreaterThan(0);
    for (const c of projected.controls) {
      for (const key of Object.keys(c)) {
        expect(PUBLIC_FIELDS_ALLOWLIST).toContain(key);
      }
    }
  });

  it("deny-by-default: real corpus fields outside PUBLIC_FIELDS (refs, detail) never survive projection", () => {
    // getPublicCatalogYaml() takes no arguments — it always reads the real
    // catalog.yaml from disk, so a fake key can't be injected in-memory
    // without editing the file (out of scope). Instead this exercises
    // deny-by-default against fields that genuinely exist in the corpus:
    // catalog.yaml comments document `refs` and `detail` as harness-internal.
    const raw = readRawCatalog();
    const rawHasRefs = raw.controls.some((c) => "refs" in c);
    const rawHasDetail = raw.controls.some((c) => "detail" in c);
    expect(rawHasRefs).toBe(true);
    expect(rawHasDetail).toBe(true);

    const projected = parse(getPublicCatalogYaml()) as { controls: Record<string, unknown>[] };
    expect(projected.controls.some((c) => "refs" in c)).toBe(false);
    expect(projected.controls.some((c) => "detail" in c)).toBe(false);
  });

  it("scope fields absent in the source stay absent — no default injection", () => {
    // Controls without products:/audiences: are global; the projection must
    // not invent the fields. (Today every control in the corpus is global.)
    const raw = readRawCatalog();
    const globalIds = raw.controls
      .filter((c) => !("products" in c) && !("audiences" in c))
      .map((c) => c.id);
    expect(globalIds.length).toBeGreaterThan(0);

    const projected = parse(getPublicCatalogYaml()) as { controls: Record<string, unknown>[] };
    for (const c of projected.controls) {
      if (globalIds.includes(c.id)) {
        expect("products" in c).toBe(false);
        expect("audiences" in c).toBe(false);
      }
    }
  });

  it("enforced/script survive projection on a stamped control and stay absent elsewhere (plan 067)", () => {
    // TOK-1 is stamped enforced: script / script: checks/token-audit.py in
    // the real catalog; controls with no enforced/script field (the default
    // case) must not have them invented by the projection.
    const raw = readRawCatalog();
    const stampedIds = raw.controls.filter((c) => "enforced" in c).map((c) => c.id);
    const unstampedIds = raw.controls.filter((c) => !("enforced" in c)).map((c) => c.id);
    expect(stampedIds).toContain("TOK-1");
    expect(unstampedIds.length).toBeGreaterThan(0);

    const projected = parse(getPublicCatalogYaml()) as { controls: Record<string, unknown>[] };
    const tok1 = projected.controls.find((c) => c.id === "TOK-1");
    expect(tok1?.enforced).toBe("script");
    expect(tok1?.script).toBe("checks/token-audit.py");

    for (const c of projected.controls) {
      if (unstampedIds.includes(c.id)) {
        expect("enforced" in c).toBe(false);
        expect("script" in c).toBe(false);
      }
    }
  });

  it("status: proposed survives projection for exactly the two stamped proposals (MOT-2/3)", () => {
    // CNT-5/6/7 were ratified to settled in #37; MOT-2/3 remain proposed.
    const yaml = getPublicCatalogYaml();
    expect(yaml.match(/status: proposed/g)?.length).toBe(2);

    const projected = parse(yaml) as { controls: Record<string, unknown>[] };
    const proposedIds = projected.controls
      .filter((c) => c.status === "proposed")
      .map((c) => c.id)
      .sort();
    expect(proposedIds).toEqual(["MOT-2", "MOT-3"]);
  });
});

describe("getCatalogMeta — machine-reader contract", () => {
  it("derives version, updated, and waiver syntax from source meta", () => {
    const raw = readRawCatalog();
    const meta = getCatalogMeta();
    expect(meta.version).toBe(raw.meta.version);
    expect(meta.updated).toBe(raw.meta.updated);
    expect(meta.waiver_syntax).toBe(raw.meta.waiver_syntax);
    expect(meta.waiver_syntax).toMatch(/^dx-waive\b/);
  });
});

describe("getCatalog", () => {
  it("carries status: proposed on MOT-2/3, leaves settled controls (incl. ratified CNT-5/6/7) undefined", () => {
    const controls = getCatalog();
    for (const id of ["MOT-2", "MOT-3"]) {
      expect(controls.find((c) => c.id === id)?.status).toBe("proposed");
    }
    // Settled controls carry no status — including CNT-5/6/7, ratified in #37.
    for (const id of ["A11Y-1", "CNT-5", "CNT-6", "CNT-7"]) {
      expect(controls.find((c) => c.id === id)?.status).toBeUndefined();
    }
  });

  it("returns a non-empty list of controls with a category resolved from meta.categories", () => {
    const controls = getCatalog();
    expect(controls.length).toBeGreaterThan(0);
    for (const c of controls) {
      expect(typeof c.category).toBe("string");
      expect(c.category.length).toBeGreaterThan(0);
    }
  });
});
