import type { Candidate, RuleModule } from "../../types.ts";
import { pageStart, sourcePages } from "./pages.ts";

/* PR-2a and PR-2d: a page loads a script that matches a pattern. The patterns
   are not published, so each is a parameter. A pattern is a regular expression
   tested against the src of each <script> tag. */

function scriptRule(code: string, patternParam: string, what: string, skip?: (p: Record<string, unknown>) => boolean): RuleModule {
  return {
    code,
    surface: "source",
    locate({ root, params }) {
      const out: Candidate[] = [];
      if (skip?.(params)) return out;
      const pattern = new RegExp(String(params[patternParam]));
      for (const page of sourcePages(root, params.pages as string[])) {
        const found = page.els.some((e) => e.tag === "script" && e.attrs.src !== undefined && pattern.test(e.attrs.src));
        if (!found) out.push({ file: page.file, ...pageStart(page.els), data: { pattern: String(params[patternParam]) } });
      }
      return out;
    },
    decide(candidate) {
      const { pattern } = candidate.data as { pattern: string };
      return `The page loads no ${what}. Add a <script> tag whose src matches ${pattern}.`;
    },
  };
}

/* customisable false is the DSS exception for SaaS and COTS products. */
export const pr2a = scriptRule("PR-2a", "trackingScriptPattern", "WOGAA tracking script", (p) => p.customisable === false);
export const pr2d = scriptRule("PR-2d", "sentimentsScriptPattern", "WOGAA Sentiments script");
