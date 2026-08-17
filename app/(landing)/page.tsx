import type { CSSProperties } from "react";
import Link from "next/link";
import { SlopCompare } from "@/components/compare";
import { InkIcon } from "@/components/ink-icon";
import { FEATURED_SKILLS } from "@/components/landing/data";
import { DxdConstructionPreview } from "@/components/landing/dxd-construction-preview";
import { FeatureFigure, type FeatureFigureKind } from "@/components/landing/feature-figure";
import { HarnessRun } from "@/components/landing/harness-run";

export const metadata = {
  /* Absolute: the root template is for titled documentation pages; the front page
     carries the product name and its own explainer. */
  title: { absolute: "DX Design Harness — design in code with confidence" },
  description:
    "The DX Design Harness gives coding agents a shared design language, the right skills, and a review before the work returns to you.",
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

const COLLABORATORS = [
  {
    artKey: "landing/human",
    label: "You",
    detail: "Direction and judgment",
    ink: "var(--foreground)",
  },
  {
    artKey: "landing/human-machine",
    label: "DX Design Harness",
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

/* Figure, label, claim — and on demand, the argument. The claim stays the cell's
   voice; the `what`/`why` pair is revealed on hover or focus (and stays open on
   touch, where hover does not exist), so the grid explains itself without four
   support paragraphs stacked down the page. Each card links to the doc page
   that carries the full story, which is also what makes the reveal
   keyboard-reachable (A11Y-2). */
const FEATURES = [
  {
    figure: "FIG 1",
    kind: "orchestrator" as FeatureFigureKind,
    eyebrow: "Orchestrator skill",
    claim: "Start with a plain-language request.",
    href: "/harness/skills",
    what: (
      <>
        You say what you want in your own words. <Cmd>dx-design</Cmd> reads the request
        and brings in only the skills it needs.
      </>
    ),
    why: "No tool names to learn, no pass order to manage. The routing is the harness's job, not yours.",
  },
  {
    figure: "FIG 2",
    kind: "catalog" as FeatureFigureKind,
    eyebrow: "Control catalog",
    claim: "Shared design guidance agents can use.",
    href: "/standards/catalog",
    what: "One machine-readable catalog of design rules, from contrast floors to anti-slop checks. Every skill reads it before it works.",
    why: "Your agent stops guessing at taste. It builds against the same rules your team reads, so results stop drifting run to run.",
  },
  {
    figure: "FIG 3",
    kind: "design-file" as FeatureFigureKind,
    eyebrow: "DESIGN.md",
    claim: "Your product’s design language.",
    href: "/harness/skills#the-design-language",
    what: "One file in your repo that holds your colours, type, motion, and voice. The same primitives, arranged your way.",
    why: "The result looks like your product, not like a page any model would make for anyone.",
  },
  {
    figure: "FIG 4",
    kind: "review" as FeatureFigureKind,
    eyebrow: "Review skill",
    /* Names both things it checks against. "A review grounded in both." relied on
       a support paragraph that this page no longer carries, so "both" pointed at
       nothing on screen (CNT-14). */
    claim: "A review against the catalog and your DESIGN.md.",
    href: "/harness/loop",
    what: "A separate reviewer grades the built result against both sources before it returns.",
    why: "Misses are caught inside the run, so you are not the first quality check.",
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
            The DX Design Harness gives your coding agent a shared design language and
            the right skills for each task. It reviews the work before it comes back to
            you.
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
            <Link
              href={f.href}
              data-feature-card
              className={`group flex h-full flex-col ${focusRing} focus-visible:-outline-offset-2`}
            >
              <FeatureFigure kind={f.kind} number={f.figure} />
              <div className="px-6 py-8 sm:px-10 sm:py-10">
                <p className="text-xs font-semibold tracking-wide break-words text-site-accent-text">
                  {f.eyebrow}
                </p>
                <h3 className="mt-3 max-w-[24ch] text-lg font-semibold tracking-tight text-balance text-foreground">
                  {f.claim}
                </h3>
                {/* What it is, then why it matters — clipped until the card is
                    hovered or focused; always open where hover doesn't exist
                    (coarse pointers), so nothing is locked behind a mouse. */}
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-(--motion-base) ease-(--ease-out) group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr] pointer-coarse:grid-rows-[1fr] motion-reduce:transition-none">
                  <div data-feature-explain className="min-h-0 overflow-hidden">
                    <p className="max-w-[52ch] pt-3 text-sm leading-relaxed text-pretty text-muted-foreground">
                      {f.what}
                    </p>
                    <p className="max-w-[52ch] pt-2 text-sm leading-relaxed text-pretty text-(--prose-body)">
                      <span className="font-semibold text-site-accent-text">
                        Why it matters
                      </span>{" "}
                      — {f.why}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* ── How it works: a real request played through the harness. The player
             auto-plays once in view and the three stages double as scrub
             buttons; the component carries the two-half grid so the stage
             highlight and the drawing stay in one client boundary. ─────────── */}
      <SectionHead title="From a request to a reviewed result." />
      <HarnessRun />

      {/* ── The proof. The comparison is evidence, not the argument — so the claim
             and the three passes that produce it sit beside it. A 40/60 split
             (not the page's usual 50/50) is the builder's chosen trade: the claim
             column holds 33ch instead of 30/70's 23ch. That only leaves the slider
             enough width for its 16:10 frame to bind on its own aspect-ratio
             (rather than the anti-specimen's content-driven height floor) if the
             right cell also gives up its horizontal padding at `lg` — so the
             evidence runs full-bleed in its cell (flush to the column seam on the
             left, the container edge on the right) while the claim column keeps
             its measure. A deliberate LAY-6/CMP-7 deviation, not an accident. ─── */}
      <div className="grid border-b border-border lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col justify-center border-border px-6 py-8 max-lg:border-b sm:px-10 sm:py-10 lg:border-r">
          <h2 className="max-w-[22ch] text-3xl font-semibold tracking-tight text-balance text-foreground">
            Compare the output.
          </h2>
          <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-pretty text-(--prose-body)">
            The same brief, run twice. Drag the handle to see what three passes
            change when they read the catalog.
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            <li className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <span className="mt-px shrink-0">
                <InkIcon name="skills/copy" size={18} ink="var(--foreground)" idSuffix="-cmp" />
              </span>
              <span>
                <span className="font-semibold text-foreground">Copy</span> turns
                the buzzwords into plain language a teacher would use.
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <span className="mt-px shrink-0">
                <InkIcon name="skills/pattern" size={18} ink="var(--foreground)" idSuffix="-cmp" />
              </span>
              <span>
                <span className="font-semibold text-foreground">Pattern</span> pulls
                the nested cards apart and drops the icon tiles.
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <span className="mt-px shrink-0">
                <InkIcon name="skills/polish" size={18} ink="var(--foreground)" idSuffix="-cmp" />
              </span>
              <span>
                <span className="font-semibold text-foreground">Polish</span> drops
                the gradients and the second primary for your own tokens.
              </span>
            </li>
          </ul>
          <p className="mt-6 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
            Every chip on the left panel is a control ID from the{" "}
            <Link
              href="/standards/catalog"
              className={`text-site-accent-text underline underline-offset-2 ${focusRing}`}
            >
              catalog
            </Link>
            .
          </p>
        </div>
        <div className="flex min-w-0 flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 lg:px-0">
          <SlopCompare />
        </div>
      </div>

      {/* ── The skills, by the job they do. Tool marks, not mascots: these are
             skills your agent picks up, so each card shows its tool through the
             Icon Generator's Ink preset. ──────────────────────────────────── */}
      <SectionHead
        title="The skills inside the harness."
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
            data-skill-tool
            className="-mr-px -mb-px border-r border-b border-border px-6 py-8 sm:px-10 sm:py-10"
          >
            <div className="grid size-16 place-items-center rounded-xl border border-border bg-site-accent-wash">
              <InkIcon name={skill.icon} size={36} ink="var(--foreground)" />
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

      {/* ── Close. The action steps down to outline: the hero already holds the
             page's one filled primary (CMP-5). ──────────────────────────────── */}
      <section className="grid bg-site-accent-wash lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="px-6 py-16 sm:px-10 sm:py-20">
          <h2 className="max-w-[20ch] text-3xl leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            A shared language for you and your agent.
          </h2>
          <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-pretty text-(--prose-body)">
            The DX Design Harness bridges human judgment and agent execution. It gives
            both of you the same design language and the checks to build safely on each
            other’s work.
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
        {/* Icon, label, and detail each pin to their own grid row (row-start-*),
            shared across all three columns — so the middle label's wrap to two
            lines (the product name is longer than "You"/"Your agent") grows only
            the label row, and every column's detail line still lands on the same
            baseline (LAY-6). The per-item DOM order (icon, label, detail) is kept
            for the accessible reading order; only the visual placement is a grid. */}
        <figure className="grid grid-cols-3 grid-rows-3 items-start border-t border-border lg:border-t-0">
          {COLLABORATORS.flatMap((item) => [
            <div
              key={`${item.artKey}-icon`}
              className="row-start-1 flex min-w-0 justify-center px-3 pt-8"
              style={{ "--ink": item.ink } as CSSProperties}
            >
              <InkIcon name={item.artKey} size={48} />
            </div>,
            <p
              key={`${item.artKey}-label`}
              className="row-start-2 mt-4 min-w-0 px-3 text-center text-sm font-semibold text-foreground"
            >
              {item.label}
            </p>,
            <p
              key={`${item.artKey}-detail`}
              className="row-start-3 mt-1 min-w-0 px-3 pb-8 text-center text-xs leading-normal text-muted-foreground"
            >
              {item.detail}
            </p>,
          ])}
          <figcaption className="sr-only">
            The DX Design Harness bridges your direction and judgment with your agent’s
            skills and execution.
          </figcaption>
        </figure>
      </section>
    </div>
  );
}
