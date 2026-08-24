// a11y-eslint pass fixture — the corrected form of each fail case.
// This file must produce zero findings under jsx-a11y's recommended preset.

import React from "react";

// Corrected: a real button carries the click handler and is keyboard-reachable.
export function SelectableRow({ name, onSelect }: { name: string; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect}>
      <span>{name}</span>
    </button>
  );
}

// Corrected: the image carries a text alternative.
export function Avatar({ src, name }: { src: string; name: string }) {
  return <img src={src} alt={name} width={32} height={32} />;
}

// Corrected: the ARIA property is spelled as ARIA defines it.
export function Panel({ headingId }: { headingId: string }) {
  return <section aria-labelledby={headingId}>content</section>;
}
