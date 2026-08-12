import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import clsx from "clsx";
import { getControlDetail, listControlIds } from "@/lib/control-detail";
import { getScopeMeta } from "@/lib/catalog";
import { mdAlternate, NO_EXTENDED_DETAIL } from "@/lib/markdown-twin";
import { tierStyles, tierLabels } from "@/lib/tier-style";
import { Breadcrumb } from "@/components/breadcrumb";
import { heading } from "@/components/mdx";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return listControlIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = getControlDetail(id);
  if (!detail) return { title: id.toUpperCase() };
  return {
    title: `${detail.id} — ${detail.statement}`,
    ...mdAlternate(`/standards/catalog/${detail.slug}`),
  };
}

export default async function ControlDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = getControlDetail(id);
  if (!detail) notFound();

  /* Control bodies are plain Markdown, but a stray angle token outside a code
     span (e.g. "<date>" in prose) makes MDX read it as an unclosed JSX tag.
     Compile in a try/catch; on failure fall back to a preformatted block with
     a visible note rather than aborting the build with a broken page. */
  let rendered: ReactNode = null;
  let rawFallback = false;
  if (detail.body) {
    try {
      const { content } = await compileMDX({
        source: detail.body,
        components: { h2: heading("h2"), h3: heading("h3") },
        options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
      });
      rendered = content;
    } catch {
      rawFallback = true;
    }
  }

  return (
    <div className="min-w-0 max-w-[720px]">
      <Breadcrumb
        section={{ label: "Control catalog", href: "/standards/catalog" }}
        current={detail.id}
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-border bg-accent px-2 py-0.5 text-xs font-semibold">
          {detail.id}
        </span>
        <span
          className={clsx(
            "rounded-full border px-2 py-0.5 text-xs font-medium",
            tierStyles[detail.tier]
          )}
        >
          {tierLabels[detail.tier]}
        </span>
        <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
          {detail.check}
        </span>
        <span className="text-xs text-muted-foreground">{detail.category}</span>
      </div>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight">
        {detail.statement}
      </h1>
      {(detail.products || detail.audiences) &&
        (() => {
          const scopeMeta = getScopeMeta();
          const names = [
            ...(detail.products ?? []).map((p) => scopeMeta.products[p] ?? p),
            ...(detail.audiences ?? []).map((a) => scopeMeta.audiences[a] ?? a),
          ];
          return (
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Scope:</span>{" "}
              {names.join(" · ")}
            </p>
          );
        })()}
      {detail.fails_when && (
        <p className="mt-3 text-base text-muted-foreground">
          <span className="font-semibold text-danger">Fails when:</span>{" "}
          {detail.fails_when.join(" · ")}
        </p>
      )}
      {detail.body ? (
        rawFallback ? (
          <div className="mt-8">
            <p className="text-sm text-muted-foreground">
              Showing the raw Markdown source — this control&apos;s detail uses a token the
              renderer reads as markup, so it is shown verbatim below.
            </p>
            <pre className="prose mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-surface p-4 text-sm">
              {detail.body}
            </pre>
          </div>
        ) : (
          <article className="prose mt-8">{rendered}</article>
        )
      ) : (
        <p className="mt-8 text-base text-muted-foreground">{NO_EXTENDED_DETAIL}</p>
      )}
      <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
        Also available as{" "}
        <a
          className="text-tw-blue underline underline-offset-2"
          href={`/standards/catalog/${detail.slug}.md`}
        >
          Markdown
        </a>{" "}
        ·{" "}
        <a className="text-tw-blue underline underline-offset-2" href="/standards/catalog.yaml">
          catalog.yaml
        </a>
      </p>
    </div>
  );
}
