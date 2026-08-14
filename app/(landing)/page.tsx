import type { CSSProperties } from "react";
import Link from "next/link";
import { SlopCompare } from "@/components/compare";
import { inkFilter, inkIcons, inkStroke } from "@/components/ink-icons.generated";
import { FEATURED_SKILLS } from "@/components/landing/data";
import { DxdConstructionPreview } from "@/components/landing/dxd-construction-preview";
import { FeatureFigure, type FeatureFigureKind } from "@/components/landing/feature-figure";
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
   content in cells below it. The heading carries the hierarchy — 30px over the
   18px headings inside, a 1.67x step (SLP-6). */
function SectionHead({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border bg-sheet-band px-6 py-8 sm:px-10">
      <h2 className="max-w-[22ch] text-3xl font-semibold tracking-tight text-balance text-foreground">
        {title}
      </h2>
      <p className="mt-2 max-w-[48ch] text-base text-pretty text-muted-foreground">{children}</p>
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

const SKILL_MARK_EYES = (
  <>
    <circle cx="26" cy="29" r="3" fill="var(--surface)" />
    <circle cx="38" cy="29" r="3" fill="var(--surface)" />
  </>
);

function SkillMark({ role }: { role: string }) {
  const common = {
    className: "size-16 shrink-0",
    viewBox: "0 0 64 64",
    fill: "none",
    "aria-hidden": true,
    "data-skill-mark": role,
  } as const;
  switch (role) {
    case "Orchestrator":
      return (
        <svg {...common}>
          <rect x="7" y="7" width="50" height="50" rx="16" fill="var(--sec-foundations)" />
          {SKILL_MARK_EYES}
        </svg>
      );
    case "Copy":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="27" fill="var(--sec-guidelines)" />
          {SKILL_MARK_EYES}
        </svg>
      );
    case "Pattern":
      return (
        <svg {...common}>
          <path d="M31 5c3-1 6 1 8 5l20 37c3 6-1 12-8 12H13c-7 0-11-7-7-13L26 10c1-3 3-4 5-5Z" fill="var(--sec-getting-started)" />
          {SKILL_MARK_EYES}
        </svg>
      );
    case "Polish":
      return (
        <svg {...common}>
          <path d="M32 5 59 32 32 59 5 32 32 5Z" fill="var(--sec-getting-started)" />
          {SKILL_MARK_EYES}
        </svg>
      );
    case "Execute":
      return (
        <svg {...common}>
          <path d="M18 6h28l14 26-14 26H18L4 32 18 6Z" fill="var(--sec-principles)" />
          {SKILL_MARK_EYES}
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="5" y="13" width="54" height="38" rx="19" fill="var(--sec-standards)" />
          {SKILL_MARK_EYES}
        </svg>
      );
  }
}

const FEATURES = [
  {
    figure: "FIG 0.2",
    kind: "orchestrator" as FeatureFigureKind,
    eyebrow: "Orchestrator skill",
    claim: "Start with a plain-language request.",
    support: (
      <>
        <Cmd>dx-design</Cmd> understands what you want and brings in the right skills. Call
        it directly, or let it step in when a request needs design work.
      </>
    ),
  },
  {
    figure: "FIG 0.3",
    kind: "catalog" as FeatureFigureKind,
    eyebrow: "Control catalog",
    claim: "Shared design guidance agents can use.",
    support: (
      <>
        The catalog turns good interface design into clear context that every skill can
        read and check.
      </>
    ),
  },
  {
    figure: "FIG 0.4",
    kind: "design-file" as FeatureFigureKind,
    eyebrow: "DESIGN.md",
    claim: "Your product’s design language.",
    support: (
      <>
        Keep the decisions that make your product distinct in its repository. Every agent
        works from the same context as the product grows.
      </>
    ),
  },
  {
    figure: "FIG 0.5",
    kind: "review" as FeatureFigureKind,
    eyebrow: "Review skill",
    claim: "A review grounded in both.",
    support: (
      <>
        A separate reviewer checks the work against the control catalog and{" "}
        <Cmd>DESIGN.md</Cmd>, then returns specific findings before the work ships.
      </>
    ),
  },
];

const STAGES = [
  {
    n: "01",
    heading: "Your prompt",
    where: "Claude Code",
    body: "“Make this lesson planner easier to scan and keep it consistent with our product.”",
  },
  {
    n: "02",
    heading: "The harness at work",
    where: "runs automatically",
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
    where: "back in your product",
    body:
      "Execute makes the approved change. A separate review checks the result before it comes back to you.",
  },
];

export default function Landing() {
  return (
    <div>
      {/* ── Hero: the claim and the working logo studio ────────────────── */}
      <section className="grid border-b border-border lg:grid-cols-2">
        <div className="border-border px-6 py-16 sm:px-10 sm:py-20 lg:border-r">
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
      <SectionHead title="What the harness gives your agent.">
        Four parts keep every design request grounded in the same language and standards.
      </SectionHead>
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
            <div className="px-6 py-6 sm:px-10 sm:py-8">
              <p className="text-xs font-semibold tracking-wide break-words text-site-accent-text">
                {f.eyebrow}
              </p>
              <h3 className="mt-3 max-w-[24ch] text-lg font-semibold tracking-tight text-balance text-foreground">
                {f.claim}
              </h3>
              <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-pretty text-muted-foreground">
                {f.support}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* ── How it works: a real request moving through the harness ─────────── */}
      <SectionHead title="From a request to a reviewed result.">
        Speak your intent, collaborate on the same standard, and get better design
        outcomes.
      </SectionHead>
      <div className="grid border-b border-border lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="flex items-center justify-center border-border px-6 py-8 max-lg:border-b lg:border-r">
          <ClaudeCodeChat />
        </div>
        <ol>
          {STAGES.map((s) => (
            <li
              key={s.n}
              className="grid grid-cols-[2rem_minmax(0,1fr)] gap-4 border-b border-border px-6 py-4 last:border-b-0 sm:px-10"
            >
              <p className="pt-0.5 text-xs text-site-accent-text tabular-nums">{s.n}</p>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {s.heading}
                </h3>
                <p className="text-xs text-muted-foreground">{s.where}</p>
                <p className="mt-1 max-w-[48ch] text-sm leading-relaxed text-pretty text-muted-foreground">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ── The proof ──────────────────────────────────────────────────────── */}
      <SectionHead title="Compare the output.">
        Move the divider to see the same brief with and without the harness.
      </SectionHead>
      <div className="border-b border-border px-6 py-8 sm:px-10">
        <SlopCompare />
      </div>

      {/* ── The skills, by the job they do ─────────────────────────────────── */}
      <SectionHead title="Meet your new collaborators">
        Six roles cover the path from an open request to a reviewed interface. DX Design
        calls the right ones for you.
      </SectionHead>
      <ul className="grid border-b border-border sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED_SKILLS.map((skill) => (
          <li key={skill.number} className="-mr-px -mb-px border-r border-b border-border px-6 py-6 sm:px-10 sm:py-8">
            <div className="flex items-start justify-between gap-4">
              <SkillMark role={skill.role} />
              <p className="text-xs text-site-accent-text tabular-nums">{skill.number}</p>
            </div>
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
      <p className="border-b border-border px-6 py-4 sm:px-10">
        <Link
          href="/harness/skills"
          className={`inline-flex min-h-11 items-center text-sm font-medium text-site-accent-text underline underline-offset-4 ${focusRing}`}
        >
          See all skills
        </Link>
      </p>

      {/* ── Close. The action steps down to outline: the hero already holds the
             page's one filled primary (CMP-5). ──────────────────────────────── */}
      <section className="grid bg-site-accent-wash lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="px-6 py-16 sm:px-10">
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
