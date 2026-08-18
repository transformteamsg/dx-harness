// A spring with no explicit bounce or damping. Whether a stiffness and mass pair
// actually overshoots is physics on values the source may not fully give, so this
// is a NOTE for the reviewer's ledger, never an ERROR: a check does not block on
// a guess.
import { motion } from "motion/react";

export function Dialog() {
  return (
    <motion.div
      transition={{
        type: "spring",
        stiffness: 260,
      }}
    />
  );
}
