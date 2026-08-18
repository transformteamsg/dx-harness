// Both ends of the 100-300ms band fire. Below 100ms a transition reads as a
// jump; above 300ms it reads as a wait.
export function Both() {
  return (
    <>
      <span className="transition-opacity duration-50">too fast</span>
      <span className="transition-opacity duration-500">too slow</span>
      <span className="transition-transform duration-[0.6s]">arbitrary value</span>
    </>
  );
}
