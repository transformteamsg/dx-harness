/*
 * pass.tsx: a slop-scan fixture holding the JSX narrowings, as regression cases.
 * Every element here is real code from this repo, or one line away from it.
 */

/* The live cva base string. It carries bg-clip-padding inside a long class
   list, so a substring match on `bg-clip-` fires wrongly here. The rule matches
   the clip VALUE, so `padding` is never mistaken for `text`. */
const button =
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all";

export function Fine() {
  return (
    <div className={button}>
      {/* The sidebar outline variant: offsets 0, blur 0, spread 1px. A
          blur-free shadow is a border, not a glow. */}
      <button className="bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:shadow-[0_0_0_1px_var(--border)]" />

      {/* One stop in band, one out: not a gradient palette. */}
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--demo-slop-grad-a), var(--tw-blue))",
        }}
      />

      {/* Below the 3px floor, and no radius either. */}
      <a className="-ml-px block border-l-2 py-1 pr-2">Contents</a>

      {/* A rounded card with a hairline on every side and a thicker left edge:
          the remaining sides are 1px, not 0, so this is not a side tab. */}
      <div className="rounded-lg border border-border border-l-4 p-4" />

      {/* Two sides, so not a side tab. */}
      <div className="rounded-lg border-x-4 p-4" />

      {/* A clip to text with no transparent fill. */}
      <span className="bg-clip-text text-sm" style={{ background: "var(--surface)" }}>
        Solid text
      </span>

      {/* "from-" and "to-" in prose are not colour stops: the Tailwind arm
          needs a gradient-direction utility before it reads a stop at all. */}
      <p>Everything here is built from-scratch and shipped to-order.</p>
    </div>
  );
}
