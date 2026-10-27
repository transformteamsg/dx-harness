import type { RuleModule } from "../../types.ts";
import { bodyText, pattern, perPage, strings, textsOf, unique } from "./util.ts";

/* The rules that read what a user must know before they pay: TX-2a, TX-7a,
   TX-7b, and TX-12a. They match English text. A product in another locale sets
   its own patterns, and the currency pattern of TX-7a reads English and symbol
   forms only. */

/* TX-2a: a start page states each prerequisite topic that the config lists. A
   topic is covered when the page text matches one of its patterns. */
export const tx2a: RuleModule = {
  code: "TX-2a",
  surface: "rendered",

  locate: ({ rendered, params }) => perPage(rendered, strings(params.startPages), async (page) => ({ text: await bodyText(page) })),

  decide(candidate, params) {
    const { text } = candidate.data as { text: string };
    const topics = params.prerequisiteTopics as Record<string, string[]>;
    const missing = Object.entries(topics)
      .filter(([, patterns]) => !strings(patterns).some((p) => pattern(p).test(text)))
      .map(([topic]) => topic);
    return missing.length > 0 ? `The start page does not state: ${missing.join(", ")}. Add the information that a user needs before they begin.` : null;
  },
};

/* TX-7a: a payment page shows an amount, and the amount comes before the submit
   control. The submit control is the first submit button inside main. */
const CURRENCY = /(?:S\$|US\$|\$|SGD|USD|€|£)\s?\d[\d,]*(?:\.\d+)?|\d[\d,]*(?:\.\d+)?\s?(?:SGD|USD|dollars?)/i;

export const tx7a: RuleModule = {
  code: "TX-7a",
  surface: "rendered",

  locate: ({ rendered, params }) =>
    perPage(rendered, strings(params.paymentPages), (page) =>
      page.evaluate((selector: string) => {
        let list: any[] = [];
        try {
          list = Array.from(document.querySelectorAll(selector));
        } catch {
          /* an invalid selector matches nothing */
        }
        const submit = document.querySelector("main button[type=submit], main input[type=submit], main form button:not([type])");
        return {
          items: list.map((el: any) => ({
            text: String(el.innerText ?? "").replace(/\s+/g, " ").trim(),
            /* 4 is Node.DOCUMENT_POSITION_FOLLOWING: the element comes after the submit control. */
            after: submit ? (submit.compareDocumentPosition(el) & 4) !== 0 : false,
          })),
        };
      }, String(params.amountSelector)),
    ),

  decide(candidate) {
    const { items } = candidate.data as { items: { text: string; after: boolean }[] };
    if (items.length === 0) return "No element shows the amount payable. Show the total before the pay button.";
    const priced = items.filter((i) => CURRENCY.test(i.text));
    if (priced.length === 0) return "The amount element has no currency amount in its text. Show the total, for example S$25.00.";
    return priced.some((i) => !i.after) ? null : "The amount comes after the pay button. Show it before the pay button.";
  },
};

/* TX-7b: a payment page and a start page carry refund information. A pattern is
   a case-insensitive substring. A link whose text matches also counts. */
export const tx7b: RuleModule = {
  code: "TX-7b",
  surface: "rendered",

  locate: ({ rendered, params }) =>
    perPage(rendered, unique(params.paymentPages, params.startPages), async (page) => ({
      text: await bodyText(page),
      links: await textsOf(page, "a[href]"),
    })),

  decide(candidate, params) {
    const wanted = strings(params.refundPatterns).map((p) => p.toLowerCase());
    const { text, links } = candidate.data as { text: string; links: string[] };
    const found = [text, ...links].some((t) => wanted.some((w) => t.toLowerCase().includes(w)));
    return found ? null : `The page has no refund information. State the refund terms, or that there is no refund. Matched: ${wanted.join(", ")}.`;
  },
};

/* TX-12a: a delayed outcome comes with a timeframe on a start page or a success
   page. One finding for the product, on the first start page. */
export const tx12a: RuleModule = {
  code: "TX-12a",
  surface: "rendered",

  async locate({ rendered, params }) {
    if (params.outcomeImmediate === true) return [];
    const starts = strings(params.startPages);
    const successes = strings(params.successPages);
    const pages = unique(starts, successes);
    if (pages.length === 0) return [];
    const found = await perPage(rendered, pages, async (page) => ({ text: await bodyText(page) }));
    const first = found[0];
    return [{ ...first, data: { texts: found.map((f) => (f.data as { text: string }).text) } }];
  },

  decide(candidate, params) {
    const re = pattern(String(params.timeframePattern));
    const { texts } = candidate.data as { texts: string[] };
    return texts.some((t) => re.test(t)) ? null : "The outcome is not immediate, and no start page or success page gives a timeframe. State how long it takes, for example \"3 working days\".";
  },
};
