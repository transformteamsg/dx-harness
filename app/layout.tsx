import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "DX Design Harness", template: "%s — DX Design Harness" },
  description:
    "The DX Design Harness gives your agent one front door, checkable standards, and an independent reviewer before the work ships.",
};

/* Root layout carries only what every route group shares: the document, the
   fonts, the stylesheet, and the skip link. The chrome lives one level down —
   `(docs)/layout.tsx` for the documentation shell, `(landing)/layout.tsx` for
   the front page. Each group provides its own `#main-content` target, so the
   skip link below works from either. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:outline-2 focus:outline-offset-2 focus:outline-(--color-ring)"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
