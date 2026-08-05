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
import { ChevronsLeftRight, Cloud, Sparkles, Zap } from "lucide-react";
import { DUR, EASE_OUT, useReducedMotionSafe } from "@/lib/motion";

const SLOP_GRADIENT =
  "linear-gradient(135deg, var(--demo-slop-grad-a), var(--demo-slop-grad-b))";

const SLOP_TILES = [
  { icon: Sparkles, label: "AI-powered" },
  { icon: Zap, label: "All-in-one" },
  { icon: Cloud, label: "Cloud-based" },
] as const;

/* Violation chip — plain text, non-interactive. It lives in the before layer,
   so the divider hides it together with the thing it points at. */
function Violation({ children }: { children: string }) {
  return (
    <span className="pointer-events-none inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-danger-muted bg-danger-subtle px-1.5 py-px text-xs font-medium leading-4 text-danger">
      {children}
    </span>
  );
}

/* The anti-specimen. Everything here is a deliberate, waived exhibit: the
   chips name the control each element fails. Actions render as spans so the
   only focusable element in the frame stays the slider. This panel is the
   frame's one in-flow child: the 16/10 aspect is the floor and this content
   is the minimum, so nothing clips at narrow widths. */
function BeforePanel() {
  return (
    <div className="relative flex min-h-full flex-col bg-(--demo-slop-surface)">
      {/* dx-waive SLP-1 reason="quarantined anti-specimen: the before panel of the standards demo" */}
      <div
        className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2.5"
        style={{ background: SLOP_GRADIENT }}
      >
        <span className="text-sm text-primary-foreground">Communication Hub</span>
        <Violation>SLP-1 gradient palette</Violation>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        {/* dx-waive SLP-2 reason="quarantined anti-specimen: the before panel of the standards demo" */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className="bg-clip-text text-sm font-medium text-transparent"
            style={{ backgroundImage: SLOP_GRADIENT }}
          >
            Term 3 broadcast
          </span>
          <Violation>SLP-2 gradient text</Violation>
        </div>
        {/* dx-waive SLP-9 reason="quarantined anti-specimen: the before panel of the standards demo" */}
        <p className="max-w-[56ch] text-sm leading-normal text-(--demo-slop-ink)">
          Revolutionise your seamless communication workflow and unlock
          engagement at scale. <Violation>SLP-9 buzzword copy</Violation>
        </p>
        {/* dx-waive SLP-4 reason="quarantined anti-specimen: the before panel of the standards demo" */}
        <div className="rounded-lg border border-(--demo-slop-border) bg-surface p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm text-(--demo-slop-ink)">Audience</span>
            <Violation>SLP-4 nested cards</Violation>
          </div>
          <div className="mt-2 rounded-md border border-(--demo-slop-border) bg-(--demo-slop-surface) p-2.5">
            <span className="text-sm text-(--demo-slop-ink)">4 classes · 127 parents</span>
          </div>
        </div>
        <div className="grid shrink-0 grid-cols-3 gap-2">
          {SLOP_TILES.map((tile) => (
            <div
              key={tile.label}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-(--demo-slop-border) bg-surface px-1 py-3 text-center shadow-sm"
            >
              <span
                className="grid size-8 shrink-0 place-items-center rounded-md text-primary-foreground"
                style={{ background: SLOP_GRADIENT }}
              >
                <tile.icon className="size-4" aria-hidden />
              </span>
              <span className="text-sm text-(--demo-slop-ink)">{tile.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-3">
          {/* dx-waive CMP-5 reason="quarantined anti-specimen: the before panel of the standards demo" */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-(--demo-slop-grad-a) px-3.5 py-2 text-sm text-primary-foreground shadow-[0_2px_10px_var(--demo-slop-glow)]">
              Get started!
            </span>
            <span className="rounded-md bg-(--demo-slop-grad-a) px-3.5 py-2 text-sm text-primary-foreground shadow-[0_2px_10px_var(--demo-slop-glow)]">
              Learn more
            </span>
            <Violation>CMP-5 two primaries</Violation>
          </div>
          {/* dx-waive SLP-6 reason="quarantined anti-specimen: the before panel of the standards demo" */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm text-(--demo-slop-ink)">
              Status: Draft saved just now
            </span>
            <Violation>SLP-6 flat hierarchy</Violation>
          </div>
        </div>
      </div>
    </div>
  );
}

/* The same task on standard: one primary, hairline dividers, a real type
   ramp, plain copy. Existing tokens only. */
function AfterPanel() {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-surface"
      style={{
        clipPath:
          "polygon(var(--exposure) 0, 100% 0, 100% 100%, var(--exposure) 100%)",
      }}
    >
      <div className="flex h-full flex-col p-5">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <span className="font-display text-base font-semibold tracking-tight text-foreground">
            Term 3 broadcast
          </span>
          <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-success-muted bg-success-subtle px-1.5 py-px text-xs font-medium leading-4 text-success">
            Passes the catalog
          </span>
        </div>
        <p className="mt-1.5 max-w-[44ch] text-sm leading-normal text-muted-foreground">
          Reaches every parent by Friday morning. Drafts save automatically.
        </p>
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-sm text-foreground">
            To: <span className="font-medium">4 classes</span>
            <span className="text-muted-foreground"> · 127 parents</span>
          </p>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">Draft · saved just now</p>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Save draft</span>
            <span className="rounded-md bg-tw-blue px-3.5 py-2 text-sm font-medium text-primary-foreground">
              Send to 4 classes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* variant="canvas" adapts the figure chrome (frame border, hint/caption ink,
   link colour) to the landing's dark world so the caption text keeps AA on
   --canvas (A11Y-1); the specimen panels themselves render unchanged — a lit
   slide on the dark ground. Recorded CMP-7 variant, not an override. */
export function SlopCompare({ variant = "docs" }: { variant?: "docs" | "canvas" } = {}) {
  const onCanvas = variant === "canvas";
  const captionInk = onCanvas ? "text-canvas-muted" : "text-muted-foreground";
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

  /* One-time "this moves" cue: the divider eases 62 → 50 on first in-view
     render. Skipped under reduced motion and after any interaction (A11Y-5);
     the dragged value itself is always applied directly, with no easing lag. */
  useEffect(() => {
    if (!inView || reduced || interactedRef.current) return;
    const frame = frameRef.current;
    if (frame === null) return;
    const controls = animate(62, 50, {
      duration: DUR.base,
      ease: EASE_OUT,
      onUpdate: (v) => frame.style.setProperty("--exposure", `${v}%`),
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
        aria-label="Before and after: the same screen, default AI output versus on standard"
        /* Rounded clipping via clip-path, not overflow-hidden: hidden overflow
           would zero the aspect box's content-based minimum height and clip
           the before panel at narrow widths (css-sizing-4 §5.2.2). */
        className={`relative aspect-[16/10] w-full max-w-[760px] rounded-lg border bg-surface [clip-path:inset(0_round_var(--radius))] ${onCanvas ? "border-canvas-line" : "border-border"}`}
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
          className="pointer-events-none absolute inset-y-0 w-[1.5px] -translate-x-1/2 bg-tw-blue"
          style={{ left: "var(--exposure)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface shadow-sm transition-[border-color,box-shadow] duration-(--motion-fast) peer-hover:border-border-strong peer-hover:shadow-md peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--color-tw-blue) motion-reduce:transition-none"
          style={{ left: "var(--exposure)" }}
        >
          <ChevronsLeftRight className="size-3.5 text-muted-foreground" aria-hidden />
        </div>
      </div>
      <p className={`mt-2 text-xs ${captionInk}`}>
        Drag the handle — or focus it and use arrow keys.
      </p>
      <figcaption className={`mt-2 max-w-[62ch] text-xs leading-normal ${captionInk}`}>
        The same screen twice: what defaults produce, and what ships under the
        standard. Every chip is a control ID from the{" "}
        <Link
          href="/standards/catalog"
          className={onCanvas ? "text-tape-blue underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tape-yellow)" : "text-tw-blue underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"}
        >
          catalog
        </Link>
        .
      </figcaption>
    </figure>
  );
}
