import { expect, test } from "vitest";
import { parseInvoice } from "./invoice.js";

test("parseInvoice reads the invoice total", () => {
  const want = "42.00";
  const got = parseInvoice("<invoice><total>42.00</total></invoice>").invoice.total;
  expect(got).toBe(want);
});
