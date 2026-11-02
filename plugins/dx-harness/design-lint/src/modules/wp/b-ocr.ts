import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { atElement } from "../../rendered.ts";
import type { Candidate, ElementRef, RuleModule } from "../../types.ts";

/* WP-15a: optical character recognition (OCR) on the images of a rendered page.
   The OCR engine is tesseract.js, which runs Tesseract as WebAssembly. The rule
   file says why. The language data is read from disk, never from the network:
   from DESIGN_LINT_OCR_DATA when it is set, or else from the package
   @tesseract.js-data/<language>. OCR that cannot start, or a language with no
   data, is reported as "not run", as PR-6b reports an engine that did not start.
   The finding carries notRun, which blocks the exit code although the rule is
   tier L2. */

const require_ = createRequire(import.meta.url);
const VIEWPORT = { width: 1280, height: 800 };
/* The data that the packages ship for the LSTM engine, in integer form. */
const DATA_VERSION = "4.0.0_best_int";
/* An image smaller than this, in CSS pixels, cannot hold a legible word. */
const MIN_WIDTH = 24;
const MIN_HEIGHT = 8;
/* Tesseract's engine mode 1: the LSTM engine only, which the data supports. */
const LSTM_ONLY = 1;

interface Image {
  index: number;
  element: ElementRef;
  /* A CSS background image. Its element's own text is hidden before the screenshot. */
  background: boolean;
}

/* Runs in the page. It marks each visible image that no exemptSelector covers,
   and returns them. An image counts as exempt when it, or an element around it,
   matches the selector. */
function findImages(arg: { exempt: string; minWidth: number; minHeight: number }): Image[] {
  const out: Image[] = [];
  const shown = (el: any) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return cs.display !== "none" && cs.visibility !== "hidden" && Number(cs.opacity) > 0 && r.width >= arg.minWidth && r.height >= arg.minHeight;
  };
  const exempt = (el: any) => arg.exempt !== "" && el.closest(arg.exempt) !== null;
  const add = (el: any, background: boolean) => {
    if (!shown(el) || exempt(el)) return;
    el.setAttribute("data-dxl-ocr", String(out.length));
    out.push({ index: out.length, element: window.__designLint.element(el), background });
  };
  for (const el of Array.from(document.querySelectorAll("img, svg image")) as any[]) {
    if (el.tagName.toLowerCase() === "img" && !(el.complete && el.naturalWidth > 0)) continue;
    add(el, false);
  }
  for (const el of Array.from(document.body.querySelectorAll("*")) as any[]) {
    if (/url\(/.test(getComputedStyle(el).backgroundImage)) add(el, true);
  }
  return out;
}

/* Runs in the page. It hides the text and the children of a background image,
   so that OCR reads the image and not the real text over it, or restores them. */
function hideContent(arg: { index: number; hide: boolean }): void {
  const el = document.querySelector(`[data-dxl-ocr="${arg.index}"]`) as any;
  if (!el) return;
  const targets = [el, ...Array.from(el.querySelectorAll("*"))] as any[];
  for (const t of targets) {
    if (arg.hide) {
      t.setAttribute("data-dxl-style", t.getAttribute("style") ?? "");
      t.style.setProperty("color", "transparent", "important");
      t.style.setProperty("text-shadow", "none", "important");
      if (t !== el) t.style.setProperty("visibility", "hidden", "important");
    } else {
      t.setAttribute("style", t.getAttribute("data-dxl-style") ?? "");
      t.removeAttribute("data-dxl-style");
    }
  }
}

/* The file of the language data for each language, or null when it is not installed. */
function languageFile(language: string): string | null {
  const dir = process.env.DESIGN_LINT_OCR_DATA;
  let file: string;
  if (dir) {
    file = path.join(dir, `${language}.traineddata.gz`);
  } else {
    try {
      const pkg = path.dirname(require_.resolve(`@tesseract.js-data/${language}/package.json`));
      file = path.join(pkg, DATA_VERSION, `${language}.traineddata.gz`);
    } catch {
      return null;
    }
  }
  return fs.existsSync(file) ? file : null;
}

/* Tesseract reads every language from one directory. When the languages come
   from different packages, their files are copied into a temporary directory. */
function dataDirectory(files: string[]): string {
  const dirs = [...new Set(files.map((f) => path.dirname(f)))];
  if (dirs.length === 1) return dirs[0];
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-ocr-"));
  for (const f of files) fs.copyFileSync(f, path.join(dir, path.basename(f)));
  return dir;
}

interface OcrWorker {
  read(png: Uint8Array): Promise<{ text: string; confidence: number }[]>;
  stop(): Promise<void>;
}

/* Starts OCR, or throws an Error that says why it did not start. */
async function startOcr(languages: string[]): Promise<OcrWorker> {
  const files = languages.map((l) => [l, languageFile(l)] as const);
  const missing = files.filter(([, f]) => f === null).map(([l]) => l);
  if (missing.length > 0) {
    const where = process.env.DESIGN_LINT_OCR_DATA ? `in ${process.env.DESIGN_LINT_OCR_DATA}` : "installed";
    throw new Error(
      `no language data ${where} for ${missing.join(", ")}. Install ${missing.map((l) => `@tesseract.js-data/${l}`).join(", ")}, or set DESIGN_LINT_OCR_DATA to a directory that holds ${missing.map((l) => `${l}.traineddata.gz`).join(", ")}`,
    );
  }
  let tesseract: typeof import("tesseract.js");
  try {
    tesseract = await import("tesseract.js");
  } catch {
    throw new Error("tesseract.js is not installed. Run pnpm install in the design-lint package");
  }
  const langPath = dataDirectory(files.map(([, f]) => f!));
  /* The worker starts with no language, so a fault in the data rejects
     reinitialize below, which reports it. Without an errorHandler, the worker
     also throws the same fault where no caller can catch it. */
  const worker = await tesseract.createWorker([], LSTM_ONLY, {
    langPath,
    gzip: true,
    cacheMethod: "none",
    errorHandler: () => undefined,
  });
  try {
    await worker.reinitialize(languages.join("+"), LSTM_ONLY);
  } catch (error) {
    await worker.terminate();
    throw new Error(String(error instanceof Error ? error.message : error).replace(/^Error: /, ""));
  }
  return {
    async read(png) {
      const { data } = await worker.recognize(Buffer.from(png), {}, { blocks: true, text: false });
      return (data.blocks ?? []).flatMap((b) => b.paragraphs.flatMap((p) => p.lines.flatMap((l) => l.words))).map((w) => ({ text: w.text, confidence: w.confidence }));
    },
    stop: async () => {
      await worker.terminate();
    },
  };
}

interface Read {
  words: string[];
}

export const wp15a: RuleModule = {
  code: "WP-15a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const pages = params.pages as string[];
    let ocr: OcrWorker;
    try {
      ocr = await startOcr(params.ocrLanguages as string[]);
    } catch (error) {
      const why = (error instanceof Error ? error.message : String(error)).split("\n")[0];
      out.push({ file: pages[0], line: 0, column: 0, notRun: true, data: { message: `Not run: OCR did not start (${why}). A page that did not run does not pass.` } });
      return out;
    }
    const minConfidence = Number(params.minConfidence);
    try {
      for (const pagePath of pages) {
        /* A page of its own, because the check hides the text of a background image. */
        const page = await rendered.open(pagePath, VIEWPORT, { fresh: true });
        const images = await page.evaluate(findImages, { exempt: String(params.exemptSelector), minWidth: MIN_WIDTH, minHeight: MIN_HEIGHT });
        for (const image of images) {
          if (image.background) await page.evaluate(hideContent, { index: image.index, hide: true });
          const png = await page.screenshot(`[data-dxl-ocr="${image.index}"]`);
          if (image.background) await page.evaluate(hideContent, { index: image.index, hide: false });
          /* A word counts when OCR is sure of it and it holds a letter or a digit. Noise in a photo reads as marks of low confidence. */
          const words = (await ocr.read(png)).filter((w) => w.confidence >= minConfidence && /[\p{L}\p{N}]/u.test(w.text)).map((w) => w.text);
          if (words.length > 0) out.push(atElement(pagePath, image.element, { words } satisfies Read));
        }
        await page.close();
      }
    } finally {
      await ocr.stop();
    }
    return out;
  },

  decide(candidate, params) {
    if (candidate.notRun) return (candidate.data as { message: string }).message;
    const { words } = candidate.data as Read;
    if (words.length < Number(params.minWords)) return null;
    const text = words.join(" ");
    const shown = text.length > 80 ? `${text.slice(0, 77)}...` : text;
    return `The image holds ${words.length} words of text: "${shown}". Use real text styled with CSS. If the image is a logo or is essential, mark it with exemptSelector.`;
  },
};
