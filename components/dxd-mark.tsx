/* The mark: the canonical DXD quartic mark, a p=4 concave superellipse rotated
   45°, frozen as a static path so the
   nav glyph never re-runs the construction math. It carries the harness's own
   accent — --dxd-lime-deep fill with a --dxd-lime-ink outline — kept apart from
   --tw-blue so the mark reads as the harness's identity rather than a Teacher
   Workspace brand moment. Shared by the landing header and the docs topbar. */
/* dx-waive COL-1 reason="brand mark: the harness's own identity is drawn in the lime steps, the standing override recorded in DESIGN.md Colour (docs/decisions/landing-lime-figures.md)" */
type DxdMarkProps = {
  className?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export function DxdMark({ className, x, y, width, height }: DxdMarkProps) {
  return (
    <svg
      aria-hidden
      /* Cropped to the glyph's ink (the path spans 288–712 of the source's
         1000-unit frame) so the mark fills its box instead of floating at
         42% — the box edge and the visible ink now agree (LAY-6). */
      viewBox="255 255 490 490"
      className={className ?? "size-8 shrink-0 text-(--dxd-lime-deep)"}
      x={x}
      y={y}
      width={width}
      height={height}
    >
      <path
        fill="currentColor"
        stroke="var(--dxd-lime-ink)"
        strokeWidth="18"
        strokeLinejoin="round"
        d="M 712.13 712.13 L 711.11 711.11 L 708.06 708.10 L 703.00 703.19 L 695.98 696.60 L 687.08 688.56 L 676.38 679.39 L 663.98 669.45 L 650.00 659.10 L 634.58 648.75 L 617.85 638.80 L 600.00 629.64 L 581.18 621.60 L 561.58 615.00 L 541.38 610.10 L 520.79 607.09 L 500.00 606.07 L 479.21 607.09 L 458.62 610.10 L 438.42 615.00 L 418.82 621.60 L 400.00 629.64 L 382.15 638.80 L 365.42 648.75 L 350.00 659.10 L 336.02 669.45 L 323.62 679.39 L 312.92 688.56 L 304.02 696.60 L 297.00 703.19 L 291.94 708.10 L 288.89 711.11 L 287.87 712.13 L 288.89 711.11 L 291.90 708.06 L 296.81 703.00 L 303.40 695.98 L 311.44 687.08 L 320.61 676.38 L 330.55 663.98 L 340.90 650.00 L 351.25 634.58 L 361.20 617.85 L 370.36 600.00 L 378.40 581.18 L 385.00 561.58 L 389.90 541.38 L 392.91 520.79 L 393.93 500.00 L 392.91 479.21 L 389.90 458.62 L 385.00 438.42 L 378.40 418.82 L 370.36 400.00 L 361.20 382.15 L 351.25 365.42 L 340.90 350.00 L 330.55 336.02 L 320.61 323.62 L 311.44 312.92 L 303.40 304.02 L 296.81 297.00 L 291.90 291.94 L 288.89 288.89 L 287.87 287.87 L 288.89 288.89 L 291.94 291.90 L 297.00 296.81 L 304.02 303.40 L 312.92 311.44 L 323.62 320.61 L 336.02 330.55 L 350.00 340.90 L 365.42 351.25 L 382.15 361.20 L 400.00 370.36 L 418.82 378.40 L 438.42 385.00 L 458.62 389.90 L 479.21 392.91 L 500.00 393.93 L 520.79 392.91 L 541.38 389.90 L 561.58 385.00 L 581.18 378.40 L 600.00 370.36 L 617.85 361.20 L 634.58 351.25 L 650.00 340.90 L 663.98 330.55 L 676.38 320.61 L 687.08 311.44 L 695.98 303.40 L 703.00 296.81 L 708.06 291.90 L 711.11 288.89 L 712.13 287.87 L 711.11 288.89 L 708.10 291.94 L 703.19 297.00 L 696.60 304.02 L 688.56 312.92 L 679.39 323.62 L 669.45 336.02 L 659.10 350.00 L 648.75 365.42 L 638.80 382.15 L 629.64 400.00 L 621.60 418.82 L 615.00 438.42 L 610.10 458.62 L 607.09 479.21 L 606.07 500.00 L 607.09 520.79 L 610.10 541.38 L 615.00 561.58 L 621.60 581.18 L 629.64 600.00 L 638.80 617.85 L 648.75 634.58 L 659.10 650.00 L 669.45 663.98 L 679.39 676.38 L 688.56 687.08 L 696.60 695.98 L 703.19 703.00 L 708.10 708.06 L 711.11 711.11 Z"
      />
    </svg>
  );
}
