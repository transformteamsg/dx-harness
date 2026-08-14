export type FeatureFigureKind = "orchestrator" | "catalog" | "design-file" | "review";

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};
const DESIGN_FILE_RULES = [86, 99, 112, 125, 138];
const DESIGN_FILE_DOTS = [64, 77, 90, 103];

function OrchestratorFigure() {
  return (
    <>
      <g className="text-border-strong" {...line}>
        <path d="M58 83 179 22l123 61-123 63L58 83Z" fill="var(--site-accent-wash)" strokeWidth="1.25" />
        <path d="m58 83 .2 18L179 164l123-63V83" className="text-muted-foreground" strokeWidth="1.25" />
        <path d="m58 112 .2 18L179 193l123-63v-18" strokeWidth="1" opacity=".72" />
        <path d="m58 141 .2 18L179 222l123-63v-18" strokeWidth="1" opacity=".5" />
        <path d="M179 146v76" strokeDasharray="2 5" opacity=".65" />
      </g>
      <g className="text-site-accent-text" {...line}>
        <path d="M131 83h96" strokeWidth="1.4" />
        <path d="m179 52 48 31-48 31-48-31 48-31Z" strokeWidth="1.6" />
        <circle cx="179" cy="83" r="8" strokeWidth="1.6" />
        <path d="M179 75V63M171 83h-17m33 0h17m-25 8v11" strokeWidth="1.2" />
      </g>
    </>
  );
}

function CatalogFigure() {
  return (
    <>
      <g className="text-border-strong" {...line}>
        <path d="m38 112 66-34 65 34-65 35-66-35Z" fill="var(--site-accent-wash)" strokeWidth="1.25" />
        <path d="m38 112 .3 75 65.7 36 65-36v-75" className="text-muted-foreground" strokeWidth="1.25" />
        <path d="m126 50 64-33 65 33-65 34-64-34Z" fill="var(--site-accent-wash)" strokeWidth="1.25" />
        <path d="m126 50 .2 57 63.8 34 65-34V50" className="text-muted-foreground" strokeWidth="1.25" />
        <path d="m190 125 65-34 67 34-67 35-65-35Z" fill="var(--site-accent-wash)" strokeWidth="1.25" />
        <path d="m190 125 .2 62 64.8 35 67-35v-62" className="text-muted-foreground" strokeWidth="1.25" />
      </g>
      <g fill="var(--site-accent-text)">
        <circle cx="104" cy="112" r="4.5" />
        <circle cx="190" cy="50" r="4.5" />
        <circle cx="255" cy="125" r="4.5" />
      </g>
      <g fill="var(--muted-foreground)" fontFamily="var(--font-body)" fontSize="12">
        <text x="95" y="173">L0</text>
        <text x="181" y="108">L1</text>
        <text x="246" y="187">L2</text>
      </g>
    </>
  );
}

function DesignFileFigure() {
  return (
    <>
      <g className="text-border-strong" {...line}>
        <rect x="40" y="64" width="100" height="136" rx="6" fill="var(--site-accent-wash)" strokeWidth="1.25" />
        {DESIGN_FILE_RULES.map((y, index) => (
          <line key={y} x1="52" y1={y} x2={118 - index * 4} y2={y} strokeWidth="1" opacity={0.84 - index * 0.1} />
        ))}
        <path d="M272 78a18 18 0 0 1 36 0" fill="var(--site-accent-wash)" strokeWidth="1.25" />
        <circle cx="290" cy="44" r="9" fill="var(--site-accent-wash)" strokeWidth="1.25" />
        <rect x="274" y="188" width="32" height="28" rx="5" fill="var(--site-accent-wash)" strokeWidth="1.25" />
        <path d="m284 196 6 5-6 5" strokeWidth="1.3" opacity=".75" />
      </g>
      <g className="text-site-accent-text" {...line}>
        <circle cx="150" cy="132" r="6" fill="var(--surface)" strokeWidth="1.6" />
        <path d="M150 132 172 96 290 60M150 132 172 168 290 204" strokeWidth="1.4" />
      </g>
      <g fill="var(--site-accent-text)">
        {DESIGN_FILE_DOTS.map((x) => <circle key={x} cx={x} cy="172" r="3" />)}
      </g>
    </>
  );
}

function ReviewFigure() {
  return (
    <>
      <g className="text-border-strong" {...line}>
        <path d="m35 96 72-37 72 37-72 38-72-38Z" fill="var(--site-accent-wash)" strokeWidth="1.25" />
        <path d="m35 96 .2 76 71.8 39 72-39V96" className="text-muted-foreground" strokeWidth="1.25" />
        <path d="m46 121 61 32 61-32M46 145l61 32 61-32" strokeWidth="1" opacity=".6" />
        <path d="M179 135h38" strokeWidth="1.25" strokeDasharray="3 5" />
        <path d="m222 96 52-27 52 27-52 28-52-28Z" fill="var(--surface)" strokeWidth="1.25" />
        <path d="m222 96 .2 78 51.8 28 52-28V96" className="text-muted-foreground" strokeWidth="1.25" />
      </g>
      <g className="text-site-accent-text" {...line}>
        <circle cx="274" cy="96" r="24" fill="var(--site-accent-wash)" strokeWidth="1.5" />
        <path d="m263 96 8 8 15-17" strokeWidth="2" />
        <path d="M182 135h35m-8-7 8 7-8 7" strokeWidth="1.5" />
      </g>
    </>
  );
}

export function FeatureFigure({ kind, number }: { kind: FeatureFigureKind; number: string }) {
  return (
    <figure className="relative h-44 overflow-hidden" aria-hidden="true" data-feature-figure={kind}>
      <p className="absolute top-4 left-5 z-10 text-xs tracking-widest text-muted-foreground">{number}</p>
      <svg viewBox="0 0 360 260" className="mx-auto block h-full w-full max-w-xs">
        {kind === "orchestrator" ? <OrchestratorFigure /> : null}
        {kind === "catalog" ? <CatalogFigure /> : null}
        {kind === "design-file" ? <DesignFileFigure /> : null}
        {kind === "review" ? <ReviewFigure /> : null}
      </svg>
    </figure>
  );
}
