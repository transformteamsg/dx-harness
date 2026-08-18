// A token reference is never band-judged, in any of its spellings. MOT-1's band
// applies to literals at the use site; whether a token's own value is in band is
// decided at its definition, and the definition sits in the exempt block.
import { motion } from "motion/react";
import { DUR, EASE_OUT } from "@/lib/motion";

export function Panel({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      className="transition-transform duration-(--motion-fast)"
      style={{ transitionDuration: "var(--motion-slow)" }}
      transition={reduced ? { duration: 0 } : { duration: DUR.base, ease: EASE_OUT }}
    />
  );
}
