import type { RuleModule } from "../../types.ts";
import { cnt5a } from "./cnt-5.ts";
import { cnt6a } from "./cnt-6.ts";
import { cnt12a } from "./cnt-12.ts";
import { cnt13a } from "./cnt-13.ts";

/* The rule modules of the category CNT. A module registers here when its rule
   has a check. See lint/building-a-rule.md. */
export const cntModules: RuleModule[] = [cnt5a, cnt6a, cnt12a, cnt13a];
