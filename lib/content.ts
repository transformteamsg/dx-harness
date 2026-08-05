import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type Doc = {
  slug: string;
  section: string;
  title: string;
  description?: string;
  status?: string; // "settled" | "proposed"
  answers?: string; // ladder position, e.g. "why", "must"
  illustration?: string; // Midjourney subject prompt (SREF appended by <Illo>)
  data: Record<string, unknown>; // full frontmatter, for structured fields
  content: string;
};

export function getDoc(section: string, slug: string): Doc | null {
  const file = path.join(CONTENT_DIR, section, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return {
    slug,
    section,
    title: data.title ?? slug,
    description: data.description,
    status: data.status,
    answers: data.answers,
    illustration: data.illustration,
    data,
    content,
  };
}

export function listDocs(section: string): Doc[] {
  const dir = path.join(CONTENT_DIR, section);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => getDoc(section, f.replace(/\.mdx$/, ""))!)
    .filter(Boolean);
}
