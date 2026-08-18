// A duration: key in a motion/react transition object counts in SECONDS, so
// 0.5 is 500ms and sits outside the band. Reading it as milliseconds would call
// every correct value in the file a violation.
import { motion } from "motion/react";

export function Reveal() {
  return <motion.div animate={{ opacity: 1 }} transition={{ duration: 0.5 }} />;
}
