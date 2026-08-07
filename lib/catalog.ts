import fs from "node:fs";
import path from "node:path";
import { Document, parse, Scalar } from "yaml";

export type Control = {
  id: string;
  statement: string;
  tier: "L0" | "L1" | "L2";
  check: "deterministic" | "judgment" | "hybrid";
  category: string;
  fails_when?: string[];
  products?: string[];
  audiences?: string[];
  enforced?: "script" | "partial" | "manual" | "evaluator";
  script?: string | string[];
  status?: "proposed";
};

type RawControl = Record<string, unknown> & { id: string };
type RawCatalog = {
  meta: { categories: Record<string, string> } & Record<string, unknown>;
  controls: RawControl[];
};

/* Fields the public routes (/standards/catalog.yaml, /llms.txt) expose.
   `refs` and `detail` are harness-internal: Notion workspace links and
   repo-relative paths. Detail content is published per control at
   /standards/catalog/<id> (and its `.md` twin). */
const PUBLIC_FIELDS = [
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
] as const;

function readCatalog(): RawCatalog {
  const file = path.join(process.cwd(), "plugins", "dx-harness", "standards", "catalog.yaml");
  return parse(fs.readFileSync(file, "utf8")) as RawCatalog;
}

export function getCatalog(): Control[] {
  const { meta, controls } = readCatalog();
  return controls.map((c) => {
    const prefix = c.id.split("-")[0];
    const category = meta.categories?.[prefix];
    if (!category) {
      throw new Error(
        `plugins/dx-harness/standards/catalog.yaml: id prefix '${prefix}' (${c.id}) missing from meta.categories`,
      );
    }
    return {
      id: c.id,
      statement: c.title,
      tier: c.tier,
      check: c.check,
      category,
      fails_when: c.fails_when,
      products: c.products,
      audiences: c.audiences,
      enforced: c.enforced,
      script: c.script,
      status: c.status,
    } as Control;
  });
}

/* Scope display maps from the catalog meta block — value → display name.
   Absent maps project to empty objects (older catalog versions). */
export function getScopeMeta(): {
  products: Record<string, string>;
  audiences: Record<string, string>;
} {
  const { meta } = readCatalog();
  return {
    products: (meta.products as Record<string, string>) ?? {},
    audiences: (meta.audiences as Record<string, string>) ?? {},
  };
}

export type CatalogMeta = {
  version: string;
  updated: string;
  waiver_syntax: string;
};

/* The narrow public metadata contract used by machine readers. Keep this
   separate from the full meta block so adding catalog implementation details
   never expands the reader surface by accident. */
export function getCatalogMeta(): CatalogMeta {
  const { meta } = readCatalog();
  return {
    version: meta.version as string,
    updated: meta.updated as string,
    waiver_syntax: meta.waiver_syntax as string,
  };
}

/* meta keys the public routes expose — deny-by-default, like PUBLIC_FIELDS. */
const PUBLIC_META = [
  "version",
  "updated",
  "waiver_syntax",
  "categories",
  "products",
  "audiences",
] as const;

export function getPublicCatalogYaml(): string {
  const { meta, controls } = readCatalog();
  const publicMeta = Object.fromEntries(
    PUBLIC_META.filter((k) => k in meta).map((k) => [k, meta[k]]),
  );
  const publicControls = controls.map((c) =>
    Object.fromEntries(
      PUBLIC_FIELDS.filter((f) => f in c).map((f) => [f, c[f]]),
    ),
  );
  const doc = new Document({ meta: publicMeta, controls: publicControls });
  /* Quote `updated` so YAML 1.1 parsers (PyYAML, Psych) read the ISO date as
     a string, matching the quoted source — unquoted it resolves to a date. */
  const updated = doc.getIn(["meta", "updated"], true);
  if (updated instanceof Scalar) updated.type = Scalar.QUOTE_DOUBLE;
  const header = [
    "# TFX Design Standard — control catalog",
    "# A control is one verifiable statement. If you can't check it, it's not a standard.",
    "# Tiers: L0 = non-negotiable (no waiver) · L1 = mandatory (documented waiver) · L2 = recommended (inline rationale)",
    "# Control rationale and pass/fail examples: /standards/catalog/<id> (append .md for Markdown)",
    "",
  ].join("\n");
  return header + doc.toString();
}
