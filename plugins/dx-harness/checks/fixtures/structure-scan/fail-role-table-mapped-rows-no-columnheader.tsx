// Regression fixture: the ARIA spelling of the same case. The header row is
// fully static and carries no role="columnheader"; the data rows are rendered
// dynamically. header_region has neither <thead> nor <tr> to key on for a
// role="table" element, so it falls back to the whole subtree — which includes
// the mapped rows' value interpolations ({s.name}). Those must not be mistaken
// for a composed header: the header itself is static and definitely missing its
// columnheader role, so this must still report ERROR, not downgrade to NOTE.
export function AttendanceGrid({ students }) {
  return (
    <div role="table" className="grid">
      <div role="row">
        <div>Name</div>
        <div>Status</div>
      </div>
      {students.map((s) => (
        <div role="row" key={s.id}>
          <div role="cell">{s.name}</div>
          <div role="cell">{s.status}</div>
        </div>
      ))}
    </div>
  )
}
