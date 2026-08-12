import { SlopCompare } from "@/components/compare";
import { CopyCommands } from "@/components/landing/copy-commands";
import { NoCliDialog } from "@/components/landing/no-cli-dialog";
import { HarnessDiagram } from "@/components/landing/harness-diagram";
import { INSTALL_COMMANDS, SKILL_GROUPS } from "@/components/landing/data";

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
            Your agent already writes the code. Now it holds the bar.
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-pretty text-muted-foreground">
            dx-harness is a Claude Code plugin of design skills your agent
            runs. It carries a design loop that stops for your approval, a
            checkable standards catalog, and a design reviewer that grades
            what ships.
          </p>

          {/* ── Quick start — the one primary action (CMP-5) ── */}
          <div id="quick-start" className="mt-10 max-w-[640px] scroll-mt-24">
            <div className="rounded-lg border border-border bg-surface">
              <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5">
                <span className="font-mono text-xs font-medium tracking-[0.08em] text-muted-foreground">
                  Claude Code<span className="hidden sm:inline"> — two commands</span>
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

      {/* ── How it works — the promise, then the machine that keeps it ── */}
      <section>
        <div className="mx-auto w-full max-w-[1080px] px-6 py-16 sm:py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
            Intent without loss.
          </h2>
          <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-pretty text-muted-foreground">
            The loop writes what you mean into a contract, then grades every
            phase against it. Here is the machine that keeps that promise —
            one orchestrator, specialised passes, and a control catalog
            underneath it all.
          </p>
          <div className="mt-8">
            <HarnessDiagram />
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

      {/* ── The path — skill groups as titled panels ── */}
      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-[1080px] px-6 py-16 sm:py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
            Twenty-one skills, one prefix.
          </h2>
          <p className="mt-3 max-w-[62ch] leading-relaxed text-muted-foreground">
            Skill names are exact; type them after{" "}
            <span className="font-mono text-sm text-foreground">/dx-harness:</span>.
          </p>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {SKILL_GROUPS.map((group) => (
              <section
                key={group.heading}
                className="rounded-lg border border-border bg-surface"
              >
                <div className="border-b border-border px-5 py-4">
                  <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
                    {group.heading}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{group.lede}</p>
                </div>
                <dl aria-label={group.heading} className="px-5 pb-2">
                  {group.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="border-t border-border py-3.5 first:border-t-0"
                    >
                      <dt className="font-mono text-sm font-medium text-foreground">
                        {skill.name}
                      </dt>
                      <dd className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                        {skill.text}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
