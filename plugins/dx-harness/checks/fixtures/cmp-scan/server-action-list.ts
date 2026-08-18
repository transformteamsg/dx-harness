/* Handler position 4: a module-level exported function in a file carrying a
   "use server" directive. `saveRow` has no destructive verb stem, so only
   `purgeRow` is listed: the position alone never makes a candidate. */
"use server";

export async function purgeRow(id: string) {
  try {
    await db.rows.send(id);
  } catch {
    logFailure(id);
  }
}

export async function saveRow(id: string, body: string) {
  try {
    await db.rows.put(id, body);
  } catch {
    logFailure(id);
  }
}
