/* Semantic token table for the Colour foundations page: a real <table> of
   the site's own tokens, each row showing a swatch chip rendered from the
   live var(--…) (so it can never drift from app/globals.css), the token
   name, and its role. Wrapped in overflow-x-auto so it never causes
   horizontal page scroll at narrow viewports. */

import { SEMANTIC_TOKENS } from "@/lib/foundations/colour-data";

export function TokenTable({ group }: { group?: "core" | "functional" }) {
  const tokens = SEMANTIC_TOKENS.filter((token) => {
    if (!group) return true;
    const isFunctional = /success|warning|danger/.test(token.cssVar);
    return group === "functional" ? isFunctional : !isFunctional;
  });

  return (
    <figure className="my-8">
      <div className="overflow-x-auto rounded-lg border border-border bg-surface p-4">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-10 pb-2 text-left font-medium text-muted-foreground"></th>
              <th className="pb-2 text-left font-medium text-muted-foreground">Token</th>
              <th className="pb-2 text-left font-medium text-muted-foreground">Role</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <tr key={token.cssVar} className="border-t border-border">
                <td className="py-2 pr-2">
                  <div
                    aria-hidden
                    style={{ background: token.value }}
                    className="h-6 w-6 rounded-md border border-border"
                  />
                </td>
                <td className="py-2 pr-4 align-top">
                  <code>{token.cssVar}</code>
                </td>
                <td className="py-2 align-top text-muted-foreground">{token.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
