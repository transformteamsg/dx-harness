import { DISPATCH_SKILLS } from "@/components/landing/data";
import { LOOP_PHASES } from "@/components/diagrams/loop-data";
import { Reveal } from "@/components/landing/reveal";

/* Reveal choreography: each element carries its narrative index (--reveal-i);
   globals.css turns it into a staggered once-only entrance (client-armed,
   reduced-motion/no-JS get the finished diagram). */
type RevealStyle = React.CSSProperties & { "--reveal-i"?: number };
const at = (i: number): RevealStyle => ({ "--reveal-i": i });

/* HarnessDiagram — the architecture as a static, token-drawn figure
   (docs/decisions/landing-dark.md). Everything is semantic HTML: real text in
   reading order (you → orchestrator → skills → context), so assistive tech
   reads the same story sighted users see (A11Y-6/7) and nothing depends on
   motion (MOT-3 — nothing moves). Connector lines and arrowheads are
   decorative and aria-hidden; the flow labels are real text because they
   carry meaning. Boxes here are diagram notation, not cards (SLP-11): none is
   interactive and none nests card chrome. Planned skills are drawn dashed and
   tagged, never presented as shipped (CNT-4). */

/* A labelled connector: vertical on small screens, horizontal from md up. */
function Flow({ label, i }: { label: string; i?: number }) {
  return (
    <div
      className="reveal-item flex flex-col items-center gap-1.5 self-center md:min-w-20 md:flex-1 md:px-1"
      style={i === undefined ? undefined : at(i)}
    >
      <span className="max-w-[18ch] text-center text-xs leading-relaxed text-muted-foreground">
        {label}
      </span>
      <span aria-hidden className="reveal-line flex flex-col items-center md:w-full md:flex-row">
        <span className="h-5 w-px bg-border-strong md:h-px md:w-full md:flex-1" />
        <span className="border-x-4 border-t-4 border-x-transparent border-t-(--border-strong) md:border-x-0 md:border-y-4 md:border-l-4 md:border-y-transparent md:border-l-(--border-strong)" />
      </span>
    </div>
  );
}

/* An upward connector for the context band: the catalog feeds the loop. */
function FlowUp({ label, i }: { label: string; i?: number }) {
  return (
    <div
      className="reveal-item flex flex-col items-center gap-1.5 py-5"
      style={i === undefined ? undefined : at(i)}
    >
      <span aria-hidden className="reveal-line flex flex-col items-center">
        <span className="border-x-4 border-b-4 border-x-transparent border-b-(--border-strong)" />
        <span className="h-5 w-px bg-border-strong" />
      </span>
      <span className="text-center text-xs leading-relaxed text-muted-foreground">{label}</span>
    </div>
  );
}

export function HarnessDiagram() {
  return (
    <Reveal>
      <figure
      aria-label="How the harness is structured. Your ask enters the dx-design orchestrator, which routes it to specialised skills. The builder, dx-design-make, runs the loop with a human gate before code. Every skill reads the control catalog."
      className="rounded-lg border border-border bg-surface px-5 py-6 sm:px-8 sm:py-8"
    >
      {/* ── The dispatch flow: you → orchestrator, then down to the skills ── */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
        <div className="reveal-item self-center rounded-lg border border-border px-4 py-3 text-center md:self-auto" style={at(0)}>
          <p className="text-sm font-medium text-foreground">You</p>
          <p className="mt-0.5 text-xs text-muted-foreground">one ask</p>
        </div>

        <Flow label="say what you want, in plain words" i={1} />

        <div className="reveal-item rounded-lg border border-border px-4 py-3.5 md:flex-1" style={at(2)}>
          <p className="font-mono text-sm font-medium text-tw-blue-text">dx-design</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            The orchestrator. Asks what you want, answers rule questions, routes.
            Can&rsquo;t say? It offers five plain modes:
          </p>
          <ol aria-label="The orchestrator's five modes" className="mt-2.5 flex flex-wrap gap-1.5">
            {[
              "make something new",
              "improve what exists",
              "brainstorm",
              "define your design language",
              "set up my tools",
            ].map((mode, index) => (
              <li
                key={mode}
                className="reveal-item rounded-md bg-muted px-2 py-0.5 text-xs whitespace-nowrap text-foreground"
                style={at(3 + index * 0.5)}
              >
                {mode}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="reveal-item flex flex-col items-center gap-1.5 py-4" style={at(6)}>
        <span className="text-center text-xs leading-relaxed text-muted-foreground">
          routes to the skill your ask needs
        </span>
        <span aria-hidden className="reveal-line flex flex-col items-center">
          <span className="h-5 w-px bg-border-strong" />
          <span className="border-x-4 border-t-4 border-x-transparent border-t-(--border-strong)" />
        </span>
      </div>

      <ul
        aria-label="Specialised skills the orchestrator dispatches"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {DISPATCH_SKILLS.map((skill, index) => (
          <li
            key={skill.name}
            className={`reveal-item rounded-md border px-3 py-2.5 ${
              skill.planned ? "border-dashed border-border" : "border-border bg-muted"
            }`}
            style={at(7 + index * 0.5)}
          >
            <p className="flex flex-wrap items-baseline gap-x-1.5 font-mono text-xs font-medium text-foreground">
              <span className="whitespace-nowrap">{skill.name}</span>
              {skill.planned && (
                <span className="font-body text-xs font-normal text-muted-foreground">
                  planned
                </span>
              )}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{skill.text}</p>
          </li>
        ))}
      </ul>

      {/* ── The build path: only one skill writes code ── */}
      <div className="reveal-item mt-6 flex flex-col items-start gap-2 border-t border-border pt-5 md:flex-row md:items-center md:gap-4" style={at(12)}>
        <p className="text-sm leading-relaxed text-muted-foreground md:max-w-[34ch]">
          Only <span className="font-mono font-medium text-foreground">dx-design-make</span>{" "}
          edits the product. The passes propose; you accept; it builds. Every build
          runs the loop:
        </p>
        <span
          aria-hidden
          className="hidden items-center md:flex md:min-w-12 md:flex-1"
        >
          <span className="h-px w-full flex-1 bg-border-strong" />
          <span className="border-y-4 border-l-4 border-y-transparent border-l-(--border-strong)" />
        </span>
        <ol aria-label="The loop's phases" className="flex flex-wrap gap-1.5 md:max-w-[46ch] md:justify-end">
          {LOOP_PHASES.map((phase) => (
            <li
              key={phase.id}
              className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium tracking-[0.08em] whitespace-nowrap text-foreground"
            >
              {phase.label}
              {phase.gate === "plan" && (
                <span className="font-body font-normal tracking-normal text-muted-foreground">
                  {" "}
                  · gate
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>

      {/* ── The context every phase stands on ── */}
      <FlowUp label="every skill reads the same context" i={13} />

      <div className="flex flex-col gap-2 md:flex-row md:items-stretch">
        <div className="reveal-item flex-1 rounded-lg border border-border px-4 py-3.5" style={at(14)}>
          <p className="text-sm font-medium text-foreground">Control catalog</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            70+ checkable controls, three tiers
          </p>
          <ul aria-label="Control tiers" className="mt-2.5 flex flex-wrap gap-1.5">
            {[
              ["L0", "non-negotiable"],
              ["L1", "mandatory"],
              ["L2", "recommended"],
            ].map(([tier, meaning]) => (
              <li
                key={tier}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                <span className="font-mono font-medium text-foreground">{tier}</span> {meaning}
              </li>
            ))}
          </ul>
          <p className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span>abstract, “it depends”</span>
            <span aria-hidden className="h-px min-w-6 flex-1 bg-border" />
            <span>deterministic, “1+1=2”</span>
          </p>
        </div>

        <Flow label="grounds" i={14.5} />

        <div className="reveal-item rounded-lg border border-border px-4 py-3.5 md:max-w-[220px] md:self-center" style={at(15)}>
          <p className="text-sm font-medium text-foreground">Primitives</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            tokens and components — the boring stack, on purpose
          </p>
        </div>

        <Flow label="written into" i={15.5} />

        <div className="reveal-item rounded-lg border border-border px-4 py-3.5 md:max-w-[220px] md:self-center" style={at(16)}>
          <p className="font-mono text-sm font-medium text-foreground">DESIGN.md</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            per-product instructions any agent can read
          </p>
        </div>
      </div>

      {/* ── Legend — visible, not decoration (CNT-4 depends on it). The words
           carry the key; the swatches are redundant reinforcement. ── */}
      <figcaption className="reveal-item mt-6 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground" style={at(17)}>
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-3 rounded-xs border border-border-strong bg-muted" />
          solid — ships today
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-3 rounded-xs border border-dashed border-border-strong" />
          dashed — planned; the team keeps curating the set
        </span>
      </figcaption>
      </figure>
    </Reveal>
  );
}
