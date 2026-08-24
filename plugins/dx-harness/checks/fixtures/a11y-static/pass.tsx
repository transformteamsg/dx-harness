// a11y-static pass fixture — the corrected form of the FOCUS rule (A11Y-2).
// This file should produce zero violations.

import React from "react";

// --- Clean: A11Y-2 FOCUS (corrected) ---
// outline-none is paired with focus-visible:ring-2 on the same class string
export function DropdownOption({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-3 py-2 text-left outline-none focus-visible:ring-2 hover:bg-gray-100"
    >
      {label}
    </button>
  );
}

// --- Clean: no outline removal at all, so nothing to replace ---
export function SaveButton() {
  return <button className="px-3 py-2">Save</button>;
}
