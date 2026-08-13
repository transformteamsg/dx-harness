/* Landing data — names follow the locked design-skills restructure spec
   (transformteamsg/dx-harness#28): the dx-design-* family, typed after the
   `/dx-harness:` prefix. Names here are the record for the landing; the
   SKILL.md descriptions stay canonical for behaviour. */

/* The landing renders no loop phases: components/diagrams/loop-data.ts — the
   contract-of-record for the six phases — is read only by the docs OrbitLoop.
   If a phase list ever returns here, render it from there; never fork it. */

/* ── The skills directory (ticket #79) ──────────────────────────────────
   Grouped by the job each skill does in the flow, not by the reader's
   situation: a role holds whatever context you arrive in. Cells carry the
   group's one sentence; the skills themselves are bare names, and the group's
   `start` is the one command worth typing first — always in full, so the
   printed form is typeable as-is. */
export type DirectorySkill = { name: string };

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
    skills: [
      { name: "dx-design-language" },
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
