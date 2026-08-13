"use client";
import { useEffect, useRef } from "react";

/* Arms a one-time staged reveal of its children (see the [data-reveal] rules
   in globals.css). The hidden state is applied only here, client-side, after
   checking reduced motion — server markup, no-JS, and reduce users always
   get the finished layout (MOT-3, A11Y-5). Mirrors the demo divider nudge's
   once-only convention. */
export function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (el === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    /* Never arm what cannot be un-armed. Arming applies the hidden state, so
       everything that could fail must fail BEFORE this point — otherwise the
       section is stranded at opacity 0 with nothing left to play it. */
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries[0].isIntersecting) {
          el.setAttribute("data-reveal", "shown");
          obs.disconnect();
        }
      },
      /* threshold 0 + a bottom inset, NOT threshold 0.2. A ratio threshold is
         unsatisfiable once the element is taller than 1/0.2 = 5x the viewport:
         20% of it can never be on screen at once, isIntersecting never goes
         true, and the content stays hidden permanently. The inset fires on the
         same beat — when the element reaches 80% of viewport height — at any
         element height. */
      { threshold: 0, rootMargin: "0px 0px -20% 0px" }
    );
    el.setAttribute("data-reveal", "armed");
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.removeAttribute("data-reveal");
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
