import type { Candidate } from "../../types.ts";

/* Helpers that the rules of A11Y share. */

export const VIEWPORT = { width: 1280, height: 800 };

/* The message that locate put in the candidate. */
export const message = (candidate: Candidate): string => (candidate.data as { message: string }).message;
