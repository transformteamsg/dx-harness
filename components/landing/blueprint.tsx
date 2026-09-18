import { DXD_MARK_PATH } from "@/components/dxd-mark";

/* The mark on its construction sheet. Every number here is derived, not chosen —
   see the header of `components/dxd-mark.tsx` for the parametric source.

   Annotations are HTML, not SVG <text>. At this figure's rendered width an SVG
   label sized to look right in the 1000-unit frame lands around 9 CSS px, which
   fails TYP-2 (labels ≥ 12px). Real text beside the plate is legible, selectable,
   scales with the reader's font size, and needs no waiver — so the SVG carries
   geometry only and the numbers sit in the legend, the way a drawing carries a key. */

const GRID = [250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750];

/* Cusps at radius 300 on the diagonals; the waist at 106.07 on the axes. */
const BOUND_MIN = 287.87;
const BOUND_MAX = 712.13;
const BOX = 424.26;
const WAIST = 106.07;
const HANDLE = 14;

const line = { stroke: "var(--blueprint-ink)", vectorEffect: "non-scaling-stroke" as const };

export function Blueprint() {
  return (
    <figure className="m-0 flex flex-col gap-3">
      <p className="text-xs font-medium tracking-wide text-blueprint-ink tabular-nums">
        p 4.000 · α 45° · W:B 1:2
      </p>

      <svg
        viewBox="192 192 616 676"
        role="img"
        aria-label="The DXD mark drawn on its construction grid. A four-cusp concave superellipse sits inside a square bounding box. A dashed circle runs through its four tips and a dashed diamond through its four waists."
        className="block h-auto w-full"
      >
        {/* modular grid, 50 units */}
        <g {...line} strokeOpacity={0.1} strokeWidth={1}>
          {GRID.map((n) => (
            <path key={`h${n}`} d={`M250 ${n}H750`} />
          ))}
          {GRID.map((n) => (
            <path key={`v${n}`} d={`M${n} 250V750`} />
          ))}
        </g>

        {/* polar field — the four principal axes, then the sixteenths */}
        <g {...line} strokeWidth={1}>
          <g strokeOpacity={0.11}>
            <path d="M500 200V800M200 500H800" />
            <path d={`M${BOUND_MIN} ${BOUND_MIN}L${BOUND_MAX} ${BOUND_MAX}`} />
            <path d={`M${BOUND_MAX} ${BOUND_MIN}L${BOUND_MIN} ${BOUND_MAX}`} />
          </g>
          <g strokeOpacity={0.06}>
            <path d="M385.2 214.8L614.8 785.2M614.8 214.8L385.2 785.2" />
            <path d="M214.8 385.2L785.2 614.8M214.8 614.8L785.2 385.2" />
          </g>
        </g>

        {/* the bounding circle, through the four cusps at radius 300 */}
        <circle
          cx={500}
          cy={500}
          r={300}
          fill="none"
          strokeOpacity={0.24}
          strokeWidth={1.5}
          strokeDasharray="7 6"
          {...line}
        />

        {/* the artwork */}
        <path d={DXD_MARK_PATH} fill="var(--foreground)" />

        {/* The waist construction sits ON TOP of the ink it measures — drawn
            under the artwork it would be invisible, and the 1:2 law with it. */}
        <g stroke="var(--surface)" fill="none" vectorEffect="non-scaling-stroke">
          <circle cx={500} cy={500} r={WAIST} strokeOpacity={0.34} strokeWidth={1.5} />
          <path
            d={`M500 ${500 - WAIST}L${500 + WAIST} 500L500 ${500 + WAIST}L${500 - WAIST} 500Z`}
            strokeOpacity={0.8}
            strokeWidth={1.5}
            strokeDasharray="6 5"
          />
        </g>

        {/* the design bounding box, and its corner handles */}
        <rect
          x={BOUND_MIN}
          y={BOUND_MIN}
          width={BOX}
          height={BOX}
          fill="none"
          strokeWidth={1.5}
          {...line}
        />
        <g fill="var(--surface)" strokeWidth={3} {...line}>
          {[BOUND_MIN, BOUND_MAX].flatMap((x) =>
            [BOUND_MIN, BOUND_MAX].map((y) => (
              <rect
                key={`${x}-${y}`}
                x={x - HANDLE / 2}
                y={y - HANDLE / 2}
                width={HANDLE}
                height={HANDLE}
              />
            )),
          )}
        </g>

        {/* dimension line: centre to bound, with tick caps */}
        <g strokeWidth={2} {...line}>
          <path d={`M500 848H${BOUND_MAX}M500 838V858M${BOUND_MAX} 838V858`} />
        </g>
      </svg>

      <figcaption className="text-xs leading-relaxed text-muted-foreground tabular-nums">
        Bounding box 424.26² · half-width B 212.13 · waist W 106.07 — a measured 1:2.
      </figcaption>
    </figure>
  );
}
