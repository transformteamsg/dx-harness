// A computed role is never resolved and never guessed at: only the literal
// role="table" string is matched, so this file is reported as nothing at all.
export function Flexible({ rowRole }) {
  return (
    <div role={rowRole}>
      <div role="row">
        <div role="cell">Ali</div>
      </div>
    </div>
  )
}
