/* Landing data — names follow the locked design-skills restructure spec
   (transformteamsg/dx-harness#28): the dx-design-* family, typed after the
   `/dx-harness:` prefix. Names here are the record for the landing; the
   SKILL.md descriptions stay canonical for behaviour. */

/* The loop's phases render in the diagram straight from
   components/diagrams/loop-data.ts — the contract-of-record; never fork
   them into copy here. */

/* The architecture diagram's dispatch roster — shipped skills drawn solid,
   planned ones dashed and tagged (CNT-4: unshipped work is labelled, never
   presented as real). dx-design-language is new and unbuilt, so it stays
   dashed until it ships. */
export type DiagramSkill = { name: string; text: string; planned?: boolean };

export const DISPATCH_SKILLS: DiagramSkill[] = [
  { name: "dx-design-execute", text: "the only skill that builds" },
  { name: "dx-design-critique", text: "grade what exists" },
  { name: "dx-design-pattern", text: "structure and named patterns" },
  { name: "dx-design-polish", text: "spacing, type, colour" },
  { name: "dx-design-motion", text: "transitions and easing" },
  { name: "dx-design-flow", text: "multi-step journeys" },
  { name: "dx-design-copy", text: "voice and microcopy" },
  { name: "dx-design-language", text: "defines DESIGN.md", planned: true },
  { name: "dx-design-git", text: "git in plain words" },
];

/* ── The skills directory (ticket #79) ──────────────────────────────────
   Grouped by the job each skill does in the flow, not by the reader's
   situation: a role holds whatever context you arrive in. Cells carry the
   group's one sentence; the skills themselves are bare names, and the group's
   `start` is the one command worth typing first — always in full, so the
   printed form is typeable as-is. */
export type DirectorySkill = { name: string; planned?: boolean };

export type DirectoryGroup = {
  number: string;
  heading: string;
  role: string;
  skills: DirectorySkill[];
  start: string;
};

export const SKILL_DIRECTORY: DirectoryGroup[] = [
  {
    number: "01",
    heading: "Getting started",
    role: "None of these change your product; they get you set up and unstuck.",
    skills: [
      { name: "dx-design" },
      { name: "dx-design-setup" },
      { name: "dx-design-git" },
      { name: "dx-design-feedback" },
    ],
    start: "dx-design",
  },
  {
    number: "02",
    heading: "The design loop",
    role: "Critique finds the work and numbers it; execute is the only skill that changes your product.",
    skills: [{ name: "dx-design-execute" }, { name: "dx-design-critique" }],
    start: "dx-design-execute",
  },
  {
    number: "03",
    heading: "The five passes",
    role: "The loop routes to these, one named dimension each; you rarely type them yourself.",
    skills: [
      { name: "dx-design-pattern" },
      { name: "dx-design-polish" },
      { name: "dx-design-motion" },
      { name: "dx-design-flow" },
      { name: "dx-design-copy" },
    ],
    start: "dx-design-pattern",
  },
  {
    number: "04",
    heading: "Shaping the work",
    role: "Settle an open question and write it down, so the loop has something to hold you to.",
    /* CNT-4: dx-design-language is specified but unbuilt, so it is labelled
       planned everywhere it appears — and the group's start command points at
       the sibling you can type today. */
    skills: [
      { name: "dx-design-language", planned: true },
      { name: "dx-design-research-brief" },
    ],
    start: "dx-design-research-brief",
  },
  {
    number: "05",
    heading: "Shipping the code",
    role: "Carry a change from an idea to a merged pull request.",
    skills: [
      { name: "dx-create-issue" },
      { name: "dx-groom-issue" },
      { name: "dx-split-issue" },
      { name: "dx-implement-issue" },
      { name: "dx-code-review" },
    ],
    start: "dx-create-issue",
  },
  {
    number: "06",
    heading: "Repo upkeep",
    role: "Set the gates once and they catch things before a reviewer has to.",
    skills: [
      { name: "dx-lint-setup" },
      { name: "dx-git-hooks-setup" },
      { name: "dx-update-npm-dependencies" },
    ],
    start: "dx-lint-setup",
  },
];

/* Counted, never typed: the "see all" link and any headline count read this,
   so adding a skill can't leave a stale number on the page. */
export const SKILL_COUNT = SKILL_DIRECTORY.reduce(
  (total, group) => total + group.skills.length,
  0,
);

/* Skills we didn't write. Names only — they carry no `/dx-harness:` prefix,
   so printing them as commands would be printing a command that doesn't
   exist. */
export type CuratedSkill = { name: string; text: string };

export const CURATED_SKILLS: CuratedSkill[] = [
  {
    name: "/web-animation-design",
    text: "Easing, timing, and springs, argued from first principles.",
  },
  {
    name: "/better-ui",
    text: "A second opinion on a component you have already built.",
  },
  {
    name: "/make-interfaces-feel-better",
    text: "Optical alignment, borders, and the feel of a hover.",
  },
];

/* ── Superseded ─────────────────────────────────────────────────────────
   The three-panel skill list the homepage rendered before the skills section
   (#79) replaced it. Kept only so app/(landing)/page.tsx keeps compiling
   until that section is wired in; delete this export, its two types, and the
   "The path" block in page.tsx together. Names are corrected to the locked
   set so nothing on the page prints a command you can't type. */
export type Skill = { name: string; text: string };

export type SkillGroup = { heading: string; lede: string; skills: Skill[] };

export const SKILL_GROUPS: SkillGroup[] = [
  {
    heading: "When you're designing",
    lede: "The orchestrator, the builder, and the propose-only passes.",
    skills: [
      { name: "dx-design", text: "The orchestrator: asks what you want, answers rule questions, routes you." },
      { name: "dx-design-execute", text: "The builder: intent, options, a plan you approve, build, design review." },
      { name: "dx-design-critique", text: "Grades an existing page and ranks what to improve." },
      { name: "dx-design-pattern", text: "Structure, hierarchy, density, and named-pattern fit on an existing page." },
      { name: "dx-design-polish", text: "Spacing, type, radius, colour — one named dimension at a time." },
      { name: "dx-design-motion", text: "Transitions and easing, with reduced-motion variants built in." },
      { name: "dx-design-flow", text: "Multi-step tasks: traversal, async states, escape routes, draft safety." },
      { name: "dx-design-copy", text: "Voice, tone, and error-message anatomy, applied as the text is written." },
      { name: "dx-design-language", text: "Defines your design language and writes DESIGN.md." },
    ],
  },
  {
    heading: "When you're shipping",
    lede: "Eight skills that carry a change from idea to merged PR.",
    skills: [
      { name: "dx-create-issue", text: "Issues structured for an agent to implement." },
      { name: "dx-groom-issue", text: "Fills in the technical sections of an existing issue." },
      { name: "dx-split-issue", text: "Decomposes an issue into single-PR children." },
      { name: "dx-implement-issue", text: "Implements a groomed issue end to end." },
      { name: "dx-code-review", text: "Seven-angle review; findings posted inline on the PR." },
      { name: "dx-lint-setup", text: "Detects the stack and configures linting and formatting." },
      { name: "dx-git-hooks-setup", text: "Pre-commit and pre-push gates around your existing checks." },
      { name: "dx-update-npm-dependencies", text: "Audits and bumps vulnerable packages, with a release cooldown." },
    ],
  },
  {
    heading: "When you're starting out",
    lede: "Setup, research, git help, and feedback.",
    skills: [
      { name: "dx-design-setup", text: "Installs the per-user tools the loop relies on." },
      { name: "dx-design-research-brief", text: "A research plan that aligns a study before a participant is recruited." },
      { name: "dx-design-git", text: "Gitty, a friendly git companion for designers who design in code." },
      { name: "dx-design-feedback", text: "Files harness feedback as a GitHub issue the moment something confuses you." },
    ],
  },
];

export const INSTALL_COMMANDS = `/plugin marketplace add transformteamsg/dx-harness
/plugin install dx-harness@dx-harness`;
