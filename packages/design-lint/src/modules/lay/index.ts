import type { RuleModule } from "../../types.ts";
import { lay1a } from "./lay-1.ts";

/* The rule modules of the category LAY. A module registers here when its rule
   has a check. See lint/building-a-rule.md. */
export const layModules: RuleModule[] = [lay1a];
