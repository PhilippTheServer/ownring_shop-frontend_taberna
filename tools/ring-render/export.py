"""Crop the transparent renders and write the WebP files used by the page."""

import sys

from PIL import Image


def crop(src: str, pad: float = 0.04) -> Image.Image:
    im = Image.open(src).convert("RGBA")
    box = im.getchannel("A").point(lambda a: 255 if a > 6 else 0).getbbox()
    p = int(max(box[2] - box[0], box[3] - box[1]) * pad)
    return im.crop((max(box[0] - p, 0), max(box[1] - p, 0), min(box[2] + p, im.width), min(box[3] + p, im.height)))


out = sys.argv[1]
hero = crop("hero.png")
hero.save(f"{out}/ring-hero.webp", quality=86, method=6)
crop("inside.png").save(f"{out}/ring-inside.webp", quality=86, method=6)
hero.thumbnail((360, 360))
hero.save(f"{out}/ring-thumb.webp", quality=86, method=6)
