import fs from "node:fs";
import path from "node:path";
import { axeRule } from "../../engines/axe.ts";
import { combineRules } from "../../engines/combine.ts";
import { jsxRule } from "../../engines/jsx-a11y.ts";
import { isHtml } from "../../files.ts";
import { elements } from "../../html.ts";
import type { Candidate, RuleModule } from "../../types.ts";

/* The language rules of WU: WU-1a, WU-1b, WU-1d, WU-2a, and WU-2c. */

export const WU_AXE_IDS: Record<string, string[]> = {
  "WU-1b": ["html-has-lang", "html-lang-valid", "html-xml-lang-mismatch"],
  "WU-2a": ["valid-lang"],
};
export const WU_JSX_IDS: Record<string, string[]> = {
  "WU-1a": ["html-has-lang", "lang"],
};

/* The shape of a language tag by BCP 47: a language of two or three letters,
   then optional script, region, variant, extension, and private-use subtags,
   or a private-use tag. The rule does not look the subtags up in the IANA
   registry, so a well-formed tag with an unknown language passes. WU-1b, where
   axe checks the language, catches that case on the rendered page. */
const BCP47 =
  /^(?:[a-z]{2,3}(?:-[a-z]{3}){0,3}(?:-[a-z]{4})?(?:-(?:[a-z]{2}|\d{3}))?(?:-(?:[a-z0-9]{5,8}|\d[a-z0-9]{3}))*(?:-[a-wy-z0-9](?:-[a-z0-9]{2,8})+)*(?:-x(?:-[a-z0-9]{1,8})+)?|x(?:-[a-z0-9]{1,8})+)$/i;
export const validLanguageTag = (tag: string) => BCP47.test(tag.trim());

/* WU-1a on plain HTML. The JSX and TSX part is jsx-a11y html-has-lang and lang. */
const wu1aHtml: RuleModule = {
  code: "WU-1a",
  surface: "source",

  locate({ files }) {
    const out: Candidate[] = [];
    for (const file of files.filter(isHtml)) {
      const html = elements(fs.readFileSync(file, "utf8")).find((e) => e.tag === "html");
      if (!html) continue;
      const lang = html.attrs.lang;
      if (lang === undefined) out.push({ file, line: html.line, column: html.column, data: { message: 'The <html> element has no lang attribute. Add one, for example lang="en-SG".' } });
      else if (!validLanguageTag(lang)) out.push({ file, line: html.line, column: html.column, data: { message: `The lang value "${lang}" is not a valid BCP 47 language tag.` } });
    }
    return out;
  },

  decide(candidate) {
    return (candidate.data as { message: string }).message;
  },
};

export const wu1a = combineRules("WU-1a", [wu1aHtml, jsxRule("WU-1a", WU_JSX_IDS["WU-1a"])]);
export const wu1b = axeRule("WU-1b", WU_AXE_IDS["WU-1b"]);
export const wu2a = axeRule("WU-2a", WU_AXE_IDS["WU-2a"]);

/* WU-1d: each PDF file has a /Lang entry in its catalogue. There is no PDF
   library in the project, so the module reads the bytes. It finds the catalogue
   object (`/Type /Catalog`) in the plain text of the file and looks for `/Lang`
   in it. A catalogue that sits inside a compressed object stream, as in many
   files from PDF 1.5 on, cannot be read this way. The module reports that file
   with a message that says so, because it cannot show that the language is set. */
function globToRegExp(glob: string): RegExp {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      re += glob[i + 2] === "/" ? "(?:.*/)?" : ".*";
      i += glob[i + 2] === "/" ? 2 : 1;
    } else if (c === "*") re += "[^/]*";
    else if (c === "?") re += "[^/]";
    else re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${re}$`);
}

export const wu1d: RuleModule = {
  code: "WU-1d",
  surface: "project",

  locate({ files, root, params }) {
    const globs = (Array.isArray(params.pdfFiles) ? (params.pdfFiles as string[]) : [String(params.pdfFiles)]).map(globToRegExp);
    const out: Candidate[] = [];
    for (const file of files) {
      const rel = path.relative(root, file).split(path.sep).join("/");
      if (!globs.some((g) => g.test(rel))) continue;
      const text = fs.readFileSync(file).toString("latin1");
      let state: "missing" | "empty" | "ok" | "unreadable" = "unreadable";
      for (const m of text.matchAll(/\/Type\s*\/Catalog\b/g)) {
        const start = text.lastIndexOf("obj", m.index);
        const end = text.indexOf("endobj", m.index);
        const dict = text.slice(start, end === -1 ? undefined : end);
        const lang = /\/Lang\s*(?:\(([^)]*)\)|<([0-9A-Fa-f\s]*)>)/.exec(dict);
        state = !lang ? "missing" : (lang[1] ?? lang[2] ?? "").trim() === "" ? "empty" : "ok";
        break;
      }
      if (state !== "ok") out.push({ file, line: 1, column: 1, data: { state } });
    }
    return out;
  },

  decide(candidate) {
    const { state } = candidate.data as { state: string };
    if (state === "unreadable") return "The catalogue of this PDF file is not readable as plain text, so the module cannot show a /Lang entry. Check the language in a PDF tool.";
    return state === "empty" ? "The /Lang entry in the PDF catalogue is empty. Set the document language." : "The PDF catalogue has no /Lang entry. Set the document language when you export the file.";
  },
};

/* WU-2c: a text block in another language has a lang attribute. The detector is
   a script heuristic: it counts the letters of each Unicode script in a block and
   takes the script with the most. It cannot tell two languages that share a
   script apart, such as English and Malay, or French and German. It finds a
   passage whose script differs from the script of the page language, for example
   Chinese text on an English page. */
const VIEWPORT = { width: 1280, height: 800 };

interface Block {
  top: number;
  left: number;
  script: string;
  pageLang: string;
}

export const wu2c: RuleModule = {
  code: "WU-2c",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const blocks = await page.evaluate((minCharacters: number): Block[] => {
        const SCRIPTS: Record<string, RegExp> = {
          Latin: /\p{Script=Latin}/u,
          Han: /\p{Script=Han}/u,
          Hiragana: /\p{Script=Hiragana}/u,
          Katakana: /\p{Script=Katakana}/u,
          Hangul: /\p{Script=Hangul}/u,
          Arabic: /\p{Script=Arabic}/u,
          Hebrew: /\p{Script=Hebrew}/u,
          Cyrillic: /\p{Script=Cyrillic}/u,
          Greek: /\p{Script=Greek}/u,
          Devanagari: /\p{Script=Devanagari}/u,
          Thai: /\p{Script=Thai}/u,
          Tamil: /\p{Script=Tamil}/u,
          Bengali: /\p{Script=Bengali}/u,
        };
        const LATIN = "en ms id fr de es pt it nl vi tl sv da no fi pl tr cs ro hu ca".split(" ");
        const EXPECTED: Record<string, string[]> = {
          zh: ["Han"], ja: ["Han", "Hiragana", "Katakana"], ko: ["Hangul", "Han"], ta: ["Tamil"], hi: ["Devanagari"],
          ar: ["Arabic"], he: ["Hebrew"], ru: ["Cyrillic"], uk: ["Cyrillic"], bg: ["Cyrillic"], el: ["Greek"], th: ["Thai"], bn: ["Bengali"],
        };
        for (const l of LATIN) EXPECTED[l] = ["Latin"];
        const pageLang = (document.documentElement.getAttribute("lang") ?? "").toLowerCase().split("-")[0];
        const expected = EXPECTED[pageLang];
        if (!expected) return [];
        const selector = "p, li, dd, dt, td, th, blockquote, figcaption, h1, h2, h3, h4, h5, h6, div";
        const found: Block[] = [];
        for (const el of Array.from(document.querySelectorAll(selector)) as any[]) {
          if (el.querySelector(selector)) continue;
          if (el.closest("script, style, noscript, code, pre")) continue;
          const tagged = el.closest("[lang]");
          if (tagged && tagged !== document.documentElement) continue;
          if (el.getClientRects().length === 0) continue;
          const counts: Record<string, number> = {};
          let letters = 0;
          for (const ch of Array.from(String(el.textContent ?? ""))) {
            if (!/\p{L}/u.test(ch)) continue;
            letters++;
            for (const [name, re] of Object.entries(SCRIPTS)) {
              if (re.test(ch)) {
                counts[name] = (counts[name] ?? 0) + 1;
                break;
              }
            }
          }
          if (letters < minCharacters) continue;
          const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
          if (!top || expected.includes(top[0])) continue;
          const r = el.getBoundingClientRect();
          found.push({ top: Math.round(r.top), left: Math.round(r.left), script: top[0], pageLang });
        }
        return found;
      }, params.minCharacters as number);
      for (const b of blocks) out.push({ file: pagePath, line: b.top, column: b.left, data: b });
    }
    return out;
  },

  decide(candidate) {
    const b = candidate.data as Block;
    return `This text block is mostly ${b.script} script, but the page language is "${b.pageLang}" and no lang attribute covers it. Add lang to the element, or confirm that the text is a name or a technical term.`;
  },
};
