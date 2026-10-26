#!/usr/bin/env python3
"""
scale-capture.py - write the scaled copy of each capture that an agent reads.

A capture taken at a device pixel ratio above 1 is wider than its viewport. An
agent judges from a copy no wider than --width, and the full-size file stays
beside it as the source for crops. The copy is `<name>.scaled.png`, in the same
directory as the frame. A frame that is already within the width gets no copy.

The command prints one path for each frame, in the order given: the scaled copy,
or the frame itself when it needed no copy. An agent reads those paths.

Usage:
  python3 scripts/scale-capture.py [--width 1280] <frame>...

Exit codes:
  0  printed one path for each frame
  4  Pillow is not installed, or a frame is missing or unreadable (a tool
     failure); nothing was printed
"""

import argparse
import os
import sys

DEFAULT_WIDTH = 1280
INSTALL = "python3 -m pip install --user Pillow"


def scaled_path(frame):
    stem, ext = os.path.splitext(frame)
    return f"{stem}.scaled{ext}"


def scale(frame, width, Image):
    """The path an agent reads for one frame, after writing its scaled copy
    when the frame is wider than `width`."""
    with Image.open(frame) as image:
        if image.width <= width:
            return frame
        height = round(image.height * width / image.width)
        copy = scaled_path(frame)
        image.resize((width, height), Image.LANCZOS).save(copy)
        return copy


def main(argv=None):
    p = argparse.ArgumentParser(
        description="Write the scaled copy of each capture that an agent reads."
    )
    p.add_argument("frames", nargs="+", help="the capture files, at full size")
    p.add_argument("--width", type=int, default=DEFAULT_WIDTH,
                   help=f"the widest copy an agent reads (default {DEFAULT_WIDTH})")
    args = p.parse_args(argv)

    try:
        from PIL import Image
    except ImportError:
        print(f"ERROR scale-capture.py: Pillow is not installed, so no frame was scaled. "
              f"Install it with `{INSTALL}` and rerun.")
        return 4

    paths = []
    for frame in args.frames:
        try:
            paths.append(scale(frame, args.width, Image))
        except OSError as exc:
            print(f"ERROR scale-capture.py: cannot read {frame}: {exc}. "
                  f"Recapture the frame and rerun.")
            return 4
    print("\n".join(paths))
    return 0


if __name__ == "__main__":
    sys.exit(main())
