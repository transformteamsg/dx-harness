/* The drafting table the sheet lies on.

   The landing page is drawn as a measured sheet: hairline flanks, registration
   crosses at the corners, and a blueprint in the hero. This layer finishes that
   argument by putting the sheet on a larger drawing — construction geometry that
   passes *behind* the page and shows only in the flanks, so the sheet reads as
   one plate on a table rather than a page with decoration around it.

   Three rules keep it from becoming ornament:

   The flank carries four registers, faint to crisp: a ruled module grid down the
   whole page, snapped patches of finer grid that vary in shape as the page
   descends, a one-off construction tied to the hero's geometry at the top, and
   the tick ruler over all of it.

   1. **Nothing is invented, with one honest exception.** The pitch, the dashed
      `5 7` axis, the 45-degree cut and the round crossing dots all come from the
      hero blueprint, which draws the same dash, the same rotation, and the same
      round construction points. The one new device is the *repeating* scale: the
      hero has a modular grid, not a ruler. It is inside the drafting family, but
      it is not quoted from anything, so do not claim it is.
   2. **Nothing sits behind text.** The geometry is clipped to the two flanks,
      outside the 1040px sheet, so no glyph ever gains a line through it and no
      text/background pairing changes (A11Y-1). The flanks and the sheet share
      one ground, so the two arcs read as one large curve enclosing the plate.
      They are two mirrored semicircles, each centred on its own sheet edge — the
      effect is a parenthesis around the page, not one hidden circle, and the
      distinction matters if anyone ever tries to continue the curve.
   3. **It withdraws under forced colours.** The UA drops `background-image` but
      forces border colours, which turned the tick scale into two solid black
      full-height rules with the construction they measured gone — a decorative
      layer becoming louder and meaningless in the mode a reader chose for
      clarity. It is decoration, so it withdraws.
   4. **It withdraws when there is no room.** Below 1200px the flanks are too
      narrow to hold a scale without crowding the sheet edge, so the layer is
      simply absent — it is decorative, and a reader loses nothing (LAY-2). */

/* Snapped patches: a finer grid revealed inside a shape whose every edge lands
   on a module line, with a square handle on the corner the shape snaps from.
   This is the device the builder's reference shows — big rules crossing at a
   handle, with fine cells stepping away from it — and it is what keeps the lower
   page from being one uniform grid repeated to the footer.

   The variation is in the SHAPE, not the density: all four patches draw the same
   fine grid at `--ground-cell`, so they read as the same paper snapped
   differently rather than as four different textures. The step is a full pitch —
   two cells — so the stepped edge stays legible instead of landing on the cell
   lines and vanishing. Kept small, quiet, and few.

   Handles here are squares, not the round dots the construction arc uses. That is
   a deliberate reversal, made on the builder's reference: a square is the snap
   idiom, and one shape across the whole ground layer beats matching the hero's
   logo construction, which is a different drawing doing a different job. */
const PATCHES = [
  /* A stepped edge — the reference's own shape. */
  {
    side: "right" as const,
    top: "21%",
    w: 160,
    h: 160,
    clip:
      "polygon(0 160px, 0 120px, 40px 120px, 40px 80px, 80px 80px, 80px 40px, 120px 40px, 120px 0, 160px 0, 160px 160px)",
    handle: "top" as const,
  },
  /* The same cells cut on the 45 degrees the sheet already uses. */
  { side: "left" as const, top: "38%", w: 120, h: 180, clip: "polygon(120px 0, 120px 180px, 0 180px)", handle: "bottom" as const },
  /* Plain: two modules by one, no cut at all. */
  { side: "right" as const, top: "58%", w: 120, h: 60, clip: undefined, handle: "top" as const },
  /* A notch out of a square. */
  {
    side: "left" as const,
    top: "78%",
    w: 140,
    h: 140,
    clip: "polygon(0 0, 140px 0, 140px 140px, 60px 140px, 60px 60px, 0 60px)",
    handle: "top" as const,
  },
];

function GridPatch({ side, top, w, h, clip, handle }: (typeof PATCHES)[number]) {
  return (
    <div
      className={`absolute ${
        side === "left" ? "left-0 right-[calc(50%+520px)]" : "left-[calc(50%+520px)] right-0"
      }`}
      style={{ top, height: h }}
    >
      {/* Anchored to the sheet edge and mirrored on the left, so both flanks snap
          away from the plate rather than from the window. */}
      <div
        className={`absolute top-0 ${side === "left" ? "right-0 -scale-x-100" : "left-0"}`}
        style={{ width: w, height: h }}
      >
        <div
          className="absolute inset-0"
          style={{
            clipPath: clip,
            backgroundImage:
              "repeating-linear-gradient(to bottom, var(--ground-rule) 0 1px, transparent 1px var(--ground-cell)), " +
              "repeating-linear-gradient(to right, var(--ground-rule) 0 1px, transparent 1px var(--ground-cell))",
          }}
        />
        {/* The handle marks the corner the patch snaps from — the outer top corner
            for the stepped shapes, the right angle for the triangle. */}
        <div
          className="absolute size-1.5 border border-border bg-surface"
          style={{ top: (handle === "top" ? 0 : h) - 3, left: w - 3 }}
        />
      </div>
    </div>
  );
}

/* The whole-page register: a faint module grid filling each flank for the full
   height of the page, so the drafting table continues past the hero instead of
   stopping with it. Deliberately a different device from the construction above
   — that block is a one-off drawing tied to the hero's geometry, this is ruled
   ground — and deliberately quieter, in `--ground-rule` rather than `--border`.

   The module is anchored to the sheet edge (`background-position` on the
   sheet-facing side), not to the viewport, so its rules count outward from the
   plate and register with the ruler's every-fifth tick. Anchored to the viewport
   they would drift with the window width and the two rhythms would beat. */
function FlankGrid({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={`absolute top-0 bottom-0 ${
        side === "left" ? "left-0 right-[calc(50%+520px)]" : "left-[calc(50%+520px)] right-0"
      }`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(to bottom, var(--ground-rule) 0 1px, transparent 1px var(--ground-module)), " +
          "repeating-linear-gradient(to right, var(--ground-rule) 0 1px, transparent 1px var(--ground-module))",
        backgroundPosition: side === "left" ? "right top" : "left top",
      }}
    />
  );
}

/* The scale is a ruler, so it must run the whole page rather than a fixed box:
   CSS repeats the tick at `--ground-pitch` down the full height. The gradient is
   a hairline pattern in one token colour with hard stops — a tick rhythm, not a
   colour transition. */
function FlankScale({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={`absolute top-0 bottom-0 w-2 ${
        side === "left"
          ? "left-[calc(50%-560px)] border-l border-border"
          : "right-[calc(50%-560px)] border-r border-border"
      }`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(to bottom, var(--border) 0 1px, transparent 1px var(--ground-pitch))",
      }}
    />
  );
}

/* The construction that ties the drawing to the page, anchored to the top of the
   sheet where the hero blueprint sits. x=0 is the sheet's edge and x grows
   outward into the flank, so the left copy is the right copy mirrored.

   The radius is 320 and the scale stands 40 out from the sheet edge, which puts
   the arc's crossings of the scale at y = 380 +/- sqrt(320^2 - 40^2), i.e. 62.5
   and 697.5. The handles sit on those two crossings rather than on round
   numbers: a handle marks where geometry actually meets, which is the whole
   reason a drafting sheet draws one. */
function FlankConstruction({ side }: { side: "left" | "right" }) {
  const stroke = {
    stroke: "var(--border)",
    fill: "none",
    vectorEffect: "non-scaling-stroke" as const,
  };
  return (
    <div
      className={`absolute top-0 h-[760px] overflow-hidden ${
        side === "left" ? "left-0 right-[calc(50%+520px)]" : "left-[calc(50%+520px)] right-0"
      }`}
    >
      <svg
        viewBox="0 0 320 760"
        className={`absolute top-0 h-full w-[320px] ${
          side === "left" ? "right-0 -scale-x-100" : "left-0"
        }`}
      >
        {/* The 45-degree wedge: the tint the heading bands carry, cut on the
            hero's own rotation. */}
        <path d="M0 0H320L0 320Z" fill="var(--sheet-band)" stroke="none" />
        {/* The construction radius, entering and leaving the sheet edge. */}
        <path d="M0 60A320 320 0 0 1 0 700" {...stroke} strokeWidth="1" />
        {/* The 45-degree axis, dashed as the blueprint dashes its construction. */}
        <path d="M0 470 320 150" {...stroke} strokeWidth="1" strokeDasharray="5 7" />
        {/* Where the radius crosses the scale, marked the way the hero marks its own
            construction points: a round dot, not a square. The hero draws
            `circle r="9"` on its bounding-square corners; a square handle here
            would put two shapes on one drafting device in a single frame. */}
        <circle cx="40" cy="62.5" r="3.5" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
        <circle cx="40" cy="697.5" r="3.5" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
      </svg>
    </div>
  );
}

export function SheetGround() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-hidden min-[1200px]:block forced-colors:hidden"
    >
      {/* Faintest first: ruled ground, then the one-off construction, then the
          ruler — so the crispest thing in the flank is the thing that measures. */}
      <FlankGrid side="left" />
      <FlankGrid side="right" />
      {PATCHES.map((p) => (
        <GridPatch key={`${p.side}-${p.top}`} {...p} />
      ))}
      <FlankConstruction side="left" />
      <FlankConstruction side="right" />
      <FlankScale side="left" />
      <FlankScale side="right" />
    </div>
  );
}
