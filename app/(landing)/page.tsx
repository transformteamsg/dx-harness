import Link from "next/link";
import { SlopCompare } from "@/components/compare";
import { FeatureCards } from "@/components/landing/feature-cards";
import { FullMapDiagram } from "@/components/landing/full-map-diagram";
import { OrchestrationHero } from "@/components/landing/orchestration-hero";
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

function SectionIntro({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-10">
      <p className="pt-1 font-mono text-xs tracking-[0.1em] text-(--dxd-lime-ink)">
        {index}
      </p>
      <div>
        <h2 className="max-w-[18ch] font-display text-3xl font-normal leading-[1.05] tracking-[-0.02em] text-balance text-foreground sm:text-4xl">
          {title}
        </h2>
        <div className="mt-4 max-w-[62ch] text-lg leading-relaxed text-pretty text-muted-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-[1200px] items-center gap-12 px-6 py-14 sm:py-16 lg:grid-cols-[minmax(18rem,0.78fr)_minmax(0,1.22fr)] lg:gap-14 lg:py-20">
          <div className="hero-enter relative z-10">
            <p className="font-mono text-sm tracking-[0.14em] text-(--dxd-lime-ink)">
              DX-HARNESS
            </p>
            <p className="mt-5 max-w-[34ch] font-display text-xl leading-snug text-pretty text-muted-foreground sm:text-2xl">
              A design harness for agents that build interfaces.
            </p>
            <h1 className="mt-8 max-w-[11ch] font-display text-[clamp(2.75rem,4.6vw,4.25rem)] leading-[0.98] font-normal tracking-[-0.03em] text-balance text-foreground">
              One brief in. One reviewed interface out.
            </h1>
            <p className="mt-7 max-w-[39ch] text-lg leading-relaxed text-pretty text-(--prose-body)">
              Your agent already builds the UI. The harness gives it one front door,
              checkable standards, and an independent reviewer before the work ships.
            </p>
            <p className="mt-5 max-w-[39ch] font-mono text-xs leading-relaxed tracking-[0.04em] text-muted-foreground">
              ROUTE → BUILD → CHECK → REVIEW → SHIP
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                href="/harness/install"
                className="site-focus-ring inline-flex min-h-11 items-center bg-primary px-5 py-2.5 font-mono text-xs tracking-[0.08em] text-primary-foreground transition-[background-color,transform] duration-(--motion-fast) hover:bg-primary-hover active:scale-[0.98] motion-reduce:transform-none"
              >
                QUICK START
              </Link>
              <Link
                href="/overview"
                className={`inline-flex min-h-11 items-center font-mono text-xs tracking-[0.08em] text-foreground underline decoration-border-strong underline-offset-4 transition-[color] duration-(--motion-fast) hover:text-(--dxd-lime-ink) ${focusRing}`}
              >
                READ THE MANUAL
              </Link>
            </div>
          </div>

          <div className="min-w-0">
            <OrchestrationHero />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-[1200px] px-6 py-16 sm:py-20">
          <SectionIntro index="01 / CORE ASSEMBLY" title="Core features of the design harness.">
            <p>The four parts everything else hangs off.</p>
          </SectionIntro>
          <div className="mt-10 md:mt-12">
            <FeatureCards />
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-16 sm:py-20">
          <SectionIntro index="02 / ROUTING MAP" title="How it works.">
            <p>
              The whole harness on one map. You brief one skill; everything else
              works behind it.
            </p>
          </SectionIntro>
          <div className="mt-10 md:mt-12">
            <FullMapDiagram />
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-16 sm:py-20">
          <SectionIntro index="03 / OUTPUT TEST" title="See what the harness changes.">
            <p>
              Everything here is one command away. Start with{" "}
              <span className="font-mono text-sm text-foreground">dx-design</span>;
              it routes you.
            </p>
            <p className="mt-4">
              The demo shows the difference they make: drag the divider between
              the page your agent ships unattended and the same page on the
              harness.
            </p>
          </SectionIntro>

          <div className="mt-10 md:mt-12">
            <SlopCompare />
          </div>

          <div className="mt-16 border-t border-border pt-12 md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:gap-10">
            <div aria-hidden />
            <div>
              <h3 className="font-display text-3xl font-normal tracking-[-0.015em] text-foreground">
                Skills collection
              </h3>
              <p className="mt-2 max-w-[62ch] leading-relaxed text-muted-foreground">
                Grouped by the job each skill does in the flow.
              </p>
              <SkillsSection />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
