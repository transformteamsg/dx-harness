import { MDXRemote } from "next-mdx-remote/rsc";
import { getDoc } from "@/lib/content";
import { sectionTopics } from "@/lib/directory";
import { sectionInk, TopicCard } from "@/components/thumbnails";
import { Illo } from "@/components/illo";

/* Apple HIG-style section landing: short intro, illustration, thumbnail grid. */
export function SectionIndex({ sectionKey }: { sectionKey: string }) {
  const doc = getDoc("sections", sectionKey);
  const topics = sectionTopics(sectionKey);
  if (!doc) return null;
  return (
    <div className="max-w-[760px]">
      {doc.answers && (
        <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: sectionInk[sectionKey] ?? "var(--foreground)" }}
          />
          Answers: {doc.answers}
        </p>
      )}
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">{doc.title}</h1>
      {doc.description && (
        <p className="mt-3 text-lg text-muted-foreground">{doc.description}</p>
      )}
      {doc.content.trim() && (
        <div className="prose mt-4 text-base">
          <MDXRemote source={doc.content} />
        </div>
      )}
      {doc.illustration && <Illo subject={doc.illustration} />}
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3">
        {topics.map((t) => (
          <TopicCard key={t.href} topic={t} />
        ))}
      </div>
    </div>
  );
}
