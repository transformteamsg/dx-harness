import { getDoc } from "@/lib/content";
import { DocPage } from "@/components/doc-page";
import { notFound } from "next/navigation";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Change log", ...mdAlternate("/governance/changes") };

export default function Page() {
  const doc = getDoc("governance", "changes");
  if (!doc) notFound();
  return <DocPage doc={doc} />;
}
