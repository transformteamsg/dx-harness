import { Reveal } from "@/components/landing/reveal";

/* FeatureCards — three equally weighted cards, one per thing the harness gives
   you: the orchestrator, the control catalog, DESIGN.md (ticket #77, variant B
   of the approved prototype). Equal weight is the point — no card is wider,
   louder, or styled as the hero.

   Each card carries a mini-diagram. The diagrams are decoration: the claim and
   the sentence under it already say what the card means, so the notation is
   aria-hidden and assistive tech reads the prose alone (A11Y-6). Nothing here
   is interactive, so nothing carries a hover affordance that would promise a
   click (CMP-7).

   ── The card-shape controls, and why this passes ──
   SLP-5 (L2, rationale) — "no identical card grids as default layout": the
   template SLP-5 names is the icon tile above a heading above a sentence,
   repeated. There is no icon here; each card carries its own figure, drawn
   from its own mechanism, below its claim — three different pictures, not one
   template stamped three times. The row is also not the page's default
   layout: the sections around it run full-bleed prose and one wide figure.
   SLP-11 (L2, rationale) — "a card is only for an interactive unit": the card
   shell is doing real grouping work here, because each unit is a claim, a
   sentence, a hairline, and a figure, and spacing alone stops separating them
   once the figures are in. This matches the page's existing skill-group
   panels, so the landing keeps one grouping idiom rather than two.
   SLP-4 (L1, documented) — "no nested cards": the boxes inside the figures are
   diagram notation, not cards. None is interactive and none repeats card
   chrome (no shadow, no hover, no independent padding shell) — the same
   treatment components/landing/full-map-diagram.tsx documents for its figure.

   Reveal choreography matches the architecture diagram: one --reveal-i per
   card, staggered in reading order, armed client-side so no-JS and
   reduced-motion get the finished row (MOT-3, A11Y-5). */

type RevealStyle = React.CSSProperties & { "--reveal-i"?: number };
const at = (i: number): RevealStyle => ({ "--reveal-i": i });

/* Diagram notation shared by the three figures. */
const node =
  "rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs whitespace-nowrap text-foreground";
const nodeAccent =
  "rounded-md border border-(--primary-line) bg-accent px-2 py-1 font-mono text-xs whitespace-nowrap text-tw-blue-text";
const connector = "mx-auto h-3.5 w-px bg-border-strong";

function Card({
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
      className="reveal-item rounded-lg border border-border bg-surface px-5 pt-5 pb-6"
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

/* The one sentence under the claim — the card's meaning in prose, which is
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
      <ul className="grid gap-5 md:grid-cols-3">
        {/* ── One way in: the orchestrator fans out, one skill builds ── */}
        <Card eyebrow="/dx-harness:dx-design" claim="One way in. One way to ship." index={0}>
          <Support>
            Ask in plain words.{" "}
            <span className="font-mono text-foreground">dx-design</span> routes you to a
            pass, and only{" "}
            <span className="font-mono text-foreground">dx-design-execute</span> ever
            edits your product.
          </Support>
          <MiniDiagram caption="orchestrator → passes → the one builder">
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
            </div>
            <div className={connector} />
            <div className="flex justify-center">
              <span className={nodeAccent}>dx-design-execute — builds</span>
            </div>
          </MiniDiagram>
        </Card>

        {/* ── The catalog: three tiers across the spectrum of design calls ── */}
        <Card eyebrow="Control catalog" claim="Not every rule is a lint check." index={1}>
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
        </Card>

        {/* ── DESIGN.md: the per-product file, overrides and all ── */}
        <Card
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
        </Card>
      </ul>
    </Reveal>
  );
}
