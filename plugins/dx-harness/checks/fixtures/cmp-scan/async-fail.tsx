/* CMP-3: a client file with an async call and no error path anywhere in it. The
   "idle" | "saving" | "error" union is deliberate: a state-name string is never
   evidence that a state exists, so a naive three-states matcher would false-pass
   on this file while the error path is genuinely missing. */
"use client";

import { useState } from "react";

export function SaveRow({ row }: { row: Row }) {
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function save() {
    setStatus("saving");
    await persist(row);
    setStatus("idle");
  }

  return <button onClick={save}>{status === "saving" ? "Saving" : "Save"}</button>;
}
