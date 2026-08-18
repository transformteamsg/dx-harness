// A spring that declares damping, and one that declares bounce: 0, are author
// decisions on the record. There is nothing left to guess about, so the check is
// silent rather than claiming a pass.
import { motion } from "motion/react";

export function Sheet() {
  return (
    <>
      <motion.div transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.div transition={{ type: "spring", bounce: 0 }} />
    </>
  );
}
