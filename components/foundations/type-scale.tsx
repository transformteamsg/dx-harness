/* Rendered type-scale specimen for the Typography foundations page (TYP-3):
   every step in TYPE_SCALE renders at its true size via its named Tailwind
   utility (row.util), so the eye sees the scale instead of a size chart,
   and the scale stays bound to the Tailwind default type scale rather than
   an arbitrary text-[Npx] value. Samples truncate at narrow viewports
   rather than wrap, so a 320px column never overflows horizontally. */

import { TYPE_SCALE } from "@/lib/foundations/type-data";

const SAMPLE = "Give teachers their time back";

export function TypeScale() {
  return (
    <figure className="my-8">
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-col gap-5">
          {TYPE_SCALE.map((row) => (
            <div key={row.step} className="min-w-0">
              <p
                className={`${row.font === "display" ? "font-display" : "font-body"} ${row.util} overflow-hidden text-ellipsis whitespace-nowrap text-foreground`}
                style={{ fontWeight: row.weight, lineHeight: 1.2 }}
              >
                {row.step === "Label" ? SAMPLE.toLowerCase() : SAMPLE}
              </p>
              <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                {row.step} · {row.px}px · {row.font === "display" ? "Plus Jakarta Sans" : "Inter"}{" "}
                {row.weight}
                {row.note ? ` — ${row.note}` : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 max-w-[60ch] text-xs leading-[1.6] text-muted-foreground">
        The full scale at true size: two fonts, nine steps, no in-between sizes.
      </figcaption>
    </figure>
  );
}

export function FontRoles() {
  return (
    <figure className="my-8">
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-display text-2xl font-semibold text-foreground">
              Plus Jakarta Sans
            </p>
            <p className="mt-1 text-xs tabular-nums text-muted-foreground">
              Display &amp; headlines · weight 600
            </p>
          </div>
          <div>
            <p className="font-body text-lg font-normal text-foreground">Inter</p>
            <p className="mt-1 text-xs tabular-nums text-muted-foreground">
              Body &amp; UI · weights 400 / 500 / 600
            </p>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 max-w-[60ch] text-xs leading-[1.6] text-muted-foreground">
        Two fonts, two jobs — never swapped.
      </figcaption>
    </figure>
  );
}
