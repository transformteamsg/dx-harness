"use client";

/* Duration-scale specimen for the Motion foundations page: the four tokens
   race side by side, so the eye sees the scale rather than four numbers.
   Every knob leaves together with --ease-out and its own duration (MOT-2).
   Reduced motion renders the knobs settled at the track end with the values
   fully legible — nothing is missing, only still (MOT-3, A11Y-5). */

import { motion } from "motion/react";
import { useState } from "react";
import { DUR, EASE_OUT, useReducedMotionSafe } from "@/lib/motion";

const ROWS = [
  { token: "--motion-fast", ms: "120ms", duration: DUR.fast },
  { token: "--motion-base", ms: "200ms", duration: DUR.base },
  { token: "--motion-slow", ms: "300ms", duration: DUR.slow },
  { token: "--motion-story", ms: "600ms", duration: DUR.story },
] as const;

export function MotionScale() {
  const reduced = useReducedMotionSafe();
  const [runId, setRunId] = useState(0);
  const played = runId > 0;

  return (
    <figure className="my-8 max-w-[480px]">
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-col gap-3">
          {ROWS.map((row) => (
            <div key={row.token} className="flex items-center gap-3">
              <span className="w-32 shrink-0 text-xs font-medium text-foreground">
                {row.token}
              </span>
              <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {row.ms}
              </span>
              <div aria-hidden className="relative h-3 min-w-0 flex-1 rounded-full bg-muted">
                {reduced ? (
                  <div className="absolute inset-y-0 left-0 right-3 translate-x-full">
                    <div className="h-3 w-3 rounded-sm bg-tw-blue" />
                  </div>
                ) : (
                  <motion.div
                    key={runId}
                    className="absolute inset-y-0 left-0 right-3"
                    initial={{ x: 0 }}
                    animate={{ x: played ? "100%" : 0 }}
                    transition={{ duration: row.duration, ease: EASE_OUT }}
                  >
                    <div className="h-3 w-3 rounded-sm bg-tw-blue" />
                  </motion.div>
                )}
              </div>
            </div>
          ))}
        </div>
        {!reduced && (
          <button
            type="button"
            onClick={() => setRunId((n) => n + 1)}
            className="mt-4 inline-flex items-center justify-center rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors duration-(--motion-fast) hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue) max-sm:min-h-11"
          >
            Play
          </button>
        )}
      </div>
      <figcaption className="mt-3 max-w-[52ch] text-xs leading-normal text-muted-foreground">
        The four durations, raced: every knob leaves together on --ease-out and
        covers the same distance — only the time differs.
      </figcaption>
    </figure>
  );
}
