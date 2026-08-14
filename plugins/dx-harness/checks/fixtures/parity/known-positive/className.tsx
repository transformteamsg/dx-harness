/**
 * className.tsx — parity fixture: a raw value inside a className string.
 *
 * Expected findings (recorded from the pre-swap engine, see expected/):
 *   token-audit  COL-2  bg-slate-200
 *   token-audit  TOK-1  #ff0000 inside the text-[…] arbitrary value
 *   type-scan    none
 */
export function Badge({ label }: { label: string }) {
  return (
    <span className="bg-slate-200 text-[#ff0000] px-4 py-2">{label}</span>
  );
}
