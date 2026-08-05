"use client";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }
  return (
    <figure className="my-6 overflow-hidden rounded-lg border border-border bg-muted">
      <figcaption className="flex items-center justify-between border-b border-border px-4 py-2 text-xs text-muted-foreground">
        <span>{lang ?? "code"}</span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors duration-(--motion-fast) hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue) max-sm:min-h-11"
        >
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre className="overflow-x-auto p-4 text-sm leading-[1.6]"><code className="text-foreground">{code}</code></pre>
    </figure>
  );
}
