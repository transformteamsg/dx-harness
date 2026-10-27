import { byForm, controls, isLoginForm } from "../forms.ts";
import { readPages } from "../project.ts";
import type { Candidate, RuleModule } from "../types.ts";

/* BD-7b: one marker style across the project. A required control whose label
   uses another marker than mandatoryMarker is a finding. */

export const bd7b: RuleModule = {
  code: "BD-7b",
  surface: "project",

  locate({ files, params }) {
    const marker = String(params.mandatoryMarker);
    const out: Candidate[] = [];
    for (const page of readPages(files)) {
      for (const group of byForm(controls(page)).values()) {
        if (isLoginForm(group)) continue;
        for (const c of group) {
          const label = c.label ?? "";
          if (c.required && !label.includes(marker) && /\brequired\b/i.test(label)) {
            out.push({ file: page.file, line: c.el.line, column: c.el.column, data: { label, marker } });
          }
        }
      }
    }
    return out;
  },

  decide(candidate) {
    const { label, marker } = candidate.data as { label: string; marker: string };
    return `The field "${label}" marks itself as required in words. The project uses "${marker}".`;
  },
};
