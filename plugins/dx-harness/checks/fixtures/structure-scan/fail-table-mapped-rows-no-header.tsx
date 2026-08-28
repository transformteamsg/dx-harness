// Regression fixture: a headerless <table> whose body is rendered dynamically,
// the standard React idiom for tabular data. No <thead>, so header_region falls
// back to the first <tr> subtree — which here is the row template inside the
// .map() call, and always carries a value interpolation ({s.name}). That
// interpolation must not be mistaken for a composed header: this table has no
// header at all, the same "one sure case" fail-table-no-header.tsx covers with
// static rows, and it must still report ERROR, not downgrade to NOTE.
export function MarksTable({ students }) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {students.map((s) => (
          <tr key={s.id}>
            <td>{s.name}</td>
            <td>{s.mark}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
