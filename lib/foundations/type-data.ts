/* Type-scale data (TYP-3) shared by the TypeScale specimen and, per plan 003,
   the future /foundations/tokens page. If the catalog scale changes, update
   this file and the typography.mdx prose together.

   `util` is the named Tailwind utility that carries the size — the scale IS
   the Tailwind default type scale, so specimens render via named classes,
   never arbitrary text-[Npx] values (type-scan.py ONSCALE gate). */

export type TypeRow = {
  step: string;
  util: string;
  px: number;
  font: "display" | "body";
  weight: number;
  note?: string;
};

export const TYPE_SCALE: TypeRow[] = [
  {
    step: "Display",
    util: "text-5xl",
    px: 48,
    font: "display",
    weight: 600,
    note: "Also 60 / 72 / 96px for larger surfaces.",
  },
  { step: "Heading 1", util: "text-3xl", px: 30, font: "display", weight: 600 },
  { step: "Heading 2", util: "text-2xl", px: 24, font: "display", weight: 600 },
  { step: "Heading 3", util: "text-xl", px: 20, font: "display", weight: 600 },
  { step: "Body Large", util: "text-lg", px: 18, font: "body", weight: 400 },
  { step: "Body", util: "text-base", px: 16, font: "body", weight: 400 },
  { step: "Body Small", util: "text-sm", px: 14, font: "body", weight: 400 },
  { step: "Caption", util: "text-xs", px: 12, font: "body", weight: 500 },
  {
    step: "Label",
    util: "text-xs",
    px: 12,
    font: "body",
    weight: 600,
    note: "Sentence case, not all-caps (TYP-4).",
  },
];
