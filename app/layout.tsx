import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "dx-harness", template: "%s — dx-harness" },
  description:
    "The dx-harness design standard: principles, checkable standards, guidelines, foundations, and the design loop the agent runs. For human builders and AI agents.",
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
THESIS: the canonical DXD construction is the landing's visual anchor; the architecture diagram explains the harness and the before/after demo proves the result below it.
OWN-WORLD: one light world (docs/decisions/landing-light-return.md, reversing landing-dark.md): the landing and the docs share the light :root tokens and the same calm documentation register (seed-design.io docs pages as the reference) — near-monochrome chrome, hairline borders, TW blue as the single accent; the demo frame needs no pinning because it already depicts the light Teacher Workspace product in a light world.
STORY: an engineer whose agent ships slop sees a designed system, follows Quick start into the docs, traces their ask through the orchestrator diagram, and recognizes their own PR in the demo.
FIRST VIEWPORT: landing nav (quincunx wordmark left; Quick start / Docs / GitHub right); hook headline; one Quick start action; the measured DXD quartic mark and construction grids from the logo-grid-generator.
FORM: poster hero → core features → how it works (the isometric five-layer map) → proof (SlopCompare) → path (skill groups); install instructions live in the docs Quick start page, and the landing renders no loop phases.
FINISH: unreviewed and undocumented is unfinished; this build ends with the verify verdict, the decision record, and DESIGN.md.
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
