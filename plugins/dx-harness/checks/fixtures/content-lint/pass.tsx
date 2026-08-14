// content-lint pass fixture: the regression corpus for #153.
// Every shape below reported a finding before the mask-and-extract passes, or is
// a shape that must never report one. The check must stay silent on all of it.

import React from "react";

const cn = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");
const css = (parts: TemplateStringsArray) => parts.join("");

// A Tailwind variant prefix ends in ":", which the word-boundary regex read as
// the end of a word: this fired SLP-9 on "landscape".
export function Saved() {
  return <p className="text-center landscape:text-left">Marks saved.</p>;
}

// An arbitrary value carries a CSS property name inside brackets: this fired
// CNT-13 on "color".
export function Swatch() {
  return <div className="bg-[color:var(--tw-blue)]" />;
}

// A class value wrapped across lines and built by a helper. The whole call is
// masked, so the class strings on their own lines cannot be read as prose: the
// unwrapped form of this fired CNT-3 with a 30-word "sentence".
export function Panel({ extra, wide }: { extra?: string; wide?: boolean }) {
  return (
    <div
      className={cn(
        "flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-center text-sidebar-foreground ring-sidebar-ring outline-hidden hover:bg-sidebar-accent focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 data-[size=md]:text-sm",
        wide && "landscape:text-left please-tight just-in",
        extra
      )}
    >
      <span>Marks saved.</span>
    </div>
  );
}

// A tested value is not copy, on either side of the operator: this fired CNT-1
// twice, calling a tagName comparison a raw error code.
export function isTyping(target: HTMLElement | null) {
  const tag = target?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable === true;
}

// A wordmark is not a raw error code either.
export function Wordmark() {
  return <span className="font-display">TFX</span>;
}

// A style value is CSS, and a tagged template literal is a stylesheet.
const wrapper = { style: "text-align: center; color: red" };
const sheet = css`
  color: red;
  text-align: center;
`;

// Non-rendering attributes hold identifiers and paths, not copy.
export function Field() {
  return (
    <input
      id="center the panel"
      type="text"
      data-tip="text-center landscape:gap-4"
    />
  );
}

// Clean copy stays clean.
export function Empty() {
  return <p>No marks yet. Choose a class to begin.</p>;
}

export { wrapper, sheet };
