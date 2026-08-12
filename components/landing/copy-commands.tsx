"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type CopyState = "idle" | "copied" | "failed";

/* The landing's single primary action (CMP-5), composed from the stack's
   Button (CMP-1) — the only override is the 44px mobile target floor
   (min-h-11), which the stack's size scale stops short of. Async states:
   idle → copied | failed (CMP-3); the outcome is transient, so it announces
   through a polite live region and never moves focus (A11Y-11). The button's
   label never changes — the status text beside it carries the outcome, so
   screen readers hear one message, once. "Copied" resets after 2.5s;
   "failed" states what happened and what to do next (CNT-1) and holds until
   the next attempt. */
export function CopyCommands({ commands }: { commands: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  async function copy() {
    window.clearTimeout(timerRef.current);
    try {
      await navigator.clipboard.writeText(commands);
      setState("copied");
      timerRef.current = window.setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
      <span
        aria-live="polite"
        className={state === "idle" ? "sr-only" : "text-xs text-muted-foreground"}
      >
        {state === "copied"
          ? "Copied"
          : state === "failed"
            ? "Copy failed. Select the commands below."
            : ""}
      </span>
      {/* Overrides, with reasons (CMP-1 residual): min-h-11 = the 44px mobile
          target floor the stack's size scale stops short of; site-focus-ring
          restores the site's shared focus idiom — the stack's half-alpha
          ring computes ~1.8:1 on the dark surface and fails the 3:1 UI-state
          floor (A11Y-2/A11Y-1; latent DS defect, filed). */}
      <Button onClick={copy} className="site-focus-ring min-h-11 px-5">
        Copy commands
      </Button>
    </div>
  );
}
