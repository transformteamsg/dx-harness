import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

/* Checklist - a DoDont-style rowed card for items to confirm are in place (e.g.
   the Step 0 guardrails). Unlike DoDont (plain-string items), each Check takes
   MDX children, so inline bold/italics/links render. The green mark is the
   standard lucide CheckCircle2 (20px, stroke 2, currentColor per the icon
   standard). Fill sits on the figure so it follows the rounded border with no
   corner clip; rows are grouped, not carded (SLP-11). */
export function Checklist({ children }: { children?: ReactNode }) {
  return (
    <figure className="mb-5 mt-4 overflow-hidden rounded-lg border border-border bg-surface">
      <ul className="m-0 list-none divide-y divide-border p-0">{children}</ul>
    </figure>
  );
}

export function Check({ children }: { children?: ReactNode }) {
  return (
    <li className="mb-0 flex items-start gap-3 px-4 py-3">
      <CheckCircle2 size={20} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0 text-success" />
      <span className="text-sm leading-[1.6] text-(--prose-body)">{children}</span>
    </li>
  );
}
