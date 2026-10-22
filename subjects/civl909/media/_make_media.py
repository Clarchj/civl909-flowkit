"""Renders the pictures the interface shows next to a problem: the page it was set on (Question tab) and the lecture slides its working uses (Lecture tab).
Writes media/*.webp and media/media.json.  Re-run after editing the tables below, then rebuild:   python _make_media.py

  QUESTIONS  id -> (caption, parts)      a part is (pdf, page, from_phrase, to_phrase): the page area from the line that starts with from_phrase
                                         down to the line that starts with to_phrase (None = top / bottom of the content). Parts stack top to bottom.
  SLIDES     id -> (week file, page, caption[, crop])   one slide; crop = (x0, y0, x1, y1) as fractions of the page when only part of it matters.
The same slide table as the Anki export is reused (anki/_make_images_json.py) so a slide is identified once."""
import json, os, re, sys, glob
import pymupdf
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))          # the CIVL909 folder that holds Sources/
sys.path.insert(0, os.path.join(HERE, '..', 'anki'))
import _make_images_json as ANKI                                            # the slide table of the Anki deck (it writes nothing when imported)

TUT = os.path.join(ROOT, 'Sources', 'Tutorial Questions and Solutions')
LEC = os.path.join(ROOT, 'Sources', 'Lecture')
EXAM = os.path.join(ROOT, 'interface_playbook', 'knowledge', 'exams', 'midsession_2026', 'Mid_Session_2026_Questions_Only.pdf')
T = lambda n: os.path.join(TUT, n)
L = lambda pat: sorted(glob.glob(os.path.join(LEC, pat)))[0]

# ----------------------------------------------------------------------------------------------------------- the page a question was set on
F = {'w1': 'week1 Tutorial questions.pdf', 'w2': 'week 2 tutorial questions_2026.pdf', 'w3': 'Week 3 Tutorial.pdf', 'w4': 'Week4 tutorial questions.pdf', 'w5': 'Week 5 tutorial.pdf',
     'w7': 'Week 7 Tutorial.pdf', 'w8': 'Week 8 tutorial.pdf', 'w9': 'Week 9 tutorial.pdf', 'w10': 'Week 10 tutorial.pdf', 'w11': 'Week 11 tutorial.pdf', 'w12': 'Week 12 tutorial.pdf'}
def tq(w, n, page, a, b, cap=None):                                           # a tutorial question
    return (cap or f'Tutorial sheet {w[1:]} · question {n}', [(T(F[w]), page, a, b)])
QUESTIONS = {
    'q-w1-1': tq('w1', 1, 1, '1. A strip footing is to be', '2. A strip footing 3 m'),
    'q-w1-2': tq('w1', 2, 1, '2. A strip footing 3 m', '3. A footing 2.5'),
    'q-w1-3': tq('w1', 3, 1, '3. A footing 2.5', '4. A load of 425'),
    'q-w1-4': tq('w1', 4, 1, '4. A load of 425', '5. The base of a long'),
    'q-w1-5': tq('w1', 5, 1, '5. The base of a long', None),
    'q-w2-1': tq('w2', 1, 1, '1. A square footing', '2. A fine sand'),
    'q-w2-2': tq('w2', 2, 1, '2. A fine sand', '3. A plate load'),
    'q-w2-3': tq('w2', 3, 1, '3. A plate load', None),
    'q-w3-1': tq('w3', 1, 1, 'Q.1 A foundation', 'Q.2 The plan'),
    'q-w3-2': tq('w3', 2, 1, 'Q.2 The plan', 'Q.3:'),
    'q-w3-3': tq('w3', 3, 1, 'Q.3:', 'Q.4:'),
    'q-w3-4': tq('w3', 4, 1, 'Q.4:', 'Q.5:'),
    'q-w3-5': ('Tutorial sheet 3 · question 5', [(T(F['w3']), 1, 'Q.5:', None), (T(F['w3']), 2, None, None)]),
    'q-w4-1': tq('w4', 1, 1, '1.A rectangular', '2. A 2.5 cm'),
    'q-w4-2': tq('w4', 2, 1, '2. A 2.5 cm', '3. The loading'),
    'q-w4-3': tq('w4', 3, 1, '3. The loading', '4. An oedometer'),
    'q-w4-4': tq('w4', 4, 1, '4. An oedometer', None),
    'q-w5-1': tq('w5', 1, 1, '1. An embankment', '2. A square footing'),
    'q-w5-2': tq('w5', 2, 1, '2. A square footing', '3. A footing 2.5X'),
    'q-w5-3': tq('w5', 3, 1, '3. A footing 2.5X', None),
    'q-w7-1': tq('w7', 1, 1, 'Q1.', None), 'q-w7-2': tq('w7', 2, 2, 'Q2.', None), 'q-w7-3': tq('w7', 3, 3, 'Q3.', None),
    'q-w8-1': tq('w8', 1, 1, 'Q1.', None), 'q-w8-2': tq('w8', 2, 2, 'Q2.', None), 'q-w8-3': tq('w8', 3, 3, 'Q3.', None),
    'q-w9-1': tq('w9', 1, 1, 'Q1.', None), 'q-w9-2': tq('w9', 2, 2, 'Q2.', None), 'q-w9-3': tq('w9', 3, 3, 'Q3.', None),
    'q-w10-1': tq('w10', 1, 1, 'Q1.', None), 'q-w10-2': tq('w10', 2, 2, 'Q2.', None), 'q-w10-3': tq('w10', 3, 3, 'Q3.', None),
    'q-w11-1': tq('w11', 1, 1, 'I The soil', 'II  A 10 m'), 'q-w11-2': tq('w11', 2, 1, 'II  A 10 m', 'III The soil'),
    'q-w11-3': tq('w11', 3, 1, 'III The soil', None), 'q-w11-4': tq('w11', 4, 2, 'IV A vertical', 'V Excavation'), 'q-w11-5': tq('w11', 5, 2, 'V Excavation', None),
    'q-w12-1': tq('w12', '(i)', 1, 'i) The back', 'ii) Details'), 'q-w12-2': tq('w12', '(ii)', 1, 'ii) Details', 'iii) A soil'), 'q-w12-3': tq('w12', '(iii)', 1, 'iii) A soil', None),
    # the mid-session paper (the typeset copy kept in interface_playbook; the photographs of the original are not on disk)
    'q-ex-1': ('Mid-session 2026 · Section II, question 1', [(EXAM, 4, '1. A multistory', '2. The ground')]),
    'q-ex-2': ('Mid-session 2026 · Section II, question 2', [(EXAM, 4, '2. The ground', '3. A 20 m')]),
    'q-ex-3': ('Mid-session 2026 · Section II, question 3', [(EXAM, 4, '3. A 20 m', '4. A square')]),
    'q-ex-4': ('Mid-session 2026 · Section II, question 4', [(EXAM, 4, '4. A square', None), (EXAM, 5, None, 252)]),
}

# ----------------------------------------------------------------------------------------------------------- lecture slides
SRC = ANKI.src                                                               # {'W1': 'Week1 Bearing*', ...} relative to flowkit/subjects/civl909/anki/
WK = lambda w: L(os.path.basename(SRC[w]))
SLIDES = {k: (w, p, c) for k, (w, p, c) in ANKI.img.items()}                 # the 56 slides of the Anki deck
exec(open(os.path.join(HERE, '_slides_extra.py'), encoding='utf-8').read()) if os.path.exists(os.path.join(HERE, '_slides_extra.py')) else None   # EXTRA = {id: (week, page, caption[, crop])}
try: SLIDES.update(EXTRA)
except NameError: pass

# ----------------------------------------------------------------------------------------------------------- rendering
def find_y(page, phrase, after=0):
    hits = [r for r in page.search_for(phrase) if r.y0 >= after - 1]
    if not hits: raise SystemExit(f'phrase not found on page {page.number + 1}: {phrase!r}')
    return min(r.y0 for r in hits)
def content_bottom(page):
    ys = [b[3] for b in page.get_text('blocks') if b[3] < page.rect.height - 20 and b[1] > 40 and b[4].strip()]
    ys += [r['bbox'][3] for r in page.get_image_info() if r['bbox'][3] < page.rect.height - 20 and r['bbox'][1] > 10]
    ys += [d['rect'].y1 for d in page.get_drawings() if d['rect'].y1 < page.rect.height - 20 and d['rect'].y0 > 40]
    return max(ys) + 8
def part_image(path, pno, a, b, width=1080):
    doc = pymupdf.open(path); page = doc[pno - 1]
    y0 = 50 if a is None else find_y(page, a) - 1
    y1 = content_bottom(page) if b is None else (b if isinstance(b, (int, float)) else find_y(page, b, y0 + 20) - 1)
    if a is None:                                                            # continuation page: start at the first content line
        ys = [bl[1] for bl in page.get_text('blocks') if bl[1] > 40 and bl[4].strip()]; y0 = min(ys) - 3
    x0, x1 = 60, page.rect.width - 60
    clip = pymupdf.Rect(x0, y0, x1, y1); s = width / clip.width
    pix = page.get_pixmap(matrix=pymupdf.Matrix(s, s), clip=clip, alpha=False)
    return Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
def stack(ims):
    if len(ims) == 1: return ims[0]
    h = sum(i.height for i in ims); out = Image.new('RGB', (max(i.width for i in ims), h), 'white'); y = 0
    for i in ims: out.paste(i, (0, y)); y += i.height
    return out
def slide_image(w, p, crop=None, width=1500):
    page = pymupdf.open(WK(w))[p - 1]; r = page.rect
    clip = r if not crop else pymupdf.Rect(r.x0 + crop[0] * r.width, r.y0 + crop[1] * r.height, r.x0 + crop[2] * r.width, r.y0 + crop[3] * r.height)
    s = width / clip.width if not crop else min(2400, width / (crop[2] - crop[0])) / r.width
    pix = page.get_pixmap(matrix=pymupdf.Matrix(s, s), clip=clip, alpha=False)
    return Image.frombytes('RGB', (pix.width, pix.height), pix.samples)

def used_ids():                                                              # only the pictures the lessons and origins name are rendered (and shipped)
    ids = set()
    for f in glob.glob(os.path.join(HERE, '..', 'problems', '_lessons', '*.js')):
        ids |= set(re.findall(r"'([A-Za-z0-9]+-[A-Za-z0-9-]+)'", open(f, encoding='utf-8').read()))
    return ids

if __name__ == '__main__':
    only = set(sys.argv[1:]); USED = used_ids()
    items, total = {}, 0
    man_path = os.path.join(HERE, 'media.json')
    if only and os.path.exists(man_path): items = json.load(open(man_path, encoding='utf-8'))['items']
    for k, (cap, parts) in QUESTIONS.items():
        if (only and k not in only) or k not in USED: continue
        im = stack([part_image(*pt) for pt in parts]); f = k + '.webp'
        im.save(os.path.join(HERE, f), 'WEBP', quality=84, method=6)
        items[k] = {'file': f, 'w': im.width, 'h': im.height, 'kind': 'question', 'cap': cap, 'from': cap}
    for k, v in SLIDES.items():
        if (only and k not in only) or k not in USED: continue
        w, p, cap = v[:3]; crop = v[3] if len(v) > 3 else None
        im = slide_image(w, p, crop); f = k + '.webp'
        im.save(os.path.join(HERE, f), 'WEBP', quality=84, method=6)
        cap = re.sub(r'^Lecture slide, week \d+ p\d+: ', '', cap)
        items[k] = {'file': f, 'w': im.width, 'h': im.height, 'kind': 'slide', 'cap': cap, 'from': f'Week {w[1:]} lecture · page {p}'}
    for k in list(items):
        if k not in USED or not os.path.exists(os.path.join(HERE, items[k]['file'])): items.pop(k)
    for f in glob.glob(os.path.join(HERE, '*.webp')):                       # drop pictures nothing refers to any more
        if os.path.basename(f)[:-5] not in items: os.remove(f)
    json.dump({'about': 'Pictures of the page a question was set on and of the lecture slides its working uses. Generated by _make_media.py; do not edit.', 'items': items},
              open(man_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    tot = sum(os.path.getsize(os.path.join(HERE, i['file'])) for i in items.values())
    print(len(items), 'images,', round(tot / 1048576, 1), 'MB')
