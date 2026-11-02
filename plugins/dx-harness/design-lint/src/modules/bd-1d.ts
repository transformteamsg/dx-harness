import { atElement } from "../rendered.ts";
import type { Candidate, ElementRef, RuleModule } from "../types.ts";

/* BD-1d: content that is disabled on mobile has a notice with a way to reach
   it. It compares each page at the mobile and desktop widths, finds candidates,
   and does not decide. */

const HEIGHT = 800;

interface Snapshot {
  mainWords: number;
  /* Smallest content blocks with minWords or more words, by position in main. */
  blocks: { index: number; words: number; visible: boolean; element: ElementRef }[];
  interstitial: boolean;
  notice: { visible: boolean; hasText: boolean; hasLink: boolean } | null;
}

/* Runs in the page. It must not use anything outside itself. */
function snapshot(arg: { content: string; minWords: number; notice: string; skip: string }): Snapshot {
  const count = (t: string) => (t.match(/[A-Za-z0-9']+/g) || []).length;
  const main: any = document.querySelector(arg.content) || document.body;
  const all: any[] = Array.from(main.querySelectorAll("*")).filter((e: any) => !(arg.skip && e.closest(arg.skip)));
  const heavy = all.filter((e) => count(e.textContent || "") >= arg.minWords);
  const smallest = heavy.filter((e) => !heavy.some((o) => o !== e && e.contains(o)));
  const blocks = smallest.map((e) => {
    return { index: all.indexOf(e), words: count(e.textContent || ""), visible: e.checkVisibility(), element: window.__designLint.element(e) as ElementRef };
  });
  const n: any = document.querySelector(arg.notice);
  return {
    mainWords: count(main.innerText || ""),
    blocks,
    interstitial: /use a desktop|larger screen|not available on (a )?mobile/i.test(document.body.innerText || ""),
    notice: n ? { visible: n.checkVisibility(), hasText: (n.innerText || "").trim().length > 0, hasLink: Boolean(n.querySelector("a[href]")) } : null,
  };
}

export const bd1d: RuleModule = {
  code: "BD-1d",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const minWords = params.minWords as number;
    const arg = {
      content: String(params.contentSelector),
      minWords,
      notice: String(params.noticeSelector),
      skip: String(params.intentionalHideSelector),
    };
    for (const pagePath of params.pages as string[]) {
      const desktop = await (await rendered.open(pagePath, { width: params.desktopViewport as number, height: HEIGHT })).evaluate(snapshot, arg);
      const mobile = await (await rendered.open(pagePath, { width: params.mobileViewport as number, height: HEIGHT })).evaluate(snapshot, arg);

      const hidden = desktop.blocks.filter((b) => b.visible && !mobile.blocks.find((m) => m.index === b.index)?.visible);
      const reasons: { element: ElementRef | null; reason: string }[] = hidden.map((b) => ({
        element: b.element,
        reason: `a block of ${b.words} words is hidden at the mobile width`,
      }));
      /* A whole-page block is reported only when no single block explains it. */
      if (reasons.length === 0 && mobile.mainWords < desktop.mainWords / 2 && desktop.mainWords - mobile.mainWords >= minWords) {
        reasons.push({ element: null, reason: `the content drops from ${desktop.mainWords} to ${mobile.mainWords} words at the mobile width` });
      }
      if (reasons.length === 0 && mobile.interstitial) {
        reasons.push({ element: null, reason: "the page asks the user to use a desktop or a larger screen" });
      }
      const noticeOk = mobile.notice !== null && mobile.notice.visible && mobile.notice.hasText && mobile.notice.hasLink;
      if (!noticeOk) {
        for (const r of reasons) {
          const data = { reason: r.reason };
          out.push(r.element ? atElement(pagePath, r.element, data) : { file: pagePath, line: 0, column: 0, data });
        }
      }
    }
    return out;
  },

  decide(candidate) {
    const { reason } = candidate.data as { reason: string };
    return `Content seems to be disabled on mobile: ${reason}. Show a notice that says why and links to a way to reach it. If the hide is intended, mark the element with the intentional-hide selector.`;
  },
};


