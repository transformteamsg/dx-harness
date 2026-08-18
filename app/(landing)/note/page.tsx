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
        {typeof doc.data.illo === "string" && (
          /* The one figure the letter allows: the team around one sheet, drawn in
             the brand's ink line on the lime that is reserved for figures. Sized
             as an opener, not a hero — the words are the page.

             A plain img, not next/image: the site ships no other raster image, so
             the optimizer route is untested in the deploy container, and this asset
             is already hand-optimized (600px intrinsic for a 300px slot, quantized,
             ~31KB) — the optimizer would have nothing left to win. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doc.data.illo}
            alt={typeof doc.data.illoAlt === "string" ? doc.data.illoAlt : ""}
            width={600}
            height={600}
            className="mb-10 w-full max-w-[300px]"
          />
        )}
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
