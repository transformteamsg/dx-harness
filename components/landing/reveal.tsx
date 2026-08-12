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

  return <div ref={ref}>{children}</div>;
}
