import { describe, inject, it } from "vitest";
import { browser, categoryCodes, checkPatch, checkSite, needsBrowser, patches } from "./demo-site.ts";

/* The tests of one category, such as bd. Each project of the Vitest config runs
   this file for one category folder, in a worker and with a browser of its own. */
const category = inject("category");
const prefix = (code: string) => code.split("-")[0].toLowerCase();

/* The rules of the category on every page. A category with no rendered rule needs no browser. */
it.skipIf(categoryCodes(category).some(needsBrowser) && !browser)(`the demo site passes every rule of ${category}`, () => checkSite(category));

/* The patches run side by side. Each works on its own copy of the site. */
describe.concurrent(`a break patch of ${category}`, () => {
  for (const patch of patches.filter((p) => prefix(p.code) === category)) {
    /* A patch can expect the finding of a rendered rule other than its own, as the WU-1a patch expects WU-1b. */
    const rendered = [patch.code, ...patch.expect.map((e) => e.code ?? patch.code)].some(needsBrowser);
    it.skipIf(rendered && !browser)(`${patch.code} makes exactly that rule fail: ${patch.describe}`, () => checkPatch(patch));
  }
});
