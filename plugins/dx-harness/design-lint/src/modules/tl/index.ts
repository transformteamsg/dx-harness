import type { RuleModule } from "../../types.ts";
import { tl1a } from "./tl-1.ts";
import { tl2a, tl2b, tl2d } from "./tl-2.ts";
import { tl3a, tl3b } from "./tl-3.ts";
import { tl4a, tl4b, tl4d } from "./tl-4.ts";
import { tl5a, tl5b, tl6a, tl6c } from "./tl-5.ts";

/* The rule modules of the category TL. A module registers here when its rule
   has a check. See lint/building-a-rule.md. */
export const tlModules: RuleModule[] = [tl1a, tl2a, tl2b, tl2d, tl3a, tl3b, tl4a, tl4b, tl4d, tl5a, tl5b, tl6a, tl6c];
