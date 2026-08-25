import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** Reactive `prefers-reduced-motion: reduce` state (A11Y-5), re-read on a
    mid-session toggle rather than latched at mount. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    const query = window.matchMedia(QUERY);
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}
