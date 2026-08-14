/* The harness in one column: where a brief goes and what it passes through.

   Drawn in markup rather than SVG on purpose. The cells carry words, and an SVG
   <text> sized to fit this figure's width lands under 12px, which fails TYP-2.
   Real elements keep the labels legible, selectable, and scalable — and the shape
   is simple enough that borders and a connector do the whole job.

   The five stage rows beside this map carry the prose; the map carries only what
   prose cannot: the shape, and which stage lives in your repo rather than ours. */

const cell =
  "flex items-center justify-center px-3 py-2 text-center text-xs leading-tight border border-border bg-surface";
const connector = "mx-auto h-4 w-px bg-border";

export function HarnessMap() {
  return (
    <figure className="m-0 flex w-full max-w-[13rem] flex-col gap-2">
      <div>
        <div className={cell}>You</div>
        {/* the one blue link in the chain: the brief entering the front door */}
        <div className="mx-auto h-4 w-px bg-blueprint-ink" />
        <div
          className={`${cell} border-blueprint-ink bg-tw-blue-wash font-medium text-tw-blue`}
        >
          dx-design
        </div>
        <div className={connector} />
        <div className={`${cell} flex-col gap-0.5`}>
          <span className="text-muted-foreground">five propose-only passes</span>
          <span className="font-medium">one builder</span>
        </div>
        <div className={connector} />
        <div className={`${cell} text-muted-foreground`}>catalog · tokens · components</div>
        <div className={connector} />
        <div className={`${cell} border-dashed font-medium`}>DESIGN.md</div>
      </div>
      <figcaption className="text-xs text-muted-foreground">
        Dashed: lives in your repo, not the plugin.
      </figcaption>
    </figure>
  );
}
