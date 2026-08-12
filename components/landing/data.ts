/* Landing data — names follow the locked design-skills restructure spec
   (transformteamsg/dx-harness#28): the dx-design-* family. One-liners are
   hand-written for the landing; the SKILL.md descriptions stay canonical. */

/* The loop's phases render in the diagram straight from
   components/diagrams/loop-data.ts — the contract-of-record; never fork
   them into copy here. */

/* The architecture diagram's dispatch roster — shipped skills drawn solid,
   planned ones dashed and tagged (CNT-4: unshipped work is labelled, never
   presented as real). dx-design-language is new and unbuilt, so it stays
   dashed until it ships. */
export type DiagramSkill = { name: string; text: string; planned?: boolean };

export const DISPATCH_SKILLS: DiagramSkill[] = [
  { name: "dx-design-make", text: "the only skill that builds" },
  { name: "dx-design-critique", text: "grade what exists" },
  { name: "dx-design-pattern", text: "structure and named patterns" },
  { name: "dx-design-polish", text: "spacing, type, colour" },
  { name: "dx-design-motion", text: "transitions and easing" },
  { name: "dx-design-flow", text: "multi-step journeys" },
  { name: "dx-design-copy", text: "voice and microcopy" },
  { name: "dx-design-language", text: "defines DESIGN.md", planned: true },
  { name: "dx-design-git-helper", text: "git in plain words" },
];

export type Skill = { name: string; text: string };

export type SkillGroup = { heading: string; lede: string; skills: Skill[] };

export const SKILL_GROUPS: SkillGroup[] = [
  {
    heading: "When you're designing",
    lede: "The orchestrator, the builder, and the propose-only passes.",
    skills: [
      { name: "dx-design", text: "The orchestrator: asks what you want, answers rule questions, routes you." },
      { name: "dx-design-make", text: "The builder: intent, options, a plan you approve, build, design review." },
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
      { name: "dx-design-git-helper", text: "Gitty, a friendly git companion for designers who design in code." },
      { name: "dx-design-feedback", text: "Files harness feedback as a GitHub issue the moment something confuses you." },
    ],
  },
];

export const INSTALL_COMMANDS = `/plugin marketplace add transformteamsg/dx-harness
/plugin install dx-harness@dx-harness`;
