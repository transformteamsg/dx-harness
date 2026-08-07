import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getCatalog, type Control } from "@/lib/catalog";

/* Structured per-control reader. One reader, two surfaces: the HTML detail
   page (app/standards/catalog/[id]/page.tsx) and the per-control `.md` twin
   (lib/markdown-twin.ts) both call getControlDetail() so they can't diverge.

   The canonical body is plugins/dx-harness/standards/controls/<id-lower>.md. Not every
   catalog control has one — controls that need extended rationale/examples do,
   deterministic L0 controls (A11Y-1/2/3) often don't. A control without a file
   is NOT an error: its page shows the catalog fields + an honest
   "no extended detail" note, never fabricated content. */

export type ControlDetail = Control & { slug: string; body: string | null };

function controlsDir(): string {
  return path.join(process.cwd(), "plugins", "dx-harness", "standards", "controls");
}

/* The catalog entry for `id` (case-insensitive) merged with the Markdown body
   from controls/<id-lower>.md, or `body: null` if no detail file exists.
   Returns null only when `id` is not a catalog control at all (→ 404). */
export function getControlDetail(id: string): ControlDetail | null {
  const slug = id.toLowerCase();
  const control = getCatalog().find((c) => c.id.toLowerCase() === slug);
  if (!control) return null;

  const file = path.join(controlsDir(), `${slug}.md`);
  let body: string | null = null;
  if (fs.existsSync(file)) {
    const { data, content } = matter(fs.readFileSync(file, "utf8"));
    // Strip the harness-internal `refs` block, matching the public catalog YAML.
    delete data.refs;
    body = content.trim();
  }

  return { ...control, slug, body };
}

/* Lowercased ids for generateStaticParams — the URL space equals the catalog. */
export function listControlIds(): string[] {
  return getCatalog().map((c) => c.id.toLowerCase());
}
