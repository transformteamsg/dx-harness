// a11y-eslint fail fixture — one planted violation per covered control.
// Each violation names the rule the preset switches on and the control it maps to.

import React from "react";

// jsx-a11y/click-events-have-key-events + no-static-element-interactions -> A11Y-2
export function ClickableRow({ name, onSelect }: { name: string; onSelect: () => void }) {
  return (
    <div onClick={onSelect}>
      <span>{name}</span>
    </div>
  );
}

// jsx-a11y/alt-text -> A11Y-6
export function Avatar({ src }: { src: string }) {
  return <img src={src} width={32} height={32} />;
}

// jsx-a11y/aria-props -> A11Y-8 (aria-labeledby is not an ARIA property)
export function Panel({ headingId }: { headingId: string }) {
  return <section aria-labeledby={headingId}>content</section>;
}
