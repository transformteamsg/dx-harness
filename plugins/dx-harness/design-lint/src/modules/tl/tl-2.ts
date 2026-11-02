import crypto from "node:crypto";
import fs from "node:fs";
import type { Candidate, RuleModule } from "../../types.ts";
import { rel, VIEWPORT } from "./shared.ts";

/* TL-2: the logo. TL-2a checks position and link, TL-2b checks rendering, and
   TL-2d checks the file hash. */

interface Pos {
  top: number;
  left: number;
}

export const tl2a: RuleModule = {
  code: "TL-2a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const data = await page.evaluate(
        (arg: { sel: string; home: string; half: string }) => {
          const el = document.querySelector(arg.sel);
          if (!el) return { found: false, top: 0, left: 0, inHalf: false, linkPath: null as string | null };
          const norm = (p: string) => p.replace(/index\.html$/, "");
          const r = el.getBoundingClientRect();
          const a = el.closest("a[href]");
          const centre = r.left + r.width / 2;
          const half = arg.half === "right" ? centre >= window.innerWidth / 2 : centre < window.innerWidth / 2;
          return {
            found: true,
            top: Math.round(r.top + window.scrollY),
            left: Math.round(r.left),
            inHalf: half,
            linkPath: a ? norm(new URL(a.getAttribute("href"), window.location.href).pathname) : null,
          };
        },
        { sel: String(params.logoSelector), home: String(params.homepagePath), half: String(params.logoHalf) },
      );
      out.push({ file: pagePath, line: data.top, column: data.left, data });
    }
    return out;
  },

  decide(candidate, params) {
    const d = candidate.data as { found: boolean; top: number; inHalf: boolean; linkPath: string | null };
    if (!d.found) return `No element matches ${String(params.logoSelector)}. Add the logo.`;
    if (!d.inHalf) return `The logo is not in the ${String(params.logoHalf)} half of the page. Move it to the top ${String(params.logoHalf)}.`;
    if (d.top > Number(params.maxLogoTop)) return `The logo is ${d.top}px from the top, and the limit is ${String(params.maxLogoTop)}px.`;
    const home = String(params.homepagePath).replace(/index\.html$/, "");
    if (d.linkPath !== home) return `The logo is not inside a link to ${String(params.homepagePath)}.`;
    return null;
  },
};

export const tl2b: RuleModule = {
  code: "TL-2b",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const data = await page.evaluate((sel: string) => {
        const el = document.querySelector(sel);
        if (!el) return { found: false, isImg: false, top: 0, left: 0, rw: 0, rh: 0, nw: 0, nh: 0, svg: false, fit: "fill" };
        const r = el.getBoundingClientRect();
        return {
          found: true,
          isImg: el.tagName === "IMG",
          top: Math.round(r.top + window.scrollY),
          left: Math.round(r.left),
          rw: r.width,
          rh: r.height,
          nw: el.naturalWidth || 0,
          nh: el.naturalHeight || 0,
          svg: /\.svg(\?|#|$)/i.test(el.currentSrc || el.src || ""),
          fit: getComputedStyle(el).objectFit,
        };
      }, String(params.logoSelector));
      out.push({ file: pagePath, line: data.top, column: data.left, data });
    }
    return out;
  },

  decide(candidate, params) {
    const d = candidate.data as { found: boolean; isImg: boolean; rw: number; rh: number; nw: number; nh: number; svg: boolean; fit: string };
    if (!d.found) return `No element matches ${String(params.logoSelector)}. Add the logo.`;
    if (!d.isImg) return "The logo is not an img element, so its rendering cannot be checked.";
    /* An SVG with no intrinsic size has nothing to compare. */
    if (d.nw === 0 || d.nh === 0) return d.svg ? null : "The logo image did not load.";
    /* object-fit other than fill never stretches the image. */
    if (d.fit === "fill" && d.rh > 0) {
      const drift = Math.abs(d.rw / d.rh / (d.nw / d.nh) - 1);
      if (drift > Number(params.aspectTolerance)) {
        return `The logo is stretched: the rendered ratio differs from the natural ratio by ${(drift * 100).toFixed(1)}%.`;
      }
    }
    if (!d.svg && d.nw < d.rw * Number(params.minPixelRatio)) {
      return `The logo is ${d.nw}px wide and renders at ${Math.round(d.rw)}px. Use a larger file or an SVG.`;
    }
    return null;
  },
};

/* A glob with *, **, and ?, matched against a path relative to the root. */
export function globToRegExp(glob: string): RegExp {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      if (glob[i + 2] === "/") {
        re += "(?:.*/)?";
        i += 2;
      } else {
        re += ".*";
        i += 1;
      }
    } else if (c === "*") re += "[^/]*";
    else if (c === "?") re += "[^/]";
    else re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${re}$`);
}

export const tl2d: RuleModule = {
  code: "TL-2d",
  surface: "project",

  locate({ files, root, params }) {
    const re = globToRegExp(String(params.logoFiles));
    const hits = files.filter((f) => re.test(rel(root, f)));
    if (hits.length === 0) return [{ file: root, line: 1, column: 1, data: { none: true } }];
    return hits.map((file) => ({
      file,
      line: 1,
      column: 1,
      data: { hash: crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") },
    }));
  },

  decide(candidate, params) {
    const { none, hash } = candidate.data as { none?: boolean; hash?: string };
    if (none) return `No file matches ${String(params.logoFiles)}.`;
    const official = (params.officialLogoHashes as string[]).map((h) => String(h).toLowerCase());
    if (official.includes(hash as string)) return null;
    return `The logo file hash ${hash} is not an official logo hash.`;
  },
};
