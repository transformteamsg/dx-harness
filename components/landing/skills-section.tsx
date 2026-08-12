"use client";

/* SkillsSection — the homepage's skills block: everything below the section
   heading and lede, which the page places.

   Two parts, in this order:

   1. The hero (#75, resolved). The same brief run twice, with a name on every
      difference. The right-hand panel is a depiction of a product screen, so
      it gets image treatment — a hairline outline drawn from --foreground,
      nothing of the page's own chrome inside it — and it carries no markers
      at rest. The numbered rows underneath are the key: pointing at or
      focusing a row outlines the region that row changed, so the link between
      a change and the skill that proposed it survives without tattooing the
      product. Only opacity transitions, so an interrupted hover reverses from
      wherever it got to (never `transition: all`, MOT-2).

   2. The directory. One bordered grid of hairline cells, grouped by the job
      each skill does in the flow — a role holds whatever context the reader
      arrives in, which a "when you're …" grouping does not.

   The left-hand panel is a quarantined anti-specimen. Every violation in it is
   deliberate and waived inline, it is drawn only from the --demo-slop-* tokens
   (never from product colour), and every text/background pair still clears
   WCAG AA — A11Y-1 is never demonstrated broken. It is a second exhibit of the
   same screen components/compare.tsx carries further up the page, on purpose:
   one running example, argued twice. It names no control IDs, because the
   proof section above already does that and two blocks making the same
   argument read as a repeat. */

import Link from "next/link";
import { useState } from "react";
import {
  CURATED_SKILLS,
  SKILL_COUNT,
  SKILL_DIRECTORY,
} from "@/components/landing/data";

const SLOP_GRADIENT =
  "linear-gradient(135deg, var(--demo-slop-grad-a), var(--demo-slop-grad-b))";

const SLOP_TILES = ["AI-powered", "All-in-one", "Cloud-based"] as const;

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)";

/* Image treatment: both panels are pictures of a screen, not page furniture.
   A hairline lifted off --foreground separates the picture from the near-black
   page without the page's --border reading as part of the product. */
const panelFrame = "flex-1 overflow-hidden rounded-lg ring-1 ring-foreground/10";

type Attribution = {
  n: number | null;
  skill: string;
  what: string;
};

/* Rows 1–4 are proposals and each points at a region of the after panel; the
   last row is the build, which has no region of its own — it made all four. */
const ATTRIBUTIONS: Attribution[] = [
  {
    n: 1,
    skill: "dx-design-copy",
    what: "Named the screen after what it does. No teacher calls anything a communication hub.",
  },
  {
    n: 2,
    skill: "dx-design-copy",
    what: "Rewrote the lede as a promise you can check: who it reaches, and by when.",
  },
  {
    n: 3,
    skill: "dx-design-pattern",
    what: "Flattened the box inside a box into one divided row. Same information, one less frame.",
  },
  {
    n: 4,
    skill: "dx-design-polish",
    what: "Stepped the second button down, leaving one primary action.",
  },
  {
    n: null,
    skill: "dx-design-execute",
    what: "Built the four changes you accepted. It is the only skill here that touched a file.",
  },
];

/* The command as you would type it. The prefix greys back so the skill name
   is what you read, and the whole string stays selectable and exact. */
function Command({ skill }: { skill: string }) {
  return (
    <span className="font-mono text-sm text-foreground">
      <span className="text-muted-foreground">/dx-harness:</span>
      {skill}
    </span>
  );
}

function Chip({ tone, children }: { tone: "bad" | "good"; children: string }) {
  const paint =
    tone === "bad"
      ? "border-danger-muted bg-danger-subtle text-danger"
      : "border-success-muted bg-success-subtle text-success";
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-1.5 py-px text-xs font-medium leading-4 whitespace-nowrap ${paint}`}
    >
      {children}
    </span>
  );
}

/* A region of the after panel a row can point at. Invisible at rest — the
   outline is the only thing that ever appears over the product. */
function Region({
  n,
  active,
  className,
  children,
}: {
  n: number;
  active: number | null;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative ${className ?? ""}`}>
      {children}
      <span
        aria-hidden
        data-active={active === n}
        className="pointer-events-none absolute -inset-x-2 -inset-y-1 rounded-sm opacity-0 ring-1 ring-primary transition-opacity duration-(--motion-fast) ease-(--ease-out) data-[active=true]:opacity-100 motion-reduce:transition-none"
      />
    </div>
  );
}

/* The anti-specimen: what the brief produces with nothing watching. Actions
   render as spans — a picture of a screen has no working buttons, and the
   figure keeps no focus stops of its own. */
function BeforePanel() {
  return (
    <div
      role="group"
      aria-label="Before: the same brief, written by an agent with no skills running"
      className={`${panelFrame} flex flex-col bg-(--demo-slop-surface)`}
    >
      {/* dx-waive SLP-1 reason="quarantined anti-specimen: the unattended panel of the skills hero" */}
      {/* dx-waive CNT-2 reason="quarantined anti-specimen: 'Communication Hub' is the invented …Hub name the control bans, shown as the exhibit" */}
      <div
        className="px-4 py-2.5 text-sm text-(--demo-slop-foreground)"
        style={{ background: SLOP_GRADIENT }}
      >
        Communication Hub
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        <p className="text-sm font-semibold text-(--demo-slop-ink)">Term 3 broadcast</p>
        {/* dx-waive SLP-9 reason="quarantined anti-specimen: the unattended panel of the skills hero" */}
        <p className="max-w-[46ch] text-sm leading-normal text-(--demo-slop-ink)">
          Revolutionise your seamless communication workflow and unlock
          engagement at scale.
        </p>
        {/* dx-waive SLP-4 reason="quarantined anti-specimen: the unattended panel of the skills hero" */}
        <div className="rounded-lg border border-(--demo-slop-border) p-2.5 text-sm text-(--demo-slop-ink)">
          Audience
          <div className="mt-2 rounded-md border border-(--demo-slop-border) bg-(--demo-slop-surface) p-2.5">
            4 classes · 127 parents
          </div>
        </div>
        {/* dx-waive SLP-5 reason="quarantined anti-specimen: the icon-tile grid is the exhibited default, same waiver family as the panel's other violations" */}
        <div className="grid shrink-0 grid-cols-3 gap-2">
          {SLOP_TILES.map((tile) => (
            <div
              key={tile}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-(--demo-slop-border) px-1 py-3 text-center text-xs text-(--demo-slop-ink)"
            >
              <span
                aria-hidden
                className="size-7 shrink-0 rounded-md"
                style={{ background: SLOP_GRADIENT }}
              />
              {tile}
            </div>
          ))}
        </div>
        {/* dx-waive CMP-5 reason="quarantined anti-specimen: two competing primaries are the exhibit" */}
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-(--demo-slop-grad-a) px-3.5 py-2 text-sm text-(--demo-slop-foreground) shadow-[0_2px_10px_var(--demo-slop-glow)]">
            Get started!
          </span>
          <span className="rounded-md bg-(--demo-slop-grad-a) px-3.5 py-2 text-sm text-(--demo-slop-foreground) shadow-[0_2px_10px_var(--demo-slop-glow)]">
            Learn more
          </span>
        </div>
      </div>
    </div>
  );
}

/* The same brief after the skills ran. Ordinary tokens, one primary action,
   and — at rest — nothing on it that belongs to this page. */
function AfterPanel({ active }: { active: number | null }) {
  return (
    <div
      role="group"
      aria-label="After: the same brief, once the design skills had run"
      className={`${panelFrame} flex flex-col bg-surface p-5`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <Region n={1} active={active}>
          <p className="font-display text-base font-semibold tracking-tight text-foreground">
            Term 3 broadcast
          </p>
        </Region>
        <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-muted px-1.5 py-px text-xs font-medium leading-4 whitespace-nowrap text-muted-foreground">
          Draft
        </span>
      </div>
      <Region n={2} active={active} className="mt-2">
        <p className="max-w-[44ch] text-sm leading-normal text-muted-foreground">
          Reaches every parent by Friday morning. Drafts save on their own.
        </p>
      </Region>
      <Region n={3} active={active} className="mt-4 border-t border-border pt-3">
        <p className="text-sm text-foreground">
          To: <span className="font-medium">4 classes</span>
          <span className="text-muted-foreground"> · 127 parents</span>
        </p>
      </Region>
      <p className="mt-3 max-w-[46ch] text-sm leading-normal text-muted-foreground">
        Attachments carry over from Term 2. Parents without an app account get
        an SMS.
      </p>
      <Region
        n={4}
        active={active}
        className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border pt-4"
      >
        <p className="text-xs text-muted-foreground">Saved just now</p>
        <span className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Save draft</span>
          <span className="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground">
            Send to 4 classes
          </span>
        </span>
      </Region>
    </div>
  );
}

function AttributedHero() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <figure>
      <div className="grid items-stretch gap-x-4 gap-y-6 sm:grid-cols-2">
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="font-mono text-xs text-muted-foreground">
              agent, unattended
            </span>
            <Chip tone="bad">no skills ran</Chip>
          </div>
          <BeforePanel />
        </div>
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="font-mono text-xs text-muted-foreground">
              agent, on the harness
            </span>
            <Chip tone="good">five skills ran</Chip>
          </div>
          <AfterPanel active={active} />
        </div>
      </div>

      <figcaption className="mt-6">
        <p className="max-w-[74ch] text-sm leading-relaxed text-muted-foreground">
          <Command skill="dx-design-critique" /> graded the screen on the left
          and named what was wrong with it. Four of its findings became the
          changes on the right.
        </p>
        <ol className="mt-3 grid gap-px overflow-hidden rounded-lg border border-border bg-border">
          {ATTRIBUTIONS.map((row) => {
            const cells = (
              <>
                <span
                  aria-hidden={row.n === null}
                  className="font-mono text-xs font-medium text-tw-blue-text"
                >
                  {row.n ?? "▸"}
                </span>
                <Command skill={row.skill} />
                <span className="col-start-2 text-sm leading-relaxed text-muted-foreground sm:col-start-3">
                  {row.what}
                </span>
              </>
            );
            const layout =
              "grid min-h-11 grid-cols-[1.25rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 px-4 py-3 text-left sm:grid-cols-[1.25rem_minmax(0,16rem)_minmax(0,1fr)]";
            return (
              <li key={`${row.n ?? "built"}-${row.skill}`} className="bg-surface">
                {row.n === null ? (
                  <div className={layout}>{cells}</div>
                ) : (
                  /* Pointer, keyboard and touch all reach the same state: the
                     row is a real button, so a tap focuses it and the outline
                     appears where a hover would have put it. */
                  <button
                    type="button"
                    onMouseEnter={() => setActive(row.n)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(row.n)}
                    onBlur={() => setActive(null)}
                    className={`${layout} ${focusRing} w-full transition-colors duration-(--motion-fast) ease-(--ease-out) hover:bg-muted motion-reduce:transition-none`}
                  >
                    {cells}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          left panel = quarantined anti-specimen · dx-waive SLP-1/4/5/9, CMP-5,
          CNT-2
        </p>
      </figcaption>
    </figure>
  );
}

function Directory() {
  return (
    <div className="mt-16 border-t border-border pt-12">
      <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
        Where each skill sits
      </h3>
      <p className="mt-2 max-w-[62ch] leading-relaxed text-muted-foreground">
        Every skill installs with the plugin. Start with the design loop if
        you&rsquo;re not sure where to begin.
      </p>

      <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {SKILL_DIRECTORY.map((group) => (
          <section key={group.number} className="flex flex-col bg-surface px-5 py-5">
            <h4 className="flex items-baseline gap-2.5 font-display text-lg font-semibold tracking-tight text-foreground">
              <span className="font-mono text-xs font-medium text-tw-blue-text">
                {group.number}
              </span>
              {group.heading}
            </h4>
            <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-muted-foreground">
              {group.role}
            </p>
            <ul aria-label={group.heading} className="mt-4 flex flex-wrap gap-1.5">
              {group.skills.map((skill) => (
                <li
                  key={skill.name}
                  className="flex items-baseline gap-1.5 rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs whitespace-nowrap text-(--prose-body)"
                >
                  {skill.name}
                  {skill.planned && (
                    <span className="font-body text-xs text-muted-foreground">
                      planned
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {/* Not a link: it is the command to type, and every one of them
                works today (CNT-4 — the planned skill is never the start). */}
            <div className="mt-auto pt-5">
              <p className="flex flex-col gap-0.5 rounded-md border border-(--primary-line) bg-(--primary-wash) px-3 py-2">
                <span className="text-xs text-muted-foreground">Start with</span>
                <span className="font-mono text-xs text-tw-blue-text [overflow-wrap:anywhere]">
                  /dx-harness:{group.start}
                </span>
              </p>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-4">
        <Link
          href="/harness/skills"
          className={`inline-flex min-h-11 items-center text-sm font-medium text-tw-blue-text underline underline-offset-2 ${focusRing}`}
        >
          See all {SKILL_COUNT} skills
        </Link>
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-border-strong bg-accent px-5 py-5">
        <p className="font-display text-base font-semibold tracking-tight text-foreground">
          We build ours, and curate the best of the rest.
        </p>
        <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">
          We didn&rsquo;t write these three and we don&rsquo;t maintain them.
          They carry no catalog behind them.
        </p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          {CURATED_SKILLS.map((skill) => (
            <div key={skill.name}>
              <dt className="font-mono text-sm text-foreground">{skill.name}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {skill.text}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export function SkillsSection() {
  return (
    <div className="mt-8">
      <AttributedHero />
      <Directory />
    </div>
  );
}
