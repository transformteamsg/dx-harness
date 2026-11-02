import fs from "node:fs";
import { createRequire } from "node:module";
import { chromium, firefox, webkit } from "playwright-core";
import type { Browser, BrowserType } from "playwright-core";
import { launchBrowser } from "../../rendered.ts";
import type { Candidate, RuleModule } from "../../types.ts";

/* PR-6b: smoke checks in more than one browser engine. Chromium goes through the
   shared launcher. Firefox and WebKit launch through Playwright, with an
   executable override in DESIGN_LINT_FIREFOX and DESIGN_LINT_WEBKIT. An engine
   that cannot start is reported as "not run" and the rule does not pass. The
   WebKit build of Playwright is not Safari. The runner has no channel for a
   note from a module, so "not run" is a finding that starts with "Not run". */

const require_ = createRequire(import.meta.url);
const AXE_SOURCE = fs.readFileSync(require_.resolve("axe-core/axe.min.js"), "utf8");

const TYPES: Record<string, BrowserType> = { firefox, webkit, chromium };
const ENV: Record<string, string> = { firefox: "DESIGN_LINT_FIREFOX", webkit: "DESIGN_LINT_WEBKIT" };

export async function launchEngine(name: string): Promise<Browser> {
  if (name === "chromium") return launchBrowser();
  const type = TYPES[name];
  if (!type) throw new Error(`unknown engine ${name}`);
  const executablePath = process.env[ENV[name]];
  return type.launch(executablePath ? { executablePath } : {});
}

export const SMOKE_CHECKS = ["loads-without-errors", "no-horizontal-scroll", "axe-critical"];

export const pr6b: RuleModule = {
  code: "PR-6b",
  surface: "rendered",
  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const checks = params.smokeChecks as string[];
    const widths = params.viewports as number[];
    const pages = params.pages as string[];
    const probe = await rendered.open(pages[0], { width: 1280, height: 800 });
    const base = await probe.evaluate(() => document.location.origin);
    for (const engine of params.engines as string[]) {
      let browser: Browser;
      try {
        browser = await launchEngine(engine);
      } catch (error) {
        const why = (error instanceof Error ? error.message : String(error)).split("\n")[0];
        out.push({ file: pages[0], line: 0, column: 0, data: { message: `Not run: the engine ${engine} did not start (${why}). Install it with "playwright-core install ${engine}". A page that did not run does not pass.` } });
        continue;
      }
      try {
        for (const pagePath of pages) {
          const fail = (check: string, detail: string) =>
            out.push({ file: pagePath, line: 0, column: 0, data: { message: `In ${engine}, ${check} fails: ${detail}` } });
          const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
          const page = await context.newPage();
          const errors: string[] = [];
          page.on("pageerror", (e) => errors.push(e.message));
          await page.goto(`${base}${pagePath}`, { waitUntil: "load" });
          if (checks.includes("loads-without-errors") && errors.length > 0) fail("loads-without-errors", `an uncaught script error: ${errors[0]}`);
          if (checks.includes("no-horizontal-scroll")) {
            for (const width of widths) {
              await page.setViewportSize({ width, height: 800 });
              const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
              if (over > 0) fail("no-horizontal-scroll", `the page scrolls sideways at ${width} px`);
            }
            await page.setViewportSize({ width: 1280, height: 800 });
          }
          if (checks.includes("axe-critical")) {
            await page.addScriptTag({ content: AXE_SOURCE });
            const critical = await page.evaluate(async () => {
              const result = await (window as any).axe.run(document, { resultTypes: ["violations"] });
              return result.violations.filter((v: any) => v.impact === "critical").map((v: any) => v.id as string);
            });
            if (critical.length > 0) fail("axe-critical", `critical axe violations: ${critical.join(", ")}`);
          }
          await context.close();
        }
      } finally {
        await browser.close();
      }
    }
    return out;
  },
  decide(candidate) {
    return (candidate.data as { message: string }).message;
  },
};
