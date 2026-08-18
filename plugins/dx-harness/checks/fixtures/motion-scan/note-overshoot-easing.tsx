// The two mechanical overshoot shapes SLP-8 names: a cubic-bezier whose y
// control point leaves 0 to 1, and a named overshoot utility. Both are NOTE
// lines, so neither can fail a run.
import { motion } from "motion/react";

export function Pop() {
  return (
    <>
      <span className="transition-transform duration-200 ease-bounce">back</span>
      <motion.div
        style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      />
      <motion.div transition={{ type: "spring", bounce: 0.4 }} />
    </>
  );
}
