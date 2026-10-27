# WU: WCAG Understandable

Source: [DSS WCAG: Understandable](https://info.standards.tech.gov.sg/control-catalog/dss/wu/). Status: draft. The decisions and open items are in the [category README](README.md).

A parameter that the table lists as an exemption comes from the DSS "Not required for" text. A rule skips only when the product config sets the parameter. An unset parameter reports "not configured".

| DSS control | Rule | Check | Surface | Engine | Parameters |
| --- | --- | --- | --- | --- | --- |
| WU-1 Language of Page | [`WU-1a`](WU-1a.md) Language of the page is declared in source | lint | source | jsx-a11y `html-has-lang`, `lang` | None |
| | [`WU-1b`](WU-1b.md) Language of the page is declared on the rendered page | lint | rendered | axe `html-has-lang`, `html-lang-valid`, `html-xml-lang-mismatch` | `pages` |
| | `WU-1c` Language of PDF files and mobile applications is declared. Lint part: [`WU-1d`](WU-1d.md). | judged | | | |
| | [`WU-1d`](WU-1d.md) Each PDF file declares its language. Lint part of `WU-1c`. | lint | project | custom | `pdfFiles` |
| WU-2 Language of Parts | [`WU-2a`](WU-2a.md) A `lang` attribute on part of a page is valid | lint | rendered | axe `valid-lang` | `pages` |
| | `WU-2b` Each passage in another language is tagged. Lint part: [`WU-2c`](WU-2c.md). | judged | | | |
| | [`WU-2c`](WU-2c.md) A text block in another language has a `lang` attribute. Lint part of `WU-2b`. | lint | rendered | custom | `minCharacters`, `pages` |
| WU-3 Unusual Words | `WU-3a` Unusual words are avoided or explained | judged | | | |
| WU-4 Abbreviations | [`WU-4a`](WU-4a.md) The first use of an abbreviation is expanded | lint | rendered | custom | `commonAbbreviations`, `abbreviationPattern`, `expansionElements`, `pages` |
| | `WU-4b` The help for an abbreviation is adequate | judged | | | |
| WU-5 Changes On Focus | [`WU-5a`](WU-5a.md) Focus does not change context | lint | source | custom | `focusHandlers`, `contextChangeCalls` |
| | `WU-5b` Focus behaviour that a source check cannot trace | judged | | | |
| WU-6 Changes On Input | [`WU-6a`](WU-6a.md) Input does not change context without a confirm control | lint | source | custom | `inputHandlers`, `inputControls`, `contextChangeCalls` |
| | `WU-6b` An advance warning of a context change is clear | judged | | | |
| WU-7 Consistent Navigation | [`WU-7a`](WU-7a.md) Main navigation links keep the same order on every page | lint | project | custom | `navSelector`, `pages` |
| | [`WU-7b`](WU-7b.md) Main navigation is visible on desktop | lint | rendered | custom | `navSelector`, `desktopViewport`, `desktopHeight`, `pages` |
| | `WU-7c` Users find the main navigation | judged | | | |
| WU-8 Consistent Identification | [`WU-8a`](WU-8a.md) Links to the same target have the same name | lint | project | custom | `ignoreHrefs` |
| | `WU-8b` Functions without a shared target are named alike. Lint part: [`WU-8c`](WU-8c.md). | judged | | | |
| | [`WU-8c`](WU-8c.md) A link target has the same accessible name across pages. Lint part of `WU-8b`. | lint | project | custom | `pages`, `ignoreNames` |
| WU-9 Consistent Help | [`WU-9a`](WU-9a.md) Help and support sit in the same position on every page | lint | rendered | custom | `helpSelector`, `positionTolerance`, `viewports`, `pages` |
| | `WU-9b` The help and support serve users | judged | | | |
| WU-10 Error Identification | [`WU-10a`](WU-10a.md) An invalid control points to its error text | lint | rendered | custom | `errorReferenceAttributes`, `pages` |
| | [`WU-10b`](WU-10b.md) Error text is visible text and is announced | lint | rendered | custom | `errorReferenceAttributes`, `announceRoles`, `pages` |
| | `WU-10c` The error text identifies the cause. Lint part: [`WU-10d`](WU-10d.md). | judged | | | |
| | [`WU-10d`](WU-10d.md) An error message is not a generic message. Lint part of `WU-10c` and `WU-11b`. | lint | rendered | custom | `genericErrors`, `errorSelector`, `failureFixtures` |
| WU-11 Error Suggestion | [`WU-11a`](WU-11a.md) System error pages give a way forward | lint | rendered | custom | `errorPages`, `requireHeading`, `requireRecoveryLink` |
| | `WU-11b` Each error message is plain and gives a next step. Lint part: [`WU-10d`](WU-10d.md). | judged | | | |
| WU-12 Error Prevention | [`WU-12a`](WU-12a.md) An important transaction has a review and confirm step | lint | project | custom | `flows`, `reviewStepRequired` |
| | `WU-12b` A submission is reversible where feasible | judged | | | |
| WU-13 Redundant Entry | [`WU-13a`](WU-13a.md) A field does not repeat across the steps of a flow. Lint part of `WU-13b`. | lint | project | custom | `flows`, `confirmFields` |
| | `WU-13b` A repeat of data is essential, or the earlier value is filled in. Lint part: [`WU-13a`](WU-13a.md). | judged | | | |
| WU-14 Accessible Authentication (Minimum) | [`WU-14a`](WU-14a.md) One login method needs no memory or transcription | lint | project | custom | `authMethods`, `accessibleMethods` |
| | [`WU-14b`](WU-14b.md) Credential fields allow paste and autofill | lint | source | custom, with jsx-a11y `autocomplete-valid` | `blockedPasteHandlers`, `passwordAutocomplete` |
| | `WU-14c` No login step needs a cognitive test. Lint part: [`WU-14d`](WU-14d.md). | judged | | | |
| | [`WU-14d`](WU-14d.md) The login page has no known CAPTCHA. Lint part of `WU-14c`. | lint | source | custom | `captchaPatterns`, `loginPages` |
