"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import type { TocHeading } from "@/lib/toc";

/* HIG-style "on this page" rail: every section of the current page listed on
   the right, the one in view marked on the shared left rule. */
export function Toc({ headings }: { headings: TocHeading[] }) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    const onScroll = () => {
      let current = headings[0]?.id ?? null;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= 120) current = h.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  return (
    <nav
      aria-label="On this page"
      className="sticky top-24 hidden max-h-[calc(100vh-8rem)] w-52 shrink-0 self-start overflow-y-auto xl:block"
    >
      <p className="text-xs font-semibold text-muted-foreground">
        On this page
      </p>
      <ul className="mt-3 border-l border-border">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={clsx(
                "-ml-px block border-l-2 py-1 pr-2 text-xs leading-snug transition-colors duration-150",
                h.depth === 3 ? "pl-6" : "pl-3",
                active === h.id
                  ? "border-tw-blue font-medium text-tw-blue"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
