r"""Export a subject's notation sheet as an Anki deck (.apkg). REVERSE cards: front = what it means in the real world, back = the notation.
Usage:  python anki_export.py --subject subjects/civl909            (needs: pip install genanki pymupdf pillow)

Syntax used (Anki manual, Templates): {{Field}}, {{#Field}}..{{/Field}} (shown only if the field has text), {{hint:Field}} (hidden until clicked),
<hr id=answer> (Anki scrolls to it), card CSS with .card and .nightMode / .night_mode, MathJax: \( inline \) and \[ display \] inside FIELDS.
Fields:  Meaning (front words) · Context (topic · track) · Notation (LaTeX) · Unit (LaTeX) · Obtained · Where · Group · Logo (the web's pill and tile, symbol in LaTeX)
         · Definition (back only, LaTeX) · Equation (GEOMETRY only, LaTeX) · Image (lecture slides) · Forward (put any text to also get the notation → meaning card).
Content that is not in the notation sheet lives in <subject>/anki/content.py (FRONT, DEFINITION, EQUATIONS) and anki/images.json.
Subdecks <Subject>::<Track>::W<weeks>. Tags: track, group, how obtained. GUIDs come from the notation id, so re-importing updates cards."""
import argparse, json, os, re, sys, html, hashlib, glob, tempfile, importlib.util
import genanki

ap = argparse.ArgumentParser(); ap.add_argument('--subject', required=True); ap.add_argument('--out'); ap.add_argument('--sample', help='notation id (e.g. n101): export only that note, to create the note type without the whole deck')
a = ap.parse_args(); SUB = os.path.abspath(a.subject)
meta = json.load(open(os.path.join(SUB, 'subject.json'), encoding='utf-8'))
nota = json.load(open(os.path.join(SUB, meta.get('notation', 'notation.json')), encoding='utf-8'))
short = meta.get('short') or meta.get('name')
IMG = {'images': {}, 'map': {}}
ip = os.path.join(SUB, 'anki', 'images.json')
if os.path.exists(ip): IMG = json.load(open(ip, encoding='utf-8'))
FRONT, DEFN, EQ = {}, {}, {}
cp = os.path.join(SUB, 'anki', 'content.py')
if os.path.exists(cp):
    spec = importlib.util.spec_from_file_location('anki_content', cp); C = importlib.util.module_from_spec(spec); spec.loader.exec_module(C)
    FRONT, DEFN, EQ = getattr(C, 'FRONT', {}), getattr(C, 'DEFINITION', {}), getattr(C, 'EQUATIONS', {})
MEDIA_DIR = tempfile.mkdtemp(); MEDIA = {}

# ------------------------------------------------------------------ LaTeX helpers
GREEK = {'α': r'\alpha', 'β': r'\beta', 'γ': r'\gamma', 'δ': r'\delta', 'ε': r'\varepsilon', 'η': r'\eta', 'θ': r'\theta', 'μ': r'\mu', 'ν': r'\nu', 'π': r'\pi', 'σ': r'\sigma', 'φ': r'\varphi', 'ω': r'\omega',
         'Δ': r'\Delta', 'Σ': r'\Sigma', 'Φ': r'\Phi', 'Ω': r'\Omega'}
def g(ch): return GREEK.get(ch, ch)
def cat(a, b):
    r"""join two LaTeX pieces; a space after a command keeps \Delta + e from becoming \Deltae"""
    return a + (' ' if re.search(r'\\[A-Za-z]+$', a) and b[:1].isalpha() else '') + b
def tex_sub(sub):
    res = ''
    for m in re.finditer(r'[A-Za-z]+|[0-9]+|[α-ωΑ-Ω]', sub):
        t = m.group()
        res = cat(res, g(t) if not t.isalpha() or len(t) == 1 or t[0] in GREEK else (r'\mathrm{%s}' % t if len(t) >= 3 else t))
    return res
PART = re.compile(r"^([ΔΣ])?([A-Za-zα-ωΑ-Ω])(̄)?(['′’]*)([A-Za-z0-9α-ωΑ-Ω]*)(.*)$")
def tex_part(p):
    p = p.strip()
    m = re.match(r'^(.*?)\s*\((.*)\)$', p)
    if m and m.group(1):
        inner = m.group(2); sym = bool(re.search(r"[α-ωΑ-Ω'′’]", inner))
        return tex_part(m.group(1)) + (r'\ (' + tex_part(inner) + ')' if sym else r'\ {\scriptstyle(\mathrm{%s})}' % inner.replace(' ', r'\ '))     # a word in brackets is a label, so small
    if p.count('/') == 1 and not p.startswith('/') and not p.endswith('/'): return '/'.join(tex_part(x) for x in p.split('/'))
    if re.fullmatch(r'[A-Z]{2,}', p): return r'\mathrm{%s}' % p              # OCR, FS, ER stay upright
    m = PART.match(p)
    if not m: return r'\text{%s}' % p
    pre, base, bar, pr, sub, rest = m.groups()
    b = cat(g(pre), g(base)) if pre else g(base)
    if bar: b = r'\bar{%s}' % b
    b += "'" * len(pr)
    if sub: b += '_{%s}' % (r'\alpha\varepsilon' if sub == 'αe' else tex_sub(sub))      # C_αε is written Cαe on the sheet
    if rest.strip(): b += r'\ \text{%s}' % rest.strip()
    return b
def tex_symbol(sym):
    sym = sym.replace('′', "'").replace('’', "'")
    parts = [p.strip() for p in re.split(r',\s*', sym)]; items = []
    for p in parts:
        if items and re.fullmatch(r'[a-z]+', p) and re.fullmatch(r'[A-Za-z]{2,}', items[-1][0]) and items[-1][0][0] != p[0]:
            items[-1] = (items[-1][0], items[-1][1] + [p])          # 'Pg,s', 'cu,ave', 'qn,ult': ONE symbol with a compound subscript
        else: items.append((p, []))
    res = []
    for base, extra in items:
        if not extra: res.append(tex_part(base)); continue
        t = tex_part(base); res.append((t[:-1] if t.endswith('}') else t + '_{') + ',' + ','.join(tex_sub(e) for e in extra) + '}')
    return r',\ '.join(res)
def mj(t): return r'\(%s\)' % t
UNITS = {'kN', 'kPa', 'MPa', 'GPa', 'm', 'mm', 'cm', 'yr', 'min', 'days', 's', 'MN', 'blows', 'N'}
def tex_unit(u):
    """main unit in LaTeX; remarks in brackets stay as small muted text"""
    u = (u or '').strip(); m = re.match(r'^([^(;\[]*)(.*)$', u); main, rem = m.group(1).strip(), m.group(2).strip()
    if main in ('–', '-', ''): t = 'dimensionless'
    else:
        t = main.replace('³', '^3').replace('²', '^2').replace('degrees', '§')
        t = re.sub(r'[A-Za-z]+', lambda mm: (r'\mathrm{%s}' % mm.group()) if mm.group() in UNITS else r'\text{%s}' % mm.group(), t)
        t = mj(re.sub(r'\^(\d)', r'^{\1}', t).replace('%', r'\%').replace('§', r'^{\circ}'))
    return t + (f' <span class="urem">{html.escape(rem)}</span>' if rem else '')
SUBD = {'₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'}
def text_math(s):
    """captions: wrap symbols (X_y, unicode subscripts, lone Greek letters) in MathJax"""
    s = html.escape(s)
    s = re.sub(r'([A-Za-zα-ωΑ-Ω])(′?)_([A-Za-z0-9]+)', lambda m: mj(tex_part(m.group(1) + m.group(2) + m.group(3))), s)
    s = re.sub(r'([A-Za-zα-ωΑ-Ω]′?)([₀-₉]+)', lambda m: mj(tex_part(m.group(1) + ''.join(SUBD[c] for c in m.group(2)))), s)
    s = re.sub(r'(?<![\\A-Za-z(])([α-ωΑ-Ω])(′?)(?![A-Za-z\\)])', lambda m: mj(g(m.group(1)) + ("'" if m.group(2) else '')), s)
    return s

# ------------------------------------------------------------------ the web's logo system (mirror of kit/ui/flowmap.js: DIMS, ICON, family colours)
DIMC = {'len': '#0f8b8d', 'area': '#4c9a2a', 'force': '#c0392b', 'stress': '#2b6fd6', 'disp': '#8e44ad', 'ang': '#a0522d', 'ratio': '#6b7780', 'count': '#b9770e', 'flex': '#1b7f5c', 'stiff': '#2c7a9b'}
DIMN = {'len': 'length', 'area': 'area', 'force': 'force', 'stress': 'stress', 'disp': 'settlement', 'ang': 'angle', 'ratio': 'factor / ratio', 'count': 'count', 'flex': 'flexibility', 'stiff': 'stiffness'}
UNITDIM = {'kPa': 'stress', 'MPa': 'stress', 'GPa': 'stress', 'm': 'len', 'mm': 'disp', 'kN': 'force', 'degrees': 'ang', 'm²': 'area', 'blows': 'count', 'kN/m': 'stiff', 'm/kN': 'flex'}
def dim_of(unit): return UNITDIM.get(re.split(r'[ (;]', unit or '')[0], 'ratio')
FAMC = {'calc': '#2f6bea', 'geo': '#0d9a95', 'lookup': '#e69500'}
SVG = lambda d: f'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{d}</svg>'
ICON = {'calc': SVG('<path d="M15 4.5c-2.2-.9-4.5.2-4.5 3.3V19c0 1.7-.9 2.4-2.6 2"/><path d="M6.5 11.5h8.5"/>'),
        'geo': SVG('<path d="M4 4v16h16z"/><path d="M4 15h5v5"/>'),
        'lookup': SVG('<path d="M4 4v16h16"/><path d="M7 16c3-1 4-8 8-9s3 0 5-1"/><circle cx="14.5" cy="8.6" r="1.7" fill="#fff" stroke="none"/><path d="M14.5 10.6V20" stroke-dasharray="1.6 2.6" stroke-width="1.6"/>')}
FAMN = {'calc': ('Equation', 'given on the exam paper'), 'geo': ('Geometry', 'not on the paper: learn it'), 'lookup': ('Chart', 'the chart is provided')}
def logo_html(s):
    dm = dim_of(s.get('unit')); sym = tex_symbol(s['symbol']).split(r',\ ')[0].split(r'\ {\scriptstyle')[0]
    fam = 'geo' if s['id'] in EQ else {'calculated': 'calc', 'given or calculated': 'calc', 'chart': 'lookup'}.get(s['obtained'])
    out = f'<span class="lg pill" style="background:{DIMC[dm]}"><span class="sym">{mj(sym)}</span></span><span class="lgn">{DIMN[dm]}</span>'
    if fam: out += f'<span class="lgsep">·</span><span class="lg tile" style="background:{FAMC[fam]}">{ICON[fam]}</span><span class="lgn"><b>{FAMN[fam][0]}</b>, {FAMN[fam][1]}</span>'
    return f'<div class="logos">{out}</div>'
def eq_html(i):
    e = EQ.get(i)
    if not e: return ''
    return ''.join(r'\[%s\]' % t for t in e['tex']) + (f'<div class="eqn">{e["note"]}</div>' if e.get('note') else '')

# ------------------------------------------------------------------ slides
def render(key):
    if key in MEDIA: return MEDIA[key]
    import pymupdf; from PIL import Image
    d = IMG['images'][key]; hits = sorted(glob.glob(os.path.join(SUB, d['file']))); assert hits, ('no file for ' + key + ': ' + d['file'])
    pix = pymupdf.open(hits[0])[d['page'] - 1].get_pixmap(dpi=110); name = f"{short}_{key}.jpg".replace(' ', '_'); path = os.path.join(MEDIA_DIR, name)
    im = Image.frombytes('RGB', (pix.width, pix.height), pix.samples); w, h = im.size; im = im.crop((0, 0, w, int(h * 0.93)))
    im.save(path, quality=72, optimize=True); MEDIA[key] = (name, d['caption']); return MEDIA[key]

def track_of(weeks):
    w = int(re.match(r'\d+', weeks).group())
    for t in meta['tracks']:
        if w in t['weeks']: return t
    return meta['tracks'][0]

# ------------------------------------------------------------------ the note type
CSS = r"""
.card{--bg:#fbfaf8;--ink:#1d2024;--mut:#6a727a;--line:#dedbd5;--soft:#f1efeb;--acc:#1f6f6b;
  font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-size:16px;line-height:1.5;text-align:center;color:var(--ink);background:var(--bg);padding:14px 12px}
.card.nightMode,.night_mode .card{--bg:#1b1e21;--ink:#e7e5e0;--mut:#98a0a7;--line:#363b40;--soft:#25292d;--acc:#6fc2bd}
.wrap{max-width:34rem;margin:0 auto}
.ctx{font-size:.68rem;letter-spacing:.09em;text-transform:uppercase;color:var(--mut);margin:0 0 .9rem}
.meaning{font-size:1.3rem;line-height:1.4;margin:.2rem 0 .9rem}.meaning.q{font-size:.85rem;color:var(--mut);margin:0}
.ghost{display:inline-block;min-width:2.6rem;padding:.15rem .9rem;border:1.5px dashed var(--line);border-radius:999px;color:var(--mut);font-size:1.1rem}
.hint{margin-top:1.1rem;font-size:.8rem}.hint a{color:var(--mut);text-decoration:underline dotted}
hr#answer{border:0;border-top:1px solid var(--line);margin:1.1rem 0 1.2rem}
.notation{font-size:1.9rem;line-height:1.3;margin:.1rem 0 .6rem}
.logos{display:flex;flex-wrap:wrap;gap:.4rem .5rem;align-items:center;justify-content:center;font-size:.78rem;color:var(--mut);margin:0 0 1.1rem}
.lg{display:inline-flex;align-items:center;justify-content:center;color:#fff}.lg.pill{min-width:2.2rem;height:1.7rem;padding:0 .7rem;border-radius:999px;font-size:1rem}.lg.tile{width:1.9rem;height:1.9rem;border-radius:.45rem}
.hidesym .sym{display:none}.hidesym .pill:after{content:"?"}.hidesym{margin-top:.2rem}.lgsep{opacity:.5}.lgn b{color:var(--ink);font-weight:600}.logos{margin-bottom:.9rem}
.def{font-size:.95rem;margin:0 0 .8rem;padding:.45rem .7rem;background:var(--soft);border-radius:.5rem}
.geo{margin:0 0 .9rem;padding:.5rem .8rem .55rem;border:1.5px solid var(--acc);border-radius:.6rem;font-size:.95rem}
.geo:before{content:"Geometry · not on the paper";display:block;font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--acc);margin-bottom:.1rem}
.geo mjx-container[display="true"]{margin:.35em 0!important}.eqn{font-size:.8rem;color:var(--mut);margin-top:.2rem}
dl.meta{display:grid;align-items:baseline;grid-template-columns:auto 1fr;gap:.25rem .9rem;margin:0 auto 1rem;max-width:26rem;font-size:.8rem;text-align:left}
dl.meta dt{color:var(--mut)}.urem{color:var(--mut);font-size:.8em}dl.meta dd{margin:0}
.figs{margin-top:1rem}.figs img{max-width:100%;max-height:260px;object-fit:contain;height:auto;border:1px solid var(--line);border-radius:.4rem}.cap{font-size:.72rem;color:var(--mut);margin:.2rem 0 .9rem}
@media (max-width:480px){.card{font-size:15px}.notation{font-size:1.7rem}}
"""
FRONT_T = '<div class="wrap"><div class="ctx">{{Context}}</div><div class="meaning">{{Meaning}}</div><div class="hidesym">{{Logo}}</div>{{#Unit}}<div class="hint">{{hint:Unit}}</div>{{/Unit}}</div>'
BACK_T = ('<div class="wrap"><div class="ctx">{{Context}}</div><div class="meaning q">{{Meaning}}</div><hr id=answer>'
          '<div class="notation">{{Notation}}</div>{{Logo}}'
          '{{#Definition}}<div class="def">{{Definition}}</div>{{/Definition}}{{#Equation}}<div class="geo">{{Equation}}</div>{{/Equation}}'
          '<dl class="meta"><dt>Unit</dt><dd>{{Unit}}</dd><dt>Comes from</dt><dd>{{Obtained}}</dd><dt>Where</dt><dd>{{Where}}</dd></dl>'
          '{{#Image}}<div class="figs">{{Image}}</div>{{/Image}}</div>')
FWD_F = '{{#Forward}}<div class="wrap"><div class="ctx">{{Context}}</div><div class="notation">{{Notation}}</div></div>{{/Forward}}'
FWD_B = '<div class="wrap"><div class="ctx">{{Context}}</div><div class="notation">{{Notation}}</div><hr id=answer><div class="meaning">{{Meaning}}</div><dl class="meta"><dt>Unit</dt><dd>{{Unit}}</dd></dl></div>'
MODEL = genanki.Model(1704213002, f'{short} notation (reverse, MathJax)',
    fields=[{'name': n} for n in ['Meaning', 'Context', 'Notation', 'Unit', 'Obtained', 'Where', 'Group', 'Logo', 'Definition', 'Equation', 'Image', 'Forward']],
    templates=[{'name': 'Meaning → notation', 'qfmt': FRONT_T, 'afmt': BACK_T}, {'name': 'Notation → meaning (optional)', 'qfmt': FWD_F, 'afmt': FWD_B}], css=CSS)

def deck_id(name): return int(hashlib.md5(name.encode()).hexdigest()[:8], 16)
decks = {}; n = 0
tag = lambda x: re.sub(r'[^A-Za-z0-9_]+', '_', x).strip('_')
if __name__ == '__main__':
    for s in nota['symbols']:
        if a.sample and s['id'] != a.sample: continue                      # --sample n101: only that note, to create the note type first
        t = track_of(s['weeks']); name = (f"{short}::Template sample" if a.sample else f"{short}::{t['name']}::W{s['weeks']}")
        if name not in decks: decks[name] = genanki.Deck(deck_id(name), name)
        figs = ''.join(f'<img src="{nm}"><div class="cap">{text_math(c)}</div>' for nm, c in (render(k) for k in IMG['map'].get(s['id'], [])))
        note = genanki.Note(model=MODEL, guid=genanki.guid_for(s['id'], s['symbol']), tags=[tag(t['id']), tag(s['group']), tag(s['obtained'])],
            fields=[html.escape(FRONT.get(s['id'], s['meaning'])), html.escape(f"{s['group']} · {t['name'].split()[0]}"), mj(tex_symbol(s['symbol'])), tex_unit(s.get('unit')), html.escape(s['obtained']),
                    html.escape(f"{t['name']}, week {s['weeks']}"), html.escape(s['group']), logo_html(s), mj(DEFN[s['id']]) if s['id'] in DEFN else '', eq_html(s['id']), figs, ''])
        decks[name].add_note(note); n += 1
    # paste-in version of the note type (Tools > Manage Note Types > Cards): create the fields in this order, paste each file into its box
    td = os.path.join(SUB, 'anki', 'template'); os.makedirs(td, exist_ok=True)
    for fn, body in {'1_front.html': FRONT_T, '2_back.html': BACK_T, '3_style.css': CSS.strip() + '\n', '4_forward_front.html': FWD_F, '5_forward_back.html': FWD_B,
                     '0_fields.txt': '\n'.join(f['name'] for f in MODEL.fields) + '\n'}.items():
        open(os.path.join(td, fn), 'w', encoding='utf-8').write(body if body.endswith('\n') else body + '\n')
    out = a.out or os.path.join(SUB, 'anki', f'{short}_notation_reverse.apkg'); os.makedirs(os.path.dirname(out), exist_ok=True)
    pkg = genanki.Package(list(decks.values())); pkg.media_files = [os.path.join(MEDIA_DIR, v[0]) for v in MEDIA.values()]; pkg.write_to_file(out)
    print(f'{n} notes, {len(EQ)} geometry equations, {len(DEFN)} definitions, {sum(1 for s in nota["symbols"] if IMG["map"].get(s["id"]))} with slides ({len(MEDIA)} images), {os.path.getsize(out)//1024} KB -> {out}')
    for k, v in sorted(decks.items()): print('  ', k, len(v.notes))
