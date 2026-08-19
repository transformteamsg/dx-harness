"use client";

import "@fontsource/anonymous-pro/400.css";
import "@fontsource/anonymous-pro/700.css";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/* The builder's note opens as a postcard, because that is what the page is: a
   short message from a named group of people, unaddressed, kept for their own
   record. The device earns its place by being literal rather than decorative —
   the message half carries the actual opening prose, and the picture half
   carries the note's actual illustration.

   The card arrives picture-side up, the way mail lands on a mat, and turns
   itself over as the reader starts to scroll — the reading gesture is the
   flipping gesture, and it is the only control. The interaction contract,
   mirrored from the reference the builder chose (Dia's release-notes postcard):

   - Scroll drives the turn both ways: past the threshold the message shows,
     back above it the picture returns.
   - A reader who never scrolls still gets the message: an idle timer turns the
     card once, after which scrolling may drive it again only once it has
     re-earned the threshold.

   Accessibility holds because the two faces are not equals. The message face is
   the page's opening prose, so it is never inert and never leaves the
   accessibility tree — a screen reader reads the letter from the top regardless
   of which side the card visually shows, which is also why scroll needs no
   accessible substitute control: nothing is ever locked behind the flip. The
   picture face is a figure; it is inert whenever it faces away so its alt text
   is not read twice, and a polite live region names the side now showing. Under
   prefers-reduced-motion the faces swap with no rotation and no transition
   (A11Y-5), and with JavaScript off the message face shows and stays (the
   default state is the prose, and only script turns the card at all). The flip
   emphasises; it never carries (MOT-3).

   The decorative marks — header, caption, spine, postmark, stamp — print in the
   note's franking mono (--font-note-mark, a documented TYP-1 waiver,
   confined to this postcard). The postmark reads MOE DXD because that is who
   sent it, and the stamp is a drawn, symbolic Singapore stamp — an orchid in
   the site's own ink line, not a reproduction of a real SingPost issue, which
   would be someone else's copyrighted artwork (IDN-1's no-recreations rule cuts
   both ways). Both are decoration in the accessibility tree; the date the
   postmark prints is already in the page's byline. */

/* A postage stamp's edge, drawn rather than masked: CSS mask-compositing for a
   perforated edge is four stacked gradients that behave differently across
   engines, where a path is exact and prints the same everywhere.

   The outline walks the rectangle clockwise — top left→right, right
   top→bottom, bottom right→left, left bottom→top — and every notch is an arc
   with sweep-flag 0, which in a y-down space bulges toward the centre. One flag
   for all four edges is the reason the walk is clockwise. */
function scallopPath(w: number, h: number, pitch: number, r: number): string {
  const n = (v: number) => v.toFixed(2);
  const centres = (len: number) => {
    const count = Math.round(len / pitch);
    const s = len / count;
    return Array.from({ length: count }, (_, i) => i * s + s / 2);
  };
  const d = ["M 0 0"];
  for (const c of centres(w)) d.push(`L ${n(c - r)} 0`, `A ${r} ${r} 0 0 0 ${n(c + r)} 0`);
  d.push(`L ${w} 0`);
  for (const c of centres(h)) d.push(`L ${w} ${n(c - r)}`, `A ${r} ${r} 0 0 0 ${w} ${n(c + r)}`);
  d.push(`L ${w} ${h}`);
  for (const c of centres(w)) {
    const x = w - c;
    d.push(`L ${n(x + r)} ${h}`, `A ${r} ${r} 0 0 0 ${n(x - r)} ${h}`);
  }
  d.push(`L 0 ${h}`);
  for (const c of centres(h)) {
    const y = h - c;
    d.push(`L 0 ${n(y + r)}`, `A ${r} ${r} 0 0 0 0 ${n(y - r)}`);
  }
  return d.join(" ") + " Z";
}

const STAMP_W = 78;
const STAMP_H = 94;
const STAMP_EDGE = scallopPath(STAMP_W, STAMP_H, 10.5, 2.2);
const MARK = "var(--font-note-mark)";

/* The stamp: a symbolic Singapore issue drawn in the site's ink line — an
   orchid (the national flower) on the lime the illustrations already own, with
   the country name and a first-local denomination. Symbolic, not a recreation:
   no real SingPost stamp is reproduced. Set a little crooked because a stamp
   applied by hand always is; the tilt is static, so it costs nothing under
   reduced motion. */
function SingaporeStamp() {
  const clip = useId();
  const ink = "var(--foreground)";
  return (
    <svg
      viewBox={`-2 -2 ${STAMP_W + 4} ${STAMP_H + 4}`}
      className="w-[72px] shrink-0 -rotate-2 lg:w-[84px]"
      aria-hidden="true"
    >
      <path d={STAMP_EDGE} fill="var(--surface)" stroke="var(--border)" strokeWidth="0.5" />
      <clipPath id={clip}>
        <path d={STAMP_EDGE} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <rect x="6" y="6" width={STAMP_W - 12} height={STAMP_H - 12} rx="3" fill="var(--site-accent)" />
        {/* The orchid: five rounded petals around a lip, drawn as rotated
            ellipses so they stay plump at stamp size — spiky petals read as a
            leaf, not a flower, once the stamp shrinks to 84px. */}
        <g stroke={ink} strokeWidth="2.6" fill="var(--surface)">
          <ellipse cx="39" cy="35" rx="7.5" ry="12" />
          <ellipse cx="27" cy="43" rx="7.5" ry="11.5" transform="rotate(-64 27 43)" />
          <ellipse cx="51" cy="43" rx="7.5" ry="11.5" transform="rotate(64 51 43)" />
          <ellipse cx="30" cy="57" rx="6.5" ry="10.5" transform="rotate(-132 30 57)" />
          <ellipse cx="48" cy="57" rx="6.5" ry="10.5" transform="rotate(132 48 57)" />
        </g>
        {/* the lip */}
        <path
          d="M 39 50 C 34 54 34 61 39 64 C 44 61 44 54 39 50"
          stroke={ink}
          strokeWidth="2.6"
          fill="var(--site-accent)"
        />
        <circle cx="39" cy="49" r="3" fill={ink} />
      </g>
      <g fill={ink} textAnchor="middle" fontWeight="700" letterSpacing="0.4" fontFamily={MARK}>
        <text x={STAMP_W / 2} y="16.5" fontSize="9">
          SINGAPORE
        </text>
        <text x={STAMP_W - 14} y={STAMP_H - 9} fontSize="8">
          1st
        </text>
      </g>
    </svg>
  );
}

/* The cancellation: a dated ring and the wavy bars that strike out toward the
   stamp. Drawn in --muted-foreground so it reads as ink stamped onto paper
   rather than as type (aria-hidden; the date is in the page byline).

   The bars run just far enough to break across the stamp's face and stop —
   a strike, not a streamer. The whole mark is anchored to the right edge of
   the address half by its parent, so the tail lands on the stamp at any width
   rather than being sized to the half and growing a tail with it. */
function Postmark({ month, year }: { month: string; year: string }) {
  return (
    <svg viewBox="0 0 250 78" className="h-auto w-[250px] max-w-full" aria-hidden="true">
      <g fill="none" stroke="var(--muted-foreground)" strokeWidth="1.3">
        <circle cx="39" cy="39" r="36" />
        <circle cx="39" cy="39" r="30" />
        {/* The two rules a date stamp prints above and below its date. */}
        <path d="M 13 31 H 65" />
        <path d="M 13 51 H 65" />
        {/* Four cancellation bars, each a shallow wave. */}
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M 84 ${21 + i * 12} q 20 -8 41 0 q 21 8 42 0 q 20 -8 41 0`}
            strokeWidth="1.8"
          />
        ))}
      </g>
      <g
        fill="var(--muted-foreground)"
        textAnchor="middle"
        fontWeight="700"
        letterSpacing="0.2"
        fontFamily={MARK}
      >
        <text x="39" y="27" fontSize="10">
          MOE DXD
        </text>
        <text x="39" y="47" fontSize="13">
          {month}
        </text>
        <text x="39" y="64" fontSize="10.5">
          {year}
        </text>
      </g>
    </svg>
  );
}

export function Postcard({
  children,
  picture,
  pictureAlt,
  month = "AUG",
  year = "2026",
}: {
  children?: ReactNode;
  picture: string;
  pictureAlt: string;
  month?: string;
  year?: string;
}) {
  /* flipped = the message side is showing. The default is the message, so a
     page with no JavaScript is the letter, plainly; the effect below turns the
     card picture-side up once script is alive to turn it back. */
  const [flipped, setFlipped] = useState(true);
  const sceneRef = useRef<HTMLDivElement>(null);
  /* The idle timer turned the card; scroll may take over only after the
     threshold has genuinely been crossed once. */
  const timerTurned = useRef(false);
  const rearmed = useRef(false);
  const hadScrolled = useRef(false);

  useEffect(() => {
    setFlipped(false);

    const scene = sceneRef.current;
    if (!scene) return;

    /* The reference's own thresholds: the card turns to the message once the
       page has scrolled at least 50px AND the card has either cleared the fold
       by 32px or carried its midline past 65% of the viewport — and turns back
       when that stops being true. */
    const onScroll = () => {
      const rect = scene.getBoundingClientRect();
      const vh = window.innerHeight;
      if (!hadScrolled.current) hadScrolled.current = window.scrollY > 0;
      const past =
        window.scrollY >= 50 &&
        (rect.bottom <= vh - 32 || rect.top + rect.height / 2 <= 0.65 * vh);
      if (timerTurned.current && !rearmed.current) {
        if (!past) return;
        rearmed.current = true;
      }
      setFlipped(past);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    /* A reader who parks at the top still gets the message. */
    const timer = window.setTimeout(() => {
      if (!hadScrolled.current) {
        timerTurned.current = true;
        setFlipped(true);
      }
    }, 2500);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  /* Both faces share one border, radius, and ground, so the card stays one
     object through the turn. `backface-visibility` hides whichever face is
     pointing away. The min-height keeps the card postcard-proportioned on wide
     screens even when the message runs short, which is also what gives the
     picture face room to show the drawing rather than a letterbox strip of it. */
  const face =
    "rounded-lg border border-border bg-surface [backface-visibility:hidden] " +
    "[-webkit-backface-visibility:hidden]";

  /* The card breaks the letter's 640px measure once there is room for it: a
     postcard is landscape, and at the measure it would stand taller than it is
     wide and stop reading as one. It grows outward symmetrically, so the message
     keeps a comfortable measure in its own half while the address half gets the
     width the stamp and the cancellation need. */
  return (
    <div className="my-10 lg:-mx-25">
      <div ref={sceneRef} className="[perspective:1600px]">
        {/* dx-waive MOT-1 reason="narrative postcard turn on a letter page, not task UI: the --motion-story tier is declared for exactly this case and the flip is the page's only animation" */}
        <div
          className={
            "relative [transform-style:preserve-3d] " +
            "motion-safe:transition-transform motion-safe:duration-(--motion-story) motion-safe:ease-(--ease-in-out)"
          }
          style={{ transform: flipped ? undefined : "rotateY(180deg)" }}
        >
          {/* The message face. In normal flow, so the prose sets the card's
              height and the picture face matches it rather than the other way
              round — the words are what this card is sized for. It is never
              inert: this prose is the page's opening, and a screen reader gets
              the letter from the top whichever side the card visually shows. */}
          <div className={`${face} grid gap-6 p-6 lg:min-h-130 lg:grid-cols-2 lg:gap-0 lg:p-8`}>
            {/* Centred in its half rather than pushed down by a fixed top
                padding: the card has a minimum height the message rarely
                fills, so a padding that looks right for a short letter leaves
                a long one sitting low. Centring balances the two margins at
                any length. */}
            <div className="lg:self-center lg:pr-8 [&>p:last-child]:mb-0">{children}</div>

            {/* The address half of a postcard: the cancellation struck clean
                across the stamp, ruled lines for an address nobody wrote, and
                the printed spine a postcard carries along its divider. The
                blank rules are the honest version of the conceit — this one
                was never posted. */}
            <div className="relative border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
              <span
                aria-hidden="true"
                className="absolute top-1 left-2 hidden font-note-mark text-xs tracking-[0.14em] text-muted-foreground [writing-mode:vertical-rl] lg:block"
              >
                A letter from the builders · vol 01
              </span>
              {/* The stamp sits in the corner; the postmark is laid over it
                  afterwards, so its waves print across the stamp's face the way
                  a genuine cancellation does. */}
              <div className="relative">
                <div className="flex justify-end pr-1">
                  <SingaporeStamp />
                </div>
                <div className="pointer-events-none absolute top-1 right-0">
                  <Postmark month={month} year={year} />
                </div>
              </div>
              {/* One rule survives on narrow screens: it is the clearest signal
                  that the card was never addressed, and losing all three leaves
                  the conceit resting on the stamp alone. */}
              <div aria-hidden="true" className="mt-8 space-y-6 lg:mt-14">
                <div className="border-b border-border" />
                <div className="hidden border-b border-border lg:block" />
                <div className="hidden border-b border-border lg:block" />
              </div>
            </div>
          </div>

          {/* The picture face, laid over the message face at the same size and
              pre-rotated so it faces out while the card is picture-side up. A
              print, not a flood: header line, the drawing full-bleed on its own
              lime, and the sender's mark under it — the front of a postcard as
              the builder mocked it. The drawing keeps its own lime (a shade off
              --site-accent), so the face stays paper and lets the print carry
              the colour.

              It is a figure, not a control, and it is inert whenever it faces
              away so its alt text is not read on top of the letter. */}
          <div
            inert={flipped}
            /* Inline, not a utility class: `transform` is Tailwind's own
               composed property, and an arbitrary `[transform:…]` on top of it
               does not survive. A face that fails to rotate stops hiding its
               back and covers the message, so this one is spelled out. */
            style={{ transform: "rotateY(180deg)" }}
            className={`${face} absolute inset-0 flex flex-col overflow-hidden p-4 sm:p-5`}
          >
            <div className="flex items-baseline justify-between gap-4 pb-3 font-note-mark text-sm text-muted-foreground">
              <span>a letter from builders</span>
              <span className="hidden sm:block">vol 01</span>
              <span>
                {month.charAt(0) + month.slice(1).toLowerCase()} {year}
              </span>
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={picture}
                alt={pictureAlt}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="pt-3 text-right font-note-mark text-sm text-muted-foreground">
              MOE, DXD
            </div>
          </div>
        </div>
      </div>

      {/* No visible control: scrolling is the flip, and the message prose is
          never locked behind it. The live region narrates the turn for a reader
          who cannot see the card move. */}
      <p aria-live="polite" className="sr-only">
        {flipped ? "Showing the message side" : "Showing the picture side"}
      </p>
    </div>
  );
}
