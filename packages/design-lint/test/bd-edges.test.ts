import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { lint } from "../src/lint.ts";
import { bd2a } from "../src/modules/bd-2a.ts";
import { launchBrowser } from "../src/rendered.ts";
import { loadRules } from "../src/rules/load.ts";
import type { Browser } from "playwright-core";
import { BASE } from "./helpers.ts";

/* Cases of the acceptance criteria that the fixture pairs do not show: a product
   that is exempt from a rule, and a site that has no search form at all. */

const FIXTURES = path.resolve(import.meta.dirname, "../fixtures");
const { rules } = loadRules(BASE);

let shared: Browser | null = null;
try {
  shared = await launchBrowser();
} catch {
  shared = null;
}
afterAll(async () => {
  await shared?.close();
});

describe("a product that is exempt from the search rules", () => {
  it.each(["mobile-app", "transactional", "search-service"])("skips BD-2a for a %s", (serviceType) => {
    const candidates = bd2a.locate({ files: [], root: "/site", params: { serviceType } });
    expect(candidates).toEqual([]);
  });

  it("does not skip BD-2a for a website", async () => {
    const files = [path.join(FIXTURES, "BD-2a/fail/index.html"), path.join(FIXTURES, "BD-2a/fail/about.html")];
    const candidates = await bd2a.locate({ files, root: "/site", params: { serviceType: "website" } });
    expect(candidates).toHaveLength(1);
  });
});

describe.skipIf(shared === null)("a site with no search form", () => {
  it("gets one finding, and not one for each page", async () => {
    const result = await lint({
      rules,
      config: {
        product: { serviceType: "website" },
        pages: { all: ["/", "/about.html"] },
        render: { waitUntil: "load" },
      },
      configDir: FIXTURES,
      paths: [path.join(FIXTURES, "BD-2a/fail")],
      surfaces: ["source", "project", "rendered"],
      select: ["BD-2a", "BD-2c", "BD-2d", "BD-2e"],
      ignore: [],
      ci: false,
      browser: shared ?? undefined,
    });
    expect(result.findings.map((f) => f.code)).toEqual(["BD-2a"]);
  });
});
