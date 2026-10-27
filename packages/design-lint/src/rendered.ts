import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright-core";
import type { Browser, BrowserContext } from "playwright-core";
import type { OpenOptions, RenderedPage, RenderedSession } from "./types.ts";

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
      const cached = options?.fresh ? undefined : pages.get(`${key} ${pagePath}`);
      if (cached) return cached;
      let context = contexts.get(key);
      if (!context) {
        context = await browser.newContext({ viewport });
        contexts.set(key, context);
      }
      const page = await context.newPage();
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
      };
      if (!options?.fresh) pages.set(`${key} ${pagePath}`, opened);
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
