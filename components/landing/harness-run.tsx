"use client";

import { useEffect, useRef, useState } from "react";
import { InkIcon } from "@/components/ink-icon";

/* One request played end to end: the terminal types the ask, the run's status
   lines land one by one, and the reviewed screen comes back underneath — while
   the stage that corresponds to each beat highlights on the right.

   The player auto-plays once when it scrolls into view; the three stages are
   real buttons, so a reader can jump to any beat (and keyboard users get the
   same scrubbing hover users get). Reduced motion sees the finished run and
   still gets working stage buttons with no animation (A11Y-5).

   Server-rendered and no-JS readers get the FINAL beat — every line and the
   result visible — so nothing depends on the script running.

   Drawn in markup rather than SVG for the same reason as the old figure:
   the drawing carries words, and SVG <text> at this width lands under 12px
   (TYP-2). The window chrome, not the glyphs, says "terminal" (TYP-1). */

const PROMPT = "make the settings page feel calmer";

/* The figure's accessible name at rest, narrating the whole sequence — its
   wording is review-approved for A11Y-7, so it stays exactly as it is. In
   focus mode a single stage's `figureLabel` (below) replaces it, because the
   full narration would describe regions no longer drawn. */
const RUN_LABEL =
  "A Claude Code session played end to end: you type a request in plain words — make the settings page feel calmer. The dx-design orchestrator picks layout and polish passes. Each reads the control catalog and your DESIGN.md. The plan is approved, the build runs, and the design review passes. A small finished settings screen comes back underneath.";

/* beat: 0 typing · 1 orchestrator picks the passes · 2 layout pass ·
   3 polish pass · 4 plan approved, building · 5 review passed + result */
const FINAL_BEAT = 5;
const BEAT_STAGE = [0, 1, 1, 1, 1, 2] as const;

const STAGES = [
  {
    n: "01",
    heading: "Your prompt",
    beat: 0,
    body: (
      <>
        You type the ask in plain words. No skill names, no settings: &ldquo;make the
        settings page feel calmer.&rdquo;
      </>
    ),
    figureLabel:
      "A terminal window with the typed request: make the settings page feel calmer.",
  },
  {
    n: "02",
    heading: "The harness at work",
    beat: 4,
    body: (
      <>
        <Cmd>dx-design</Cmd> picks the passes this ask needs: layout and polish. Each
        one reads the control catalog and your <Cmd>DESIGN.md</Cmd>. You approve the
        plan before anything is built.
      </>
    ),
    /* Split into two sentences (the plan's single run-on sentence trips CNT-3's
       25-word cap) without changing what it says. */
    figureLabel:
      "A run panel: the dx-design orchestrator picks the layout and polish passes. Each pass reads the control catalog and your DESIGN.md before the plan is approved and the build runs.",
  },
  {
    n: "03",
    heading: "A reviewed result",
    beat: 5,
    body: (
      <>
        Execute makes the approved change. A separate review grades it against both
        sources; the screen comes back only after it passes.
      </>
    ),
    figureLabel:
      "A small finished settings screen with a display name field, a reminders field, and a Save button, above a badge reading design review passed.",
  },
];

/* Same chip as the page's Cmd: the muted chip marks code, not a third typeface
   (TYP-1), and it inherits its parent's size so it stays on-scale (TYP-2/3). */
function Cmd({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-sm bg-muted px-1.5 py-0.5 font-body text-foreground">
      {children}
    </code>
  );
}

const statusLine = "flex items-baseline gap-2 text-xs leading-relaxed";
/* The terminal's text-only lines want a baseline bake; a line carrying an
   ink icon wants the mark aligned to the FIRST line of its text, so a row
   that wraps doesn't drag the icon to the middle of a two-line block. The
   1px nudge on the icon span optically centres the 18px mark against the
   ~19.5px first line box. */
const statusLineIcon = "flex items-start gap-2 text-xs leading-relaxed";
const statusIconBox = "mt-px shrink-0";
/* While a drawn region waits for its beat it keeps a faint ghost presence
   instead of a void: the reserved space reads as "incoming", not "missing" —
   both mid-autoplay and when a reader scrubs back to stage 01. */
const ghost = "opacity-40";
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)";

export function HarnessRun() {
  const [beat, setBeat] = useState(FINAL_BEAT);
  /* `beat` drives the run as it assembles; `focused` is the reader asking to see
     one step by itself. null means "playing or resting on the whole chain", and
     it is the initial state so the server render and no-JS readers still get the
     complete composition. */
  const [focused, setFocused] = useState<number | null>(null);
  const [typedCount, setTypedCount] = useState(PROMPT.length);
  const timers = useRef<number[]>([]);
  const played = useRef(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  /* The figure's focus-mode reserve, measured rather than hardcoded — see the
     effect below for why a constant cannot hold this invariant. null means
     "not measured yet" (or never entered focus mode), in which case the figure
     applies no minimum. */
  const [reserve, setReserve] = useState<number | null>(null);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  /* The whole run, including the result's 600ms settle, finishes inside five
     seconds. Past five seconds an auto-starting animation owes the reader a
     visible pause/stop control (WCAG 2.2.2); staying under the boundary is the
     honest fix, not a stop button nobody would find. */
  const play = () => {
    clearTimers();
    setBeat(0);
    setTypedCount(0);
    for (let i = 1; i <= PROMPT.length; i++) {
      timers.current.push(window.setTimeout(() => setTypedCount(i), 250 + i * 26));
    }
    const t0 = 250 + PROMPT.length * 26;
    timers.current.push(window.setTimeout(() => setBeat(1), t0 + 400));
    timers.current.push(window.setTimeout(() => setBeat(2), t0 + 850));
    timers.current.push(window.setTimeout(() => setBeat(3), t0 + 1300));
    timers.current.push(window.setTimeout(() => setBeat(4), t0 + 1750));
    timers.current.push(window.setTimeout(() => setBeat(5), t0 + 2250));
  };

  /* Jump straight to a stage's end beat; a reader's pick always beats the timer. */
  const jumpTo = (target: number) => {
    played.current = true;
    clearTimers();
    setTypedCount(PROMPT.length);
    setBeat(target);
  };

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || played.current) return;
        played.current = true;
        if (!reducedMotion.matches) play();
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(player);
    return () => {
      observer.disconnect();
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* The reserve is measured from the figure's OWN resting height, not the
     chain wrapper's: resting height is the wrapper plus gap-2 plus the
     figcaption, so reserving anything smaller (the wrapper alone) leaves the
     focused figure short by exactly the gap and caption — which is what a
     hardcoded 31.53rem and an earlier wrapper-only measurement both did,
     independently of each other, for the same reason. Measuring the figure
     itself makes the reserve self-consistent: it constrains the same box it
     measures, so max(reserve, focused content) equals resting by construction.
     No constant could stand in for this measurement either: resting height
     depends on both viewport width and root font size once the 15rem cap
     starts to exceed the column's available width (a 320px-wide column at a
     24px root measured 113.5px taller than at a 16px root, purely from the
     extra wrap). A ResizeObserver keeps the value current across viewport and
     text-zoom changes; the `focused === null` guard makes sure only a
     whole-run measurement is ever stored, never a focused one — so there is
     no feedback loop from the figure's own min-height back into the
     measurement, since the two are never active at the same time.
     Accepted limitation: if the root font size changes WHILE a stage is
     focused, the reserve stays stale until the reader returns to the whole
     run — the guard means there is no other moment to remeasure it. */
  useEffect(() => {
    const el = figureRef.current;
    if (!el) return;
    const measure = () => {
      if (focused !== null) return;
      setReserve(el.getBoundingClientRect().height);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [focused]);

  /* An explicit pick wins; otherwise the beat says which stage we are in. */
  const activeStage = focused ?? BEAT_STAGE[beat];
  const lineOn = (lineBeat: number) =>
    beat >= lineBeat ? "opacity-100" : "opacity-0";
  const lineTransition =
    "transition-opacity duration-(--motion-base) ease-(--ease-out) motion-reduce:transition-none";
  /* In focus mode only the picked step's region is drawn at all — a ghost of a
     step the reader did not ask for is noise, where mid-run it correctly means
     "still coming". The connectors belong to the assembled chain, so they go
     too. `hidden` (display:none), not opacity: an invisible-but-laid-out region
     would leave the same empty space the reader asked us to remove. */
  const inFocus = focused !== null;
  const regionOn = (stageIndex: number) =>
    !inFocus || focused === stageIndex ? "" : "hidden";
  const chainOnly = inFocus ? "hidden" : "";

  return (
    <div className="grid border-b border-border lg:grid-cols-2">
      <div
        ref={playerRef}
        className="flex flex-col items-center justify-center border-border px-6 py-8 max-lg:border-b sm:py-10 lg:border-r"
      >
        <figure
          ref={figureRef}
          /* In focus mode the hidden regions leave the layout, so the column would
             collapse and everything below it would jump. Reserving the run-mode height
             on the figure itself — not just the chain wrapper — and centring keeps the
             visible region AND its figcaption together as one group; centring the
             wrapper alone left the caption stranded at the bottom of the reserve, far
             from the graphic it captions. The reserve itself is `reserve` state, set
             by the measurement effect above from the figure's OWN resting height — see
             that effect for why the reserve must come from this exact element (measuring
             the wrapper instead leaves the focused figure short by the caption and gap)
             and why no constant (px or rem) can hold this invariant across viewport
             widths and root font sizes. When `reserve` is null (not measured yet), no
             minimum is applied. */
          className={`m-0 flex w-full max-w-[15rem] flex-col gap-2 ${
            inFocus ? "justify-center" : ""
          }`}
          style={inFocus && reserve !== null ? { minHeight: reserve } : undefined}
          role="img"
          aria-label={focused === null ? RUN_LABEL : STAGES[focused].figureLabel}
        >
          <div aria-hidden="true">
            {/* the terminal window */}
            <div className={`overflow-hidden rounded-lg border border-border bg-surface shadow-sm ${regionOn(0)}`}>
              <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
                <span className="size-2 rounded-full bg-border" />
                <span className="size-2 rounded-full bg-border" />
                <span className="size-2 rounded-full bg-border" />
                <span className="ml-1.5 truncate text-xs text-muted-foreground">
                  ~/your-app
                </span>
              </div>
              <div className="flex flex-col gap-1.5 px-3 py-3">
                {/* min-h-[2lh]: the prompt wraps to a second line while the caret
                    is typing; without the reserve the terminal jumps 19px twice
                    per run and shoves everything below it. */}
                <p className={`${statusLine} min-h-[2lh]`}>
                  <span className="font-semibold text-site-accent-text">❯</span>
                  <span className="text-foreground">
                    {PROMPT.slice(0, typedCount)}
                    {/* A steady caret, not a blinking one: Tailwind's pulse is a
                        2s animation on its own easing, outside the motion token
                        scale this site declares as the only one it uses.
                        Gated on typedCount, not beat: beat < FINAL_BEAT stayed true
                        for a resting stage-01 selection (beat 0), so an isolated
                        terminal at rest showed an orphan caret on its own line —
                        a wrapping artifact reading as a rendering seam, and a
                        steady cursor implying typing in a state that is at rest. */}
                    {typedCount < PROMPT.length ? (
                      <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 bg-foreground" />
                    ) : null}
                  </span>
                </p>
              </div>
            </div>

            <div
              className={`mx-auto h-4 w-px bg-blueprint-ink ${lineTransition} ${beat >= 1 ? "opacity-100" : ghost} ${chainOnly}`}
            />

            {/* the orchestrator at work: dx-design reads the ask, then visibly runs the
                specialised skills — each with the same ink tool mark the skills section
                uses. This panel is the "one worked example" for the parts above. */}
            <div
              className={`rounded-lg border border-border bg-surface p-3 shadow-sm ${lineTransition} ${beat >= 1 ? "opacity-100" : ghost} ${regionOn(1)}`}
            >
              <p className={`${statusLineIcon} ${lineTransition} ${lineOn(1)}`}>
                <span className={statusIconBox}>
                  <InkIcon
                    name="skills/orchestrator"
                    size={18}
                    ink="var(--site-accent-text)"
                    idSuffix="-run"
                  />
                </span>
                <span className="font-semibold text-foreground">dx-design</span>
                <span className="text-muted-foreground">picks the passes</span>
              </p>
              {/* The indent rule arrives with its first row; drawn earlier it
                  hangs as an orphan hairline inside the ghost. */}
              <div
                className={`mt-2 flex flex-col gap-1.5 border-l border-border pl-3 ${lineTransition} ${lineOn(2)}`}
              >
                <p
                  className={`${statusLineIcon} text-muted-foreground ${lineTransition} ${lineOn(2)}`}
                >
                  <span className={statusIconBox}>
                    <InkIcon name="skills/pattern" size={18} ink="var(--foreground)" idSuffix="-run" />
                  </span>
                  <span>layout pass · reads catalog + DESIGN.md</span>
                </p>
                <p
                  className={`${statusLineIcon} text-muted-foreground ${lineTransition} ${lineOn(3)}`}
                >
                  <span className={statusIconBox}>
                    <InkIcon name="skills/polish" size={18} ink="var(--foreground)" idSuffix="-run" />
                  </span>
                  <span>polish pass · reads catalog + DESIGN.md</span>
                </p>
                <p
                  className={`${statusLineIcon} text-muted-foreground ${lineTransition} ${lineOn(4)}`}
                >
                  <span className={statusIconBox}>
                    <InkIcon name="skills/execute" size={18} ink="var(--foreground)" idSuffix="-run" />
                  </span>
                  <span>plan approved · building</span>
                </p>
              </div>
            </div>

            {/* the one lime link in the chain: the reviewed screen coming back */}
            <div
              className={`mx-auto h-4 w-px bg-blueprint-ink ${lineTransition} ${beat >= 5 ? "opacity-100" : ghost} ${chainOnly}`}
            />

            {/* the screen that comes back — a small but real settings surface,
                not abstract bars, so the worked example lands as a product,
                not a diagram. The frame ghosts before its beat; the contents
                land with it. */}
            {/* transition-[opacity,translate], not transform: Tailwind v4's
                translate-y-* utilities set the `translate` property, so a
                `transform` transition never animates them — the visible ghost
                would snap its 6px rise instead of easing it. */}
            <div
              className={`rounded-lg border border-blueprint-ink bg-surface p-3 shadow-sm transition-[opacity,translate] duration-(--motion-story) ease-(--ease-out) motion-reduce:transition-none ${
                beat >= 5 ? "opacity-100" : `translate-y-1.5 ${ghost}`
              } ${regionOn(2)}`}
            >
              <div className={`${lineTransition} ${lineOn(5)}`}>
                <p className="text-xs font-semibold text-foreground">Settings</p>
                <div className="mt-2.5 flex flex-col gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Display name</p>
                    <div className="mt-1 h-6 rounded-md border border-border bg-background" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reminders</p>
                    <div className="mt-1 h-6 rounded-md border border-border bg-background" />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  {/* The depicted primary carries its label: an unlabeled filled
                      block beside real field labels reads as a Save button with
                      its label missing. Foreground on lime measures 13.14:1
                      (app/globals.css:18). */}
                  <div className="grid h-6 w-16 place-items-center rounded-md bg-site-accent text-xs font-semibold text-foreground">
                    Save
                  </div>
                </div>
              </div>
            </div>
            {/* Wrapped, not gated directly on the <p>: statusLineIcon's own `flex`
                would sit in the same class string as regionOn's `hidden`, and which
                one wins would depend on Tailwind's utility emission order rather
                than anything visible at this call site. A plain wrapper (no
                display utility of its own) carries the hide/show and leaves the
                <p>'s own flex layout alone. */}
            <div className={regionOn(2)}>
              <p
                className={`mt-2 ${statusLineIcon} font-semibold text-site-accent-text ${lineTransition} ${lineOn(5)}`}
              >
                <span className={statusIconBox}>
                  <InkIcon name="skills/review" size={18} ink="var(--site-accent-text)" idSuffix="-run" />
                </span>
                <span>design review passed</span>
              </p>
            </div>
          </div>
          <figcaption aria-hidden="true" className="text-xs text-muted-foreground">
            One ask in plain words; a reviewed screen out.
          </figcaption>
        </figure>
        <button
          type="button"
          onClick={() => {
            setFocused(null);
            play();
          }}
          aria-label="Replay the run"
          title="Replay the run"
          /* Icon-only, but never under the floor: size-11 keeps the 44px hit area
             (A11Y-4) and the aria-label keeps the accessible name (A11Y-3) that an
             icon-only control otherwise loses. The resting border keeps it
             legible as a control (CMP-7) — icon-only is a size decision, not a
             licence to be affordance-free — and the title carries the label the
             icon replaced. */
          className={`mt-4 inline-flex size-11 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors duration-(--motion-fast) hover:border-border-strong hover:text-foreground ${focusRing}`}
        >
          <InkIcon name="harness/loop" size={20} ink="currentColor" idSuffix="-replay" />
        </button>
      </div>
      <ol className="grid grid-rows-3">
        {STAGES.map((s, index) => (
          <li key={s.n} className="grid">
            <button
              type="button"
              onClick={() => {
                setFocused(index);
                jumpTo(s.beat);
              }}
              aria-current={activeStage === index ? "step" : undefined}
              /* Every stage scrubs the player, so every stage carries a resting
                 affordance: the inactive ones keep a hairline left rule and a
                 hover wash, and the active one steps that rule up to lime
                 (CMP-7 — a control group whose members look inert reads as
                 undiscoverable). */
              className={`grid w-full cursor-pointer grid-cols-[2rem_minmax(0,1fr)] content-center gap-4 border-l-3 px-6 py-5 text-left transition-colors duration-(--motion-base) motion-reduce:transition-none sm:px-10 sm:py-6 ${focusRing} ${
                activeStage === index
                  ? "border-site-accent bg-site-accent-wash"
                  : "border-border hover:bg-accent"
              }`}
            >
              <p className="pt-0.5 text-xs text-site-accent-text tabular-nums">{s.n}</p>
              <span className="block">
                <span className="block text-lg font-semibold tracking-tight text-foreground">
                  {s.heading}
                </span>
                <span className="mt-1 block max-w-[48ch] text-sm leading-relaxed text-pretty text-muted-foreground">
                  {s.body}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
