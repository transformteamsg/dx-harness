/**
 * pass-theme-defined.tsx — token-audit fixture
 *
 * Demonstrates that a Tailwind palette class whose name is defined in the
 * project's @theme CSS (passed to the scanner as theme_names) does NOT
 * trigger COL-2.
 *
 * Expected behaviour (when scanned together with a CSS that declares
 * --color-amber-11 and --color-lime-3):
 *   exit 0, no COL-2 violation
 *
 * Also demonstrates that var() inside an arbitrary value is clean:
 *   bg-[var(--surface)] — no TOK-1
 */

export function StatusBadge() {
  return (
    <div>
      {/* theme-defined palette class — NOT a bypass when --color-amber-11 is declared */}
      <span className="text-amber-11">Warning state</span>
      {/* theme-defined single-digit step — NOT a bypass when --color-lime-3 is declared */}
      <span className="bg-lime-3">Success tint</span>
      {/* var() in arbitrary value — always clean */}
      <div className="bg-[var(--surface)] border-[var(--border)]">Content</div>
    </div>
  );
}
