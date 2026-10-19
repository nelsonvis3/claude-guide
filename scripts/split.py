# Separa el recorte en cabeza (con auriculares) y cuerpo, con una franja de solapamiento en el cuello.
import sys
import numpy as np
from PIL import Image

src, outdir = sys.argv[1], sys.argv[2]
img = np.asarray(Image.open(src).convert("RGBA")).copy()
h, w = img.shape[:2]
yy, xx = np.mgrid[0:h, 0:w]
NECK, OVERLAP, TAIL_X = 160, 12, 165
head_mask = (yy < NECK) & (xx < TAIL_X)
body_mask = (yy >= NECK - OVERLAP) | (xx >= TAIL_X)
head = img.copy(); head[~head_mask, 3] = 0
body = img.copy(); body[~body_mask, 3] = 0
assert ((head[..., 3] > 0) | (body[..., 3] > 0)).sum() == (img[..., 3] > 0).sum(), "no se puede perder ningún píxel"
Image.fromarray(head).save(f"{outdir}/head.png", optimize=True)
Image.fromarray(body).save(f"{outdir}/body.png", optimize=True)
print("ok", w, h)
