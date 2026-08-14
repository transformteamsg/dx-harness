import { getDoc } from "@/lib/content";
import { DocPage } from "@/components/doc-page";
import { notFound } from "next/navigation";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Governance", ...mdAlternate("/governance") };

export default function Page() {
  const doc = getDoc("governance", "governance");
  if (!doc) notFound();
  return <DocPage doc={doc} />;
}
