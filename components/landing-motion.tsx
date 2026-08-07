"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotionSafe } from "@/lib/motion";

/* Essential landing content renders visibly on the server. Decorative
   scroll-linked motion is added only after hydration and only when the user
   has not requested reduced motion. The drift itself carries no duration or
   easing — the scrollbar is the easing — so the motion token set (MOT-2)
   binds here only through the shared reduced-motion hook. */

export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

/* Scroll-linked drift: the child moves `drift`px against scroll direction
   across its pass through the viewport. Linear mapping — the scrollbar is
   the easing. */
export function Parallax({
  children,
  drift = 24,
  className,
}: {
  children: ReactNode;
  drift?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [drift, -drift]);

  useEffect(() => setMounted(true), []);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={mounted && !reduced ? { y } : undefined}
    >
      {children}
    </motion.div>
  );
}
