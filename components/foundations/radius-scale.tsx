/* Rendered radius specimen for the Spacing & radius foundations page: the
   shadcn/ui default radius scale as a row of squares (TOK-3). Every value in
   RADII is on-scale, so the literal style={{ borderRadius }} below passes
   the token-audit checker without a waiver. Wraps on narrow viewports. */

const RADII = [0, 2, 4, 6, 8, 12, 16, 24, 9999] as const;

export function RadiusScale() {
  return (
    <figure className="my-8">
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-wrap gap-4">
          {RADII.map((r) => (
            <div key={r} className="flex flex-col items-center gap-1.5">
              <div
                className="h-14 w-14 border border-border bg-muted"
                style={{ borderRadius: r }}
              />
              <span className="text-xs tabular-nums text-muted-foreground">
                {r === 9999 ? "full" : `${r}px`}
              </span>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 max-w-[60ch] text-xs leading-[1.6] text-muted-foreground">
        Cards top out around 12–16px; full is reserved for tags and buttons.
      </figcaption>
    </figure>
  );
}
