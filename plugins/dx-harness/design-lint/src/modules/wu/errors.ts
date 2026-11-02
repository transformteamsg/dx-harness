import type { Candidate, RuleModule } from "../../types.ts";

/* The rendered rules of WU about abbreviations (WU-4a) and errors (WU-10a,
   WU-10b, WU-10d, WU-11a). Each opens the page in the browser and reads the DOM. */

const VIEWPORT = { width: 1280, height: 800 };
const strings = (v: unknown) => (v as string[]).map(String);

interface Hit {
  message: string;
  top: number;
  left: number;
}

/* A rendered rule that finds, on each page of a list, the places that
   `inspect` returns. `inspect` runs in the browser. */
function pageRule<A>(
  code: string,
  list: (params: Record<string, unknown>) => string[],
  arg: (params: Record<string, unknown>) => A,
  inspect: (arg: A) => Hit[],
): RuleModule {
  return {
    code,
    surface: "rendered",

    async locate({ rendered, params }) {
      const out: Candidate[] = [];
      if (!rendered) return out;
      for (const pagePath of list(params)) {
        const page = await rendered.open(pagePath, VIEWPORT);
        for (const h of await page.evaluate(inspect as (a: A) => Hit[], arg(params))) {
          out.push({ file: pagePath, line: h.top, column: h.left, data: { message: h.message } });
        }
      }
      return out;
    },

    decide(candidate) {
      return (candidate.data as { message: string }).message;
    },
  };
}

/* WU-4a: the first use of an abbreviation on the page is expanded. It is a
   heuristic. The expansion in text is recognised when the words before the
   bracket start with the letters of the abbreviation, in order, and small words
   such as "of" and "the" may be left out of the letters. */
export const wu4a = pageRule(
  "WU-4a",
  (p) => strings(p.pages),
  (p) => ({ common: strings(p.commonAbbreviations), pattern: String(p.abbreviationPattern), elements: strings(p.expansionElements) }),
  (arg: { common: string[]; pattern: string; elements: string[] }): Hit[] => {
    const stop = new Set(["of", "and", "the", "for", "to", "in", "on", "a", "an"]);
    const expands = (before: string, token: string) => {
      const ws = before.trim().split(/\s+/).filter(Boolean);
      let i = ws.length - 1;
      for (let k = token.length - 1; k >= 0; k--) {
        while (i >= 0 && stop.has(ws[i].toLowerCase()) && ws[i][0].toUpperCase() !== token[k]) i--;
        if (i < 0 || ws[i][0].toUpperCase() !== token[k]) return false;
        i--;
      }
      return true;
    };
    const first = new Map<string, { node: any; index: number }>();
    const walker = document.createTreeWalker(document.body, 4);
    for (let node = walker.nextNode() as any; node; node = walker.nextNode() as any) {
      const parent = node.parentElement;
      if (!parent || parent.closest("script, style, noscript, template, textarea")) continue;
      if (parent.getClientRects().length === 0) continue;
      for (const m of String(node.data).matchAll(new RegExp(arg.pattern, "g"))) {
        const at = m.index ?? 0;
        const data = String(node.data);
        /* A token that touches a hyphen, a digit, or a dot belongs to an identifier such as HB-20481. */
        const joined = /[-_./@\d]/.test(data[at - 1] ?? "") || /[-_./@\d]/.test(data[at + m[0].length] ?? "");
        if (!joined && !arg.common.includes(m[0]) && !first.has(m[0])) first.set(m[0], { node, index: at });
      }
    }
    const found: Hit[] = [];
    for (const [token, { node, index }] of first) {
      const parent = node.parentElement;
      const data = String(node.data);
      const titled = arg.elements.some((sel) => {
        const e = parent.closest(sel);
        return e && (e.getAttribute("title") ?? "").trim() !== "";
      });
      const before = data.slice(0, index).trimEnd();
      const after = data.slice(index + token.length).trimStart();
      const inText = before.endsWith("(") && after.startsWith(")") && expands(before.slice(0, -1), token);
      const described = parent.closest("[aria-describedby]");
      const help = described && described.getAttribute("aria-describedby").split(/\s+/).some((id: string) => document.getElementById(id));
      if (titled || inText || help) continue;
      const r = parent.getBoundingClientRect();
      found.push({ message: `The abbreviation ${token} has no expansion at its first use. Write it out in full, or wrap it in <abbr title>.`, top: Math.round(r.top), left: Math.round(r.left) });
    }
    return found;
  },
);

/* WU-10a: each aria-invalid control points to an element that exists. axe
   aria-valid-attr-value is not run here: WR-1c runs it already, so a bad value
   would be reported twice. axe also returns a missing id as "needs review" and
   never as a violation, so this rule reports the two cases that it leaves: a
   control with no reference attribute, and one whose ids match no element. */
export const wu10a = pageRule(
  "WU-10a",
  (p) => strings(p.pages),
  (p) => strings(p.errorReferenceAttributes),
  (attrs: string[]): Hit[] => {
    const found: Hit[] = [];
    for (const el of Array.from(document.querySelectorAll('[aria-invalid="true"]')) as any[]) {
      const present = attrs.filter((a) => el.hasAttribute(a));
      const points = present.some((a) => String(el.getAttribute(a)).split(/\s+/).some((id: string) => id && document.getElementById(id)));
      if (points) continue;
      const r = el.getBoundingClientRect();
      found.push({
        message: present.length === 0 ? `This control is invalid and has none of ${attrs.join(", ")}. Point it to its error text.` : `This control is invalid, but ${present.join(" and ")} points to no element on the page. Point it to its error text.`,
        top: Math.round(r.top),
        left: Math.round(r.left),
      });
    }
    return found;
  },
);

/* WU-10b: the error text that an invalid control references has text, is
   visible, and is announced. A control references a hint and an error through
   one aria-describedby, so the announce test passes when any referenced element
   is announced. The empty and the visible tests apply to each element. */
export const wu10b = pageRule(
  "WU-10b",
  (p) => strings(p.pages),
  (p) => ({ attrs: strings(p.errorReferenceAttributes), roles: strings(p.announceRoles) }),
  (arg: { attrs: string[]; roles: string[] }): Hit[] => {
    const found: Hit[] = [];
    const reported = new Set<any>();
    const add = (el: any, message: string) => {
      if (reported.has(el)) return;
      reported.add(el);
      const r = el.getBoundingClientRect();
      found.push({ message, top: Math.round(r.top), left: Math.round(r.left) });
    };
    for (const control of Array.from(document.querySelectorAll('[aria-invalid="true"]')) as any[]) {
      const refs: any[] = [];
      for (const a of arg.attrs) {
        for (const id of String(control.getAttribute(a) ?? "").split(/\s+/)) {
          const e = id ? document.getElementById(id) : null;
          if (e) refs.push(e);
        }
      }
      const usable: any[] = [];
      for (const e of refs) {
        const s = getComputedStyle(e);
        if ((e.textContent ?? "").trim() === "") add(e, "The error text is empty. Write what is wrong.");
        else if (e.getClientRects().length === 0 || s.visibility === "hidden") add(e, "The error text is not visible. Show it, so that sighted users see it.");
        else usable.push(e);
      }
      if (usable.length === 0) continue;
      const announced = usable.some((e) => arg.roles.includes(e.getAttribute("role") ?? "") || e.hasAttribute("aria-live") || e.closest("[tabindex]"));
      if (!announced) add(usable[0], `The error text is not announced. Give it a role of ${arg.roles.join(" or ")}, an aria-live attribute, or put it in an error summary that takes focus.`);
    }
    return found;
  },
);

/* WU-10d: an error message is not a generic phrase. The rule reads the pages in
   failureFixtures, which a product sets under rules because they are pages that
   show an error. It compares the text without punctuation at its ends. */
export const wu10d = pageRule(
  "WU-10d",
  (p) => strings(p.failureFixtures),
  (p) => ({ generic: strings(p.genericErrors), selector: String(p.errorSelector) }),
  (arg: { generic: string[]; selector: string }): Hit[] => {
    const clean = (s: string) => s.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "").replace(/\s+/g, " ");
    const list = arg.generic.map(clean);
    const found: Hit[] = [];
    for (const el of Array.from(document.querySelectorAll(arg.selector)) as any[]) {
      const text = String(el.textContent ?? "");
      if (!list.includes(clean(text))) continue;
      const r = el.getBoundingClientRect();
      found.push({ message: `The error message "${text.trim()}" is generic. Say what is wrong and how to fix it.`, top: Math.round(r.top), left: Math.round(r.left) });
    }
    return found;
  },
);

/* WU-11a: a system error page has a heading and a way forward. A way forward is
   a link to the home page, a link to a search page or a search form, or a
   contact channel (mailto, tel, or a contact link). */
export const wu11a = pageRule(
  "WU-11a",
  (p) => strings(p.errorPages),
  (p) => ({ heading: p.requireHeading === true, recovery: p.requireRecoveryLink === true }),
  (arg: { heading: boolean; recovery: boolean }): Hit[] => {
    const found: Hit[] = [];
    if (arg.heading && !document.querySelector("h1")) found.push({ message: "The error page has no <h1> that states the error.", top: 0, left: 0 });
    if (arg.recovery) {
      const way = Array.from(document.querySelectorAll("a[href]")).some((a: any) => {
        if (/^(mailto|tel):/i.test(a.getAttribute("href"))) return true;
        const u = new URL(a.href);
        return u.origin === window.location.origin && (u.pathname === "/" || u.pathname === "/index.html" || /search|contact/i.test(u.pathname));
      }) || document.querySelector("form[role=search], input[type=search]") !== null;
      if (!way) found.push({ message: "The error page has no link to the home page, to search, or to a contact channel.", top: 0, left: 0 });
    }
    return found;
  },
);
