import { DxdMark } from "@/components/dxd-mark";

const railCode = "rounded-sm bg-muted px-1 font-mono text-xs text-foreground";

const steps = [
  {
    where: "in the chat",
    heading: "You",
    body: <>One ask, in plain words. You never pick a skill.</>,
  },
  {
    where: "the harness plugin",
    heading: (
      <>
        <code className="font-mono text-(--dxd-lime-ink)">dx-design</code> — the
        single front door
      </>
    ),
    body: <>The orchestrator grills first, then routes. Rule and waiver questions stop here too.</>,
  },
  {
    where: "dispatched as subagents",
    heading: "The propose-only passes",
    body: (
      <>
        Copy, flow, pattern, motion, and polish plan for{" "}
        <code className={railCode}>dx-design-execute</code>, the one builder.
      </>
    ),
  },
  {
    where: "the harness plugin",
    heading: "Shared context",
    body: <>Every skill reads the same control catalog, tokens, and components.</>,
  },
  {
    where: "your product repo",
    heading: <code className="font-mono">DESIGN.md</code>,
    body: <>Your product decisions and deviations stay where any agent can read them.</>,
  },
];

const stroke = {
  stroke: "var(--border-strong)",
  strokeWidth: 1.5,
  vectorEffect: "non-scaling-stroke" as const,
};

function HarnessMapFigure() {
  return (
    <svg
      viewBox="0 0 720 860"
      role="img"
      aria-labelledby="harness-map-title harness-map-desc"
      className="block h-auto w-full"
    >
      <title id="harness-map-title">How the design harness fits together</title>
      <desc id="harness-map-desc">
        Five stages connect one brief to the dx-design front door, the specialist
        proposal passes, shared context, and a DESIGN.md file in the product repository.
      </desc>
      <defs>
        <pattern id="map-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path
            d="M 28 0 L 0 0 0 28"
            fill="none"
            stroke="var(--dxd-lime-dot)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
        <marker
          id="map-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--dxd-lime-ink)" />
        </marker>
      </defs>
      <rect width="720" height="860" fill="var(--surface)" />
      <rect x="28" y="28" width="664" height="804" fill="url(#map-grid)" />

      <g fontFamily="var(--font-landing-mono)" fontSize="18">
        <text x="52" y="62" fill="var(--muted-foreground)">THE HARNESS MAP / 05 STAGES</text>

        <g aria-label="Stage one: your brief">
          <rect x="80" y="100" width="172" height="112" fill="var(--surface)" {...stroke} />
          <path d="M 104 132 H 228 M 104 158 H 206 M 104 184 H 220" fill="none" {...stroke} />
          <text x="278" y="147" fill="var(--foreground)" fontSize="24">01 / You</text>
          <text x="278" y="178" fill="var(--muted-foreground)">one ask, in plain words</text>
        </g>

        <path d="M 166 212 V 254" fill="none" {...stroke} markerEnd="url(#map-arrow)" />

        <g aria-label="Stage two: dx-design">
          <circle cx="166" cy="334" r="66" fill="var(--surface)" {...stroke} />
          <circle cx="166" cy="334" r="48" fill="none" {...stroke} opacity="0.5" />
          <DxdMark x={116} y={284} width={100} height={100} />
          <text x="278" y="326" fill="var(--foreground)" fontSize="24">02 / dx-design</text>
          <text x="278" y="358" fill="var(--muted-foreground)">the single front door</text>
        </g>

        <path d="M 166 400 V 442" fill="none" {...stroke} markerEnd="url(#map-arrow)" />

        <g aria-label="Stage three: proposal passes and one builder">
          {[92, 126, 160, 194, 228].map((x) => (
            <circle key={x} cx={x} cy="496" r="12" fill="var(--muted)" {...stroke} />
          ))}
          <rect x="92" y="526" width="148" height="32" rx="6" fill="var(--muted)" {...stroke} />
          <text x="166" y="549" textAnchor="middle" fill="var(--muted-foreground)">proposal passes</text>
          <rect x="92" y="570" width="148" height="38" rx="6" fill="var(--dxd-lime-wash)" {...stroke} />
          <text x="166" y="596" textAnchor="middle" fill="var(--foreground)">one builder</text>
          <text x="278" y="510" fill="var(--foreground)" fontSize="24">03 / Specialists</text>
          <text x="278" y="542" fill="var(--muted-foreground)">propose first, build once</text>
        </g>

        <path d="M 166 608 V 650" fill="none" {...stroke} markerEnd="url(#map-arrow)" />

        <g aria-label="Stage four: shared context">
          <rect x="68" y="674" width="94" height="58" fill="var(--surface)" {...stroke} />
          <path d="M 82 694 H 148 M 82 712 H 136" fill="none" {...stroke} />
          <rect x="174" y="674" width="94" height="58" fill="var(--surface)" {...stroke} />
          <circle cx="198" cy="703" r="10" fill="var(--dxd-lime-wash)" {...stroke} />
          <path d="M 216 694 H 254 M 216 712 H 246" fill="none" {...stroke} />
          <text x="292" y="696" fill="var(--foreground)" fontSize="24">04 / Shared context</text>
          <text x="292" y="726" fill="var(--muted-foreground)">catalog, tokens, components</text>
        </g>

        <path d="M 268 703 H 328 V 766 H 346" fill="none" {...stroke} markerEnd="url(#map-arrow)" />

        <g aria-label="Stage five: DESIGN.md in the product repository">
          <rect
            x="352"
            y="766"
            width="298"
            height="68"
            fill="var(--dxd-lime-wash)"
            stroke="var(--dxd-lime-ink)"
            strokeWidth="1.5"
            strokeDasharray="7 7"
            vectorEffect="non-scaling-stroke"
          />
          <text x="376" y="794" fill="var(--foreground)" fontSize="22">05 / DESIGN.md</text>
          <text x="376" y="820" fill="var(--muted-foreground)">your product repository</text>
        </g>
      </g>
    </svg>
  );
}

export function FullMapDiagram() {
  return (
    <div className="grid items-start gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] md:gap-12 lg:gap-16">
      <figure className="min-w-0">
        <div className="spec-panel relative overflow-hidden">
          <p className="absolute top-3 left-4 z-10 font-mono text-xs tracking-[0.16em] text-muted-foreground">
            FIG 0.6
          </p>
          <span
            aria-hidden
            className="spec-panel-caption z-10 font-mono text-xs tracking-[0.16em] text-muted-foreground"
          >
            [ THE HARNESS MAP ]
          </span>
          <HarnessMapFigure />
        </div>
        <figcaption className="mt-4 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
          One brief moves through one front door, focused specialists, shared
          rules, and one builder before the decisions land in your repository.
        </figcaption>
      </figure>

      <ol aria-label="How the harness is structured" className="divide-y divide-border border-y border-border">
        {steps.map((step, index) => (
          <li key={`${index}-${step.where}`} className="grid grid-cols-[2.5rem_1fr] gap-4 py-6">
            <span aria-hidden className="font-mono text-xs tracking-[0.12em] text-(--dxd-lime-ink)">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="font-mono text-xs tracking-[0.08em] text-muted-foreground">
                {step.where}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-balance text-foreground">
                {step.heading}
              </h3>
              <p className="mt-3 leading-relaxed text-pretty text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
