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
  /* A new lane of the session. See startSession. */
  lane(): Lane;
  close(): Promise<void>;
}

export interface Lane extends RenderedSession {
  /* Closes the pages that the lane opened with fresh: true. The runner calls it
     after each rule. */
  release(): Promise<void>;
  close(): Promise<void>;
}

type Viewport = { width: number; height: number };

function startLane(browser: Browser, baseUrl: string, waitUntil: "load" | "networkidle"): Lane {
  /* One context for each viewport size, shared by every shared page at that size. */
  const contexts = new Map<string, Promise<BrowserContext>>();
  const pages = new Map<string, Promise<RenderedPage>>();
  /* A fresh page has a context of its own, so its storage and cookies reach no other page. */
  const fresh: BrowserContext[] = [];
  const newContext = async (viewport: Viewport) => {
    const context = await browser.newContext({ viewport });
    await context.addInitScript(installElementNames);
    return context;
  };
  const sharedContext = (viewport: Viewport, key: string) => {
    let context = contexts.get(key);
    if (!context) {
      context = newContext(viewport);
      contexts.set(key, context);
    }
    return context;
  };
  const load = async (pagePath: string, viewport: Viewport, key: string, options?: OpenOptions): Promise<RenderedPage> => {
    let context: BrowserContext;
    if (options?.fresh) {
      context = await newContext(viewport);
      fresh.push(context);
    } else context = await sharedContext(viewport, key);
    const page = await context.newPage();
    if (options?.reducedMotion) await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${baseUrl}${pagePath}`, { waitUntil });
    return {
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
        if (!options?.fresh) return;
        fresh.splice(fresh.indexOf(context), 1);
        await context.close();
      },
    };
  };
  return {
    open(pagePath, viewport, options?: OpenOptions): Promise<RenderedPage> {
      const key = `${viewport.width}x${viewport.height}`;
      if (options?.fresh) return load(pagePath, viewport, key, options);
      const cacheKey = `${key}${options?.reducedMotion ? " reduce" : ""} ${pagePath}`;
      let cached = pages.get(cacheKey);
      if (!cached) {
        cached = load(pagePath, viewport, key, options);
        pages.set(cacheKey, cached);
      }
      return cached;
    },
    async release() {
      await Promise.all(fresh.splice(0).map((c) => c.close()));
    },
    async close() {
      await this.release();
      await Promise.all([...contexts.values()].map(async (c) => (await c).close()));
    },
  };
}

/* A session serves one directory. Its rules run in lanes, at the same time,
   in one browser. Each lane has its own contexts and its own shared pages,
   because two rules must not run on one page at the same time. A lane reuses a
   page that one of its rules already opened at the same path and size, so the
   rules of a lane load each page once for each size. A rule only reads a shared
   page, so sharing in a lane is safe. The session opens pages in a lane of its
   own. When the caller passes a browser, the session leaves it open. */
export async function startSession(
  root: string,
  waitUntil: "load" | "networkidle" = "networkidle",
  shared?: Browser,
): Promise<Session> {
  const browser = shared ?? (await launchBrowser());
  const { server, baseUrl } = await serve(root);
  const own = startLane(browser, baseUrl, waitUntil);
  const lanes: Lane[] = [own];
  return {
    open: (pagePath, viewport, options) => own.open(pagePath, viewport, options),
    lane() {
      const lane = startLane(browser, baseUrl, waitUntil);
      lanes.push(lane);
      return lane;
    },
    async close() {
      await Promise.all(lanes.map((lane) => lane.close()));
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
