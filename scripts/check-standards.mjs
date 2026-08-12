#!/usr/bin/env node
/*
 * Build guard — keeps the three readers connected.
 * Fails the build when:
 *   1. plugins/dx-harness/standards/catalog.yaml doesn't parse or breaks its schema
 *      (required fields, allowed values, tier→waiver pairing, ID shape and
 *      uniqueness, every ID prefix mapped in meta.categories). The schema
 *      lives in plugins/dx-harness/standards/schema.json, shared with
 *      plugins/dx-harness/checks/validate.py (the deeper harness-side check).
 *   2. A judgment/hybrid control lacks a detail file, or a detail path
 *      doesn't exist.
 *   3. A doc registered in content/map.json has no MDX file on disk.
 *   4. An MDX file in a content section dir is not registered in
 *      content/map.json (the machine reader would silently miss it).
 *   5. The sidebar nav and content/map.json disagree in either direction —
 *      a registered doc with no nav entry, or a stale nav entry for an
 *      unregistered doc.
 */
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const root = process.cwd();
const errors = [];
const err = (loc, msg) => errors.push(`ERROR ${loc}: ${msg}`);

// ── 1–2. Catalog schema ───────────────────────────────────────────────────────
const schema = JSON.parse(
  fs.readFileSync(path.join(root, "plugins", "dx-harness", "standards", "schema.json"), "utf8"),
);
const TIERS = new Set(Object.keys(schema.tier_waiver));
const CHECKS = new Set(schema.checks);
const PHASES = new Set(schema.phases);
const APPLIES_TO = new Set(schema.applies_to);
const ID_RE = new RegExp(`^(${schema.id_prefixes.join("|")})-\\d+$`);
const PRODUCTS = new Set(schema.products);
const AUDIENCES = new Set(schema.audiences);
const STATUS = new Set(schema.status);

const catalogPath = "plugins/dx-harness/standards/catalog.yaml";
let catalog;
try {
  catalog = parse(fs.readFileSync(path.join(root, catalogPath), "utf8"));
} catch (e) {
  err(catalogPath, `cannot read or parse: ${e.message}`);
}

if (catalog) {
  const categories = catalog.meta?.categories ?? {};
  const seen = new Set();
  for (const [i, c] of (catalog.controls ?? []).entries()) {
    if (c === null || typeof c !== "object") {
      err(`${catalogPath} (entry ${i})`, "entry is not a YAML mapping");
      continue;
    }
    const loc = `${catalogPath} (${c.id ?? `entry ${i}`})`;
    for (const f of schema.required_fields)
      if (!(f in c)) err(loc, `missing required field '${f}'`);
    if (c.tier && !TIERS.has(c.tier)) err(loc, `invalid tier '${c.tier}'`);
    if (c.check && !CHECKS.has(c.check)) err(loc, `invalid check '${c.check}'`);
    for (const [field, allowed] of [["phase", PHASES], ["applies_to", APPLIES_TO]]) {
      if (field in c) {
        const bad = Array.isArray(c[field])
          ? c[field].filter((v) => !allowed.has(v))
          : [c[field]];
        if (bad.length) err(loc, `invalid ${field} values [${bad}]`);
      }
    }
    // Optional scope fields — absent = global; empty list is an error.
    for (const [field, allowed] of [["products", PRODUCTS], ["audiences", AUDIENCES]]) {
      if (field in c) {
        if (!Array.isArray(c[field])) {
          err(loc, `'${field}' must be a list`);
        } else if (c[field].length === 0) {
          err(loc, `'${field}' must not be an empty list — omit the field for global (all)`);
        } else {
          const bad = c[field].filter((v) => !allowed.has(v));
          if (bad.length) err(loc, `invalid ${field} values [${bad}]`);
        }
      }
    }
    // Optional status field — absence means settled; only 'proposed' is valid.
    if ("status" in c && !STATUS.has(c.status))
      err(loc, `invalid status '${c.status}' — absence means settled`);
    if (c.tier && c.waiver && schema.tier_waiver[c.tier] !== c.waiver)
      err(loc, `tier ${c.tier} requires waiver '${schema.tier_waiver[c.tier]}', got '${c.waiver}'`);
    if (c.id != null) {
      if (!ID_RE.test(String(c.id))) err(loc, `id '${c.id}' does not match ${ID_RE}`);
      if (seen.has(c.id)) err(loc, `duplicate id '${c.id}'`);
      seen.add(c.id);
      const prefix = String(c.id).split("-")[0];
      if (!categories[prefix]) err(loc, `id prefix '${prefix}' missing from meta.categories`);
    }
    if (c.detail) {
      if (!fs.existsSync(path.join(root, "plugins", "dx-harness", "standards", c.detail)))
        err(loc, `detail file 'plugins/dx-harness/standards/${c.detail}' does not exist`);
    } else if (c.check === "judgment" || c.check === "hybrid") {
      err(loc, `check '${c.check}' requires a 'detail' file`);
    }
  }
  if (!catalog.controls?.length) err(catalogPath, "'controls' is empty or missing");
}

// ── 3–4. content/map.json ↔ content/ files ───────────────────────────────────
const map = JSON.parse(fs.readFileSync(path.join(root, "content", "map.json"), "utf8"));

const registered = new Set();
for (const [section, def] of Object.entries(map)) {
  for (const slug of def.slugs) {
    const rel = `content/${section}/${slug}.mdx`;
    registered.add(rel);
    if (!fs.existsSync(path.join(root, rel)))
      err("content/map.json", `registered doc '${rel}' does not exist`);
  }
}

const contentDir = path.join(root, "content");
for (const entry of fs.readdirSync(contentDir, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name === "sections") continue;
  for (const file of fs.readdirSync(path.join(contentDir, entry.name))) {
    if (!file.endsWith(".mdx")) continue;
    const rel = `content/${entry.name}/${file}`;
    if (!registered.has(rel))
      err(rel, "not registered in content/map.json — the sidebar and /llms.txt will miss it");
  }
}

// ── 5. Docs nav (lib/nav.ts) ↔ content/map.json, both directions ─────────────
const sidebarSrc = fs.readFileSync(path.join(root, "lib", "nav.ts"), "utf8");
const sidebarHrefs = new Set(
  [...sidebarSrc.matchAll(/href:\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1]),
);

const expectedHrefs = new Set();
for (const [section, def] of Object.entries(map)) {
  for (const [i, slug] of def.slugs.entries()) {
    // Root sections render their first doc at the section href itself;
    // any further slugs are normal /section/slug pages.
    const href = def.root && i === 0 ? `/${section}` : `/${section}/${slug}`;
    expectedHrefs.add(href);
    if (!sidebarHrefs.has(href))
      err("lib/nav.ts", `no nav entry for registered doc '${href}'`);
  }
}
// Chrome pages live in code, not content — exempt from registration.
const chromeHrefs = new Set(["/standards/catalog"]);
const sectionKeys = new Set(Object.keys(map));
for (const href of sidebarHrefs) {
  const [, section, slug] = href.split("/");
  if (slug && sectionKeys.has(section) && !expectedHrefs.has(href) && !chromeHrefs.has(href))
    err("lib/nav.ts", `stale nav entry '${href}' — not registered in content/map.json`);
}

if (errors.length) {
  for (const e of errors) console.error(e);
  process.exit(1);
}
console.log(
  `OK: ${catalog.controls.length} controls valid, ${registered.size} docs registered, present, and in nav`,
);
