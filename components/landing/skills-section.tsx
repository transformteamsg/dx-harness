/* SkillsSection — the homepage's skills block: everything below the section
   heading and lede, which the page places.

   One part: the directory. Six hairline-separated rows, grouped by the job
   each skill does in the flow — a role holds whatever context the reader
   arrives in, which a "when you're …" grouping does not. Each row reads left
   to right: who the group is (number, heading, role sentence), then what you
   get (the skills, then the command to type). Rows, not cards: nothing here is
   interactive, so card chrome would promise a click (SLP-11), and the cells
   previously nested a bordered chip and a bordered "Start with" panel inside a
   bordered cell (SLP-4). They also forced six equal-height boxes whose slack
   shipped as empty chrome. Below md each row stacks and the same rule holds
   the groups apart.

   The section shipped with an attributed before/after hero above the grid
   (#75); the human cut it at assembly review — the page carries one
   before/after, and the proof section's slider owns it (#79, follow-up
   reaction). The attribution idea lives on in the git history if a skills
   demo ever returns. */

import Link from "next/link";
import {
  CURATED_SKILLS,
  SKILL_COUNT,
  SKILL_DIRECTORY,
} from "@/components/landing/data";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)";

export function SkillsSection() {
  return (
    <div className="mt-8">
      <div className="divide-y divide-border border-t border-border">
        {SKILL_DIRECTORY.map((group) => (
          <section
            key={group.number}
            className="grid gap-x-10 gap-y-4 py-6 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
          >
            <div>
              <h4 className="flex items-baseline gap-2.5 font-display text-lg font-semibold tracking-tight text-foreground">
                <span className="font-mono text-xs font-medium text-tw-blue-text">
                  {group.number}
                </span>
                {group.heading}
              </h4>
              <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-muted-foreground">
                {group.role}
              </p>
            </div>
            <div>
              <ul aria-label={group.heading} className="flex flex-wrap gap-1.5">
                {group.skills.map((skill) => (
                  <li
                    key={skill.name}
                    className="flex items-baseline gap-1.5 rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs whitespace-nowrap text-(--prose-body)"
                  >
                    {skill.name}
                  </li>
                ))}
              </ul>
              {/* Not a link: it is the command to type, and every one of them
                  works today. */}
              <p className="mt-4 flex flex-wrap items-baseline gap-x-2 border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">Start with</span>
                <span className="font-mono text-xs text-tw-blue-text [overflow-wrap:anywhere]">
                  /dx-harness:{group.start}
                </span>
              </p>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-4">
        <Link
          href="/harness/skills"
          className={`inline-flex min-h-11 items-center text-sm font-medium text-tw-blue-text underline underline-offset-2 ${focusRing}`}
        >
          See all {SKILL_COUNT} skills
        </Link>
      </p>

      {/* Separated by a rule, not a dashed box: dashed already means "your
          product repo" in the architecture map's legend on the same page, and
          one token cannot carry two meanings. */}
      <div className="mt-8 border-t border-border pt-8">
        <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
          We build ours, and curate the best of the rest.
        </h3>
        <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">
          We didn&rsquo;t write these three and we don&rsquo;t maintain them.
          They carry no catalog behind them.
        </p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          {CURATED_SKILLS.map((skill) => (
            <div key={skill.name}>
              <dt className="font-mono text-sm text-foreground">{skill.name}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {skill.text}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
