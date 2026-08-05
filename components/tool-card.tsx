import { ArrowUpRight } from "lucide-react";

/* Internal tool callout. Declared in content frontmatter (`tools:`), rendered
   between the page intro and the body so it can't be missed. Flat single
   card, token colours only — no gradients, no nesting (SLP). */

export type Tool = {
  name: string;
  description?: string;
  href: string;
  repo?: string;
};

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <aside
      className="mt-6 rounded-lg border p-5"
      style={{
        borderColor: "color-mix(in oklab, var(--tw-blue) 25%, var(--border))",
        background: "color-mix(in oklab, var(--tw-blue) 5%, var(--surface))",
      }}
    >
      <p className="text-xs font-semibold text-tw-blue">
        Internal tool
      </p>
      <p className="mt-1.5 font-display text-lg font-semibold">{tool.name}</p>
      {tool.description && (
        <p className="mt-1 max-w-[58ch] text-sm leading-normal text-muted-foreground">
          {tool.description}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <a
          href={tool.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-tw-blue px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-tw-blue-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
        >
          Open {tool.name}
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
        {tool.repo && (
          <a
            href={tool.repo}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Source on GitHub
          </a>
        )}
      </div>
    </aside>
  );
}
