import { InkIcon } from "@/components/ink-icon";

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

/* One ask in, only the right skills out: the speech-bubble mark (your plain
   words) feeds the orchestrator mark in its selector ring; three of five
   skill marks get a route and an accent disc, two stay faint. The
   orchestrator selects — it does not broadcast. */
function OrchestratorFigure() {
  return (
    <>
      {/* the ask, in your words */}
      <g transform="translate(28 88)">
        <InkIcon name="guidelines/voice-tone" size={44} ink="var(--site-accent-text)" idSuffix="-fig1" />
      </g>
      <path d="M78 110h36" {...line} className="text-foreground" strokeWidth="2" />
      {/* the selector ring, with the orchestrator mark inside */}
      <circle cx="160" cy="110" r="38" {...line} className="text-foreground" strokeWidth="2" fill="var(--surface)" />
      <g transform="translate(138 88)">
        <InkIcon name="skills/orchestrator" size={44} ink="var(--foreground)" idSuffix="-fig1" />
      </g>
      {/* routes to the three picked passes */}
      <g className="text-site-accent-text" {...line} strokeWidth="2">
        <path d="M193 91 L272 52" className="ff-draw ff-route" />
        <path d="M198 110 L272 110" className="ff-draw ff-route" />
        <path d="M193 129 L272 168" className="ff-draw ff-route" />
      </g>
      {/* picked: accent disc fills behind the mark on hover (ff-pick) */}
      <circle cx="300" cy="44" r="20" className="ff-anim ff-pick" fill="var(--site-accent)" stroke="none" />
      <circle cx="300" cy="110" r="20" className="ff-anim ff-pick" fill="var(--site-accent)" stroke="none" />
      <circle cx="300" cy="176" r="20" className="ff-anim ff-pick" fill="var(--site-accent)" stroke="none" />
      <g transform="translate(286 30)">
        <InkIcon name="skills/pattern" size={28} ink="var(--foreground)" idSuffix="-fig1" />
      </g>
      <g transform="translate(286 96)">
        <InkIcon name="skills/polish" size={28} ink="var(--foreground)" idSuffix="-fig1" />
      </g>
      <g transform="translate(286 162)">
        <InkIcon name="skills/execute" size={28} ink="var(--foreground)" idSuffix="-fig1" />
      </g>
      {/* not picked this run: copy and review wait, faint */}
      <g transform="translate(334 62)" opacity=".3">
        <InkIcon name="skills/copy" size={22} ink="var(--foreground)" idSuffix="-fig1" />
      </g>
      <g transform="translate(334 136)" opacity=".3">
        <InkIcon name="skills/review" size={22} ink="var(--foreground)" idSuffix="-fig1" />
      </g>
    </>
  );
}

/* Shared guidance both of you read: the human mark and the machine mark
   approach the same drawn catalog sheet — the list-checks mark on it — and
   their connectors meet it. One catalog, two readers, no drift. */
function CatalogFigure() {
  return (
    <>
      {/* the catalog: a drawn sheet carrying the list-checks mark */}
      <rect x="150" y="55" width="60" height="110" rx="6" {...line} className="text-foreground" strokeWidth="2" fill="var(--surface)" />
      <g transform="translate(158 88)">
        <InkIcon name="standards/catalog" size={44} ink="var(--site-accent-text)" idSuffix="-fig2" />
      </g>
      {/* the readers: you and your agent, converging on it */}
      <g className="ff-anim ff-share-l">
        <g transform="translate(44 88)">
          <InkIcon name="landing/human" size={44} ink="var(--foreground)" idSuffix="-fig2" />
        </g>
      </g>
      <g className="ff-anim ff-share-r">
        <g transform="translate(272 88)">
          <InkIcon name="landing/machine" size={44} ink="var(--foreground)" idSuffix="-fig2" />
        </g>
      </g>
      <g className="text-site-accent-text" {...line} strokeWidth="2">
        <path d="M96 110h46" className="ff-draw ff-route" />
        <path d="M218 110h46" className="ff-draw ff-route" />
      </g>
    </>
  );
}

/* Your foundations compose your product: the colour, type, and token marks —
   what DESIGN.md holds — route into the drawn interface and take effect as
   its avatar, its field, its action. Same parts, your arrangement. */
function DesignFileFigure() {
  return (
    <>
      {/* the foundations DESIGN.md holds */}
      <g transform="translate(36 24)">
        <InkIcon name="foundations/colour" size={36} ink="var(--foreground)" idSuffix="-fig3" />
      </g>
      <g transform="translate(36 92)">
        <InkIcon name="foundations/typography" size={36} ink="var(--foreground)" idSuffix="-fig3" />
      </g>
      <g transform="translate(36 160)">
        <InkIcon name="foundations/tokens" size={36} ink="var(--foreground)" idSuffix="-fig3" />
      </g>
      {/* three routes funnel into the one interface */}
      <g className="text-site-accent-text" {...line} strokeWidth="2">
        <path d="M84 42 C120 42 130 90 162 96" className="ff-draw ff-route" />
        <path d="M84 110 L162 110" className="ff-draw ff-route" />
        <path d="M84 178 C120 178 130 130 162 124" className="ff-draw ff-route" />
      </g>
      {/* the product: the same miniature interface language as the run's result */}
      <g className="text-foreground" {...line} strokeWidth="2">
        <rect x="170" y="30" width="160" height="160" rx="10" fill="var(--surface)" />
      </g>
      <g className="text-border-strong" {...line} strokeWidth="1.5">
        <rect x="216" y="52" width="76" height="5" rx="2.5" fill="var(--border-strong)" stroke="none" />
        <rect x="186" y="86" width="128" height="42" rx="6" fill="var(--site-accent-wash)" />
        <rect x="198" y="98" width="60" height="5" rx="2.5" fill="var(--border-strong)" stroke="none" />
        <rect x="198" y="110" width="42" height="5" rx="2.5" fill="var(--border-strong)" stroke="none" />
      </g>
      {/* the primitives land as real parts: avatar, field mark, action */}
      <circle cx="196" cy="56" r="9" className="ff-anim ff-pick" fill="var(--site-accent)" stroke="none" />
      <rect x="186" y="144" width="52" height="26" rx="6" {...line} className="text-foreground" strokeWidth="1.5" fill="var(--surface)" />
      <path d="M206 150 L216 157 L206 164 Z" className="ff-anim ff-pick" fill="var(--site-accent)" stroke="none" />
    </>
  );
}

/* Passes both sources before it returns: the catalog ring and the DESIGN.md
   ring close over the work — each carrying its mark — the check draws where
   they agree, and only then does the arrow leave for you. */
function ReviewFigure() {
  return (
    <>
      <g className="ff-anim ff-ring-l">
        <circle cx="142" cy="110" r="58" {...line} className="text-foreground" strokeWidth="2" />
        <g transform="translate(96 88)" opacity=".6">
          <InkIcon name="standards/catalog" size={40} ink="var(--foreground)" idSuffix="-fig4" />
        </g>
      </g>
      <g className="ff-anim ff-ring-r">
        <circle cx="218" cy="110" r="58" {...line} className="text-foreground" strokeWidth="2" />
        <g transform="translate(224 88)" opacity=".6">
          <InkIcon name="landing/design-file" size={40} ink="var(--foreground)" idSuffix="-fig4" />
        </g>
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
