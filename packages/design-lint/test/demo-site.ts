import type { Patch } from "../src/patch.ts";

/* Runs the test of one break patch: the patched site makes exactly the findings that the patch expects. */
export async function checkPatch(_patch: Patch): Promise<void> {
  throw new Error("checkPatch is not written yet");
}
