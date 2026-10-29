---
code: CNT-13a
slug: spelling
control: CNT-13
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: CNT-13b
parameters:
  usToUk:
    color: colour
    colors: colours
    colored: coloured
    coloring: colouring
    behavior: behaviour
    behaviors: behaviours
    favorite: favourite
    favorites: favourites
    favor: favour
    honor: honour
    labor: labour
    neighbor: neighbour
    organize: organise
    organized: organised
    organizing: organising
    organization: organisation
    recognize: recognise
    recognized: recognised
    customize: customise
    customized: customised
    personalize: personalise
    prioritize: prioritise
    apologize: apologise
    analyze: analyse
    analyzed: analysed
    capitalize: capitalise
    categorize: categorise
    emphasize: emphasise
    summarize: summarise
    center: centre
    centered: centred
    centers: centres
    theater: theatre
    fiber: fibre
    liter: litre
    defense: defence
    offense: offence
    gray: grey
    canceled: cancelled
    canceling: cancelling
    traveler: traveller
    modeling: modelling
    labeled: labelled
    enroll: enrol
    fulfill: fulfil
    skillful: skilful
  typos:
    recieve: receive
    recieved: received
    seperate: separate
    seperately: separately
    occured: occurred
    occurence: occurrence
    definately: definitely
    accomodate: accommodate
    wich: which
    teh: the
    adress: address
    calender: calendar
    cancelation: cancellation
    existance: existence
    neccessary: necessary
    occassion: occasion
    publically: publicly
    recomend: recommend
    refered: referred
    succesful: successful
    tommorow: tomorrow
    untill: until
  pages: null
---

# CNT-13a: copy uses British spelling and has no common misspellings

## Statement

Visible copy uses Singapore English spelling, which has a British base, and has no common misspellings.

## Check

Applies when `pages` is set. Reads the visible English text of each page in `pages`. Reports each word that is a key of `usToUk` or of `typos`, matched as a whole word in any case. The finding gives the correct spelling from the map.

The rule does not read `code`, `pre`, `kbd`, `samp`, `script`, or `style` content, so a CSS property such as `color` in an example is not reported.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Write "colour", "organise", and "centre".
- Add a word to `usToUk` or `typos` when a review finds it more than once.

## Not required for

None listed.

## Rationale

One spelling standard across a product reads as one voice. A list catches the common errors at no cost to a reviewer. `CNT-13b` judges what no list catches, such as homophones, doubled words, and a wrong word that is spelled correctly.
