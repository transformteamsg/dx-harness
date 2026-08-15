/**
 * axe-driver.mjs — the rendered check's Node half.
 *
 * Reads one job as JSON on stdin, runs one matrix cell against a page that is
 * ALREADY OPEN, and prints one JSON object on stdout. It owns no policy: the
 * rule-to-control map, the three buckets, the finding lines and the exit code
 * all live in `checks/rendered-check.py`, which spawns this file once per cell.
 *
 * Two hard constraints are enforced here rather than documented elsewhere:
 *
 *   1. It never boots the target app. No dev server, no static export, no
 *      jsdom, no `webServer` block. The app is already serving or there is no
 *      run.
 *   2. It never launches a browser. `chromium.connectOverCDP` attaches to the
 *      session the capture step already has open, takes that context's
 *      existing page, and hands it back. Launching one, or opening a page or
 *      a context of its own, is forbidden — `rendered-check.py`'s self-test
 *      reads this file with its comments stripped and fails if any of those
 *      calls appears in the code.
 *
 * It DRIVES the page rather than merely observing it — the fixed run shape
 * needs a viewport, a theme and a media emulation — so every mutation is read
 * back first and restored in a `finally`, including on the failure path. A
 * screenshot the capture step takes next must not be mislabeled evidence.
 *
 * It never interacts: no clicks, no hovers, no opening overlays. Anything
 * reachable only through interaction is out of scope by construction.
 */

import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
// The harness's own node_modules (plugins/dx-harness/package.json), never the
// checked repo's. `checks/rendered/` -> `checks/` -> the plugin root.
const HARNESS_ROOT = resolve(HERE, "..", "..");
const harnessRequire = createRequire(resolve(HARNESS_ROOT, "package.json"));

const ATTACH_TIMEOUT_MS = 30000;

/** Read the whole of stdin as text. */
async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

/** The served path, with its leading slash, for the finding line's file half. */
function routeOf(url) {
  try {
    return new URL(url).pathname || "/";
  } catch {
    return "/";
  }
}

/** The one JSON object this process prints, in its did-not-run form. */
function failure(job, message) {
  return {
    ok: false,
    error: message,
    url: null,
    route: null,
    cell: job && job.cell ? job.cell : null,
    viewport: null,
    axe_version: null,
    dark_supported: null,
    violations: [],
    incomplete: [],
    passes_count: 0,
    inapplicable: [],
    aria_rules: [],
    evaluation_findings: [],
    waived: [],
    restored: true,
    restore_error: null,
  };
}

// ── In-page helpers, all serialised as strings for page.evaluate ─────────────

/** A stable-enough CSS path for an element, used to name a waiver marker. */
const CSS_PATH_FN = `
  function cssPath(el) {
    if (el.id) return "#" + CSS.escape(el.id);
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && parts.length < 6) {
      let part = node.localName;
      const cls = (node.getAttribute("class") || "").trim().split(/\\s+/).filter(Boolean);
      if (cls.length) part += "." + cls.slice(0, 2).map(CSS.escape).join(".");
      const parent = node.parentElement;
      if (parent) {
        const sibs = Array.from(parent.children).filter((c) => c.localName === node.localName);
        if (sibs.length > 1) part += ":nth-of-type(" + (sibs.indexOf(node) + 1) + ")";
      }
      parts.unshift(part);
      if (node.id) { parts[0] = "#" + CSS.escape(node.id); break; }
      node = node.parentElement;
    }
    return parts.join(" > ");
  }
`;

/**
 * Does this product have a dark mode at all? Verify's own detection: a theme
 * layer keyed on a `.dark` class or a `[data-theme="dark"]` attribute. Where
 * there is none, the dark cells record N/A rather than a pass.
 */
const DARK_SUPPORT_JS = `(() => {
  const root = document.documentElement;
  if (root.classList.contains("dark") || root.getAttribute("data-theme") === "dark") return true;
  for (const sheet of Array.from(document.styleSheets)) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }   // cross-origin sheet
    if (!rules) continue;
    for (const rule of Array.from(rules)) {
      const text = rule.selectorText || rule.conditionText || "";
      if (/(^|[^\\w-])\\.dark([^\\w-]|$)/.test(text)) return true;
      if (text.includes('[data-theme="dark"]') || text.includes("[data-theme='dark']")) return true;
    }
  }
  return false;
})()`;

const READ_STATE_JS = `(() => ({
  scrollX: window.scrollX,
  scrollY: window.scrollY,
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
  darkClass: document.documentElement.classList.contains("dark"),
  themeAttr: document.documentElement.getAttribute("data-theme"),
  prefersDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
  prefersReduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
}))`;

/** Scroll to the document end in viewport-height steps, then back to the top. */
const SCROLL_JS = `(async () => {
  const step = window.innerHeight;
  let reached = 0;
  for (let i = 0; i < 200; i++) {
    const end = document.documentElement.scrollHeight - window.innerHeight;
    if (reached >= end) break;
    reached = Math.min(reached + step, end);
    window.scrollTo(0, reached);
    await new Promise((r) => setTimeout(r, 60));
  }
  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 60));
  return document.documentElement.scrollHeight;
})()`;

function applyThemeJs(theme) {
  return `(() => {
    const root = document.documentElement;
    if (${JSON.stringify(theme)} === "dark") {
      root.classList.add("dark");
      if (root.hasAttribute("data-theme")) root.setAttribute("data-theme", "dark");
    } else if (${JSON.stringify(theme)} === "light") {
      root.classList.remove("dark");
      if (root.hasAttribute("data-theme")) root.setAttribute("data-theme", "light");
    }
    return true;
  })()`;
}

function restoreThemeJs(prior) {
  return `(() => {
    const root = document.documentElement;
    if (${JSON.stringify(prior.darkClass)}) root.classList.add("dark");
    else root.classList.remove("dark");
    const attr = ${JSON.stringify(prior.themeAttr)};
    if (attr === null) root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", attr);
    window.scrollTo(${Number(prior.scrollX) || 0}, ${Number(prior.scrollY) || 0});
    return true;
  })()`;
}

/** Every `data-dx-waive` marker on the page, with its raw attribute value. */
function collectMarkersJs(attribute) {
  return `(() => {
    ${CSS_PATH_FN}
    return Array.from(document.querySelectorAll("[" + ${JSON.stringify(attribute)} + "]"))
      .map((el) => ({ selector: cssPath(el), value: el.getAttribute(${JSON.stringify(attribute)}) || "" }));
  })()`;
}

/**
 * For each axe node target, the markers whose subtree encloses it. A nested
 * marker's ids union with its enclosing marker's, which falls out of walking
 * every ancestor rather than stopping at the first.
 */
function markerMembershipJs(attribute, targets) {
  return `(() => {
    ${CSS_PATH_FN}
    const attribute = ${JSON.stringify(attribute)};
    const out = {};
    for (const entry of ${JSON.stringify(targets)}) {
      let el = null;
      try { el = document.querySelector(entry.selector); } catch { el = null; }
      const enclosing = [];
      let node = el;
      while (node) {
        if (node.nodeType === 1 && node.hasAttribute(attribute)) enclosing.push(cssPath(node));
        node = node.parentElement;
      }
      out[entry.key] = enclosing;
    }
    return out;
  })()`;
}

// ── The run ──────────────────────────────────────────────────────────────────

async function main() {
  let job;
  try {
    job = JSON.parse(await readStdin());
  } catch (err) {
    emit(failure(null, `job is not readable JSON: ${err.message}`));
    return;
  }

  let AxeBuilder;
  let axeCore;
  let chromium;
  try {
    AxeBuilder = harnessRequire("@axe-core/playwright").default ?? harnessRequire("@axe-core/playwright");
    axeCore = harnessRequire("axe-core");
    ({ chromium } = harnessRequire("playwright-core"));
  } catch (err) {
    emit(failure(job, `@axe-core/playwright is not provisioned in the harness — ${err.message}`));
    return;
  }

  if (!job.cdpUrl) {
    emit(failure(job, "no CDP endpoint: there is no open page to attach to"));
    return;
  }

  let browser = null;
  let page = null;
  let prior = null;
  let payload = null;
  let restored = true;
  let restoreError = null;

  try {
    browser = await chromium.connectOverCDP(job.cdpUrl, { timeout: ATTACH_TIMEOUT_MS });
    const contexts = browser.contexts();
    if (!contexts.length) throw new Error("the attached browser has no context");
    const pages = contexts[0].pages();
    if (!pages.length) throw new Error("the attached context has no open page");
    page = pages[0];

    prior = await page.evaluate(READ_STATE_JS);

    // The capture step navigates; this driver only follows it to the page it
    // was asked about, and only when the session is somewhere else.
    if (job.url) {
      const here = page.url().split("#")[0];
      const want = String(job.url).split("#")[0];
      if (here !== want) await page.goto(job.url, { waitUntil: "load" });
    }

    if (job.viewport) {
      await page.setViewportSize({ width: job.viewport.width, height: job.viewport.height });
    }
    const emulation = {};
    if (job.theme === "dark" || job.theme === "light") emulation.colorScheme = job.theme;
    if (job.media && job.media.reducedMotion) emulation.reducedMotion = job.media.reducedMotion;
    if (Object.keys(emulation).length) await page.emulateMedia(emulation);
    if (job.theme === "dark" || job.theme === "light") {
      await page.evaluate(applyThemeJs(job.theme));
    }

    const darkSupported = await page.evaluate(DARK_SUPPORT_JS);

    await page.evaluate(SCROLL_JS);

    const ariaRules = axeCore
      .getRules()
      .map((r) => r.ruleId)
      .filter((id) => id.startsWith(job.ariaPrefix || "aria-"));

    // Named rules only — the mapped set plus the aria suite resolved from the
    // installed axe. Never a `runOnly` tag, which silently drops mapped rules.
    const ruleIds = Array.from(new Set([...(job.axeRules || []), ...ariaRules]));
    const forceEnabled = {};
    for (const id of job.forceEnable || []) forceEnabled[id] = { enabled: true };

    // The reduced-motion cell decides A11Y-5 only, so it skips axe rather than
    // reporting every other control's findings a second time.
    const results = job.runAxe === false
      ? { violations: [], incomplete: [], passes: [], inapplicable: [], testEngine: null }
      : await new AxeBuilder({ page })
          .options({ runOnly: { type: "rule", values: ruleIds }, rules: forceEnabled })
          .analyze();

    const markers = await page.evaluate(collectMarkersJs(job.waiveAttribute || "data-dx-waive"));

    const nodeTargets = [];
    const keyOf = (node) => JSON.stringify(node.target);
    for (const bucket of [results.violations, results.incomplete]) {
      for (const rule of bucket) {
        for (const node of rule.nodes) {
          const target = Array.isArray(node.target) ? node.target[node.target.length - 1] : node.target;
          nodeTargets.push({ key: keyOf(node), selector: String(target) });
        }
      }
    }
    let membership = {};
    if (markers.length && nodeTargets.length) {
      membership = await page.evaluate(
        markerMembershipJs(job.waiveAttribute || "data-dx-waive", nodeTargets),
      );
    }
    const waived = markers.map((m) => ({
      selector: m.selector,
      value: m.value,
      contains: Object.entries(membership)
        .filter(([, enclosing]) => enclosing.includes(m.selector))
        .map(([key]) => key),
    }));

    const evaluationFindings = [];
    for (const evaluation of job.evaluations || []) {
      let found = [];
      try {
        found = await page.evaluate(evaluation.js);
      } catch (err) {
        evaluationFindings.push({
          rule: evaluation.id,
          selector: null,
          message: `page evaluation failed: ${err.message}`,
          failed: true,
        });
        continue;
      }
      for (const item of found || []) {
        evaluationFindings.push({
          rule: evaluation.id,
          selector: item.selector || null,
          message: item.message || "",
          failed: false,
        });
      }
    }

    const applied = await page.evaluate(
      "({width: window.innerWidth, height: window.innerHeight})",
    );

    payload = {
      ok: true,
      error: null,
      url: page.url(),
      route: routeOf(page.url()),
      cell: job.cell,
      viewport: applied,
      axe_version: results.testEngine ? results.testEngine.version : axeCore.version,
      dark_supported: darkSupported,
      violations: results.violations,
      incomplete: results.incomplete,
      passes_count: results.passes.reduce((n, r) => n + r.nodes.length, 0),
      inapplicable: results.inapplicable.map((r) => r.id),
      aria_rules: ariaRules,
      evaluation_findings: evaluationFindings,
      waived,
      restored: true,
      restore_error: null,
    };
  } catch (err) {
    payload = failure(job, err && err.message ? err.message : String(err));
  } finally {
    // Hand the session back as it was found, including on the failure path.
    if (page && prior) {
      try {
        await page.setViewportSize({ width: prior.innerWidth, height: prior.innerHeight });
        await page.emulateMedia({ colorScheme: null, reducedMotion: null });
        const now = await page.evaluate(
          `({prefersDark: matchMedia("(prefers-color-scheme: dark)").matches,` +
            ` prefersReduced: matchMedia("(prefers-reduced-motion: reduce)").matches})`,
        );
        const fix = {};
        if (now.prefersDark !== prior.prefersDark) fix.colorScheme = prior.prefersDark ? "dark" : "light";
        if (now.prefersReduced !== prior.prefersReduced) {
          fix.reducedMotion = prior.prefersReduced ? "reduce" : "no-preference";
        }
        if (Object.keys(fix).length) await page.emulateMedia(fix);
        await page.evaluate(restoreThemeJs(prior));
      } catch (err) {
        restored = false;
        restoreError = err && err.message ? err.message : String(err);
      }
    }
    if (browser) {
      // A CDP-connected browser is not ours to close: this detaches Playwright
      // and leaves the capture session running.
      try {
        await browser.close();
      } catch {
        /* the session outlives this process either way */
      }
    }
    if (payload === null) payload = failure(job, "the driver produced no result");
    payload.restored = restored;
    payload.restore_error = restoreError;
    emit(payload);
  }
}

/** Exactly one JSON object per invocation, on stdout, always. */
function emit(payload) {
  process.stdout.write(JSON.stringify(payload) + "\n");
}

main();
