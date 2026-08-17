import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoc } from "@/lib/content";
import { DocPage } from "@/components/doc-page";
import { Illo } from "@/components/illo";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "For agents", ...mdAlternate("/for-agents") };

export default function Page() {
  const doc = getDoc("sections", "for-agents");
  if (!doc) notFound();
  return (
    <DocPage doc={doc}>
      {doc.illustration && <Illo subject={doc.illustration} />}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/llms.txt"
          className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:border-border-strong"
        >
          /llms.txt — the curated index
        </Link>
        <a
          href="/standards/catalog.yaml"
          className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:border-border-strong"
        >
          catalog.yaml — just the controls
        </a>
      </div>
    </DocPage>
  );
}
