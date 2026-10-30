import { describe, inject, it } from "vitest";
import { browser, checkPatch, needsBrowser, patches } from "./demo-site.ts";

/* The tests of one category, such as bd. Each project of the Vitest config runs
   this file for one category folder, in a worker and with a browser of its own. */
const category = inject("category");
const prefix = (code: string) => code.split("-")[0].toLowerCase();

/* The patches run side by side. Each works on its own copy of the site. */
describe.concurrent(`a break patch of ${category}`, () => {
  for (const patch of patches.filter((p) => prefix(p.code) === category)) {
    it.skipIf(needsBrowser(patch.code) && !browser)(`${patch.code} makes exactly that rule fail: ${patch.describe}`, () => checkPatch(patch));
  }
});
