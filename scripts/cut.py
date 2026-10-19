# Recorta el gato del fondo violeta liso: alfa por distancia de color al fondo y quita el halo violeta.
import sys
import numpy as np
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
a = np.asarray(Image.open(src).convert("RGB")).astype(float)
bg = a[5, 5]
dist = np.sqrt(((a - bg) ** 2).sum(2))
alpha = np.clip((dist - 12) / (60 - 12), 0, 1)

# la sombra violeta oscura del piso no va: la dibujamos aparte
shadow = (a[..., 0] < 140) & (a[..., 2] > a[..., 1] + 25) & (np.arange(600)[:, None] > 380)
alpha[shadow] = 0

safe = np.maximum(alpha, 1e-3)[..., None]
rgb = np.clip((a - (1 - alpha[..., None]) * bg) / safe, 0, 255)
img = np.dstack([rgb, alpha * 255]).astype(np.uint8)
x0, x1, y0, y1 = 296, 504, 168, 410
Image.fromarray(img[y0:y1, x0:x1], "RGBA").save(out)
assert img[5, 5, 3] == 0, "el fondo tiene que quedar transparente"
print("ok", x1 - x0, y1 - y0)
