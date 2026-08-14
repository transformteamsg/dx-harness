import Link from "next/link";
import { getDoc } from "@/lib/content";
import { sectionInk, SectionTile, TopicRow } from "@/components/thumbnails";
import { sectionTopics } from "@/lib/directory";
import { Illo } from "@/components/illo";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Overview", ...mdAlternate("/overview") };

/* Section tiles: index pages, Apple-HIG style. Art keys pick one
   representative glyph per section. */
const tiles = [
  { key: "principles", href: "/principles", art: "principles/brand-principles" },
  { key: "standards", href: "/standards", art: "standards/catalog" },
  { key: "guidelines", href: "/guidelines", art: "guidelines/voice-tone" },
  { key: "foundations", href: "/foundations", art: "foundations/colour" },
  { key: "research", href: "/research", art: "research/research-brief" },
  { key: "products", href: "/products", art: "products/teacher-workspace" },
  { key: "harness", href: "/harness", art: "harness/loop" },
];

export default function Overview() {
  const home = getDoc("sections", "home");
  const governance = getDoc("governance", "governance");
  return (
    <div className="max-w-[760px]">
      <p className="text-xs font-semibold text-tw-blue">
        TransformX · Teacher &amp; School portfolio
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
        Kind Utility,<br />held to a standard.
      </h1>
      <p className="mt-5 text-lg text-muted-foreground">
        How TransformX designs for Singapore&apos;s teachers — utility-first at the core,
        human-first at the surface. Principles that settle arguments, standards a machine can
        check, and a harness so every builder ships at the bar, with or without a designer
        on the team.
      </p>

      {home?.illustration && <Illo subject={home.illustration} />}

      <div
        className="mt-6 rounded-lg border border-border p-4 text-base"
        style={{ background: "color-mix(in oklab, var(--tw-blue) 5%, var(--surface))" }}
      >
        <strong>The one test:</strong> does this help teachers work faster with less stress?
        If not — we don&apos;t build it.
      </div>

      {/* SLP-5 (L2) rationale: the tile grid IS the navigation — six distinct
          graphics, ladder tags, and a row variant below break the template. */}
      <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
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

      <div className="mt-12 border-t border-border pt-9">
        {governance && (
          <TopicRow
            topic={{
              href: "/governance",
              title: governance.title,
              description: governance.description,
              artKey: "governance/governance",
              ink: sectionInk.governance,
            }}
          />
        )}
        <p className="mt-7 text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/how-to-read" className="text-tw-blue underline underline-offset-2">
            How to read this standard
          </Link>{" "}
          explains the ladder and what each layer may demand of you.
        </p>
      </div>

      <h2 className="mt-14 font-display text-xl font-semibold">Three readers, one standard</h2>
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
            are guidelines packaged as markdown you can read and an agent can execute.
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
    </div>
  );
}
