"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createAstroidArcLengthLookup,
  createAstroidPartialPath,
  getAstroidFrame,
  getParameterAtArcProgress,
} from "@/lib/dxd-construction";
import { DUR, EASE_OUT, useReducedMotionResolved } from "@/lib/motion";

const GRID = [200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800];
const BOUND_MIN = 287.87;
const BOUND_MAX = 712.13;
const DRAW_DURATION = 4.2;
const SETTINGS = { sharpness: 4, radius: 300, rotation: 45 } as const;

/* Two element types, not one motion element with a zero duration. A motion
   component that mounts before the reduced-motion preference has resolved has
   already started its transition, and switching the duration afterwards does not
   un-start it — that is exactly the failure these two wrappers replace. While the
   preference is unknown both render a plain, static <g>; only once it comes back
   as "no preference" does the animating branch mount. */
function GuideLayer({
  animating,
  shown,
  children,
}: {
  animating: boolean;
  shown: boolean;
  children: React.ReactNode;
}) {
  const shared = {
    fill: "none",
    stroke: "var(--blueprint-ink)",
    vectorEffect: "non-scaling-stroke",
  } as const;

  if (!animating) {
    return (
      <g {...shared} opacity={shown ? 1 : 0}>
        {children}
      </g>
    );
  }

  return (
    <motion.g
      {...shared}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DUR.story, ease: EASE_OUT }}
    >
      {children}
    </motion.g>
  );
}

function RegistrationDots({
  animating,
  completed,
  children,
}: {
  animating: boolean;
  completed: boolean;
  children: React.ReactNode;
}) {
  /* 1.5 is not a taste call: it is the bounding square's stroke, and these dots
     sit on that square's corners. Both layers draw with non-scaling-stroke, so
     the numbers are the same unit and the ring reads as part of the drawing
     rather than a widget pinned on top of it. */
  const shared = {
    fill: "var(--surface)",
    stroke: "var(--blueprint-ink)",
    strokeWidth: 1.5,
    vectorEffect: "non-scaling-stroke",
  } as const;

  if (!animating) {
    return (
      <g {...shared} opacity={completed ? 1 : 0}>
        {children}
      </g>
    );
  }

  return (
    <motion.g
      {...shared}
      initial={false}
      animate={{ opacity: completed ? 1 : 0, scale: completed ? 1 : 0.75 }}
      transition={{ duration: DUR.slow, ease: EASE_OUT }}
      style={{ transformOrigin: "500px 500px" }}
    >
      {children}
    </motion.g>
  );
}

/* The drawing is inked on paper, not on a dark plate: the panel is the same
   --sheet-band the section heading bands use, and the construction is
   --blueprint-ink, the token the sheet's corner registration marks already draw
   with.

   The traced mark itself is --mark-ink (Radix lime-10, the brand's figure step)
   at a 7px stroke — a builder ruling on 2026-08-18, replacing a 5px stroke in
   --blueprint-ink. What that trades, stated plainly: lime-10 measures ~1.4:1 on
   the --sheet-band, where the old ink measured ~4.7:1, so the mark no longer
   clears the 3:1 non-text floor. It is the brand mark, which WCAG exempts from
   that floor as a logotype, and the hero's message is carried by the headline
   beside it rather than by the drawing — so nothing here is a graphic a reader
   must resolve to follow the page. The construction guides keep --blueprint-ink
   and their contrast; the extra 2px of weight is what keeps the lighter ink
   present.

   The guide opacities are roughly double what the dark plate used. They are not a
   free parameter: bright lime on near-black and dark lime on near-white are not
   the same job, and the values tuned against #37401c leave the guides almost
   invisible against #f7f7f8. The ramp below is what carries the hierarchy —
   traced mark, then bounding square, then circle, then the dashed construction,
   then the crosshair. */
export function DxdConstructionPreview() {
  /* null until the preference is known. Nothing animates on that branch, so a
     reduced-motion reader never has an animation started on their behalf and
     then cancelled an effect later (A11Y-5). */
  const reduced = useReducedMotionResolved();
  const animating = reduced === false;
  const [progress, setProgress] = useState(0);
  const frameId = useRef<number | null>(null);
  const arcLengthLookup = useMemo(
    () => createAstroidArcLengthLookup(SETTINGS),
    [],
  );
  const parameter = getParameterAtArcProgress(arcLengthLookup, progress);
  const tracePath = useMemo(
    () => createAstroidPartialPath(SETTINGS, parameter, 64),
    [parameter],
  );
  const frame = getAstroidFrame(SETTINGS, parameter);
  const instrumentVisible = animating && progress > 0 && progress < 1;
  const completed = progress >= 1;

  useEffect(() => {
    if (reduced === null) return;

    if (reduced) {
      setProgress(1);
      return;
    }

    setProgress(0);
    const delayId = window.setTimeout(() => {
      const startedAt = performance.now();
      const advance = (now: number) => {
        const next = Math.min(1, (now - startedAt) / (DRAW_DURATION * 1000));
        setProgress(next);
        if (next < 1) frameId.current = window.requestAnimationFrame(advance);
      };
      frameId.current = window.requestAnimationFrame(advance);
    }, DUR.story * 1000);

    return () => {
      window.clearTimeout(delayId);
      if (frameId.current !== null) window.cancelAnimationFrame(frameId.current);
    };
  }, [reduced]);

  return (
    <figure className="flex h-[22rem] items-center justify-center overflow-hidden bg-sheet-band sm:h-[26rem] lg:h-full lg:min-h-[30rem]">
      <svg
        viewBox="180 180 640 640"
        role="img"
        aria-label="The DXD mark drawing itself on a construction grid."
        className="block h-full w-full"
      >
        <rect x="180" y="180" width="640" height="640" fill="var(--sheet-band)" />

        <g
          stroke="var(--blueprint-ink)"
          strokeWidth="1"
          opacity="0.12"
          vectorEffect="non-scaling-stroke"
        >
          {GRID.map((n) => (
            <path key={`h-${n}`} d={`M180 ${n}H820`} />
          ))}
          {GRID.map((n) => (
            <path key={`v-${n}`} d={`M${n} 180V820`} />
          ))}
        </g>

        <GuideLayer animating={animating} shown={reduced === true}>
          <circle cx="500" cy="500" r="300" strokeWidth="1.5" opacity="0.8" />
          <path d="M200 500H800M500 200V800" strokeWidth="1" opacity="0.65" />
          <path d="M287.87 287.87 712.13 712.13M712.13 287.87 287.87 712.13" strokeWidth="1" strokeDasharray="5 7" opacity="0.75" />
          <rect
            x={BOUND_MIN}
            y={BOUND_MIN}
            width={BOUND_MAX - BOUND_MIN}
            height={BOUND_MAX - BOUND_MIN}
            strokeWidth="1.5"
            opacity="0.9"
          />
          <circle cx="500" cy="500" r="106.07" strokeWidth="1" opacity="0.7" />
          <path d="M500 393.93 606.07 500 500 606.07 393.93 500Z" strokeWidth="1" strokeDasharray="5 6" opacity="0.75" />
        </GuideLayer>

        {progress > 0 ? (
          <path
            data-construction-path
            d={tracePath}
            fill="none"
            stroke="var(--mark-ink)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}

        <g
          opacity={instrumentVisible ? 1 : 0}
          fill="none"
          stroke="var(--blueprint-ink)"
          vectorEffect="non-scaling-stroke"
        >
          {frame.alternateCurvatureCenter ? (
            <circle
              cx={frame.alternateCurvatureCenter.x}
              cy={frame.alternateCurvatureCenter.y}
              r={frame.curvatureRadius}
              strokeWidth="1.25"
              strokeDasharray="8 8"
              opacity="0.45"
            />
          ) : null}
          <circle
            cx={frame.curvatureCenter.x}
            cy={frame.curvatureCenter.y}
            r={frame.curvatureRadius}
            strokeWidth="1.5"
            strokeDasharray="8 8"
            opacity="0.75"
          />
          <line
            x1={frame.curvatureCenter.x}
            y1={frame.curvatureCenter.y}
            x2={frame.point.x}
            y2={frame.point.y}
            strokeWidth="1.75"
            opacity="0.86"
          />
          <circle
            cx={frame.curvatureCenter.x}
            cy={frame.curvatureCenter.y}
            r="6"
            fill="var(--blueprint-ink)"
          />
          <line
            x1={frame.point.x - frame.tangent.x * 28}
            y1={frame.point.y - frame.tangent.y * 28}
            x2={frame.point.x + frame.tangent.x * 28}
            y2={frame.point.y + frame.tangent.y * 28}
            strokeWidth="1.5"
          />
          <line
            x1={frame.point.x - frame.normal.x * 18}
            y1={frame.point.y - frame.normal.y * 18}
            x2={frame.point.x + frame.normal.x * 18}
            y2={frame.point.y + frame.normal.y * 18}
            strokeWidth="1"
            opacity="0.6"
          />
          {/* The tracer knocks the line out behind it, so it fills with the panel
              ground rather than the sheet's white. */}
          <circle
            data-construction-tracer
            cx={frame.point.x}
            cy={frame.point.y}
            r="13"
            fill="var(--sheet-band)"
            strokeWidth="2.5"
          />
          <circle
            cx={frame.point.x}
            cy={frame.point.y}
            r="5"
            fill="var(--blueprint-ink)"
          />
        </g>

        <RegistrationDots animating={animating} completed={completed}>
          <circle cx={BOUND_MIN} cy={BOUND_MIN} r="9" />
          <circle cx={BOUND_MAX} cy={BOUND_MIN} r="9" />
          <circle cx={BOUND_MIN} cy={BOUND_MAX} r="9" />
          <circle cx={BOUND_MAX} cy={BOUND_MAX} r="9" />
        </RegistrationDots>
      </svg>
      <figcaption className="sr-only">
        The canonical DXD mark is built from a measured one-to-two waist ratio.
      </figcaption>
    </figure>
  );
}
