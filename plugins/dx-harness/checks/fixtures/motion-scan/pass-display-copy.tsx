// Display copy that names a duration is not a use of it. This file renders the
// motion token table, so it prints "600ms" as text; no vendored-file filter
// covers it, which makes anchoring the only thing between the check and four
// false positives. Every duration rule is anchored to a duration property, a
// duration utility or a duration: key, so a bare ms literal never fires.
import { DUR } from "@/lib/motion";

export const ROWS = [
  { token: "--motion-fast", ms: "120ms", duration: DUR.fast },
  { token: "--motion-base", ms: "200ms", duration: DUR.base },
  { token: "--motion-slow", ms: "300ms", duration: DUR.slow },
  { token: "--motion-story", ms: "600ms", duration: DUR.story },
];

export const CAPTION = "Interface motion stays between 100ms and 300ms.";
