import { notFound } from "next/navigation";
import { getDoc, listDocs } from "@/lib/content";
import { DocPage } from "@/components/doc-page";
import { mdAlternate } from "@/lib/markdown-twin";

export function generateStaticParams() {
  return listDocs("foundations").map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc("foundations", slug);
  return { title: doc?.title ?? "foundations", ...mdAlternate(`/foundations/${slug}`) };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc("foundations", slug);
  if (!doc) notFound();
  return <DocPage doc={doc} />;
}
