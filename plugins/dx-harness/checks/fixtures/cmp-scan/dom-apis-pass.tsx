/* The CMP-2 denylist, applied before anything is emitted. Every destructive-
   looking token here is DOM or collection housekeeping, so this file yields no
   candidate at all, which is the calibration answer for a tree with no destructive
   actions. Without the denylist, the JSX prop and the timer handler below would
   both be listed. */
"use client";

import { useEffect, useRef } from "react";

export function Panel({ node }: { node: HTMLElement }) {
  const seen = useRef(new Map<string, number>());
  const timer = useRef<number>();

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // `remove` here is a DOM ref's own remove(), which takes no arguments.
  function handleTeardown() {
    node.remove();
    node.parentElement?.removeChild(node);
    clearTimeout(timer.current);
    clearInterval(timer.current);
    seen.current.delete("row");
    URL.revokeObjectURL(objectUrl);
    formRef.current?.reset();
  }

  return (
    <div
      onPointerLeave={() => node.removeEventListener("pointermove", handleKeyDown)}
      onClick={handleTeardown}
    >
      Panel
    </div>
  );
}
