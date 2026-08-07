import { notFound } from "next/navigation";
import { resolveTwin, mdPaths, markdownResponse } from "@/lib/markdown-twin";

/* The .md twin handler. Middleware rewrites every *.md request to
   /md/<original path>.md; this namespace has no page.tsx, so nothing
   shadows it. The [...path] segment captures everything *after* /md, so the
   prerendered params are the bare twin paths (e.g. ["guidelines",
   "voice-tone.md"]) — no /md prefix here. */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return mdPaths().map((p) => ({
    path: p.replace(/^\//, "").split("/"),
  }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  // path is the segments after /md, e.g. ["guidelines","voice-tone.md"].
  const twin = resolveTwin(path);
  if (!twin) notFound();
  return markdownResponse(twin.render(), twin.htmlPath);
}
