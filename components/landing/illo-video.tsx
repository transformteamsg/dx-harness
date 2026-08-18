"use client";

import { useEffect, useRef } from "react";

/* The landing's illustrated feature rows: a hand-drawn clip that loops its
   card's argument while the row is on screen.

   Motion policy: playback follows visibility — the clip plays while at least
   half of it is on screen and pauses when it leaves, so nothing animates
   unwatched. Under prefers-reduced-motion nothing plays at all (A11Y-5): the
   poster rests, full stop, and the preference is re-read when it changes so a
   mid-session toggle is obeyed both ways. There is no play/pause control — the
   builder ruled it off (2026-08-18) as chrome the drawings do not need. The
   cost, recorded in the decision record: a reader without the OS-level
   reduced-motion setting has no per-clip stop, which WCAG 2.2.2 asks of
   motion that runs past five seconds beside content. The clip is decorative
   (aria-hidden) and muted; the text cell carries every claim it makes.

   The clips' near-white grounds vary (251 to 255), so the element blends with
   `multiply` and a `brightness(1.02)` nudge: white maps onto whatever ground
   is behind it and the ink stays, so the drawing sits plateless on the page,
   a white cell, or the closing band's tint alike. */

export function IlloVideo({
  src,
  poster,
  className = "max-w-sm",
}: {
  src: string;
  poster: string;
  /* Width cap for the square clip — the closing section runs it smaller. */
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;

    const sync = () => {
      if (motionQuery.matches) {
        video.pause();
        return;
      }
      if (inView) {
        /* A blocked autoplay (iOS Low Power Mode, a strict autoplay policy) is
           not an error here: the poster simply stays, which is the correct
           resting state. */
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inView = entry.intersectionRatio >= 0.5;
          sync();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(video);
    motionQuery.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", sync);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      className={`block aspect-square w-full mix-blend-multiply [filter:brightness(1.02)] ${className}`}
    />
  );
}
