import type { RuleModule } from "../../types.ts";
import { wu10a, wu10b, wu10d, wu11a, wu4a } from "./errors.ts";
import { wu12a, wu13a, wu14a } from "./flows.ts";
import { wu1a, wu1b, wu1d, wu2a, wu2c } from "./lang.ts";
import { wu7a, wu7b, wu8a, wu8c, wu9a } from "./nav.ts";
import { wu14b, wu14d, wu5a, wu6a } from "./scripts.ts";

/* The rule modules of the category WU. A module registers here when its rule
   has a check. See lint/building-a-rule.md. */
export const wuModules: RuleModule[] = [
  wu1a, wu1b, wu1d,
  wu2a, wu2c,
  wu4a,
  wu5a,
  wu6a,
  wu7a, wu7b,
  wu8a, wu8c,
  wu9a,
  wu10a, wu10b, wu10d,
  wu11a,
  wu12a,
  wu13a,
  wu14a, wu14b, wu14d,
];
