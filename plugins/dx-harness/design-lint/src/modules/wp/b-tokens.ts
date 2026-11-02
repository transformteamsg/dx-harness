import { customProperties, readSheets } from "./b-css.ts";
import type { Candidate, RuleModule } from "../../types.ts";

/* The token pair rules WP-13b and WP-17c. A pair names a foreground token and a
   background token. The rule resolves each to a colour from the custom
   properties of the project's style sheets and computes the WCAG contrast
   ratio. It ports checks/contrast.py: direct hex, rgb(), the keywords white and
   black, and var() chains with cycle protection. A token that does not resolve
   is a finding, never a pass. color-mix() is not resolved. */

type Rgb = [number, number, number];

const KEYWORDS: Record<string, Rgb> = { white: [255, 255, 255], black: [0, 0, 0] };

function parseColour(value: string): Rgb | null {
  const v = value.trim().toLowerCase();
  if (v in KEYWORDS) return KEYWORDS[v];
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(v);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
  }
  const fn = /^rgb\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*\)$/.exec(v);
  if (fn) return [Number(fn[1]), Number(fn[2]), Number(fn[3])];
  return null;
}

export function luminance([r, g, b]: Rgb): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function ratio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

type Props = ReturnType<typeof customProperties>;

function resolve(name: string, props: Props, seen = new Set<string>()): Rgb | null {
  if (seen.has(name)) return null;
  seen.add(name);
  const entry = props.get(name);
  if (!entry) return null;
  const ref = /^var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)$/.exec(entry.value);
  if (ref) return resolve(ref[1], props, seen);
  return parseColour(entry.value);
}

interface Pair {
  foreground: string;
  background: string;
  component: string | null;
}

/* A pair is [foreground, background] or [foreground, background, component], or an
   object with foreground, background, and component. */
function readPairs(value: unknown): Pair[] {
  if (!Array.isArray(value)) return [];
  const out: Pair[] = [];
  for (const p of value) {
    if (Array.isArray(p) && p.length >= 2) out.push({ foreground: String(p[0]), background: String(p[1]), component: p[2] === undefined ? null : String(p[2]) });
    else if (p && typeof p === "object") {
      const o = p as Record<string, unknown>;
      out.push({ foreground: String(o.foreground), background: String(o.background), component: o.component === undefined ? null : String(o.component) });
    }
  }
  return out;
}

interface Data {
  message: string | null;
}

function tokenRule(code: string, pairsParam: string, kind: string): RuleModule {
  return {
    code,
    surface: "project",

    locate({ files, root, params }) {
      const props = customProperties(readSheets(files));
      const out: Candidate[] = [];
      const min = Number(params[code === "WP-13b" ? "normalRatio" : "minRatio"]);
      for (const pair of readPairs(params[pairsParam])) {
        const fgEntry = props.get(pair.foreground);
        const at = fgEntry ?? props.get(pair.background);
        const file = at?.file ?? root;
        const line = at?.line ?? 1;
        const column = at?.column ?? 1;
        const fg = resolve(pair.foreground, props);
        const bg = resolve(pair.background, props);
        const use = pair.component ? ` for ${pair.component}` : "";
        let message: string | null = null;
        if (!fg || !bg) {
          const bad = [!fg ? pair.foreground : null, !bg ? pair.background : null].filter(Boolean).join(" and ");
          message = `The ${kind} pair ${pair.foreground} on ${pair.background}${use} cannot be checked: ${bad} does not resolve to a colour. Declare it as a hex or rgb() value, or as var() of one.`;
        } else {
          const r = ratio(fg, bg);
          if (r < min) message = `The ${kind} pair ${pair.foreground} on ${pair.background}${use} has a contrast ratio of ${r.toFixed(2)}:1. It needs ${min}:1.`;
        }
        out.push({ file, line, column, data: { message } satisfies Data });
      }
      return out;
    },

    decide(candidate) {
      return (candidate.data as Data).message;
    },
  };
}

export const wp13b = tokenRule("WP-13b", "tokenPairs", "text colour token");
export const wp17c = tokenRule("WP-17c", "boundaryTokenPairs", "boundary token");
