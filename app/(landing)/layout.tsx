import Link from "next/link";

/* Landing shell: its own top navigation, no docs sidebar. The dark, print-flat
   landing world (--canvas-* / --tape-* tokens) is scoped here; docs pages keep
   the light shell in app/(docs)/layout.tsx. */

const navLink =
  "inline-flex min-h-11 items-center px-2 text-sm font-medium whitespace-nowrap text-canvas-muted transition-colors duration-(--motion-fast) hover:text-canvas-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tape-yellow)";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-canvas text-canvas-ink">
      <header className="border-b border-canvas-line">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-6"
        >
          <Link
            href="/"
            className="flex min-h-11 items-center gap-2.5 font-display text-lg font-semibold tracking-tight whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tape-yellow)"
          >
            {/* The mark: five squares in a quincunx — one per loop phase
                (intent, diverge, plan gate, implement, verify). */}
            <span aria-hidden className="grid grid-cols-3 gap-[2px]">
              <span className="size-1.5 bg-tape-pink" />
              <span className="size-1.5" />
              <span className="size-1.5 bg-tape-yellow" />
              <span className="size-1.5" />
              <span className="size-1.5 bg-tape-blue" />
              <span className="size-1.5" />
              <span className="size-1.5 bg-tape-green" />
              <span className="size-1.5" />
              <span className="size-1.5 bg-tape-orange" />
            </span>
            dx-harness
          </Link>
          <div className="flex items-center gap-1 sm:gap-4">
            {/* Below 360px the four nav items overflow (LAY-2); the install
                block is the first thing on the page there anyway. */}
            <Link href="/#quick-start" className={`${navLink} max-[359px]:hidden`}>
              Quick start
            </Link>
            <Link href="/overview" className={navLink}>
              Docs
            </Link>
            <a
              href="https://github.com/transformteamsg/dx-harness"
              className={navLink}
            >
              GitHub
            </a>
          </div>
        </nav>
      </header>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-canvas-line">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-canvas-muted">
          <p>TransformX · GovTech Singapore</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/overview" className="min-h-11 inline-flex items-center hover:text-canvas-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tape-yellow)">
              Docs
            </Link>
            <a
              href="https://github.com/transformteamsg/dx-harness"
              className="min-h-11 inline-flex items-center hover:text-canvas-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tape-yellow)"
            >
              Source on GitHub
            </a>
            <a
              href="https://github.com/transformteamsg/dx-harness/blob/main/LICENSE"
              className="min-h-11 inline-flex items-center hover:text-canvas-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tape-yellow)"
            >
              MIT License
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
