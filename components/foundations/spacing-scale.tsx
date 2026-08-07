/* Rendered spacing specimen for the Spacing & radius foundations page: the
   shadcn/ui default spacing scale as labelled bars (TOK-2). Bar length is set
   via the `width` style property, never padding/margin/gap, so the specimen
   itself reads as on-scale to the token-audit checker. Renders up to 96px;
   the scale continues 112 / 128px (noted in the caption). */

const SPACING_PX = [
  1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96,
] as const;

export function SpacingScale() {
  return (
    <figure className="my-8">
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-col gap-2">
          {SPACING_PX.map((px) => (
            <div key={px} className="flex items-center gap-3">
              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {px / 4}
              </span>
              <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {px}px
              </span>
              <div className="h-3 min-w-0 rounded-sm bg-muted" style={{ width: px }} />
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 max-w-[60ch] text-xs leading-[1.6] text-muted-foreground">
        The shadcn spacing scale, unmodified. It continues 112 / 128px beyond
        what&apos;s shown here.
      </figcaption>
    </figure>
  );
}
