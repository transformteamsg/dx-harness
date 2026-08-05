/* Product primary swatches for the Colour foundations page: one row per
   product primary, each showing the rendered swatch, token name, hex, and
   source — so the "each product keeps its own primary" claim is visible,
   not just stated. Data from lib/foundations/colour-data.ts (TOK-1). The
   ⚑ proposed pill matches the badge treatment in components/doc-page.tsx. */

import { PRODUCT_PRIMARIES } from "@/lib/foundations/colour-data";

export function PrimarySwatches() {
  return (
    <figure className="my-8">
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-col gap-4">
          {PRODUCT_PRIMARIES.map((entry) => (
            <div key={entry.product} className="flex flex-wrap items-center gap-3">
              <div
                aria-hidden
                style={{ background: entry.value }}
                className="h-10 w-14 shrink-0 rounded-md"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{entry.product}</span>
                  {entry.proposed && (
                    <span className="inline-block rounded-full border border-warning-muted bg-warning-subtle px-2 py-0.5 text-xs font-medium text-warning">
                      ⚑ proposed
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  <code>{entry.token}</code> · {entry.value} · {entry.source}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
