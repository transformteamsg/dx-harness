// Every literal here sits inside 100-300ms, and duration-0 is the reduced-motion
// idiom: zero means no motion, so it never fires at either end of the band.
export function Row() {
  return (
    <>
      <span className="transition-colors duration-150">fast</span>
      <span className="transition-colors duration-200">base</span>
      <span className="transition-colors duration-300">on the upper bound</span>
      <span className="transition-colors duration-100">on the lower bound</span>
      <span className="motion-reduce:duration-0 transition-colors duration-200">reduced</span>
    </>
  );
}
