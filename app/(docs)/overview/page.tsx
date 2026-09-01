import { getDoc } from "@/lib/content";
import { sectionInk, SectionTile } from "@/components/thumbnails";
import { sectionTopics } from "@/lib/directory";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Overview", ...mdAlternate("/overview") };

/* Standards tiles: the consolidated catalog first, then representative
   dimension pages. Art keys pick one glyph per tile. */
const standardsTiles = [
  { slug: "writing", art: "standards/writing" },
  { slug: "colour", art: "standards/colour" },
  { slug: "typography", art: "standards/typography" },
  { slug: "motion", art: "standards/motion" },
];

const harnessStart = [
  {
    href: "/harness/install",
    title: "Quick start",
    description: "Add the plugin and its control catalog to your agent.",
    artKey: "harness/install",
  },
  {
    href: "/harness/skills",
    title: "Skills",
    description: "Choose from 21 shipped commands, grouped by when you reach for them.",
    artKey: "harness/skills",
  },
  {
    href: "/harness/loop",
    title: "The loop",
    description: "See the main design flow and where human decisions belong.",
    artKey: "harness/loop",
  },
] as const;

export default function Overview() {
  return (
    <div className="max-w-[760px]">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        A shared design bar,<br />built into the work.
      </h1>
      <p className="mt-5 text-base text-muted-foreground">
        The DX Design Harness turns product intent, design decisions, and checkable
        standards into a workflow every team can use. It helps people and agents ship
        coherent interfaces, with or without a designer on every task.
      </p>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Start with the harness
        </h2>
        <p className="mt-2 max-w-[62ch] text-base text-muted-foreground">
          Install it once, pick the skill that fits the work, then follow the loop when a
          change needs design decisions and review.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-3">
          {harnessStart.map((topic) => (
            <SectionTile
              key={topic.href}
              topic={{ ...topic, ink: sectionInk.harness }}
            />
          ))}
        </div>
      </section>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Standards
        </h2>
        <p className="mt-2 max-w-[62ch] text-base text-muted-foreground">
          Use the control catalog for enforceable requirements. Use the pages
          under it (writing, colour, typography, motion, and the rest) when
          the work needs judgement.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
          {(() => {
            const doc = getDoc("sections", "standards");
            if (!doc) return null;
            return (
              <SectionTile
                count={sectionTopics("standards").length || undefined}
                topic={{
                  href: "/standards/catalog",
                  title: doc.title,
                  description: doc.description,
                  artKey: "standards/catalog",
                  ink: sectionInk.standards,
                }}
              />
            );
          })()}
          {standardsTiles.map((t) => {
            const doc = getDoc("standards", t.slug);
            if (!doc) return null;
            return (
              <SectionTile
                key={t.slug}
                topic={{
                  href: `/standards/${t.slug}`,
                  title: doc.title,
                  description: doc.description,
                  artKey: t.art,
                  ink: sectionInk.standards,
                }}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
