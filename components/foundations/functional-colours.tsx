/* Functional colour specimen for the Colour foundations page: shows each
   Radix scale next to a live badge built from the site's real subtle/muted/
   text tokens (bg-success-subtle etc., mapped in app/globals.css's @theme
   inline block) — the COL-2 + A11Y-1 story doing its contrast job, not just
   described. The step-9 chip's hex comes from lib/foundations/colour-data.ts
   (TOK-1); the badge itself uses semantic classes like any product surface. */

import { FUNCTIONAL_COLOURS } from "@/lib/foundations/colour-data";

const BADGE_CLASSES: Record<string, string> = {
  success: "border-success-muted bg-success-subtle text-success",
  warning: "border-warning-muted bg-warning-subtle text-warning",
  danger: "border-danger-muted bg-danger-subtle text-danger",
};

export function FunctionalColours() {
  return (
    <figure className="my-8">
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-col gap-4">
          {FUNCTIONAL_COLOURS.map((entry) => (
            <div key={entry.role} className="flex flex-wrap items-center gap-3">
              <div aria-hidden style={{ background: entry.step9 }} className="h-8 w-8 shrink-0 rounded-md" />
              <div className="min-w-0 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{entry.scaleName}</span> · step 9 ·{" "}
                {entry.step9}
              </div>
              <span
                className={`ml-auto inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${BADGE_CLASSES[entry.role]}`}
              >
                {entry.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
