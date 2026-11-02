import type { RuleModule } from "../../types.ts";
import { wpAModules } from "./a.ts";
import { wpBModules } from "./b.ts";

/* The rule modules of the category WP. The two halves have their own file, so
   that two people can work at the same time. See lint/building-a-rule.md. */
export const wpModules: RuleModule[] = [...wpAModules, ...wpBModules];
