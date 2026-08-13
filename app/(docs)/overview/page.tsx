import Link from "next/link";
import { getDoc } from "@/lib/content";
import { sectionInk, SectionTile } from "@/components/thumbnails";
import { sectionTopics } from "@/lib/directory";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Overview", ...mdAlternate("/overview") };

/* Section tiles: index pages, Apple-HIG style. Art keys pick one
   representative glyph per section. */
const tiles = [
  { key: "principles", href: "/principles", art: "principles/brand-principles" },
  { key: "standards", href: "/standards/catalog", art: "standards/catalog" },
  { key: "guidelines", href: "/guidelines", art: "guidelines/voice-tone" },
  { key: "foundations", href: "/foundations", art: "foundations/colour" },
  { key: "research", href: "/research", art: "research/research-brief" },
];

const harnessStart = [
  {
    href: "/harness/install",
    title: "Install",
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
        dx-harness turns product intent, design decisions, and checkable standards into a
        workflow every team can use. It helps people and agents ship coherent interfaces,
        with or without a designer on every task.
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
          Design reference
        </h2>
        <p className="mt-2 max-w-[62ch] text-base text-muted-foreground">
          Use the control catalog for enforceable requirements. Use principles,
          guidelines, foundations, and research when the work needs judgement.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
          {tiles.map((t) => {
            const doc = getDoc("sections", t.key);
            if (!doc) return null;
            return (
              <SectionTile
                key={t.key}
                tag={doc.answers}
                count={sectionTopics(t.key).length || undefined}
                topic={{
                  href: t.href,
                  title: doc.title,
                  description: doc.description,
                  artKey: t.art,
                  ink: sectionInk[t.key] ?? "var(--foreground)",
                }}
              />
            );
          })}
        </div>
      </section>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="font-display text-xl font-semibold">Reference</h2>
        <div className="mt-5 grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-base font-semibold">Humans</h3>
            <p className="mt-1.5 text-sm leading-normal text-muted-foreground">
              Browse the sections above. Principles and guidelines are written for judgement
              calls only a person can make.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold">Humans → machines</h3>
            <p className="mt-1.5 text-sm leading-normal text-muted-foreground">
              <Link href="/harness/skills" className="text-tw-blue underline underline-offset-2">
                Skills
              </Link>{" "}
              package repeatable processes as Markdown you can read and an agent can execute.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold">Machines</h3>
            <p className="mt-1.5 text-sm leading-normal text-muted-foreground">
              <Link href="/for-agents" className="text-tw-blue underline underline-offset-2">
                For agents
              </Link>
              : the standard as /llms.txt and the control catalog as YAML.
            </p>
          </div>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Need the rules behind the structure?{" "}
          <Link href="/how-to-read" className="text-tw-blue underline underline-offset-2">
            How to read the system
          </Link>{" "}
          explains what each layer may demand of you.
        </p>
      </section>
    </div>
  );
}
