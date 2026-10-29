import type { RuleModule } from "../../types.ts";
import { mot1a } from "./duration.ts";
import { mot2a } from "./tokens.ts";

/* The rule modules of the category MOT. A module registers here when its rule
   has a check. See lint/building-a-rule.md. MOT-1b, MOT-2b, and MOT-3a are judged. */
export const motModules: RuleModule[] = [mot1a, mot2a];
