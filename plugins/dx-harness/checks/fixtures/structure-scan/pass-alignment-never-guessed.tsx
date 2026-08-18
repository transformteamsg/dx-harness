// Regression fixture for CMP-6's excluded clauses. This table centres a numeric
// column and sets no tabular figures, which CMP-6's prose does call a failure.
// The check still reports nothing: a source scan cannot see which figures line up
// in a rendered column, and cmp-6.md exempts a deliberately left-aligned
// identifier column, a distinction no source scan can make. Alignment and
// tabular figures stay with the evaluator.
export function ClassCodes() {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th scope="col">Class</th>
          <th scope="col" className="text-center">Mark</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>4E1</td>
          <td className="text-center font-sans">82</td>
        </tr>
        <tr>
          <td>4E2</td>
          <td className="text-center font-sans">7</td>
        </tr>
      </tbody>
    </table>
  )
}
