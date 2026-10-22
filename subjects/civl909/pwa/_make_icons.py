"""Draws the Home Screen icons of the app: pwa/icon-180.png (apple-touch-icon), icon-192.png, icon-512.png and icon-maskable-512.png. Re-run after changing the look:  python _make_icons.py
A dark square (the page's dark theme), the blue of the shallow track, a soil-layer stripe and the course number. No transparency (iOS fills transparent icons with black)."""
import os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))

def font(size):
    for f in ('C:/Windows/Fonts/arialbd.ttf', 'C:/Windows/Fonts/segoeuib.ttf', '/System/Library/Fonts/Supplemental/Arial Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'):
        if os.path.exists(f): return ImageFont.truetype(f, size)
    return ImageFont.load_default()

def draw(size, pad=0.0):
    S = 1024; im = Image.new('RGB', (S, S), '#12171a'); d = ImageDraw.Draw(im); m = int(S * pad)
    inner = S - 2 * m
    # soil layers: three stripes (sand, clay, rock) with a water-table dash, then a footing on top
    cols = ['#e8d7a5', '#c9a27a', '#8a929b']
    y0 = m + int(inner * 0.50); h = int(inner * 0.50) // 3
    for i, c in enumerate(cols): d.rectangle([m, y0 + i * h, S - m, y0 + (i + 1) * h], fill=c)
    for x in range(m, S - m, 56): d.rectangle([x, y0 + h // 2 - 6, x + 30, y0 + h // 2 + 6], fill='#2f6bea')
    d.rectangle([m + int(inner * 0.30), y0 - int(inner * 0.07), S - m - int(inner * 0.30), y0], fill='#59636e')
    d.rectangle([S // 2 - 16, y0 - int(inner * 0.26), S // 2 + 16, y0 - int(inner * 0.16)], fill='#c0392b')   # the load: an arrow pointing down onto the footing
    d.polygon([(S // 2, y0 - int(inner * 0.085)), (S // 2 - 52, y0 - int(inner * 0.17)), (S // 2 + 52, y0 - int(inner * 0.17))], fill='#c0392b')
    f = font(int(inner * 0.20)); t = '909'; w = d.textlength(t, font=f)
    d.text(((S - w) / 2, m + int(inner * 0.035)), t, font=f, fill='#ffffff')
    return im.resize((size, size), Image.LANCZOS)

for name, size, pad in (('icon-180.png', 180, 0.0), ('icon-192.png', 192, 0.0), ('icon-512.png', 512, 0.0), ('icon-maskable-512.png', 512, 0.1)):
    draw(size, pad).save(os.path.join(HERE, name)); print(name)
