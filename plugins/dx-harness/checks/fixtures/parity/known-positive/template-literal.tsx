/**
 * template-literal.tsx — parity fixture: raw values inside a styled-components
 * template literal that spans several lines. Each finding must land on the
 * value's own line inside the literal, not on the tagged-template line.
 *
 * Expected findings (recorded from the pre-swap engine, see expected/):
 *   token-audit  TOK-1  #0064ff
 *   token-audit  TOK-2  15px
 *   token-audit  TOK-3  10px
 *   type-scan    TYP-2 + TYP-3  font size 13px
 *   type-scan    TYP-2  line-height 1.2
 */
import styled from "styled-components";

export const Card = styled.div`
  color: #0064ff;
  padding: 15px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.2;
`;
