import { DxdMark } from "@/components/dxd-mark";
import { Reveal } from "@/components/landing/reveal";

type RevealStyle = React.CSSProperties & { "--reveal-i"?: number };
const at = (index: number): RevealStyle => ({ "--reveal-i": index });

type FigureKind = "orchestrator" | "catalog" | "design-file" | "reviewer";

const stroke = {
  stroke: "var(--border-strong)",
  strokeWidth: 1.5,
  vectorEffect: "non-scaling-stroke" as const,
};

const accentStroke = {
  stroke: "var(--dxd-lime-ink)",
  strokeWidth: 1.5,
  vectorEffect: "non-scaling-stroke" as const,
};

const label = {
  fill: "var(--muted-foreground)",
  fontFamily: "var(--font-landing-mono)",
  fontSize: 18,
};

function FigureArtwork({ kind }: { kind: FigureKind }) {
  const patternId = `${kind}-grid`;
  const arrowId = `${kind}-arrow`;

  return (
    <svg
      viewBox="0 0 720 420"
      role="img"
      aria-labelledby={`${kind}-title ${kind}-desc`}
      className="block h-auto w-full"
    >
      <title id={`${kind}-title`}>
        {kind === "orchestrator"
          ? "The DX Harness orchestrator"
          : kind === "catalog"
            ? "The three control-catalog tiers"
            : kind === "design-file"
              ? "A shared DESIGN.md file"
              : "A fresh-context design review"}
      </title>
      <desc id={`${kind}-desc`}>
        {kind === "orchestrator"
          ? "One request passes through the DXD front door into proposal paths and one builder."
          : kind === "catalog"
            ? "Three measured rule sheets show the L0, L1, and L2 control tiers."
            : kind === "design-file"
              ? "Human and agent decisions enter one design file and leave as shared design tokens."
              : "A built interface and its evidence enter a separate review gate and leave with a checked verdict."}
      </desc>
      <defs>
        <pattern id={patternId} width="28" height="28" patternUnits="userSpaceOnUse">
          <path
            d="M 28 0 L 0 0 0 28"
            fill="none"
            stroke="var(--dxd-lime-dot)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
        <marker
          id={arrowId}
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
      <rect width="720" height="420" fill="var(--surface)" />
      <rect x="20" y="20" width="680" height="380" fill={`url(#${patternId})`} />

      {kind === "orchestrator" ? (
        <>
          <g>
            <rect x="52" y="142" width="128" height="136" fill="var(--surface)" {...stroke} />
            <path d="M 70 172 H 162 M 70 194 H 146" fill="none" {...stroke} />
            <rect x="70" y="218" width="92" height="36" fill="var(--muted)" {...stroke} />
            <text x="52" y="310" {...label} fill="var(--foreground)">one ask</text>
          </g>
          <path d="M 180 210 H 234" fill="none" {...accentStroke} markerEnd={`url(#${arrowId})`} />
          <circle cx="326" cy="210" r="92" fill="none" {...stroke} opacity="0.48" />
          <circle cx="326" cy="210" r="58" fill="none" {...stroke} opacity="0.48" />
          <DxdMark x={240} y={124} width={172} height={172} />
          <text x="326" y="330" textAnchor="middle" {...label} fill="var(--foreground)">
            dx-design
          </text>

          {[82, 139, 196, 253, 310].map((y, index) => (
            <g key={y}>
              <path
                d={`M 418 210 H 442 V ${y + 17} H 478`}
                fill="none"
                {...(index === 4 ? accentStroke : stroke)}
                markerEnd={`url(#${arrowId})`}
              />
              <rect
                x="482"
                y={y}
                width="176"
                height="34"
                rx="6"
                fill={index === 4 ? "var(--dxd-lime-wash)" : "var(--surface)"}
                {...(index === 4 ? accentStroke : stroke)}
              />
              <text x="498" y={y + 23} {...label} fill="var(--foreground)">
                {index === 4 ? "one builder" : `proposal ${String(index + 1).padStart(2, "0")}`}
              </text>
            </g>
          ))}
        </>
      ) : null}

      {kind === "catalog" ? (
        <>
          <line x1="116" y1="334" x2="590" y2="334" {...stroke} strokeDasharray="7 8" />
          {[
            { x: 138, y: 206, tier: "L2", note: "specific reason", fill: "var(--surface)" },
            { x: 214, y: 146, tier: "L1", note: "named approver", fill: "var(--muted)" },
            { x: 290, y: 86, tier: "L0", note: "never waived", fill: "var(--dxd-lime-wash)" },
          ].map((sheet, index) => (
            <g key={sheet.tier}>
              <rect
                x={sheet.x + 12}
                y={sheet.y + 12}
                width="286"
                height="156"
                fill="var(--muted)"
                {...stroke}
                opacity="0.48"
              />
              <rect x={sheet.x} y={sheet.y} width="286" height="156" fill={sheet.fill} {...stroke} />
              <text
                x={sheet.x + 24}
                y={sheet.y + 42}
                fill="var(--foreground)"
                fontFamily="var(--font-landing-mono)"
                fontSize="30"
              >
                {sheet.tier}
              </text>
              <text x={sheet.x + 84} y={sheet.y + 40} {...label}>{sheet.note}</text>
              {[0, 1, 2].map((row) => (
                <g key={row}>
                  <circle
                    cx={sheet.x + 30}
                    cy={sheet.y + 76 + row * 24}
                    r="4"
                    fill={index === 2 ? "var(--dxd-lime-ink)" : "var(--border-strong)"}
                  />
                  <line
                    x1={sheet.x + 48}
                    y1={sheet.y + 76 + row * 24}
                    x2={sheet.x + 250 - row * 18}
                    y2={sheet.y + 76 + row * 24}
                    {...stroke}
                  />
                </g>
              ))}
            </g>
          ))}
          <text x="116" y="370" {...label}>one catalog / three tiers</text>
        </>
      ) : null}

      {kind === "design-file" ? (
        <>
          <g>
            <rect x="54" y="104" width="126" height="70" rx="6" fill="var(--surface)" {...stroke} />
            <circle cx="76" cy="128" r="6" fill="var(--dxd-lime-ink)" />
            <path d="M 92 128 H 160 M 70 150 H 146" fill="none" {...stroke} />
            <text x="54" y="94" {...label}>human decisions</text>

            <rect x="54" y="246" width="126" height="70" rx="6" fill="var(--surface)" {...stroke} />
            <rect x="70" y="262" width="12" height="12" fill="var(--dxd-lime-wash)" {...accentStroke} />
            <path d="M 92 268 H 160 M 70 292 H 146" fill="none" {...stroke} />
            <text x="54" y="344" {...label}>agent context</text>
          </g>

          <path d="M 180 139 H 238 V 184" fill="none" {...accentStroke} markerEnd={`url(#${arrowId})`} />
          <path d="M 180 281 H 238 V 236" fill="none" {...accentStroke} markerEnd={`url(#${arrowId})`} />

          <g>
            <rect x="246" y="62" width="244" height="296" fill="var(--surface)" {...stroke} />
            <path d="M 436 62 L 490 116 H 436 Z" fill="var(--muted)" {...stroke} />
            <DxdMark x={270} y={88} width={52} height={52} />
            <text
              x="338"
              y="122"
              fill="var(--foreground)"
              fontFamily="var(--font-landing-mono)"
              fontSize="24"
            >
              DESIGN.md
            </text>
            <path d="M 274 168 H 452 M 274 198 H 432 M 274 228 H 446 M 274 258 H 410" fill="none" {...stroke} />
            <rect x="274" y="288" width="112" height="36" rx="6" fill="var(--dxd-lime-wash)" {...accentStroke} />
            <text x="290" y="312" {...label} fill="var(--foreground)">override</text>
          </g>

          <path d="M 490 210 H 548" fill="none" {...accentStroke} markerEnd={`url(#${arrowId})`} />
          {[110, 178, 246, 314].map((y, index) => (
            <g key={y}>
              <circle cx="582" cy={y} r="18" fill={index === 0 ? "var(--dxd-lime-wash)" : "var(--muted)"} {...stroke} />
              <line x1="600" y1={y} x2="656" y2={y} {...stroke} />
            </g>
          ))}
          <text x="548" y="370" {...label}>shared tokens</text>
        </>
      ) : null}

      {kind === "reviewer" ? (
        <>
          <g>
            <rect x="54" y="78" width="270" height="264" fill="var(--surface)" {...stroke} />
            <text x="78" y="112" {...label}>built interface</text>
            <rect x="78" y="136" width="222" height="76" fill="var(--muted)" {...stroke} />
            <path d="M 96 158 H 218 M 96 178 H 274 M 96 198 H 244" fill="none" {...stroke} />
            <rect x="78" y="234" width="104" height="70" fill="var(--surface)" {...stroke} />
            <path d="M 94 252 H 166 M 94 270 H 154 M 94 288 H 172" fill="none" {...stroke} />
            <rect x="196" y="234" width="104" height="70" fill="var(--surface)" {...stroke} />
            <circle cx="216" cy="256" r="5" fill="var(--dxd-lime-ink)" />
            <path d="M 230 256 H 282 M 212 278 H 282" fill="none" {...stroke} />
          </g>

          <path d="M 324 210 H 392" fill="none" {...accentStroke} markerEnd={`url(#${arrowId})`} />

          <g>
            <rect x="402" y="78" width="264" height="264" fill="var(--surface)" {...stroke} />
            <text x="426" y="112" {...label}>fresh-context review</text>
            {[
              ["contract", 154],
              ["screenshots", 202],
              ["controls", 250],
            ].map(([text, y]) => (
              <g key={text}>
                <circle cx="438" cy={Number(y)} r="12" fill="var(--dxd-lime-wash)" {...accentStroke} />
                <path d={`M 432 ${Number(y)} L 437 ${Number(y) + 5} L 445 ${Number(y) - 5}`} fill="none" {...accentStroke} />
                <text x="466" y={Number(y) + 6} {...label} fill="var(--foreground)">{text}</text>
              </g>
            ))}
            <line x1="426" y1="286" x2="642" y2="286" {...stroke} />
            <text x="426" y="316" {...label} fill="var(--foreground)">verdict / re-check</text>
          </g>
          <text x="360" y="378" textAnchor="middle" {...label}>builder and reviewer stay separate</text>
        </>
      ) : null}
    </svg>
  );
}

const features = [
  {
    figure: "FIG 0.2",
    caption: "[ ORCHESTRATOR ]",
    kind: "orchestrator" as const,
    eyebrow: "/dx-harness:dx-design",
    claim: "One way in. One way to ship.",
    support: (
      <>
        Ask in plain words. <span className="font-mono text-foreground">dx-design</span>{" "}
        routes you to the right pass, and only{" "}
        <span className="font-mono text-foreground">dx-design-execute</span> edits
        your product.
      </>
    ),
  },
  {
    figure: "FIG 0.3",
    caption: "[ CONTROL CATALOG ]",
    kind: "catalog" as const,
    eyebrow: "Control catalog",
    claim: "Not every rule is a lint check.",
    support: (
      <>
        Every control carries a tier, so you know which rules never bend and
        which leave room for judgement.
      </>
    ),
  },
  {
    figure: "FIG 0.4",
    caption: "[ DESIGN.MD ]",
    kind: "design-file" as const,
    eyebrow: "DESIGN.md",
    claim: "Your design language, written down once.",
    support: (
      <>
        Keep product decisions and standing overrides in one file the whole
        team, human and agent, can work from.
      </>
    ),
  },
  {
    figure: "FIG 0.5",
    caption: "[ FRESH REVIEW ]",
    kind: "reviewer" as const,
    eyebrow: "Independent review",
    claim: "The builder never grades its own work.",
    support: (
      <>
        A fresh-context reviewer reads the contract, screenshots, and controls,
        then sends findings back through the same gate for a re-check.
      </>
    ),
  },
];

export function FeatureCards() {
  return (
    <Reveal>
      <ul className="grid border-t border-l border-border md:grid-cols-2">
        {features.map((feature, index) => (
          <li
            key={feature.figure}
            className="reveal-item flex min-w-0 flex-col border-r border-b border-border"
            style={at(index)}
          >
            <figure className="relative overflow-hidden border-b border-border">
              <p className="absolute top-3 left-4 z-10 font-mono text-xs tracking-[0.16em] text-muted-foreground">
                {feature.figure}
              </p>
              <span
                aria-hidden
                className="absolute top-3 right-4 z-10 font-mono text-xs tracking-[0.16em] text-muted-foreground"
              >
                {feature.caption}
              </span>
              <FigureArtwork kind={feature.kind} />
            </figure>

            <div className="flex flex-1 flex-col p-6 sm:p-8">
              <p className="font-mono text-xs break-words text-(--dxd-lime-ink)">
                {feature.eyebrow}
              </p>
              <h3 className="mt-3 max-w-[22ch] font-display text-2xl font-semibold leading-tight tracking-[-0.015em] text-balance text-foreground">
                {feature.claim}
              </h3>
              <p className="mt-3 max-w-[52ch] leading-relaxed text-pretty text-muted-foreground">
                {feature.support}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
