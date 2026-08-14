/**
 * multiline-jsx.tsx — parity fixture: the offending attribute sits three lines
 * below the opening tag, mirroring components/ui/sheet.tsx and
 * components/ui/sidebar.tsx, which both open a tag on a line of its own.
 *
 * Expected findings (recorded from the pre-swap engine, see expected/):
 *   token-audit  COL-2  bg-red-500      — on the attribute's line, not the tag's
 *   token-audit  TOK-1  #00ff00         — same line
 *   type-scan    none
 */
export function Cta() {
  return (
    <button
      type="button"
      className="bg-red-500 text-[#00ff00]"
    >
      Save
    </button>
  );
}
