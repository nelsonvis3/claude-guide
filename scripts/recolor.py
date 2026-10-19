# Variantes de color de Tilde: cambia solo el pelaje (píxeles claros y poco saturados) y respeta el sombreado.
# No toca formas, ojos, brillos, nariz, orejas ni auriculares. Uso: python3 scripts/recolor.py public/tilde
import sys
from collections import deque
import numpy as np
from PIL import Image

# (luz, sombra) del pelaje en cada variante. "blanca" es el original y no se genera.
VARIANTS = {
    "naranja": ("#f7b678", "#c8783c"),
    "gris": ("#c4bfcc", "#7f7a8a"),
    "negra": ("#5a5462", "#25212c"),
    "crema": ("#f6e6c8", "#cfb287"),
}
MIN_REGION = 60  # manchas claras más chicas que esto son brillos de los ojos: no se tocan


def hex_rgb(h):
    return np.array([int(h[i : i + 2], 16) for i in (1, 3, 5)], float) / 255


def fur_mask(rgb, alpha):
    mx, mn = rgb.max(-1), rgb.min(-1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    mask = (alpha > 0) & (sat < 0.2) & (mx > 0.6)
    # Quita regiones chicas (brillos de los ojos) con un relleno por vecindad.
    seen = np.zeros_like(mask)
    h, w = mask.shape
    for y, x in zip(*np.nonzero(mask)):
        if seen[y, x]:
            continue
        region, q = [], deque([(y, x)])
        seen[y, x] = True
        while q:
            cy, cx = q.popleft()
            region.append((cy, cx))
            for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    q.append((ny, nx))
        if len(region) < MIN_REGION:
            for ry, rx in region:
                mask[ry, rx] = False
    return mask


def recolor(path, light, shadow):
    img = np.asarray(Image.open(path).convert("RGBA")).astype(float) / 255
    rgb, alpha = img[..., :3], img[..., 3]
    mask = fur_mask(rgb, alpha)
    lum = rgb.mean(-1)
    lo, hi = lum[mask].min(), lum[mask].max()
    t = ((lum - lo) / max(hi - lo, 1e-6)).clip(0, 1)[..., None]
    out = img.copy()
    out[..., :3] = np.where(mask[..., None], shadow + (light - shadow) * t, rgb)
    return Image.fromarray((out * 255).round().astype(np.uint8)), int(mask.sum())


if __name__ == "__main__":
    base = sys.argv[1]
    for name, (light, shadow) in VARIANTS.items():
        for part in ("head", "body"):
            im, n = recolor(f"{base}/{part}.png", hex_rgb(light), hex_rgb(shadow))
            import os
            os.makedirs(f"{base}/{name}", exist_ok=True)
            im.save(f"{base}/{name}/{part}.png", optimize=True)
            print(name, part, n, "píxeles de pelaje")
