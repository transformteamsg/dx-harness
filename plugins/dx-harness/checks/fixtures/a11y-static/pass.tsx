// a11y-static pass fixture — corrected forms of each rule
// This file should produce zero violations.

import React from "react";

// --- Clean 1: A11Y-2 FOCUS (corrected) ---
// outline-none is paired with focus-visible:ring-2 on the same class string
export function DropdownOption({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="w-full px-3 py-2 text-left outline-none focus-visible:ring-2 hover:bg-gray-100">
      {label}
    </button>
  );
}

// --- Clean 2: A11Y-2 KBD (corrected) ---
// div has role="button", tabIndex, and a key handler
export function ClickableRow({ name, onSelect }: { name: string; onSelect: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(); }}
      className="flex items-center gap-2 cursor-pointer"
    >
      <span>{name}</span>
    </div>
  );
}

// --- Clean 3: A11Y-3 NAME (corrected) ---
// icon-only button has aria-label
import { SearchIcon } from "lucide-react";

export function SearchButton({ onSearch }: { onSearch: () => void }) {
  return (
    <button aria-label="Search" onClick={onSearch}><SearchIcon /></button>
  );
}

// --- Clean 4: native button with visible text (no extra attrs needed) ---
export function SaveButton() {
  return <button>Save</button>;
}
