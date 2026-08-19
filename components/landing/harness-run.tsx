"use client";

import { useEffect, useRef, useState } from "react";
import { InkIcon } from "@/components/ink-icon";

/* One request played end to end: the terminal types the ask, the run's status
   lines land one by one, and the reviewed screen comes back underneath — while
   the stage that corresponds to each beat highlights on the right.

   The three cards arrive ONE AT A TIME (builder ruling, 2026-08-18). Before the
   sequence starts the figure is empty — no outlined placeholders waiting to be
   filled. Card 01 fades in centred, types its request, and only then does the
   pair rise so card 02 can take the centre; card 03 lands the same way and the
   whole chain rests assembled. This reverses the ghost treatment an earlier
   review round asked for (unrevealed regions held a 40% wash so their space read
   as "incoming"): the builder's objection is that a wash still draws three empty
   cards before anything happens. The void that ghosting existed to answer is
   answered differently now — the figure reserves its final height and the
   revealed cards are centred inside it, so leftover space is distributed above
   and below the story rather than pooling under it.

   How the rise works: every card keeps its space in the layout at all times and
   reveals with opacity, so the stack's geometry never reflows. What moves is the
   stack itself, translated by half the difference between the reserved height
   and the revealed cards' height — which puts the revealed group on the box's
   centre line and lands at exactly 0 when the third card joins. Only `opacity`
   and `translate` animate, so nothing touches layout or paint; the entering card
   eases out (it is arriving) and the stack eases in-out (it is on-screen content
   moving), each on --motion-story, the token reserved for this narrative.

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
  "A Claude Code session played end to end: you type a request in plain words — make the settings page feel calmer. The dx-design orchestrator picks layout and polish passes. Each reads the catalog and your DESIGN.md. The plan is approved, the build runs, and the design review passes. A small finished settings screen comes back underneath.";

/* beat: 0 typing · 1 orchestrator picks the passes · 2 layout pass ·
   3 polish pass · 4 plan approved, building · 5 review passed + result */
const FINAL_BEAT = 5;
const BEAT_STAGE = [0, 1, 1, 1, 1, 2] as const;

/* Before the first beat. The server and no-JS readers never see this state —
   they get FINAL_BEAT, the whole assembled chain — and neither does a
   reduced-motion reader. It exists only for the moment between hydration and the
   card 01 fade, so a reader scrolling in does not meet the finished chain and
   then watch it reset to empty. */
const PRE_ROLL = -1;

/* The beat each card joins on. Card 02 arrives once the request is typed; card
   03 once the run reports its result. The gap between them is what makes the
   sequence read as three steps rather than one assembly. */
const CARD_BEAT = [0, 1, 5] as const;

/* The schedule, in one place instead of inline arithmetic. Every number is a
   *delay* — scheduling, not a CSS duration, so it is not a MOT-2 token — but the
   two rules it follows are worth stating: each card's own animation finishes
   before the next card's beat (that is the builder's "one by one"), and the
   whole sequence settles inside five seconds, past which an auto-starting
   animation owes the reader a visible stop control (WCAG 2.2.2). Sum with the
   600ms settle: 2600 + 600 = 3200ms. */
const SCHEDULE = {
  typeStart: 250,
  typeStep: 22,
  /* +150ms after the last character, so the caret's disappearance and the rise
     do not start on the same frame. */
  card2: 1150,
  layoutPass: 1500,
  polishPass: 1850,
  building: 2200,
  card3: 2600,
} as const;

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
      "A terminal window with the typed request: make the settings page feel calmer. Below it, a note: dx-design reads it to pick the passes.",
    /* Only the routing row survives review: the plain-words row restated the
       body text 350px away in the same viewport with no new information
       (SLP-9 redundancy) — the one thing the terminal doesn't already show is
       what happens to the words after you type them. Grounded in the
       section's own copy (content/sections/landing.mdx: "dx-design reads the
       request and brings in only the skills it needs"). */
    annotations: [
      {
        icon: "skills/orchestrator",
        text: "dx-design reads it and brings in only the skills it needs.",
        ink: "var(--foreground)",
      },
    ],
  },
  {
    n: "02",
    heading: "The harness at work",
    beat: 4,
    body: (
      <>
        <Cmd>dx-design</Cmd> picks the passes this ask needs: layout and polish. Each
        one reads the catalog and your <Cmd>DESIGN.md</Cmd>. You approve the
        plan before anything is built.
      </>
    ),
    /* Split into two sentences (the plan's single run-on sentence trips CNT-3's
       25-word cap) without changing what it says. */
    figureLabel:
      "A run panel: the dx-design orchestrator picks the layout and polish passes. Each pass reads the catalog and your DESIGN.md before the plan is approved and the build runs. Below it, two notes name each source: the catalog and your DESIGN.md.",
    /* Grounded in the section's own copy (content/sections/landing.mdx: "Shared
       design guidance agents can use" and "Your product's design language") —
       these name the two sources the panel's rows only shorthand as
       "catalog + DESIGN.md". */
    annotations: [
      {
        icon: "standards/catalog",
        text: "The catalog: shared design rules every skill reads first.",
        ink: "var(--foreground)",
      },
      {
        icon: "landing/design-file",
        text: "Your DESIGN.md: your product's own colours, type, motion, and voice.",
        ink: "var(--foreground)",
      },
    ],
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
    /* No annotation here: the screen plus the "design review passed" badge
       already carry the message a review row would only restate (SLP-9
       redundancy), and a supporting row cannot reuse the badge's
       skills/review mark at the same accent ink without duplicating it
       44.5px above itself (CMP-7 — accent is reserved for the row's own
       subject, and this row's subject already has one). Kept as an empty
       array, not an omitted property, so every stage shares one shape and
       the render guard below (`.length > 0`) is the only thing that decides
       whether anything draws. */
    annotations: [] as { icon: string; text: string; ink: string }[],
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
/* A card that has not arrived yet is fully absent to the eye — opacity 0, not a
   wash — while keeping its space in the layout so the stack never reflows. It
   sits 6px low so its arrival has somewhere to travel from; `translate`, not
   `transform`, because Tailwind v4 compiles translate-y-* to the `translate`
   property and a transform transition would never animate it. */
const cardEnter =
  "transition-[opacity,translate] duration-(--motion-story) ease-(--ease-out) motion-reduce:transition-none";
const cardWaiting = "translate-y-1.5 opacity-0";
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
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  /* Each card's bottom edge, measured from the stack's top in the assembled
     layout. These are what turn "centre the revealed group" into a number.
     Layout offsets, not `getBoundingClientRect`: the stack carries a translate
     while it plays, and a rect would fold that translate back into the
     measurement it is derived from. */
  const [cardBottoms, setCardBottoms] = useState<number[] | null>(null);
  /* The figure's focus-mode reserve, measured rather than hardcoded — see the
     effect below for why a constant cannot hold this invariant. null means
     "not measured yet" (or never entered focus mode), in which case the figure
     applies no minimum. */
  const [reserve, setReserve] = useState<number | null>(null);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  /* One card at a time, each finishing before the next begins — see SCHEDULE for
     the two rules the numbers answer to. */
  const play = () => {
    clearTimers();
    setBeat(0);
    setTypedCount(0);
    for (let i = 1; i <= PROMPT.length; i++) {
      timers.current.push(
        window.setTimeout(
          () => setTypedCount(i),
          SCHEDULE.typeStart + i * SCHEDULE.typeStep,
        ),
      );
    }
    const at = (delay: number, next: number) =>
      timers.current.push(window.setTimeout(() => setBeat(next), delay));
    at(SCHEDULE.card2, 1);
    at(SCHEDULE.layoutPass, 2);
    at(SCHEDULE.polishPass, 3);
    at(SCHEDULE.building, 4);
    at(SCHEDULE.card3, 5);
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
    /* Empty the figure before the reader gets here, but only for a reader who
       will actually see the sequence; under reduced motion the assembled chain
       simply stays. This does not race the geometry effect below: an unrevealed
       card keeps its space and only drops its opacity, so the layout the
       measurement reads is the assembled one at every beat. The one state that
       does collapse the layout is focus mode, which that effect guards against
       explicitly. */
    if (!reducedMotion.matches && !played.current) setBeat(PRE_ROLL);
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

  /* The reserve is measured from the figure's OWN resting height. The figure
     now holds a single child (the figcaption this used to also cover was cut
     as redundant decoration — see the chain wrapper's markup below), so
     measuring the wrapper instead of the figure would land on the same
     number today; the figure stays the measured element anyway, because
     that principle — measure the exact box you constrain, not a proxy for
     it — is what closed two prior rounds where a value describing one box
     got applied to a different one (a hardcoded constant, then a
     wrapper-only measurement, both landing short of the figure's true
     resting height by the gap and caption they didn't account for).
     Measuring the figure itself makes the reserve self-consistent: it
     constrains the same box it measures, so max(reserve, focused content)
     equals resting by construction.
     No constant could stand in for this measurement either: resting height
     depends on both viewport width and root font size once the 15rem cap
     starts to exceed the column's available width (a 320px-wide column at a
     24px root measured 113.5px taller than at a 16px root, purely from the
     extra wrap). A ResizeObserver keeps the value current across viewport and
     text-zoom changes; the `focused === null` guard makes sure only a
     whole-run measurement is ever stored, never a focused one — so there is
     no feedback loop from the figure's own min-height back into the
     measurement, since the two are never active at the same time.
     Accepted limitation: if the viewport or the root font size changes while
     a stage is focused, the reserve stays stale until the reader returns to
     the whole run — the guard means there is no other moment to remeasure it.
     There is no jump at the moment of change and it self-heals on return, so
     the window is a stale reserve, never a visible glitch. */
  useEffect(() => {
    const el = figureRef.current;
    if (!el) return;
    const measure = () => {
      if (focused !== null) return;
      /* Fractional, not `offsetHeight`. This number becomes the figure's
         min-height in focus mode, and the invariant it holds is "focused is
         exactly as tall as resting" — `offsetHeight` rounds, so a 504.5px column
         came back as a 505px reserve and isolating a step grew it half a pixel.
         A contract test measures the same fractional rect, and it caught this. */
      setReserve(el.getBoundingClientRect().height);
      const cards = cardRefs.current;
      if (cards.length === CARD_BEAT.length && cards.every(Boolean)) {
        /* Each card's bottom edge from the first card's top, in LAYOUT offsets.
           Two things this avoids, both measured rather than assumed:
           — Rects are fractional but fold in every translate in play, and a card
             waiting its turn is held 6px low. Measured that way, card 01 settled
             3.5px above the centre line: half of the 6px, exactly as the
             arithmetic predicts. `offsetTop` ignores translate.
           — Offsets need one shared basis. Subtracting the STACK's offsetTop
             looked right and was wrong by 2189px, because the stack's own
             translate makes it a containing block, so its children's offsets are
             already measured against it while its own are measured against the
             sheet. Card 01 is the reliable origin: all three are siblings under
             one offsetParent, whatever that turns out to be, so this subtraction
             cannot pick up a different basis.
           The half-pixel rounding costs here lands on the centring, which is
           invisible; the fractional measurement is kept where it is load-bearing,
           on the reserve above. */
        const origin = cards[0]!.offsetTop;
        setCardBottoms(cards.map((c) => c!.offsetTop + c!.offsetHeight - origin));
      }
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

  /* A card is on screen once its beat has landed. In focus mode the reader's own
     pick is the only card drawn, and `jumpTo` always sets a beat at or past that
     card's own, so this needs no special case for it. */
  const cardOn = (card: number) => beat >= CARD_BEAT[card];
  /* Motion is armed only once the sequence is running. Without this the pre-roll
     itself animates: the assembled chain the server rendered would ease out over
     600ms and the stack would glide down into position before anything had
     started. Clearing the figure is not a beat of the story, so it happens in one
     frame; measured before this guard existed, the three cards sat at 0.92 and
     falling on hydration. */
  const armed = beat > PRE_ROLL;
  /* The last card to have arrived — the one the stack centres on. At PRE_ROLL
     nothing has arrived yet and the stack still sits where card 01 will land, so
     card 01 fades in already centred instead of sliding down into place. */
  const anchor = cardOn(2) ? 2 : cardOn(1) ? 1 : 0;
  /* Half the unused height, which puts the revealed cards on the box's centre
     line. Once the third card lands its bottom IS the reserved height, so this
     resolves to 0 and the chain rests exactly where the server rendered it —
     which is why the settled state needs no separate case. Focus mode centres
     with `justify-center` instead, so the stack stays put. */
  const shift =
    inFocus || reserve === null || cardBottoms === null
      ? 0
      : Math.max(0, (reserve - cardBottoms[anchor]) / 2);

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
             on the figure itself and centring the one visible child keeps the column
             still. The reserve itself is `reserve` state, set by the measurement effect
             above from the figure's OWN resting height — see that effect for why the
             reserve must come from this exact element, and why no constant (px or rem)
             can hold this invariant across viewport widths and root font sizes. When
             `reserve` is null (not measured yet), no minimum is applied. */
          /* overflow-hidden: while the stack is translated down, the cards that
             have not arrived hang past the figure's bottom edge. They are
             transparent, so nothing shows either way — but they would still take
             pointer events over the section below, so the box clips them. */
          className={`m-0 flex w-full max-w-[15rem] flex-col gap-2 overflow-hidden ${
            inFocus ? "justify-center" : ""
          }`}
          style={inFocus && reserve !== null ? { minHeight: reserve } : undefined}
          role="img"
          aria-label={focused === null ? RUN_LABEL : STAGES[focused].figureLabel}
        >
          {/* The stack: one element carrying the rise for all three cards, so a
              card's arrival and the group's movement stay independent. */}
          <div
            aria-hidden="true"
            className={`${armed ? "transition-[translate] duration-(--motion-story) ease-(--ease-in-out) motion-reduce:transition-none" : ""}`}
            style={{ translate: `0 ${shift}px` }}
          >
            {/* card 01 — the terminal window */}
            <div
              ref={(el) => {
                cardRefs.current[0] = el;
              }}
              className={`${armed ? cardEnter : ""} ${cardOn(0) ? "" : cardWaiting} ${regionOn(0)}`}
            >
            <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
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
            </div>

            {/* card 02 — the connector travels with the card it leads into, so
                revealing the card draws the link that attaches it. */}
            <div
              ref={(el) => {
                cardRefs.current[1] = el;
              }}
              className={`${armed ? cardEnter : ""} ${cardOn(1) ? "" : cardWaiting} ${regionOn(1)}`}
            >
            <div className={`mx-auto h-4 w-px bg-blueprint-ink ${chainOnly}`} />

            {/* the orchestrator at work: dx-design reads the ask, then visibly runs the
                specialised skills — each with the same ink tool mark the skills section
                uses. This panel is the "one worked example" for the parts above. */}
            <div className="rounded-lg border border-border bg-surface p-3 shadow-sm">
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
                  hangs as an orphan hairline under the header row, which is what
                  card 02 looks like for the 350ms before its first pass lands. */}
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
            </div>

            {/* card 03 — the lime link and the reviewed screen arrive together as
                the run's answer. No inner beat gating: the whole card is the
                third step, so its contents ride its own arrival rather than
                fading a second time inside it. */}
            <div
              ref={(el) => {
                cardRefs.current[2] = el;
              }}
              className={`${armed ? cardEnter : ""} ${cardOn(2) ? "" : cardWaiting} ${regionOn(2)}`}
            >
            <div className={`mx-auto h-4 w-px bg-blueprint-ink ${chainOnly}`} />

            {/* the screen that comes back — a small but real settings surface,
                not abstract bars, so the worked example lands as a product,
                not a diagram. */}
            <div className="rounded-lg border border-blueprint-ink bg-surface p-3 shadow-sm">
              <div>
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
            <p
              className={`mt-2 ${statusLineIcon} font-semibold text-site-accent-text`}
            >
              <span className={statusIconBox}>
                <InkIcon name="skills/review" size={18} ink="var(--site-accent-text)" idSuffix="-run" />
              </span>
              <span>design review passed</span>
            </p>
            </div>
            {/* Focus-mode enrichment: builder direction is that an isolated step
                should not sit alone in the column when there is real context to
                add — but only where a row would add something the reader can't
                already see. Stage 03 draws none: the screen plus the "design
                review passed" badge above already carry the message, so its
                `annotations` array is empty and the `.length > 0` guard means
                nothing renders there at all, not an empty hairline. Where a
                stage does have rows, they're drawn in the same statusLineIcon
                idiom as the rest of the figure (fresh idSuffix — these marks
                already render elsewhere on the page, and a repeated filter id
                silently strips the texture). Conditionally RENDERED, not just
                hidden: a no-JS reader can never set `focused`, so this never
                exists in the initial HTML either way, but rendering makes that
                guarantee obvious at the call site instead of relying on CSS.
                Lives inside the same reserve as the isolated region — the
                height invariant only holds if region + annotations together
                stay under the measured resting height at every viewport and
                root font size; re-run the matrix if this copy grows. */}
            {focused !== null && STAGES[focused].annotations.length > 0 ? (
              <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                {STAGES[focused].annotations.map((a) => (
                  <p key={a.icon} className={statusLineIcon}>
                    <span className={statusIconBox}>
                      <InkIcon name={a.icon} size={18} ink={a.ink} idSuffix="-focus" />
                    </span>
                    <span>{a.text}</span>
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </figure>
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
