// Regression fixture for the widening this check refuses. A11Y-7 and CMP-6 both
// describe divs used instead of a table, but deciding that this content *is*
// tabular is pattern-fit judgment (cmp-6.md keeps it with the evaluator), and a
// rule that read a CSS grid as a failed table would flag every layout.
export function StatCards() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg p-4">
        <p>Present</p>
        <p>28</p>
      </div>
      <div className="rounded-lg p-4">
        <p>Absent</p>
        <p>2</p>
      </div>
      <div className="rounded-lg p-4">
        <p>Late</p>
        <p>1</p>
      </div>
    </div>
  )
}
