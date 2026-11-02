import type { RuleModule } from "../../types.ts";
import { wo4a, wo7a, wo7b, wo8a, wo9b, wo16a, wo18a } from "./axe.ts";
import { wo13a } from "./focus.ts";
import { wo2a, wo9c, wo9e, wo13b } from "./keyboard.ts";
import { wo5b } from "./motion.ts";
import { wo8d, wo11b } from "./project.ts";
import { wo3b, wo14b, wo15a, wo17a } from "./script.ts";
import { wo1a, wo1b, wo5a, wo10b, wo10c } from "./source.ts";
import { wo8b, wo10a } from "./views.ts";

/* The rule modules of the category WO. A module registers here when its rule
   has a check. See lint/building-a-rule.md. Not built, because another rule
   reports the same fault: WO-9a (WP-7a), WO-12a and WO-12b (WP-6a), and WO-12c (WR-1a). */
export const woModules: RuleModule[] = [
  wo1a, wo1b, wo2a, wo3b, wo4a, wo5a, wo5b, wo7a, wo7b, wo8a, wo8b, wo8d,
  wo9b, wo9c, wo9e, wo10a, wo10b, wo10c, wo11b,
  wo13a, wo13b, wo14b, wo15a, wo16a, wo17a, wo18a,
];
