/* The Flesch-Kincaid grade level of an English text. The syllable count is a
   heuristic: it counts groups of vowels and drops a silent final e. */

export function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w === "") return 0;
  const groups = w.match(/[aeiouy]+/g)?.length ?? 0;
  const silentE = /[^aeiouy]e$/.test(w) && !/(le|ye)$/.test(w) ? 1 : 0;
  return Math.max(1, groups - silentE);
}

export function fleschKincaid(text: string): number {
  const words = text.match(/[A-Za-z']+/g) ?? [];
  const sentences = text.split(/[.!?]+(?:\s|$)/).filter((s) => /[A-Za-z]/.test(s)).length || 1;
  if (words.length === 0) return 0;
  const total = words.reduce((n, w) => n + syllables(w), 0);
  return 0.39 * (words.length / sentences) + 11.8 * (total / words.length) - 15.59;
}

export const wordCount = (text: string): number => (text.match(/[A-Za-z0-9']+/g) ?? []).length;
