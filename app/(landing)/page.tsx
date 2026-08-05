import Link from "next/link";
import { CopyCommands } from "@/components/landing/copy-commands";
import {
  DESIGN_SKILLS,
  ENGINEERING_SKILLS,
  INSTALL_COMMANDS,
  PHASES,
  type Skill,
} from "@/components/landing/data";

export const metadata = {
  title: "dx-harness — design skills your agent runs",
  description:
    "A Claude Code plugin that carries a design loop, a checkable standards catalog, and an evaluator into your agent. Design skills first; the engineering workflow rides along.",
  alternates: { types: { "text/markdown": "/index.md" } },
};

const TAPE_BG: Record<string, string> = {
  pink: "bg-tape-pink",
  yellow: "bg-tape-yellow",
  green: "bg-tape-green",
  blue: "bg-tape-blue",
  orange: "bg-tape-orange",
};

function TapeStrip({
  tape,
  className,
  children,
}: {
  tape: string;
  className?: string;
  children: string;
}) {
  return (
    <div
      aria-hidden
      className={`tape-strip pointer-events-none absolute overflow-hidden whitespace-nowrap py-1.5 font-mono text-xs font-medium tracking-[0.08em] text-tape-ink ${TAPE_BG[tape]} ${className ?? ""}`}
    >
      {Array.from({ length: 12 }, () => children).join("   ")}
    </div>
  );
}

function SkillList({
  skills,
  quiet,
  label,
}: {
  skills: Skill[];
  quiet?: boolean;
  label: string;
}) {
  const tapes = ["pink", "yellow", "green", "blue", "orange"];
  return (
    <dl aria-label={label} className="grid gap-x-12 sm:grid-cols-2">
      {skills.map((skill, i) => (
        <div
          key={skill.name}
          className="flex gap-3 border-t border-canvas-line py-4"
        >
          <span
            aria-hidden
            className={`mt-1.5 size-2.5 shrink-0 ${quiet ? "border border-canvas-muted" : TAPE_BG[tapes[i % tapes.length]]}`}
          />
          <div>
            <dt className={`font-mono text-sm font-semibold ${quiet ? "text-canvas-muted" : "text-canvas-ink"}`}>
              {skill.name}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-canvas-muted">
              {skill.text}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

export default function Landing() {
  return (
    <div className="landing-grid-bg">
      {/* ── Hero — the single focal region ── */}
      <section className="relative overflow-hidden border-b border-canvas-line">
        <div className="mx-auto w-full max-w-[1200px] px-6 pt-[72px] pb-[72px] sm:pt-[144px] sm:pb-[144px]">
          {/* dx-waive TYP-1 reason="landing display weights 700/800 (family unchanged: Plus Jakarta Sans) — the design owner pinned the Hex×Grafana direction, whose oversized grotesk display needs the heavier cut; approved by reza.ilmi (design owner), 2026-08-05" */}
          <div className="relative">
            <h1 className="font-display text-6xl leading-[0.95] font-extrabold tracking-[-0.03em] text-canvas-ink sm:text-8xl lg:text-9xl">
              Design
              <br />
              to the bar.
            </h1>
            <TapeStrip tape="pink" className="top-[72px] left-[calc(50%-58vw)] w-[76vw] max-sm:top-[26%]">
              Intent → Diverge → Plan gate → Implement → Verify
            </TapeStrip>
            <TapeStrip tape="yellow" className="top-[144px] tape-strip-2 left-[calc(50%-24vw)] w-[74vw] max-sm:top-[104%] max-sm:w-[86vw]">
              Your agent + the catalog = ships on standard
            </TapeStrip>
            <TapeStrip tape="green" className="top-[216px] tape-strip-3 left-[calc(50%-52vw)] w-[64vw] max-sm:hidden">
              70 checkable controls · a human gate · an evaluator that never grades its own work
            </TapeStrip>
          </div>
          <p className="mt-10 max-w-[58ch] text-lg leading-relaxed text-canvas-muted">
            dx-harness is a Claude Code plugin of design skills your agent runs: a
            design loop that stops for your approval, a checkable standards
            catalog, and a separate evaluator that grades what ships. The
            engineering workflow rides along in the same plugin.
          </p>

          {/* ── Quick start — the one primary action ── */}
          <div id="quick-start" className="mt-12 max-w-[640px] scroll-mt-24">
            <div className="border border-canvas-line bg-canvas-raised">
              <div className="flex items-center justify-between gap-4 border-b border-canvas-line px-4 py-2.5">
                <span className="font-mono text-xs font-medium tracking-[0.08em] text-canvas-muted">
                  Claude Code — two commands
                </span>
                <CopyCommands commands={INSTALL_COMMANDS} />
              </div>
              <pre
                tabIndex={0}
                role="region"
                aria-label="Install commands"
                className="overflow-x-auto px-4 py-4 font-mono text-sm leading-[1.6] text-canvas-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tape-yellow)"
              >
                <code>{INSTALL_COMMANDS}</code>
              </pre>
            </div>
            <p className="mt-3 text-sm text-canvas-muted">
              Then type <span className="font-mono text-canvas-ink">/dx</span> and
              every skill surfaces.{" "}
              <a
                href="#no-cli"
                className="underline underline-offset-4 hover:text-canvas-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tape-yellow)"
              >
                No command line?
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ── The loop ── */}
      <section className="border-b border-canvas-line">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-[72px] sm:py-[144px]">
          <h2 className="font-display text-3xl font-bold tracking-tight text-canvas-ink sm:text-5xl">
            One loop, five phases.
          </h2>
          <p className="mt-4 max-w-[58ch] text-canvas-muted">
            The harness makes one promise: intent without loss. What you mean is
            written down first, and every phase after — 70 checkable controls
            deep — is graded against it.
          </p>
          <ol className="mt-10">
            {PHASES.map((phase) => (
              <li
                key={phase.key}
                className="grid items-center gap-x-6 gap-y-2 border-t border-canvas-line py-5 last:border-b sm:grid-cols-[10rem_1fr]"
              >
                <span
                  className={`inline-flex w-fit px-2 py-1 font-mono text-xs font-semibold tracking-[0.08em] ${TAPE_BG[phase.tape]} text-tape-ink`}
                >
                  {phase.label}
                </span>
                <p className="text-sm leading-relaxed text-canvas-muted sm:text-base">
                  {phase.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── What it ships ── */}
      <section className="border-b border-canvas-line">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-[72px] sm:py-[144px]">
          <h2 className="font-display text-3xl font-bold tracking-tight text-canvas-ink sm:text-5xl">
            Thirteen design skills.
          </h2>
          <p className="mt-4 max-w-[58ch] text-canvas-muted">
            The catalog and the evaluator travel inside the plugin, so any repo
            you open holds the same bar. Skill names are exact; type them after{" "}
            <span className="font-mono text-canvas-ink">/dx-harness:</span>.
          </p>
          <div className="mt-10">
            <SkillList skills={DESIGN_SKILLS} label="Design skills" />
          </div>

          <h3 className="mt-16 font-display text-xl font-bold tracking-tight text-canvas-ink">
            And the engineering workflow, in the same plugin.
          </h3>
          <p className="mt-2 max-w-[58ch] text-sm text-canvas-muted">
            Issue grooming to code review — eight skills that carry a change from
            idea to merged PR, alongside the design set.
          </p>
          <div className="mt-6">
            <SkillList skills={ENGINEERING_SKILLS} quiet label="Engineering skills" />
          </div>
        </div>
      </section>

      {/* ── No command line ── */}
      <section id="no-cli" className="scroll-mt-24">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-[72px] sm:py-[144px]">
          <h2 className="font-display text-3xl font-bold tracking-tight text-canvas-ink sm:text-5xl">
            No command line? Still two minutes.
          </h2>
          <ol className="mt-8 max-w-[58ch] list-decimal space-y-3 pl-5 text-canvas-muted marker:font-mono marker:text-canvas-muted">
            <li>
              In the Claude web app or Desktop, open{" "}
              <strong className="font-medium text-canvas-ink">Customize → Plugins</strong>.
            </li>
            <li>
              Add a marketplace from the repository{" "}
              <span className="font-mono text-canvas-ink">transformteamsg/dx-harness</span>.
            </li>
            <li>
              Install <strong className="font-medium text-canvas-ink">dx-harness</strong>{" "}
              and use any skill by typing{" "}
              <span className="font-mono text-canvas-ink">/</span> in a chat.
            </li>
          </ol>
          <p className="mt-8 max-w-[58ch] text-sm text-canvas-muted">
            Working in a repo? Run{" "}
            <span className="font-mono text-canvas-ink">/dx-harness:dx-setup</span>{" "}
            once — it checks the per-person tools the loop relies on. The harness
            is built on the{" "}
            <Link
              href="/overview"
              className="underline underline-offset-4 hover:text-canvas-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tape-yellow)"
            >
              TFX Design Standard
            </Link>
            , published in full in the docs.
          </p>
        </div>
      </section>
    </div>
  );
}
