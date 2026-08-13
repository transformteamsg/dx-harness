import Link from "next/link";
import { SlopCompare } from "@/components/compare";
import { FeatureCards } from "@/components/landing/feature-cards";
import { FullMapDiagram } from "@/components/landing/full-map-diagram";
import { HeroGeometry } from "@/components/landing/hero-geometry";
import { SkillsSection } from "@/components/landing/skills-section";

export const metadata = {
  /* Absolute: the root template suffixes "— dx-harness", which would double
     the name on its own homepage. */
  title: { absolute: "dx-harness — design skills your agent runs" },
  description:
    "A Claude Code plugin that carries a design loop, a checkable standards catalog, and a design reviewer into your agent. Design skills first; the engineering workflow rides along.",
  alternates: { types: { "text/markdown": "/index.md" } },
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)";

export default function Landing() {
  return (
    <div>
      {/* ── Poster hero — promise, one action, canonical DXD geometry ── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-[1280px] items-center gap-6 px-6 py-14 lg:grid-cols-[minmax(0,0.88fr)_minmax(480px,1.12fr)] lg:gap-8 lg:py-10">
          <div className="hero-enter relative z-10 max-w-[660px]">
            <h1 className="max-w-[18ch] font-display text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
              Your agent already builds the UI. Now it holds the design bar.
            </h1>
            <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-pretty text-muted-foreground">
              A design loop, checkable standards, and an independent reviewer for every build.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/harness/install"
                className="site-focus-ring inline-flex min-h-11 items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-(--motion-fast) hover:bg-tw-blue-hover"
              >
                Quick start
              </Link>
              <Link
                href="/overview"
                className={`inline-flex min-h-11 items-center text-sm font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors duration-(--motion-fast) hover:text-tw-blue-text ${focusRing}`}
              >
                Explore the harness
              </Link>
            </div>
          </div>
          <div className="relative">
            <HeroGeometry />
          </div>
        </div>
      </section>

      {/* ── Core features — orchestrator, catalog, DESIGN.md (ticket #77) ── */}
      <section>
        <div className="mx-auto w-full max-w-[1080px] px-6 py-16 sm:py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
            Core features of the design harness.
          </h2>
          <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-pretty text-muted-foreground">
            The three parts everything else hangs off.
          </p>
          <div className="mt-8">
            <FeatureCards />
          </div>
        </div>
      </section>

      {/* ── The full map — how it is structured and works (ticket #78) ── */}
      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-[1080px] px-6 py-16 sm:py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
            How it works.
          </h2>
          <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-pretty text-muted-foreground">
            The whole harness on one map. You brief one skill; everything else
            works behind it.
          </p>
          <div className="mt-8">
            <FullMapDiagram />
          </div>
        </div>
      </section>

      {/* ── The skills — lede, full-width comparison, then the collection ── */}
      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-[1080px] px-6 py-16 sm:py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
            The skills.
          </h2>
          <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-pretty text-muted-foreground">
            Everything here is one command away. Start with{" "}
            <span className="font-mono text-sm text-foreground">dx-design</span>;
            it routes you.
          </p>
          <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-pretty text-muted-foreground">
            The demo shows the difference they make: drag the divider between
            the page your agent ships unattended and the same page on the
            harness.
          </p>
          <div className="mt-8">
            <SlopCompare />
          </div>

          <h3 className="mt-16 border-t border-border pt-12 font-display text-xl font-semibold tracking-tight text-foreground">
            Skills collection
          </h3>
          <p className="mt-2 max-w-[62ch] leading-relaxed text-muted-foreground">
            Grouped by the job each skill does in the flow.
          </p>
          <SkillsSection />
        </div>
      </section>

    </div>
  );
}
