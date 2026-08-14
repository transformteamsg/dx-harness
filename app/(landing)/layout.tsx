import Link from "next/link";
import { DxdMark } from "@/components/dxd-mark";

/* Landing shell: its own top navigation, no docs sidebar. The landing renders
   the light :root token world, the same world as the docs (one light world,
   docs/decisions/landing-light-return.md; previously a scoped dark world,
   docs/decisions/landing-dark.md): calm near-monochrome chrome, hairline
   borders, ink primary actions, TW blue for links and code accents, and the
   lime figure steps for the mark and figures
   (docs/decisions/landing-lime-figures.md). */

/* transition-[color], not transition-colors: v4's colors set animates
   outline-color too, and a focus ring must appear instantly. */
const navLink =
  "inline-flex min-h-11 items-center px-2 font-mono text-xs tracking-[0.08em] whitespace-nowrap text-muted-foreground transition-[color] duration-(--motion-fast) hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)";

const footerLink =
  "min-h-11 inline-flex items-center hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)";

/* The mark is shared with the docs topbar: components/dxd-mark.tsx (the frozen
   quartic path, lime-deep fill + lime-ink outline; COL-1 waiver at its
   definition). */

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing-manual flex min-h-svh flex-col bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-6"
        >
          <Link
            href="/"
            className="flex min-h-11 items-center gap-2 font-mono text-sm tracking-[0.08em] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring) sm:text-base"
          >
            {/* size-6 below sm: at 360px the 32px mark pushed the nav to
                368px and clipped "GitHub" (LAY-2). */}
            <DxdMark className="size-6 shrink-0 text-(--dxd-lime-deep) sm:size-8" />
            DX-HARNESS
          </Link>
          <div className="flex items-center gap-1 sm:gap-4">
            <Link href="/harness/install" className={`${navLink} max-[399px]:hidden`}>
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
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-4 px-6 py-8 font-mono text-xs tracking-[0.06em] text-muted-foreground">
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
