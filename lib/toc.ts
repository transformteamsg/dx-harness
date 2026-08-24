export type TocHeading = {
  depth: 2 | 3;
  text: string;
  id: string;
  /* First line of prose under the heading, for the rail's hover card. Empty
     when the section opens on a fence, table, or another heading. */
  snippet: string;
};

const SNIPPET_MAX = 120;

/* Must produce the same id from the markdown source (extractHeadings) and the
   rendered heading text (DocPage's h2/h3 components) — keep both in sync. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

/* Markdown the rail shows as plain text: links keep their label, code spans and
   bold lose their delimiters. Deliberately not a Markdown parser — this text is
   never rendered as markup, so anything left over is just characters. */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/`/g, "")
    .replace(/\*\*/g, "")
    .trim();
}

/* Truncate on a word boundary, not mid-word — a cut like "the harness rep…"
   reads as a typo where "the harness…" reads as a preview. */
function truncate(text: string): string {
  if (text.length <= SNIPPET_MAX) return text;
  const cut = text.slice(0, SNIPPET_MAX);
  const lastSpace = cut.lastIndexOf(" ");
  const kept = lastSpace > 40 ? cut.slice(0, lastSpace) : cut;
  /* Dangling joining punctuation before the ellipsis reads as a typo: "not a
     subdirectory —…" against "not a subdirectory…". */
  return `${kept.replace(/[\s,;:—–-]+$/, "")}…`;
}

/* Lines that carry no readable preview: another heading, a table row, an MDX
   component, a directive, a blockquote marker on its own, a horizontal rule. */
function isProse(line: string): boolean {
  if (!line) return false;
  return !/^(#{1,6}\s|\||<|:::|---|\*\*\*|___)/.test(line);
}

export function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  let inFence = false;
  /* The heading still waiting for the paragraph beneath it, and that
     paragraph's lines so far. Doc bodies are hard-wrapped at about 80 columns,
     so a single source line is half a sentence — the snippet has to join the
     whole paragraph back together before it truncates, or every preview ends
     mid-clause. */
  let awaiting: TocHeading | null = null;
  let paragraph: string[] = [];

  const flush = () => {
    if (awaiting && paragraph.length) {
      awaiting.snippet = truncate(toPlainText(paragraph.join(" ")));
    }
    awaiting = null;
    paragraph = [];
  };

  for (const line of markdown.split("\n")) {
    if (/^```/.test(line.trim())) {
      inFence = !inFence;
      /* A section that opens on a code block gets no snippet rather than prose
         from further down, which would describe a different point. */
      flush();
      continue;
    }
    if (inFence) continue;

    const match = /^(##|###)\s+(.+)$/.exec(line);
    if (match) {
      flush();
      const text = toPlainText(match[2]);
      const heading: TocHeading = {
        depth: match[1].length as 2 | 3,
        text,
        id: slugify(text),
        snippet: "",
      };
      headings.push(heading);
      awaiting = heading;
      continue;
    }

    if (!awaiting) continue;
    const trimmed = line.trim();
    /* Blank lines between the heading and its paragraph are skipped; the first
       blank line after the paragraph has started ends it. */
    if (!trimmed) {
      if (paragraph.length) flush();
      continue;
    }
    if (!isProse(trimmed)) {
      flush();
      continue;
    }
    /* List and quote markers are layout, not words — drop the marker and keep
       the sentence, so a section that opens on a bulleted list still previews. */
    paragraph.push(trimmed.replace(/^([-*+]|\d+\.|>)\s+/, ""));
    if (paragraph.join(" ").length > SNIPPET_MAX) flush();
  }
  flush();

  return headings;
}
