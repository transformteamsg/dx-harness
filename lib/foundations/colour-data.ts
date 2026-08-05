/* Colour specimen data for the Foundations pages. Hex values here are DATA
   (rendered as swatches), not UI styling — components apply them via style
   props, never as literals (TOK-1). Radix scales come from @radix-ui/colors
   so the page can never drift from the palette it claims to use; the sync
   test in colour-data.test.ts asserts globals.css matches. */
import { indigo, orange, grass, amber, red, gray, slate } from "@radix-ui/colors";

export type RampStep = { step: number; value: string };
export type Ramp = { name: string; steps: RampStep[] };

function toRamp(name: string, scale: Record<string, string>): Ramp {
  return {
    name,
    steps: Object.entries(scale).map(([key, value]) => ({
      step: Number(key.replace(name, "")),
      value,
    })),
  };
}

export const RAMPS = {
  indigo: toRamp("indigo", indigo),
  orange: toRamp("orange", orange),
  grass: toRamp("grass", grass),
  amber: toRamp("amber", amber),
  red: toRamp("red", red),
  gray: toRamp("gray", gray),
  slate: toRamp("slate", slate),
} as const;

export type RampName = keyof typeof RAMPS;

/* Radix step roles — from the Radix Colors docs; also stated in colour.mdx. */
export const STEP_ROLES = [
  { steps: "1–2", role: "App and subtle backgrounds" },
  { steps: "3–5", role: "Component states: normal, hover, active" },
  { steps: "6–8", role: "Borders and separators" },
  { steps: "9–10", role: "Solid fills, primary actions" },
  { steps: "11–12", role: "Text: low-contrast and high-contrast" },
] as const;

export const PRODUCT_PRIMARIES = [
  {
    product: "Teacher Workspace",
    token: "--tw-blue",
    value: "#0064ff",
    source: "TW brand blue (anchor)",
    proposed: false,
  },
  {
    product: "CaseSync",
    token: "--casesync",
    value: indigo.indigo9,
    source: "Radix indigo-9",
    proposed: true,
  },
  {
    product: "Glow",
    token: "--glow",
    value: orange.orange9,
    source: "Radix orange-9",
    proposed: true,
  },
] as const;

export const FUNCTIONAL_COLOURS = [
  {
    role: "success",
    scaleName: "Radix grass",
    step9: grass.grass9,
    label: "On track",
  },
  {
    role: "warning",
    scaleName: "Radix amber",
    step9: amber.amber9,
    label: "Needs review",
  },
  {
    role: "danger",
    scaleName: "Radix red",
    step9: red.red9,
    label: "Overdue",
  },
] as const;

export type SemanticToken = { name: string; cssVar: string; value: string; role: string };

/* Descriptions paraphrase the comments already in app/globals.css:9-49. */
export const SEMANTIC_TOKENS: SemanticToken[] = [
  { name: "Background", cssVar: "--background", value: "var(--background)", role: "The page canvas." },
  { name: "Surface", cssVar: "--surface", value: "var(--surface)", role: "Panels and cards sitting on the page." },
  { name: "Foreground", cssVar: "--foreground", value: "var(--foreground)", role: "Primary text ink." },
  {
    name: "Muted foreground",
    cssVar: "--muted-foreground",
    value: "var(--muted-foreground)",
    role: "Secondary text — darkened from zinc-500 to clear AA on the muted fill.",
  },
  { name: "Border", cssVar: "--border", value: "var(--border)", role: "Hairline dividers and default component borders." },
  { name: "Muted", cssVar: "--muted", value: "var(--muted)", role: "Active fill and code background." },
  { name: "Accent", cssVar: "--accent", value: "var(--accent)", role: "Hover fill." },
  { name: "Border strong", cssVar: "--border-strong", value: "var(--border-strong)", role: "Hover border." },
  { name: "Prose body", cssVar: "--prose-body", value: "var(--prose-body)", role: "Body text ink inside long-form content." },
  { name: "Ring", cssVar: "--ring", value: "var(--ring)", role: "Focus ring colour." },
  {
    name: "Success",
    cssVar: "--success",
    value: "var(--success)",
    role: "Success text — Radix grass-11.",
  },
  {
    name: "Success 9",
    cssVar: "--success-9",
    value: "var(--success-9)",
    role: "Success solid fill — Radix grass-9.",
  },
  {
    name: "Success subtle",
    cssVar: "--success-subtle",
    value: "var(--success-subtle)",
    role: "Success badge background.",
  },
  {
    name: "Success muted",
    cssVar: "--success-muted",
    value: "var(--success-muted)",
    role: "Success badge border.",
  },
  {
    name: "Warning",
    cssVar: "--warning",
    value: "var(--warning)",
    role: "Warning text — darkened past Radix amber-11 to clear AA on a tinted background.",
  },
  {
    name: "Warning 9",
    cssVar: "--warning-9",
    value: "var(--warning-9)",
    role: "Warning solid fill — Radix amber-9.",
  },
  {
    name: "Warning subtle",
    cssVar: "--warning-subtle",
    value: "var(--warning-subtle)",
    role: "Warning badge background.",
  },
  {
    name: "Warning muted",
    cssVar: "--warning-muted",
    value: "var(--warning-muted)",
    role: "Warning badge border.",
  },
  {
    name: "Danger",
    cssVar: "--danger",
    value: "var(--danger)",
    role: "Danger text — Radix red-11.",
  },
  {
    name: "Danger 9",
    cssVar: "--danger-9",
    value: "var(--danger-9)",
    role: "Danger solid fill — Radix red-9.",
  },
  {
    name: "Danger subtle",
    cssVar: "--danger-subtle",
    value: "var(--danger-subtle)",
    role: "Danger badge background.",
  },
  {
    name: "Danger muted",
    cssVar: "--danger-muted",
    value: "var(--danger-muted)",
    role: "Danger badge border.",
  },
];
