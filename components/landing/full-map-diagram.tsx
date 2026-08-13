"use client";

import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * SCROLL STORYBOARD
 *
 * Each numbered section owns one additive stage. The viewport's reading
 * line advances a single `activeStage` integer:
 *
 *   01   You enters with the first plain-language ask
 *   02   dx-design appears as the single front door
 *   03   propose-only passes and the one builder join
 *   04   shared catalog and primitives become available
 *   05   DESIGN.md lands in the product repository
 *
 * Previous layers remain as quiet context. No-JS and reduced-motion render
 * the complete finished map; only motion-capable clients arm staged hiding.
 * ───────────────────────────────────────────────────────── */

/* One rail entry: numbered, with a small locator kicker. The number is
   drawn (the <ol> already carries order); hence aria-hidden. */
function RailItem({
  n,
  where,
  heading,
  children,
  active,
  itemRef,
}: {
  n: number;
  where: string;
  heading: React.ReactNode;
  children: React.ReactNode;
  active: boolean;
  itemRef: (node: HTMLLIElement | null) => void;
}) {
  return (
    <li
      ref={itemRef}
      data-stage={n - 1}
      aria-current={active ? "step" : undefined}
      className="flex min-h-[58svh] items-center py-16 md:min-h-[72svh]"
    >
      <div
        className={`border-l-2 pl-6 transition-colors duration-(--motion-slow) ${
          active ? "border-primary" : "border-border"
        }`}
      >
        <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground">
          STEP {String(n).padStart(2, "0")} · {where}
        </p>
        <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-balance text-foreground">
          {heading}
        </h3>
        <p className="mt-3 max-w-[38ch] leading-relaxed text-pretty text-muted-foreground">
          {children}
        </p>
      </div>
    </li>
  );
}

const railCode = "rounded-sm bg-muted px-1 font-mono text-xs text-foreground";

/* Camera offsets are percentages of the 950-unit SVG height. Each one places
   its layer near the center of the 520–640px sticky viewport. Keeping the
   values together makes the scroll composition easy to retune. */
const MAP_CAMERA = ["23.8%", "5.2%", "-15.8%", "-37.5%", "-57.4%"] as const;

export function FullMapDiagram() {
  const stepRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [activeStage, setActiveStage] = useState(0);
  const [motionArmed, setMotionArmed] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 767px)").matches
    ) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const stage = Number((entry.target as HTMLElement).dataset.stage);
            setActiveStage(stage);
          }
        }
      },
      { threshold: 0, rootMargin: "-44% 0px -44% 0px" }
    );

    for (const step of stepRefs.current) {
      if (step !== null) observer.observe(step);
    }
    setMotionArmed(true);
    return () => observer.disconnect();
  }, []);

  const layerState = (stage: number) => ({
    "data-visible": !motionArmed || stage <= activeStage,
    "data-current": !motionArmed || stage === activeStage,
  });

  return (
    <div className="grid items-start md:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)] md:gap-12 lg:gap-16">
        {/* ── The reading rail: the non-visual story, in reading order ── */}
        <ol
          aria-label="How the harness is structured, in reading order"
          className="border-t border-border md:border-t-0"
        >
          <RailItem
            n={1}
            where="in the chat"
            heading="You"
            active={motionArmed && activeStage === 0}
            itemRef={(node) => { stepRefs.current[0] = node; }}
          >
            One ask, in plain words. You never pick a skill.
          </RailItem>
          <RailItem
            n={2}
            where="the harness plugin"
            active={motionArmed && activeStage === 1}
            itemRef={(node) => { stepRefs.current[1] = node; }}
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
          <RailItem
            n={3}
            where="dispatched as subagents"
            heading="The propose-only passes"
            active={motionArmed && activeStage === 2}
            itemRef={(node) => { stepRefs.current[2] = node; }}
          >
            Copy, flow, pattern, motion, polish — each returns up to five ranked
            findings. They plan and document for{" "}
            <code className={railCode}>dx-design-execute</code>, the one skill that
            builds what you accept.
          </RailItem>
          <RailItem
            n={4}
            where="the harness plugin"
            heading="Shared context"
            active={motionArmed && activeStage === 3}
            itemRef={(node) => { stepRefs.current[3] = node; }}
          >
            Every skill reads the same rulebook: the control catalog (L0 never
            waived, L1 needs a named approver, L2 needs a reason), grounded by the
            primitives — tokens and components.
          </RailItem>
          <RailItem
            n={5}
            where="your product repo"
            active={motionArmed && activeStage === 4}
            itemRef={(node) => { stepRefs.current[4] = node; }}
            heading={<code className="font-mono">DESIGN.md</code>}
          >
            Your product&rsquo;s decisions and deviations, written where any agent
            can read them. The catalog stays the rulebook;{" "}
            <code className={railCode}>DESIGN.md</code> never restates a control.
          </RailItem>
        </ol>

        {/* The map remains pinned while the reading rail advances its single
            additive stage. On narrow screens it becomes a complete static
            figure before the prose, avoiding a tiny sticky viewport. */}
        <figure className="order-first min-w-0 border-y border-border py-8 md:sticky md:top-16 md:order-last md:flex md:h-[calc(100svh-4rem)] md:flex-col md:justify-center md:border-y-0 md:py-0">
          <div className="scroll-map-viewport mx-auto w-full max-w-[560px] md:h-[calc(100svh-10rem)] md:min-h-[520px] md:max-h-[640px] md:overflow-hidden">
          <svg
            viewBox="0 0 560 950"
            role="img"
            aria-labelledby="fullmap-title fullmap-desc"
            className="scroll-map-figure mx-auto block h-auto w-full"
            style={motionArmed ? { translate: `0 ${MAP_CAMERA[activeStage]}` } : undefined}
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
            <g className="scroll-map-layer" {...layerState(0)}>
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
            <g className="scroll-map-layer scroll-map-connector" {...layerState(1)}>
              <line
                className="scroll-map-line"
                x1="280"
                y1="158"
                x2="280"
                y2="196"
                stroke="var(--border-strong)"
                strokeWidth="1"
              />
              <polygon points="275,196 285,196 280,204" fill="var(--border-strong)" />
              <text x="294" y="184" fontSize="12" fill="var(--muted-foreground)">
                one ask, in plain words
              </text>
            </g>

            {/* Layer 2 — dx-design, the single front door */}
            <g className="scroll-map-layer" {...layerState(1)}>
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
                fontSize="12"
                fill="var(--muted-foreground)"
              >
                /dx-harness:dx-design
              </text>
            </g>
            {/* Connector 2→3 */}
            <g className="scroll-map-layer scroll-map-connector" {...layerState(2)}>
              <line
                className="scroll-map-line"
                x1="280"
                y1="340"
                x2="280"
                y2="378"
                stroke="var(--border-strong)"
                strokeWidth="1"
              />
              <polygon points="275,378 285,378 280,386" fill="var(--border-strong)" />
              <text x="294" y="366" fontSize="12" fill="var(--muted-foreground)">
                dispatches propose-only subagents
              </text>
            </g>

            {/* Layer 3 — the passes propose; dx-design-execute builds */}
            <g className="scroll-map-layer" {...layerState(2)}>
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
                fontSize="12"
                fontWeight="600"
                fill="var(--foreground)"
              >
                propose-only passes
              </text>
              <text
                x="230"
                y="542"
                textAnchor="middle"
                fontSize="12"
                fill="var(--muted-foreground)"
              >
                copy · flow · pattern · motion · polish
              </text>
              <text
                x="412"
                y="528"
                textAnchor="middle"
                className="font-mono"
                fontSize="12"
                fontWeight="600"
                fill="var(--tw-blue-text)"
              >
                dx-design-execute
              </text>
              <text
                x="412"
                y="542"
                textAnchor="middle"
                fontSize="12"
                fill="var(--muted-foreground)"
              >
                builds what you accept
              </text>
            </g>
            {/* Connector 3→4 */}
            <g className="scroll-map-layer scroll-map-connector" {...layerState(3)}>
              <line
                className="scroll-map-line"
                x1="280"
                y1="558"
                x2="280"
                y2="596"
                stroke="var(--border-strong)"
                strokeWidth="1"
              />
              <polygon points="275,596 285,596 280,604" fill="var(--border-strong)" />
              <text x="294" y="584" fontSize="12" fill="var(--muted-foreground)">
                every skill reads the same context
              </text>
            </g>

            {/* Layer 4 — shared context */}
            <g className="scroll-map-layer" {...layerState(3)}>
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
                fontSize="12"
                fill="var(--foreground)"
              >
                control catalog
              </text>
              <use href="#fullmap-slab" x="342" y="680" />
              <text
                x="342"
                y="683"
                textAnchor="middle"
                fontSize="12"
                fill="var(--foreground)"
              >
                primitives
              </text>
            </g>
            {/* Connector 4→5 */}
            <g className="scroll-map-layer scroll-map-connector" {...layerState(4)}>
              <line
                className="scroll-map-line"
                x1="280"
                y1="740"
                x2="280"
                y2="778"
                stroke="var(--border-strong)"
                strokeWidth="1"
              />
              <polygon points="275,778 285,778 280,786" fill="var(--border-strong)" />
              <text x="294" y="766" fontSize="12" fill="var(--muted-foreground)">
                written into the product repo
              </text>
            </g>

            {/* Layer 5 — DESIGN.md inside your product repo (dashed zone) */}
            <g className="scroll-map-layer" {...layerState(4)}>
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
                fontSize="12"
                fill="var(--muted-foreground)"
              >
                Your product repo
              </text>
            </g>
          </svg>
          </div>

          {/* Legend — visible content, not decoration: the words carry the key,
               the swatches reinforce it. */}
          <figcaption className="mx-auto mt-4 flex w-full max-w-[560px] flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
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
              blue edge — the single front door
            </span>
          </figcaption>
        </figure>
      </div>
  );
}
