import { DxdMark } from "@/components/dxd-mark";

const line = {
  stroke: "var(--border-strong)",
  strokeWidth: 1.5,
  vectorEffect: "non-scaling-stroke" as const,
};

const accentLine = {
  stroke: "var(--dxd-lime-ink)",
  strokeWidth: 1.5,
  vectorEffect: "non-scaling-stroke" as const,
};

export function OrchestrationHero() {
  return (
    <figure
      className="spec-panel relative overflow-hidden"
      aria-labelledby="orchestration-hero-caption"
    >
      <span
        aria-hidden
        className="spec-panel-caption z-10 font-mono text-xs tracking-[0.16em] text-muted-foreground"
      >
        [ ORCHESTRATION FLOW ]
      </span>

      <svg
        viewBox="0 0 1000 680"
        role="img"
        aria-labelledby="orchestration-title orchestration-desc"
        className="block h-auto w-full"
      >
        <title id="orchestration-title">One brief moving through the DX Harness</title>
        <desc id="orchestration-desc">
          A brief enters the canonical DXD quartic routing mark, splits into three
          focused paths, passes inspection, and becomes one reviewed interface.
        </desc>

        <defs>
          <pattern id="hero-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="var(--dxd-lime-dot)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </pattern>
          <marker
            id="hero-arrow"
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

        <rect width="1000" height="680" fill="var(--surface)" />
        <rect x="28" y="28" width="920" height="624" fill="url(#hero-grid)" />

        <g
          fill="var(--muted-foreground)"
          fontFamily="var(--font-landing-mono)"
          fontSize="18"
          letterSpacing="2"
        >
          <text x="52" y="66">GRID / P4 / 1:2</text>
          <text x="948" y="66" textAnchor="end">ONE SYSTEM / FIVE STAGES</text>
        </g>

        <g aria-label="Brief">
          <rect x="54" y="242" width="142" height="188" fill="var(--surface)" {...line} />
          <path d="M 72 272 H 178 M 72 294 H 152" fill="none" {...line} />
          <rect x="72" y="326" width="106" height="72" fill="var(--muted)" {...line} />
          <path d="M 84 350 H 164 M 84 370 H 146" fill="none" {...line} />
          <text
            x="54"
            y="462"
            fill="var(--foreground)"
            fontFamily="var(--font-landing-mono)"
            fontSize="20"
          >
            One brief
          </text>
        </g>

        <path d="M 196 336 H 270" fill="none" {...accentLine} markerEnd="url(#hero-arrow)" />

        <g aria-label="DXD construction field">
          {[72, 144, 216].map((radius) => (
            <circle key={radius} cx="430" cy="336" r={radius} fill="none" {...line} opacity="0.56" />
          ))}
          {Array.from({ length: 8 }, (_, index) => {
            const angle = (index * Math.PI) / 4;
            return (
              <line
                key={index}
                x1="430"
                y1="336"
                x2={430 + 216 * Math.cos(angle)}
                y2={336 + 216 * Math.sin(angle)}
                {...line}
                opacity="0.42"
              />
            );
          })}
          <rect
            x="278"
            y="184"
            width="304"
            height="304"
            transform="rotate(45 430 336)"
            fill="none"
            {...accentLine}
            strokeDasharray="8 10"
            opacity="0.58"
          />
          <DxdMark x={292} y={198} width={276} height={276} />
          <circle cx="430" cy="336" r="6" fill="var(--foreground)" />
          <text
            x="430"
            y="582"
            textAnchor="middle"
            fill="var(--foreground)"
            fontFamily="var(--font-landing-mono)"
            fontSize="20"
          >
            Front door
          </text>
          <text
            x="430"
            y="609"
            textAnchor="middle"
            fill="var(--muted-foreground)"
            fontFamily="var(--font-landing-mono)"
            fontSize="17"
          >
            canonical quartic routing field
          </text>
        </g>

        <g aria-label="Focused paths">
          <path d="M 646 336 H 666 V 190 H 700" fill="none" {...accentLine} markerEnd="url(#hero-arrow)" />
          <path d="M 646 336 H 700" fill="none" {...accentLine} markerEnd="url(#hero-arrow)" />
          <path d="M 646 336 H 666 V 482 H 700" fill="none" {...accentLine} markerEnd="url(#hero-arrow)" />

          {[
            { y: 150, label: "Shape" },
            { y: 296, label: "Build" },
            { y: 442, label: "Check" },
          ].map((route) => (
            <g key={route.label}>
              <rect
                x="704"
                y={route.y}
                width="104"
                height="80"
                rx="8"
                fill="var(--muted)"
                {...line}
              />
              <circle cx="730" cy={route.y + 24} r="7" fill="var(--dxd-lime-ink)" />
              <path d={`M 748 ${route.y + 24} H 786 M 724 ${route.y + 48} H 788`} fill="none" {...line} />
              <text
                x="756"
                y={route.y + 107}
                textAnchor="middle"
                fill="var(--foreground)"
                fontFamily="var(--font-landing-mono)"
                fontSize="18"
              >
                {route.label}
              </text>
            </g>
          ))}
        </g>

        <g aria-label="Inspection and reviewed output">
          <path d="M 808 190 H 832 V 336 M 808 336 H 832 M 808 482 H 832 V 336" fill="none" {...line} />
          <circle cx="842" cy="336" r="38" fill="var(--surface)" {...accentLine} />
          <circle cx="842" cy="336" r="23" fill="none" {...line} />
          <path d="M 830 336 L 839 345 L 856 325" fill="none" {...accentLine} strokeWidth="2" />
          <path d="M 880 336 H 892" fill="none" {...accentLine} markerEnd="url(#hero-arrow)" />

          <rect x="898" y="252" width="52" height="168" fill="var(--surface)" {...line} />
          <rect x="906" y="266" width="36" height="72" fill="var(--muted)" {...line} />
          <path d="M 910 354 H 938 M 910 370 H 934 M 910 386 H 930" fill="none" {...line} />
          <text
            x="842"
            y="404"
            textAnchor="middle"
            fill="var(--muted-foreground)"
            fontFamily="var(--font-landing-mono)"
            fontSize="16"
          >
            Review
          </text>
          <text
            x="924"
            y="448"
            textAnchor="middle"
            fill="var(--foreground)"
            fontFamily="var(--font-landing-mono)"
            fontSize="17"
          >
            Interface
          </text>
        </g>
      </svg>

      <figcaption
        id="orchestration-hero-caption"
        className="grid gap-2 border-t border-border px-4 py-3 pr-9 text-sm leading-relaxed text-muted-foreground sm:grid-cols-[auto_1fr] sm:gap-5 sm:px-7 sm:pr-11"
      >
        <span className="font-mono text-xs tracking-[0.12em] text-(--dxd-lime-ink)">
          FIG 0.1
        </span>
        <span>
          One front door sends the brief through three focused paths, then
          recombines their work at inspection.
        </span>
      </figcaption>
    </figure>
  );
}
