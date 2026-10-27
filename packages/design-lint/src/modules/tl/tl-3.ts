import fs from "node:fs";
import { elements, matches } from "../../html.ts";
import { fileForPath } from "../../project.ts";
import type { Candidate, RuleModule } from "../../types.ts";
import { isGovSg, VIEWPORT } from "./shared.ts";

/* TL-3: the Official Government Banner. Both rules apply to a .gov.sg host and
   skip when customisable is false. */

const applies = (params: Record<string, unknown>) => isGovSg(params) && params.customisable !== false;

export const tl3a: RuleModule = {
  code: "TL-3a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered || !applies(params)) return out;
    for (const pagePath of params.bannerPages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const data = await page.evaluate((sel: string) => {
        const banner = document.querySelector(sel);
        if (!banner) return { found: false, first: false, visible: false, top: 0, left: 0 };
        const skip = ["SCRIPT", "STYLE", "LINK", "META", "TEMPLATE", "NOSCRIPT"];
        const rendered = (e: any) => !skip.includes(e.tagName) && getComputedStyle(e).display !== "none";
        /* The banner is first when it is the first rendered child at every level from the body down. */
        let cur: any = document.body;
        let first = false;
        for (;;) {
          const c = (Array.from(cur.children) as any[]).find(rendered);
          if (!c || !c.contains(banner)) break;
          if (c === banner) {
            first = true;
            break;
          }
          cur = c;
        }
        const r = banner.getBoundingClientRect();
        const st = getComputedStyle(banner);
        const visible = r.height > 0 && r.width > 0 && r.top <= 1 && st.visibility !== "hidden" && Number(st.opacity) > 0;
        return { found: true, first, visible, top: Math.round(r.top + window.scrollY), left: Math.round(r.left) };
      }, String(params.bannerSelector));
      out.push({ file: pagePath, line: data.top, column: data.left, data });
    }
    return out;
  },

  decide(candidate, params) {
    const d = candidate.data as { found: boolean; first: boolean; visible: boolean };
    if (!d.found) return `No element matches ${String(params.bannerSelector)}. Add the Official Government Banner.`;
    if (!d.first) return "The banner is not the first rendered component in the body. Move it to the top.";
    if (!d.visible) return "The banner is not visible at the top of the page.";
    return null;
  },
};

/* TL-3b reads the pages in the pages parameter, because only a template carries
   the banner. A selector is a simple one, as html.ts supports. The module reads
   HTML only. */
export const tl3b: RuleModule = {
  code: "TL-3b",
  surface: "source",

  locate({ root, params }) {
    const out: Candidate[] = [];
    if (!applies(params)) return out;
    const text = String(params.bannerText).replace(/\s+/g, " ").trim();
    for (const pagePath of params.pages as string[]) {
      const file = fileForPath(root, pagePath);
      if (!file) continue;
      const els = elements(fs.readFileSync(file, "utf8"));
      const banner = els.find((e) => matches(e, String(params.bannerSelector)));
      if (!banner) {
        const body = els.find((e) => e.tag === "body");
        out.push({ file, line: body?.line ?? 1, column: body?.column ?? 1, data: { message: `No element matches ${String(params.bannerSelector)}. Use the SGDS banner.` } });
      } else if (!banner.text.replace(/\s+/g, " ").includes(text)) {
        out.push({ file, line: banner.line, column: banner.column, data: { message: `The banner does not contain "${text}".` } });
      } else if ("style" in banner.attrs) {
        out.push({ file, line: banner.line, column: banner.column, data: { message: "The banner has an inline style. Remove it, so that the component keeps its design." } });
      } else out.push({ file, line: banner.line, column: banner.column, data: { message: null } });
    }
    return out;
  },

  decide(candidate) {
    return (candidate.data as { message: string | null }).message;
  },
};
