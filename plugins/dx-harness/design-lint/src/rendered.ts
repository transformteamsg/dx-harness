import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright-core";
import type { Browser, BrowserContext } from "playwright-core";
import type { Candidate, ElementRef, OpenOptions, RenderedPage, RenderedSession } from "./types.ts";

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

/* A page path maps to a file: "/" to index.html, "/x" to x, x/index.html, or x.html. */
function resolveFile(root: string, urlPath: string): string | null {
  const clean = path.normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const base = path.join(root, clean);
  const candidates = [base, path.join(base, "index.html"), `${base}.html`];
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) ?? null;
}

function serve(root: string): Promise<{ server: http.Server; baseUrl: string }> {
  const server = http.createServer((req, res) => {
    const file = resolveFile(root, req.url ?? "/");
    if (!file) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

/* Runs in each page before its own scripts. It gives a rule function
   window.__designLint.element(el), which returns the ElementRef of el: a name
   that a person can find in the page, and its box in page coordinates.

   The name is the tag with its id when the id is unique, or the tag with up to
   two classes and the role. An element with no id, class, or role, or a name
   that matches more than one element, also gets its order on the page among
   the elements that match the name. */
function installElementNames(): void {
  const ordinal = (n: number) => {
    const teen = n % 100 >= 11 && n % 100 <= 13;
    const suffix = teen ? "th" : (["th", "st", "nd", "rd"][n % 10] ?? "th");
    return `${n}${suffix}`;
  };
  const UNIQUE = ["html", "head", "body"];
  const element = (el: any) => {
    const tag = String(el.tagName).toLowerCase();
    const r = el.getBoundingClientRect();
    const box = {
      top: Math.round(r.top + window.scrollY),
      left: Math.round(r.left + window.scrollX),
      width: Math.round(r.width),
      height: Math.round(r.height),
    };
    const id = el.getAttribute("id");
    if (id && document.querySelectorAll(`#${window.CSS.escape(id)}`).length === 1) return { name: `${tag}#${id}`, ...box };
    const classes = Array.from(el.classList as Iterable<string>).slice(0, 2);
    const role = el.getAttribute("role");
    const name = `${tag}${classes.map((c) => `.${c}`).join("")}${role ? `[role=${role}]` : ""}`;
    const selector = `${tag}${classes.map((c) => `.${window.CSS.escape(c)}`).join("")}${role ? `[role="${window.CSS.escape(role)}"]` : ""}`;
    const bare = classes.length === 0 && !role;
    if (bare && UNIQUE.includes(tag)) return { name, ...box };
    const same = Array.from(document.querySelectorAll(selector));
    if (!bare && same.length <= 1) return { name, ...box };
    return { name: `${name} (${ordinal(same.indexOf(el) + 1)} on the page)`, ...box };
  };
  Object.defineProperty(window, "__designLint", { value: { element }, configurable: true });
}

/* A candidate at an element, from the ElementRef that a rule function returned.
   The line and the column carry the box position, so a caller that reads only
   those still sorts the findings in page order. */
export function atElement(file: string, element: ElementRef, data?: unknown): Candidate {
  return { file, line: element.top, column: element.left, element, data };
}

/* The order: an explicit executable, the Chromium that Playwright pins, then an
   installed Chrome. CI installs the pinned build with `playwright-core install
   chromium`. */
export async function launchBrowser(): Promise<Browser> {
  const executablePath = process.env.DESIGN_LINT_CHROMIUM;
  if (executablePath) return chromium.launch({ executablePath });
  try {
    return await chromium.launch();
  } catch {
    try {
      return await chromium.launch({ channel: "chrome" });
    } catch {
      throw new Error(
        "no browser found. Run `playwright-core install chromium`, or set DESIGN_LINT_CHROMIUM to a Chromium executable",
      );
    }
  }
}

export interface Session extends RenderedSession {
  close(): Promise<void>;
}

/* A session serves one directory. It reuses a page that a rule already opened at
   the same path and size, so the rules of a run load each page once for each
   size. A rule only reads a page, so sharing is safe. When the caller passes a
   browser, the session leaves it open. */
export async function startSession(
  root: string,
  waitUntil: "load" | "networkidle" = "networkidle",
  shared?: Browser,
): Promise<Session> {
  const browser = shared ?? (await launchBrowser());
  const { server, baseUrl } = await serve(root);
  /* One context for each viewport size, shared by every page at that size. */
  const contexts = new Map<string, BrowserContext>();
  const pages = new Map<string, RenderedPage>();
  return {
    async open(pagePath, viewport, options?: OpenOptions): Promise<RenderedPage> {
      const key = `${viewport.width}x${viewport.height}`;
      const cacheKey = `${key}${options?.reducedMotion ? " reduce" : ""} ${pagePath}`;
      const cached = options?.fresh ? undefined : pages.get(cacheKey);
      if (cached) return cached;
      let context = contexts.get(key);
      if (!context) {
        context = await browser.newContext({ viewport });
        await context.addInitScript(installElementNames);
        contexts.set(key, context);
      }
      const page = await context.newPage();
      if (options?.reducedMotion) await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${baseUrl}${pagePath}`, { waitUntil });
      const opened: RenderedPage = {
        evaluate: (fn, arg) => page.evaluate(fn as (a: unknown) => unknown, arg) as Promise<never>,
        inject: async (script) => {
          await page.addScriptTag({ content: script });
        },
        press: (k) => page.keyboard.press(k),
        hover: (selector) => page.hover(selector),
        click: (selector) => page.click(selector),
        focus: (selector) => page.focus(selector),
        screenshot: async (selector) => new Uint8Array(selector ? await page.locator(selector).first().screenshot() : await page.screenshot()),
        close: async () => {
          if (options?.fresh) await page.close();
        },
      };
      if (!options?.fresh) pages.set(cacheKey, opened);
      return opened;
    },
    async close() {
      for (const c of contexts.values()) await c.close();
      if (!shared) await browser.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}

/* True when a browser can start. The rendered tests skip when it cannot. */
export async function browserAvailable(): Promise<boolean> {
  try {
    const browser = await launchBrowser();
    await browser.close();
    return true;
  } catch {
    return false;
  }
}
