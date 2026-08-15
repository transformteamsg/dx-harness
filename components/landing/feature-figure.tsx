export type FeatureFigureKind = "orchestrator" | "catalog" | "design-file" | "review";

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

function OrchestratorFigure() {
  return (
    <>
      <g className="text-border-strong" {...line}>
        {/* A real request, not a generic input node. The stepped corner reads as
            a text artifact before the routing geometry begins. */}
        <path
          d="M32 76h77l17 17v91H32V76Z"
          fill="var(--surface)"
          strokeWidth="1.25"
        />
        <path d="M109 76v18h17" strokeWidth="1" opacity=".75" />
        <path d="M48 103h44M48 118h60M48 133h51M48 158h26" strokeWidth="1" opacity=".72" />
        <path d="M126 130h18" strokeWidth="1.25" />

        {/* The orchestrator is a selector: a quiet outer rail, a decision ring,
            and one keyed centre. It routes only the skills this request needs. */}
        <circle cx="188" cy="130" r="44" fill="var(--surface)" strokeWidth="1.25" />
        <circle cx="188" cy="130" r="23" fill="var(--site-accent-wash)" strokeWidth="1.25" />
        <path d="M188 86V71M226 108l18-10m-18 54 18 10M188 174v15" strokeWidth="1" opacity=".72" />
        <circle cx="188" cy="71" r="4" fill="var(--surface)" strokeWidth="1.15" />
        <circle cx="246" cy="97" r="4" fill="var(--surface)" strokeWidth="1.15" />
        <circle cx="246" cy="163" r="4" fill="var(--surface)" strokeWidth="1.15" />
        <circle cx="188" cy="189" r="4" fill="var(--surface)" strokeWidth="1.15" />

        {/* Three specialist work surfaces receive the routed request. Their
            contents vary so the row does not collapse into repeated icon tiles. */}
        <rect x="270" y="47" width="58" height="44" rx="5" fill="var(--surface)" strokeWidth="1.25" />
        <path d="M281 60h22M281 70h34M281 79h17" strokeWidth="1" opacity=".68" />
        <rect x="278" y="108" width="50" height="44" rx="5" fill="var(--surface)" strokeWidth="1.25" />
        <circle cx="291" cy="130" r="5" strokeWidth="1" />
        <path d="M302 123h15M302 131h11M302 139h15" strokeWidth="1" opacity=".68" />
        <rect x="270" y="170" width="58" height="44" rx="5" fill="var(--surface)" strokeWidth="1.25" />
        <path d="m282 195 8-8 8 8 10-13 8 8" strokeWidth="1" opacity=".72" />
      </g>
      <g className="text-site-accent-text" {...line}>
        <path d="M74 158h34l19-28h38M188 107v46m-23-23h46" strokeWidth="1.5" />
        <circle cx="188" cy="130" r="7" fill="var(--surface)" strokeWidth="1.6" />
        <path d="m211 112 35-15h24M211 148l35 15 24 28" strokeWidth="1.5" />
        <circle cx="246" cy="97" r="4" fill="var(--site-accent-wash)" strokeWidth="1.5" />
        <circle cx="246" cy="163" r="4" fill="var(--site-accent-wash)" strokeWidth="1.5" />
      </g>
    </>
  );
}

function CatalogFigure() {
  return (
    <>
      <g className="text-border-strong" {...line}>
        {/* The catalogue is drawn as the thing it is: an indexed rules source.
            The second sheet and exposed spine give it physical depth without
            returning to the generic isometric blocks used by the old figures. */}
        <path d="M93 43h164v174H93z" fill="var(--surface)" strokeWidth="1.25" />
        <path d="M84 51h9v174H84zM93 217h164v8H93" fill="var(--site-accent-wash)" strokeWidth="1" opacity=".8" />
        <path d="M111 43v174" strokeWidth="1" opacity=".72" />
        <path d="M126 68h102M126 82h74" strokeWidth="1.15" opacity=".78" />
        <path d="M126 107h111M126 119h88M126 145h96M126 157h111M126 183h80M126 195h101" strokeWidth="1" opacity=".7" />
        <path d="M111 95h146M111 133h146M111 171h146" strokeWidth="1" opacity=".42" />

        {/* Three distinct agent ports read from the same source. */}
        <rect x="29" y="73" width="36" height="32" rx="5" fill="var(--surface)" strokeWidth="1.2" />
        <path d="M39 87h16M43 94h8" strokeWidth="1" opacity=".7" />
        <rect x="295" y="61" width="36" height="32" rx="5" fill="var(--surface)" strokeWidth="1.2" />
        <circle cx="306" cy="73" r="2.5" fill="var(--site-accent-wash)" strokeWidth="1" />
        <circle cx="319" cy="73" r="2.5" fill="var(--site-accent-wash)" strokeWidth="1" />
        <circle cx="306" cy="81" r="2.5" fill="var(--site-accent-wash)" strokeWidth="1" />
        <circle cx="319" cy="81" r="2.5" fill="var(--site-accent-wash)" strokeWidth="1" />
        <rect x="295" y="173" width="36" height="32" rx="5" fill="var(--surface)" strokeWidth="1.2" />
        <path d="m306 190 6-6 7 7" strokeWidth="1" opacity=".72" />
        <path d="M65 89h19M257 77h38M257 189h38" strokeWidth="1.2" />
      </g>
      <g className="text-site-accent-text" {...line}>
        <circle cx="111" cy="107" r="4" fill="var(--site-accent-wash)" strokeWidth="1.4" />
        <rect x="107" y="141" width="8" height="8" rx="1.5" fill="var(--site-accent-wash)" strokeWidth="1.4" />
        <path d="m106 185 5-5 5 5-5 5-5-5Z" fill="var(--site-accent-wash)" strokeWidth="1.4" />
        <path d="M84 89H65M257 77h38M257 189h38" strokeWidth="1.5" />
        <circle cx="84" cy="89" r="3" fill="var(--surface)" strokeWidth="1.4" />
        <circle cx="257" cy="77" r="3" fill="var(--surface)" strokeWidth="1.4" />
        <circle cx="257" cy="189" r="3" fill="var(--surface)" strokeWidth="1.4" />
      </g>
    </>
  );
}

function DesignFileFigure() {
  return (
    <>
      <g className="text-border-strong" {...line}>
        {/* A design-language source sheet: colour, type, spacing, and radius are
            visible as specimens instead of generic document lines. */}
        <path d="M38 37h112l22 22v164H38V37Z" fill="var(--surface)" strokeWidth="1.25" />
        <path d="M150 37v23h22" strokeWidth="1" opacity=".72" />
        <circle cx="59" cy="78" r="7" fill="var(--site-accent-wash)" strokeWidth="1.1" />
        <circle cx="80" cy="78" r="7" fill="var(--surface)" strokeWidth="1.1" />
        <circle cx="101" cy="78" r="7" fill="var(--surface)" strokeWidth="1.1" />
        <path d="M54 112h64M54 124h45M54 141h86M54 151h63" strokeWidth="1" opacity=".72" />
        <path d="M54 180h12M74 176v8M84 173v14M96 169v22M111 166v28" strokeWidth="1" opacity=".74" />
        <path d="M131 174h19v19h-10a9 9 0 0 1-9-9v-10Z" fill="var(--site-accent-wash)" strokeWidth="1" />

        {/* The rendered interface deliberately repeats the source specimens: the
            same circle, rhythm, and rounded corner prove causality. */}
        <rect x="221" y="54" width="107" height="154" rx="7" fill="var(--surface)" strokeWidth="1.25" />
        <path d="M221 79h107M243 79v129" strokeWidth="1" opacity=".64" />
        <circle cx="234" cy="67" r="3" fill="var(--site-accent-wash)" strokeWidth="1" />
        <path d="M253 96h51M253 107h36" strokeWidth="1" opacity=".72" />
        <rect x="253" y="126" width="55" height="36" rx="5" fill="var(--site-accent-wash)" strokeWidth="1.05" />
        <path d="M263 138h24M263 149h34" strokeWidth="1" opacity=".68" />
        <rect x="253" y="178" width="38" height="14" rx="4" fill="var(--surface)" strokeWidth="1" />
        <path d="M228 96h8M228 110h8M228 124h8M228 138h8" strokeWidth="1" opacity=".68" />
        <path d="M172 130h31" strokeWidth="1.2" />
        <path d="m197 124 6 6-6 6" strokeWidth="1.2" />
      </g>
      <g className="text-site-accent-text" {...line}>
        <circle cx="59" cy="78" r="7" strokeWidth="1.5" />
        <path d="M59 85v15h125v30h19" strokeWidth="1.5" />
        <circle cx="203" cy="130" r="3" fill="var(--surface)" strokeWidth="1.4" />
        <rect x="253" y="126" width="55" height="36" rx="5" strokeWidth="1.4" />
      </g>
    </>
  );
}

function ReviewFigure() {
  return (
    <>
      <g className="text-border-strong" {...line}>
        {/* Two recognisable sources feed the review: catalogue rows above and
            design-language specimens below. */}
        <rect x="28" y="49" width="92" height="70" rx="5" fill="var(--surface)" strokeWidth="1.2" />
        <path d="M42 66h64M42 78h51M42 94h64M42 106h42" strokeWidth="1" opacity=".7" />
        <circle cx="36" cy="66" r="2.5" fill="var(--site-accent-wash)" strokeWidth="1" />
        <rect x="28" y="148" width="92" height="64" rx="5" fill="var(--surface)" strokeWidth="1.2" />
        <circle cx="44" cy="167" r="6" fill="var(--site-accent-wash)" strokeWidth="1" />
        <circle cx="62" cy="167" r="6" fill="var(--surface)" strokeWidth="1" />
        <path d="M42 190h57M42 199h38" strokeWidth="1" opacity=".7" />

        {/* The output is a real interface fragment. The review lens overlaps it
            so the judgment reads as inspection, not a generic conversion step. */}
        <rect x="213" y="45" width="119" height="170" rx="7" fill="var(--surface)" strokeWidth="1.25" />
        <path d="M213 70h119M237 70v145" strokeWidth="1" opacity=".62" />
        <circle cx="225" cy="58" r="3" fill="var(--site-accent-wash)" strokeWidth="1" />
        <path d="M248 88h58M248 100h38" strokeWidth="1" opacity=".72" />
        <rect x="248" y="120" width="61" height="42" rx="5" fill="var(--site-accent-wash)" strokeWidth="1" />
        <path d="M258 133h34M258 145h24" strokeWidth="1" opacity=".68" />
        <path d="M248 180h48M248 191h61" strokeWidth="1" opacity=".66" />

        <path d="M120 84h28l17 25M120 180h28l17-25" strokeWidth="1.2" />
        <circle cx="182" cy="132" r="34" fill="var(--surface)" strokeWidth="1.25" />
        <path d="M204 158l19 20" strokeWidth="3" />
        <path d="M170 132h24M182 120v24" strokeWidth="1" opacity=".58" />
        <circle cx="182" cy="132" r="20" strokeWidth="1" strokeDasharray="3 5" opacity=".62" />
      </g>
      <g className="text-site-accent-text" {...line}>
        <path d="M120 84h28l17 25M120 180h28l17-25" strokeWidth="1.5" />
        <circle cx="165" cy="109" r="3" fill="var(--surface)" strokeWidth="1.4" />
        <circle cx="165" cy="155" r="3" fill="var(--surface)" strokeWidth="1.4" />
        <circle cx="182" cy="132" r="34" strokeWidth="1.6" />
        <path d="M202 158h23v-26h23" strokeWidth="1.5" />
        <circle cx="248" cy="132" r="5" fill="var(--surface)" strokeWidth="1.5" />
        <circle cx="307" cy="91" r="14" fill="var(--surface)" strokeWidth="1.5" />
        <path d="m300 91 5 5 10-12" strokeWidth="1.8" />
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
