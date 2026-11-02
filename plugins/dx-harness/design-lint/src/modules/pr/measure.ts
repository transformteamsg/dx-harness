import type { RenderedPage, RenderedSession } from "../../types.ts";

/* One lab measurement of a page, shared by PR-7b, PR-7c, and PR-7d. It uses
   browser APIs only: a PerformanceObserver for LCP and layout shifts, long tasks
   for a Total Blocking Time estimate, and resource timing for the bytes. A run
   in a headless browser on a local server is a lab figure, not a field one. */

export interface ImageInfo {
  src: string;
  format: string;
  bytes: number | null;
  naturalWidth: number;
  renderedWidth: number;
  top: number;
  left: number;
}

export interface Metrics {
  lcp: number | null;
  cls: number;
  tbt: number;
  bytes: number;
  images: ImageInfo[];
}

const cache = new WeakMap<RenderedSession, Map<string, Promise<Metrics>>>();

export const VIEWPORT = { width: 1350, height: 940 };

function collect(settleMs: number): Promise<Metrics> {
  const perf: any = performance;
  return new Promise((resolve) => {
    const read = () => {
      const lcpEntries = perf.getEntriesByType("largest-contentful-paint") as any[];
      const run = (type: string): any[] =>
        new Promise<any[]>((done) => {
          try {
            const entries: any[] = [];
            const po: any = new (PerformanceObserver as any)((list: any) => entries.push(...list.getEntries()));
            po.observe({ type, buffered: true });
            setTimeout(() => {
              entries.push(...po.takeRecords());
              po.disconnect();
              done(entries);
            }, 50);
          } catch {
            done([]);
          }
        }) as any;
      Promise.all([run("largest-contentful-paint"), run("layout-shift"), run("longtask")]).then(([lcpList, shifts, tasks]) => {
        const lcpAll = lcpList.length ? lcpList : lcpEntries;
        const lcp = lcpAll.length ? Math.round(lcpAll[lcpAll.length - 1].startTime) : null;
        const cls = shifts.filter((s: any) => !s.hadRecentInput).reduce((n: number, s: any) => n + s.value, 0);
        const fcp = perf.getEntriesByName("first-contentful-paint")[0];
        const from = fcp ? fcp.startTime : 0;
        const tbt = tasks.filter((t: any) => t.startTime >= from).reduce((n: number, t: any) => n + Math.max(0, t.duration - 50), 0);
        const nav = perf.getEntriesByType("navigation")[0] as any;
        const res = perf.getEntriesByType("resource") as any[];
        const size = (e: any) => Math.max(e.transferSize || 0, e.encodedBodySize || 0);
        const bytes = size(nav ?? {}) + res.reduce((n, e) => n + size(e), 0);
        const bySrc = new Map<string, number>(res.map((e) => [e.name, size(e)]));
        const images = (Array.from(document.images) as any[]).map((img) => {
          const src: string = img.currentSrc || img.src;
          const path = (() => {
            try {
              return new URL(src).pathname;
            } catch {
              return src;
            }
          })();
          const ext = (path.match(/\.([a-z0-9]+)$/i)?.[1] ?? "").toLowerCase();
          const b = img.getBoundingClientRect();
          return {
            src: img.getAttribute("src") ?? src,
            format: ext === "jpeg" ? "jpg" : ext,
            bytes: bySrc.has(src) ? bySrc.get(src)! : null,
            naturalWidth: img.complete ? img.naturalWidth : 0,
            renderedWidth: Math.round(img.clientWidth),
            top: Math.round(b.top),
            left: Math.round(b.left),
          };
        });
        resolve({ lcp, cls: Math.round(cls * 1000) / 1000, tbt: Math.round(tbt), bytes, images });
      });
    };
    /* Paint can come after the load event, so wait for the first paint, up to
       five seconds, and then let the page settle. */
    let waited = 0;
    const poll = () => {
      if (perf.getEntriesByName("first-contentful-paint").length > 0 || waited >= 5000) setTimeout(read, settleMs);
      else {
        waited += 50;
        setTimeout(poll, 50);
      }
    };
    poll();
  });
}

/* The settle time lets a late layout shift land before the read. The page is a fresh one, because the axe runs of other rules add long tasks to a shared page. */
export function measure(rendered: RenderedSession, pagePath: string): Promise<Metrics> {
  let byPath = cache.get(rendered);
  if (!byPath) cache.set(rendered, (byPath = new Map()));
  let hit = byPath.get(pagePath);
  if (!hit) {
    hit = rendered.open(pagePath, VIEWPORT, { fresh: true }).then((page: RenderedPage) => page.evaluate(collect, 500));
    byPath.set(pagePath, hit);
  }
  return hit;
}
