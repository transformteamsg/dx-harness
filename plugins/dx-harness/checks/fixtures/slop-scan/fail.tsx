/*
 * fail.tsx: a slop-scan fixture with one violation per JSX detection rule.
 *
 * Expected violations:
 *   SLP-1  gradient palette, in a module constant
 *   SLP-1  gradient palette, as a Tailwind stop triple
 *   SLP-1  glow accent, blur 10px at offset 2px
 *   SLP-2  gradient text, with className and the gradient style on DIFFERENT
 *          source lines, which is what a line-local rule cannot catch
 *   SLP-3  side-tab accent, one thick side on a rounded container
 */

const SLOP_GRADIENT =
  "linear-gradient(135deg, var(--demo-slop-grad-a), var(--demo-slop-grad-b))";

export function Slop() {
  return (
    <div>
      <div
        className="flex items-center px-4 py-2.5"
        style={{ background: SLOP_GRADIENT }}
      >
        Communication Hub
      </div>
      <span
        className="bg-clip-text text-sm font-medium text-transparent"
        style={{ backgroundImage: SLOP_GRADIENT }}
      >
        Term 3 broadcast
      </span>
      <span className="rounded-md px-3.5 py-2 shadow-[0_2px_10px_var(--demo-slop-grad-a)]">
        Get started!
      </span>
      <div className="rounded-lg border-l-4 border-l-casesync p-4">
        A side tab on a rounded card
      </div>
      <div className="bg-linear-to-r from-violet-500 to-purple-500 p-4">
        The Tailwind stop triple
      </div>
    </div>
  );
}
