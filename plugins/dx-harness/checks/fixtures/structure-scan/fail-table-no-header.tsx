// A real table missing its header cells: the one sure case this check ships.
// Reported under A11Y-7 and CMP-6, at the opening element's line.
export function MarksTable() {
  return (
    <table className="w-full text-sm">
      <tbody>
        <tr>
          <td>Ali</td>
          <td>82</td>
        </tr>
        <tr>
          <td>Bala</td>
          <td>76</td>
        </tr>
      </tbody>
    </table>
  )
}
