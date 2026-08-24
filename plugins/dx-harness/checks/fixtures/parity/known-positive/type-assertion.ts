/**
 * type-assertion.ts: a parity fixture guarding the .ts language bucket.
 *
 * The old-style `<Foo>bar` assertion below breaks a tsx parse. Measured at
 * ast-grep 0.44.1: aliasing .ts to tsx returns zero findings at exit 0 for this
 * file, and a `language: ts` rule returns them. That is why sgconfig.yml maps
 * .js and .jsx to tsx but never .ts.
 *
 * Expected findings (recorded from the pre-swap engine, see expected/):
 *   token-audit  COL-2  bg-red-500
 *   token-audit  TOK-1  #00ff00 inside the text-[…] arbitrary value
 *   type-scan    TYP-2 + TYP-3  font size 13px
 */
type Foo = string;
const bar: unknown = "seed";
export const x = <Foo>bar;
export const CARD_CLASS = "bg-red-500 text-[#00ff00] text-[13px]";
