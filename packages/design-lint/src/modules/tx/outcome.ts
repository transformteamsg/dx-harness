import type { RuleModule } from "../../types.ts";
import { bodyText, pattern, perPage, strings, textsOf, unique } from "./util.ts";

/* The rules that read an outcome page: TX-9a, TX-10a, TX-10b, TX-11a, TX-11b, and
   TX-13a. The text patterns match English. */

const hasLetters = (t: string) => /\p{L}/u.test(t);

/* TX-9a: an outcome page has a status message that states the outcome in text.
   The check cannot tell that a word states the outcome, so it fails a message
   that has no letters, which is an icon or a symbol alone. */
export const tx9a: RuleModule = {
  code: "TX-9a",
  surface: "rendered",

  locate: ({ rendered, params }) =>
    perPage(rendered, unique(params.successPages, params.failurePages), async (page) => ({
      texts: await textsOf(page, String(params.statusSelector)),
    })),

  decide(candidate) {
    const { texts } = candidate.data as { texts: string[] };
    if (texts.length === 0) return "The page has no status message. Add one that states whether the transaction succeeded or failed.";
    if (texts.every((t) => t === "")) return "The status message has no text. State the outcome in words.";
    return texts.some(hasLetters) ? null : "The status message has no words, only a symbol. State the outcome in text.";
  },
};

/* TX-10a: a failure page states the reason. Skipped where the product sets
   reasonWithheld to true. */
export const tx10a: RuleModule = {
  code: "TX-10a",
  surface: "rendered",

  async locate({ rendered, params }) {
    if (params.reasonWithheld === true) return [];
    return perPage(rendered, strings(params.failurePages), async (page) => ({ texts: await textsOf(page, String(params.reasonSelector)) }));
  },

  decide(candidate) {
    const { texts } = candidate.data as { texts: string[] };
    if (texts.length === 0) return "The failure page does not state the reason. Add an element that explains why the transaction failed.";
    return texts.some((t) => t !== "") ? null : "The reason element has no text. Explain why the transaction failed.";
  },
};

/* TX-10b: a failure page offers an alternative action and a contact channel. A
   contact pattern is a case-insensitive substring of a link href or a form
   action. */
export const tx10b: RuleModule = {
  code: "TX-10b",
  surface: "rendered",

  locate: ({ rendered, params }) =>
    perPage(rendered, strings(params.failurePages), async (page) => {
      const alternatives = await textsOf(page, String(params.alternativeActionSelector));
      const targets = await page.evaluate(() =>
        (Array.from(document.querySelectorAll("a[href], form[action]")) as any[]).map((el: any) => String(el.getAttribute("href") ?? el.getAttribute("action") ?? "")),
      );
      return { alternatives: alternatives.length, targets };
    }),

  decide(candidate, params) {
    const wanted = strings(params.contactPatterns).map((p) => p.toLowerCase());
    const { alternatives, targets } = candidate.data as { alternatives: number; targets: string[] };
    const problems: string[] = [];
    if (alternatives === 0) problems.push("offers no alternative action, such as retry or another payment method");
    if (!targets.some((t) => wanted.some((w) => t.toLowerCase().includes(w)))) problems.push("names no channel for appeals or enquiries");
    return problems.length > 0 ? `The failure page ${problems.join(" and ")}.` : null;
  },
};

/* TX-11a: a success page shows each payment detail that the config lists. A
   field pattern is a case-insensitive regular expression. */
export const tx11a: RuleModule = {
  code: "TX-11a",
  surface: "rendered",

  locate: ({ rendered, params }) => perPage(rendered, strings(params.successPages), async (page) => ({ text: await bodyText(page) })),

  decide(candidate, params) {
    const { text } = candidate.data as { text: string };
    const fields = params.paymentDetailFields as Record<string, string>;
    const missing = Object.entries(fields)
      .filter(([, p]) => !pattern(String(p)).test(text))
      .map(([field]) => field);
    return missing.length > 0 ? `The success page does not show: ${missing.join(", ")}. Show the details of the payment.` : null;
  },
};

/* TX-11b: a success page has a download or print control. */
export const tx11b: RuleModule = {
  code: "TX-11b",
  surface: "rendered",

  locate: ({ rendered, params }) =>
    perPage(rendered, strings(params.successPages), async (page) => ({ controls: (await textsOf(page, String(params.receiptControlSelector))).length })),

  decide(candidate) {
    return (candidate.data as { controls: number }).controls > 0 ? null : "The success page offers no way to keep the payment details. Add a download or print control for the receipt.";
  },
};

/* TX-13a: a success page offers an acknowledgement to download, or says that it
   was sent by a named channel. The channel counts with the whole word "sent". */
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const tx13a: RuleModule = {
  code: "TX-13a",
  surface: "rendered",

  locate: ({ rendered, params }) =>
    perPage(rendered, strings(params.successPages), async (page) => ({
      controls: (await textsOf(page, String(params.acknowledgementControlSelector))).length,
      text: await bodyText(page),
    })),

  decide(candidate, params) {
    const { controls, text } = candidate.data as { controls: number; text: string };
    if (controls > 0) return null;
    const channel = strings(params.channelPatterns).some((c) => new RegExp(`\\b${escape(c)}\\b`, "i").test(text));
    return channel && /\bsent\b/i.test(text) ? null : "The success page offers no acknowledgement to download and does not say where it was sent. Add a download control, or say that it was sent by email, SMS, or notification.";
  },
};
