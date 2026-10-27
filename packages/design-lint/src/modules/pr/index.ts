import type { RuleModule } from "../../types.ts";
import { pr7f } from "./cache.ts";
import { pr6a } from "./browsers.ts";
import { pr6b } from "./engines.ts";
import { pr7e } from "./lazy.ts";
import { pr5a } from "./links.ts";
import { pr3c, pr4c } from "./notices.ts";
import { pr1b } from "./review.ts";
import { pr2a, pr2d } from "./scripts.ts";
import { pr7a, pr7b, pr7c, pr7d } from "./vitals.ts";

/* The rule modules of the category PR. A module registers here when its rule
   has a check. See lint/building-a-rule.md. */
export const prModules: RuleModule[] = [pr1b, pr2a, pr2d, pr3c, pr4c, pr5a, pr6a, pr6b, pr7a, pr7b, pr7c, pr7d, pr7e, pr7f];
