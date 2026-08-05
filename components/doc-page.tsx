import type { ReactNode } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { Doc } from "@/lib/content";
import { extractHeadings } from "@/lib/toc";
import { Toc } from "@/components/toc";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageActions } from "@/components/page-actions";
import { ToolCard, type Tool } from "@/components/tool-card";
import { mdxComponents } from "@/components/mdx";

/* Sections whose docs live at /{section}/{slug} and get a breadcrumb back to
   the section root. Single-doc sections (governance) and start pages don't. */
const sectionCrumbs: Record<string, { label: string; href: string }> = {
  principles: { label: "Principles", href: "/principles" },
  standards: { label: "Standards", href: "/standards" },
  guidelines: { label: "Guidelines", href: "/guidelines" },
  foundations: { label: "Foundations", href: "/foundations" },
  research: { label: "Research", href: "/research" },
  products: { label: "Products", href: "/products" },
  harness: { label: "Harness", href: "/harness" },
  "getting-started": { label: "Start with code", href: "/getting-started" },
};

export async function DocPage({ doc, children }: { doc: Doc; children?: ReactNode }) {
  const crumb = sectionCrumbs[doc.section];
  const headings = extractHeadings(doc.content);
  const tools = (doc.data.tools ?? []) as Tool[];

  /* Doc bodies are plain Markdown, but a stray angle token outside a code
     span (e.g. "<date>" in prose) makes MDX read it as an unclosed JSX tag.
     Compile in a try/catch; on failure fall back to a preformatted block with
     a visible note rather than aborting the build with a broken page. */
  let rendered: ReactNode = null;
  let rawFallback = false;
  try {
    const { content } = await compileMDX({
      source: doc.content,
      components: mdxComponents,
      // blockJS defaults to true, which strips JS expression-container
      // attributes (e.g. `items={[...]}`) entirely — needed for DoDont's
      // inline array prop. blockDangerousJS stays on (its default) so
      // eval/Function/import() calls are still rejected; all doc content
      // is first-party (content/), not user-supplied.
      options: { mdxOptions: { remarkPlugins: [remarkGfm] }, blockJS: false },
    });
    rendered = content;
  } catch (err) {
    rawFallback = true;
    console.warn(
      `[doc-page] MDX compile failed for ${doc.section}/${doc.slug} — serving raw-markdown fallback:`,
      err instanceof Error ? err.message : err,
    );
  }

  return (
    <div className="flex gap-12">
      <div className="min-w-0 max-w-[720px] flex-1">
        <div className="mb-3 flex justify-end">
          <PageActions />
        </div>
        {crumb && <Breadcrumb section={crumb} current={doc.title} />}
        {doc.status === "proposed" && (
          <span className="mb-2 inline-block rounded-full border border-warning-muted bg-warning-subtle px-2 py-0.5 text-xs font-medium text-warning">
            ⚑ Proposed — react, don&apos;t obey
          </span>
        )}
        {doc.status === "settled" && (
          <span className="mb-2 inline-block rounded-full border border-success-muted bg-success-subtle px-2 py-0.5 text-xs font-medium text-success">
            Settled
          </span>
        )}
        <h1 className="font-display text-3xl font-semibold tracking-tight">{doc.title}</h1>
        {doc.description && (
          <p className="mt-3 text-lg text-muted-foreground">
            {doc.description}
          </p>
        )}
        {tools.map((tool) => (
          <ToolCard key={tool.href} tool={tool} />
        ))}
        {rawFallback ? (
          <div className="mt-8">
            <p className="text-sm text-muted-foreground">
              This doc contains a token the renderer reads as markup, so you are seeing the raw
              Markdown source.
            </p>
            <pre className="prose mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-surface p-4 text-sm">
              {doc.content}
            </pre>
          </div>
        ) : (
          <article className="prose mt-8">{rendered}</article>
        )}
        {children}
      </div>
      {!rawFallback && headings.length >= 2 && <Toc headings={headings} />}
    </div>
  );
}
