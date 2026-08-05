import Link from "next/link";
import type { CSSProperties } from "react";
import { inkIcons, inkFilter, inkStroke } from "./ink-icons.generated";
import { Parallax, Reveal } from "./landing-motion";

/* Landing "three readers" section — the differentiator: one standard written
   for humans, humans steering machines, and machines alone. Hairline rows,
   not cards (SLP-4/5); each ink glyph drifts at its own depth (Parallax). */

export type Reader = {
  key: string;
  kicker: string;
  title: string;
  text: string;
  href: string;
  link: string;
};

function InkIcon({ artKey, size }: { artKey: string; size: number }) {
  const icon = inkIcons[artKey];
  if (!icon) return null;
  const filterId = `inkr-${artKey.replace(/[^a-zA-Z0-9]/g, "-")}`;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
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
      <g filter={`url(#${filterId})`}>
        {icon.paths.map((d, i) => (
          <path key={i} d={d} stroke="var(--ink)" strokeWidth={inkStroke} fill="none" />
        ))}
      </g>
    </svg>
  );
}

/* Depth increases down the page — the further row drifts more, which is what
   sells the layered, Apple-style scroll feel without any springs. */
const DRIFTS = [16, 26, 36];

export function Readers({
  heading,
  lead,
  readers,
}: {
  heading: string;
  lead: string;
  readers: Reader[];
}) {
  return (
    <section
      className="mt-20"
      style={{ "--ink": "var(--tw-blue)" } as CSSProperties}
    >
      <Reveal>
        <p className="text-sm font-semibold text-tw-blue">
          Human · Human + machine · Machine
        </p>
        <h2 className="mt-3 max-w-[20ch] font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {heading}
        </h2>
        <p className="mt-4 max-w-[58ch] text-base text-muted-foreground">
          {lead}
        </p>
      </Reveal>

      <div className="mt-6">
        {readers.map((reader, i) => (
          <Reveal
            key={reader.key}
            delay={i * 80}
            className="border-b border-border last:border-b-0"
          >
            <div className="grid items-center gap-4 py-9 sm:grid-cols-[128px_1fr] sm:gap-8">
              <Parallax drift={DRIFTS[i] ?? 24} className="justify-self-start sm:justify-self-center">
                <InkIcon artKey={`landing/${reader.key}`} size={76} />
              </Parallax>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">
                  {reader.kicker}
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
                  {reader.title}
                </h3>
                <p className="mt-2 max-w-[62ch] text-base text-muted-foreground">
                  {reader.text}
                </p>
                <Link
                  href={reader.href}
                  className="mt-3 inline-block text-sm font-medium text-tw-blue underline underline-offset-2 hover:text-foreground"
                >
                  {reader.link}
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
