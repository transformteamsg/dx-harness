import type { RuleModule } from "../../types.ts";
import { typ2a, typ2b, typ4a, typ5a, typ6a } from "./text.ts";

/* The rule modules of the category TYP. A module registers here when its rule
   has a check. See docs/building-a-rule.md. */
export const typModules: RuleModule[] = [typ2a, typ2b, typ4a, typ5a, typ6a];
