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

/* The mark: the canonical DXD quartic mark (components/landing/hero-geometry.tsx),
   the same p=4 concave superellipse rotated 45°, frozen as a static path so the
   nav glyph never re-runs the construction math. It carries the harness's own
   accent, --dxd-lime (Radix lime-9), kept apart from --tw-blue so the mark reads
   as the harness's identity rather than a Teacher Workspace brand moment. */
/* dx-waive COL-1 reason="brand mark: the harness's own identity is drawn in --dxd-lime, a second accent held apart from the page's Teacher Workspace primary (--tw-blue), same exception this mark has always carried (docs/decisions/landing-light-return.md)" */
function DxdMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 1000"
      className="size-6 shrink-0 text-(--dxd-lime)"
    >
      <path
        fill="currentColor"
        d="M 712.13 712.13 L 711.11 711.11 L 708.06 708.10 L 703.00 703.19 L 695.98 696.60 L 687.08 688.56 L 676.38 679.39 L 663.98 669.45 L 650.00 659.10 L 634.58 648.75 L 617.85 638.80 L 600.00 629.64 L 581.18 621.60 L 561.58 615.00 L 541.38 610.10 L 520.79 607.09 L 500.00 606.07 L 479.21 607.09 L 458.62 610.10 L 438.42 615.00 L 418.82 621.60 L 400.00 629.64 L 382.15 638.80 L 365.42 648.75 L 350.00 659.10 L 336.02 669.45 L 323.62 679.39 L 312.92 688.56 L 304.02 696.60 L 297.00 703.19 L 291.94 708.10 L 288.89 711.11 L 287.87 712.13 L 288.89 711.11 L 291.90 708.06 L 296.81 703.00 L 303.40 695.98 L 311.44 687.08 L 320.61 676.38 L 330.55 663.98 L 340.90 650.00 L 351.25 634.58 L 361.20 617.85 L 370.36 600.00 L 378.40 581.18 L 385.00 561.58 L 389.90 541.38 L 392.91 520.79 L 393.93 500.00 L 392.91 479.21 L 389.90 458.62 L 385.00 438.42 L 378.40 418.82 L 370.36 400.00 L 361.20 382.15 L 351.25 365.42 L 340.90 350.00 L 330.55 336.02 L 320.61 323.62 L 311.44 312.92 L 303.40 304.02 L 296.81 297.00 L 291.90 291.94 L 288.89 288.89 L 287.87 287.87 L 288.89 288.89 L 291.94 291.90 L 297.00 296.81 L 304.02 303.40 L 312.92 311.44 L 323.62 320.61 L 336.02 330.55 L 350.00 340.90 L 365.42 351.25 L 382.15 361.20 L 400.00 370.36 L 418.82 378.40 L 438.42 385.00 L 458.62 389.90 L 479.21 392.91 L 500.00 393.93 L 520.79 392.91 L 541.38 389.90 L 561.58 385.00 L 581.18 378.40 L 600.00 370.36 L 617.85 361.20 L 634.58 351.25 L 650.00 340.90 L 663.98 330.55 L 676.38 320.61 L 687.08 311.44 L 695.98 303.40 L 703.00 296.81 L 708.06 291.90 L 711.11 288.89 L 712.13 287.87 L 711.11 288.89 L 708.10 291.94 L 703.19 297.00 L 696.60 304.02 L 688.56 312.92 L 679.39 323.62 L 669.45 336.02 L 659.10 350.00 L 648.75 365.42 L 638.80 382.15 L 629.64 400.00 L 621.60 418.82 L 615.00 438.42 L 610.10 458.62 L 607.09 479.21 L 606.07 500.00 L 607.09 520.79 L 610.10 541.38 L 615.00 561.58 L 621.60 581.18 L 629.64 600.00 L 638.80 617.85 L 648.75 634.58 L 659.10 650.00 L 669.45 663.98 L 679.39 676.38 L 688.56 687.08 L 696.60 695.98 L 703.19 703.00 L 708.10 708.06 L 711.11 711.11 Z"
      />
    </svg>
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
            className="flex min-h-11 items-center gap-2 font-display text-lg font-semibold tracking-tight whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)"
          >
            <DxdMark />
            dx-harness
          </Link>
          <div className="flex items-center gap-1 sm:gap-4">
            <Link href="/harness/install" className={`${navLink} max-[359px]:hidden`}>
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
