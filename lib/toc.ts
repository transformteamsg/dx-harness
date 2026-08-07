export type TocHeading = { depth: 2 | 3; text: string; id: string };

/* Must produce the same id from the markdown source (extractHeadings) and the
   rendered heading text (DocPage's h2/h3 components) — keep both in sync. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^```/.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(##|###)\s+(.+)$/.exec(line);
    if (!match) continue;
    const text = match[2]
      .replace(/`/g, "")
      .replace(/\*\*/g, "")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1")
      .trim();
    headings.push({ depth: match[1].length as 2 | 3, text, id: slugify(text) });
  }
  return headings;
}
