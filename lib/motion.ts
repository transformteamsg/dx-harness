import { cubicBezier, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/* Mirror of the motion tokens in app/globals.css — motion/react needs numbers,
   CSS needs custom properties; lib/motion.test.ts keeps the two in sync.
   Change values there and here together, never one side alone (MOT-2). */
export const DUR = { fast: 0.12, base: 0.2, slow: 0.3, story: 0.6 } as const;
export const STAGGER = 0.06;
export const EASE_OUT = cubicBezier(0.215, 0.61, 0.355, 1);
export const EASE_IN_OUT = cubicBezier(0.645, 0.045, 0.355, 1);
/* Bezier control points, exported for the sync test. */
export const EASE_OUT_POINTS = [0.215, 0.61, 0.355, 1] as const;
export const EASE_IN_OUT_POINTS = [0.645, 0.045, 0.355, 1] as const;

/* SSR-safe reduced-motion: returns false on the server and the first client
   render (so hydration always matches), then the real preference.

   Read the caveat before using this for anything that mounts an animation.
   "Reduced users may see one frame of the non-reduced initial state" was the
   original note, and it is wrong: one frame is not what happens. Because this
   returns false on the first client render, any motion component whose `initial`
   is chosen from it mounts in the non-reduced branch and motion/react starts the
   transition immediately — the preference arrives an effect too late to stop it.
   Measured on the landing hero under prefers-reduced-motion: reduce, that was a
   600ms opacity fade and a 300ms scale, not a frame.

   It is still correct for choosing a *duration* or reading the preference after
   mount. For deciding whether an animation mounts at all, use
   useReducedMotionResolved below. */
export function useReducedMotionSafe(): boolean {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && reduced === true;
}

/* Three-state reduced-motion: null until the preference is known, then the real
   answer. A component that must not animate for reduced users renders its
   settled, un-animated state while this is null, and only mounts the animating
   markup once it resolves — so there is no window in which an animation has
   already started under the wrong assumption. Server and first client render
   agree on the null branch, so hydration still matches. */
export function useReducedMotionResolved(): boolean | null {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? reduced === true : null;
}
