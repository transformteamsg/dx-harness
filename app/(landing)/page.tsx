import Link from "next/link";
import { SlopCompare } from "@/components/compare";
import { InkIcon } from "@/components/ink-icon";
import { FEATURED_SKILLS } from "@/components/landing/data";
import { DxdConstructionPreview } from "@/components/landing/dxd-construction-preview";
import { IlloVideo } from "@/components/landing/illo-video";
import { HarnessRun } from "@/components/landing/harness-run";

export const metadata = {
  /* Absolute: the root template is for titled documentation pages; the front page
     carries the product name and its own explainer. */
  title: { absolute: "DX Design Harness — design in code with confidence" },
  description:
    "The DX Design Harness gives your coding agent a shared design language, the right skills, and a review before the work returns to you.",
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

/* Three illustrated rows, from the builder's reference (2026-08-18): each pairs a
   hand-drawn clip with its claim, and "why it matters" reads inline instead of
   behind a hover. The review card left this section with that reference — its
   message stays on this page in the run's stage 03 and the skills table. */
const FEATURES = [
  {
    eyebrow: "Orchestrator skill",
    claim: "Start with a plain-language request.",
    video: "/landing/illo-orchestrator.mp4",
    poster: "/landing/illo-orchestrator-poster.jpg",
    flip: false,
    what: (
      <>
        You say what you want in your own words. <Cmd>dx-design</Cmd> reads the request
        and brings in only the skills it needs.
      </>
    ),
    why: "No tool names to learn, no pass order to manage. The routing is the harness's job, not yours.",
  },
  {
    eyebrow: "The catalog",
    claim: "Shared design guidance agents can use.",
    video: "/landing/illo-catalog.mp4",
    poster: "/landing/illo-catalog-poster.jpg",
    flip: true,
    what: "One machine-readable catalog of design rules, from contrast floors to anti-slop checks. Every skill reads it before it works.",
    why: "Your agent stops guessing at taste. It builds against the same rules your team reads, so results stop drifting run to run.",
  },
  {
    eyebrow: "Design language skill",
    claim: "A design language your team owns.",
    video: "/landing/illo-design-file.mp4",
    poster: "/landing/illo-design-file-poster.jpg",
    flip: false,
    what: (
      <>
        <Cmd>dx-design-language</Cmd> reads your code, asks what it cannot infer, and
        writes a <Cmd>DESIGN.md</Cmd> into your repo: your colours, type, motion, and
        voice. Anyone on the team can edit it from there.
      </>
    ),
    why: "The language lives with your product, so designers and engineers improve it directly instead of filing a request.",
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

      {/* ── The three parts ────────────────────────────────────────────────── */}
      <SectionHead title="What the harness gives your agent." />
      {/* Alternating illustrated rows: the clip and its claim swap sides each
          row at lg. DOM order keeps the illustration first, so below lg every
          row reads illustration-then-text in one consistent rhythm; the flip
          is purely visual (lg:order-2) and the seam hairline follows it. */}
      <ul className="border-b border-border">
        {FEATURES.map((f) => (
          <li key={f.eyebrow} className="grid border-b border-border last:border-b-0 lg:grid-cols-2">
            <div
              data-feature-illo
              className={`grid place-items-center border-border bg-surface px-6 py-10 max-lg:border-b sm:p-12 ${
                f.flip ? "lg:order-2 lg:border-l" : "lg:border-r"
              }`}
            >
              <IlloVideo src={f.video} poster={f.poster} />
            </div>
            <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12">
              <p className="text-xs font-semibold tracking-wide break-words text-site-accent-text">
                {f.eyebrow}
              </p>
              <h3 className="mt-3 max-w-[24ch] text-xl font-semibold tracking-tight text-balance text-foreground">
                {f.claim}
              </h3>
              <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-pretty text-muted-foreground">
                {f.what}
              </p>
              <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-pretty text-(--prose-body)">
                <span className="font-semibold text-site-accent-text">Why it matters</span>{" "}
                — {f.why}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* ── How it works: a real request played through the harness. The player
             auto-plays once in view and the three stages double as scrub
             buttons; the component carries the two-half grid so the stage
             highlight and the drawing stay in one client boundary. ─────────── */}
      <SectionHead title="From a request to a reviewed result." />
      <HarnessRun />

      {/* ── The builders' word, between the proof of how it runs and the proof of
             what it changes. One outlined action (CMP-5: the hero keeps the
             page's only filled primary).

             The band is the page's own statement — no blockquote, no signature,
             no attribution line. It began as a `blockquote cite="/note"` carrying
             words that appear nowhere in the note, which is an attribution the
             note could not support; the signature and the note link that replaced
             it were cut on the builder's ruling of 2026-08-18, leaving the words
             to stand on their own. `/note` is still one click away in the nav on
             this layout, so nothing is orphaned. The band holds the closing
             section's wash, so this voice and the close read as one ground rather
             than two. ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-site-accent-wash px-6 py-14 sm:px-10 sm:py-16">
        <p className="max-w-[36ch] text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
          The harness is our product too, and we spent this build on how it feels
          to use. Start with one request in your own words, even if you do not
          write code every day.
        </p>
        <div className="mt-6">
          <Link
            href="/harness/install"
            className={`inline-flex min-h-11 items-center rounded-lg border border-muted-foreground bg-surface px-5 text-sm font-semibold text-foreground transition-colors duration-(--motion-fast) hover:border-foreground hover:bg-accent ${focusRing}`}
          >
            Quick start
          </Link>
        </div>
      </section>

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
            The same brief, run twice. Move the handle to see what three passes
            change when they read the catalog.
          </p>
          <p className="mt-6 text-sm leading-relaxed text-(--prose-body)">
            This example used three skills. Your request brings in whichever ones it
            needs.
          </p>
          <ul className="mt-4 flex flex-col gap-3">
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
        {/* The frame used to run full-bleed at lg (flush to the column seam and the
            container edge) so its 16/10 aspect bound before any content-driven
            height floor. The builder asked for breathing room on 2026-08-18, so the
            padding now holds at every width; the frame's own grid means content
            taller than 16/10 grows the box instead of being cut. */}
        <div className="flex min-w-0 flex-col justify-center px-6 py-8 sm:px-10 sm:py-12">
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
            {/* dx-waive SLP-5 reason="the tile is the content, not a template: each mark is the skill's actual tool in the site's ink vocabulary, and this grid is one band of a varied page, not its default layout" */}
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
      <section className="grid bg-site-accent-wash lg:grid-cols-2">
        <div className="px-6 py-16 sm:px-10 sm:py-20">
          <h2 className="max-w-[20ch] text-3xl leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            A shared language for you and your agent.
          </h2>
          <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-pretty text-(--prose-body)">
            You bring the judgment. Your agent brings the execution. The harness gives
            you both the same design language, and the checks to build safely on each
            other&apos;s work.
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
        {/* One drawing instead of three glyphs: the clip shows a person and an
            agent reading the same book, which is the section's whole claim. No
            ground of its own — the clip multiplies into the band's tint, so the
            close stays one washed band rather than splitting into two grounds. */}
        <div className="grid place-items-center px-6 py-10 sm:p-12">
          <IlloVideo
            src="/landing/illo-shared-language.mp4"
            poster="/landing/illo-shared-language-poster.jpg"
            className="max-w-64"
          />
        </div>
      </section>
    </div>
  );
}
