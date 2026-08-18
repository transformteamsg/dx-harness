// Regression fixture for the false positive calibration found. The header region
// is a component reference, so the header cells cannot be resolved from source.
// The finding downgrades to a NOTE per control id, exits 0, and blocks nothing:
// a check never blocks on a guess.
export function Roster() {
  return (
    <table className="w-full">
      <thead>
        <HeaderRow columns={columns} />
      </thead>
      <tbody>
        <tr>
          <td>Ali</td>
        </tr>
      </tbody>
    </table>
  )
}
