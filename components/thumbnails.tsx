import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { inkIcons, inkFilter, inkStroke } from "./ink-icons.generated";

/* HIG-style topic thumbnails: hand-drawn Lucide glyphs, ink-on-tint.
   Glyphs come from the Icon Generator's "Ink" preset
   (https://github.com/wondopamine/icon-generator) — pre-rendered rough.js
   paths plus a feTurbulence edge filter, regenerated via `npm run gen:icons`.
   Colours via tokens (TOK-1). */

export const sectionInk: Record<string, string> = {
  principles: "var(--sec-principles)",
  standards: "var(--sec-standards)",
  guidelines: "var(--sec-guidelines)",
  foundations: "var(--sec-foundations)",
  research: "var(--sec-research)",
  products: "var(--sec-products)",
  harness: "var(--sec-harness)",
  "getting-started": "var(--sec-getting-started)",
  governance: "var(--sec-governance)",
};

/* A generated ink glyph, centred in the 96x60 canvas. The rough.js bake is
   in the path data; feTurbulence adds the organic edge texture in-browser
   (exports from the same pipeline stay hand-drawn without it). */
function InkGlyph({ artKey }: { artKey: string }) {
  const icon = inkIcons[artKey];
  if (!icon) return null;
  const filterId = `ink-${artKey.replace(/[^a-zA-Z0-9]/g, "-")}`;
  return (
    <>
      <defs>
        <filter id={filterId} x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={inkFilter.baseFrequency}
            numOctaves={inkFilter.numOctaves}
            seed={icon.seed}
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={inkFilter.displacementScale} />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`} transform="translate(30 12) scale(1.5)">
        {icon.paths.map((d, i) => (
          <path key={i} d={d} stroke="var(--ink)" strokeWidth={inkStroke} fill="none" />
        ))}
      </g>
    </>
  );
}

/* Products keep the family signature: ink squircle frame, script letter. */
function productMark(artKey: string, letter: string, fontSize: number, y: number): ReactNode {
  return (
    <>
      <InkGlyph artKey={artKey} />
      <text
        x="48"
        y={y}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize={fontSize}
        fontWeight="600"
        fill="var(--ink)"
        stroke="none"
      >
        {letter}
      </text>
    </>
  );
}

/* One glyph per doc, keyed "section/slug". Canvas 96x60. */
export const topicArt: Record<string, ReactNode> = {
  ...Object.fromEntries(
    Object.keys(inkIcons).map((key) => [key, <InkGlyph key={key} artKey={key} />])
  ),
  "products/teacher-workspace": productMark("products/teacher-workspace", "tw", 15, 36.5),
  "products/casesync": productMark("products/casesync", "s", 17, 37),
  "products/glow": productMark("products/glow", "g", 17, 37),
};

export function Thumb({ ink: inkVar, art }: { ink: string; art: ReactNode }) {
  return (
    <div
      className="aspect-[8/5] overflow-hidden rounded-lg border border-border transition-colors duration-150 group-hover:border-(--ink)"
      style={
        {
          "--ink": inkVar,
          background: "color-mix(in oklab, var(--ink) 7%, var(--surface))",
        } as CSSProperties
      }
    >
      <svg
        viewBox="0 0 96 60"
        className="h-full w-full"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {art}
      </svg>
    </div>
  );
}

export type Topic = {
  href: string;
  title: string;
  description?: string;
  artKey: string;
  ink: string;
};

export function TopicCard({ topic }: { topic: Topic }) {
  return (
    <Link
      href={topic.href}
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
    >
      <Thumb ink={topic.ink} art={topicArt[topic.artKey]} />
      <p className="mt-2.5 text-sm font-semibold leading-snug">{topic.title}</p>
      {topic.description && (
        <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
          {topic.description}
        </p>
      )}
    </Link>
  );
}

/* Landing tile: bigger type, ladder tag, page count. */
export function SectionTile({ topic, tag, count }: { topic: Topic; tag?: string; count?: number }) {
  return (
    <Link
      href={topic.href}
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
    >
      <Thumb ink={topic.ink} art={topicArt[topic.artKey]} />
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <p className="font-display text-lg font-semibold leading-snug">{topic.title}</p>
        {tag && (
          <span className="shrink-0 text-xs font-semibold text-muted-foreground">
            {tag}
          </span>
        )}
      </div>
      {topic.description && (
        <p className="mt-1 text-sm leading-snug text-muted-foreground">{topic.description}</p>
      )}
      {count !== undefined && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {count} {count === 1 ? "page" : "pages"}
        </p>
      )}
    </Link>
  );
}

/* Horizontal variant for single-doc sections — varies the grid (SLP-5). */
export function TopicRow({ topic }: { topic: Topic }) {
  return (
    <Link
      href={topic.href}
      className="group flex items-center gap-5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
    >
      <div className="w-36 shrink-0">
        <Thumb ink={topic.ink} art={topicArt[topic.artKey]} />
      </div>
      <div>
        <p className="text-sm font-semibold leading-snug">{topic.title}</p>
        {topic.description && (
          <p className="mt-1 text-xs leading-snug text-muted-foreground">
            {topic.description}
          </p>
        )}
      </div>
    </Link>
  );
}
