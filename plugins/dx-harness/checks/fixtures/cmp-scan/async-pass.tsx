/* CMP-3: the same async call with an error path. The loading flag is set and
   cleared but never rendered, exactly as components/page-actions.tsx does it, and
   this check makes no claim either way, because whether a state is VISIBLE needs the
   state variable traced into JSX and across components, which is the evaluator's
   half. One error path anywhere in the file is all this rule asks for. */
"use client";

import { useState } from "react";

export function SaveRow({ row }: { row: Row }) {
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (busy) return;
    setBusy(true);
    try {
      await persist(row);
      setStatus("idle");
    } catch {
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  return <button onClick={save}>Save</button>;
}
