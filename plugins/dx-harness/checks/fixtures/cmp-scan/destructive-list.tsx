/* CMP-2's lister, exercised across all five handler positions. Every one of
   these is a NOTE and none of them is an ERROR: a candidate is not a violation,
   and the reviewer dispositions it in the verification ledger. The try/catch
   pairs are here so CMP-3 stays quiet and this fixture tests one control. */
"use client";

import { useMutation } from "@tanstack/react-query";

export function NotesRow({ id, row }: { id: string; row: Row }) {
  // Handler position 1: a declaration named `handle*` carrying a verb stem.
  async function handleDelete() {
    try {
      await api.notes.send(id);
    } catch {
      report("could not send");
    }
  }

  // Handler position 3: a hook that turns a function into a transaction.
  const archiveNote = useMutation({ mutationFn: (noteId: string) => api.put(noteId) });

  // Handler position 5: a DELETE fetch spanning more than one line.
  async function submit() {
    try {
      await fetch(`/api/rows/${id}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
      });
    } catch {
      report("could not submit");
    }
  }

  return (
    <AlertDialog>
      <button onClick={handleDelete}>Delete note</button>
      <button onClick={() => archiveNote.mutate(id)}>Archive</button>
      <button onClick={submit}>Submit</button>
      {/* Handler position 2: a JSX prop matching on[A-Z]. */}
      <Menu onDiscard={() => api.put(row.id)} />
    </AlertDialog>
  );
}
