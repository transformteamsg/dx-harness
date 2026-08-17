"use client";

import { useEffect, useRef } from "react";

const MAX_EYE_TRAVEL = 4;
const RESTING_TRANSFORM = "translate(0px, 0px)";

export function SkillMark({ role }: { role: string }) {
  const markRef = useRef<SVGSVGElement>(null);
  const eyesRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const mark = markRef.current;
    const eyes = eyesRef.current;
    const card = mark?.closest<HTMLElement>("[data-skill-card]");

    if (!mark || !eyes || !card) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame: number | null = null;
    let pointerX = 0;
    let pointerY = 0;

    const resetEyes = () => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      animationFrame = null;
      eyes.style.transform = RESTING_TRANSFORM;
    };

    const renderEyes = () => {
      animationFrame = null;
      if (reducedMotion.matches) {
        resetEyes();
        return;
      }

      const bounds = mark.getBoundingClientRect();
      const deltaX = pointerX - (bounds.left + bounds.width / 2);
      const deltaY = pointerY - (bounds.top + bounds.height / 2);
      const distance = Math.hypot(deltaX, deltaY);

      if (distance === 0) {
        resetEyes();
        return;
      }

      const travel = Math.min(MAX_EYE_TRAVEL, distance / 12);
      const x = (deltaX / distance) * travel;
      const y = (deltaY / distance) * travel;
      eyes.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
    };

    const followPointer = (event: PointerEvent) => {
      if (event.pointerType === "touch" || reducedMotion.matches) {
        resetEyes();
        return;
      }

      pointerX = event.clientX;
      pointerY = event.clientY;
      if (animationFrame === null) animationFrame = requestAnimationFrame(renderEyes);
    };

    card.addEventListener("pointermove", followPointer);
    card.addEventListener("pointerleave", resetEyes);
    reducedMotion.addEventListener("change", resetEyes);

    return () => {
      card.removeEventListener("pointermove", followPointer);
      card.removeEventListener("pointerleave", resetEyes);
      reducedMotion.removeEventListener("change", resetEyes);
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    };
  }, []);

  const common = {
    ref: markRef,
    className: "size-16 shrink-0",
    viewBox: "0 0 64 64",
    fill: "none",
    "aria-hidden": true,
    "data-skill-mark": role,
  } as const;
  const eyes = (
    <g
      ref={eyesRef}
      className="origin-center transition-transform duration-(--motion-fast) ease-out motion-reduce:transition-none"
      data-skill-eyes
      style={{ transform: RESTING_TRANSFORM }}
    >
      <rect x="23" y="22" width="6" height="14" rx="3" fill="var(--surface)" />
      <rect x="35" y="22" width="6" height="14" rx="3" fill="var(--surface)" />
    </g>
  );

  switch (role) {
    case "Orchestrator":
      return (
        <svg {...common}>
          <rect x="7" y="7" width="50" height="50" rx="16" fill="var(--sec-foundations)" />
          {eyes}
        </svg>
      );
    case "Copy":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="27" fill="var(--sec-guidelines)" />
          {eyes}
        </svg>
      );
    case "Pattern":
      return (
        <svg {...common}>
          <path d="M31 5c3-1 6 1 8 5l20 37c3 6-1 12-8 12H13c-7 0-11-7-7-13L26 10c1-3 3-4 5-5Z" fill="var(--sec-getting-started)" />
          {eyes}
        </svg>
      );
    case "Polish":
      return (
        <svg {...common}>
          <path
            d="M28 8c2.2-2.2 5.8-2.2 8 0l20 20c2.2 2.2 2.2 5.8 0 8L36 56c-2.2 2.2-5.8 2.2-8 0L8 36c-2.2-2.2-2.2-5.8 0-8L28 8Z"
            fill="var(--sec-getting-started)"
          />
          {eyes}
        </svg>
      );
    case "Execute":
      return (
        <svg {...common}>
          <path
            d="M21 6h22c2.5 0 4.6 1.4 5.8 3.6l10 18.8c1.2 2.2 1.2 4.8 0 7l-10 19C47.6 56.6 45.5 58 43 58H21c-2.5 0-4.6-1.4-5.8-3.6l-10-19c-1.2-2.2-1.2-4.8 0-7l10-18.8C16.4 7.4 18.5 6 21 6Z"
            fill="var(--sec-principles)"
          />
          {eyes}
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="5" y="13" width="54" height="38" rx="19" fill="var(--sec-standards)" />
          {eyes}
        </svg>
      );
  }
}
