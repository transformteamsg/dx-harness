"use client";
import { useState } from "react";

type CopyState = "idle" | "copied" | "failed";

/* The landing's single primary action (CMP-5). Async states: idle → copied |
   failed (CMP-3); the outcome is transient, so it announces through a polite
   live region and never moves focus (A11Y-11). */
export function CopyCommands({ commands }: { commands: string }) {
  const [state, setState] = useState<CopyState>("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(commands);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2500);
  }

  const label =
    state === "copied" ? "Copied" : state === "failed" ? "Select and copy instead" : "Copy commands";

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-11 items-center justify-center bg-canvas-ink px-5 font-mono text-sm font-semibold tracking-wide whitespace-nowrap text-tape-ink transition-colors duration-(--motion-fast) hover:bg-tape-yellow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tape-yellow)"
      >
        {label}
      </button>
      <span aria-live="polite" className="sr-only">
        {state === "copied"
          ? "Install commands copied to clipboard"
          : state === "failed"
            ? "Copying failed — select the commands and copy them manually"
            : ""}
      </span>
    </>
  );
}
