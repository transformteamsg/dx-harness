import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* Markdown twins: every page is also available as Markdown by appending `.md`.
   The existing dynamic page routes (app/{section}/[slug]/page.tsx) match a
   single segment, so a request to /guidelines/voice-tone.md would be claimed
   by [slug] (slug="voice-tone.md") and 404 — a root catch-all route is
   silently shadowed. Middleware runs before routing, so it cannot be shadowed:
   we rewrite every *.md request into the /md namespace, which has no page.tsx
   and so is served only by app/md/[...path]/route.ts.

   (The namespace is `/md`, not `/_md`: Next.js treats underscore-prefixed
   folders as private and excludes them from routing, so an `app/_md/**` route
   never registers — the request would still 404.) */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.endsWith(".md")) {
    const url = req.nextUrl.clone();
    url.pathname = "/md" + pathname; // → /md/guidelines/voice-tone.md
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = { matcher: "/((?!_next|md/|favicon).*)" };
