// a11y-eslint fixture — the rules jsx-a11y's maintainers switch OFF on purpose
// must stay off. Every construct below would be flagged by a rule the
// `recommended` preset disables, and by nothing the preset keeps:
//
//   prefer-tag-over-role        the role="button" div (use <button>)
//   control-has-associated-label the same div, whose only child is an icon
//   label-has-for               the <label> that associates by nesting, not htmlFor
//
// All 39 rules was measured on this repo and rejected; the preset's exception
// tables are the reason. This file must produce zero findings.

import React from "react";

export function IconToggle({ onToggle }: { onToggle: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Toggle the panel"
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onToggle();
      }}
    >
      <svg aria-hidden="true" width={16} height={16} />
    </div>
  );
}

export function SearchField() {
  return (
    <label>
      Search
      <input type="search" name="q" />
    </label>
  );
}
