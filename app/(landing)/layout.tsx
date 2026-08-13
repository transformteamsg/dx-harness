import Link from "next/link";

/* Landing shell: its own top navigation, no docs sidebar. The landing renders
   the light :root token world, the same world as the docs (one light world,
   docs/decisions/landing-light-return.md; previously a scoped dark world,
   docs/decisions/landing-dark.md): calm near-monochrome chrome, hairline
   borders, TW blue as the single accent. */

const navLink =
  "inline-flex min-h-11 items-center px-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors duration-(--motion-fast) hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)";

const footerLink =
  "min-h-11 inline-flex items-center hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)";

/* The mark: five squares in a quincunx. The geometry is the brand. Five
   distinct hues, all existing tokens, re-picked for the light world
   where --primary is the TW blue again: the centre carries --primary
   (the brand anchor leads), and the four corners run warm to cool in reading
   order — amber, brown, grass, teal. Roughly even hue steps, so no two dots
   read as the same colour at 6px; the dark-world set drew --sec-standards
   and bg-tw-blue, which the light sheet collapses onto --success-9 (both
   grass) and --primary (both blue). The mark is the recorded polychrome
   exception (docs/decisions/landing-light-return.md). */
/* dx-waive COL-1 reason="brand mark: the quincunx is five distinct hues by construction — one dot per loop phase — and is the single polychrome element on the surface" */
function QuincunxMark() {
  return (
    <span aria-hidden className="grid grid-cols-3 gap-[2px]">
      <span className="size-1.5 bg-(--warning-9)" />
      <span className="size-1.5" />
      <span className="size-1.5 bg-(--sec-harness)" />
      <span className="size-1.5" />
      <span className="size-1.5 bg-primary" />
      <span className="size-1.5" />
      <span className="size-1.5 bg-(--success-9)" />
      <span className="size-1.5" />
      <span className="size-1.5 bg-(--sec-foundations)" />
    </span>
  );
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 w-full max-w-[1080px] items-center justify-between px-6"
        >
          <Link
            href="/"
            className="flex min-h-11 items-center gap-2.5 font-display text-lg font-semibold tracking-tight whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)"
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
