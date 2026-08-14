/**
 * style-object.tsx — parity fixture: a raw value inside a style={{}} object.
 *
 * The raw hex and the off-scale padding in the style object are DELIBERATELY not
 * reported. TOK-1, TOK-2 and TOK-3 are scoped to a style context, and a JSX style
 * object has never been one. The ast-grep front end reaches the context; the
 * unchanged policy layer is what declines it. Widening that scope would change
 * what the check decides, which this refactor forbids — it belongs to a control
 * change of its own.
 *
 * Expected findings (recorded from the pre-swap engine, see expected/):
 *   token-audit  COL-2  bg-zinc-100
 *   type-scan    none
 */
export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: "#0064ff", padding: "15px" }} className="bg-zinc-100">
      {children}
    </div>
  );
}
