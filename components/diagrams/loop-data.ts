/* Single source for the six design-loop phases. The OrbitLoop diagram renders
   this data; content/harness/loop.mdx no longer restates it as a list. Facts
   here are the contract-of-record for what each phase does — change them here,
   never fork them into prose. lib/loop.test.ts guards the shape. */

export type LoopPhase = {
  id: string; // "intent" | "diverge" | ...
  n: 1 | 2 | 3 | 4 | 5 | 6;
  label: string; // "Intent"
  note: string; // ring one-liner, ≤6 words
  gate?: "plan" | "waivers"; // Plan = full human gate; Verify = gate on waivers
  gateLabel?: string; // "human gate" | "gate on waivers"
  detail: string; // 2–3 sentences for the panel
  you: string; // one line: what you do in this phase
};

export const LOOP_PHASES: LoopPhase[] = [
  {
    id: "intent",
    n: 1,
    label: "Intent",
    note: "written as a contract",
    detail:
      "Purpose, audience, page type, and done-criteria, written down as a contract. Every phase after this one answers to that text — the evaluator grades the finished work against it.",
    you: "Say what you mean and what done looks like.",
  },
  {
    id: "diverge",
    n: 2,
    label: "Diverge",
    note: "2–3 options",
    detail:
      "The agent sketches 2–3 structurally different options, using only components that exist in the product's manifest. No pixel code yet — just enough shape to choose between.",
    you: "Pick a direction.",
  },
  {
    id: "plan",
    n: 3,
    label: "Plan",
    note: "approved before any code",
    gate: "plan",
    gateLabel: "human gate",
    detail:
      "Components per region, a content outline, error states enumerated, the controls in scope, and any waivers the agent wants to propose. Nothing is coded until you approve this.",
    you: "Approve the plan, or send it back.",
  },
  {
    id: "implement",
    n: 4,
    label: "Implement",
    note: "exactly the approved plan",
    detail:
      "The agent builds exactly what the approved plan says: manifest components only, semantic tokens only. Drift from the plan is itself a defect.",
    you: "Nothing — the approved plan speaks for you.",
  },
  {
    id: "verify",
    n: 5,
    label: "Verify",
    note: "checks, then an evaluator",
    gate: "waivers",
    gateLabel: "gate on waivers",
    detail:
      "Deterministic checks run first: L0 failures block, L1 failures loop back. Screenshots at 360, 768, and 1280 stand as evidence, and a separate evaluator agent grades the judgment controls against your contract. The generator never grades its own work.",
    you: "Decide on any waivers the plan proposed.",
  },
  {
    id: "ratchet",
    n: 6,
    label: "Ratchet",
    note: "lessons kept",
    detail:
      "A decision record is written. Defects no control covered become proposed controls; solved problems become tagged, searchable solution records.",
    you: "Nothing — the loop files what it learnt.",
  },
];
