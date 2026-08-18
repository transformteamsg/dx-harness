import Link from "next/link";
import { getCatalog } from "@/lib/catalog";
import { tierStyles } from "@/lib/tier-style";
import { cn } from "@/lib/utils";

/* The catalog controls that bind a Standards dimension. Content frontmatter
   declares ids only (`controls: [TYP-1, …]`); statement and tier render live
   from catalog.yaml at build time, so this list cannot drift from the
   catalog the way a restated control would. An unknown id fails the build.

   Past six controls the list collapses behind a native disclosure: a page
   like Writing carries sixteen, and open they push the page's own guidance
   below the fold (LAY-7) — the reader came for the prose, not the index. */

const COLLAPSE_PAST = 6;

function ControlRows({ controls }: { controls: ReturnType<typeof getCatalog> }) {
  return (
    <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
      {controls.map((control) => (
        <li key={control.id}>
          <Link
            href={`/standards/catalog/${control.id.toLowerCase()}`}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--color-ring)"
          >
            <span className="shrink-0 text-xs font-semibold text-muted-foreground">
              {control.id}
            </span>
            {/* Statement drops to its own full-width line below sm so the
                measure never squeezes under the fixed id and badge (LAY-5). */}
            <span className="min-w-0 flex-1 leading-normal max-sm:order-last max-sm:min-w-full">
              {control.statement}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium max-sm:ml-auto",
                tierStyles[control.tier],
              )}
            >
              {control.tier}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ControlList({ ids }: { ids: string[] }) {
  if (ids.length === 0) return null;
  const byId = new Map(getCatalog().map((c) => [c.id, c]));
  const controls = ids.map((id) => {
    const control = byId.get(id.toUpperCase());
    if (!control) {
      throw new Error(`control-list: unknown control id '${id}' in frontmatter`);
    }
    return control;
  });

  if (controls.length <= COLLAPSE_PAST) {
    return (
      <section className="mt-6" aria-label="Standards in the catalog">
        <p className="text-xs font-semibold text-muted-foreground">
          In the catalog
        </p>
        <ControlRows controls={controls} />
      </section>
    );
  }

  return (
    <section className="mt-6" aria-label="Standards in the catalog">
      <details className="group">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring) [&::-webkit-details-marker]:hidden">
          In the catalog · {controls.length} standards
          <span aria-hidden="true" className="group-open:hidden">
            — show them
          </span>
          <span aria-hidden="true" className="hidden group-open:inline">
            — hide them
          </span>
        </summary>
        <ControlRows controls={controls} />
      </details>
    </section>
  );
}
