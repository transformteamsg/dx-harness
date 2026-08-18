import Link from "next/link";
import { DxdMark } from "@/components/dxd-mark";
import { SheetGround } from "@/components/landing/sheet-ground";

/* The landing shell: its own nav, no docs sidebar, and the whole page drawn as a
   measured sheet — hairline rules down both flanks, and a registration cross where
   each pair of edges meets. The frame is the argument: what the harness sells is a
   structure, so the page is drawn as one. */

const navLink =
  "inline-flex min-h-11 items-center whitespace-nowrap text-sm text-muted-foreground transition-[color] duration-(--motion-fast) hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)";

const footLink =
  "inline-flex min-h-11 items-center hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)";

/* A drafting registration mark — the one device the sheet and the hero blueprint
   share, so the drawing reads as part of the page rather than a guest on it.

   A registration mark has to straddle the edge it registers, which means it needs a
   gutter to sit in. Below 1088px the sheet is full-bleed and there is none, so the
   mark would hang past the viewport and push a horizontal scrollbar (LAY-2, L1).
   It is decoration and aria-hidden, so withdrawing it at those widths costs the
   reader nothing — 1088 is 1040 plus the 24px gutter each side it needs. */
function Registration({ position }: { position: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute hidden size-3 min-[1088px]:block ${position}`}
    >
      <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-blueprint-ink/40" />
      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-blueprint-ink/40" />
    </span>
  );
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-svh bg-background text-foreground">
      <SheetGround />
      {/* z-10 keeps the sheet and everything on it above the ground layer; the
          ground draws only in the flanks, so nothing on the sheet is affected. */}
      <div
        data-sheet
        className="relative z-10 mx-auto w-full max-w-[1040px] border-x border-border"
      >
        <Registration position="-top-1.5 -left-1.5" />
        <Registration position="-top-1.5 -right-1.5" />
        <Registration position="-bottom-1.5 -left-1.5" />
        <Registration position="-bottom-1.5 -right-1.5" />

        <header className="border-b border-border">
          {/* Wraps rather than hides: at 320px the logo and three links cannot share
              one line, and dropping a link would put a control out of reach (LAY-2). */}
          <nav
            aria-label="Primary"
            className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1 px-4 py-3 sm:px-10"
          >
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2.5 text-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)"
            >
              <DxdMark />
              DX Design Harness
            </Link>
            <div className="flex flex-wrap items-center gap-x-5 sm:gap-x-6">
              <Link href="/overview" className={navLink}>
                Docs
              </Link>
              <Link href="/note" className={navLink}>
                Builder&apos;s note
              </Link>
              <a href="https://github.com/transformteamsg/dx-harness" className={navLink}>
                GitHub
              </a>
            </div>
          </nav>
        </header>

        <main id="main-content">{children}</main>

        <footer className="border-t border-border">
          <div className="flex flex-wrap items-center gap-x-7 gap-y-1 px-6 py-4 text-xs text-muted-foreground sm:px-10">
            <Link href="/overview" className={footLink}>
              Docs
            </Link>
            <a
              href="https://github.com/transformteamsg/dx-harness"
              className={footLink}
            >
              Source on GitHub
            </a>
            <a
              href="https://github.com/transformteamsg/dx-harness/blob/main/LICENSE"
              className={footLink}
            >
              GPL-3.0 License
            </a>
            {/* The permissive licenses this site is built on grant redistribution
                only while their notices travel with the copies served. This link
                is how they travel. */}
            <Link href="/legal" className={footLink}>
              Third-party notices
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
