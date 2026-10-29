import type { RenderedSession } from "../../types.ts";

/* The visible English copy of rendered pages, shared by the CNT rules. Text in
   code, scripts, and templates is not copy. */

const VIEWPORT = { width: 1280, height: 800 };

export interface TextBlock {
  page: string;
  text: string;
  top: number;
  left: number;
}

export interface ScanOptions {
  /* Leave out the text of links. */
  skipLinks?: boolean;
  /* Read each element that matches, rather than each block of text. */
  selector?: string;
}

/* Runs in the page. With a selector, returns the text of each element that
   matches. Without one, joins each text node to the nearest ancestor that is
   not inline, so that a sentence across inline elements stays whole. */
function scan(opts: ScanOptions) {
  const skip = "script, style, noscript, template, code, pre, kbd, samp";
  const english = (el: any) => {
    const lang = el.closest("[lang]")?.getAttribute("lang") ?? "";
    return lang === "" || /^en\b/i.test(lang);
  };
  const box = (el: any) => {
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top), left: Math.round(r.left) };
  };
  const out: { text: string; top: number; left: number }[] = [];
  if (opts.selector) {
    for (const el of Array.from(document.querySelectorAll(opts.selector)) as any[]) {
      if (el.closest(skip) || !el.checkVisibility() || !english(el)) continue;
      const text = (el.innerText ?? "").replace(/\s+/g, " ").trim();
      if (text !== "") out.push({ text, ...box(el) });
    }
    return out;
  }
  const blocks = new Map<any, string>();
  const walker = document.createTreeWalker(document.body, 4);
  let node: any;
  while ((node = walker.nextNode())) {
    const el = node.parentElement;
    if (!el || el.closest(skip)) continue;
    let block = el;
    while (block !== document.body && getComputedStyle(block).display.startsWith("inline")) block = block.parentElement;
    const visible = el.checkVisibility() && english(el) && !(opts.skipLinks && el.closest("a[href]"));
    /* A left-out node still separates the words on each side of it. */
    blocks.set(block, (blocks.get(block) ?? "") + (visible ? node.textContent : " "));
  }
  for (const [block, raw] of blocks) {
    const text = raw.replace(/\s+/g, " ").trim();
    if (text !== "") out.push({ text, ...box(block) });
  }
  return out;
}

export async function visibleText(rendered: RenderedSession, pages: string[], opts: ScanOptions = {}): Promise<TextBlock[]> {
  const out: TextBlock[] = [];
  for (const page of pages) {
    const open = await rendered.open(page, VIEWPORT);
    for (const b of await open.evaluate(scan, opts)) out.push({ page, ...b });
  }
  return out;
}

/* A pattern that matches any of the words or phrases as a whole word, in any case. */
export function wordsPattern(words: string[], flags = "gi"): RegExp {
  const alternatives = words.map((w) => w.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"));
  return new RegExp(`\\b(?:${alternatives.join("|")})\\b`, flags);
}
