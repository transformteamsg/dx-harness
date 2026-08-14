"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createAstroidArcLengthLookup,
  createAstroidPartialPath,
  getAstroidFrame,
  getParameterAtArcProgress,
} from "@/lib/dxd-construction";
import { DUR, EASE_OUT, useReducedMotionSafe } from "@/lib/motion";

const GRID = [200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800];
const BOUND_MIN = 287.87;
const BOUND_MAX = 712.13;
const DRAW_DURATION = 4.2;
const SETTINGS = { sharpness: 4, radius: 300, rotation: 45 } as const;

export function DxdConstructionPreview() {
  const reduced = useReducedMotionSafe();
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
  const instrumentVisible = !reduced && progress > 0 && progress < 1;
  const completed = progress >= 1;

  useEffect(() => {
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
    <figure className="flex h-[30rem] items-center justify-center overflow-hidden bg-(--hero-panel) sm:h-[36rem] lg:h-full lg:min-h-[40rem]">
      <svg
        viewBox="180 180 640 640"
        role="img"
        aria-label="The DXD mark drawing itself on a dark construction grid."
        className="block h-full w-full"
      >
        <rect x="180" y="180" width="640" height="640" fill="var(--hero-panel)" />

        <g
          stroke="var(--surface)"
          strokeWidth="1"
          opacity="0.1"
          vectorEffect="non-scaling-stroke"
        >
          {GRID.map((n) => (
            <path key={`h-${n}`} d={`M180 ${n}H820`} />
          ))}
          {GRID.map((n) => (
            <path key={`v-${n}`} d={`M${n} 180V820`} />
          ))}
        </g>

        <motion.g
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.story, ease: EASE_OUT }}
          fill="none"
          stroke="var(--site-accent)"
          vectorEffect="non-scaling-stroke"
        >
          <circle cx="500" cy="500" r="300" strokeWidth="1.5" opacity="0.55" />
          <path d="M200 500H800M500 200V800" strokeWidth="1" opacity="0.35" />
          <path d="M287.87 287.87 712.13 712.13M712.13 287.87 287.87 712.13" strokeWidth="1" strokeDasharray="5 7" opacity="0.5" />
          <rect
            x={BOUND_MIN}
            y={BOUND_MIN}
            width={BOUND_MAX - BOUND_MIN}
            height={BOUND_MAX - BOUND_MIN}
            strokeWidth="1.5"
            opacity="0.75"
          />
          <circle cx="500" cy="500" r="106.07" strokeWidth="1" opacity="0.4" />
          <path d="M500 393.93 606.07 500 500 606.07 393.93 500Z" strokeWidth="1" strokeDasharray="5 6" opacity="0.5" />
        </motion.g>

        {progress > 0 ? (
          <path
            data-construction-path
            d={tracePath}
            fill="none"
            stroke="var(--site-accent)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}

        <g
          opacity={instrumentVisible ? 1 : 0}
          fill="none"
          stroke="var(--site-accent)"
          vectorEffect="non-scaling-stroke"
        >
          {frame.alternateCurvatureCenter ? (
            <circle
              cx={frame.alternateCurvatureCenter.x}
              cy={frame.alternateCurvatureCenter.y}
              r={frame.curvatureRadius}
              strokeWidth="1.25"
              strokeDasharray="8 8"
              opacity="0.2"
            />
          ) : null}
          <circle
            cx={frame.curvatureCenter.x}
            cy={frame.curvatureCenter.y}
            r={frame.curvatureRadius}
            strokeWidth="1.5"
            strokeDasharray="8 8"
            opacity="0.42"
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
            fill="var(--site-accent)"
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
          <circle
            data-construction-tracer
            cx={frame.point.x}
            cy={frame.point.y}
            r="13"
            fill="var(--hero-panel)"
            strokeWidth="2.5"
          />
          <circle
            cx={frame.point.x}
            cy={frame.point.y}
            r="5"
            fill="var(--site-accent)"
          />
        </g>

        <motion.g
          initial={false}
          animate={{ opacity: completed ? 1 : 0, scale: completed ? 1 : 0.75 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT }}
          style={{ transformOrigin: "500px 500px" }}
          fill="var(--surface)"
          stroke="var(--site-accent)"
          strokeWidth="4"
          vectorEffect="non-scaling-stroke"
        >
          <circle cx={BOUND_MIN} cy={BOUND_MIN} r="9" />
          <circle cx={BOUND_MAX} cy={BOUND_MIN} r="9" />
          <circle cx={BOUND_MIN} cy={BOUND_MAX} r="9" />
          <circle cx={BOUND_MAX} cy={BOUND_MAX} r="9" />
        </motion.g>
      </svg>
      <figcaption className="sr-only">
        The canonical DXD mark is built from a measured one-to-two waist ratio.
      </figcaption>
    </figure>
  );
}
