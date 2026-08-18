// transition-all in a file no vendored-path filter covers. It animates whatever
// happens to change, so the animated set cannot be reasoned about.
export function Card() {
  return <div className="rounded-lg border transition-all hover:shadow-md">card</div>;
}
