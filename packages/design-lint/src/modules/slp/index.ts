import type { RuleModule } from "../../types.ts";
import { cmp13a, cnt15a, typ7a } from "./rendered.ts";
import { cmp12a, col3a, col4a, mot4a } from "./source.ts";

/* The rule modules of the SLP controls. SLP is not a category: each rule is in the
   category that it grades, COL, CMP, TYP, MOT, or CNT. The modules stay together
   here, so the folders of those categories hold only their own controls. */
export const slpModules: RuleModule[] = [col3a, col4a, cmp12a, cmp13a, typ7a, mot4a, cnt15a];
