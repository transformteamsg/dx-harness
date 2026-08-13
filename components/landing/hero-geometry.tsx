/* Canonical DXD mark geometry ported from wondopamine/logo-grid-generator.
   The source tool defines the master as a p=4 concave superellipse rotated
   45 degrees, with an exact 1:2 waist. This is a static brand composition,
   not a second implementation of the editor. */

const SIZE = 1000;
const CENTER = SIZE / 2;
const RADIUS = 300;
const ROTATION = Math.PI / 4;
const SEGMENTS = 128;

function signedPower(value: number, exponent: number) {
  return Math.sign(value) * Math.abs(value) ** exponent;
}

function markPath() {
  const points = Array.from({ length: SEGMENTS }, (_, index) => {
    const angle = (index / SEGMENTS) * Math.PI * 2;
    const localX = RADIUS * signedPower(Math.cos(angle), 4);
    const localY = RADIUS * signedPower(Math.sin(angle), 4);
    const x = CENTER + localX * Math.cos(ROTATION) - localY * Math.sin(ROTATION);
    const y = CENTER + localX * Math.sin(ROTATION) + localY * Math.cos(ROTATION);
    return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  });

  return `${points.join(" ")} Z`;
}

const modularPositions = Array.from({ length: 17 }, (_, index) => 100 + index * 50);
const polarRadii = [75, 150, 225, 300];
const rays = Array.from({ length: 16 }, (_, index) => (index / 16) * Math.PI * 2);
const bound = RADIUS / Math.sqrt(2);
const waist = bound / 2;
const start = CENTER - bound;

export function HeroGeometry() {
  return (
    <figure className="hero-geometry relative mx-auto aspect-square w-full max-w-[620px]" aria-labelledby="hero-geometry-caption">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="Measured construction of the DXD geometric mark"
        className="size-full overflow-visible"
      >
        <g className="hero-geometry-grid" aria-hidden>
          {modularPositions.flatMap((position) => {
            const major = position % 100 === 0;
            return [
              <line
                key={`x-${position}`}
                x1={position}
                y1="100"
                x2={position}
                y2="900"
                stroke="var(--border-strong)"
                strokeWidth={major ? 1.2 : 0.7}
                opacity={major ? 0.34 : 0.16}
                vectorEffect="non-scaling-stroke"
              />,
              <line
                key={`y-${position}`}
                x1="100"
                y1={position}
                x2="900"
                y2={position}
                stroke="var(--border-strong)"
                strokeWidth={major ? 1.2 : 0.7}
                opacity={major ? 0.34 : 0.16}
                vectorEffect="non-scaling-stroke"
              />,
            ];
          })}

          {polarRadii.map((radius, index) => (
            <circle
              key={radius}
              cx={CENTER}
              cy={CENTER}
              r={radius}
              fill="none"
              stroke="var(--tw-blue)"
              strokeWidth={index === polarRadii.length - 1 ? 1.3 : 0.8}
              opacity={index === polarRadii.length - 1 ? 0.3 : 0.14}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {rays.map((angle, index) => (
            <line
              key={angle}
              x1={CENTER}
              y1={CENTER}
              x2={CENTER + RADIUS * Math.cos(angle)}
              y2={CENTER + RADIUS * Math.sin(angle)}
              stroke="var(--tw-blue)"
              strokeWidth={index % 4 === 0 ? 1.1 : 0.7}
              opacity={index % 4 === 0 ? 0.25 : 0.1}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          <rect
            x={start}
            y={start}
            width={bound * 2}
            height={bound * 2}
            fill="none"
            stroke="var(--tw-blue)"
            strokeWidth="1.2"
            opacity="0.48"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={`M ${CENTER} ${CENTER - waist} L ${CENTER + waist} ${CENTER} L ${CENTER} ${CENTER + waist} L ${CENTER - waist} ${CENTER} Z`}
            fill="none"
            stroke="var(--tw-blue)"
            strokeWidth="1.4"
            strokeDasharray="6 6"
            opacity="0.68"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1={CENTER}
            y1={CENTER - waist}
            x2={CENTER + bound}
            y2={CENTER - waist}
            stroke="var(--tw-blue)"
            strokeWidth="1.2"
            opacity="0.7"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={CENTER} cy={CENTER} r="4" fill="var(--tw-blue)" />
        </g>

        <path
          className="hero-geometry-mark-fill"
          d={markPath()}
          fill="var(--primary-wash)"
        />
        <path
          className="hero-geometry-mark-complete"
          d={markPath()}
          fill="none"
          stroke="var(--tw-blue)"
          strokeWidth="11"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          className="hero-geometry-mark-draw"
          d={markPath()}
          pathLength="1"
          fill="none"
          stroke="var(--tw-blue)"
          strokeWidth="11"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        <g aria-hidden className="font-mono text-xs tracking-[0.14em] fill-muted-foreground">
          <text x="120" y="135">FIG 0.1</text>
          <text x="120" y="875">45° ROTATION</text>
          <text x="665" y="875">W/B = 0.500</text>
        </g>
      </svg>
      <figcaption id="hero-geometry-caption" className="sr-only">
        The canonical DXD quartic mark on its modular, polar, and exact 1:2 waist construction grids.
      </figcaption>
    </figure>
  );
}
