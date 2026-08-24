import { MDXRemote } from "next-mdx-remote/rsc";
import { getDoc } from "@/lib/content";
import { sectionTopics } from "@/lib/directory";
import { TopicCard } from "@/components/thumbnails";
import { Illo } from "@/components/illo";

/* Apple HIG-style section landing: short intro, illustration, thumbnail grid. */
export function SectionIndex({
  sectionKey,
  showTopics = true,
  omitHref,
}: {
  sectionKey: string;
  showTopics?: boolean;
  /* Drop one card from the grid — a section index rendered on a page that is
     itself one of its topics would otherwise show a card linking to here. */
  omitHref?: string;
}) {
  const doc = getDoc("sections", sectionKey);
  const topics = sectionTopics(sectionKey).filter((t) => t.href !== omitHref);
  if (!doc) return null;
  return (
    <div className="max-w-[760px]">
      <h1 className="font-display text-3xl font-semibold tracking-tight">{doc.title}</h1>
      {doc.description && (
        <p className="mt-3 text-base text-muted-foreground">{doc.description}</p>
      )}
      {doc.content.trim() && (
        <div className="prose mt-4 text-base">
          <MDXRemote source={doc.content} />
        </div>
      )}
      {doc.illustration && <Illo subject={doc.illustration} />}
      {showTopics && (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3">
          {topics.map((t) => (
            <TopicCard key={t.href} topic={t} />
          ))}
        </div>
      )}
    </div>
  );
}
