// The ARIA spelling of the same defect: role="table" with no role="columnheader"
// anywhere under it. Every cell is static, so nothing here downgrades to a NOTE.
export function AttendanceGrid() {
  return (
    <div role="table" className="grid">
      <div role="row">
        <div role="cell">Ali</div>
        <div role="cell">Present</div>
      </div>
      <div role="row">
        <div role="cell">Bala</div>
        <div role="cell">Absent</div>
      </div>
    </div>
  )
}
