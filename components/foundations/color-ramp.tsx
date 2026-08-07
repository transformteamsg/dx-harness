/* Radix ramp specimen for the Colour foundations page: renders one 12-step
   scale as a row of chips so the reader sees the scale, not a hex list.
   Hex values come from lib/foundations/colour-data.ts (TOK-1 — never a
   literal here); chips are aria-hidden with the step/hex carried as visible
   text underneath (A11Y-1, "don't rely on colour alone"). Matches the
   MotionScale figure conventions: a bordered panel inside a <figure>. */

import { RAMPS, STEP_ROLES, type RampName } from "@/lib/foundations/colour-data";

export function ColorRamp({ name, caption }: { name: RampName; caption?: string }) {
  const ramp = RAMPS[name];

  return (
    <figure className="my-8">
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex gap-1">
          {ramp.steps.map((step, i) => (
            <div key={step.step} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div
                aria-hidden
                style={{ background: step.value }}
                className={`h-10 w-full ${i === 0 ? "rounded-l-md" : ""} ${
                  i === ramp.steps.length - 1 ? "rounded-r-md" : ""
                }`}
              />
              <span className="text-xs tabular-nums text-muted-foreground">{step.step}</span>
              <span className="hidden text-xs tabular-nums text-muted-foreground sm:block">
                {step.value}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:gap-0">
          {STEP_ROLES.map((band) => (
            <div key={band.steps} className="flex-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{band.steps}</span> {band.role}
            </div>
          ))}
        </div>
      </div>
      {caption && (
        <figcaption className="mt-3 max-w-[52ch] text-xs leading-[1.6] text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
