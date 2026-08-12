"use client";

import { useEffect, useRef, useState } from "react";

/* FullMapDiagram — the whole harness as one isometric layered figure
   (ticket #78, composition locked in #74). Two halves split the story:

   - The numbered rail is the semantic path: real text, in reading order
     (you → dx-design → the passes → shared context → DESIGN.md), so
     assistive tech gets the full narrative as plain HTML (A11Y-6/7).
   - The SVG is a labelled figure — role="img" with <title> + <desc>
     narrating the FINISHED figure; everything inside it is presentational.

   Skill names follow the locked design-skills restructure spec:
   dx-design is the single front door; the five passes propose;
   dx-design-execute is the one skill that builds.

   Reveal choreography: plate → connector → plate, in reading order, via
   per-item --reveal-i delays (see the [data-reveal] .map-item rules in
   globals.css; step = --motion-story-step, the tuning knob — total ≈ 2.1s
   at the 220ms default). The hidden state exists only after client JS arms
   the root and only under prefers-reduced-motion: no-preference, so no-JS,
   SSR, and reduce users all render the finished figure from the first
   frame (MOT-3, A11Y-5). Replay renders only once motion is armed, so it
   never appears under reduced motion.

   The plates are diagram notation, not cards (SLP-11): nothing here is
   interactive and nothing nests card chrome. The legend is visible content,
   not decoration — the words carry the key. */

type RevealStyle = React.CSSProperties & { "--reveal-i"?: number };
const at = (i: number): RevealStyle => ({ "--reveal-i": i });

/* One rail entry: numbered, with a small locator kicker. The number is
   drawn (the <ol> already carries order); hence aria-hidden. */
function RailItem({
  i,
  n,
  where,
  heading,
  children,
}: {
  i: number;
  n: number;
  where: string;
  heading: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="map-item relative pl-10 pb-8 last:pb-0" style={at(i)}>
      <span
        aria-hidden
        className="absolute top-0 left-0 flex size-6.5 items-center justify-center rounded-full border border-border bg-muted font-mono text-xs font-semibold text-tw-blue-text"
      >
        {n}
      </span>
      <p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
        {where}
      </p>
      <h3 className="mt-1 text-sm font-semibold text-foreground">{heading}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </li>
  );
}

const railCode = "rounded-sm bg-muted px-1 font-mono text-xs text-foreground";

export function FullMapDiagram() {
  const ref = useRef<HTMLDivElement | null>(null);
  /* True only once JS confirms motion is welcome — gates the Replay button,
     so no-JS and reduced-motion users never see a control that does nothing. */
  const [motionArmed, setMotionArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setMotionArmed(true);
    el.setAttribute("data-reveal", "armed");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-reveal", "shown");
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.removeAttribute("data-reveal");
    };
  }, []);

  const replay = () => {
    const el = ref.current;
    if (el === null) return;
    el.setAttribute("data-reveal", "armed");
    void el.offsetWidth; /* commit the hidden state before playing again */
    el.setAttribute("data-reveal", "shown");
  };

  return (
    <div
      ref={ref}
      className="relative rounded-lg border border-border bg-surface px-5 py-6 sm:px-8 sm:py-8"
    >
      {motionArmed && (
        <button
          type="button"
          onClick={replay}
          className="absolute top-4 right-4 z-10 rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)"
        >
          Replay
        </button>
      )}

      <div className="grid items-start gap-x-11 gap-y-4 md:grid-cols-[minmax(250px,330px)_1fr]">
        {/* ── The reading rail: the non-visual story, in reading order ── */}
        <ol
          aria-label="How the harness is structured, in reading order"
          className="pt-2"
        >
          <RailItem i={0} n={1} where="in the chat" heading="You">
            One ask, in plain words. You never pick a skill.
          </RailItem>
          <RailItem
            i={2}
            n={2}
            where="the harness plugin"
            heading={
              <>
                <code className="font-mono text-tw-blue-text">dx-design</code> — the
                single front door
              </>
            }
          >
            The orchestrator grills first, then routes. Rule and waiver questions
            stop here too. No external skills inside it.
          </RailItem>
          <RailItem i={4} n={3} where="dispatched as subagents" heading="The propose-only passes">
            Copy, flow, pattern, motion, polish — each returns up to five ranked
            findings. They plan and document for{" "}
            <code className={railCode}>dx-design-execute</code>, the one skill that
            builds what you accept.
          </RailItem>
          <RailItem i={6} n={4} where="the harness plugin" heading="Shared context">
            Every skill reads the same rulebook: the control catalog (L0 never
            waived, L1 needs a named approver, L2 needs a reason), grounded by the
            primitives — tokens and components.
          </RailItem>
          <RailItem
            i={8}
            n={5}
            where="your product repo"
            heading={<code className="font-mono">DESIGN.md</code>}
          >
            Your product&rsquo;s decisions and deviations, written where any agent
            can read them. The catalog stays the rulebook;{" "}
            <code className={railCode}>DESIGN.md</code> never restates a control.
          </RailItem>
        </ol>

        {/* ── The isometric figure: a labelled image narrating the finished
             state; the rail above carries the step-by-step story. ── */}
        <figure>
          <svg
            viewBox="0 0 560 950"
            role="img"
            aria-labelledby="fullmap-title fullmap-desc"
            className="mx-auto block h-auto w-full max-w-[560px]"
          >
            <title id="fullmap-title">How the design harness fits together</title>
            <desc id="fullmap-desc">
              Five layers, read top to bottom. You make one ask in plain words. It
              enters dx-design, the orchestrator and the single front door; no
              external skills sit inside it. The orchestrator dispatches the
              propose-only passes — copy, flow, pattern, motion and polish — which
              plan and document for dx-design-execute, the one skill that builds
              what you accept. Every skill reads the same shared context: the
              control catalog with its L0, L1 and L2 tiers, and the primitives —
              tokens and components. The outcome is written into DESIGN.md in your
              product repo, which any agent can read.
            </desc>

            <defs>
              {/* One plate: 420×120 diamond top face + 10px slab edge */}
              <g id="fullmap-plate">
                <polygon
                  points="0,60 210,120 210,130 0,70"
                  fill="var(--accent)"
                  stroke="var(--border)"
                  strokeWidth="1"
                />
                <polygon
                  points="420,60 210,120 210,130 420,70"
                  fill="var(--surface)"
                  stroke="var(--border)"
                  strokeWidth="1"
                />
                <polygon
                  points="210,0 420,60 210,120 0,60"
                  fill="var(--muted)"
                  stroke="var(--border)"
                  strokeWidth="1"
                />
              </g>
              {/* A small cube: one pass */}
              <g id="fullmap-cube">
                <polygon
                  points="-18,0 0,6.5 0,13.5 -18,7"
                  fill="var(--surface)"
                  stroke="var(--border-strong)"
                  strokeWidth="1"
                />
                <polygon
                  points="18,0 0,6.5 0,13.5 18,7"
                  fill="var(--accent)"
                  stroke="var(--border-strong)"
                  strokeWidth="1"
                />
                <polygon
                  points="0,-6.5 18,0 0,6.5 -18,0"
                  fill="var(--muted)"
                  stroke="var(--border-strong)"
                  strokeWidth="1"
                />
              </g>
              {/* A slab: catalog / primitives / DESIGN.md */}
              <g id="fullmap-slab">
                <polygon
                  points="-54,0 0,16 0,22 -54,6"
                  fill="var(--surface)"
                  stroke="var(--border-strong)"
                  strokeWidth="1"
                />
                <polygon
                  points="0,-16 54,0 0,16 -54,0"
                  fill="var(--muted)"
                  stroke="var(--border-strong)"
                  strokeWidth="1"
                />
                <polygon
                  points="54,0 0,16 0,22 54,6"
                  fill="var(--accent)"
                  stroke="var(--border-strong)"
                  strokeWidth="1"
                />
              </g>
            </defs>

            {/* Layer 1 — you */}
            <g className="map-item" style={at(0)}>
              <use href="#fullmap-plate" x="70" y="24" />
              <circle
                cx="280"
                cy="66"
                r="8"
                fill="none"
                stroke="var(--muted-foreground)"
                strokeWidth="1.5"
              />
              <path
                d="M 266 88 a 14 11 0 0 1 28 0"
                fill="none"
                stroke="var(--muted-foreground)"
                strokeWidth="1.5"
              />
              <text
                x="280"
                y="108"
                textAnchor="middle"
                className="font-display"
                fontSize="14"
                fontWeight="600"
                fill="var(--foreground)"
              >
                You
              </text>
            </g>
            {/* Connector 1→2 */}
            <g className="map-item" style={at(1)}>
              <line
                className="map-line"
                x1="280"
                y1="158"
                x2="280"
                y2="196"
                stroke="var(--border-strong)"
                strokeWidth="1"
              />
              <polygon points="275,196 285,196 280,204" fill="var(--border-strong)" />
              <text x="294" y="184" fontSize="11" fill="var(--muted-foreground)">
                one ask, in plain words
              </text>
            </g>

            {/* Layer 2 — dx-design, the single front door */}
            <g className="map-item" style={at(2)}>
              <use href="#fullmap-plate" x="70" y="206" />
              {/* accent edge: re-stroke the top face */}
              <polygon
                points="280,206 490,266 280,326 70,266"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.5"
              />
              <text
                x="280"
                y="264"
                textAnchor="middle"
                className="font-mono"
                fontSize="15"
                fontWeight="600"
                fill="var(--tw-blue-text)"
              >
                dx-design
              </text>
              <text
                x="280"
                y="284"
                textAnchor="middle"
                className="font-mono"
                fontSize="10"
                fill="var(--muted-foreground)"
              >
                /dx-harness:dx-design
              </text>
            </g>
            {/* Connector 2→3 */}
            <g className="map-item" style={at(3)}>
              <line
                className="map-line"
                x1="280"
                y1="340"
                x2="280"
                y2="378"
                stroke="var(--border-strong)"
                strokeWidth="1"
              />
              <polygon points="275,378 285,378 280,386" fill="var(--border-strong)" />
              <text x="294" y="366" fontSize="11" fill="var(--muted-foreground)">
                dispatches propose-only subagents
              </text>
            </g>

            {/* Layer 3 — the passes propose; dx-design-execute builds */}
            <g className="map-item" style={at(4)}>
              <use href="#fullmap-plate" x="70" y="388" />
              <use href="#fullmap-cube" x="140" y="448" />
              <use href="#fullmap-cube" x="185" y="448" />
              <use href="#fullmap-cube" x="230" y="448" />
              <use href="#fullmap-cube" x="275" y="448" />
              <use href="#fullmap-cube" x="320" y="448" />
              {/* the builder stands apart, marked with the accent edge */}
              <use href="#fullmap-cube" x="412" y="448" />
              <polygon
                points="412,441.5 430,448 412,454.5 394,448"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.25"
              />
              <text
                x="230"
                y="528"
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="600"
                fill="var(--foreground)"
              >
                propose-only passes
              </text>
              <text
                x="230"
                y="542"
                textAnchor="middle"
                fontSize="10"
                fill="var(--muted-foreground)"
              >
                copy · flow · pattern · motion · polish
              </text>
              <text
                x="412"
                y="528"
                textAnchor="middle"
                className="font-mono"
                fontSize="10.5"
                fontWeight="600"
                fill="var(--tw-blue-text)"
              >
                dx-design-execute
              </text>
              <text
                x="412"
                y="542"
                textAnchor="middle"
                fontSize="10"
                fill="var(--muted-foreground)"
              >
                builds what you accept
              </text>
            </g>
            {/* Connector 3→4 */}
            <g className="map-item" style={at(5)}>
              <line
                className="map-line"
                x1="280"
                y1="558"
                x2="280"
                y2="596"
                stroke="var(--border-strong)"
                strokeWidth="1"
              />
              <polygon points="275,596 285,596 280,604" fill="var(--border-strong)" />
              <text x="294" y="584" fontSize="11" fill="var(--muted-foreground)">
                every skill reads the same context
              </text>
            </g>

            {/* Layer 4 — shared context */}
            <g className="map-item" style={at(6)}>
              <use href="#fullmap-plate" x="70" y="606" />
              <text
                x="280"
                y="644"
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="var(--foreground)"
              >
                shared context
              </text>
              <use href="#fullmap-slab" x="218" y="680" />
              <text
                x="218"
                y="683"
                textAnchor="middle"
                fontSize="9.5"
                fill="var(--foreground)"
              >
                control catalog
              </text>
              <use href="#fullmap-slab" x="342" y="680" />
              <text
                x="342"
                y="683"
                textAnchor="middle"
                fontSize="9.5"
                fill="var(--foreground)"
              >
                primitives
              </text>
            </g>
            {/* Connector 4→5 */}
            <g className="map-item" style={at(7)}>
              <line
                className="map-line"
                x1="280"
                y1="740"
                x2="280"
                y2="778"
                stroke="var(--border-strong)"
                strokeWidth="1"
              />
              <polygon points="275,778 285,778 280,786" fill="var(--border-strong)" />
              <text x="294" y="766" fontSize="11" fill="var(--muted-foreground)">
                written into the product repo
              </text>
            </g>

            {/* Layer 5 — DESIGN.md inside your product repo (dashed zone) */}
            <g className="map-item" style={at(8)}>
              <polygon
                points="280,788 490,848 280,908 70,848"
                fill="var(--accent)"
                stroke="var(--border-strong)"
                strokeWidth="1"
                strokeDasharray="5 5"
              />
              <use href="#fullmap-slab" x="280" y="850" />
              <text
                x="280"
                y="848"
                textAnchor="middle"
                className="font-mono"
                fontSize="12"
                fontWeight="600"
                fill="var(--foreground)"
              >
                DESIGN.md
              </text>
              <text
                x="280"
                y="934"
                textAnchor="middle"
                className="font-mono tracking-[0.06em]"
                fontSize="10.5"
                fill="var(--muted-foreground)"
              >
                YOUR PRODUCT REPO
              </text>
            </g>
          </svg>

          {/* Legend — visible content, not decoration: the words carry the key,
               the swatches reinforce it. */}
          <figcaption className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span aria-hidden className="size-3 rounded-xs border border-border-strong bg-muted" />
              solid — the harness plugin
            </span>
            <span className="flex items-center gap-2">
              <span aria-hidden className="size-3 rounded-xs border border-dashed border-border-strong" />
              dashed — your product repo
            </span>
            <span className="flex items-center gap-2">
              <span aria-hidden className="size-3 rounded-xs border border-primary" />
              lime edge — the single front door
            </span>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
