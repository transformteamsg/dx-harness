/* Rendered iconography specimen for the Iconography foundations page: the
   same six glyphs rendered twice, flat Lucide beside the inked Icon
   Generator output, so the difference between the two families is visible
   rather than just described. Flat grid, no card-per-icon chrome (SLP-11).
   The inked glyphs are decorative (aria-hidden) — the visible name beneath
   each pair carries the meaning (A11Y-3 territory). */

import type { CSSProperties } from "react";
import { Palette, Type, Layers, MessageCircle, RefreshCw, Image } from "lucide-react";
import { inkIcons, inkFilter, inkStroke } from "@/components/ink-icons.generated";

function InkIcon({ artKey, size }: { artKey: string; size: number }) {
  const icon = inkIcons[artKey];
  if (!icon) return null;
  const filterId = `inkr-${artKey.replace(/[^a-zA-Z0-9]/g, "-")}`;
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
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={inkFilter.displacementScale} />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        {icon.paths.map((d, i) => (
          <path key={i} d={d} stroke="var(--ink)" strokeWidth={inkStroke} fill="none" />
        ))}
      </g>
    </svg>
  );
}

const PAIRS = [
  { name: "palette", key: "foundations/colour", Lucide: Palette },
  { name: "type", key: "foundations/typography", Lucide: Type },
  { name: "layers", key: "harness/skills", Lucide: Layers },
  { name: "message-circle", key: "guidelines/voice-tone", Lucide: MessageCircle },
  { name: "refresh-cw", key: "harness/loop", Lucide: RefreshCw },
  { name: "image", key: "guidelines/illustration", Lucide: Image },
] as const;

export function BrandIconSet() {
  return (
    <figure className="my-8">
      <div
        className="rounded-lg border border-border bg-surface p-4"
        style={{ "--ink": "var(--tw-blue)" } as CSSProperties}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {PAIRS.map(({ name, key, Lucide }) => (
            <div key={key} className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <Lucide aria-hidden size={24} strokeWidth={2} />
                  <span className="text-xs text-muted-foreground">Lucide</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <InkIcon artKey={key} size={24} />
                  <span className="text-xs text-muted-foreground">Ink</span>
                </div>
              </div>
              <span className="text-center text-xs text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 max-w-[60ch] text-xs leading-[1.6] text-muted-foreground">
        Same glyphs, two renderings: flat Lucide for interface, inked for marketing and comms.
      </figcaption>
    </figure>
  );
}
