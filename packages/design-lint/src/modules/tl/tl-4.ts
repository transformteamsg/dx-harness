import path from "node:path";
import { hasAncestor, matches } from "../../html.ts";
import { fileForPath, readPages } from "../../project.ts";
import type { Candidate, RuleModule } from "../../types.ts";
import { isGovSg, norm, VIEWPORT } from "./shared.ts";

/* TL-4: the Official Government Footer. TL-4a and TL-4b apply to a .gov.sg host
   and skip each page in transactionalPages. */

interface FooterData {
  found: boolean;
  top: number;
  left: number;
  text: string;
  links: { text: string; href: string; top: number; left: number }[];
}

async function readFooters(
  ctx: Parameters<RuleModule["locate"]>[0],
): Promise<{ pagePath: string; data: FooterData }[]> {
  const out: { pagePath: string; data: FooterData }[] = [];
  const { rendered, params } = ctx;
  if (!rendered || !isGovSg(params)) return out;
  const skip = new Set(params.transactionalPages as string[]);
  for (const pagePath of params.pages as string[]) {
    if (skip.has(pagePath)) continue;
    const page = await rendered.open(pagePath, VIEWPORT);
    const data = await page.evaluate((sel: string): FooterData => {
      const all = Array.from(document.querySelectorAll(sel)) as any[];
      /* A page footer is not inside an article, section, aside, main, or nav. */
      const footer = all.find((e) => !e.parentElement?.closest("article, section, aside, main, nav")) ?? all[0];
      if (!footer) return { found: false, top: 0, left: 0, text: "", links: [] };
      const r = footer.getBoundingClientRect();
      return {
        found: true,
        top: Math.round(r.top + window.scrollY),
        left: Math.round(r.left),
        text: footer.textContent.replace(/\s+/g, " ").trim(),
        links: (Array.from(footer.querySelectorAll("a")) as any[]).map((a) => {
          const b = a.getBoundingClientRect();
          return {
            text: a.textContent.replace(/\s+/g, " ").trim(),
            href: a.getAttribute("href") ?? "",
            top: Math.round(b.top + window.scrollY),
            left: Math.round(b.left),
          };
        }),
      };
    }, String(params.footerSelector));
    out.push({ pagePath, data });
  }
  return out;
}

/* "FAQ" is governed by hasFaq, and "Sitemap" by hasSitemap. */
const flagFor = (entry: string) => {
  const name = entry.replace(/\s+/g, "");
  return `has${name[0].toUpperCase()}${name.slice(1).toLowerCase()}`;
};

export const tl4a: RuleModule = {
  code: "TL-4a",
  surface: "rendered",

  async locate(ctx) {
    const out: Candidate[] = [];
    const links = (ctx.params.footerLinks as string[]).map(String);
    const conditional = new Set((ctx.params.conditionalLinks as string[]).map(String));
    const required = links.filter((l) => !conditional.has(l) || ctx.params[flagFor(l)] !== false);
    for (const { pagePath, data } of await readFooters(ctx)) {
      if (!data.found) {
        out.push({ file: pagePath, line: 0, column: 0, data: { message: `No element matches ${String(ctx.params.footerSelector)}. Add the footer.` } });
        continue;
      }
      const at = (e: { top: number; left: number }) => ({ file: pagePath, line: e.top, column: e.left });
      const texts = data.links.map((l) => norm(l.text));
      const positions = links.map((l) => texts.indexOf(norm(l)));
      for (const l of required) {
        if (positions[links.indexOf(l)] === -1) out.push({ ...at(data), data: { message: `The footer lacks the link "${l}".` } });
      }
      const present = links.map((l, i) => ({ l, p: positions[i] })).filter((x) => x.p !== -1);
      for (let i = 1; i < present.length; i++) {
        if (present[i].p < present[i - 1].p) {
          out.push({ ...at(data), data: { message: `The footer link "${present[i].l}" comes before "${present[i - 1].l}". Follow the order ${links.join(", ")}.` } });
          break;
        }
      }
      for (const l of data.links) {
        if (l.href.trim() === "" || l.href.trim() === "#") {
          out.push({ ...at(l), data: { message: `The footer link "${l.text}" has no destination. Set its href.` } });
        }
      }
    }
    return out;
  },

  decide(candidate) {
    return (candidate.data as { message: string }).message;
  },
};

export const tl4b: RuleModule = {
  code: "TL-4b",
  surface: "rendered",

  async locate(ctx) {
    const out: Candidate[] = [];
    const year = ctx.params.currentYear === "auto" ? String(new Date().getFullYear()) : String(ctx.params.currentYear);
    const wanted = `© ${year}, ${String(ctx.params.ownerName)}`;
    for (const { pagePath, data } of await readFooters(ctx)) {
      const ok = data.found && data.text.includes(wanted);
      const message = data.found ? `The footer does not contain "${wanted}".` : `No element matches ${String(ctx.params.footerSelector)}. Add the footer.`;
      out.push({ file: pagePath, line: data.top, column: data.left, data: { message: ok ? null : message } });
    }
    return out;
  },

  decide(candidate) {
    return (candidate.data as { message: string | null }).message;
  },
};

/* TL-4d reads every page that has a footer. A link whose scheme is not http or
   https (mailto, tel) cannot be requested and is skipped. An external link is
   requested only when checkExternal is true. */
async function probe(url: string, seconds: number): Promise<{ status: number; url: string } | null> {
  const opts = { redirect: "follow" as const, signal: AbortSignal.timeout(seconds * 1000) };
  try {
    let res = await fetch(url, { ...opts, method: "HEAD" });
    if ([403, 405, 501].includes(res.status)) res = await fetch(url, { ...opts, method: "GET" });
    return { status: res.status, url: res.url };
  } catch {
    return null;
  }
}

export const tl4d: RuleModule = {
  code: "TL-4d",
  surface: "project",

  async locate({ files, root, params }) {
    const out: Candidate[] = [];
    const sel = String(params.footerSelector);
    for (const page of readPages(files)) {
      const links = page.els.filter((e) => e.tag === "a" && "href" in e.attrs && hasAncestor(page.els, e, (a) => matches(a, sel)));
      for (const el of links) {
        const href = el.attrs.href.trim();
        const at = { file: page.file, line: el.line, column: el.column };
        const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(href)?.[1].toLowerCase();
        if (scheme !== undefined && scheme !== "http" && scheme !== "https") continue;
        if (scheme !== undefined || href.startsWith("//")) {
          if (params.checkExternal !== true) continue;
          const res = await probe(href.startsWith("//") ? `https:${href}` : href, Number(params.timeoutSeconds));
          const message =
            res === null ? `The footer link ${href} did not respond.`
            : res.status >= 400 ? `The footer link ${href} returned status ${res.status}.`
            : null;
          out.push({ ...at, data: { message } });
          continue;
        }
        const clean = href.split(/[?#]/)[0];
        /* An empty or fragment-only href leads back to the page itself: a placeholder. */
        const target = clean === "" ? page.file : fileForPath(clean.startsWith("/") ? root : path.dirname(page.file), clean);
        const message =
          target === null ? `The footer link ${href} leads to no page.`
          : clean === "" ? `The footer link "${href}" is a placeholder that leads back to the page. Set its destination.`
          : null;
        out.push({ ...at, data: { message } });
      }
    }
    return out;
  },

  decide(candidate) {
    return (candidate.data as { message: string | null }).message;
  },
};
