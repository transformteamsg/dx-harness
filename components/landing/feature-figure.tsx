export type FeatureFigureKind = "orchestrator" | "catalog" | "design-file" | "review";

/* Each figure is a small geometric argument, and on a hover-capable device it
   performs that argument: the markup holds every shape's FINAL pose, and the
   `ff-*` classes in `app/globals.css` pull shapes back to their initial pose
   while the card is not hovered or focused. Touch and reduced-motion readers
   see the resolved final state with no movement (A11Y-5); the choreography
   runs on `--motion-story` easing-out, never bounce (MOT-1, SLP-8). */

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/* One ask in, only the right skills out: the plain-words dot enters the
   selector ring; three of five skill shapes get a route and fill, two stay
   faint. The orchestrator selects — it does not broadcast. */
function OrchestratorFigure() {
  return (
    <>
      <g className="text-border-strong" {...line} strokeWidth="1.5">
        <path d="M300 4 L310 15 L300 26 L290 15 Z" opacity=".3" />
        <path d="M290 198h20v14h-20Z" opacity=".3" />
      </g>
      <g className="text-foreground" {...line} strokeWidth="2">
        <circle cx="52" cy="110" r="11" fill="var(--site-accent)" stroke="none" />
        <path d="M63 110h55" />
        <circle cx="160" cy="110" r="38" fill="var(--surface)" />
        <circle cx="160" cy="110" r="7" fill="var(--site-accent)" stroke="none" />
      </g>
      <g className="text-site-accent-text" {...line} strokeWidth="2">
        <path d="M193 91 L282 46" className="ff-draw ff-route" />
        <path d="M198 110 L282 110" className="ff-draw ff-route" />
        <path d="M193 129 L282 174" className="ff-draw ff-route" />
      </g>
      {/* The picked skills fill with the accent itself, not the 8% wash: on the
          sheet's near-white ground the wash is indistinguishable from --surface,
          so the "picked" half of the argument never rendered. */}
      <g className="text-foreground" {...line} strokeWidth="2">
        <rect x="286" y="32" width="28" height="28" className="ff-anim ff-pick" fill="var(--site-accent)" />
        <circle cx="300" cy="110" r="15" className="ff-anim ff-pick" fill="var(--site-accent)" />
        <path d="M300 160 L316 188 L284 188 Z" className="ff-anim ff-pick" fill="var(--site-accent)" />
      </g>
    </>
  );
}

/* One set of rules both of you read: shapes scattered left of the lime rule
   fly across it and sit exactly on the shared lines. Rules turn scatter into
   alignment. The faint originals stay behind as the "before". */
function CatalogFigure() {
  return (
    <>
      <g className="text-border-strong" {...line} strokeWidth="1.5">
        <path d="M28 64h304M28 110h304M28 156h304" opacity=".5" />
        <g opacity=".3">
          <rect x="52" y="38" width="24" height="24" transform="rotate(18 64 50)" />
          <circle cx="120" cy="92" r="13" />
          <path d="M78 128 L94 154 L62 154 Z" transform="rotate(-14 78 141)" />
        </g>
      </g>
      <path d="M180 26v168" {...line} className="text-site-accent-text" strokeWidth="2.5" />
      <g className="text-foreground" {...line} strokeWidth="2">
        <rect x="216" y="40" width="24" height="24" className="ff-anim ff-seat-sq" fill="var(--surface)" />
        <circle
          cx="272"
          cy="97"
          r="13"
          className="ff-anim ff-seat-ci text-site-accent-text"
          fill="var(--site-accent)"
        />
        <path d="M244 130 L260 156 L228 156 Z" className="ff-anim ff-seat-tr" fill="var(--surface)" />
      </g>
    </>
  );
}

/* Your primitives compose your product: the lime circle, square, and triangle
   leave their palette ghosts and take their places inside the interface —
   avatar, field, action glyph. Same parts, your arrangement. */
function DesignFileFigure() {
  return (
    <>
      <g className="text-border-strong" {...line} strokeWidth="1.5">
        <g opacity=".3">
          <circle cx="66" cy="52" r="13" />
          <rect x="53" y="94" width="26" height="26" />
          <path d="M66 152 L81 178 L51 178 Z" />
        </g>
      </g>
      <g className="text-site-accent-text" {...line} strokeWidth="2">
        <path d="M104 110h44" />
        <path d="m141 103 8 7-8 7" />
      </g>
      <g className="text-foreground" {...line} strokeWidth="2">
        <rect x="170" y="30" width="160" height="160" rx="10" fill="var(--surface)" />
      </g>
      <g className="text-border-strong" {...line} strokeWidth="1.5">
        <rect x="216" y="52" width="76" height="5" rx="2.5" fill="var(--border-strong)" stroke="none" />
        <rect x="186" y="86" width="128" height="42" rx="6" fill="var(--site-accent-wash)" />
        <rect x="198" y="98" width="60" height="5" rx="2.5" fill="var(--border-strong)" stroke="none" />
        <rect x="198" y="110" width="42" height="5" rx="2.5" fill="var(--border-strong)" stroke="none" />
      </g>
      <g className="text-foreground" {...line} strokeWidth="1.5">
        <rect x="186" y="144" width="52" height="26" rx="6" fill="var(--surface)" />
      </g>
      <circle cx="196" cy="56" r="9" className="ff-anim ff-prim-ci" fill="var(--site-accent)" />
      <rect
        x="252"
        y="148"
        width="18"
        height="18"
        rx="3"
        className="ff-anim ff-prim-sq text-foreground"
        {...line}
        strokeWidth="2"
        fill="var(--surface)"
      />
      <path d="M206 150 L216 157 L206 164 Z" className="ff-anim ff-prim-tr" fill="var(--site-accent)" />
    </>
  );
}

/* Passes both sources before it returns: the catalog ring and the DESIGN.md
   ring close over the work, the check draws where they agree, and only then
   does the arrow leave for you. */
function ReviewFigure() {
  return (
    <>
      <g className="ff-anim ff-ring-l">
        <circle cx="142" cy="110" r="58" {...line} className="text-foreground" strokeWidth="2" />
        <path
          d="M104 92h32M104 104h24M104 116h32M104 128h20"
          {...line}
          className="text-border-strong"
          strokeWidth="1.5"
          opacity=".6"
        />
      </g>
      <g className="ff-anim ff-ring-r">
        <circle cx="218" cy="110" r="58" {...line} className="text-foreground" strokeWidth="2" />
        <circle cx="246" cy="94" r="8" {...line} className="text-border-strong" strokeWidth="1.5" opacity=".6" />
        <rect
          x="238"
          y="112"
          width="16"
          height="16"
          {...line}
          className="text-border-strong"
          strokeWidth="1.5"
          opacity=".6"
        />
      </g>
      <g className="text-site-accent-text" {...line}>
        <path d="m165 110 11 12 21-26" className="ff-draw ff-check" strokeWidth="3.5" />
        <path d="M284 110h44" className="ff-draw ff-exit" strokeWidth="2" />
        <path d="m321 103 8 7-8 7" className="ff-draw ff-exit" strokeWidth="2" />
      </g>
    </>
  );
}

export function FeatureFigure({ kind, number }: { kind: FeatureFigureKind; number: string }) {
  return (
    <figure
      className="feature-figure relative h-44 overflow-hidden"
      aria-hidden="true"
      data-feature-figure={kind}
    >
      <p className="absolute top-4 left-5 z-10 text-xs tracking-widest text-muted-foreground">{number}</p>
      <svg viewBox="0 0 360 220" className="mx-auto block h-full w-full max-w-xs">
        {kind === "orchestrator" ? <OrchestratorFigure /> : null}
        {kind === "catalog" ? <CatalogFigure /> : null}
        {kind === "design-file" ? <DesignFileFigure /> : null}
        {kind === "review" ? <ReviewFigure /> : null}
      </svg>
    </figure>
  );
}
