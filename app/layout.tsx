import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "TFX Design Standard", template: "%s — TFX Design Standard" },
  description:
    "How TransformX designs the Teacher & School portfolio: principles, checkable standards, guidelines, foundations, and the AI design harness. For human builders and AI agents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="text/x-direction-contract"
          // Direction contract — kept in emitted markup so the build can be audited.
          dangerouslySetInnerHTML={{
            __html: `
THESIS: the harness demonstrated in its own material — a print-flat spec sheet for a design loop, refusing the SaaS hero-gradient-and-card-grid arrangement.
OWN-WORLD: near-black canvas ruled with hairline grid; oversized white grotesk display; flat vivid tape strips (pink/yellow/green/blue, plus orange — the loop's five-phase truth forces a fifth tape colour) carrying mono sentence-case phase labels (caps traded for TYP-4 compliance); no gradients, no glows, no cards.
STORY: a designer arrives skeptical, reads "design skills your agent runs", sees the loop phases as labeled tape, copies two install commands, leaves able to say what the loop does.
FIRST VIEWPORT: landing nav (wordmark left; Quick start / Docs / GitHub right); giant two-line headline crossed by phase-label tape strips; one-line lede; terminal block with the two commands and the single primary Copy action.
FORM: pinned by brief — Hex×Grafana identity system (user-supplied reference); no seed roll, pinned direction beats it.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
`,
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:outline-2 focus:outline-offset-2 focus:outline-(--color-tw-blue)"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
