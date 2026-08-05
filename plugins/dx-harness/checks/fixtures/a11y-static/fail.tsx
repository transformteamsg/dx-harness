// a11y-static fail fixture — one planted violation per rule
// Each violation is labelled with the expected control id.

import React from "react";

// --- Violation 1: A11Y-2 FOCUS ---
// outline-none with no focus-visible replacement on the same class string
export function DropdownOption({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="w-full px-3 py-2 text-left outline-none hover:bg-gray-100">
      {label}
    </button>
  );
}

// --- Violation 2: A11Y-2 KBD ---
// div with onClick, no role, no tabIndex
export function ClickableRow({ name, onSelect }: { name: string; onSelect: () => void }) {
  return (
    <div onClick={onSelect} className="flex items-center gap-2 cursor-pointer">
      <span>{name}</span>
    </div>
  );
}

// --- Violation 3: A11Y-3 NAME ---
// icon-only button with no aria-label
import { SearchIcon } from "lucide-react";

export function SearchButton({ onSearch }: { onSearch: () => void }) {
  return (
    <button onClick={onSearch}><SearchIcon /></button>
  );
}
