import type { RuleModule } from "../../types.ts";
import { tx10a, tx10b, tx11a, tx11b, tx13a, tx9a } from "./outcome.ts";
import { tx12a, tx2a, tx7a, tx7b } from "./payment.ts";
import { tx3a, tx4a, tx5a, tx6a } from "./journey.ts";
import { tx15a, tx8a } from "./tracking.ts";

/* The rule modules of the category TX. A module registers here when its rule
   has a check. See lint/building-a-rule.md. */
export const txModules: RuleModule[] = [
  tx2a, tx3a, tx4a, tx5a, tx6a,
  tx7a, tx7b, tx8a,
  tx9a, tx10a, tx10b, tx11a, tx11b,
  tx12a, tx13a, tx15a,
];
