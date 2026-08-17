import { InkIcon } from "@/components/ink-icon";

export type FeatureFigureKind = "orchestrator" | "catalog" | "design-file" | "review";

/* Each figure is a small geometric argument, and on a hover-capable device it
   performs that argument: the markup holds every shape's FINAL pose, and the
   `ff-*` classes in `app/globals.css` pull shapes back to their initial pose
   while the card is not hovered or focused. Touch and reduced-motion readers
   see the resolved final state with no movement (A11Y-5); the choreography
   runs on `--motion-story` easing-out, never bounce (MOT-1, SLP-8).

   Ink rule: the mark that names its own card's subject renders
   `ink="var(--site-accent-text)"`; every other mark in that figure renders
   `ink="var(--foreground)"`. Check a mark against its card before changing
   its colour. */

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/* One ask in, only the right skills out: the speech-bubble mark (your plain
   words) feeds the orchestrator mark in its selector ring — the card's
   subject, so it carries the accent ink. All five candidate skills sit in one
   column at one size; three get a route and an accent disc, two stay in the
   set at reduced opacity. The orchestrator selects — it does not broadcast. */
function OrchestratorFigure() {
  return (
    <>
      {/* the ask, in your words */}
      <g transform="translate(28 88)">
        <InkIcon name="guidelines/voice-tone" size={44} ink="var(--foreground)" idSuffix="-fig1" />
      </g>
      <path d="M78 110h36" {...line} className="text-foreground" strokeWidth="2" />
      {/* the selector ring, with the orchestrator mark inside */}
      <circle cx="160" cy="110" r="38" {...line} className="text-foreground" strokeWidth="2" fill="var(--surface)" />
      <g transform="translate(138 88)">
        <InkIcon name="skills/orchestrator" size={44} ink="var(--site-accent-text)" idSuffix="-fig1" />
      </g>
      {/* routes to the three picked passes */}
      <g className="text-site-accent-text" {...line} strokeWidth="2">
        <path d="M197 100 L276 77" className="ff-draw ff-route" />
        <path d="M198 110 L275 110" className="ff-draw ff-route" />
        <path d="M197 120 L276 143" className="ff-draw ff-route" />
      </g>
      {/* one column, one size: copy, pattern, polish, execute, review — the
          accent disc and its route say "picked", nothing else has to */}
      <g transform="translate(286 16)" opacity=".5">
        <InkIcon name="skills/copy" size={28} ink="var(--foreground)" idSuffix="-fig1" />
      </g>
      <circle cx="300" cy="70" r="17" className="ff-anim ff-pick" fill="var(--site-accent)" stroke="none" />
      <g transform="translate(286 56)">
        <InkIcon name="skills/pattern" size={28} ink="var(--foreground)" idSuffix="-fig1" />
      </g>
      <circle cx="300" cy="110" r="17" className="ff-anim ff-pick" fill="var(--site-accent)" stroke="none" />
      <g transform="translate(286 96)">
        <InkIcon name="skills/polish" size={28} ink="var(--foreground)" idSuffix="-fig1" />
      </g>
      <circle cx="300" cy="150" r="17" className="ff-anim ff-pick" fill="var(--site-accent)" stroke="none" />
      <g transform="translate(286 136)">
        <InkIcon name="skills/execute" size={28} ink="var(--foreground)" idSuffix="-fig1" />
      </g>
      <g transform="translate(286 176)" opacity=".5">
        <InkIcon name="skills/review" size={28} ink="var(--foreground)" idSuffix="-fig1" />
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
      <rect x="150" y="27" width="60" height="166" rx="6" {...line} className="text-foreground" strokeWidth="2" fill="var(--surface)" />
      <g transform="translate(156 86)">
        <InkIcon name="standards/catalog" size={48} ink="var(--site-accent-text)" idSuffix="-fig2" />
      </g>
      {/* the readers: you and your agent, converging on it */}
      <g className="ff-anim ff-share-l">
        <g transform="translate(60 86)">
          <InkIcon name="landing/human" size={48} ink="var(--foreground)" idSuffix="-fig2" />
        </g>
      </g>
      <g className="ff-anim ff-share-r">
        <g transform="translate(248 86)">
          <InkIcon name="landing/machine" size={48} ink="var(--foreground)" idSuffix="-fig2" />
        </g>
      </g>
      <g className="text-site-accent-text" {...line} strokeWidth="2">
        <path d="M112 110h34" className="ff-draw ff-route" />
        <path d="M214 110h30" className="ff-draw ff-route" />
      </g>
    </>
  );
}

/* Your foundations compose your product: the colour, type, and token marks
   route into the DESIGN.md mark — the card's own subject, so it carries the
   accent ink — which then routes into the drawn interface and takes effect as
   its avatar, its field, its action. Foundations collect into one file; that
   file composes the product. */
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
      {/* three routes funnel into DESIGN.md itself */}
      <g className="text-site-accent-text" {...line} strokeWidth="2">
        <path d="M72 42 C95 42 100 85 93 100" className="ff-draw ff-route" />
        <path d="M72 110 L93 110" className="ff-draw ff-route" />
        <path d="M72 178 C95 178 100 135 93 120" className="ff-draw ff-route" />
      </g>
      {/* DESIGN.md: the one file your foundations become */}
      <g transform="translate(101 90)">
        <InkIcon name="landing/design-file" size={40} ink="var(--site-accent-text)" idSuffix="-fig3" />
      </g>
      {/* and DESIGN.md composes the product: one route out */}
      <path
        d="M149 110 L162 110"
        {...line}
        className="text-site-accent-text ff-draw ff-route"
        strokeWidth="2"
      />
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
        <circle cx="114" cy="110" r="80" {...line} className="text-foreground" strokeWidth="2" />
        <g transform="translate(46 82)" opacity=".6">
          <InkIcon name="standards/catalog" size={56} ink="var(--foreground)" idSuffix="-fig4" />
        </g>
      </g>
      <g className="ff-anim ff-ring-r">
        <circle cx="206" cy="110" r="80" {...line} className="text-foreground" strokeWidth="2" />
        <g transform="translate(218 82)" opacity=".6">
          <InkIcon name="landing/design-file" size={56} ink="var(--foreground)" idSuffix="-fig4" />
        </g>
      </g>
      <g className="text-site-accent-text" {...line}>
        <path d="m144 110 11 12 21-26" className="ff-draw ff-check" strokeWidth="3.5" />
        <path d="M296 110h22" className="ff-draw ff-exit" strokeWidth="2" />
        <path d="m318 103 8 7-8 7" className="ff-draw ff-exit" strokeWidth="2" />
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
