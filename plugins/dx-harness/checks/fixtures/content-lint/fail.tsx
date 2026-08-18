// content-lint fail fixture: one planted violation per origin the check reads.
// Each is labelled `want: <CTL-ID>`, and the self-test asserts every label is
// reported. Text children, rendering props and template segments were out of
// reach before #153, so this file is what proves they are in reach now.

import React from "react";

// want: CNT-3 (a sentence over 25 words, in a text child spanning three lines)
export function Intro() {
  return (
    <p className="text-sm text-muted-foreground">
      This sentence has way more than twenty five words in it because we keep
      adding more and more padding to push the count well past the documented
      limit now okay.
    </p>
  );
}

// want: CNT-13 (a US spelling in a rendering prop)
export function Card() {
  return <section title="Organize the class list" />;
}

// want: CNT-5 (a device-bound verb in a template segment, never in the
// interpolated expression)
export function status(n: number) {
  return `Saved ${n} marks. Click here to organise the list.`;
}

// want: SLP-9 (a buzzword in a shipped string literal)
export const tagline = "Streamline your marking";

// want: CNT-6 (an empty opener in a copy table)
export const COPY = { empty: "There is no data to show yet." };

// want: CNT-1 ("Something went wrong" with no next step, in a text child)
export function Failed() {
  return <p>Something went wrong.</p>;
}
