/* Generates components/ink-icons.generated.ts — Lucide icons pre-rendered in
   the Icon Generator's "Ink" preset (https://github.com/wondopamine/icon-generator).
   The transform is a port of that repo's lib/transform: deterministic seed from
   hash(iconId + preset), a subtle rough.js bake, plus feTurbulence filter params
   applied at render time. Colour is NOT baked in — the component strokes with
   var(--ink) so section tints keep working (TOK-1).

   Run: npm run gen:icons  (after changing TOPIC_ICONS or upgrading lucide-react) */

import fs from "node:fs";
import path from "node:path";
import rough from "roughjs/bundled/rough.esm.js";

/* Topic → Lucide icon id. Keys match topicArt keys in components/thumbnails.tsx. */
const TOPIC_ICONS = {
  "principles/brand-principles": "compass",
  "principles/product-design-principles": "pencil-ruler",
  "standards/catalog": "list-checks",
  "guidelines/voice-tone": "message-circle",
  "guidelines/naming": "tag",
  "guidelines/interaction": "mouse-pointer-click",
  "guidelines/web-interface": "app-window",
  "guidelines/data-viz": "chart-column",
  "guidelines/illustration": "image",
  "guidelines/product-icons": "squircle",
  "foundations/colour": "palette",
  "foundations/typography": "type",
  "foundations/spacing-radius": "ruler",
  "foundations/iconography": "shapes",
  "foundations/tokens": "braces",
  "research/research-brief": "notebook-pen",
  /* Products keep the family signature: ink squircle frame + script letter
     (letter is drawn by the component, not generated here). */
  "products/teacher-workspace": "squircle",
  "products/casesync": "squircle",
  "products/glow": "squircle",
  /* Landing "three readers" section */
  "landing/human": "user-round",
  "landing/human-machine": "handshake",
  "landing/machine": "bot",
  "harness/install": "download",
  "harness/loop": "refresh-cw",
  "harness/skills": "layers",
  "harness/tools": "square-terminal",
  "harness/on-ramp": "trending-up",
  "getting-started/git-basics": "git-branch",
  "getting-started/guardrails": "shield-check",
  "getting-started/set-up": "wrench",
  "getting-started/plan": "map",
  "getting-started/build": "hammer",
  "getting-started/ship": "rocket",
  "getting-started/help": "life-buoy",
  "governance/governance": "git-branch",
};

/* ---- Ink preset (filter mode) — values copied from stroke-renderer.ts ---- */
const INK = {
  label: "Ink",
  strokeWidth: 1.4,
  baseFrequency: 0.85,
  numOctaves: 2,
  displacementScale: 0.35,
  bakeRoughness: 0.18,
  bakeBowing: 0.35,
};

/* FNV-1a hash — identical to the generator's lib/transform/seed.ts */
function makeSeed(iconId, preset) {
  const str = `${iconId}:${preset}`;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/* Lucide shape tuple → path d — port of lib/transform/shape-to-path.ts */
function shapeToPath(tag, attrs) {
  switch (tag) {
    case "path":
      return typeof attrs.d === "string" ? attrs.d : null;
    case "rect": {
      const x = Number(attrs.x ?? 0);
      const y = Number(attrs.y ?? 0);
      const w = Number(attrs.width ?? 0);
      const h = Number(attrs.height ?? 0);
      const rx = Number(attrs.rx ?? 0);
      const ry = Number(attrs.ry ?? rx);
      if (w <= 0 || h <= 0) return null;
      if (rx === 0 && ry === 0) return `M${x} ${y} h${w} v${h} h${-w} Z`;
      const rX = Math.min(rx, w / 2);
      const rY = Math.min(ry, h / 2);
      return [
        `M${x + rX} ${y}`,
        `h${w - 2 * rX}`,
        `a${rX} ${rY} 0 0 1 ${rX} ${rY}`,
        `v${h - 2 * rY}`,
        `a${rX} ${rY} 0 0 1 ${-rX} ${rY}`,
        `h${-(w - 2 * rX)}`,
        `a${rX} ${rY} 0 0 1 ${-rX} ${-rY}`,
        `v${-(h - 2 * rY)}`,
        `a${rX} ${rY} 0 0 1 ${rX} ${-rY}`,
        "Z",
      ].join(" ");
    }
    case "circle": {
      const cx = Number(attrs.cx ?? 0);
      const cy = Number(attrs.cy ?? 0);
      const r = Number(attrs.r ?? 0);
      if (r <= 0) return null;
      return `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
    }
    case "ellipse": {
      const cx = Number(attrs.cx ?? 0);
      const cy = Number(attrs.cy ?? 0);
      const rx = Number(attrs.rx ?? 0);
      const ry = Number(attrs.ry ?? 0);
      if (rx <= 0 || ry <= 0) return null;
      return `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;
    }
    case "line":
      return `M${attrs.x1 ?? 0} ${attrs.y1 ?? 0} L${attrs.x2 ?? 0} ${attrs.y2 ?? 0}`;
    case "polyline":
    case "polygon": {
      const raw = typeof attrs.points === "string" ? attrs.points : "";
      const pairs = raw.trim().split(/[\s,]+/);
      if (pairs.length < 4) return null;
      const parts = [];
      for (let i = 0; i < pairs.length; i += 2) {
        parts.push(`${i === 0 ? "M" : "L"}${pairs[i]} ${pairs[i + 1]}`);
      }
      return parts.join(" ") + (tag === "polygon" ? " Z" : "");
    }
    default:
      return null;
  }
}

/* lucide-react 0.460 has no __iconNode export — pull the shape array literal
   out of the icon module source instead. */
function loadIconShapes(iconId) {
  const file = path.resolve(`node_modules/lucide-react/dist/esm/icons/${iconId}.js`);
  const src = fs.readFileSync(file, "utf8");
  const m = src.match(/createLucideIcon\("[^"]+",\s*(\[[\s\S]*\])\s*\);/);
  if (!m) throw new Error(`could not parse icon shapes for ${iconId}`);
  return new Function(`return ${m[1]}`)();
}

function opsToPath(ops) {
  const parts = [];
  for (const { op, data } of ops) {
    if (op === "move") parts.push(`M${fmt(data[0])} ${fmt(data[1])}`);
    else if (op === "lineTo") parts.push(`L${fmt(data[0])} ${fmt(data[1])}`);
    else if (op === "bcurveTo")
      parts.push(
        `C${fmt(data[0])} ${fmt(data[1])} ${fmt(data[2])} ${fmt(data[3])} ${fmt(data[4])} ${fmt(data[5])}`
      );
  }
  return parts.join(" ");
}

const fmt = (n) => n.toFixed(2);

const generator = rough.generator({ options: {} });

function renderInk(iconId) {
  const seed = makeSeed(iconId, INK.label);
  const shapes = loadIconShapes(iconId);
  const roughOpts = {
    seed,
    roughness: INK.bakeRoughness,
    bowing: INK.bakeBowing,
    strokeWidth: INK.strokeWidth,
    preserveVertices: false,
    disableMultiStroke: true,
  };
  const paths = [];
  for (const [tag, attrs] of shapes) {
    const d = shapeToPath(tag, attrs);
    if (!d) continue;
    let emitted = false;
    try {
      const drawable = generator.path(d, roughOpts);
      for (const op of drawable.sets) {
        if (op.type !== "path") continue;
        const pathD = opsToPath(op.ops);
        if (!pathD) continue;
        paths.push(pathD);
        emitted = true;
      }
    } catch {
      /* fall through to clean path */
    }
    if (!emitted) paths.push(d);
  }
  return { seed, paths };
}

const rendered = {};
const iconCache = {};
for (const [topicKey, iconId] of Object.entries(TOPIC_ICONS)) {
  iconCache[iconId] ??= renderInk(iconId);
  rendered[topicKey] = iconCache[iconId];
}

const out = `/* Auto-generated by scripts/generate-ink-icons.mjs — do not edit by hand.
   Lucide icons rendered through the Icon Generator's "Ink" preset
   (rough.js bake; feTurbulence params live in components/thumbnails.tsx).
   Icons are Lucide (ISC) derivatives — see that repo's NOTICE.md. */

export type InkIcon = { seed: number; paths: string[] };

export const inkStroke = ${JSON.stringify(INK.strokeWidth)};
export const inkFilter = {
  baseFrequency: ${JSON.stringify(INK.baseFrequency)},
  numOctaves: ${JSON.stringify(INK.numOctaves)},
  displacementScale: ${JSON.stringify(INK.displacementScale)},
};

export const inkIcons: Record<string, InkIcon> = ${JSON.stringify(rendered, null, 2)};
`;

fs.writeFileSync("components/ink-icons.generated.ts", out);
console.log(
  `Generated components/ink-icons.generated.ts — ${Object.keys(rendered).length} topics, ${Object.keys(iconCache).length} unique icons`
);
