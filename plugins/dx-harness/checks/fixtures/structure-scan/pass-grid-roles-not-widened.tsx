// Regression fixture for the two roles the narrowing leaves out. role="grid" and
// role="treegrid" carry keyboard-interaction contracts a source scan cannot
// judge, so neither is matched even with no column header in sight.
export function EditableGrid() {
  return (
    <div>
      <div role="grid">
        <div role="row">
          <div role="gridcell">Ali</div>
        </div>
      </div>
      <div role="treegrid">
        <div role="row">
          <div role="gridcell">4E1</div>
        </div>
      </div>
    </div>
  )
}
