// This file violates both of MOT-2's matchable clauses: it hardcodes a raw
// duration where the token set exists, and it animates while declaring no motion
// token set. MOT-2 is status: proposed, so no rule here fires on it and no
// [MOT-2] line can appear. Its coverage rests on the gap: reason it carries in
// the catalogue, which says the harness does not enforce a rule a design lead
// has not ratified.
//
// The 250ms literal is in band, so MOT-1 is silent on it too. That is the point:
// the only thing wrong with this file is MOT-2, and MOT-2 is not enforced.
export function Legacy() {
  return (
    <div className="transition-colors" style={{ transitionDuration: "250ms" }}>
      legacy surface
    </div>
  );
}
