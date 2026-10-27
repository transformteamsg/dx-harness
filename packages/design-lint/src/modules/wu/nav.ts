import fs from "node:fs";
import path from "node:path";
import { elements, hasAncestor, matches } from "../../html.ts";
import type { HtmlElement } from "../../html.ts";
import { fileForPath } from "../../project.ts";
import type { Candidate, RuleModule } from "../../types.ts";

/* The consistency rules of WU: navigation order and visibility (WU-7a, WU-7b),
   names of links and buttons (WU-8a, WU-8c), and the place of help (WU-9a). */

const strings = (v: unknown) => (v as string[]).map(String);
const words = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();

interface ParsedPage {
  path: string;
  file: string;
  els: HtmlElement[];
}

function readPage(root: string, pagePath: string): ParsedPage | null {
  const file = fileForPath(root, pagePath);
  return file ? { path: pagePath, file, els: elements(fs.readFileSync(file, "utf8")) } : null;
}

/* Where a link goes, as a key. An internal link resolves to the file that it
   reaches, so "apply.html" and "/apply.html" give one key. The hash is dropped.
   The language of the target is part of the key, because a language switcher
   and a home link to the same address are different functions. */
function targetKey(root: string, fromFile: string, el: HtmlElement): string | null {
  const href = (el.attrs.href ?? "").trim();
  if (href === "" || href.startsWith("#") || /^javascript:/i.test(href)) return null;
  const lang = (el.attrs.hreflang ?? "").toLowerCase();
  const clean = href.split("#")[0];
  if (/^[a-z][a-z0-9+.-]*:/i.test(clean) || clean.startsWith("//")) return `${clean}|${lang}`;
  const [pathname, query = ""] = clean.split("?");
  const target = pathname.startsWith("/") ? fileForPath(root, pathname) : fileForPath(path.dirname(fromFile), pathname === "" ? "." : pathname);
  return `${target ? path.relative(root, target) : pathname}${query ? `?${query}` : ""}|${lang}`;
}

/* The accessible name from the source: aria-label, aria-labelledby, the text
   with the alt text of images, the value of a button input, then the title. */
function accessibleName(els: HtmlElement[], el: HtmlElement): string {
  if (el.attrs["aria-label"]?.trim()) return words(el.attrs["aria-label"]);
  const by = el.attrs["aria-labelledby"];
  if (by) {
    const text = by.split(/\s+/).map((id) => els.find((e) => e.attrs.id === id)?.text ?? "").join(" ");
    if (words(text)) return words(text);
  }
  if (el.tag === "input") return words(el.attrs.value ?? el.attrs.title ?? "");
  const alts = els.filter((e) => e.tag === "img" && hasAncestor(els, e, (a) => a.index === el.index)).map((e) => e.attrs.alt ?? "");
  return words(`${el.text} ${alts.join(" ")}`) || words(el.attrs.title ?? "");
}

/* A link counts for WU-8a and WU-8c when it sits in a repeated region of the
   page: a header, a navigation, a footer, or an aside. A link in the running text
   of the main content takes its name from its sentence, so the rules leave it. */
const REGION = new Set(["header", "nav", "footer", "aside"]);
const REGION_ROLES = new Set(["banner", "navigation", "contentinfo", "complementary"]);
const inRegion = (els: HtmlElement[], el: HtmlElement) =>
  hasAncestor(els, el, (a) => REGION.has(a.tag) || REGION_ROLES.has(a.attrs.role ?? ""));

const isSubmit = (e: HtmlElement) => {
  const type = (e.attrs.type ?? "").toLowerCase();
  return (e.tag === "button" && (type === "" || type === "submit")) || (e.tag === "input" && type === "submit");
};

/* WU-7a: the links of the main navigation keep their order on every page. Pages
   may add or drop a link. The rule compares the order of the links that two pages
   share, so a page with an extra link does not fail. */
function navTargets(root: string, page: ParsedPage, selector: string): { nav: HtmlElement; keys: string[] } | null {
  const nav = page.els.find((e) => matches(e, selector));
  if (!nav) return null;
  const keys: string[] = [];
  for (const a of page.els) {
    if (a.tag !== "a" || !hasAncestor(page.els, a, (e) => e.index === nav.index)) continue;
    const key = targetKey(root, page.file, a);
    if (key && !keys.includes(key)) keys.push(key);
  }
  return { nav, keys };
}

export const wu7a: RuleModule = {
  code: "WU-7a",
  surface: "project",

  locate({ root, params }) {
    const selector = String(params.navSelector);
    const out: Candidate[] = [];
    let reference: { path: string; keys: string[] } | null = null;
    for (const pagePath of strings(params.pages)) {
      const page = readPage(root, pagePath);
      if (!page) {
        out.push({ file: root, line: 1, column: 1, data: { message: `The page ${pagePath} does not exist under the project root.` } });
        continue;
      }
      const found = navTargets(root, page, selector);
      if (!found) {
        out.push({ file: page.file, line: 1, column: 1, data: { message: `No element matches the navigation selector "${selector}".` } });
        continue;
      }
      if (!reference) {
        reference = { path: pagePath, keys: found.keys };
        continue;
      }
      const shared = reference.keys.filter((k) => found.keys.includes(k));
      const mine = found.keys.filter((k) => shared.includes(k));
      if (shared.join("\n") !== mine.join("\n")) {
        out.push({ file: page.file, line: found.nav.line, column: found.nav.column, data: { message: `The main navigation lists its links in a different order than on ${reference.path}.` } });
      }
    }
    return out;
  },

  decide(candidate) {
    return (candidate.data as { message: string }).message;
  },
};

/* WU-7b: the navigation links are visible on the first screen at desktop size. */
export const wu7b: RuleModule = {
  code: "WU-7b",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const viewport = { width: params.desktopViewport as number, height: params.desktopHeight as number };
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, viewport);
      const result = await page.evaluate((arg: { selector: string; width: number; height: number }) => {
        const nav = document.querySelector(arg.selector) as any;
        if (!nav) return { found: false, hidden: 0, total: 0, top: 0, left: 0 };
        const links = Array.from(nav.querySelectorAll("a[href]")) as any[];
        let hidden = 0;
        for (const a of links) {
          const r = a.getBoundingClientRect();
          const s = getComputedStyle(a);
          const seen = a.getClientRects().length > 0 && s.visibility !== "hidden" && s.opacity !== "0" && r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < arg.height && r.right > 0 && r.left < arg.width;
          if (!seen) hidden++;
        }
        const b = nav.getBoundingClientRect();
        return { found: true, hidden, total: links.length, top: Math.round(b.top), left: Math.round(b.left) };
      }, { selector: String(params.navSelector), ...viewport });
      if (!result.found || result.total === 0 || result.hidden > 0) out.push({ file: pagePath, line: result.top, column: result.left, data: result });
    }
    return out;
  },

  decide(candidate, params) {
    const d = candidate.data as { found: boolean; hidden: number; total: number };
    if (!d.found) return `No element matches the navigation selector "${String(params.navSelector)}".`;
    if (d.total === 0) return "The main navigation has no links.";
    return `${d.hidden} of ${d.total} main navigation links are not visible on the first screen at ${String(params.desktopViewport)} pixels wide. Show them without a click.`;
  },
};

/* WU-8a: within one page, links with the same target have the same name, and
   across the site, submit buttons of forms with the same action have the same
   name. The names of one target on different pages are WU-8c's. axe
   identical-links-same-purpose is not used: it reports one name for two targets,
   which is another success criterion, and it returns a result that needs review
   and never a violation. */
export const wu8a: RuleModule = {
  code: "WU-8a",
  surface: "project",

  locate({ files, root, params }) {
    const ignore = strings(params.ignoreHrefs);
    const out: Candidate[] = [];
    const buttons = new Map<string, { name: string; file: string; el: HtmlElement }[]>();
    for (const file of files.filter((f) => /\.html?$/i.test(f))) {
      const els = elements(fs.readFileSync(file, "utf8"));
      const links = new Map<string, { name: string; el: HtmlElement }[]>();
      for (const el of els) {
        if (el.tag === "a" && el.attrs.href !== undefined && !ignore.includes(el.attrs.href)) {
          if (!inRegion(els, el)) continue;
          const key = targetKey(root, file, el);
          if (key) links.set(key, [...(links.get(key) ?? []), { name: accessibleName(els, el), el }]);
        } else if (isSubmit(el)) {
          let at = el.parent;
          while (at !== null && els[at].tag !== "form") at = els[at].parent;
          const action = at === null ? undefined : els[at].attrs.action;
          if (action && !ignore.includes(action)) buttons.set(action, [...(buttons.get(action) ?? []), { name: accessibleName(els, el), file, el }]);
        }
      }
      for (const group of links.values()) {
        for (const g of group.slice(1)) {
          if (g.name !== group[0].name) out.push({ file, line: g.el.line, column: g.el.column, data: { name: g.name, other: group[0].name } });
        }
      }
    }
    for (const group of buttons.values()) {
      for (const g of group.slice(1)) {
        if (g.name !== group[0].name) out.push({ file: g.file, line: g.el.line, column: g.el.column, data: { name: g.name, other: group[0].name } });
      }
    }
    return out;
  },

  decide(candidate) {
    const d = candidate.data as { name: string; other: string };
    return `This control is named "${d.name}", and another control with the same target is named "${d.other}". Use one name.`;
  },
};

/* WU-8c: a link target has the same name on every listed page. A page that uses
   two names for one target is WU-8a's finding, so this rule compares only the
   pages that use one name. The first listed page that links to the target sets
   the name. */
export const wu8c: RuleModule = {
  code: "WU-8c",
  surface: "project",

  locate({ root, params }) {
    const ignore = strings(params.ignoreNames).map(words);
    const out: Candidate[] = [];
    const seen = new Map<string, string>();
    for (const pagePath of strings(params.pages)) {
      const page = readPage(root, pagePath);
      if (!page) continue;
      const byKey = new Map<string, { name: string; el: HtmlElement }[]>();
      for (const el of page.els) {
        if (el.tag !== "a" || !inRegion(page.els, el)) continue;
        const key = targetKey(root, page.file, el);
        if (key) byKey.set(key, [...(byKey.get(key) ?? []), { name: accessibleName(page.els, el), el }]);
      }
      for (const [key, group] of byKey) {
        if (new Set(group.map((g) => g.name)).size !== 1 || ignore.includes(group[0].name)) continue;
        const first = seen.get(key);
        if (first === undefined) seen.set(key, group[0].name);
        else if (first !== group[0].name) out.push({ file: page.file, line: group[0].el.line, column: group[0].el.column, data: { name: group[0].name, other: first } });
      }
    }
    return out;
  },

  decide(candidate) {
    const d = candidate.data as { name: string; other: string };
    return `This link is named "${d.name}", and the same target is named "${d.other}" on another page. Use one name on every page.`;
  },
};

/* WU-9a: the help entry sits in the same landmark, at the same offset inside it,
   on every page. The offset is measured from the top left of the landmark, so a
   footer that moves with the height of the content does not count as a change. A
   help entry outside any landmark is measured from the document. */
interface HelpPlace {
  landmark: string;
  x: number;
  y: number;
  top: number;
  left: number;
}

export const wu9a: RuleModule = {
  code: "WU-9a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const tolerance = params.positionTolerance as number;
    const reference = new Map<number, { path: string; place: HelpPlace }>();
    for (const pagePath of params.pages as string[]) {
      const problems: string[] = [];
      let at: HelpPlace | null = null;
      for (const width of params.viewports as number[]) {
        const page = await rendered.open(pagePath, { width, height: 800 });
        const place = await page.evaluate((selector: string): HelpPlace | null => {
          const el = document.querySelector(selector) as any;
          if (!el) return null;
          const lm = el.closest("header, nav, main, aside, footer, [role=banner], [role=navigation], [role=main], [role=complementary], [role=contentinfo]");
          const r = el.getBoundingClientRect();
          const b = lm ? lm.getBoundingClientRect() : { top: -window.scrollY, left: -window.scrollX };
          const landmark = lm ? (lm.getAttribute("role") ?? lm.tagName.toLowerCase()) : "none";
          return { landmark, x: Math.round(r.left - b.left), y: Math.round(r.top - b.top), top: Math.round(r.top), left: Math.round(r.left) };
        }, String(params.helpSelector));
        if (!place) {
          problems.push(`no element matches the help selector at ${width} pixels`);
          continue;
        }
        at ??= place;
        const ref = reference.get(width);
        if (!ref) reference.set(width, { path: pagePath, place });
        else if (ref.place.landmark !== place.landmark) problems.push(`the help entry is in the ${place.landmark} landmark at ${width} pixels, and in ${ref.place.landmark} on ${ref.path}`);
        else if (Math.abs(ref.place.x - place.x) > tolerance || Math.abs(ref.place.y - place.y) > tolerance) {
          problems.push(`the help entry sits ${Math.abs(ref.place.x - place.x)} and ${Math.abs(ref.place.y - place.y)} pixels from where it sits on ${ref.path} at ${width} pixels`);
        }
      }
      if (problems.length > 0) out.push({ file: pagePath, line: at?.top ?? 0, column: at?.left ?? 0, data: { problems } });
    }
    return out;
  },

  decide(candidate) {
    return `Help does not sit in the same place on every page: ${(candidate.data as { problems: string[] }).problems[0]}.`;
  },
};
