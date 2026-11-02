import type { Candidate, RuleModule } from "../../types.ts";

const VIEWPORT = { width: 1280, height: 800 };

interface Link {
  href: string;
  url: string;
  anchor: string | null;
  anchorMissing: boolean;
  internal: boolean;
  top: number;
  left: number;
}

/* PR-5a: no link on a page is broken. The page supplies its links. An internal
   link is requested from inside the page, which is same-origin. An external link
   is requested from Node. A request that returns 400 or above, fails, or exceeds
   linkTimeoutMs is broken. A same-page anchor with no matching id is broken, except a hash route that starts with / or !, which a single-page app handles.
   mailto:, tel:, and any other non-HTTP scheme are skipped. */

async function status(url: string, timeoutMs: number): Promise<string | null> {
  try {
    let res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(timeoutMs), redirect: "follow" });
    if (res.status === 405 || res.status === 501) res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), redirect: "follow" });
    return res.status >= 400 ? `responds with ${res.status}` : null;
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    return name === "TimeoutError" || name === "AbortError" ? `does not respond within ${timeoutMs} ms` : "fails to connect";
  }
}

export const pr5a: RuleModule = {
  code: "PR-5a",
  surface: "rendered",
  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const scope = params.linkScope as string[];
    const timeout = Number(params.linkTimeoutMs);
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const links = await page.evaluate((): Link[] =>
        (Array.from(document.querySelectorAll("a[href]")) as any[]).flatMap((a) => {
          const href = a.getAttribute("href") ?? "";
          const url = new URL(href, document.location.href);
          if (url.protocol !== "http:" && url.protocol !== "https:") return [];
          const b = a.getBoundingClientRect();
          const samePage = url.origin === document.location.origin && url.pathname === document.location.pathname && url.search === document.location.search && url.hash !== "";
          const id = samePage ? decodeURIComponent(url.hash.slice(1)) : null;
          return [{
            href,
            url: url.href,
            anchor: id,
            anchorMissing: id !== null && id !== "" && !/^[\/!]/.test(id) && !document.getElementById(id) && document.getElementsByName(id).length === 0,
            internal: url.origin === document.location.origin,
            top: Math.round(b.top),
            left: Math.round(b.left),
          }];
        }),
      );
      const cache = new Map<string, Promise<string | null>>();
      for (const link of links) {
        if (!scope.includes(link.internal ? "internal" : "external")) continue;
        let problem: string | null = null;
        if (link.anchorMissing) problem = `points to #${link.anchor}, and no element has that id`;
        else if (link.anchor === null || link.anchor === "") {
          const target = link.url.split("#")[0];
          if (!cache.has(target)) {
            cache.set(
              target,
              link.internal
                ? page.evaluate(
                    async (a: { url: string; timeout: number }) => {
                      try {
                        const res = await fetch(a.url, { signal: AbortSignal.timeout(a.timeout) });
                        return res.status >= 400 ? `responds with ${res.status}` : null;
                      } catch (error) {
                        return (error as Error).name === "TimeoutError" ? `does not respond within ${a.timeout} ms` : "fails to connect";
                      }
                    },
                    { url: target, timeout },
                  )
                : status(target, timeout),
            );
          }
          problem = await cache.get(target)!;
        }
        if (problem) out.push({ file: pagePath, line: link.top, column: link.left, data: { href: link.href, problem } });
      }
    }
    return out;
  },
  decide(candidate) {
    const { href, problem } = candidate.data as { href: string; problem: string };
    return `The link ${href} is broken: it ${problem}.`;
  },
};
