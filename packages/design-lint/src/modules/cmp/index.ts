import type { RuleModule } from "../../types.ts";
import { cmp2a, cmp5a, cmp8a } from "./actions.ts";
import { cmp10a } from "./errors.ts";
import { cmp6a, cmp6b } from "./tables.ts";

/* The rule modules of the category CMP. A module registers here when its rule
   has a check. See docs/building-a-rule.md. */
export const cmpModules: RuleModule[] = [cmp2a, cmp5a, cmp6a, cmp6b, cmp8a, cmp10a];
