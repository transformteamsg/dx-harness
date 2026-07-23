/**
 * fail-arbitrary-value.tsx — token-audit fixture
 *
 * Demonstrates TOK-1 violations from raw colour values inside Tailwind
 * arbitrary-value utilities.  These were previously a false negative.
 *
 * Expected violations:
 *   TOK-1  'black' inside bg-[color-mix(…,black)]  (line ~20)
 *   COL-2  bg-amber-500 with no theme allowlist     (line ~23)
 *   COL-2  text-red-3 single-digit step undefined   (line ~26)
 */

export function CtaButton({ label }: { label: string }) {
  return (
    <div>
      {/* TOK-1: raw named colour 'black' inside an arbitrary value */}
      <button className="hover:bg-[color-mix(in_oklab,var(--tw-blue)_88%,black)]">
        {label}
      </button>
      {/* COL-2: undefined palette class (amber-500 not in @theme) */}
      <span className="bg-amber-500 text-white">Badge</span>
      {/* COL-2: single-digit undefined step (red-3 not in @theme) */}
      <span className="text-red-3">Error</span>
    </div>
  );
}
