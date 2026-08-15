import type { CSSProperties } from "react";
import Link from "next/link";
import { SlopCompare } from "@/components/compare";
import { inkFilter, inkIcons, inkStroke } from "@/components/ink-icons.generated";
import { FEATURED_SKILLS } from "@/components/landing/data";
import { DxdConstructionPreview } from "@/components/landing/dxd-construction-preview";
import { FeatureFigure, type FeatureFigureKind } from "@/components/landing/feature-figure";
import { SkillMark } from "@/components/landing/skill-mark";
import { ClaudeCodeChat } from "@/components/landing/claude-code-chat";

export const metadata = {
  /* Absolute: the root template is for titled documentation pages; the front page
     carries the product name and its own explainer. */
  title: { absolute: "DX Harness — design in code with confidence" },
  description:
    "DX Harness gives coding agents a shared design language, the right skills for each task, and a review before the work returns to you.",
  alternates: { types: { "text/markdown": "/index.md" } },
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)";

/* Commands and file names sit on a muted chip, and the chip is what marks them as
   code — not a third typeface. Two things here are load-bearing:

   `font-body`, because a bare <code> inherits the browser's default monospace, which
   puts a face outside Plus Jakarta Sans and Inter on the page (TYP-1, L1). The docs
   prose has always rendered inline code in that UA monospace; that is a pre-existing
   gap this page declines to widen, not one it invented.

   And no font-size of its own. An earlier draft set `text-[0.9em]`, which rendered
   10.8px inside a `text-xs` parent — under TYP-2's 12px label floor and off the
   Tailwind scale (TYP-3), while `checks/type-scan.py` passed it because the script
   reads declarations and cannot resolve a relative unit. The chip now inherits its
   parent's size, so it is on-scale wherever it is used. */
function Cmd({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-sm bg-muted px-1.5 py-0.5 font-body text-foreground">
      {children}
    </code>
  );
}

/* Every section opens the same way: a heading cell on the whisper band, then the
   content in cells below it. The heading carries the hierarchy on its own — 30px
   over the 18px headings inside, a 1.67x step (SLP-6) — with no sub-line under it.
   A band that restates its own heading in smaller grey type is the page telling you
   twice; the cells below are the explanation.

   `action` is for a section-level link (the skills directory). It wraps under the
   title rather than truncating, so nothing goes out of reach at 320px (LAY-2), and
   it stays a link: the hero holds the page's one filled action (CMP-5). */
function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-1 border-b border-border bg-sheet-band px-6 py-8 sm:px-10 sm:py-10">
      <h2 className="max-w-[22ch] text-3xl font-semibold tracking-tight text-balance text-foreground">
        {title}
      </h2>
      {action}
    </div>
  );
}

function CollaborationIcon({ artKey }: { artKey: string }) {
  const icon = inkIcons[artKey];
  if (!icon) return null;
  const filterId = `landing-${artKey.replace(/[^a-zA-Z0-9]/g, "-")}`;

  return (
    <svg
      viewBox="0 0 24 24"
      width={48}
      height={48}
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
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={inkFilter.displacementScale}
          />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        {icon.paths.map((d, index) => (
          <path
            key={index}
            d={d}
            stroke="var(--ink)"
            strokeWidth={inkStroke}
            fill="none"
          />
        ))}
      </g>
    </svg>
  );
}

const COLLABORATORS = [
  {
    artKey: "landing/human",
    label: "You",
    detail: "Direction and judgment",
    ink: "var(--foreground)",
  },
  {
    artKey: "landing/human-machine",
    label: "DX Harness",
    detail: "The bridge",
    ink: "var(--site-accent-text)",
  },
  {
    artKey: "landing/machine",
    label: "Your agent",
    detail: "Skills and execution",
    ink: "var(--foreground)",
  },
] as const;

/* Figure, label, claim. The claim is the whole cell: a support paragraph under it
   restated the label in a longer sentence, and four of those stacked down the page
   read as filler rather than argument. */
const FEATURES = [
  {
    figure: "FIG 1",
    kind: "orchestrator" as FeatureFigureKind,
    eyebrow: "Orchestrator skill",
    claim: "Start with a plain-language request.",
  },
  {
    figure: "FIG 2",
    kind: "catalog" as FeatureFigureKind,
    eyebrow: "Control catalog",
    claim: "Shared design guidance agents can use.",
  },
  {
    figure: "FIG 3",
    kind: "design-file" as FeatureFigureKind,
    eyebrow: "DESIGN.md",
    claim: "Your product’s design language.",
  },
  {
    figure: "FIG 4",
    kind: "review" as FeatureFigureKind,
    eyebrow: "Review skill",
    /* Names both things it checks against. "A review grounded in both." relied on
       a support paragraph that this page no longer carries, so "both" pointed at
       nothing on screen (CNT-14). */
    claim: "A review against the catalog and your DESIGN.md.",
  },
];

const STAGES = [
  {
    n: "01",
    heading: "Your prompt",
    body: "“Make this lesson planner easier to scan and keep it consistent with our product.”",
  },
  {
    n: "02",
    heading: "The harness at work",
    body: (
      <>
        <Cmd>dx-design</Cmd> brings in the skills this request needs. Each one reads the
        control catalog and your <Cmd>DESIGN.md</Cmd>.
      </>
    ),
  },
  {
    n: "03",
    heading: "A reviewed result",
    body:
      "Execute makes the approved change. A separate review checks the result before it comes back to you.",
  },
];

export default function Landing() {
  return (
    <div>
      {/* ── Hero: the claim and the working logo studio ────────────────── */}
      <section className="grid border-b border-border lg:grid-cols-2">
        {/* The words centre in their half. Top-aligned, they left a gap under the
            button as tall as the block itself, because the drawing — not the copy —
            was setting the row's height. */}
        <div className="flex flex-col justify-center border-border px-6 py-16 sm:px-10 sm:py-20 lg:border-r">
          <h1 className="max-w-[13ch] text-4xl leading-[1.02] font-semibold tracking-tighter text-balance text-foreground sm:text-5xl lg:text-6xl">
            Design in code with confidence.
          </h1>
          <p className="mt-6 max-w-[44ch] text-base leading-relaxed text-pretty text-(--prose-body)">
            A design harness gives your coding agent a shared design language, the right
            skills for each task, and a review before the work comes back to you.
          </p>
          <div className="mt-8">
            <Link
              href="/harness/install"
              className={`inline-flex min-h-11 items-center rounded-lg border border-site-accent-text bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-(--motion-fast) hover:bg-site-accent-hover ${focusRing}`}
            >
              Quick start
            </Link>
          </div>
        </div>
        <div className="min-w-0 overflow-hidden bg-surface">
          <DxdConstructionPreview />
        </div>
      </section>

      {/* ── The four parts ─────────────────────────────────────────────────── */}
      <SectionHead title="What the harness gives your agent." />
      {/* Cell borders, not per-index rules: every cell draws its own right and
          bottom hairline and is pulled back a pixel, so the outermost ones land
          exactly on the sheet's flank and the section seam. The grid can then
          reflow at any breakpoint without the borders needing to know. */}
      <ul className="grid border-b border-border sm:grid-cols-2">
        {FEATURES.map((f) => (
          <li
            key={f.eyebrow}
            className="-mb-px flex min-w-0 flex-col border-b border-border sm:[&:nth-child(odd)]:border-r"
          >
            <FeatureFigure kind={f.kind} number={f.figure} />
            <div className="px-6 py-8 sm:px-10 sm:py-10">
              <p className="text-xs font-semibold tracking-wide break-words text-site-accent-text">
                {f.eyebrow}
              </p>
              <h3 className="mt-3 max-w-[24ch] text-lg font-semibold tracking-tight text-balance text-foreground">
                {f.claim}
              </h3>
            </div>
          </li>
        ))}
      </ul>

      {/* ── How it works: a real request moving through the harness ─────────── */}
      <SectionHead title="From a request to a reviewed result." />
      {/* Two equal halves, and the three stages divide their half into equal
          thirds — grid-rows-3 makes the row heights the ordering signal, so the
          hairlines that used to separate them are redundant and gone. Each
          stage centres in its third; without that the copy floats to the top of
          a slot taller than it needs and the equal split stops reading. */}
      <div className="grid border-b border-border lg:grid-cols-2">
        <div className="flex items-center justify-center border-border px-6 py-8 max-lg:border-b sm:py-10 lg:border-r">
          <ClaudeCodeChat />
        </div>
        <ol className="grid grid-rows-3">
          {STAGES.map((s) => (
            <li
              key={s.n}
              className="grid grid-cols-[2rem_minmax(0,1fr)] content-center gap-4 px-6 py-5 sm:px-10 sm:py-6"
            >
              <p className="pt-0.5 text-xs text-site-accent-text tabular-nums">{s.n}</p>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {s.heading}
                </h3>
                <p className="mt-1 max-w-[48ch] text-sm leading-relaxed text-pretty text-muted-foreground">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ── The proof ──────────────────────────────────────────────────────── */}
      <SectionHead title="Compare the output." />
      <div className="border-b border-border px-6 py-8 sm:px-10 sm:py-10">
        <SlopCompare />
      </div>

      {/* ── The skills, by the job they do ─────────────────────────────────── */}
      <SectionHead
        title="Meet your new collaborators"
        action={
          /* -my-1 keeps the 44px hit area (A11Y-4) while letting the flex line stay
             as tall as the heading, so this band matches the ones without an action
             instead of standing 11px taller (LAY-6). The box still measures 44px;
             only its contribution to the line height shrinks. */
          <Link
            href="/harness/skills"
            className={`-my-1 inline-flex min-h-11 items-center text-sm font-medium text-site-accent-text underline underline-offset-4 ${focusRing}`}
          >
            See all skills
          </Link>
        }
      />
      <ul className="grid border-b border-border sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED_SKILLS.map((skill) => (
          <li
            key={skill.role}
            data-skill-card
            className="-mr-px -mb-px border-r border-b border-border px-6 py-8 sm:px-10 sm:py-10"
          >
            <SkillMark role={skill.role} />
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
              {skill.role}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">
              {skill.description}
            </p>
            <p className="mt-4 border-t border-border pt-3 text-sm break-words text-muted-foreground">
              {skill.command ? (
                <Cmd>/dx-harness:{skill.command}</Cmd>
              ) : (
                skill.note
              )}
            </p>
          </li>
        ))}
      </ul>

      {/* ── Close. The action steps down to outline: the hero already holds the
             page's one filled primary (CMP-5). ──────────────────────────────── */}
      <section className="grid bg-site-accent-wash lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="px-6 py-16 sm:px-10 sm:py-20">
          <h2 className="max-w-[20ch] text-3xl leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            A shared language for you and your agent.
          </h2>
          <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-pretty text-(--prose-body)">
            DX Harness bridges human judgment and agent execution. It gives both of you
            the same design language and the checks to build safely on each other’s work.
          </p>
          <div className="mt-8">
            <Link
              href="/harness/install"
              className={`inline-flex min-h-11 items-center rounded-lg border border-muted-foreground bg-surface px-5 text-sm font-semibold text-foreground transition-colors duration-(--motion-fast) hover:border-foreground hover:bg-accent ${focusRing}`}
            >
              Quick start
            </Link>
          </div>
        </div>
        <figure className="grid grid-cols-3 border-t border-border lg:border-t-0">
          {COLLABORATORS.map((item) => (
            <div
              key={item.artKey}
              className="flex min-w-0 flex-col items-center justify-center px-3 py-8 text-center"
              style={{ "--ink": item.ink } as CSSProperties}
            >
              <CollaborationIcon artKey={item.artKey} />
              <p className="mt-4 text-sm font-semibold text-foreground">{item.label}</p>
              <p className="mt-1 text-xs leading-normal text-muted-foreground">{item.detail}</p>
            </div>
          ))}
          <figcaption className="sr-only">
            DX Harness bridges your direction and judgment with your agent’s skills and
            execution.
          </figcaption>
        </figure>
      </section>
    </div>
  );
}
