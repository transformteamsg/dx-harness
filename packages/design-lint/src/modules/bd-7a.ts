import { byForm, controls, isLoginForm } from "../forms.ts";
import { readPages } from "../project.ts";
import type { Candidate, RuleModule } from "../types.ts";

/* BD-7a: every required control has a visible marker in its label. When most
   controls of a form are required, each optional control says so. */

export const bd7a: RuleModule = {
  code: "BD-7a",
  surface: "source",

  locate({ files, params }) {
    const marker = String(params.mandatoryMarker);
    const optional = String(params.optionalLabel).toLowerCase();
    const out: Candidate[] = [];
    for (const page of readPages(files)) {
      for (const group of byForm(controls(page)).values()) {
        if (params.loginException === true && isLoginForm(group)) continue;
        const requiredCount = group.filter((c) => c.required).length;
        const mostlyRequired = requiredCount > group.length / 2;
        for (const c of group) {
          const label = c.label ?? "";
          const name = label || c.el.attrs.name || c.el.tag;
          let message: string | null = null;
          if (c.required) {
            if (c.label === null) message = `The required field ${name} has no label. Add a label that shows it is required.`;
            else if (!label.includes(marker) && !/\brequired\b/i.test(label)) {
              message = `The required field "${label}" has no visible marker. Add "${marker}" to its label.`;
            }
          } else if (mostlyRequired && !label.toLowerCase().includes(optional)) {
            message = `Most fields are required, so the optional field "${name}" must say "${optional}" in its label.`;
          }
          if (message) out.push({ file: page.file, line: c.el.line, column: c.el.column, data: { message } });
        }
      }
    }
    return out;
  },

  decide(candidate) {
    return (candidate.data as { message: string }).message;
  },
};
