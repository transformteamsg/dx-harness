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
THESIS: the machine explained where the visitor asks "how does this work?" — the token-drawn architecture diagram is the hero's demonstration; the before/after demo is the proof below it.
OWN-WORLD: one light world (docs/decisions/landing-light-return.md, reversing landing-dark.md): the landing and the docs share the light :root tokens and the same calm documentation register (seed-design.io docs pages as the reference) — near-monochrome chrome, hairline borders, TW blue as the single accent; the demo frame needs no pinning because it already depicts the light Teacher Workspace product in a light world.
STORY: an engineer whose agent ships slop arrives skeptical, copies two install commands in the first viewport, reads the promise (intent without loss), traces their ask through the orchestrator diagram (one router, one builder with a human gate), recognizes their own PR in the demo.
FIRST VIEWPORT: landing nav (quincunx wordmark left; Quick start / Docs / GitHub right); hook headline ("Your agent already builds the UI. Now it holds the design bar."); install panel with the single primary Copy action.
FORM: hook + install (no-CLI in a dialog) → core features → how it works (the isometric five-layer map) → proof (SlopCompare) → path (skill groups); the landing renders no loop phases — the loop's contract-of-record stays components/diagrams/loop-data.ts, rendered only by the docs OrbitLoop.
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
