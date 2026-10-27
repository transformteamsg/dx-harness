import type { Candidate, RuleModule } from "../../types.ts";

/* WP-10c, WP-10d, and WP-11b: three rendered checks on form controls and error
   states. Each reads the computed page, so a control that a script adds is
   covered. */

const VIEWPORT = { width: 1280, height: 800 };

interface Issue {
  message: string;
  top: number;
  left: number;
}

async function eachPage<A>(
  ctx: { rendered?: import("../../types.ts").RenderedSession; params: Record<string, unknown> },
  find: (page: import("../../types.ts").RenderedPage) => Promise<Issue[]>,
): Promise<Candidate[]> {
  const out: Candidate[] = [];
  if (!ctx.rendered) return out;
  for (const pagePath of ctx.params.pages as string[]) {
    const page = await ctx.rendered.open(pagePath, VIEWPORT);
    for (const i of await find(page)) out.push({ file: pagePath, line: i.top, column: i.left, data: { message: i.message } });
  }
  return out;
}

const decideMessage = (c: Candidate) => (c.data as { message: string }).message;

/* WP-10c. A control matches a key of purposeMap when its name, id, or type equals
   the key, ignoring case and treating _ and - alike. The token that counts is the
   last word of autocomplete, because the section and the shipping or billing
   words come first. */
export const wp10c: RuleModule = {
  code: "WP-10c",
  surface: "rendered",

  locate(ctx) {
    const map = ctx.params.purposeMap as Record<string, string>;
    return eachPage(ctx, (page) =>
      page.evaluate((purposeMap: Record<string, string>): Issue[] => {
        const norm = (s: string) => s.toLowerCase().replace(/_/g, "-");
        const keys = new Map(Object.entries(purposeMap).map(([k, v]) => [norm(k), v]));
        const found: Issue[] = [];
        for (const el of Array.from(document.querySelectorAll("input, select, textarea")) as any[]) {
          const type = (el.getAttribute("type") ?? "").toLowerCase();
          if (type === "hidden" || el.disabled) continue;
          const names = [el.getAttribute("name"), el.id, type].filter((n) => n).map((n) => norm(n));
          const key = names.find((n) => keys.has(n));
          if (key === undefined) continue;
          const want = keys.get(key) as string;
          const attr = (el.getAttribute("autocomplete") ?? "").trim().toLowerCase();
          const got = attr.split(/\s+/).pop() ?? "";
          if (got === want) continue;
          const r = el.getBoundingClientRect();
          found.push({
            message: attr === "" ? `The input "${key}" has no autocomplete. Add autocomplete="${want}".` : `The input "${key}" has autocomplete="${attr}". Use autocomplete="${want}".`,
            top: Math.round(r.top),
            left: Math.round(r.left),
          });
        }
        return found;
      }, map),
    );
  },

  decide: decideMessage,
};

/* WP-10d. The accessible name is read in the order of aria-labelledby, aria-label,
   the label elements, title, and placeholder. Text in an aria-hidden element,
   such as a required marker, is left out. Controls in a form are compared with
   each other. A control outside a form is compared with the other controls
   outside a form. The finding sits on each control after the first. */
export const wp10d: RuleModule = {
  code: "WP-10d",
  surface: "rendered",

  locate(ctx) {
    return eachPage(ctx, (page) =>
      page.evaluate((): Issue[] => {
        const textOf = (node: any): string => {
          if (node.nodeType === 3) return node.nodeValue ?? "";
          if (node.nodeType !== 1 || node.getAttribute("aria-hidden") === "true") return "";
          return Array.from(node.childNodes).map(textOf).join("");
        };
        const squash = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
        const nameOf = (el: any): string => {
          const by = el.getAttribute("aria-labelledby");
          if (by) {
            const t = by.split(/\s+/).map((id: string) => document.getElementById(id)).filter(Boolean).map((n: any) => textOf(n)).join(" ");
            if (squash(t)) return squash(t);
          }
          const al = el.getAttribute("aria-label");
          if (al && squash(al)) return squash(al);
          const labels = Array.from(el.labels ?? []).map((l: any) => textOf(l)).join(" ");
          if (squash(labels)) return squash(labels);
          const title = el.getAttribute("title");
          if (title && squash(title)) return squash(title);
          const ph = el.getAttribute("placeholder");
          return ph ? squash(ph) : "";
        };
        const legendOf = (el: any): string | null => {
          const fs = el.closest("fieldset");
          const legend = fs ? fs.querySelector("legend") : null;
          return legend ? squash(textOf(legend)) : null;
        };
        const groups = new Map<any, any[]>();
        for (const el of Array.from(document.querySelectorAll("input, select, textarea")) as any[]) {
          const type = (el.getAttribute("type") ?? "").toLowerCase();
          if (["hidden", "submit", "button", "reset", "image"].includes(type)) continue;
          const key = el.form ?? null;
          groups.set(key, [...(groups.get(key) ?? []), el]);
        }
        const found: Issue[] = [];
        for (const list of groups.values()) {
          const byName = new Map<string, any[]>();
          for (const el of list) {
            const n = nameOf(el);
            if (n) byName.set(n, [...(byName.get(n) ?? []), el]);
          }
          for (const [name, same] of byName) {
            if (same.length < 2) continue;
            /* Each in its own fieldset with a different legend is distinct. */
            const legends = same.map(legendOf);
            const fieldsets = same.map((e) => e.closest("fieldset"));
            const distinct = legends.every((l) => l !== null) && new Set(legends).size === legends.length && new Set(fieldsets).size === fieldsets.length;
            if (distinct) continue;
            for (const el of same.slice(1)) {
              const r = el.getBoundingClientRect();
              found.push({
                message: `Two controls in one form are named "${name}". Give each a distinct label, or put each in its own fieldset with a different legend.`,
                top: Math.round(r.top),
                left: Math.round(r.left),
              });
            }
          }
        }
        return found;
      }),
    );
  },

  decide: decideMessage,
};

/* WP-11b. An element with no area, such as an empty alert region that waits for a
   message, is not an error state on screen, so it is skipped. A form control
   cannot hold text or an icon, so its text or icon is the element that
   aria-errormessage or aria-describedby names. This reads the rule file with one
   addition, which the category README records. */
export const wp11b: RuleModule = {
  code: "WP-11b",
  surface: "rendered",

  locate(ctx) {
    const selector = String(ctx.params.errorSelector);
    return eachPage(ctx, (page) =>
      page.evaluate((sel: string): Issue[] => {
        const hasContent = (el: any): boolean => {
          if (el.innerText && el.innerText.trim() !== "") return true;
          return el.querySelector("svg, img, [aria-label]") !== null;
        };
        const found: Issue[] = [];
        for (const el of Array.from(document.querySelectorAll(sel)) as any[]) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (hasContent(el)) continue;
          const ids = `${el.getAttribute("aria-errormessage") ?? ""} ${el.getAttribute("aria-describedby") ?? ""}`.split(/\s+/).filter(Boolean);
          const described = ids.map((id: string) => document.getElementById(id)).filter(Boolean);
          if (described.some((d: any) => hasContent(d))) continue;
          const name = el.tagName.toLowerCase() + (el.id ? `#${el.id}` : el.className ? `.${String(el.className).trim().split(/\s+/).join(".")}` : "");
          found.push({
            message: `The error state ${name} has no text and no icon. Add a message, or an icon with a text alternative.`,
            top: Math.round(r.top),
            left: Math.round(r.left),
          });
        }
        return found;
      }, selector),
    );
  },

  decide: decideMessage,
};
