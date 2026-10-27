import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { installedJsxA11yRules } from "../src/engines/jsx-a11y.ts";
import { lint } from "../src/lint.ts";
import { TX_JSX_IDS, validAutocomplete } from "../src/modules/tx/journey.ts";
import { launchBrowser } from "../src/rendered.ts";
import { loadRules } from "../src/rules/load.ts";
import type { Browser } from "playwright-core";
import type { Config } from "../src/types.ts";
import { BASE } from "./helpers.ts";

/* The paths that a fixture pair does not reach: a rule that does not apply, an
   empty page list, and a page that is missing. */

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

function site(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-tx-"));
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), text);
  return dir;
}
const page = (body: string) => `<!doctype html><html lang="en"><head><title>Test page</title></head><body><main>${body}</main></body></html>`;
const run = (dir: string, code: string, config: Config) =>
  lint({ rules, config: { render: { waitUntil: "load" }, ...config }, configDir: dir, paths: [dir], surfaces: ["source", "project", "rendered"], select: [code], ignore: [], ci: false, browser: shared ?? undefined });

describe("the jsx-a11y ids that TX names", () => {
  it("exist in the installed plugin", () => {
    const have = new Set(installedJsxA11yRules());
    expect(Object.values(TX_JSX_IDS).flat().filter((id) => !have.has(id))).toEqual([]);
  });
});

describe("validAutocomplete", () => {
  it("accepts the WHATWG forms and rejects the rest", () => {
    for (const ok of ["email", "off", "section-a billing cc-number", "work tel", "given-name webauthn"]) expect(validAutocomplete(ok)).toBe(true);
    for (const bad of ["", "e-mail", "work name", "email extra"]) expect(validAutocomplete(bad)).toBe(false);
  });
});

describe("TX rules that do not apply", () => {
  const dir = site({ "index.html": page("<p>x</p>") });
  const selectors = { updateSelector: "[data-u]", removeSelector: "[data-r]", managePage: "/none.html" };

  it("TX-8a skips a product that stores no payment details", async () => {
    const r = await run(dir, "TX-8a", { product: { storesPaymentDetails: false }, rules: { "TX-8a": selectors } });
    expect([r.findings, r.notes]).toEqual([[], []]);
  });

  it("TX-8a fails when the manage page is missing", async () => {
    const r = await run(dir, "TX-8a", { product: { storesPaymentDetails: true }, rules: { "TX-8a": selectors } });
    expect(r.findings).toHaveLength(1);
  });

  it("TX-15a skips an immediate outcome and fails a missing tracking page", async () => {
    const rule = { trackingPage: "/none.html", statusSelector: "[data-a]", statusDescriptionSelector: "[data-b]" };
    expect((await run(dir, "TX-15a", { product: { outcomeImmediate: true }, rules: { "TX-15a": rule } })).findings).toEqual([]);
    expect((await run(dir, "TX-15a", { product: { outcomeImmediate: false }, rules: { "TX-15a": rule } })).findings).toHaveLength(1);
  });

  it.skipIf(!shared)("TX-12a skips an immediate outcome", async () => {
    const r = await run(dir, "TX-12a", { pages: { start: ["/"], success: ["/"] }, product: { outcomeImmediate: true } });
    expect([r.findings, r.notes]).toEqual([[], []]);
  });

  it.skipIf(!shared)("TX-10a skips a reason that policy withholds", async () => {
    const r = await run(dir, "TX-10a", { pages: { failure: ["/"] }, product: { reasonWithheld: true }, rules: { "TX-10a": { reasonSelector: "[data-reason]" } } });
    expect([r.findings, r.notes]).toEqual([[], []]);
  });

  it.skipIf(!shared)("a rendered rule with an empty page list does not apply", async () => {
    const r = await run(dir, "TX-11b", { pages: { success: [] } });
    expect([r.findings, r.notes]).toEqual([[], []]);
  });

  it("TX-4a does not apply to a flow shorter than the minimum", async () => {
    const r = await run(dir, "TX-4a", { product: { flowPages: ["/"] }, rules: { "TX-4a": { minStepsForIndicator: 2 } } });
    expect([r.findings, r.notes]).toEqual([[], []]);
  });

  it("TX-3a reports not configured when the limit is unset", async () => {
    const r = await run(dir, "TX-3a", { product: { flowPages: ["/"] }, rules: { "TX-3a": { stepSelector: "[data-step]" } } });
    expect(r.notes).toEqual([expect.objectContaining({ code: "TX-3a", kind: "not-configured" })]);
  });
});
