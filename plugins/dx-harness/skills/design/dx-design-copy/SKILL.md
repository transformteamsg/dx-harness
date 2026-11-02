---
name: dx-design-copy
description: 'Use when the ask names the copy of an existing product surface but not the exact wording: user-facing text on a page, form, notification, or empty or error state, naming, error-message anatomy, or tone, with anti-AI-writing rules (CNT-15a and CNT-15b) applied. Propose-only: records up to five ranked findings on the surface''s design ticket for dx-design-execute to build. NOT for a stated wording edit, a whole-page review, or prose outside the product such as marketing or documentation.'
---

# Copy for Teacher & School products

**When the ask belongs to another skill:**

- A review of the whole page with no dimension named goes to `dx-design-critique`.
- Prose outside the product surface, such as site content, marketing, or documentation, is out of scope.

**Improve-the-copy pass.** For a scoped "improve / polish the copy on `<page>`" run,
follow `../dx-design-critique/pass.md` with this skill's dimension subset. The pass
judges the wording only. A stated exact edit ("change the label to Save") is a
dx-design-execute intent, not a pass run. The dimension subset: **CNT-2a, CNT-3a,
CNT-4a, CNT-5a, CNT-5b, CNT-6a, CNT-6b, CNT-7a, CNT-8a, CNT-9a, CNT-11a, CNT-12a,
CNT-12b, CNT-13a, CNT-13b, CNT-15a, CNT-15b, the error rules WU-10c, WU-10d, WU-11a,
WU-11b, TX-10a, and TX-10b, the naming rules WU-8a, WU-8b, and WU-8c, CNT-14, and
IDN-3 (IDN-4 on CaseSync surfaces)**. Before you judge the copy,
read the writing rules in `../../../procedures/copy-rules.md`: they say what
"on-voice" means. The rest of this file is the review method.

## The editing sequence (method, not a control)

No step is a control, and none fails a check. Draft first, then edit in passes:

<!-- dx-sync:uitext-sequence source -->
1. **Draft.** Write what you want to say to the teacher. Don't polish yet.
2. **Purposeful.** Keep only words that serve the teacher's goal or the product's.
   Lead with the most important idea (CNT-7a, lead with purpose).
3. **Concise.** Front-load the point; cut filler and empty openers (CNT-15a). One idea
   per sentence, well under the 25-word ceiling (CNT-3a).
4. **Conversational.** Second person, active voice; read it aloud (CNT-3a). Name the
   action, not the device (CNT-5a).
5. **Clear.** Simple words, simple present tense; no double negatives or noun
   stacks; every acronym defined on the surface (CNT-9a).
<!-- /dx-sync:uitext-sequence -->
6. **Check.** One term per thing (WU-8b) using the word teachers already know
   (CNT-11a), clear names (CNT-2a), sentence case (CNT-12a), Singapore English
   spelling and a proofread (CNT-13a), plain error anatomy (WU-11b), and a last
   pass for AI-writing tells (CNT-15a, CNT-15b).

## Per-product tone

Judge the copy against the product's row in the
[IDN-3 tone register](../../../standards/controls/idn-3.md). On a CaseSync surface,
IDN-4 applies too.

## What to do on conflict

Mandated programme names and legally vetted text win over style rules — record a
waiver (`dx-waive CNT-2a reason="..."` inline, or in the decision record for
non-markup content) rather than rewording.
