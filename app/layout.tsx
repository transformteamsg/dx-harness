import type { Metadata } from "next";
import "@fontsource/eb-garamond/400.css";
import "@fontsource/eb-garamond/600.css";
import "@fontsource-variable/inter";
import "@proj-airi/font-departure-mono";
import "@radix-ui/colors/gray.css";
import "@radix-ui/colors/lime.css";
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
THESIS: a measured SVG orchestration field is the landing's visual anchor; the architecture diagram explains the harness and the before/after demo proves the result below it.
OWN-WORLD: one light world and one type hierarchy: Inter carries body and interface text across landing and docs; EB Garamond is reserved for titles and headings. Departure Mono marks the brand, code, commands, and measured labels. The art direction takes structural cues from illustrated service manuals without copying proprietary type or artwork.
STORY: an engineer whose agent ships slop sees a designed system, follows Quick start into the docs, traces their ask through the orchestrator diagram, and recognizes their own PR in the demo.
FIRST VIEWPORT: compact landing nav; moderate serif promise and supporting copy; at wide viewports, the reading column sits beside a dominant authored SVG built from the DXD logo grid's canonical quartic, polar field, ratio construction, routing paths, inspection, and reviewed output; at narrow viewports, that pair returns to one reading column.
FORM: editorial hero → core features → how it works (the five-stage SVG map) → proof (SlopCompare) → path (skill groups); install instructions live in the docs Quick start page, and the landing renders no loop phases.
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
