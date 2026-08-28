// A table that carries its header cells is never reported.
export function MarksTable() {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th scope="col">Student</th>
          <th scope="col">Mark</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Ali</td>
          <td>82</td>
        </tr>
      </tbody>
    </table>
  )
}
