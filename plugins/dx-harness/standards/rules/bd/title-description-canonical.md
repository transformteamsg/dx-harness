---
code: BD-5a
slug: title-description-canonical
dss: BD-5
tier: L2
check: lint
surface: source
engine: custom
parameters:
  titleLength: [10, 60]
  descriptionLength: [50, 160]
  audience: null
---

# BD-5a: title, meta description, and canonical link are present and within length

## Statement

Each public page has a `<title>`, a meta description, and a canonical link. The title and the description fall within the lengths in the parameters.

## Check

Fails a page when any of these holds:

- The page has no `<title>`, or its length is outside `titleLength`.
- The page has no `<meta name="description">`, or its length is outside `descriptionLength`.
- The page has no `<link rel="canonical">`.

Skips when `audience` is `restricted` or `beta`. When `audience` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Fill out all metadata fields and optimise the meta tags.
- Check that the page titles and abstracts in search results are informative. `BD-5b` judges this.

## Not required for

- Digital services restricted to a specific audience and accessed directly.
- Experimental or beta services.

## Rationale

Search engines build their result from these fields. A missing or truncated field gives users a poor result.
