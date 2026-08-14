import Link from "next/link";
import { SlopCompare } from "@/components/compare";
import { Blueprint } from "@/components/landing/blueprint";
import { SKILL_COUNT, SKILL_DIRECTORY } from "@/components/landing/data";
import { HarnessMap } from "@/components/landing/harness-map";

export const metadata = {
  /* Absolute: the root template appends "— TFX Design Standard", which would sit
     oddly on the harness's own front page. */
  title: { absolute: "dx-harness — design skills your agent runs" },
  description:
    "A Claude Code plugin that carries a design loop, a checkable standards catalog, and a design reviewer into your agent.",
  alternates: { types: { "text/markdown": "/index.md" } },
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)";

/* Commands and file names sit on a muted chip, and the chip is what marks them as
   code — not a third typeface. `font-body` is load-bearing: a bare <code> inherits
   the browser's default monospace, which puts a face outside Plus Jakarta Sans and
   Inter on the page (TYP-1, L1, no waiver held here). The docs prose has always
   rendered inline code in that UA monospace; that is a pre-existing gap this page
   declines to widen, not one it invented. */
function Cmd({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-sm bg-muted px-1.5 py-0.5 font-body text-[0.9em] text-foreground">
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
      <p className="mt-2 max-w-[58ch] text-base text-pretty text-muted-foreground">{children}</p>
    </div>
  );
}

const FEATURES = [
  {
    eyebrow: "/dx-harness:dx-design",
    claim: "One way in. One way to ship.",
    support: (
      <>
        Ask in plain words. <Cmd>dx-design</Cmd> routes you to the right pass, and only{" "}
        <Cmd>dx-design-execute</Cmd> edits your product.
      </>
    ),
  },
  {
    eyebrow: "Control catalog",
    claim: "Not every rule is a lint check.",
    support: (
      <>
        Every control carries a tier, so you know which rules never bend and which leave
        room for judgement.
      </>
    ),
  },
  {
    eyebrow: "DESIGN.md",
    claim: "Your design language, written down once.",
    support: (
      <>
        Keep product decisions and standing overrides in one file the whole team, human
        and agent, can work from.
      </>
    ),
  },
  {
    eyebrow: "Independent review",
    claim: "The builder never grades its own work.",
    support: (
      <>
        A fresh-context reviewer reads the contract, screenshots, and controls, then sends
        findings back through the same gate for a re-check.
      </>
    ),
  },
];

const STAGES = [
  {
    n: "01",
    heading: <>You</>,
    where: "in the chat",
    body: <>One ask, in plain words. You never pick a skill.</>,
  },
  {
    n: "02",
    heading: (
      <>
        <Cmd>dx-design</Cmd> — the single front door
      </>
    ),
    where: "the harness plugin",
    body: <>The orchestrator grills first, then routes. Rule and waiver questions stop here too.</>,
  },
  {
    n: "03",
    heading: <>The propose-only passes</>,
    where: "dispatched as subagents",
    body: (
      <>
        Copy, flow, pattern, motion, and polish plan for <Cmd>dx-design-execute</Cmd>, the
        one builder.
      </>
    ),
  },
  {
    n: "04",
    heading: <>Shared context</>,
    where: "the harness plugin",
    body: <>Every skill reads the same control catalog, tokens, and components.</>,
  },
  {
    n: "05",
    heading: (
      <>
        <Cmd>DESIGN.md</Cmd>
      </>
    ),
    where: "your product repo",
    body: <>Your product decisions and deviations stay where any agent can read them.</>,
  },
];

export default function Landing() {
  return (
    <div>
      {/* ── Hero: the claim, and the mark on its construction sheet ────────── */}
      <section className="grid border-b border-border lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="border-border px-6 py-16 sm:px-10 sm:py-20 lg:border-r">
          <p className="flex items-center gap-2.5 text-xs font-semibold tracking-wide text-muted-foreground">
            <span aria-hidden="true" className="size-1.5 bg-blueprint-ink" />
            dx-harness
          </p>
          <p className="mt-5 max-w-[34ch] text-xl leading-snug font-semibold tracking-tight text-balance text-muted-foreground">
            A design harness for agents that build interfaces.
          </p>
          <h1 className="mt-5 max-w-[13ch] text-4xl leading-[1.02] font-semibold tracking-tighter text-balance text-foreground sm:text-5xl lg:text-6xl">
            One brief in. One reviewed interface out.
          </h1>
          <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-pretty text-(--prose-body)">
            Your agent already builds the UI. The harness gives it one front door, checkable
            standards, and an independent reviewer before the work ships.
          </p>
          {/* Sentence case, not the caps this rail is often set in: all-caps text
              is a finding (TYP-4), and the words carry the sequence on their own. */}
          <p className="mt-5 text-xs tracking-wide text-muted-foreground">
            Route → build → check → review → ship
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              href="/harness/install"
              className={`inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-(--motion-fast) hover:bg-tw-blue-hover ${focusRing}`}
            >
              Quick start
            </Link>
            <Link
              href="/overview"
              className={`inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors duration-(--motion-fast) hover:text-foreground ${focusRing}`}
            >
              Read the manual
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center px-6 py-10 sm:px-8">
          <Blueprint />
        </div>
      </section>

      {/* ── The four parts ─────────────────────────────────────────────────── */}
      <SectionHead title="Core features of the design harness.">
        The four parts everything else hangs off.
      </SectionHead>
      {/* Cell borders, not per-index rules: every cell draws its own right and
          bottom hairline and is pulled back a pixel, so the outermost ones land
          exactly on the sheet's flank and the section seam. The grid can then
          reflow at any breakpoint without the borders needing to know. */}
      <ul className="grid border-b border-border sm:grid-cols-2">
        {FEATURES.map((f) => (
          <li
            key={f.eyebrow}
            className="-mr-px -mb-px border-r border-b border-border p-6 sm:p-8"
          >
            <p className="text-xs font-semibold tracking-wide break-words text-tw-blue">
              {f.eyebrow}
            </p>
            <h3 className="mt-3 max-w-[24ch] text-lg font-semibold tracking-tight text-balance text-foreground">
              {f.claim}
            </h3>
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-pretty text-muted-foreground">
              {f.support}
            </p>
          </li>
        ))}
      </ul>

      {/* ── How it works: the shape, then the five stages ───────────────────── */}
      <SectionHead title="How it works.">
        The whole harness on one map. You brief one skill; everything else works behind it.
      </SectionHead>
      <div className="grid border-b border-border lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="flex items-center justify-center border-border px-6 py-8 max-lg:border-b lg:border-r">
          <HarnessMap />
        </div>
        <ol>
          {STAGES.map((s) => (
            <li
              key={s.n}
              className="grid grid-cols-[2rem_minmax(0,1fr)] gap-4 border-b border-border px-6 py-4 last:border-b-0 sm:px-8"
            >
              <p className="pt-0.5 text-xs text-tw-blue tabular-nums">{s.n}</p>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {s.heading}
                </h3>
                <p className="text-xs text-muted-foreground">{s.where}</p>
                <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-pretty text-muted-foreground">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ── The proof ──────────────────────────────────────────────────────── */}
      <SectionHead title="See what the harness changes.">
        Drag the divider between the page your agent ships unattended and the same page on
        the harness.
      </SectionHead>
      <div className="border-b border-border px-6 py-8 sm:px-10">
        <SlopCompare />
      </div>

      {/* ── The skills, by the job they do ─────────────────────────────────── */}
      <SectionHead title="Skills collection.">
        Grouped by the job each skill does in the flow. Everything here is one command away.
      </SectionHead>
      <ul className="grid border-b border-border sm:grid-cols-2 lg:grid-cols-3">
        {SKILL_DIRECTORY.map((g) => (
          <li key={g.number} className="-mr-px -mb-px border-r border-b border-border p-6">
            <p className="text-xs text-tw-blue tabular-nums">{g.number}</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
              {g.heading}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">
              {g.role}
            </p>
            {/* Not a link: it is the command to type, and every one of them works. */}
            <p className="mt-4 border-t border-border pt-3 text-xs break-words text-muted-foreground">
              Start with <Cmd>/dx-harness:{g.start}</Cmd>
            </p>
          </li>
        ))}
      </ul>
      <p className="border-b border-border px-6 py-4 sm:px-10">
        <Link
          href="/harness/skills"
          className={`inline-flex min-h-11 items-center text-sm font-medium text-tw-blue underline underline-offset-4 ${focusRing}`}
        >
          See all {SKILL_COUNT} skills
        </Link>
      </p>

      {/* ── Close. The action steps down to outline: the hero already holds the
             page's one filled primary (CMP-5). ──────────────────────────────── */}
      <section className="bg-tw-blue-wash px-6 py-16 sm:px-10">
        <p className="max-w-[20ch] text-3xl leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          Your agent already builds the UI. Give it something to answer to.
        </p>
        <div className="mt-8">
          <Link
            href="/harness/install"
            className={`inline-flex min-h-11 items-center rounded-lg border border-border-strong bg-surface px-5 text-sm font-semibold text-foreground transition-colors duration-(--motion-fast) hover:bg-accent ${focusRing}`}
          >
            Quick start
          </Link>
        </div>
      </section>
    </div>
  );
}
