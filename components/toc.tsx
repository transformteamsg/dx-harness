"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import type { TocHeading } from "@/lib/toc";

/* "On this page" as a rail of ticks rather than a list of titles: one mark per
   section, long for h2 and short for h3, the section in view inked. Hovering or
   tabbing to a mark grows and inks it, then opens its title and opening line
   beside it.

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const previewIndex = hoveredIndex ?? focusedIndex;

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
      /* md, not lg. The old list needed 208px and only fit at xl; a 32px rail
         fits from 768px up, where the sidebar has already become an overlay and
         the whole window is the content pane. The compact 12px rhythm keeps even
         the longest doc's index together as one quiet margin element. */
      /* ml-auto because the prose caps at 720px: without it the rail sits right
         after the gap and floats in the middle of the gutter. Pinned to the
         edge it reads as a page-margin index, which is what it is. */
      className="sticky top-24 ml-auto hidden max-h-[calc(100vh-8rem)] w-8 shrink-0 self-start overflow-y-visible md:block"
    >
      <ul>
        {headings.map((h, index) => {
          const isActive = active === h.id;
          const previewDistance =
            previewIndex === null ? null : Math.abs(previewIndex - index);
          const isPreviewed = previewDistance === 0;
          const tickWidth =
            previewDistance === 0
              ? "w-7"
              : previewDistance === 1
                ? "w-5"
                : previewDistance === 2
                  ? "w-3"
                  : h.depth === 3
                    ? "w-2"
                    : "w-2.5";
          const isInked = previewIndex === null ? isActive : isPreviewed;

          return (
            <li
              key={h.id}
              className="relative"
              onPointerEnter={() => setHoveredIndex(index)}
              onPointerLeave={() => setHoveredIndex(null)}
            >
              <a
                href={`#${h.id}`}
                aria-current={isActive ? "true" : undefined}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                className="flex min-h-3 w-full items-center justify-end rounded-xs pr-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)"
              >
                <span
                  aria-hidden="true"
                  className={clsx(
                    "h-0.5 rounded-full transition-[width,background-color] duration-(--motion-fast) motion-reduce:transition-none",
                    tickWidth,
                    isInked ? "bg-foreground" : "bg-border-strong",
                  )}
                />
                <span className="sr-only">{h.text}</span>
              </a>

              <span
                aria-hidden="true"
                className={clsx(
                  "pointer-events-none absolute top-1/2 right-full z-20 mr-3 w-64 -translate-y-1/2 rounded-lg border border-border bg-surface p-3 shadow-lg transition-[opacity,transform] duration-(--motion-fast) motion-reduce:transition-none",
                  isPreviewed
                    ? "translate-x-0 opacity-100"
                    : "translate-x-1 opacity-0",
                )}
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
