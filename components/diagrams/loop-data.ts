/* Single source for the six design-loop phases. The OrbitLoop diagram renders
   this data; content/harness/loop.mdx no longer restates it as a list. Facts
   here are the contract-of-record for what each phase does — change them here,
   never fork them into prose. lib/loop.test.ts guards the shape. */

export type LoopPhase = {
  id: string; // "intent" | "diverge" | ...
  n: 1 | 2 | 3 | 4 | 5 | 6;
  label: string; // "Intent"
  note: string; // ring one-liner, ≤6 words
  gate?: "plan"; // Plan approval is the one stop before product code changes
  gateLabel?: string; // "human approval"
  detail: string; // 2–3 sentences for the panel
  you: string; // one line: what you do in this phase
};

export const LOOP_PHASES: LoopPhase[] = [
  {
    id: "intent",
    n: 1,
    label: "Intent",
    note: "one shared contract",
    detail:
      "The orchestrator writes the purpose, audience, page type, and done-criteria into one contract. It loads the product's DESIGN.md and filters the control catalog so every later stage receives the same context.",
    you: "Describe the outcome and what done looks like.",
  },
  {
    id: "diverge",
    n: 2,
    label: "Diverge",
    note: "directions or findings",
    detail:
      "For new work, dx-design-execute renders 2–3 different directions. For a broader improvement, dx-design can instead run the relevant specialists as propose-only subagents and collect their ranked findings.",
    you: "Pick a direction or accept the findings you want built.",
  },
  {
    id: "plan",
    n: 3,
    label: "Plan",
    note: "before code changes",
    gate: "plan",
    gateLabel: "human approval",
    detail:
      "The orchestrator combines the chosen direction, accepted specialist findings, components, states, in-scope standards, and any requested waivers into one plan. Nothing changes until you approve it.",
    you: "Approve the plan, or send it back.",
  },
  {
    id: "implement",
    n: 4,
    label: "Implement",
    note: "one skill edits",
    detail:
      "dx-design-execute is the only skill that edits the product. It builds the approved plan with the product's components and tokens; any drift from that plan is a defect.",
    you: "Nothing. The approved plan speaks for you.",
  },
  {
    id: "design-review",
    n: 5,
    label: "Design review",
    note: "fresh eyes, new evidence",
    detail:
      "A separate dx-design-review agent checks the build against the contract, approved plan, DESIGN.md, relevant standards, and screenshots. Findings return to the builder, and the same reviewer re-checks each fix from new evidence.",
    you: "Decide only if an unresolved finding may remain open.",
  },
  {
    id: "rule-proposal",
    n: 6,
    label: "Rule proposal",
    note: "real gaps improve the catalog",
    detail:
      "If the run exposes a real defect that no control covers, the orchestrator can start a rule proposal. The catalog changes only through review and approval; the run never edits the rulebook to make a finding disappear.",
    you: "Review a proposal only when the work uncovered a genuine gap.",
  },
];
