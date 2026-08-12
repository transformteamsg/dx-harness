/* SkillsSection — the homepage's skills block: everything below the section
   heading and lede, which the page places.

   One part: the directory. One bordered grid of hairline cells, grouped by
   the job each skill does in the flow — a role holds whatever context the
   reader arrives in, which a "when you're …" grouping does not.

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
      <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {SKILL_DIRECTORY.map((group) => (
          <section key={group.number} className="flex flex-col bg-surface px-5 py-5">
            <h4 className="flex items-baseline gap-2.5 font-display text-lg font-semibold tracking-tight text-foreground">
              <span className="font-mono text-xs font-medium text-tw-blue-text">
                {group.number}
              </span>
              {group.heading}
            </h4>
            <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-muted-foreground">
              {group.role}
            </p>
            <ul aria-label={group.heading} className="mt-4 flex flex-wrap gap-1.5">
              {group.skills.map((skill) => (
                <li
                  key={skill.name}
                  className="flex items-baseline gap-1.5 rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs whitespace-nowrap text-(--prose-body)"
                >
                  {skill.name}
                  {skill.planned && (
                    <span className="font-body text-xs text-muted-foreground">
                      planned
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {/* Not a link: it is the command to type, and every one of them
                works today (CNT-4 — the planned skill is never the start). */}
            <div className="mt-auto pt-5">
              <p className="flex flex-col gap-0.5 rounded-md border border-(--primary-line) bg-(--primary-wash) px-3 py-2">
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

      <div className="mt-6 rounded-lg border border-dashed border-border-strong bg-accent px-5 py-5">
        <p className="font-display text-base font-semibold tracking-tight text-foreground">
          We build ours, and curate the best of the rest.
        </p>
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
