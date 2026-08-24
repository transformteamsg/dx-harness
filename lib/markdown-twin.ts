import { getDoc } from "@/lib/content";
import { contentMap } from "@/lib/content-map";
import { movedPages } from "@/lib/redirects";
import { getCatalog, getPublicCatalogYaml } from "@/lib/catalog";
import { getControlDetail, listControlIds } from "@/lib/control-detail";

/* The single source of which canonical `.md` twin URLs exist and how each
   renders. The /llms.txt index and sitemap derive from allTwins(); the route
   handler also includes the narrow compatibility aliases below.

   A twin is "frontmatter-derived header + the raw MDX body, JSX stripped" —
   no HTML→Markdown conversion, because getDoc() already hands back the raw
   MDX body with frontmatter removed. The catalog twin is the one exception:
   its render builds a readable table from getCatalog() + the public YAML. */

export type Twin = {
  mdPath: string; // e.g. /guidelines/voice-tone.md  (/ → /index.md)
  htmlPath: string; // e.g. /guidelines/voice-tone   (/ stays /)
  title: string;
  description?: string;
  render: () => string;
};

/* Singletons: html path → the content/sections/<slug>.mdx that backs it.
   A new singleton needs a row here (docs/sections flow in automatically). */
const SINGLETONS: { htmlPath: string; mdPath: string; section: string; slug: string }[] = [
  { htmlPath: "/", mdPath: "/index.md", section: "sections", slug: "landing" },
  { htmlPath: "/note", mdPath: "/note.md", section: "sections", slug: "builders-note" },
  { htmlPath: "/overview", mdPath: "/overview.md", section: "sections", slug: "home" },
];

export function toMarkdown(title: string, description: string | undefined, body: string): string {
  return `# ${title}\n\n` + (description ? `> ${description}\n\n` : "") + stripJsx(body);
}

/* Code-span / fence-aware JSX stripper. Outside fenced code blocks and inline
   `code` spans, JSX/HTML element blocks are replaced with an honest placeholder
   (or an image converted to Markdown). Inside fences/spans, bytes are untouched
   so literals like `<button>`, `<ID>`, `<Link>` survive verbatim.

   Body JSX appears in a handful of content pages — specimen grids, figures
   and diagrams — none of which carry prose a machine reader needs. */
export function stripJsx(body: string): string {
  const lines = body.split("\n");
  const out: string[] = [];
  let inFence = false;
  let fenceMarker = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();

    // Track fenced code blocks (``` or ~~~). Inside a fence, copy verbatim.
    const fenceOpen = trimmed.match(/^(```+|~~~+)/);
    if (fenceOpen) {
      if (!inFence) {
        inFence = true;
        fenceMarker = fenceOpen[1][0].repeat(3); // normalise to length-3 type marker
        out.push(line);
        continue;
      }
      // Closing fence must use the same marker character.
      if (fenceMarker && trimmed.startsWith(fenceMarker)) {
        inFence = false;
        fenceMarker = "";
        out.push(line);
        continue;
      }
    }
    if (inFence) {
      out.push(line);
      continue;
    }

    // Outside a fence: only a line that *begins* a JSX/HTML element block is a
    // candidate. A line whose leading `<` sits inside inline code is not.
    if (/^<[A-Za-z]/.test(trimmed)) {
      const tag = trimmed.match(/^<([A-Za-z][\w-]*)/)?.[1] ?? "";
      const j = skipElementBlock(lines, i);
      const blockText = lines.slice(i, j + 1).join("\n");
      const replacement = renderStrippedBlock(tag, blockText);
      if (replacement) out.push(replacement);
      i = j; // consume the whole block
      continue;
    }

    out.push(line);
  }

  // Collapse runs of 3+ blank lines that placeholder substitution can leave.
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

/* Given the index of a line that begins a `<tag …` element, return the index
   of the line that closes it. Tracks the depth of that one tag across opens
   (`<tag …>`), self-closes (`<tag … />`), and closes (`</tag>`). If the whole
   element self-closes on the start line, that line is the end. Conservative
   fallback: if no matching close is ever found, stop at the next blank line so
   following prose is never swallowed. */
function skipElementBlock(lines: string[], start: number): number {
  const tag = lines[start].trimStart().match(/^<([A-Za-z][\w-]*)/)?.[1];
  if (!tag) return start;

  const selfCloseRe = new RegExp(`<${tag}\\b[^>]*/>`, "g");
  // An open tag is `<tag …>` that is NOT self-closing (`/>`).
  const openRe = new RegExp(`<${tag}\\b(?:[^>]*[^/>])?>`, "g");
  const closeRe = new RegExp(`</${tag}\\s*>`, "g");

  let depth = 0;
  let sawOpen = false;

  for (let k = start; k < lines.length; k++) {
    const l = lines[k];
    const selfCloses = countMatches(l, selfCloseRe);
    const opens = countMatches(l, openRe);
    const closes = countMatches(l, closeRe);

    if (opens > 0) sawOpen = true;
    depth += opens - closes;

    // Whole element self-closed on the start line and nothing left open.
    if (k === start && selfCloses > 0 && opens === 0) return k;
    // We have opened at least one and the depth has returned to zero.
    if (sawOpen && depth <= 0) return k;
    // Safety: a blank line with nothing open ends the block before prose.
    if (k > start && depth <= 0 && l.trim() === "") return k - 1;
  }
  return lines.length - 1;
}

function countMatches(s: string, re: RegExp): number {
  return (s.match(re) || []).length;
}

const PROSE_CONTAINERS = new Set(["Aside", "Postcard"]);

/* Turn a stripped element block into honest Markdown. Images become
   ![alt](src); everything else collapses to a single placeholder line. */
function renderStrippedBlock(tag: string, blockText: string): string | null {
  // Collect any informative <img alt … src …> inside the block as Markdown.
  const imgs: string[] = [];
  const imgRe = /<img\b[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(blockText))) {
    const alt = m[0].match(/\balt\s*=\s*"([^"]*)"/)?.[1] ?? "";
    const src = m[0].match(/\bsrc\s*=\s*"([^"]*)"/)?.[1] ?? "";
    if (src) imgs.push(`![${alt}](${src})`);
  }
  if (imgs.length > 0) return imgs.join("\n\n");

  // These wrap prose rather than replace it — an Aside is a container, a
  // Postcard is a frame around the words it holds. Both keep their inner
  // Markdown in the twin and lose only the tags; collapsing either to
  // "interactive element omitted" would drop real copy from the page.
  if (PROSE_CONTAINERS.has(tag)) {
    const inner = blockText
      .replace(new RegExp(`^\\s*<${tag}\\b[^>]*>\\s*`), "")
      .replace(new RegExp(`\\s*</${tag}\\s*>\\s*$`), "")
      .trim();
    return inner || null;
  }

  if (tag === "svg" || tag === "figure") {
    return "*(diagram omitted — view it on the page)*";
  }
  return "*(interactive element omitted — view it on the page)*";
}

function sectionTwins(): Twin[] {
  const twins: Twin[] = [];

  // Dynamic docs: each section's slugs. For root sections the first slug is
  // the section-root doc (its twin comes from SINGLETONS); later slugs are
  // normal /section/slug pages.
  for (const [key, def] of Object.entries(contentMap)) {
    for (const [i, slug] of def.slugs.entries()) {
      if (def.root && i === 0) continue;
      const doc = getDoc(key, slug);
      if (!doc) continue;
      const htmlPath = `/${key}/${slug}`;
      twins.push({
        mdPath: `${htmlPath}.md`,
        htmlPath,
        title: doc.title,
        description: doc.description,
        render: () => toMarkdown(doc.title, doc.description, doc.content),
      });
    }
  }

  return twins;
}

function sectionIndexTwins(): Twin[] {
  const twins: Twin[] = [];
  // Each section key (incl. standards) → content/sections/<key>.mdx if present.
  for (const key of Object.keys(contentMap)) {
    if (contentMap[key].root) continue; // root sections render at their own path, handled as a doc
    if (key === "standards") continue; // /standards redirects to the combined catalog page
    const doc = getDoc("sections", key);
    if (!doc) continue;
    const htmlPath = `/${key}`;
    twins.push({
      mdPath: `${htmlPath}.md`,
      htmlPath,
      title: doc.title,
      description: doc.description,
      render: () => toMarkdown(doc.title, doc.description, doc.content),
    });
  }
  return twins;
}

function singletonTwins(): Twin[] {
  const twins: Twin[] = [];
  for (const s of SINGLETONS) {
    const doc = getDoc(s.section, s.slug);
    if (!doc) continue;
    twins.push({
      mdPath: s.mdPath,
      htmlPath: s.htmlPath,
      title: doc.title,
      description: doc.description,
      render: () => toMarkdown(doc.title, doc.description, doc.content),
    });
  }
  return twins;
}

/* The catalog twin: a readable Markdown table from getCatalog(), a fails_when
   sub-list, then the public YAML in a fenced block + a link to the YAML route. */
function catalogTwin(): Twin {
  const htmlPath = "/standards/catalog";
  return {
    mdPath: "/standards/catalog.md",
    htmlPath,
    title: "Standards catalog",
    description:
      "How the standard works, followed by every standard and its verifiable fail conditions.",
    render: () => renderCatalogMarkdown(),
  };
}

function renderCatalogMarkdown(): string {
  const controls = getCatalog();
  const standards = getDoc("sections", "standards");
  const sorted = [...controls].sort((a, b) =>
    a.category === b.category ? a.id.localeCompare(b.id, undefined, { numeric: true }) : a.category.localeCompare(b.category),
  );
  const esc = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

  const rows = sorted
    .map((c) => `| ${c.id} | ${c.tier} | ${c.check} | ${esc(c.category)} | ${esc(c.statement)} |`)
    .join("\n");
  const table = [
    "| ID | Tier | Check | Category | Statement |",
    "| --- | --- | --- | --- | --- |",
    rows,
  ].join("\n");

  const withFails = sorted.filter((c) => c.fails_when && c.fails_when.length > 0);
  const failsBlock =
    withFails.length > 0
      ? "\n\n## Fails when\n\n" +
        withFails
          .map((c) => `- **${c.id}**\n` + c.fails_when!.map((f) => `  - ${f}`).join("\n"))
          .join("\n")
      : "";

  const yamlBlock =
    "\n\n## Machine source\n\n" +
    "The catalog is also published as data at [/standards/catalog.yaml](/standards/catalog.yaml). The same content, inline:\n\n" +
    "```yaml\n" +
    getPublicCatalogYaml().trimEnd() +
    "\n```\n";

  const header = standards
    ? `${toMarkdown(standards.title, standards.description, standards.content).trimEnd()}\n\n## All standards`
    : "# Standards\n\n## All standards";

  return `${header}\n\n${table}${failsBlock}${yamlBlock}`;
}

/* Honest note shown when a control has no extended detail file. Exported so
   the HTML detail page renders the identical text — one note, two surfaces. */
export const NO_EXTENDED_DETAIL =
  "No extended detail — this standard is defined by its catalog entry above. Full rationale and examples are added when a standard needs them.";

/* Per-control twins (/standards/catalog/<id>.md): one reader (getControlDetail),
   the same body the HTML page shows. Header + a tier · check · category line,
   fails_when, then the canonical controls/<id>.md body or the no-detail note. */
export function controlMarkdown(id: string): string {
  const detail = getControlDetail(id);
  if (!detail) return `# ${id.toUpperCase()}\n\n${NO_EXTENDED_DETAIL}\n`;

  const parts: string[] = [];
  parts.push(`# ${detail.id} — ${detail.statement}`);
  parts.push(`${detail.tier} · ${detail.check} · ${detail.category}`);
  if (detail.fails_when && detail.fails_when.length > 0) {
    parts.push(
      "**Fails when:** " + detail.fails_when.join(" · "),
    );
  }
  parts.push(detail.body ?? NO_EXTENDED_DETAIL);
  return parts.join("\n\n") + "\n";
}

function controlTwins(): Twin[] {
  return listControlIds().map((id) => {
    const detail = getControlDetail(id);
    const htmlPath = `/standards/catalog/${id}`;
    return {
      mdPath: `${htmlPath}.md`,
      htmlPath,
      title: detail ? `${detail.id} — ${detail.statement}` : id.toUpperCase(),
      render: () => controlMarkdown(id),
    };
  });
}

let cached: Twin[] | null = null;

export function allTwins(): Twin[] {
  if (cached) return cached;
  cached = [
    ...sectionTwins(),
    ...sectionIndexTwins(),
    ...singletonTwins(),
    catalogTwin(),
    ...controlTwins(),
  ];
  return cached;
}

/* Keep previously published machine-reader URLs working without advertising
   duplicate documents in /llms.txt, /llms-full.txt, or the sitemap. The IA
   restructure's moved pages (lib/redirects.ts) each alias their old `.md`
   path to the twin now living at the new path. */
function compatibilityTwins(): Twin[] {
  const byHtmlPath = new Map(allTwins().map((t) => [t.htmlPath, t]));
  const moved: Twin[] = [];
  for (const [oldPath, newPath] of Object.entries(movedPages)) {
    const target = byHtmlPath.get(newPath);
    if (!target) continue;
    moved.push({ ...target, mdPath: `${oldPath}.md` });
  }
  return [
    {
      mdPath: "/standards.md",
      htmlPath: "/standards/catalog",
      title: "Standards catalog",
      description: "Compatibility alias for the combined Standards page.",
      render: () => renderCatalogMarkdown(),
    },
    ...moved,
  ];
}

export function mdPaths(): string[] {
  return [...allTwins(), ...compatibilityTwins()].map((t) => t.mdPath);
}

/* Resolve a list of URL segments (e.g. ["guidelines","voice-tone.md"]) to a
   twin. Requires a trailing `.md`; matches canonical twins and compatibility
   aliases by mdPath. */
export function resolveTwin(segments: string[]): Twin | null {
  const joined = "/" + segments.join("/");
  if (!joined.endsWith(".md")) return null;
  return [...allTwins(), ...compatibilityTwins()].find((t) => t.mdPath === joined) ?? null;
}

export function markdownResponse(text: string, htmlPath: string): Response {
  return new Response(text, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      vary: "Accept",
      "x-robots-tag": "noindex",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      link: `<${htmlPath}>; rel="canonical"`,
    },
  });
}

/* Metadata helper: a page advertises its `.md` twin via a rel="alternate"
   link of type text/markdown. Spread into a page's metadata export. */
export function mdAlternate(htmlPath: string) {
  return {
    alternates: { types: { "text/markdown": `${htmlPath}.md` } },
  };
}
