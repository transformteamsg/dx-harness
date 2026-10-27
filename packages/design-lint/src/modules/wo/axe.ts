import { axeWithParams } from "./util.ts";

/* The rules of WO that wrap axe rules. test/wo-axe.test.ts checks the ids against
   the installed axe-core.

   Not here: WO-12c, because WR-1a runs axe label; WO-12a and WO-12b, because WP-6a
   runs empty-heading and heading-order. A second module would report each fault twice.
   See the Built section of the category README. */

export const WO_AXE_IDS: Record<string, string[]> = {
  "WO-4a": ["meta-refresh"],
  "WO-7a": ["bypass"],
  "WO-7b": ["region"],
  "WO-8a": ["document-title"],
  "WO-9b": ["tabindex"],
  "WO-16a": ["label-content-name-mismatch"],
  "WO-18a": ["target-size"],
};

/* meta-refresh takes its upper limit from the parameter. A delay of 0 is a redirect, which the rule leaves alone. */
export const wo4a = axeWithParams("WO-4a", WO_AXE_IDS["WO-4a"], {
  skip: (p) => p.timeLimitExemption === "legal" || p.timeLimitExemption === "real-time",
  checks: (p) => [{ id: "meta-refresh", options: { minDelay: 0, maxDelay: Number(p.maxRefreshDelaySeconds) } }],
});
/* bypass reports a failure as "incomplete", so the wrapper reads that result too. */
export const wo7a = axeWithParams("WO-7a", WO_AXE_IDS["WO-7a"], { reviewOnFail: ["bypass"] });
export const wo7b = axeWithParams("WO-7b", WO_AXE_IDS["WO-7b"]);
export const wo8a = axeWithParams("WO-8a", WO_AXE_IDS["WO-8a"]);
export const wo9b = axeWithParams("WO-9b", WO_AXE_IDS["WO-9b"]);
export const wo16a = axeWithParams("WO-16a", WO_AXE_IDS["WO-16a"]);

/* target-size has two checks, the size and the spacing offset. Both read minSize. */
export const wo18a = axeWithParams("WO-18a", WO_AXE_IDS["WO-18a"], {
  checks: (p) => [
    { id: "target-size", options: { minSize: Number(p.minSize) } },
    { id: "target-offset", options: { minOffset: Number(p.minSize) } },
  ],
});
