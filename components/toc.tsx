"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import type { TocHeading } from "@/lib/toc";

/* "On this page" as a rail of ticks rather than a list of titles: one mark per
   section, long for h2 and short for h3, the section in view inked. Hovering or
   tabbing to a mark opens its title and opening line beside it.

   The card opens to the LEFT of the rail, mirroring the reference, which sits on
   the left edge of its page. Ours is the right-hand column of a centred 1080px
   main, so a card opening right would run off the pane on any window narrower
   than about 1600px; opening left it lands in the gutter beside the prose.

   The ticks are decorative (A11Y-6) and so is the card — every link carries its
   section title as its accessible name, so a screen reader reads the same list
   of sections it read when this was a list of links, and the hover card is not
   the only thing carrying the title (MOT-3). */
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
      /* md, not lg. The old list needed 208px and only fit at xl; a 40px rail
         fits from 768px up, where the sidebar has already become an overlay and
         the whole window is the content pane. The longest doc has 11 headings,
         so at 24px a row the rail is 264px tall and never needs to scroll. */
      /* ml-auto because the prose caps at 720px: without it the rail sits right
         after the gap and floats in the middle of the gutter. Pinned to the
         edge it reads as a page-margin index, which is what it is. */
      className="sticky top-24 ml-auto hidden max-h-[calc(100vh-8rem)] w-10 shrink-0 self-start overflow-y-visible md:block"
    >
      <ul>
        {headings.map((h) => {
          const isActive = active === h.id;
          return (
            <li key={h.id} className="group relative">
              <a
                href={`#${h.id}`}
                aria-current={isActive ? "true" : undefined}
                /* min-h-6 is the whole reason the ticks sit 24px apart: the mark
                   is 2px tall, but the target it lives in has to clear 24×24
                   (A11Y-4), so the row height sets the rhythm. */
                className="flex min-h-6 w-full items-center justify-end rounded-xs pr-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)"
              >
                <span
                  aria-hidden="true"
                  className={clsx(
                    "h-0.5 rounded-full transition-colors duration-(--motion-fast) motion-reduce:transition-none",
                    h.depth === 3 ? "w-3" : "w-6",
                    isActive
                      ? "bg-foreground"
                      : "bg-border-strong group-hover:bg-muted-foreground",
                  )}
                />
                <span className="sr-only">{h.text}</span>
              </a>

              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-full z-20 mr-3 w-64 -translate-y-1/2 rounded-lg border border-border bg-surface p-3 opacity-0 shadow-lg transition-opacity duration-(--motion-fast) group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
              >
                <span className="block text-sm leading-snug font-medium text-foreground">
                  {h.text}
                </span>
                {h.snippet && (
                  <span className="mt-1 block text-sm leading-snug text-muted-foreground">
                    {h.snippet}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
