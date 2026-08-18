// Regression fixture for the rendered runner's half of A11Y-7. This file skips a
// heading level and builds a list out of divs, both of which axe decides on a
// rendered page (heading-order, list, listitem). This check reports nothing, so
// one structural defect is never counted twice.
export function Overview() {
  return (
    <section>
      <h1>Class 4E1</h1>
      <h3>Recent marks</h3>
      <div className="flex flex-col gap-2">
        <div>Ali scored 82</div>
        <div>Bala scored 76</div>
      </div>
    </section>
  )
}
