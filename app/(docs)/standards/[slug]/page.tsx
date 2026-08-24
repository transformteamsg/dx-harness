import { notFound } from "next/navigation";
import { getDoc, listDocs } from "@/lib/content";
import { DocPage } from "@/components/doc-page";
import { mdAlternate } from "@/lib/markdown-twin";

/* The Standards sub-pages (/standards/writing, /standards/colour, …). The
   static /standards/catalog* routes win over this dynamic segment, so no slug
   here may be named "catalog". */

export function generateStaticParams() {
  return listDocs("standards").map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc("standards", slug);
  return { title: doc?.title ?? "standards", ...mdAlternate(`/standards/${slug}`) };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc("standards", slug);
  if (!doc) notFound();
  return <DocPage doc={doc} />;
}
