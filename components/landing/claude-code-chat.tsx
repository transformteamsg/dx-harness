/* Chatting in Claude Code, and what comes back: a terminal window carrying the
   ask, a hairline connector, and a small reviewed screen underneath.

   Drawn in markup rather than SVG for the same reason as the old harness map:
   the figure carries words, and SVG <text> at this width lands under 12px
   (TYP-2). Real elements keep every label at text-xs and selectable. The site
   ships no monospace face (TYP-1), so the prompt sits in the body font — the
   window chrome, not the glyphs, says "terminal". */

const promptLine = "flex items-baseline gap-2 text-xs leading-relaxed";

export function ClaudeCodeChat() {
  return (
    /* role="img" with a label: read cell-by-cell this is a title bar, four
       chat lines, and three grey bars — only the drawing says which is the ask
       and which is the screen that came back. */
    <figure
      className="m-0 flex w-full max-w-[13rem] flex-col gap-2"
      role="img"
      aria-label="A Claude Code session: you type a request in plain words — make the settings page feel calmer. The harness plans passes, builds, and reviews, and a small finished screen comes back underneath."
    >
      <div aria-hidden="true">
        {/* the terminal window */}
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
          <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
            <span className="ml-1.5 truncate text-xs text-muted-foreground">
              ~/your-app
            </span>
          </div>
          <div className="flex flex-col gap-1.5 px-3 py-3">
            <p className={promptLine}>
              <span className="font-semibold text-site-accent-text">❯</span>
              <span className="text-foreground">
                make the settings page feel calmer
                <span className="motion-safe:animate-pulse ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 bg-foreground" />
              </span>
            </p>
            <p className={`${promptLine} text-muted-foreground`}>
              <span className="text-site-accent-text">●</span>
              <span>dx-design · layout + polish passes</span>
            </p>
            <p className={`${promptLine} text-muted-foreground`}>
              <span className="text-site-accent-text">✓</span>
              <span>plan approved · building</span>
            </p>
            <p className={`${promptLine} text-muted-foreground`}>
              <span className="text-site-accent-text">✓</span>
              <span>design review passed</span>
            </p>
          </div>
        </div>

        {/* the one lime link in the chain: the reviewed screen coming back */}
        <div className="mx-auto h-4 w-px bg-blueprint-ink" />

        {/* the screen that comes back — abstract on purpose: grey bars for the
            words, one lime primary, so it reads as "a calm settings page" at a
            glance without pretending to be a real product */}
        <div className="rounded-lg border border-blueprint-ink bg-surface p-3 shadow-sm">
          <div className="h-2 w-20 rounded-full bg-border-strong" />
          <div className="mt-3 flex flex-col gap-2">
            <div className="h-6 rounded-md border border-border bg-background" />
            <div className="h-6 rounded-md border border-border bg-background" />
          </div>
          <div className="mt-3 flex justify-end">
            <div className="h-6 w-16 rounded-md bg-site-accent" />
          </div>
        </div>
      </div>
      <figcaption aria-hidden="true" className="text-xs text-muted-foreground">
        One ask in plain words; a reviewed screen out.
      </figcaption>
    </figure>
  );
}
