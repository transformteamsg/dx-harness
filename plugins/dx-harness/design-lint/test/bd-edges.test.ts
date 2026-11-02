import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { lint } from "../src/lint.ts";
import { bd2a } from "../src/modules/bd-2a.ts";
import { bd4a } from "../src/modules/bd-4a.ts";
import { bd5a } from "../src/modules/bd-5a.ts";
import { bd6b } from "../src/modules/bd-6b.ts";
import { launchBrowser } from "../src/rendered.ts";
import { loadRules } from "../src/rules/load.ts";
import { run } from "../src/run.ts";
import type { Browser } from "playwright-core";
import { BASE } from "./helpers.ts";

/* Cases of the acceptance criteria that the fixture pairs do not show: a product
   that is exempt from a rule, a site that has no search form at all, and a
   locale that the readability formula does not support. */

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

/* Issue 521. The readability formula is for English only, so another locale is
   a value that the rule cannot use. The note comes before the browser starts. */
describe("BD-4a for a locale that is not English", () => {
  const rule = rules.find((r) => r.code === "BD-4a");
  const root = path.join(FIXTURES, "BD-4a/pass");
  const options = { surfaces: ["rendered" as const], select: ["BD-4a"], ignore: [], ci: false, files: [], root, browser: shared ?? undefined };
  const config = (locale: string) => ({
    product: { locale },
    rules: { "BD-4a": { maxGrade: 10 } },
    pages: { all: ["/"] },
    render: { waitUntil: "load" as const },
  });

  it.each(["zh", "ms-SG"])("reports locale %s as not configured and does not run", async (locale) => {
    expect(rule).toBeDefined();
    const result = await run([rule!], [bd4a], config(locale), options);
    expect(result.notes).toEqual([{ code: "BD-4a", kind: "not-configured", detail: ["locale"] }]);
    expect(result.ran).toEqual([]);
  });

  it.each(["en", "en-SG"])("does not report the English locale %s as not configured", async (locale) => {
    expect(rule).toBeDefined();
    const result = await run([rule!], [bd4a], config(locale), options);
    /* The rule ran, or it reached the browser and found none. */
    const reached = result.ran.includes("BD-4a") || result.notes.some((n) => n.kind === "not-run");
    expect(reached).toBe(true);
    expect(result.notes.filter((n) => n.kind === "not-configured")).toEqual([]);
  });
});

/* Issue 522: the description limit measures width, so the message says so when
   the description holds a wide character. */
describe("a Chinese meta description that is too short", () => {
  it("gets a finding that gives its width", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-bd5a-"));
    const file = path.join(dir, "index.html");
    fs.writeFileSync(
      file,
      '<html lang="zh"><head><title>了解如何申请社区补助金</title><meta name="description" content="申请社区补助金。"><link rel="canonical" href="/"></head></html>',
    );
    const candidates = bd5a.locate({
      files: [file],
      root: dir,
      params: { audience: "public", titleLength: [10, 60], descriptionLength: [50, 160] },
    }) as Parameters<typeof bd5a.decide>[0][];
    expect(candidates.map((c) => bd5a.decide(c, {}))).toEqual([
      "The meta description is 16 characters wide, where a Chinese, Japanese, or Korean character counts as two. Keep it between 50 and 160.",
    ]);
  });
});

/* Issue 514: a finding for an off-scale value names the token to use and the
   nearest value on the scale. */
describe("BD-6b on an off-scale value", () => {
  const messages = () => {
    const files = [path.join(FIXTURES, "BD-6b/fail/styles.css")];
    const candidates = bd6b.locate({ files, root: path.join(FIXTURES, "BD-6b/fail"), params: {} }) as Parameters<typeof bd6b.decide>[0][];
    return candidates.map((c) => ({ line: c.line, message: bd6b.decide(c, {}) }));
  };

  it("names a spacing token and the nearest spacing value", () => {
    const spacing = messages().find((m) => m.line === 5);
    expect(spacing?.message).toMatch(/var\(--space-/);
    expect(spacing?.message).toMatch(/\b12px\b/);
  });
});
