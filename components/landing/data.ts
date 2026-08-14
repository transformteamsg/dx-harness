/* The skills directory, grouped by the job each skill does in the flow rather than
   by the reader's situation — a role holds whatever context you arrive in.

   The landing prints the six group names, not all 21 skill names; the "see all"
   link carries the rest. Each group's `start` is the one command worth typing
   first, written in full so the printed form is typeable as-is. */
export type DirectoryGroup = {
  number: string;
  heading: string;
  role: string;
  skills: string[];
  start: string;
};

export const SKILL_DIRECTORY: DirectoryGroup[] = [
  {
    number: "01",
    heading: "Getting started",
    role: "None of these change your product; they get you set up and unstuck.",
    skills: ["dx-design", "dx-design-setup", "dx-design-git", "dx-design-feedback"],
    start: "dx-design",
  },
  {
    number: "02",
    heading: "The design loop",
    role: "Critique finds the work and numbers it; execute is the only skill that changes your product.",
    skills: ["dx-design-execute", "dx-design-critique"],
    start: "dx-design-execute",
  },
  {
    number: "03",
    heading: "The five passes",
    role: "The loop routes to these, one named dimension each; you rarely type them yourself.",
    skills: [
      "dx-design-pattern",
      "dx-design-polish",
      "dx-design-motion",
      "dx-design-flow",
      "dx-design-copy",
    ],
    start: "dx-design-pattern",
  },
  {
    number: "04",
    heading: "Shaping the work",
    role: "Settle an open question and write it down, so the loop has something to hold you to.",
    skills: ["dx-design-language", "dx-design-research-brief"],
    start: "dx-design-research-brief",
  },
  {
    number: "05",
    heading: "Shipping the code",
    role: "Carry a change from an idea to a merged pull request.",
    skills: [
      "dx-create-issue",
      "dx-groom-issue",
      "dx-split-issue",
      "dx-implement-issue",
      "dx-code-review",
    ],
    start: "dx-create-issue",
  },
  {
    number: "06",
    heading: "Repo upkeep",
    role: "Set the gates once and they catch things before a reviewer has to.",
    skills: ["dx-lint-setup", "dx-git-hooks-setup", "dx-update-npm-dependencies"],
    start: "dx-lint-setup",
  },
];

/* Counted, never typed: the "see all" link reads this, so adding a skill cannot
   leave a stale number on the page. */
export const SKILL_COUNT = SKILL_DIRECTORY.reduce(
  (total, group) => total + group.skills.length,
  0,
);
