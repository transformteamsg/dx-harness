# WU: WCAG Understandable

Source: [DSS WCAG: Understandable](https://info.standards.tech.gov.sg/control-catalog/dss/wu/). Status: draft.

The category has 14 DSS controls and 36 rules: 22 lintable and 14 judged. The rule format is in the [top-level README](../../rules.md). The control-to-rule table is in [MAPPING.md](MAPPING.md).

## Rules

| Rule | Title | Surface |
| --- | --- | --- |
| [WU-1a](page-language-source.md) | Language of the page is declared in source | source |
| [WU-1b](page-language-rendered.md) | Language of the page is declared on the rendered page | rendered |
| [WU-1d](pdf-language.md) | Each PDF file declares its language | project |
| [WU-2a](valid-lang-attribute.md) | A `lang` attribute on part of a page is valid | rendered |
| [WU-2c](language-of-parts.md) | A text block in another language has a `lang` attribute | rendered |
| [WU-4a](abbreviations-expanded.md) | The first use of an abbreviation is expanded | rendered |
| [WU-5a](no-change-on-focus.md) | Focus does not change context | source |
| [WU-6a](no-change-on-input.md) | Input does not change context without a confirm control | source |
| [WU-7a](consistent-navigation-order.md) | Main navigation links keep the same order on every page | project |
| [WU-7b](navigation-visible-on-desktop.md) | Main navigation is visible on desktop | rendered |
| [WU-8a](consistent-link-names.md) | Links to the same target have the same name | project |
| [WU-8c](consistent-names-across-pages.md) | A link target has the same accessible name across pages | project |
| [WU-9a](consistent-help.md) | Help and support sit in the same position on every page | rendered |
| [WU-10a](error-text-linked.md) | An invalid control points to its error text | rendered |
| [WU-10b](error-text-visible-and-announced.md) | Error text is visible text and is announced | rendered |
| [WU-10d](specific-error-message.md) | An error message is not a generic message | rendered |
| [WU-11a](error-page-way-forward.md) | System error pages give a way forward | rendered |
| [WU-12a](review-and-confirm-step.md) | An important transaction has a review and confirm step | project |
| [WU-13a](no-repeated-fields.md) | A field does not repeat across the steps of a flow | project |
| [WU-14a](accessible-login.md) | One login method needs no memory or transcription | project |
| [WU-14b](credential-paste-and-autofill.md) | Credential fields allow paste and autofill | source |
| [WU-14d](no-captcha.md) | The login page has no known CAPTCHA | source |

The 14 judged rules have no file yet. Each needs a rubric from `dx-design-judge`: `WU-1c`, `WU-2b`, `WU-3a`, `WU-4b`, `WU-5b`, `WU-6b`, `WU-7c`, `WU-8b`, `WU-9b`, `WU-10c`, `WU-11b`, `WU-12b`, `WU-13b`, and `WU-14c`.

## Decisions

- Engines do the work where they can. axe-core covers `WU-1b`, `WU-2a`, and part of `WU-10a`. `eslint-plugin-jsx-a11y` covers `WU-1a` and part of `WU-14b`. Custom rules fill the gaps.
- An exemption is a parameter in the product config. Only `WU-4` lists one, and it becomes `commonAbbreviations`.
- `WU-9` exists as `WU-9a` and `WU-9b`, so that `BD-9a` can refer to it.
- A control that only a person can decide, such as `WU-3`, has judged rules only.
- A rule that needs a page list, a flow list, or a selector has `null` as its default. An unset value reports "not configured".
- `WU-1a` and `WU-1b` split the source and the rendered page, because client rendering can drop `lang`.
- Tiers are provisional. An engine-decided rule is `L0`, a heuristic is `L2`, and the rest are `L1`.

## Open

- The fetch of the DSS page returned a summary. The "Not required for" text of `WU-4` is the only exemption found. Re-read each control on the page for exact wording.
- Verify against the installed version: jsx-a11y `html-has-lang`, `lang`, and `autocomplete-valid`.
- Verify against the installed version: axe `html-has-lang`, `html-lang-valid`, `html-xml-lang-mismatch`, `valid-lang`, `aria-valid-attr-value`, and `identical-links-same-purpose`.
- `WU-2c`: language detection is biased towards English script and is unreliable on short text. Test it on other scripts before you rely on it.
- `WU-4a`: the all-capitals pattern gives false positives for non-English text.
- `WU-9a` and `WU-12a`: the config format for `helpSelector` and `transactionalFlows` is not designed.
- `WU-13a` and `WU-12a` both read a flow declaration. `WU-12a` calls it `transactionalFlows` and `WU-13a` calls it `flows`. Unify the two under one shared name.

## Reviewed decisions

- `WU-13a`: lint at tier L2, on repeated fields in a declared flow. It warns and never blocks. The judged part is now `WU-13b`.
- `WU-4a`: kept at tier L2 with a project word list in `commonAbbreviations`.
- `WU-7b`: tests visibility only. The `maxTopOffset` parameter is dropped, and a side navigation passes.
- second pass: `WU-1d` added as lint.
- second pass: `WU-2c` added as lint.
- second pass: `WU-8c` added as lint.
- second pass: `WU-10d` added as lint. It also serves `WU-11b`.
- second pass: `WU-14d` added as lint.

## Built

All 22 lint rules have a module. No rule is left unbuilt. The module code is in `packages/design-lint/src/modules/wu/`.

- `WU-1a`: the plain HTML part checks that `<html>` has a `lang` value of a well-formed BCP 47 shape. It does not look the language up in the registry, so `lang="xx"` passes in source. `WU-1b` catches that on the rendered page, where axe knows the list. The JSX and TSX part is jsx-a11y `html-has-lang` and `lang`.
- `WU-1b` and `WU-2a`: added a `pages` parameter, because a rendered rule needs a page list.
- `WU-1d`: no PDF library is installed, so the check reads the bytes and looks for `/Lang` in the catalogue object. A catalogue inside a compressed object stream cannot be read. The check reports that file as unreadable and never as a pass. The demo PDF, `demo/site/wu/grant-guide.pdf`, is written by hand.
- `WU-2c`: `detectionLibrary` is removed, because no detector is installed. The check counts the letters of each Unicode script in a block. It finds a script that differs from the page language, such as Chinese on an English page. It cannot separate languages that share a script, so a French passage on an English page is never reported. It skips a page whose language has no known script. `minCharacters` counts letters.
- `WU-4a`: added a `pages` parameter. The bracket form "Full Name (FN)" passes when the first letters of the words before the bracket spell the token, and small words such as "of" may be left out. A token that touches a hyphen, a digit, or a dot is an identifier such as `HB-20481`, and the check skips it.
- `WU-5a` and `WU-6a`: read on* attributes and inline scripts in HTML, and JSX, TSX, JS, and TS files, through the TypeScript parser. They follow a handler that is a function expression or a name that a function in the same file declares. A handler from another file is not traced. `WU-6a` checks a handler only on a control that `inputControls` matches: an attribute or a JSX prop, not `addEventListener`.
- `WU-7a`: compares the order of the links that two pages share, so a page that adds or drops a link passes. The first listed page that has a navigation is the reference. The demo sets `navSelector` to `nav`, because the shared pages have no `aria-label` on their navigation.
- `WU-8a`: groups the links of one page by `href`, and the submit buttons of the whole site by `form action`. A link with `hreflang` forms its own group. Only links in a header, a navigation, a footer, or an aside count: a link in running text takes its name from its sentence, and the demo pages of other categories use different link text for one target. The reverse case is not built. axe `identical-links-same-purpose` reports one name for two targets, which is another criterion, and it returns "needs review" and never a violation.
- `WU-8c`: compares only the pages that use one name for a target, so that a page with two names is `WU-8a`'s finding. The same region and `hreflang` rules as `WU-8a` apply.
- `WU-9a`: the offset is measured from the top left of the landmark that holds the help entry. A page that has no match, or a different landmark, fails. A page reports one finding, for the first problem. The demo lists four pages in `pages`, the ones that have a footer with help.
- `WU-10a`: the axe part is removed, because `WR-1c` runs `aria-valid-attr-value`, and axe returns a missing id as "needs review". The check reports a control with no reference attribute and a control whose ids match no element.
- `WU-10b`: the announce condition passes when any visible element that the control references is announced, because a control references a hint and an error together. The empty and visible conditions apply to each element. An error summary that takes focus is an ancestor with a `tabindex` attribute.
- `WU-10d`: reads `failureFixtures`. The page-group mapping has no name for it, so a product sets it under `rules`.
- `WU-11a`: a way forward is a link to the home page, to a search page or a search form, or to a contact channel. The header link to the home page of the generated demo pages counts, so the demo patch breaks the heading.
- `WU-12a`: the parameter `transactionalFlows` is renamed `flows`, the name that `WU-13a` and `lint/config.md` use. A review step is a later step with a `dl`, a `table`, or a `[data-review]` element and a submit button. The check cannot compare the shown values with the entered ones.
- `WU-12a` and `WU-13a`: a flow maps a name to the ordered paths of its pages. The runner does not yet copy the top-level `flows` key of the config into the `flows` parameter. Until it does, a product sets the flows under `rules.WU-12a.flows` and `rules.WU-13a.flows`. The demo does this.
- `WU-13a`: a field is keyed by its first `autocomplete` token, or its name. A search field and a hidden field are not data.
- `WU-14a`: reads only the config, so no file of the site can break it. It has a test in `test/wu-rules.test.ts` and no fixture, because a fixture shares one config between the passing and the failing site. Its patch has no edit.
- `WU-14b`: `return false` in a paste handler counts as blocking paste, with `preventDefault`. The JSX part adds jsx-a11y `autocomplete-valid`. The custom part leaves a JSX value that is not a standard autofill token to that rule, so the fault is reported once. A code field is an input whose `autocomplete` is `one-time-code`, or whose name or id looks like `otp`, `passcode`, `pin`, or a verification code.
- `WU-14d`: narrowed to the CAPTCHA. The paste and `autocomplete` conditions of the password field are `WU-14b`'s findings on every page, so reporting them again would give two findings for one fault. The title changes to match. A listed login page that does not exist is reported.
