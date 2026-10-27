import type { Candidate, RuleModule } from "../types.ts";

/* One rule that is checked in more than one way, for example a plain HTML check
   and a jsx-a11y check on JSX and TSX files. The parts run in turn, and each
   candidate goes back to the part that found it, to be decided. All parts must
   have the surface of the rule. */
export function combineRules(code: string, parts: RuleModule[]): RuleModule {
  return {
    code,
    surface: parts[0].surface,

    async locate(ctx) {
      const out: Candidate[] = [];
      for (let i = 0; i < parts.length; i++) {
        for (const c of await parts[i].locate(ctx)) out.push({ ...c, data: { part: i, inner: c.data } });
      }
      return out;
    },

    decide(candidate, params) {
      const { part, inner } = candidate.data as { part: number; inner: unknown };
      return parts[part].decide({ ...candidate, data: inner }, params);
    },
  };
}
