// a11y-static fail fixture — the FOCUS rule (A11Y-2), the one rule this check keeps.
// Keyboard reachability and accessible names are jsx-a11y's on a real AST:
// see fixtures/a11y-eslint/.

import React from "react";

// --- Violation: A11Y-2 FOCUS ---
// outline-none with no focus-visible replacement on the same class string
export function DropdownOption({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full px-3 py-2 text-left outline-none hover:bg-gray-100">
      {label}
    </button>
  );
}
