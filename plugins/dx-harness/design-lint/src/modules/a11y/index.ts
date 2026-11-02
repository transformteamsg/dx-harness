import type { RuleModule } from "../../types.ts";
import { a11y11a, a11y11b } from "./focus.ts";
import { a11y3a } from "./label.ts";
import { a11y5a } from "./motion.ts";

/* The rule modules of the category A11Y. A module registers here when its rule
   has a check. See lint/building-a-rule.md. */
export const a11yModules: RuleModule[] = [a11y3a, a11y5a, a11y11a, a11y11b];
