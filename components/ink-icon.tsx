import { inkFilter, inkIcons, inkStroke } from "@/components/ink-icons.generated";

/* One renderer for the Icon Generator's "Ink" preset: baked rough.js paths from
   `ink-icons.generated.ts` plus the feTurbulence edge applied at render time.
   Colour is a prop so section tints and per-context inks keep working (TOK-1);
   the default follows the `--ink` custom-property convention the landing's
   closing figure already uses.

   The filter id derives from the icon name, so rendering the SAME icon twice on
   one page needs `idSuffix` to keep ids unique. */
export function InkIcon({
  name,
  size = 48,
  ink = "var(--ink)",
  idSuffix = "",
}: {
  name: string;
  size?: number;
  ink?: string;
  idSuffix?: string;
}) {
  const icon = inkIcons[name];
  if (!icon) return null;
  const filterId = `ink-${name.replace(/[^a-zA-Z0-9]/g, "-")}${idSuffix}`;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <defs>
        <filter id={filterId} x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={inkFilter.baseFrequency}
            numOctaves={inkFilter.numOctaves}
            seed={icon.seed}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={inkFilter.displacementScale}
          />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        {icon.paths.map((d, index) => (
          <path key={index} d={d} stroke={ink} strokeWidth={inkStroke} fill="none" />
        ))}
      </g>
    </svg>
  );
}
