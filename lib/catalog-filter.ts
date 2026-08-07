/* Pure matching logic for the catalog browser (components/catalog-browser.tsx).
   Kept dependency-free (a minimal structural ControlLike type, not the
   `Control` type from lib/catalog.ts) so this module has no import cycle and
   stays trivially unit-testable. Any future facet extends CatalogQuery here,
   not the component. See plan 023. */

export type ControlLike = {
  id: string;
  tier: string;
  category: string;
  check: string;
  statement: string;
  fails_when?: string[];
  products?: string[];
  audiences?: string[];
};

export type CatalogQuery = {
  q: string;
  tier: string | null;
  category: string | null;
  check: string | null;
  product: string | null;
  audience: string | null;
};

/* Case-insensitive, multi-term AND match against id/statement/category/
   fails_when. Empty query matches everything. */
function matchesText(c: ControlLike, q: string): boolean {
  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const haystack = [c.id, c.statement, c.category, ...(c.fails_when ?? [])]
    .join(" ")
    .toLowerCase();

  return terms.every((term) => haystack.includes(term));
}

export function matchesControl(c: ControlLike, query: CatalogQuery): boolean {
  return (
    (!query.tier || c.tier === query.tier) &&
    (!query.category || c.category === query.category) &&
    (!query.check || c.check === query.check) &&
    // Absent scope fields = global — the control matches every selection.
    (!query.product || !c.products || c.products.includes(query.product)) &&
    (!query.audience || !c.audiences || c.audiences.includes(query.audience)) &&
    matchesText(c, query.q)
  );
}
