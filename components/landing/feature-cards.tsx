import { Reveal } from "@/components/landing/reveal";

type RevealStyle = React.CSSProperties & { "--reveal-i"?: number };
const at = (index: number): RevealStyle => ({ "--reveal-i": index });

const figureStroke = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

function OrchestratorFigure() {
  return (
    <svg viewBox="0 0 360 260" className="size-full" aria-hidden>
      <g className="text-border-strong" {...figureStroke}>
        <path d="M58 83 179 22l123 61-123 63L58 83Z" fill="var(--primary-wash)" strokeWidth="1.25" />
        <path d="m58 83 .2 18L179 164l123-63V83" className="text-muted-foreground" strokeWidth="1.25" />
        <path d="m58 112 .2 18L179 193l123-63v-18" strokeWidth="1" opacity=".72" />
        <path d="m58 141 .2 18L179 222l123-63v-18" strokeWidth="1" opacity=".5" />
        <path d="M179 146v76" strokeDasharray="2 5" opacity=".65" />
      </g>

      <g className="text-tw-blue-text" {...figureStroke}>
        <path d="M131 83h96" strokeWidth="1.4" />
        <path d="m179 52 48 31-48 31-48-31 48-31Z" strokeWidth="1.6" />
        <circle cx="179" cy="83" r="8" strokeWidth="1.6" />
        <path d="M179 75V63M171 83h-17m33 0h17m-25 8v11" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

function CatalogFigure() {
  return (
    <svg viewBox="0 0 360 260" className="size-full" aria-hidden>
      <g className="text-border-strong" {...figureStroke}>
        <path d="m38 112 66-34 65 34-65 35-66-35Z" fill="var(--primary-wash)" strokeWidth="1.25" />
        <path d="m38 112 .3 75 65.7 36 65-36v-75" className="text-muted-foreground" strokeWidth="1.25" />

        <path d="m126 50 64-33 65 33-65 34-64-34Z" fill="var(--primary-wash)" strokeWidth="1.25" />
        <path d="m126 50 .2 57 63.8 34 65-34V50" className="text-muted-foreground" strokeWidth="1.25" />

        <path d="m190 125 65-34 67 34-67 35-65-35Z" fill="var(--primary-wash)" strokeWidth="1.25" />
        <path d="m190 125 .2 62 64.8 35 67-35v-62" className="text-muted-foreground" strokeWidth="1.25" />
      </g>

      <g className="fill-tw-blue text-tw-blue-text">
        <circle cx="104" cy="112" r="4.5" />
        <circle cx="190" cy="50" r="4.5" />
        <circle cx="255" cy="125" r="4.5" />
      </g>
      <g className="font-mono text-xs fill-muted-foreground">
        <text x="95" y="173">L0</text>
        <text x="181" y="108">L1</text>
        <text x="246" y="187">L2</text>
      </g>
    </svg>
  );
}

function DesignFileFigure() {
  const pages = Array.from({ length: 10 }, (_, index) => ({
    x: 46 + index * 17,
    y: 187 - index * 14,
    height: 34 + index * 14,
    opacity: 0.38 + index * 0.055,
  }));

  return (
    <svg viewBox="0 0 360 260" className="size-full" aria-hidden>
      <g className="text-border-strong" {...figureStroke}>
        {pages.map(({ x, y, height, opacity }, index) => (
          <path
            key={index}
            d={`M${x} ${y}v-${height - 10}a5 5 0 0 1 7-4l146 72a8 8 0 0 1 4 7v${height - 12}a5 5 0 0 1-7 4L${x + 4} ${y + 7}a8 8 0 0 1-4-7Z`}
            fill={index === pages.length - 1 ? "var(--primary-wash)" : "var(--background)"}
            opacity={opacity}
            strokeWidth={index === pages.length - 1 ? "1.4" : "1"}
          />
        ))}
      </g>

      <g className="text-tw-blue-text" {...figureStroke}>
        <path d="m214 58 39 19" strokeWidth="1.6" />
        <path d="m214 68 53 26" strokeWidth="1.1" opacity=".65" />
        <path d="m214 78 44 22" strokeWidth="1.1" opacity=".65" />
      </g>
    </svg>
  );
}

const features = [
  {
    figure: "FIG 0.2",
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
    illustration: <OrchestratorFigure />,
  },
  {
    figure: "FIG 0.3",
    eyebrow: "Control catalog",
    claim: "Not every rule is a lint check.",
    support: (
      <>
        Every control carries a tier, so you know which rules never bend and
        which leave room for judgement.
      </>
    ),
    illustration: <CatalogFigure />,
  },
  {
    figure: "FIG 0.4",
    eyebrow: "DESIGN.md",
    claim: "Your design language, written down once.",
    support: (
      <>
        Keep product decisions and standing overrides in one file the whole
        team—human and agent—can work from.
      </>
    ),
    illustration: <DesignFileFigure />,
  },
];

export function FeatureCards() {
  return (
    <Reveal>
      <ul className="grid divide-y divide-border border-y border-border md:grid-cols-3 md:divide-x md:divide-y-0">
        {features.map((feature, index) => (
          <li
            key={feature.figure}
            className="reveal-item py-8 md:px-7 md:py-9 md:first:pl-0 md:last:pr-0"
            style={at(index)}
          >
            <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground">
              {feature.figure}
            </p>
            <div className="mt-2 h-56 w-full text-border-strong sm:h-64 md:h-60 lg:h-64 [&_svg]:overflow-visible">
              {feature.illustration}
            </div>
            <p className="mt-5 font-mono text-xs break-words text-tw-blue-text">
              {feature.eyebrow}
            </p>
            <h3 className="mt-2.5 font-display text-lg font-semibold tracking-tight text-balance text-foreground">
              {feature.claim}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {feature.support}
            </p>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
