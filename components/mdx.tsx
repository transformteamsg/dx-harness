import { isValidElement, type ReactNode } from "react";
import { slugify } from "@/lib/toc";
import { MotionScale } from "@/components/diagrams/motion-scale";
import { OrbitLoop } from "@/components/diagrams/orbit-loop";
import { ColorRamp } from "@/components/foundations/color-ramp";
import { PrimarySwatches } from "@/components/foundations/primary-swatches";
import { FunctionalColours } from "@/components/foundations/functional-colours";
import { TokenTable } from "@/components/foundations/token-table";
import { FontRoles, TypeScale } from "@/components/foundations/type-scale";
import { SpacingScale } from "@/components/foundations/spacing-scale";
import { RadiusScale } from "@/components/foundations/radius-scale";
import { IconSet } from "@/components/foundations/icon-set";
import { BrandIconSet } from "@/components/foundations/brand-icon-set";
import { CodeBlock } from "@/components/code-block";
import { DoDont } from "@/components/foundations/do-dont";
import { Checklist, Check } from "@/components/foundations/checklist";
import { Glossary, Term } from "@/components/foundations/glossary";

export function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

/* Heading ids must match lib/toc's extractHeadings so the rail can target them. */
export function heading(Tag: "h2" | "h3") {
  function Heading({ children }: { children?: ReactNode }) {
    return <Tag id={slugify(textOf(children))}>{children}</Tag>;
  }
  return Heading;
}

/* Fenced code blocks render through CodeBlock (framed, copyable) instead of a
   bare <pre>. Falls back to a plain <pre> if the child isn't the expected
   <code> element (e.g. an empty fence). */
function Pre({ children }: { children?: ReactNode }) {
  if (isValidElement(children)) {
    const p = children.props as { className?: string; children?: ReactNode };
    const lang = p.className?.replace(/^language-/, "");
    const code = textOf(p.children).replace(/\n$/, "");
    return <CodeBlock code={code} lang={lang} />;
  }
  return <pre>{children}</pre>;
}

/* Components available inside doc-page MDX bodies. Headings get slug ids so the
   TOC rail can target them; the diagrams are token-only inline SVG. */
export const mdxComponents = {
  h2: heading("h2"),
  h3: heading("h3"),
  pre: Pre,
  CodeBlock,
  DoDont,
  Checklist,
  Check,
  Glossary,
  Term,
  MotionScale,
  OrbitLoop,
  ColorRamp,
  PrimarySwatches,
  FunctionalColours,
  TokenTable,
  TypeScale,
  FontRoles,
  SpacingScale,
  RadiusScale,
  IconSet,
  BrandIconSet,
};
