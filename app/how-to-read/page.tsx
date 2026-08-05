import { notFound } from "next/navigation";
import { getDoc } from "@/lib/content";
import { DocPage } from "@/components/doc-page";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "How to read this", ...mdAlternate("/how-to-read") };

export default function Page() {
  const doc = getDoc("sections", "how-to-read");
  if (!doc) notFound();
  return <DocPage doc={doc} />;
}
