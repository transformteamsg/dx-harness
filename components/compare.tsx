"use client";

/* SlopCompare — the /standards "show, don't tell" demo. The BEFORE layer
   (underneath, left of the divider) deliberately exhibits default-AI output;
   each violation is labelled with a chip carrying a real control ID and an
   inline dx-waive marker — the panel is a quarantined anti-specimen, which
   also demonstrates the waiver system. The AFTER layer (on top, right of the
   divider) renders the same task on standard, from ordinary tokens only.

   The slider is a real full-frame native range input (Cloud Four
   image-compare technique): the browser supplies pointer, touch, keyboard
   (arrows/Home/End) and screen-reader behaviour for free. Its value drives
   the --exposure custom property, which clips the after layer; pointer-driven
   updates are rAF-throttled and bypass React renders entirely.

   A11Y-1 note: the before panel violates only waivable style/content tiers —
   every text/background pair in BOTH panels passes WCAG AA against the
   --demo-slop-* token values in globals.css. L0 is never demonstrated broken. */

import Link from "next/link";
import { useEffect, useId, useRef, type CSSProperties } from "react";
import { animate, useInView } from "motion/react";
import { ChevronsLeftRight, Sparkles, WandSparkles, Zap } from "lucide-react";
import { DUR, EASE_OUT, useReducedMotionSafe } from "@/lib/motion";

const SLOP_GRADIENT =
  "linear-gradient(135deg, var(--demo-slop-grad-a), var(--demo-slop-grad-b))";

const SLOP_TILES = [
  { icon: Sparkles, label: "Smart insights" },
  { icon: Zap, label: "Instant comments" },
  { icon: WandSparkles, label: "Growth powered" },
] as const;

/* Keep both panel labels visible and semantic as the divider moves. The after
   label aligns to the unclipped edge. */
const PANEL_LABEL =
  "shrink-0 border-b border-border bg-surface px-4 py-2 font-mono text-xs tracking-[0.08em] text-muted-foreground";

/* Violation chip — plain text, non-interactive. It lives in the before layer,
   so the divider hides it together with the thing it points at. */
function Violation({ children }: { children: string }) {
  return (
    <span className="pointer-events-none inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-danger-muted bg-danger-subtle px-1.5 py-px text-xs font-medium leading-4 text-danger">
      {children}
    </span>
  );
}

/* A quiet report queue gives both specimens a believable product surface.
   It is context only: the popup is the task being compared, so the backdrop
   stays out of the accessibility tree. */
function SampleBackdrop({ before = false }: { before?: boolean }) {
  const accent = before
    ? "bg-(--demo-slop-grad-a)"
    : "bg-(--tw-blue-brand)";

  return (
    <div aria-hidden className="absolute inset-0 bg-muted p-5 font-body">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="text-sm font-semibold text-foreground">Report comments</span>
        <span className="text-xs text-muted-foreground">P5 Mathematics</span>
      </div>
      <div className="mt-3 divide-y divide-border border-y border-border bg-surface px-4">
        {[
          ["Aisyah Rahman", "Needs review"],
          ["Ben Tan", "Approved"],
          ["Chloe Lim", "Approved"],
          ["Dev Anand", "Draft"],
        ].map(([name, state], index) => (
          <div key={name} className="flex items-center gap-3 py-3">
            <span className={`size-1.5 shrink-0 rounded-full ${index === 0 ? accent : "bg-border-strong"}`} />
            <span className="text-sm text-foreground">{name}</span>
            <span className="ml-auto text-xs text-muted-foreground">{state}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* The anti-specimen. Everything here is a deliberate, waived exhibit: the
   chips name the control each element fails. Actions render as spans so the
   only focusable element in the frame stays the slider. This panel is the
   frame's one in-flow child: the 16/10 aspect is the floor and this content
   is the minimum, so nothing clips at narrow widths. */
function BeforePanel() {
  const labelId = useId();
  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className="relative flex min-h-full flex-col bg-(--demo-slop-surface) font-body"
    >
      <p id={labelId} className={PANEL_LABEL}>
        Before — default AI popup
      </p>
      <div className="relative min-h-[34rem] flex-1 overflow-hidden">
        <SampleBackdrop before />
        <div aria-hidden className="absolute inset-0 bg-foreground/10" />

        {/* dx-waive CNT-2 reason="quarantined anti-specimen: 'Student Success Hub' is the invented …Hub name the control bans, shown as the exhibit" */}
        {/* dx-waive SLP-1 reason="quarantined anti-specimen: the before panel of the standards demo" */}
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-xl border border-(--demo-slop-border) bg-surface shadow-[0_8px_32px_var(--demo-slop-glow)] min-[480px]:right-auto min-[480px]:w-[56%]">
          <div
            className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-t-[calc(var(--radius)+3px)] px-4 py-3"
            style={{ background: SLOP_GRADIENT }}
          >
            <span className="text-sm font-medium text-(--demo-slop-foreground)">Student Success Hub</span>
            <Violation>SLP-1 purple gradient</Violation>
            <Violation>CNT-2 Hub name</Violation>
          </div>

          <div className="space-y-3 p-4">
            {/* dx-waive SLP-2 reason="quarantined anti-specimen: the before panel of the standards demo" */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className="bg-clip-text text-sm font-semibold text-transparent"
                style={{ backgroundImage: SLOP_GRADIENT }}
              >
                AI report comment generator
              </span>
              <Violation>SLP-2 gradient text</Violation>
            </div>
            {/* dx-waive SLP-9 reason="quarantined anti-specimen: the before panel of the standards demo" */}
            <p className="text-sm leading-normal text-(--demo-slop-ink)">
              Turn every report into a moment that matters. Celebrate progress,
              inspire confidence, and make every learner shine!{" "}
              <Violation>SLP-9 marketing copy</Violation>
            </p>
            {/* dx-waive SLP-4 reason="quarantined anti-specimen: the before panel of the standards demo" */}
            <div className="rounded-lg border border-(--demo-slop-border) bg-(--demo-slop-surface) p-3">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm text-(--demo-slop-ink)">Comment generator</span>
                <Violation>SLP-4 nested cards</Violation>
              </div>
              <div className="mt-2 rounded-md border border-(--demo-slop-border) bg-surface p-2.5 text-sm text-(--demo-slop-ink)">
                P5 Math · 28 learners · Magic tone
              </div>
            </div>
            {/* dx-waive SLP-5 reason="quarantined anti-specimen: the icon-tile grid is the exhibited default, same waiver family as the panel's other violations" */}
            <div className="grid grid-cols-3 gap-2">
              {SLOP_TILES.map((tile) => (
                <div key={tile.label} className="flex flex-col items-center gap-1 rounded-lg border border-(--demo-slop-border) p-2 text-center">
                  <span className="grid size-7 place-items-center rounded-md text-(--demo-slop-foreground)" style={{ background: SLOP_GRADIENT }}>
                    <tile.icon className="size-3.5" aria-hidden />
                  </span>
                  <span className="text-xs text-(--demo-slop-ink)">{tile.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* dx-waive CMP-5 reason="quarantined anti-specimen: the before panel of the standards demo" */}
          <div className="flex flex-wrap items-center gap-2 border-t border-(--demo-slop-border) p-4">
            <span className="rounded-md bg-(--demo-slop-grad-a) px-3 py-2 text-sm text-(--demo-slop-foreground) shadow-[0_2px_10px_var(--demo-slop-glow)]">Generate magic</span>
            <span className="rounded-md bg-(--demo-slop-grad-a) px-3 py-2 text-sm text-(--demo-slop-foreground) shadow-[0_2px_10px_var(--demo-slop-glow)]">Transform reports</span>
            <Violation>CMP-5 two primaries</Violation>
          </div>
        </div>
      </div>
    </div>
  );
}

/* The clipped panel uses full-width bands so each revealed slice remains
   legible. At 480px and above, content aligns to the unclipped edge. */
function AfterPanel() {
  const labelId = useId();
  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className="absolute inset-0 overflow-hidden bg-surface font-body"
      style={{
        clipPath:
          "polygon(var(--exposure) 0, 100% 0, 100% 100%, var(--exposure) 100%)",
      }}
    >
      <div className="flex h-full flex-col">
        <p id={labelId} className={`${PANEL_LABEL} text-right`}>
          After — on-standard popup
        </p>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <SampleBackdrop />
          <div aria-hidden className="absolute inset-0 bg-foreground/10" />

          {/* One short decision in a popup: no sections, columns, or internal
              scroll, so the task stays within SLP-10's focused-modal allowance. */}
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface shadow-sm min-[480px]:left-[42%] min-[480px]:right-5">
            <div className="border-b border-border px-5 py-4 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-foreground">Review report comment</span>
                <span className="inline-flex whitespace-nowrap rounded-full border border-(--tw-blue-brand-line) bg-(--tw-blue-brand-wash) px-2 py-0.5 text-xs font-medium text-(--tw-blue-brand)">
                  Ready for review
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">P5 Mathematics · 17 of 28</p>
            </div>

            <div className="px-5 py-4 text-left">
              <p className="text-sm font-semibold text-foreground">Aisyah Rahman</p>
              <p className="mt-1 text-xs text-muted-foreground">Evidence · Fractions checkpoint · 18/20</p>
              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground">Comment</p>
                <p className="mt-1.5 rounded-md border border-border bg-surface p-3 text-sm leading-normal text-foreground">
                  Aisyah explains equivalent fractions clearly and checks her
                  work independently. Next, she should show each step when
                  comparing fractions with different denominators.
                </p>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Draft · source checked</p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-5 py-3">
              <span className="text-sm font-medium text-muted-foreground">Edit comment</span>
              <span className="rounded-md bg-(--tw-blue-brand) px-3.5 py-2 text-sm font-medium text-primary-foreground">
                Approve comment
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SlopCompare() {
  const captionInk = "text-muted-foreground";
  const id = useId();
  const reduced = useReducedMotionSafe();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rafRef = useRef(0);
  const introRef = useRef<ReturnType<typeof animate> | null>(null);
  const interactedRef = useRef(false);
  const inView = useInView(frameRef, { once: true, amount: 0.4 });

  /* rAF-throttled: one style + attribute write per frame, no React re-render.
     The range value is the divider position; "on standard" is its complement. */
  const applyExposure = () => {
    rafRef.current = 0;
    const frame = frameRef.current;
    const input = inputRef.current;
    if (frame === null || input === null) return;
    frame.style.setProperty("--exposure", `${input.value}%`);
    input.setAttribute("aria-valuetext", `${100 - Number(input.value)}% on standard`);
  };

  const onInput = () => {
    interactedRef.current = true;
    introRef.current?.stop();
    if (rafRef.current === 0) rafRef.current = requestAnimationFrame(applyExposure);
  };

  /* Above 480px the divider cues movement and rests at 38%. Narrow and
     reduced-motion views settle immediately with the after panel readable.
     Keep the range value synchronized so keyboard input resumes from the
     visible position. */
  useEffect(() => {
    if (interactedRef.current) return;
    const frame = frameRef.current;
    const input = inputRef.current;
    if (frame === null || input === null) return;

    const narrow = window.matchMedia("(max-width: 479px)").matches;
    const rest = narrow ? 0 : 38;
    const settle = () => {
      frame.style.setProperty("--exposure", `${rest}%`);
      input.value = String(rest);
      input.setAttribute("aria-valuetext", `${100 - rest}% on standard`);
    };

    if (narrow || reduced) {
      settle();
      return;
    }
    if (!inView) return;
    const controls = animate(62, rest, {
      duration: DUR.base,
      ease: EASE_OUT,
      onUpdate: (v) => frame.style.setProperty("--exposure", `${v}%`),
      onComplete: settle,
    });
    introRef.current = controls;
    return () => controls.stop();
  }, [inView, reduced]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== 0) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <figure className="mt-6">
      <div
        ref={frameRef}
        role="group"
        aria-label="Before and after: the same report-comment popup, default AI output versus on standard"
        /* Rounded clipping via clip-path, not overflow-hidden: hidden overflow
           would zero the aspect box's content-based minimum height and clip
           the before panel at narrow widths (css-sizing-4 §5.2.2). */
        /* The demo inherits the page's token world — the panels are drawn
           from semantic + demo-slop tokens, so the one light world
           (docs/decisions/landing-light-return.md) renders both light. */
        className="relative aspect-[16/10] w-full rounded-lg border border-border bg-surface [clip-path:inset(0_round_var(--radius))]"
        style={{ "--exposure": "50%" } as CSSProperties}
      >
        <BeforePanel />
        <AfterPanel />
        <label htmlFor={id} className="sr-only">
          Reveal the on-standard version
        </label>
        <input
          ref={inputRef}
          id={id}
          type="range"
          min={0}
          max={100}
          step={1}
          defaultValue={50}
          aria-valuetext="50% on standard"
          onInput={onInput}
          className="peer absolute inset-0 h-full w-full cursor-ew-resize appearance-none opacity-0"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-[1.5px] -translate-x-1/2 bg-primary"
          style={{ left: "var(--exposure)" }}
        />
        {/* Clamp only the knob; the clip edge stays at the true exposure. */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface shadow-sm transition-[border-color,box-shadow] duration-(--motion-fast) peer-hover:border-border-strong peer-hover:shadow-md peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--color-ring) motion-reduce:transition-none"
          style={{
            left: "clamp(0.875rem, var(--exposure), calc(100% - 0.875rem))",
          }}
        >
          <ChevronsLeftRight className="size-3.5 text-muted-foreground" aria-hidden />
        </div>
      </div>
      <p className={`mt-2 text-xs ${captionInk}`}>
        Drag the handle — or focus it and use arrow keys.
      </p>
      <figcaption className={`mt-2 max-w-[62ch] text-xs leading-normal ${captionInk}`}>
        The same report-comment popup twice: generic AI defaults, then a focused
        review with evidence and one clear decision. Every chip is a control ID
        from the{" "}
        <Link
          href="/standards/catalog"
          className="text-tw-blue-text underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)"
        >
          catalog
        </Link>
        .
      </figcaption>
    </figure>
  );
}
