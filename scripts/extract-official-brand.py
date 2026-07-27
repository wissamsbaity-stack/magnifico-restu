"""Extract logo + brand colors from official Magnifico PDF."""
from __future__ import annotations

import json
import os
import sys
from collections import Counter

try:
    import fitz  # pymupdf
except ImportError:
    import subprocess

    subprocess.check_call([sys.executable, "-m", "pip", "install", "pymupdf", "-q"])
    import fitz

from PIL import Image
import io

PDF = r"C:\Users\Wissam Sbaity\Downloads\magnifico.pdf"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
BRANDING = os.path.join(PUBLIC, "branding")
LOGO_OUT = os.path.join(PUBLIC, "logo.png")
TOKENS_OUT = os.path.join(ROOT, "src", "lib", "branding", "brand-tokens.json")

os.makedirs(BRANDING, exist_ok=True)


def rgb_to_hex(rgb):
    return "#{:02x}{:02x}{:02x}".format(*rgb)


def sample_colors(img: Image.Image):
    img = img.convert("RGBA")
    pixels = [p for p in img.getdata() if p[3] > 200]
    # quantize to reduce noise
    buckets = Counter()
    for r, g, b, a in pixels:
        key = (r // 8 * 8, g // 8 * 8, b // 8 * 8)
        buckets[key] += 1

    ranked = buckets.most_common(40)

    def pick(filter_fn):
        for rgb, count in ranked:
            if filter_fn(rgb):
                return {"rgb": list(rgb), "count": count, "hex": rgb_to_hex(rgb)}
        return None

    yellow = pick(lambda c: c[0] > 170 and c[1] > 110 and c[2] < 130 and c[0] > c[2])
    pink = pick(lambda c: c[0] > 150 and c[1] < 130 and c[2] > 60 and c[0] > c[1])
    green = pick(lambda c: c[1] > c[0] + 15 and c[1] > c[2] + 15 and c[1] > 90)
    black = pick(lambda c: max(c) < 55)
    cream = pick(lambda c: min(c) > 230 and max(c) - min(c) < 20)

    return {
        "yellow": yellow,
        "pink": pink,
        "green": green,
        "black": black,
        "cream": cream,
        "top": [{"rgb": list(k), "hex": rgb_to_hex(k), "count": v} for k, v in ranked[:12]],
    }


def main():
    doc = fitz.open(PDF)
    page = doc[0]
    img_path = None
    best_img = None

    for img in page.get_images(full=True):
        xref = img[0]
        base = doc.extract_image(xref)
        if not best_img or base["width"] * base["height"] > best_img["width"] * best_img["height"]:
            best_img = base

    if best_img:
        ext = best_img["ext"]
        img_path = os.path.join(BRANDING, f"official-logo-source.{ext}")
        with open(img_path, "wb") as f:
            f.write(best_img["image"])
        pil = Image.open(io.BytesIO(best_img["image"]))
    else:
        mat = fitz.Matrix(4, 4)
        pix = page.get_pixmap(matrix=mat, alpha=True)
        img_path = os.path.join(BRANDING, "official-logo-source.png")
        pix.save(img_path)
        pil = Image.open(img_path)

    doc.close()

    # Trim transparent margins
    bbox = pil.getbbox()
    if bbox:
        pil = pil.crop(bbox)

    pil.save(LOGO_OUT, format="PNG", optimize=True)
    w, h = pil.size
    colors = sample_colors(pil)

    tokens = {
        "logo": {"path": "/logo.png", "width": w, "height": h, "sourcePdf": PDF},
        "colors": {k: (colors[k]["rgb"] if colors.get(k) else None) for k in ["yellow", "pink", "green", "black", "cream"]},
        "hex": {k: (colors[k]["hex"] if colors.get(k) else None) for k in ["yellow", "pink", "green", "black", "cream"]},
        "samples": colors["top"],
    }

    with open(TOKENS_OUT, "w", encoding="utf-8") as f:
        json.dump(tokens, f, indent=2)

    print(json.dumps(tokens, indent=2))


if __name__ == "__main__":
    main()
