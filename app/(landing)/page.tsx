import { SlopCompare } from "@/components/compare";
import { CopyCommands } from "@/components/landing/copy-commands";
import { NoCliDialog } from "@/components/landing/no-cli-dialog";
import { FeatureCards } from "@/components/landing/feature-cards";
import { FullMapDiagram } from "@/components/landing/full-map-diagram";
import { SkillsSection } from "@/components/landing/skills-section";
import { INSTALL_COMMANDS } from "@/components/landing/data";

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
      {/* ── Hook + install — the single focal region (LAY-7) ── */}
      <section className="border-b border-border">
        <div className="hero-enter mx-auto w-full max-w-[1080px] px-6 pt-16 pb-16 sm:pt-24 sm:pb-20">
          <h1 className="max-w-[24ch] font-display text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
            Your agent already builds the UI. Now it holds the design bar.
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-pretty text-muted-foreground">
            dx-harness is a Claude Code plugin of design skills for GovTech
            designers. Every pass proposes; only one skill ever edits your
            product.
          </p>

          {/* ── Quick start — the one primary action (CMP-5) ── */}
          <div id="quick-start" className="mt-10 max-w-[640px] scroll-mt-24">
            <div className="rounded-lg border border-border bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border px-4 py-2.5">
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs font-medium tracking-[0.08em] text-foreground">
                    Claude Code<span className="hidden sm:inline"> — two commands</span>
                  </span>
                  <span aria-hidden className="h-3 w-px bg-border" />
                  <span className="font-mono text-xs tracking-[0.08em] text-muted-foreground">
                    Codex — coming soon
                  </span>
                </span>
                <CopyCommands commands={INSTALL_COMMANDS} />
              </div>
              <pre
                tabIndex={0}
                role="region"
                aria-label="Install commands"
                className={`overflow-x-auto rounded-b-lg bg-muted px-4 py-4 font-mono text-sm leading-[1.6] text-foreground ${focusRing}`}
              >
                <code>{INSTALL_COMMANDS}</code>
              </pre>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Then type <span className="font-mono text-foreground">/dx</span> and
              every skill surfaces. <NoCliDialog triggerClassName={focusRing} />
            </p>
          </div>
        </div>
      </section>

      {/* ── The three claims — orchestrator, catalog, DESIGN.md (ticket #77) ── */}
      <section>
        <div className="mx-auto w-full max-w-[1080px] px-6 py-16 sm:py-20">
          <h2 className="sr-only">What the harness gives you</h2>
          <FeatureCards />
        </div>
      </section>

      {/* ── The full map — the machine behind the one front door (ticket #78) ── */}
      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-[1080px] px-6 py-16 sm:py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
            Intent without loss.
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

      {/* ── Proof — the standard, demonstrated ── */}
      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-[1080px] px-6 py-16 sm:py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
            You&rsquo;ve seen this PR.
          </h2>
          <p className="mt-4 max-w-[62ch] leading-relaxed text-pretty text-muted-foreground">
            Your agent ships in minutes, and every review re-litigates the same
            arguments about what good looks like. Style guides don&rsquo;t fix
            this, because agents can&rsquo;t read a PDF and reviewers
            can&rsquo;t check a vibe. The catalog names each failure — and a
            check catches it before you do.
          </p>
          <SlopCompare />
        </div>
      </section>

      {/* ── The skills — attributed hero, then the directory (ticket #79) ── */}
      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-[1080px] px-6 py-16 sm:py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
            The skills.
          </h2>
          <p className="mt-4 max-w-[62ch] leading-relaxed text-pretty text-muted-foreground">
            Everything here is one command away. Start with{" "}
            <span className="font-mono text-sm text-foreground">dx-design</span>;
            it routes you.
          </p>
          <SkillsSection />
        </div>
      </section>

    </div>
  );
}
