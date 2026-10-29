import { bd1a } from "./modules/bd-1a.ts";
import { bd1b } from "./modules/bd-1b.ts";
import { bd1d } from "./modules/bd-1d.ts";
import { bd2a } from "./modules/bd-2a.ts";
import { bd2c } from "./modules/bd-2c.ts";
import { bd2d } from "./modules/bd-2d.ts";
import { bd2e } from "./modules/bd-2e.ts";
import { bd3a } from "./modules/bd-3a.ts";
import { bd3c } from "./modules/bd-3c.ts";
import { bd4a } from "./modules/bd-4a.ts";
import { bd4b } from "./modules/bd-4b.ts";
import { bd5a } from "./modules/bd-5a.ts";
import { bd6a } from "./modules/bd-6a.ts";
import { bd6b } from "./modules/bd-6b.ts";
import { bd7a } from "./modules/bd-7a.ts";
import { bd7b } from "./modules/bd-7b.ts";
import { bd8a } from "./modules/bd-8a.ts";
import { bd9a } from "./modules/bd-9a.ts";
import { wr1a, wr1b, wr1c } from "./modules/wr-1.ts";
import { wr1d } from "./modules/wr-1d.ts";
import { wr2a } from "./modules/wr-2a.ts";
import { wr2b } from "./modules/wr-2b.ts";
import { cmpModules } from "./modules/cmp/index.ts";
import { prModules } from "./modules/pr/index.ts";
import { tlModules } from "./modules/tl/index.ts";
import { txModules } from "./modules/tx/index.ts";
import { uuModules } from "./modules/uu/index.ts";
import { woModules } from "./modules/wo/index.ts";
import { wpModules } from "./modules/wp/index.ts";
import { wuModules } from "./modules/wu/index.ts";
import type { RuleModule } from "./types.ts";

/* The rule modules. A module registers here when its rule has a check. The
   rest of the rules show as "no linter module yet". The categories BD and WR
   are complete. */
export const modules: RuleModule[] = [
  bd1a, bd1b, bd1d,
  bd2a, bd2c, bd2d, bd2e,
  bd3a, bd3c,
  bd4a, bd4b,
  bd5a,
  bd6a, bd6b,
  bd7a, bd7b,
  bd8a,
  bd9a,
  wr1a, wr1b, wr1c, wr1d,
  wr2a, wr2b,
  ...wpModules,
  ...woModules,
  ...wuModules,
  ...prModules,
  ...txModules,
  ...tlModules,
  ...uuModules,
  ...cmpModules,
];
