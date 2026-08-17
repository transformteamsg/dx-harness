import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getDoc } from "@/lib/content";
import { mdxComponents } from "@/components/mdx";

/* The builder's note: a letter, not a doc page. It shares the landing sheet but
   drops every device the landing uses to sell — no cells, no figures, no filled
   action. One narrow measure of type is the whole design, because the page's
   claim is candour and a decorated confession reads as a pitch. */

export const metadata = {
  title: "A note from the builders",
  description:
    "Where we think this harness stands today, why DESIGN.md lives in your repo, and what we expect to change.",
  alternates: { types: { "text/markdown": "/note.md" } },
};

export default async function BuildersNote() {
  const doc = getDoc("sections", "builders-note");
  if (!doc) return null;
  const { content } = await compileMDX({
    source: doc.content,
    components: mdxComponents,
    options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
  });

  return (
    <article className="px-6 py-16 sm:px-10 sm:py-20">
      <div className="mx-auto max-w-[640px]">
        <p className="text-xs font-semibold tracking-wide text-site-accent-text">
          Builder&apos;s note
          {typeof doc.data.date === "string" && (
            <span className="font-normal text-muted-foreground"> · {doc.data.date}</span>
          )}
        </p>
        <h1 className="mt-4 max-w-[20ch] text-4xl font-semibold tracking-tighter text-balance text-foreground sm:text-5xl">
          {doc.title}
        </h1>
        <div className="prose mt-10">{content}</div>
      </div>
    </article>
  );
}
