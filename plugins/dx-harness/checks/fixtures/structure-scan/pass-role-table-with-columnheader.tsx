// One role="columnheader" anywhere under the role="table" subtree clears it.
export function AttendanceGrid() {
  return (
    <div role="table" className="grid">
      <div role="row">
        <span role="columnheader">Student</span>
        <span role="columnheader">Status</span>
      </div>
      <div role="row">
        <div role="cell">Ali</div>
        <div role="cell">Present</div>
      </div>
    </div>
  )
}
