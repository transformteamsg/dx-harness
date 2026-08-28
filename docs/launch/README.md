# Launch story

Copy for the dx-harness official launch: a blog post and a Slack announcement.
Both are drafts. Nothing here is published.

| File | What it is |
|---|---|
| `blog.html` | The launch blog post, standalone HTML using the site tokens from `app/globals.css` |
| `slack-post.md` | The `#dx-harness` announcement and the design team post, with a pre-post checklist |
| `gto-design-blog.md` | Personal-voice article for the GTO design practice blog (contact: Mimi; publish mid-October) |
| `assets/harness-architecture.png` | Architecture sketch, embedded in the blog as image 2 |
| `assets/builders.png` | Builders illustration (from the Desktop illo set, downscaled to 1024px), closes the blog |

## Where the copy came from

Written through `dx-design-copy`, so the voice rules apply: sentence case, second
person, active voice, sentences under 25 words, purpose before mechanism, Singapore
English (with the `catalog` spelling carve-out from issue #76).

Checked with `plugins/dx-harness/checks/content-lint.py`. One finding survives by
design — the blog quotes "streamline" as a specimen of slop rather than using it, and
carries an inline `dx-waive SLP-9` on that line.

## Open items

- **Domain.** Both drafts carry the placeholder `https://dx-harness.example`. Replace
  it once the domain resolves.
- **The architecture diagram is an early sketch.** It reads "Control Catalogue" and
  uses pre-0.2.0 skill names (`dx:design-critique` and kin). The blog caption says so,
  but it should be redrawn against the current names before launch.
- **Four image slots are placeholders** in `blog.html`, marked with dashed frames:
  1. Hero — the animated harness mark from the logo grid generator
  3. Before and after, from the landing page slider
  4. The six skills as characters, in a grid with no hierarchy
  5. Quick start — install commands and a first prompt in Claude Code
- **One claim needs confirming.** The standfirst says the harness is live for every
  product repo in DXD. Verify the marketplace install from a clean machine first.
- **The blog now speaks in the design lead's first person** ("my job is the quality
  of craft across everything this org ships"). Confirm the author byline matches
  before publishing, or soften to "our".

## Counts to keep true

The drafts state 21 skills, 70 controls, and eleven SLP controls. `validate.py`
enforces these counts in `README.md` and `docs/index.html`, not here, so re-check
them by hand if the catalog moves.
