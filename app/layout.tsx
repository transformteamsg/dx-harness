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
OWN-WORLD: two deliberate worlds (docs/decisions/landing-dark.md, user-pinned): a dark Linear-register landing (near-black layered surfaces, hairline borders, the TW blue ramp as the single accent, no gradients/glows/cyan-on-dark) and light docs (docs.stripe.com register); the demo frame is pinned light because it depicts the light Teacher Workspace product.
STORY: an engineer whose agent ships slop arrives skeptical, copies two install commands in the first viewport, reads the promise (intent without loss), traces their ask through the orchestrator diagram (one router, one builder with a human gate), recognizes their own PR in the demo.
FIRST VIEWPORT: landing nav (quincunx wordmark left; Quick start / Docs / GitHub right); hook headline ("Your agent already writes the code. Now it holds the bar."); install panel with the single primary Copy action.
FORM: hook + install → how it works (architecture diagram) → proof (SlopCompare) → path (skill groups) → close (no-CLI); diagram phases render from components/diagrams/loop-data.ts, the contract-of-record.
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
