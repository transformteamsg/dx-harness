"use client";

import { useEffect, useRef, useState } from "react";

/* The one-prompt on-ramp: the setup ask written as a prompt a coding agent can
   act on, shown in full and copyable in one press. The text is visible and
   selectable, so a blocked clipboard (permissions, older browsers) degrades to
   select-and-copy rather than a dead end — which is also why the failure state
   points at the text instead of apologising. */

const PROMPT =
  "Install the DX Design Harness in this repo: run /plugin marketplace add transformteamsg/dx-harness, then /plugin install dx-harness@dx-harness. Check it worked by typing /dx-harness:dx-design.";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)";

type CopyState = "idle" | "copied" | "failed";

export function CopyPrompt() {
  const [state, setState] = useState<CopyState>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const settle = (next: CopyState) => {
    setState(next);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setState("idle"), 2500);
  };

  const label =
    state === "copied"
      ? "Copied"
      : state === "failed"
        ? "Couldn't copy — select the text instead"
        : "Copy the prompt";

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-wrap items-stretch gap-2 sm:flex-nowrap">
        <p className="min-w-0 flex-1 rounded-lg border border-border bg-muted px-4 py-3 font-body text-sm leading-relaxed break-words text-foreground select-all">
          {PROMPT}
        </p>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard
              .writeText(PROMPT)
              .then(() => settle("copied"))
              .catch(() => settle("failed"));
          }}
          className={`inline-flex min-h-11 shrink-0 items-center self-start rounded-lg border border-muted-foreground bg-surface px-4 text-sm font-semibold whitespace-nowrap text-foreground transition-colors duration-(--motion-fast) hover:border-foreground hover:bg-accent ${focusRing}`}
        >
          {state === "copied" ? "Copied" : "Copy the prompt"}
        </button>
      </div>
      {/* The status is announced, not just shown: the button's own text changes
          for sighted readers, and this live region carries the same outcome to
          assistive tech (A11Y-11). */}
      <span aria-live="polite" className="sr-only">
        {state === "idle" ? "" : label}
      </span>
    </div>
  );
}
