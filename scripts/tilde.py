# Capas de Tilde a partir del arte de Nelson (art/tilde, fuera del repo). No se dibuja nada: solo se recorta, escala y separa.
# Por color: public/tilde/<color>/head.webp + body.webp, y lo mismo por traje en public/tilde/<color>/<traje>/.
# Con --icons rehace el logo (public/tilde/icon.png, src/app/icon.png y apple-icon.png) desde la cabeza de la blanca.
# Uso: python3 scripts/tilde.py [--icons]
import glob
import os
import re
import sys
from collections import deque
import numpy as np
from PIL import Image, ImageDraw

ART, OUT = "art/tilde", "public/tilde"
# Gata base de cada color: dibujo grande sobre fondo negro.
BASE = {"blanca": f"{ART}/Blanco/Gatito blanco kawaii de ojos brillantes.png"} | {
    c: glob.glob(f"{ART}/{c}/Imagen de ChatGPT*.png")[0] for c in ("naranja", "gris", "negra", "crema")
}
# Trajes: 40 por color, recortes PNG con transparencia (<n>_<Nombre>_original.png).
SUITS = {"blanca": "Estilos-blanco", "naranja": "estilos-naranja", "gris": "estilos-gris", "negra": "estilos-negro", "crema": "estilos-crema"}
W, H = 208, 242  # lienzo que espera src/components/Mascot.tsx
BOTTOM, WIDTH, MAX_H = 240, 191, 234  # apoyada abajo, centrada en x=103
CHIN = 0.44  # corte de la cabeza: a esta fracción del ancho desde abajo, apenas bajo el mentón (la altura varía con el pelo)
OVERLAP = 12  # el cuerpo sigue un poco bajo la cabeza para que no se vea el corte al girar


def comps(mask):
    h, w = mask.shape
    lab = np.zeros((h, w), int)
    sizes = [0]
    for y, x in zip(*np.nonzero(mask)):
        if lab[y, x]:
            continue
        n = len(sizes)
        q = deque([(y, x)])
        lab[y, x] = n
        c = 0
        while q:
            cy, cx = q.popleft()
            c += 1
            for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not lab[ny, nx]:
                    lab[ny, nx] = n
                    q.append((ny, nx))
        sizes.append(c)
    return lab, sizes


def cut_black(path):
    """Saca el fondo negro: relleno desde las esquinas solo por lo casi negro, así no entra en el gato."""
    im = Image.open(path).convert("RGB")
    marked = im.copy()
    for xy in ((0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)):
        if max(marked.getpixel(xy)) <= 10:
            ImageDraw.floodfill(marked, xy, (255, 0, 255), thresh=10)
    rgb = np.asarray(im)
    bg = (np.asarray(marked) == (255, 0, 255)).all(-1) & (rgb.max(-1) <= 12)
    out = Image.fromarray(np.dstack([rgb, np.where(bg, 0, 255).astype(np.uint8)]))
    return out.crop(out.getbbox())


def split(im, out, ss):
    """Escala al lienzo (por ss para pantallas densas) y separa cabeza y cuerpo."""
    k = min(WIDTH / im.width, MAX_H / im.height) * ss
    cat = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    full = Image.new("RGBA", (W * ss, H * ss))
    full.paste(cat, (round(103 * ss - cat.width / 2), BOTTOM * ss - cat.height))
    a = np.asarray(full)
    yy = np.arange(a.shape[0])[:, None]
    neck = BOTTOM * ss - round(cat.width * CHIN)
    # Arriba del corte, la cabeza es la mancha más grande; lo que queda suelto (la punta de la cola) va con el cuerpo.
    lab, sizes = comps((a[..., 3] > 12) & (yy < neck))
    head = lab == int(np.argmax(sizes))
    for _ in range(2):  # suma el borde suavizado
        head[1:] |= head[:-1]; head[:-1] |= head[1:]; head[:, 1:] |= head[:, :-1]; head[:, :-1] |= head[:, 1:]
    head &= yy < neck
    body = ~head | (yy >= neck - OVERLAP * ss)
    os.makedirs(out, exist_ok=True)
    for name, m in (("head", head), ("body", body)):
        layer = a.copy()
        layer[~m] = 0
        Image.fromarray(layer).save(f"{out}/{name}.webp", quality=88, method=6)


def icons():
    head = Image.open(f"{OUT}/blanca/head.webp")
    face = head.crop(head.getbbox())
    for path, size in ((f"{OUT}/icon.png", 96), ("src/app/icon.png", 64), ("src/app/apple-icon.png", 180)):
        n = size * 4
        disc = Image.new("L", (n, n))
        ImageDraw.Draw(disc).ellipse((0, 0, n - 1, n - 1), fill=255)
        im = Image.new("RGBA", (n, n))
        im.paste((150, 108, 157, 255), (0, 0), disc)  # el lila de siempre
        k = n * 0.86 / face.width
        f = face.resize((round(face.width * k), round(face.height * k)), Image.LANCZOS)
        layer = Image.new("RGBA", (n, n))
        layer.paste(f, ((n - f.width) // 2, round(n * 0.1)))
        layer.putalpha(Image.fromarray(np.minimum(np.asarray(layer)[..., 3], np.asarray(disc))))
        im.alpha_composite(layer)
        im.resize((size, size), Image.LANCZOS).save(path, optimize=True)


if __name__ == "__main__":
    only = [a for a in sys.argv[1:] if not a.startswith("--")]  # colores a rehacer; sin nada, todos
    for cat, path in BASE.items():
        if only and cat not in only:
            continue
        split(cut_black(path), f"{OUT}/{cat}", 2)
        for f in sorted(glob.glob(f"{ART}/{SUITS[cat]}/0*/*_original.png")):
            suit = re.sub(r"^\d+_|_original\.png$", "", os.path.basename(f)).lower()
            im = Image.open(f).convert("RGBA")
            split(im.crop(im.getbbox()), f"{OUT}/{cat}/{suit}", 1)
        print(cat, "ok")
    if "--icons" in sys.argv:
        icons()
        print("logo ok")
