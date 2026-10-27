import type { Candidate, RuleModule } from "../../types.ts";
import { VIEWPORT, message } from "./util.ts";

/* WO-8b: each view of a single-page application sets its own title. `spaRoutes`
   is a list of routes, each a page path with an optional fragment, such as
   "/app.html#/orders". The first route is the entry. The rule reaches each later
   route by clicking an in-page link whose href is that route or its fragment. A
   route that has no such link fails, because a user cannot reach it. */
export const wo8b: RuleModule = {
  code: "WO-8b",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const routes = params.spaRoutes as string[];
    if (routes.length === 0) return out;
    const page = await rendered.open(routes[0], VIEWPORT, { fresh: true });
    const title = () => page.evaluate((): string => String(document.title ?? ""));
    const settle = () => page.evaluate((): Promise<void> => new Promise((r) => window.setTimeout(() => r(), 150)));
    let previous = await title();
    if (previous.trim() === "") out.push({ file: routes[0], line: 0, column: 0, data: { message: "The entry view has an empty title." } });
    for (const route of routes.slice(1)) {
      const hash = route.includes("#") ? route.slice(route.indexOf("#")) : null;
      const marked = await page.evaluate(
        (arg: { route: string; hash: string | null }): boolean => {
          const link: any = Array.from(document.querySelectorAll("a[href]")).find((a: any) => {
            const href = a.getAttribute("href");
            return href === arg.route || (arg.hash !== null && href === arg.hash);
          });
          if (link) link.setAttribute("data-wo-route", "1");
          return !!link;
        },
        { route, hash },
      );
      if (!marked) {
        out.push({ file: route, line: 0, column: 0, data: { message: `No in-page link leads to the route ${route}.` } });
        continue;
      }
      await page.click("[data-wo-route]");
      await settle();
      await page.evaluate((): void => document.querySelector("[data-wo-route]")?.removeAttribute("data-wo-route"));
      const now = await title();
      if (now.trim() === "") out.push({ file: route, line: 0, column: 0, data: { message: `The view ${route} has an empty title.` } });
      else if (now === previous) out.push({ file: route, line: 0, column: 0, data: { message: `The view ${route} keeps the title "${now}" of the view before it. Set document.title when the view changes.` } });
      previous = now;
    }
    return out;
  },
  decide: message,
};

/* WO-10a: a link whose only name is its title attribute. A link with no name at
   all is reported by WR-1a, through axe link-name, so this rule reports only what that one passes. */
export const wo10a: RuleModule = {
  code: "WO-10a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const found = await page.evaluate((): { top: number; left: number; title: string }[] => {
        const list: { top: number; left: number; title: string }[] = [];
        for (const a of Array.from(document.querySelectorAll("a[href]")) as any[]) {
          const title = (a.getAttribute("title") ?? "").trim();
          if (title === "") continue;
          const text = (a.textContent ?? "").trim();
          const labelled = (a.getAttribute("aria-label") ?? "").trim() !== "" || (a.getAttribute("aria-labelledby") ?? "").trim() !== "";
          const alt = Array.from(a.querySelectorAll("img[alt]")).some((i: any) => i.getAttribute("alt").trim() !== "");
          if (text !== "" || labelled || alt) continue;
          const r = a.getBoundingClientRect();
          list.push({ top: Math.round(r.top + window.scrollY), left: Math.round(r.left + window.scrollX), title });
        }
        return list;
      });
      for (const f of found) out.push({ file: pagePath, line: f.top, column: f.left, data: { message: `The link has no text and no label. Its name comes only from title="${f.title}". Add link text or an aria-label.` } });
    }
    return out;
  },
  decide: message,
};
