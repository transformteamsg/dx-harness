import Link from "next/link";

/* Landing shell: its own top navigation, no docs sidebar. The landing runs in
   its own dark token scope (`landing-dark`, docs/decisions/landing-dark.md):
   near-black layered surfaces, hairline borders, the TW blue ramp as the
   single accent. Docs keep the light :root world — the boundary is this
   shell. */

const navLink =
  "inline-flex min-h-11 items-center px-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors duration-(--motion-fast) hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)";

const footerLink =
  "min-h-11 inline-flex items-center hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)";

/* The mark: five squares in a quincunx — one per loop phase. Re-inked from
   the docs palette (tw-blue / amber / grass / teal / cyan); the geometry is
   the brand, the tape colours retired with the dark landing world. */
function QuincunxMark() {
  return (
    <span aria-hidden className="grid grid-cols-3 gap-[2px]">
      <span className="size-1.5 bg-tw-blue" />
      <span className="size-1.5" />
      <span className="size-1.5 bg-(--warning-9)" />
      <span className="size-1.5" />
      <span className="size-1.5 bg-(--sec-foundations)" />
      <span className="size-1.5" />
      <span className="size-1.5 bg-(--success-9)" />
      <span className="size-1.5" />
      <span className="size-1.5 bg-(--sec-products)" />
    </span>
  );
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing-dark flex min-h-svh flex-col bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 w-full max-w-[1080px] items-center justify-between px-6"
        >
          <Link
            href="/"
            className="flex min-h-11 items-center gap-2.5 font-display text-lg font-semibold tracking-tight whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
          >
            <QuincunxMark />
            dx-harness
          </Link>
          <div className="flex items-center gap-1 sm:gap-4">
            {/* Below 360px the four nav items overflow (LAY-2); the install
                block is near the top of the page there anyway. */}
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
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1080px] flex-wrap items-center gap-4 px-6 py-8 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/overview" className={footerLink}>
              Docs
            </Link>
            <a
              href="https://github.com/transformteamsg/dx-harness"
              className={footerLink}
            >
              Source on GitHub
            </a>
            <a
              href="https://github.com/transformteamsg/dx-harness/blob/main/LICENSE"
              className={footerLink}
            >
              MIT License
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
