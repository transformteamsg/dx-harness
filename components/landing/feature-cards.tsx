import { Reveal } from "@/components/landing/reveal";

/* FeatureCards — three equally weighted columns for the orchestrator, control
   catalog, and DESIGN.md. Hairline rules group the non-interactive units
   without card affordances (SLP-4/5/11).

   Each column carries a mini-diagram. The diagrams are decoration: the claim
   and the sentence under it already say what the column means, so the notation
   is aria-hidden and assistive tech reads the prose alone (A11Y-6). Nothing
   here is interactive, so nothing carries a hover affordance that would
   promise a click (CMP-7).

   Reveal choreography matches the architecture diagram: one --reveal-i per
   column, staggered in reading order, armed client-side so no-JS and
   reduced-motion get the finished row (MOT-3, A11Y-5). */

type RevealStyle = React.CSSProperties & { "--reveal-i"?: number };
const at = (i: number): RevealStyle => ({ "--reveal-i": i });

/* Diagram notation shared by the three figures. */
const node =
  "rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs whitespace-nowrap text-foreground";
const nodeAccent =
  "rounded-md border border-(--primary-line) bg-accent px-2 py-1 font-mono text-xs whitespace-nowrap text-tw-blue-text";
const connector = "mx-auto h-3.5 w-px bg-border-strong";

function FeatureColumn({
  eyebrow,
  claim,
  children,
  index,
}: {
  eyebrow: string;
  claim: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <li
      className="reveal-item py-8 first:pt-0 last:pb-0 md:px-6 md:py-0 md:first:pl-0 md:last:pr-0"
      style={at(index)}
    >
      <p className="font-mono text-xs break-words text-tw-blue-text">{eyebrow}</p>
      <h3 className="mt-2.5 font-display text-lg font-semibold tracking-tight text-balance text-foreground">
        {claim}
      </h3>
      {children}
    </li>
  );
}

/* The one sentence under the claim — the column's meaning in prose, which is
   what assistive tech gets in place of the hidden figure. */
function Support({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>;
}

function MiniDiagram({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <div aria-hidden className="mt-4 border-t border-border pt-4">
      <p className="mb-2.5 text-xs text-muted-foreground">{caption}</p>
      {children}
    </div>
  );
}

export function FeatureCards() {
  return (
    <Reveal>
      <ul className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
        {/* ── One way in: the orchestrator fans out, one skill builds ── */}
        <FeatureColumn eyebrow="/dx-harness:dx-design" claim="One way in. One way to ship." index={0}>
          <Support>
            Ask in plain words.{" "}
            <span className="font-mono text-foreground">dx-design</span> routes you to a
            pass, and only{" "}
            <span className="font-mono text-foreground">dx-design-execute</span> ever
            edits your product.
          </Support>
          <MiniDiagram caption="orchestrator → propose-only skills → the one builder">
            <div className="flex justify-center">
              <span className={nodeAccent}>dx-design</span>
            </div>
            <div className={connector} />
            <div className="flex flex-wrap justify-center gap-1.5">
              <span className={node}>dx-design-critique</span>
              <span className={node}>dx-design-copy</span>
              <span className={node}>dx-design-flow</span>
              <span className={node}>dx-design-pattern</span>
              <span className={node}>dx-design-motion</span>
              <span className={node}>dx-design-polish</span>
            </div>
            <div className={connector} />
            <div className="flex justify-center">
              <span className={nodeAccent}>dx-design-execute — builds</span>
            </div>
          </MiniDiagram>
        </FeatureColumn>

        {/* ── The catalog: three tiers across the spectrum of design calls ── */}
        <FeatureColumn eyebrow="Control catalog" claim="Not every rule is a lint check." index={1}>
          <Support>
            Every control carries a tier, so you know which rules never bend and which
            leave you room to argue.
          </Support>
          <MiniDiagram caption="L0 · L1 · L2">
            <div className="grid grid-cols-3 gap-1.5">
              {[
                ["L0", "blocks outright"],
                ["L1", "named approver"],
                ["L2", "room to judge"],
              ].map(([tier, meaning]) => (
                <div
                  key={tier}
                  className="rounded-md border border-border bg-muted px-2 py-2 text-center"
                >
                  <span className="block font-mono text-xs font-medium text-foreground">
                    {tier}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-muted-foreground">
                    {meaning}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span>a check settles it</span>
              <span className="h-px min-w-4 flex-1 bg-border" />
              <span>a person judges it</span>
            </p>
          </MiniDiagram>
        </FeatureColumn>

        {/* ── DESIGN.md: the per-product file, overrides and all ── */}
        <FeatureColumn
          eyebrow="DESIGN.md"
          claim="Your design language, written down once."
          index={2}
        >
          <Support>
            DESIGN.md records the decisions unique to your product, plus any standing
            override — L0 never, L1 needs a named approver, L2 needs a reason.
          </Support>
          <MiniDiagram caption="a file in your repo">
            <div className="overflow-hidden rounded-md border border-border bg-muted">
              <p className="border-b border-border bg-accent px-2.5 py-1.5 font-mono text-xs text-foreground">
                DESIGN.md
              </p>
              <div className="px-2.5 py-2.5">
                {/* Body text of the file, drawn as rules rather than lorem — the
                    example that matters is the override line below. */}
                <span className="block h-1.5 w-3/4 rounded-full bg-border" />
                <span className="mt-1.5 block h-1.5 w-11/12 rounded-full bg-border" />
                <span className="mt-1.5 block h-1.5 w-1/2 rounded-full bg-border" />
                {/* A real control, a real tier, a role instead of a name (CNT-4:
                    an illustrative artifact stays faithful to the real one). */}
                <p className="mt-2.5 rounded-sm bg-(--primary-wash) px-2 py-1.5 font-mono text-xs leading-relaxed text-tw-blue-text">
                  ## Overrides
                  <br />
                  COL-1 (L1): campaign pages lead with the event colour, not the
                  product primary — approver: design lead
                </p>
              </div>
            </div>
          </MiniDiagram>
        </FeatureColumn>
      </ul>
    </Reveal>
  );
}
