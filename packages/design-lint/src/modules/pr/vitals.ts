import type { Candidate, RenderedSession, RuleModule } from "../../types.ts";
import { launchBrowser } from "../../rendered.ts";
import { measure, VIEWPORT } from "./measure.ts";

/* PR-7a to PR-7d. The measurements are lab figures from a headless Chromium on a
   local server, with Lighthouse replaced by browser APIs. Each threshold is a
   parameter. A finding means "over the limit in this run". */

/* PR-7a loads each page in a browser of its own, so that the network profile and
   the CPU throttle apply through the DevTools protocol. */
interface Profile {
  latencyMs: number;
  downloadKbps: number;
  uploadKbps: number;
}

async function origin(rendered: RenderedSession, pagePath: string): Promise<string> {
  const page = await rendered.open(pagePath, VIEWPORT);
  return page.evaluate(() => document.location.origin);
}

export const pr7a: RuleModule = {
  code: "PR-7a",
  surface: "rendered",
  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const profile = params.networkProfile as Profile;
    const rate = Number(params.cpuThrottle);
    const viewport = params.viewport as { width: number; height: number };
    const browser = await launchBrowser();
    try {
      for (const pagePath of params.pages as string[]) {
        const base = await origin(rendered, pagePath);
        const context = await browser.newContext({ viewport });
        const page = await context.newPage();
        const cdp = await context.newCDPSession(page);
        await cdp.send("Network.enable");
        await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
        await cdp.send("Network.emulateNetworkConditions", {
          offline: false,
          latency: profile.latencyMs,
          downloadThroughput: (profile.downloadKbps * 1000) / 8,
          uploadThroughput: (profile.uploadKbps * 1000) / 8,
        });
        await cdp.send("Emulation.setCPUThrottlingRate", { rate });
        await page.goto(`${base}${pagePath}`, { waitUntil: "load", timeout: 60000 });
        const ms = await page.evaluate(async () => {
          const perf: any = performance;
          for (let i = 0; i < 100; i++) {
            const nav = perf.getEntriesByType("navigation")[0] as any;
            if (nav.loadEventEnd > 0) return nav.loadEventEnd - nav.startTime;
            await new Promise((r) => setTimeout(r, 50));
          }
          return -1;
        });
        await context.close();
        out.push({ file: pagePath, line: 0, column: 0, data: { seconds: Math.round(ms) / 1000 } });
      }
    } finally {
      await browser.close();
    }
    return out;
  },
  decide(candidate, params) {
    const { seconds } = candidate.data as { seconds: number };
    const max = Number(params.maxLoadSeconds);
    return seconds > max ? `The page takes ${seconds} s to load under the network profile and CPU throttle, above the limit of ${max} s.` : null;
  },
};

type Metric = "lcp" | "cls" | "tbt";

export const pr7b: RuleModule = {
  code: "PR-7b",
  surface: "rendered",
  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of params.pages as string[]) {
      const m = await measure(rendered, pagePath);
      (["lcp", "cls", "tbt"] as Metric[]).forEach((metric) => {
        if (m[metric] !== null) out.push({ file: pagePath, line: 0, column: 0, data: { metric, value: m[metric] } });
      });
    }
    return out;
  },
  decide(candidate, params) {
    const { metric, value } = candidate.data as { metric: Metric; value: number };
    const limit = Number({ lcp: params.lcpMs, cls: params.clsMax, tbt: params.tbtMs }[metric]);
    if (value <= limit) return null;
    const name = { lcp: "Largest Contentful Paint", cls: "Cumulative Layout Shift", tbt: "Total Blocking Time (estimate)" }[metric];
    const unit = metric === "cls" ? "" : " ms";
    return `${name} is ${value}${unit}, above the limit of ${limit}${unit}.`;
  },
};

export const pr7c: RuleModule = {
  code: "PR-7c",
  surface: "rendered",
  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of params.pages as string[]) {
      out.push({ file: pagePath, line: 0, column: 0, data: { bytes: (await measure(rendered, pagePath)).bytes } });
    }
    return out;
  },
  decide(candidate, params) {
    const { bytes } = candidate.data as { bytes: number };
    const max = Number(params.maxPageBytes);
    return bytes > max ? `The page weighs ${bytes} bytes, above the limit of ${max} bytes.` : null;
  },
};

export const pr7d: RuleModule = {
  code: "PR-7d",
  surface: "rendered",
  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const formats = params.imageFormats as string[];
    const max = Number(params.maxImageBytes);
    for (const pagePath of params.pages as string[]) {
      for (const img of (await measure(rendered, pagePath)).images) {
        if (img.format === "svg") continue;
        const at = { file: pagePath, line: img.top, column: img.left };
        if (!formats.includes(img.format)) out.push({ ...at, data: { src: img.src, problem: `uses the format "${img.format || "unknown"}", not one of ${formats.join(", ")}` } });
        if (img.naturalWidth > 0 && img.renderedWidth > 0 && img.naturalWidth > 2 * img.renderedWidth) {
          out.push({ ...at, data: { src: img.src, problem: `is ${img.naturalWidth} px wide and shown at ${img.renderedWidth} px, more than twice its display size` } });
        }
        if (img.bytes !== null && img.bytes > max) out.push({ ...at, data: { src: img.src, problem: `is ${img.bytes} bytes, above the limit of ${max} bytes` } });
      }
    }
    return out;
  },
  decide(candidate) {
    const { src, problem } = candidate.data as { src: string; problem: string };
    return `The image ${src} ${problem}.`;
  },
};
