# Attaching screenshots and recordings (shared procedure)

Images and recordings belong on the issue, never in the repository. Upload one by dragging the file into the issue or comment box in GitHub's web interface, which stores it on GitHub's own CDN and returns a URL to paste into the body. `gh` cannot attach binaries, so this step stays manual: say so rather than leaving the author to find out when the link does not resolve.

Never commit a screenshot or a video to the repository so that an issue can link to it. It sits in every clone from then on, it outlives the issue that needed it, and deleting it later does not shrink the history. This applies to a coding agent at least as much as to a person: if you are the one holding the file, hand it to the author to upload instead of writing it into the working tree.

Convert a screen recording to a GIF and keep it under 10 MB, which is GitHub's ceiling for an image or a GIF on an issue. If the GIF is unreadable at that size, trim the recording to the few seconds that matter rather than raising the resolution.
