"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Check, Copy, FileText } from "lucide-react";

/* Surfaces the per-page Markdown twin (append `.md` to any path) so a reader can
   open it or copy the page's Markdown for an LLM — the human-visible counterpart
   to the `<link rel="alternate" type="text/markdown">` head link and /llms.txt.
   "View as Markdown" is a plain link (works without JS); only "Copy page" needs
   the client. Token-only styling (TOK-1); copy result is announced via a polite
   sr-only live region (A11Y-11), not by repurposing the button's label. */

const control =
  "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface " +
  "px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors " +
  "hover:border-border-strong hover:text-foreground focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue) max-sm:min-h-11";

export function PageActions() {
  const pathname = usePathname();
  const mdHref = (pathname === "/" ? "/index" : pathname) + ".md";
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const [busy, setBusy] = useState(false);

  async function copyPage() {
    if (busy) return; // ignore double-clicks while a fetch is in flight
    setBusy(true);
    try {
      if (!navigator.clipboard) throw new Error("clipboard unavailable");
      const res = await fetch(mdHref);
      if (!res.ok) throw new Error(`fetch ${res.status}`);
      await navigator.clipboard.writeText(await res.text());
      setStatus("copied");
    } catch {
      setStatus("error");
    } finally {
      setBusy(false);
      setTimeout(() => setStatus("idle"), 2500);
    }
  }

  const label =
    status === "copied" ? "Copied" : status === "error" ? "Copy failed" : "Copy page";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={copyPage}
        aria-label="Copy this page as Markdown"
        className={control}
      >
        {status === "copied" ? (
          <Check className="size-3.5" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
        {label}
      </button>
      <a href={mdHref} className={control}>
        <FileText className="size-3.5" aria-hidden="true" />
        View as Markdown
      </a>
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied"
          ? "Page copied to clipboard"
          : status === "error"
            ? "Copy failed; use View as Markdown instead"
            : ""}
      </span>
    </div>
  );
}
