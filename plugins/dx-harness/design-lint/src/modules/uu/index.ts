import type { RuleModule } from "../../types.ts";
import { uu1c } from "./uu-1.ts";
import { uu2d } from "./uu-2.ts";

/* The rule modules of the category UU. A module registers here when its rule
   has a check. See lint/building-a-rule.md. */
export const uuModules: RuleModule[] = [uu1c, uu2d];
