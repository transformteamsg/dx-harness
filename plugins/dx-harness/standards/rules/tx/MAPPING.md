# TX: Transactions and Payments

Source: [DSS Transactions and Payments](https://info.standards.tech.gov.sg/control-catalog/dss/tx/). Status: draft. The decisions and open items are in the [category README](README.md).

The DSS lists no "Not required for" text for any TX control. A rule that applies only to some products takes a product config parameter. An unset parameter reports "not configured". An empty page list means the product has no such page, and the rule does not apply.

A rule marked "out of scope" tests back-end behaviour. The design linter does not test it, and no check is invented.

| DSS control | Rule | Check | Surface | Engine | Parameters |
| --- | --- | --- | --- | --- | --- |
| TX-1 Digital-first approach | `TX-1a` The transaction is digital from start to finish unless a regulation says otherwise | judged | | | |
| TX-2 Transaction prerequisites | [`TX-2a`](start-page-prerequisites.md) Each start page states the prerequisites that the config lists | lint | rendered | custom | `startPages`, `prerequisiteTopics` |
| | `TX-2b` The prerequisite information is accurate and complete | judged | | | |
| TX-3 Break down long transactions | [`TX-3a`](controls-per-step.md) A step has no more than the set number of controls | lint | source | custom | `flowPages`, `maxControlsPerStep`, `stepSelector` |
| | `TX-3b` The grouping of fields is logical | judged | | | |
| TX-4 Progress indicators | [`TX-4a`](progress-indicator.md) A multi-step flow shows a progress indicator on each step | lint | source | custom | `flowPages`, `minStepsForIndicator`, `progressSelector` |
| | `TX-4b` The indicator is clear and intuitive | judged | | | |
| TX-5 Save draft function | [`TX-5a`](save-draft.md) A long flow offers a save-draft control on each step | lint | rendered | custom | `flowPages`, `minStepsForDraft`, `saveDraftPatterns` |
| | `TX-5b` A draft save is confirmed, and the draft is easy to retrieve and resume | judged | | | |
| TX-6 Pre-fill data | [`TX-6a`](autocomplete-tokens.md) Personal and payment fields carry a valid autocomplete token | lint | source | custom, plus jsx-a11y `autocomplete-valid` | `flowPages`, `autocompleteFields` |
| | `TX-6b` Known data is pre-filled, and MyInfo and Enterprise Data Hub pre-filling is offered with SingPass or CorpPass | judged | | | |
| TX-7 Payment and refund | [`TX-7a`](amount-payable.md) Each payment page shows the amount payable | lint | rendered | custom | `paymentPages`, `amountSelector` |
| | [`TX-7b`](refund-information.md) Refund information is on each payment page and each start page | lint | rendered | custom | `paymentPages`, `startPages`, `refundPatterns` |
| | `TX-7c` The payment and refund information is easy to find | judged | | | |
| TX-8 Managing stored payment details | [`TX-8a`](manage-stored-payment-details.md) A product that stores payment details has a page to update and remove them | lint | project | custom | `storesPaymentDetails`, `managePage`, `updateSelector`, `removeSelector` |
| | `TX-8b` Instructions and confirmation prompts reduce errors | judged | | | |
| TX-9 Success or failure message | [`TX-9a`](outcome-status-message.md) Each outcome page has a status message | lint | rendered | custom | `successPages`, `failurePages`, `statusSelector` |
| | `TX-9b` The cues are familiar and unambiguous | judged | | | |
| TX-10 Failed transaction details | [`TX-10a`](failure-reason.md) Each failure page states the reason for the failure | lint | rendered | custom | `failurePages`, `reasonSelector`, `reasonWithheld` |
| | [`TX-10b`](failure-next-step.md) Each failure page offers an alternative action and a channel for appeals or enquiries | lint | rendered | custom | `failurePages`, `alternativeActionSelector`, `contactPatterns` |
| | `TX-10c` The reason is clear and as detailed as policy allows | judged | | | |
| TX-11 Payment details | [`TX-11a`](success-payment-details.md) Each success page shows the payment details | lint | rendered | custom | `successPages`, `paymentDetailFields` |
| | [`TX-11b`](success-download-or-print.md) Each success page offers a download or print option | lint | rendered | custom | `successPages`, `receiptControlSelector` |
| TX-12 Transaction outcome | [`TX-12a`](delayed-outcome-timeframe.md) A delayed outcome comes with an estimated timeframe | lint | rendered | custom | `outcomeImmediate`, `startPages`, `successPages`, `timeframePattern` |
| TX-13 Post-transaction acknowledgement | [`TX-13a`](success-acknowledgement.md) Each success page offers an acknowledgement to download or names the channel that carries it | lint | rendered | custom | `successPages`, `acknowledgementControlSelector`, `channelPatterns` |
| | `TX-13b` The acknowledgement is sent by SMS, email, or notification | out of scope for the design linter: sending is back-end behaviour | | | |
| TX-14 Transaction status updates | `TX-14a` Users are notified when the status changes | out of scope for the design linter: notification delivery is back-end behaviour | | | |
| TX-15 Tracking transaction status | [`TX-15a`](tracking-page.md) A product with a delayed outcome has a tracking page with status labels | lint | project | custom | `outcomeImmediate`, `trackingPage`, `statusSelector`, `statusDescriptionSelector` |
| | `TX-15b` The timeline and the required user actions are shown | judged | | | |
