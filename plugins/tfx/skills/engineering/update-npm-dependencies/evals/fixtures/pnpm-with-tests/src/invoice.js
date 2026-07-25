import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser();

export function parseInvoice(xml) {
  return parser.parse(xml);
}
