import fs from "node:fs";
import path from "node:path";
import { isHtml } from "../../files.ts";
import { axeRule, runAxe } from "../../engines/axe.ts";
import { combineRules } from "../../engines/combine.ts";
import { jsxRule, runJsxA11y } from "../../engines/jsx-a11y.ts";
import { elements, matches } from "../../html.ts";
import type { AxeNode } from "../../engines/axe.ts";
import type { HtmlElement } from "../../html.ts";
import type { Candidate, Params, RenderedPage, RuleContext, RuleModule } from "../../types.ts";
import { asHtml, JSX_FILE, jsxElements } from "./a-jsx.ts";
import type { JsxEl } from "./a-jsx.ts";

/* The rule modules of WP-1 to WP-9. The ids that a rule names in an engine are
   in the *_IDS constants, and test/wp-a-ids.test.ts checks them against the
   installed axe-core and eslint-plugin-jsx-a11y. */

const VIEWPORT = { width: 1280, height: 800 };

export const WP_AXE_IDS: Record<string, string[]> = {
  "WP-1a": ["image-alt", "input-image-alt", "role-img-alt", "svg-img-alt", "object-alt", "area-alt"],
  "WP-2a": ["video-caption"],
  "WP-6a": [
    "list", "listitem", "definition-list", "dlitem", "th-has-data-cells", "td-headers-attr", "td-has-header",
    "scope-attr-valid", "table-fake-caption", "heading-order", "empty-heading",
  ],
  /* WR-1a reports label, and WR-1b reports the two required-parent and children rules. */
  "WP-6c": ["form-field-multiple-labels"],
  "WP-9a": ["css-orientation-lock"],
};

export const WP_JSX_IDS: Record<string, string[]> = {
  "WP-1b": ["alt-text"],
  "WP-1e": ["img-redundant-alt"],
  "WP-2b": ["media-has-caption"],
  "WP-6b": [
    "aria-role", "aria-props", "aria-proptypes", "aria-unsupported-elements", "role-has-required-aria-props",
    "role-supports-aria-props", "no-redundant-roles", "no-noninteractive-element-to-interactive-role",
    "no-interactive-element-to-noninteractive-role",
  ],
  "WP-6e": ["prefer-tag-over-role"],
  "WP-7a": ["tabindex-no-positive"],
};

/* ---------- helpers ---------- */

const msg = (c: Candidate) => (c.data as { message: string }).message;
const hasSelector = (s: unknown) => typeof s === "string" && s.trim() !== "";

/* A source rule over HTML files. fn returns the findings of one file. */
function htmlPart(code: string, fn: (els: HtmlElement[], params: Params) => { el: HtmlElement; message: string }[]): RuleModule {
  return {
    code,
    surface: "source",
    locate({ files, params }) {
      const out: Candidate[] = [];
      for (const file of files.filter(isHtml)) {
        const els = elements(fs.readFileSync(file, "utf8"));
        for (const f of fn(els, params)) out.push({ file, line: f.el.line, column: f.el.column, data: { message: f.message } });
      }
      return out;
    },
    decide: msg,
  };
}

/* A source rule over JSX and TSX files. */
function jsxPart(code: string, fn: (els: JsxEl[], params: Params) => { el: JsxEl; message: string }[]): RuleModule {
  return {
    code,
    surface: "source",
    locate({ files, params }) {
      const out: Candidate[] = [];
      for (const file of files.filter((f) => JSX_FILE.test(f))) {
        for (const f of fn(jsxElements(fs.readFileSync(file, "utf8")), params)) {
          out.push({ file, line: f.el.line, column: f.el.column, data: { message: f.message } });
        }
      }
      return out;
    },
    decide: msg,
  };
}

/* axe cannot tell whether a video has audio, so for video-caption it never
   reports a violation. A video with no captions track comes back as "incomplete"
   instead, and a video with one passes. A rule that counts incomplete results as
   findings reads them here. runAxe has loaded axe into the page by then. */
async function incompleteNodes(page: RenderedPage, ids: string[]): Promise<AxeNode[]> {
  return page.evaluate(async (list: string[]) => {
    const result = await window.axe.run(document, { runOnly: { type: "rule", values: list }, resultTypes: ["incomplete"] });
    const out: any[] = [];
    for (const v of result.incomplete) {
      for (const n of v.nodes) {
        const target = Array.isArray(n.target) ? n.target[0] : n.target;
        const el = document.querySelector(target);
        const b = el ? el.getBoundingClientRect() : { top: 0, left: 0 };
        out.push({ ruleId: v.id, help: v.help, target: String(target), html: String(n.html || "").slice(0, 100), top: Math.round(b.top), left: Math.round(b.left) });
      }
    }
    return out;
  }, ids) as Promise<AxeNode[]>;
}

/* Runs an axe rule set and keeps the elements that no exemption selector matches. */
function axeWithSkip(code: string, ids: string[], skip: (params: Params) => string | null, incomplete = false): RuleModule {
  return {
    code,
    surface: "rendered",
    async locate({ rendered, params }) {
      const out: Candidate[] = [];
      if (!rendered) return out;
      const selector = skip(params);
      for (const pagePath of params.pages as string[]) {
        const page = await rendered.open(pagePath, VIEWPORT);
        const nodes = await runAxe(page, ids);
        if (incomplete) nodes.push(...(await incompleteNodes(page, ids)));
        for (const n of nodes) {
          if (selector) {
            const exempt = await page.evaluate(
              (a: { target: string; selector: string }) => {
                try {
                  const el = document.querySelector(a.target);
                  return el !== null && el.matches(a.selector);
                } catch {
                  return false;
                }
              },
              { target: n.target, selector },
            );
            if (exempt) continue;
          }
          out.push({ file: pagePath, line: n.top, column: n.left, data: n });
        }
      }
      return out;
    },
    decide(c) {
      const n = c.data as { ruleId: string; help: string; target: string; html: string };
      return `${n.help} (axe ${n.ruleId}) at ${n.target}: ${n.html}`;
    },
  };
}

/* A jsx-a11y rule whose elements can be exempted by a selector. */
function jsxRuleWithSkip(code: string, ids: string[], skip: (params: Params) => string | null): RuleModule {
  const inner = jsxRule(code, ids);
  return {
    ...inner,
    async locate(ctx: RuleContext) {
      const selector = skip(ctx.params);
      const found = await inner.locate(ctx);
      if (!selector) return found;
      const cache = new Map<string, JsxEl[]>();
      return found.filter((c) => {
        if (!cache.has(c.file)) cache.set(c.file, jsxElements(fs.readFileSync(c.file, "utf8")));
        const el = cache.get(c.file)!.find((e) => e.line === c.line && e.column === c.column);
        return !(el && matches(asHtml(el), selector));
      });
    },
  };
}

/* ---------- WP-1: text alternatives ---------- */

export const wp1a = axeRule("WP-1a", WP_AXE_IDS["WP-1a"]);
export const wp1b = jsxRule("WP-1b", WP_JSX_IDS["WP-1b"]);

/* WP-1c: the length of the alt text. A file name in the alt text is WP-1e's, so
   that one fault is not reported twice. */
export const wp1c: RuleModule = {
  code: "WP-1c",
  surface: "rendered",
  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const found = await page.evaluate((max: number) => {
        const list: { top: number; left: number; length: number }[] = [];
        for (const img of Array.from(document.querySelectorAll("img[alt]")) as any[]) {
          const length = img.getAttribute("alt").length;
          if (length > max) {
            const r = img.getBoundingClientRect();
            list.push({ top: Math.round(r.top), left: Math.round(r.left), length });
          }
        }
        return list;
      }, Number(params.maxAltLength));
      for (const f of found) out.push({ file: pagePath, line: f.top, column: f.left, data: { length: f.length, max: Number(params.maxAltLength) } });
    }
    return out;
  },
  decide(c) {
    const { length, max } = c.data as { length: number; max: number };
    return `The alt text is ${length} characters, over the limit of ${max}. Shorten it, and put the detail in the page text.`;
  },
};

/* WP-1e: the alt text that names a file or holds only a placeholder word. */
const EXTENSION = /\.(?:png|jpe?g|gif|svg|webp|avif|bmp|tiff?|ico|heic)$/i;
const FILE_NAME = /^[\w%-]+(?:[.][\w%-]+)*\.[a-z0-9]{2,5}$/i;

function altProblem(alt: string, src: string | undefined, words: string[]): string | null {
  const text = alt.trim();
  if (text === "") return null;
  const base = (src ?? "").split(/[?#]/)[0].split("/").pop()?.toLowerCase() ?? "";
  const stem = base.replace(/\.[^.]*$/, "");
  const lower = text.toLowerCase();
  if (EXTENSION.test(text) || (FILE_NAME.test(text) && !/\s/.test(text))) return `The alt text "${text}" is a file name. Describe the image instead.`;
  if (base !== "" && (lower === base || lower === stem)) return `The alt text "${text}" repeats the file name. Describe the image instead.`;
  const tokens = lower.split(/[^a-z0-9]+/).filter(Boolean);
  const placeholders = words.map((w) => w.toLowerCase());
  if (tokens.length > 0 && tokens.every((t) => placeholders.includes(t))) {
    return `The alt text "${text}" is a placeholder word. Describe the image, or use alt="" for a decorative image.`;
  }
  return null;
}

const wp1eHtml = htmlPart("WP-1e", (els, params) =>
  els
    .filter((e) => e.tag === "img" && "alt" in e.attrs)
    .flatMap((el) => {
      const message = altProblem(el.attrs.alt, el.attrs.src, params.placeholderWords as string[]);
      return message ? [{ el, message }] : [];
    }),
);
const wp1eJsx = jsxPart("WP-1e", (els, params) =>
  els
    .filter((e) => e.tag === "img" && "alt" in e.attrs)
    .flatMap((el) => {
      const message = altProblem(el.attrs.alt, el.attrs.src, params.placeholderWords as string[]);
      return message ? [{ el, message }] : [];
    }),
);

/* The custom parts and jsx-a11y img-redundant-alt can find the same image. The
   custom message wins, and jsx-a11y adds only what the parts did not find. */
export const wp1e: RuleModule = {
  code: "WP-1e",
  surface: "source",
  async locate(ctx) {
    const out: Candidate[] = [...(await wp1eHtml.locate(ctx)), ...(await wp1eJsx.locate(ctx))];
    const seen = new Set(out.map((c) => `${c.file}:${c.line}:${c.column}`));
    for (const r of await runJsxA11y(ctx.root, ctx.files, WP_JSX_IDS["WP-1e"])) {
      for (const m of r.messages) {
        if (seen.has(`${r.file}:${m.line}:${m.column}`)) continue;
        out.push({ file: r.file, line: m.line, column: m.column, data: { message: `${m.message} (jsx-a11y ${m.ruleId})` } });
      }
    }
    return out;
  },
  decide: msg,
};

/* ---------- WP-2: captions ---------- */

const mediaSkip = (p: Params) => (hasSelector(p.mediaAlternativeSelector) ? String(p.mediaAlternativeSelector) : null);

export const wp2a = axeWithSkip("WP-2a", WP_AXE_IDS["WP-2a"], mediaSkip, true);

/* WP-2b: jsx-a11y reads JSX and TSX. The HTML part covers <audio> only, because
   axe video-caption in WP-2a already reports a <video> on the rendered page. */
const wp2bHtml = htmlPart("WP-2b", (els, params) => {
  const selector = mediaSkip(params);
  return els
    .filter((e) => e.tag === "audio" && !("muted" in e.attrs) && !(selector && matches(e, selector)))
    .filter((e) => !els.some((t) => t.parent === e.index && t.tag === "track" && (t.attrs.kind ?? "").toLowerCase() === "captions"))
    .map((el) => ({ el, message: "The <audio> element has no <track kind=\"captions\"> child. Add a captions track." }));
});
export const wp2b = combineRules("WP-2b", [wp2bHtml, jsxRuleWithSkip("WP-2b", WP_JSX_IDS["WP-2b"], mediaSkip)]);

/* WP-2d: WebVTT files. */
function globToRegExp(glob: string): RegExp {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i];
    if (ch === "*") {
      if (glob[i + 1] === "*") {
        i++;
        if (glob[i + 1] === "/") {
          i++;
          re += "(?:.*/)?";
        } else re += ".*";
      } else re += "[^/]*";
    } else if (ch === "?") re += "[^/]";
    else re += ch.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${re}$`);
}

const TIMING = /^((?:\d{2,}:)?\d{2}:\d{2}\.\d{3})[ \t]+-->[ \t]+((?:\d{2,}:)?\d{2}:\d{2}\.\d{3})(?:[ \t].*)?$/;
function seconds(t: string): number {
  const parts = t.split(":").map(Number);
  const [s, ms] = String(t.split(":").pop()).split(".").map(Number);
  parts[parts.length - 1] = s + ms / 1000;
  return parts.reduce((a, b) => a * 60 + b, 0);
}

interface VttProblem {
  line: number;
  column: number;
  message: string;
}

export function checkVtt(text: string, maxLines: number, maxChars: number): VttProblem[] {
  const lines = text.replace(/^﻿/, "").split(/\r\n|\r|\n/);
  if (!/^WEBVTT(?:[ \t].*)?$/.test(lines[0] ?? "")) return [{ line: 1, column: 1, message: 'The file does not start with "WEBVTT".' }];
  const problems: VttProblem[] = [];
  let previousEnd = -1;
  let i = 1;
  while (i < lines.length) {
    if (lines[i].trim() === "") {
      i++;
      continue;
    }
    /* A block runs to the next blank line. */
    const start = i;
    while (i < lines.length && lines[i].trim() !== "") i++;
    const block = lines.slice(start, i);
    if (/^(?:NOTE|STYLE|REGION)(?:[ \t]|$)/.test(block[0])) continue;
    const at = block.findIndex((l) => l.includes("-->"));
    if (at === -1) {
      problems.push({ line: start + 1, column: 1, message: "The cue has no timing line with -->." });
      continue;
    }
    const timing = TIMING.exec(block[at]);
    if (!timing) {
      problems.push({ line: start + at + 1, column: 1, message: "The cue timing line is not valid WebVTT." });
      continue;
    }
    const from = seconds(timing[1]);
    const to = seconds(timing[2]);
    if (to <= from) problems.push({ line: start + at + 1, column: 1, message: "The cue ends at or before its start." });
    if (previousEnd > from) problems.push({ line: start + at + 1, column: 1, message: "The cue starts before the previous cue ends." });
    previousEnd = Math.max(previousEnd, to);
    const body = block.slice(at + 1);
    if (body.length > maxLines) problems.push({ line: start + at + 1, column: 1, message: `The cue has ${body.length} lines. The limit is ${maxLines}.` });
    body.forEach((l, k) => {
      const length = Array.from(l.replace(/<[^>]*>/g, "")).length;
      if (length > maxChars) problems.push({ line: start + at + 2 + k, column: 1, message: `The cue line has ${length} characters. The limit is ${maxChars}.` });
    });
  }
  return problems;
}

export const wp2d: RuleModule = {
  code: "WP-2d",
  surface: "project",
  locate({ files, root, params }) {
    const globs = (Array.isArray(params.captionFiles) ? params.captionFiles : [params.captionFiles]).map((g) => globToRegExp(String(g)));
    const out: Candidate[] = [];
    for (const file of files) {
      const rel = path.relative(root, file).split(path.sep).join("/");
      if (!globs.some((g) => g.test(rel))) continue;
      for (const p of checkVtt(fs.readFileSync(file, "utf8"), Number(params.maxLines), Number(params.maxLineCharacters))) {
        out.push({ file, line: p.line, column: p.column, data: { message: p.message } });
      }
    }
    return out;
  },
  decide: msg,
};

/* ---------- WP-3: media alternatives ---------- */

const ALT_KINDS = ["captions", "descriptions"];
const wp3aHtml = htmlPart("WP-3a", (els) => {
  const byId = new Map(els.filter((e) => e.attrs.id).map((e) => [e.attrs.id, e]));
  return els
    .filter((e) => (e.tag === "audio" || e.tag === "video") && !("data-media-alternative" in e.attrs))
    .filter((e) => {
      if (els.some((t) => t.parent === e.index && t.tag === "track" && ALT_KINDS.includes((t.attrs.kind ?? "").toLowerCase()))) return false;
      const refs = `${e.attrs["aria-describedby"] ?? ""} ${e.attrs["aria-details"] ?? ""}`.split(/\s+/).filter(Boolean);
      return !refs.some((id) => (byId.get(id)?.text.trim() ?? "") !== "");
    })
    .map((el) => ({ el, message: `The <${el.tag}> element has no captions or descriptions track and no aria-describedby or aria-details target with text.` }));
});
const wp3aJsx = jsxPart("WP-3a", (els) => {
  const byId = new Map(els.filter((e) => e.attrs.id).map((e) => [e.attrs.id, e]));
  return els
    .filter((e) => (e.tag === "audio" || e.tag === "video") && !("data-media-alternative" in e.attrs) && !e.spread)
    .filter((e) => {
      if (e.dynamic.has("aria-describedby") || e.dynamic.has("aria-details") || e.dynamic.has("data-media-alternative")) return false;
      if (e.children.some((t) => t.tag === "track" && (t.dynamic.has("kind") || t.spread || ALT_KINDS.includes((t.attrs.kind ?? "").toLowerCase())))) return false;
      const refs = `${e.attrs["aria-describedby"] ?? ""} ${e.attrs["aria-details"] ?? ""}`.split(/\s+/).filter(Boolean);
      return !refs.some((id) => byId.get(id)?.hasText);
    })
    .map((el) => ({ el, message: `The <${el.tag}> element has no captions or descriptions track and no aria-describedby or aria-details target with text.` }));
});
export const wp3a = combineRules("WP-3a", [wp3aHtml, wp3aJsx]);

/* ---------- WP-6: structure ---------- */

export const wp6a = axeRule("WP-6a", WP_AXE_IDS["WP-6a"]);
export const wp6b = jsxRule("WP-6b", WP_JSX_IDS["WP-6b"]);

/* WP-6c: axe form-field-multiple-labels, plus two custom checks that the installed
   axe-core has no rule for: a <fieldset> with no <legend>, and a <label for> that
   points at no form control. */
export const wp6c: RuleModule = {
  code: "WP-6c",
  surface: "rendered",
  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      for (const n of await runAxe(page, WP_AXE_IDS["WP-6c"])) {
        out.push({ file: pagePath, line: n.top, column: n.left, data: { message: `${n.help} (axe ${n.ruleId}) at ${n.target}: ${n.html}` } });
      }
      const custom = await page.evaluate(() => {
        const list: { message: string; top: number; left: number }[] = [];
        const pos = (el: any) => {
          const r = el.getBoundingClientRect();
          return { top: Math.round(r.top), left: Math.round(r.left) };
        };
        for (const fs of Array.from(document.querySelectorAll("fieldset")) as any[]) {
          const legend = Array.from(fs.children).find((c: any) => c.tagName === "LEGEND") as any;
          if (!legend || (legend.textContent || "").trim() === "") {
            list.push({ message: "The <fieldset> has no <legend> with text. Add a legend that names the group.", ...pos(fs) });
          }
        }
        for (const label of Array.from(document.querySelectorAll("label[for]")) as any[]) {
          const target = document.getElementById(label.getAttribute("for"));
          if (!target || !target.matches("input:not([type=hidden]), select, textarea, button, meter, output, progress")) {
            list.push({ message: `The label for="${label.getAttribute("for")}" does not point at a form control.`, ...pos(label) });
          }
        }
        return list;
      });
      for (const c of custom) out.push({ file: pagePath, line: c.top, column: c.left, data: { message: c.message } });
    }
    return out;
  },
  decide: msg,
};

/* WP-6e: a generic element that carries a role with a native element. WP-6b
   reports a role that repeats the implicit role of its element. */
const NATIVE_FOR_ROLE: Record<string, string> = {
  button: "<button>", link: "<a href>", navigation: "<nav>", main: "<main>", banner: "<header>", contentinfo: "<footer>",
  complementary: "<aside>", article: "<article>", form: "<form>", list: "<ul> or <ol>", listitem: "<li>",
  heading: "<h1> to <h6>", img: "<img>", table: "<table>", row: "<tr>", cell: "<td>", columnheader: "<th>",
  checkbox: '<input type="checkbox">', radio: '<input type="radio">', textbox: "<input> or <textarea>",
  combobox: "<select>", listbox: "<select>", option: "<option>", separator: "<hr>", progressbar: "<progress>",
  meter: "<meter>", dialog: "<dialog>", region: "<section>",
};
const GENERIC = new Set(["div", "span"]);
const roleMessage = (tag: string, role: string) => `The <${tag}> with role="${role}" can be a native element. Use ${NATIVE_FOR_ROLE[role]}.`;

const wp6eHtml = htmlPart("WP-6e", (els) =>
  els
    .filter((e) => GENERIC.has(e.tag) && (e.attrs.role ?? "").toLowerCase() in NATIVE_FOR_ROLE)
    .map((el) => ({ el, message: roleMessage(el.tag, el.attrs.role.toLowerCase()) })),
);
export const wp6e = combineRules("WP-6e", [wp6eHtml, jsxRule("WP-6e", WP_JSX_IDS["WP-6e"])]);

/* ---------- WP-7: order ---------- */

const wp7aHtml = htmlPart("WP-7a", (els) =>
  els
    .filter((e) => "tabindex" in e.attrs && Number.parseInt(e.attrs.tabindex, 10) > 0)
    .map((el) => ({ el, message: `tabindex="${el.attrs.tabindex}" is above 0. Use tabindex="0" or "-1", and order the code in the reading order.` })),
);
export const wp7a = combineRules("WP-7a", [wp7aHtml, jsxRule("WP-7a", WP_JSX_IDS["WP-7a"])]);

/* WP-7b: text blocks in DOM order against their place on the page. A block is a
   non-inline element with text and no non-inline child that has text. Two
   neighbours in DOM order differ when the second sits above the first in the
   same column, or left of it on the same row (right of it for right to left). A
   block in another column is not compared, because a column that reads down and
   then across is a valid order. */
export const wp7b: RuleModule = {
  code: "WP-7b",
  surface: "rendered",
  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const found = await page.evaluate((a: { tol: number; rtl: boolean }) => {
        const inline = (el: any) => /^(inline|contents|none)/.test(getComputedStyle(el).display);
        const visible = (el: any) => {
          const r = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && s.visibility !== "hidden";
        };
        const blocks: any[] = [];
        for (const el of Array.from(document.body.querySelectorAll("*")) as any[]) {
          if (["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"].includes(el.tagName)) continue;
          if (inline(el) || !visible(el) || (el.textContent || "").trim() === "") continue;
          const hasBlockChild = Array.from(el.querySelectorAll("*")).some(
            (d: any) => !inline(d) && (d.textContent || "").trim() !== "" && !["SCRIPT", "STYLE"].includes(d.tagName) && visible(d),
          );
          if (!hasBlockChild) blocks.push(el);
        }
        const list: { top: number; left: number; message: string }[] = [];
        for (let i = 1; i < blocks.length; i++) {
          const p = blocks[i - 1].getBoundingClientRect();
          const b = blocks[i].getBoundingClientRect();
          const overlap = Math.min(p.right, b.right) - Math.max(p.left, b.left) > 0;
          const above = b.top < p.top - a.tol && overlap;
          const sameRow = Math.abs(b.top - p.top) <= a.tol;
          const aside = sameRow && (a.rtl ? b.left > p.left + a.tol : b.left < p.left - a.tol);
          if (above || aside) {
            list.push({
              top: Math.round(b.top),
              left: Math.round(b.left),
              message: above
                ? "This text block comes after the previous one in the code but is shown above it. Order the code in the reading order."
                : `This text block comes after the previous one in the code but is shown on its ${a.rtl ? "right" : "left"}. Order the code in the reading order.`,
            });
          }
        }
        return list;
      }, { tol: Number(params.orderTolerancePx), rtl: String(params.direction).toLowerCase() === "rtl" });
      for (const f of found) out.push({ file: pagePath, line: f.top, column: f.left, data: { message: f.message } });
    }
    return out;
  },
  decide: msg,
};

/* ---------- WP-8: sensory characteristics ---------- */

export const wp8a: RuleModule = {
  code: "WP-8a",
  surface: "rendered",
  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const found = await page.evaluate((a: { sensory: string[]; control: string[] }) => {
        const inline = (el: any) => /^(inline|contents|none)/.test(getComputedStyle(el).display);
        const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
        const quoted = /"[^"]+"|“[^”]+”|‘[^’]+’|(?<!\w)'[^']+'(?!\w)/;
        const list: { top: number; left: number; sensory: string; control: string; text: string }[] = [];
        for (const el of Array.from(document.body.querySelectorAll("*")) as any[]) {
          if (["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"].includes(el.tagName) || inline(el)) continue;
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          /* Only the text that the element holds itself, so a parent does not repeat its child. */
          const own = Array.from(el.childNodes).filter((n: any) => n.nodeType === 3 || (n.nodeType === 1 && inline(n))).map((n: any) => n.textContent).join("");
          for (const sentence of own.split(/(?<=[.!?])\s+/)) {
            const w = words(sentence);
            const sensory = a.sensory.find((t) => w.includes(t.toLowerCase()));
            const control = a.control.find((t) => w.includes(t.toLowerCase()));
            if (sensory && control && !quoted.test(sentence)) {
              list.push({ top: Math.round(r.top), left: Math.round(r.left), sensory, control, text: sentence.trim().slice(0, 80) });
            }
          }
        }
        return list;
      }, { sensory: (params.sensoryTerms as string[]).map(String), control: (params.controlTerms as string[]).map(String) });
      for (const f of found) out.push({ file: pagePath, line: f.top, column: f.left, data: f });
    }
    return out;
  },
  decide(c) {
    const f = c.data as { sensory: string; control: string; text: string };
    return `Review: "${f.text}" names a ${f.control} by "${f.sensory}" with no quoted name. Name the control, for example Select the "Next" button.`;
  },
};

/* ---------- WP-9: orientation ---------- */

const wp9aAxe = axeRule("WP-9a", WP_AXE_IDS["WP-9a"]);
export const wp9a: RuleModule = {
  ...wp9aAxe,
  locate(ctx) {
    return ctx.params.orientationRequired === true ? [] : wp9aAxe.locate(ctx);
  },
};

const SCRIPT_FILE = /\.(?:[cm]?js|jsx|tsx?|html?)$/i;
const MANIFEST_FILE = /(?:^|[/\\])manifest\.json$|\.webmanifest$/i;
const LOCK = /\bscreen\s*\.\s*orientation\s*\.\s*lock\s*\(/g;

function positionOf(text: string, index: number): { line: number; column: number } {
  const before = text.slice(0, index).split("\n");
  return { line: before.length, column: before[before.length - 1].length + 1 };
}

export const wp9b: RuleModule = {
  code: "WP-9b",
  surface: "source",
  locate({ files, params }) {
    const out: Candidate[] = [];
    if (params.orientationRequired === true) return out;
    for (const file of files) {
      if (SCRIPT_FILE.test(file)) {
        const text = fs.readFileSync(file, "utf8");
        for (const m of text.matchAll(LOCK)) {
          out.push({ file, ...positionOf(text, m.index!), data: { message: "screen.orientation.lock() locks the orientation. Remove the call, or set orientationRequired when the content needs one orientation." } });
        }
      }
      if (MANIFEST_FILE.test(file)) {
        const text = fs.readFileSync(file, "utf8");
        let value: unknown;
        try {
          value = (JSON.parse(text) as { orientation?: unknown }).orientation;
        } catch {
          continue;
        }
        if (value !== undefined && value !== "any" && value !== "natural") {
          const at = text.search(/"orientation"/);
          out.push({ file, ...positionOf(text, Math.max(at, 0)), data: { message: `The manifest orientation "${String(value)}" locks the orientation. Use "any" or "natural".` } });
        }
      }
    }
    return out;
  },
  decide: msg,
};

export const wpAModules: RuleModule[] = [
  wp1a, wp1b, wp1c, wp1e,
  wp2a, wp2b, wp2d,
  wp3a,
  wp6a, wp6b, wp6c, wp6e,
  wp7a, wp7b,
  wp8a,
  wp9a, wp9b,
];
