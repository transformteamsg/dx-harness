/* Landing catalogue data — names match plugins/dx-harness/skills/ exactly
   (CNT-2). One-liners are hand-written for the landing; the SKILL.md
   descriptions stay canonical. */

export type Phase = {
  key: string;
  label: string;
  tape: "pink" | "yellow" | "green" | "blue" | "orange";
  text: string;
};

export const PHASES: Phase[] = [
  {
    key: "intent",
    label: "Intent",
    tape: "pink",
    text: "What you mean is written down as a contract — every later phase is graded against it.",
  },
  {
    key: "diverge",
    label: "Diverge",
    tape: "yellow",
    text: "Two or three structurally different options, trade-offs named. You pick.",
  },
  {
    key: "plan",
    label: "Plan gate",
    tape: "green",
    text: "The plan is grilled, then stops at a human gate. Nothing is built before you approve.",
  },
  {
    key: "implement",
    label: "Implement",
    tape: "blue",
    text: "Built exactly to the approved plan, on the standards catalog — drift is a defect.",
  },
  {
    key: "verify",
    label: "Verify",
    tape: "orange",
    text: "Deterministic checks run first; a separate evaluator grades the result. The generator never grades itself.",
  },
];

export type Skill = { name: string; text: string };

export const DESIGN_SKILLS: Skill[] = [
  { name: "dx-design", text: "The full loop: intent, options, a plan you approve, build, verify." },
  { name: "dx-critique", text: "Grades an existing page and ranks what to improve." },
  { name: "dx-standards", text: "How to read, apply, waive, and grow the control catalog." },
  { name: "dx-copy", text: "Voice, tone, and error-message anatomy, applied as the text is written." },
  { name: "dx-layout", text: "Structure, hierarchy, density, and alignment on an existing page." },
  { name: "dx-polish", text: "Spacing, type, radius, colour — one named dimension at a time." },
  { name: "dx-motion", text: "Transitions and easing, with reduced-motion variants built in." },
  { name: "dx-flow", text: "Multi-step tasks: traversal, async states, escape routes, draft safety." },
  { name: "dx-research-brief", text: "A research plan that aligns a study before a participant is recruited." },
  { name: "dx-git-buddy", text: "Gitty, a friendly git companion for designers who design in code." },
  { name: "dx-start", text: "Orientation: checks your context and routes you to the right skill." },
  { name: "dx-setup", text: "Installs the per-user tools the loop relies on." },
  { name: "dx-feedback", text: "Files harness feedback as a GitHub issue the moment something confuses you." },
];

export const ENGINEERING_SKILLS: Skill[] = [
  { name: "dx-code-review", text: "Seven-angle review; findings posted inline on the PR." },
  { name: "dx-create-issue", text: "Issues structured for an agent to implement." },
  { name: "dx-groom-issue", text: "Fills in the technical sections of an existing issue." },
  { name: "dx-split-issue", text: "Decomposes an issue into single-PR children." },
  { name: "dx-implement-issue", text: "Implements a groomed issue end to end." },
  { name: "dx-lint-setup", text: "Detects the stack and configures linting and formatting." },
  { name: "dx-git-hooks-setup", text: "Pre-commit and pre-push gates around your existing checks." },
  { name: "dx-update-npm-dependencies", text: "Audits and bumps vulnerable packages, with a release cooldown." },
];

export const INSTALL_COMMANDS = `/plugin marketplace add transformteamsg/dx-harness
/plugin install dx-harness@dx-harness`;
