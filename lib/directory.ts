import { getDoc } from "@/lib/content";
import { contentMap } from "@/lib/content-map";
import { sectionInk, type Topic } from "@/components/thumbnails";
import { isVisibleNavHref } from "@/lib/nav";

/* Directory structure is chrome (like the sidebar); doc registration comes
   from content/map.json via lib/content-map, titles and descriptions from
   content frontmatter via getDoc. `pages` covers the few section pages that
   aren't MDX docs (e.g. the control catalog). */
type SectionDef = {
  label: string;
  slugs?: string[];
  pages?: Omit<Topic, "ink">[];
};

const chromePages: Record<string, Omit<Topic, "ink">[]> = {
  standards: [
    {
      href: "/standards/catalog",
      title: "Control catalog",
      description:
        "Every control with its tier, fail conditions and check type. Filter, copy IDs, cite them in review.",
      artKey: "standards/catalog",
    },
  ],
};

export const sections: Record<string, SectionDef> = Object.fromEntries(
  Object.entries(contentMap)
    .filter(([, def]) => !def.root)
    .map(([key, def]) => [
      key,
      { label: def.label, slugs: def.slugs, pages: chromePages[key] },
    ]),
);

export function sectionTopics(key: string): Topic[] {
  const section = sections[key];
  if (!section) return [];
  const ink = sectionInk[key] ?? "var(--foreground)";
  const fromPages = (section.pages ?? []).flatMap((page) =>
    isVisibleNavHref(page.href) ? [{ ...page, ink }] : [],
  );
  const fromSlugs = (section.slugs ?? []).flatMap((slug) => {
    const href = `/${key}/${slug}`;
    if (!isVisibleNavHref(href)) return [];
    const doc = getDoc(key, slug);
    if (!doc) return [];
    return [
      {
        href,
        title: doc.title,
        description: doc.description,
        artKey: `${key}/${slug}`,
        ink,
      },
    ];
  });
  return [...fromPages, ...fromSlugs];
}
