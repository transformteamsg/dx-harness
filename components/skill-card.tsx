import Link from "next/link";

/* The agent skill(s) that carry a Standards dimension. Declared in content
   frontmatter (`skills:`), rendered between the page intro and the body —
   the reader learns which skill applies this page before reading the rules.
   Flat single card, token colours only — no gradients, no nesting (SLP). */

export type SkillRef = {
  name: string;
  description?: string;
};

export function SkillCard({ skill }: { skill: SkillRef }) {
  return (
    <aside aria-label="Agent skill" className="mt-6 rounded-lg border border-border bg-muted p-5">
      <p className="text-xs font-semibold text-muted-foreground">Agent skill</p>
      {/* No <code>: a bare code element picks up Preflight's monospace stack,
          a third typeface no TYP-1 registration covers. */}
      <p className="mt-1.5 font-display text-lg font-semibold">
        /dx-harness:{skill.name}
      </p>
      {skill.description && (
        <p className="mt-1 max-w-[58ch] text-sm leading-normal text-muted-foreground">
          {skill.description}
        </p>
      )}
      <p className="mt-3 text-sm">
        <Link
          href="/harness/skills"
          className="font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          All skills
        </Link>
      </p>
    </aside>
  );
}
