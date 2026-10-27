import fs from "node:fs";
import { elements, hasAncestor } from "../../html.ts";
import type { HtmlElement } from "../../html.ts";
import { fileForPath } from "../../project.ts";
import type { Candidate, RuleModule } from "../../types.ts";

/* The flow rules of WU: WU-12a, WU-13a, and WU-14a. A flow is an object that
   maps a name to the ordered paths of its pages, the shape of the `flows` key
   of the config. WU-12a and WU-13a read the same parameter, `flows`. */

type Flows = Record<string, string[]>;

interface Step {
  path: string;
  file: string;
  els: HtmlElement[];
}

function readFlow(root: string, paths: string[]): { steps: Step[]; missing: string[] } {
  const steps: Step[] = [];
  const missing: string[] = [];
  for (const p of paths) {
    const file = fileForPath(root, p);
    if (file) steps.push({ path: p, file, els: elements(fs.readFileSync(file, "utf8")) });
    else missing.push(p);
  }
  return { steps, missing };
}

const NOT_DATA = new Set(["hidden", "submit", "button", "reset", "image", "search"]);

/* The fields that a user fills in. A search box in the header is not data. */
function fields(step: Step): HtmlElement[] {
  return step.els.filter((e) => {
    const isField = e.tag === "select" || e.tag === "textarea" || (e.tag === "input" && !NOT_DATA.has((e.attrs.type ?? "text").toLowerCase()));
    return isField && !hasAncestor(step.els, e, (a) => a.tag === "form" && a.attrs.role === "search");
  });
}

/* WU-12a: after the last step that takes input, a later step shows the entered
   data and offers a confirm control. "Shows the entered data" is a heuristic: the
   step has a summary element (dl, table, or [data-review]). */
export const wu12a: RuleModule = {
  code: "WU-12a",
  surface: "project",

  locate({ root, params }) {
    const out: Candidate[] = [];
    if (params.reviewStepRequired !== true) return out;
    for (const [name, paths] of Object.entries(params.flows as Flows)) {
      const { steps, missing } = readFlow(root, paths);
      for (const m of missing) out.push({ file: root, line: 1, column: 1, data: { message: `The flow "${name}" lists ${m}, which does not exist under the project root.` } });
      const input = steps.map((s) => fields(s).length > 0);
      const last = input.lastIndexOf(true);
      if (last === -1) continue;
      const review = steps.slice(last + 1).some(
        (s) =>
          s.els.some((e) => e.tag === "dl" || e.tag === "table" || "data-review" in e.attrs) &&
          s.els.some((e) => (e.tag === "button" && (e.attrs.type ?? "submit").toLowerCase() === "submit") || (e.tag === "input" && (e.attrs.type ?? "").toLowerCase() === "submit")),
      );
      if (!review) out.push({ file: steps[last].file, line: 1, column: 1, data: { message: `The flow "${name}" has no review step after its last input step, ${steps[last].path}. Add a step that shows the entered data and a confirm button.` } });
    }
    return out;
  },

  decide(candidate) {
    return (candidate.data as { message: string }).message;
  },
};

/* WU-13a: a field that appears on two pages of a flow. The key of a field is its
   first autocomplete token, or its name. A search field is not data. */
export const wu13a: RuleModule = {
  code: "WU-13a",
  surface: "project",

  locate({ root, params }) {
    const skip = (params.confirmFields as string[]).map((s) => String(s).toLowerCase());
    const out: Candidate[] = [];
    for (const [name, paths] of Object.entries(params.flows as Flows)) {
      const { steps } = readFlow(root, paths);
      const seen = new Map<string, string>();
      for (const step of steps) {
        const onPage = new Set<string>();
        for (const f of fields(step)) {
          const token = (f.attrs.autocomplete ?? "").toLowerCase().split(/\s+/).find((t) => t && t !== "on" && t !== "off" && !t.startsWith("section-"));
          const fieldName = (f.attrs.name ?? "").toLowerCase();
          const key = token ?? fieldName;
          if (!key || onPage.has(key) || skip.includes(key) || skip.includes(fieldName)) continue;
          onPage.add(key);
          const earlier = seen.get(key);
          if (earlier) out.push({ file: step.file, line: f.line, column: f.column, data: { flow: name, key, earlier } });
        }
        for (const key of onPage) if (!seen.has(key)) seen.set(key, step.path);
      }
    }
    return out;
  },

  decide(candidate) {
    const d = candidate.data as { flow: string; key: string; earlier: string };
    return `The field "${d.key}" is asked for again in the flow "${d.flow}". It first appears on ${d.earlier}. Fill in the earlier value, or confirm that asking again is essential.`;
  },
};

/* WU-14a: the declared login methods include one that needs no memory or
   transcription. A service that declares no method has no login. */
export const wu14a: RuleModule = {
  code: "WU-14a",
  surface: "project",

  locate({ root, params }) {
    return [{ file: root, line: 1, column: 1, data: { methods: params.authMethods, accessible: params.accessibleMethods } }];
  },

  decide(candidate) {
    const { methods, accessible } = candidate.data as { methods: string[]; accessible: string[] };
    if (methods.length === 0 || methods.some((m) => accessible.includes(m))) return null;
    return `The login methods (${methods.join(", ")}) all need memory or transcription. Offer one of: ${accessible.join(", ")}.`;
  },
};
