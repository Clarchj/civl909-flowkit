#!/usr/bin/env python3
"""Build one subject into a single offline HTML file.

    python build.py --subject subjects/civl909            ->  dist/civl909.html
    python build.py --subject subjects/_template --out /anywhere/demo.html

No npm, no network: Python 3 and a browser. What goes into the page, in this order:
    1. the subject's settings (subject.json), notation, quiz sets, and any JSON it names under "globals"
    2. kit/core/*.js        helpers, the declarative problem compiler, charts      (the kit never knows the subject)
    3. subject scripts      "scripts" in subject.json: engines/adapters first, then every problems/**/*.js
    4. kit/ui/flowmap.js    the canvas      kit/ui/shell.js   tabs, library, notation lookup, quiz
See README.md for the five-minute start and SCHEMA.md for every file format.
"""
import argparse, glob, hashlib, json, os, re, shutil, sys
HERE = os.path.dirname(os.path.abspath(__file__))
def rd(p): return open(p, encoding='utf-8').read()
def js(obj): return json.dumps(obj, ensure_ascii=False).replace('</', '<\\/')

ap = argparse.ArgumentParser(); ap.add_argument('--subject', required=True); ap.add_argument('--out')
a = ap.parse_args()
SUB = os.path.abspath(os.path.join(HERE, a.subject)) if not os.path.isabs(a.subject) else a.subject
meta = json.loads(rd(os.path.join(SUB, 'subject.json')))

out = a.out or os.path.join(HERE, 'dist', os.path.basename(SUB) + '.html')
code = ['const SUBJECT = ' + js(meta) + ';']
# pictures (the page a question was set on, lecture slides): "media" in subject.json names a folder with media.json + the image files.
# They are copied to <out without .html>_media/ and the page refers to them by that relative path (the page still works without them: it says what is missing).
media_dir = os.path.join(SUB, meta['media']) if meta.get('media') else None
media = json.loads(rd(os.path.join(media_dir, 'media.json'))) if media_dir and os.path.exists(os.path.join(media_dir, 'media.json')) else None
media_base = os.path.splitext(os.path.basename(out))[0] + '_media/'
code.append('const MEDIA = ' + (js({'base': media_base, 'items': media['items']}) if media else 'null') + ';')
for name, path in (meta.get('globals') or {}).items():                      # e.g. {"UI_CONFIG": "adapters/piles/interface.config.json"}
    code.append(f'const {name} = ' + js(json.loads(rd(os.path.join(SUB, path)))) + ';')
nota = os.path.join(SUB, meta.get('notation', 'notation.json'))
code.append('const NOTATION_RAW = ' + (js(json.loads(rd(nota))) if os.path.exists(nota) else '{"symbols":[]}') + ';')
quiz = []
for f in meta.get('quiz', []) if isinstance(meta.get('quiz'), list) else sorted(glob.glob(os.path.join(SUB, 'quiz', '*.json'))):
    p = f if os.path.isabs(f) else os.path.join(SUB, f)
    if p.endswith('.raw.json') or not os.path.exists(p): continue
    quiz.append(json.loads(rd(p)))
code.append('const QUIZ = ' + js(quiz) + ';')
exam_p = os.path.join(SUB, meta['exam']) if meta.get('exam') else None
code.append('const EXAM = ' + (js(json.loads(rd(exam_p))) if exam_p and os.path.exists(exam_p) else 'null') + ';')

for f in sorted(glob.glob(os.path.join(HERE, 'kit', 'core', '*.js')), key=lambda p: ['util', 'decl', 'chart'].index(os.path.basename(p)[:-3]) if os.path.basename(p)[:-3] in ['util', 'decl', 'chart'] else 9):
    code.append(rd(f))

scripts = []
for pat in meta.get('scripts', []):                                        # order matters: engines before the problems that use them
    hits = sorted(glob.glob(os.path.join(SUB, pat), recursive=True))
    if not hits: print('warning: no files match', pat, file=sys.stderr)
    scripts += hits
for f in scripts:
    s = rd(f)
    code.append(f'/* ---- {os.path.relpath(f, SUB)} ---- */\n' + s)
code.append(rd(os.path.join(HERE, 'kit', 'ui', 'flowmap.js')))
code.append(rd(os.path.join(HERE, 'kit', 'ui', 'scene.js')))
code.append(rd(os.path.join(HERE, 'kit', 'ui', 'companion.js')))
code.append(rd(os.path.join(HERE, 'kit', 'ui', 'teardown.js')))
code.append(rd(os.path.join(HERE, 'kit', 'ui', 'board.js')))
code.append(rd(os.path.join(HERE, 'kit', 'ui', 'phone.js')))
code.append(rd(os.path.join(HERE, 'kit', 'ui', 'exam.js')))
code.append(rd(os.path.join(HERE, 'kit', 'ui', 'quiz.js')))
code.append(rd(os.path.join(HERE, 'kit', 'ui', 'shell.js')))
script = '\n'.join(code).replace('</script', '<\\/script')

css = chr(10).join(rd(os.path.join(HERE, 'kit', 'ui', f)) for f in ['flowmap.css', 'shell.css', 'companion.css', 'phone.css'])
extra = os.path.join(SUB, 'theme.css')
if os.path.exists(extra): css += '\n' + rd(extra)                          # a subject can restyle with its own theme.css
body = rd(os.path.join(HERE, 'kit', 'page.html'))
# Home Screen app (iPhone: Safari, Share, Add to Home Screen): a manifest, icons, a service worker so it opens offline, and the iOS meta tags. "pwa" in subject.json turns it on.
pwa = meta.get('pwa')
head = tail = ''
if pwa:
    head = ('<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="apple-touch-icon.png"><meta name="theme-color" content="%s"><meta name="mobile-web-app-capable" content="yes">'
            '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="%s">') % (pwa.get('theme', '#12171a'), pwa.get('short', meta.get('short', 'App')))
    tail = "<script>if('serviceWorker' in navigator && /^https?:/.test(location.protocol)) window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));</script>"
page = body.replace('{{TITLE}}', meta.get('name', 'Flow map')).replace('{{HEAD}}', head).replace('{{TAIL}}', tail).replace('{{CSS}}', css).replace('{{SCRIPT}}', script)
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w', encoding='utf-8').write(page)
if media:
    dst = os.path.join(os.path.dirname(os.path.abspath(out)), media_base)
    shutil.rmtree(dst, ignore_errors=True); os.makedirs(dst)
    for it in media['items'].values(): shutil.copy2(os.path.join(media_dir, it['file']), dst)
    print(f'{dst}  {len(media["items"])} pictures, {sum(os.path.getsize(os.path.join(dst, f)) for f in os.listdir(dst)) // 1024} KB')
if pwa:
    odir = os.path.dirname(os.path.abspath(out)); icons = os.path.join(SUB, pwa.get('icons', 'pwa'))
    for src, dst in (('icon-180.png', 'apple-touch-icon.png'), ('icon-192.png', 'icon-192.png'), ('icon-512.png', 'icon-512.png'), ('icon-maskable-512.png', 'icon-maskable-512.png')):
        if os.path.exists(os.path.join(icons, src)): shutil.copy2(os.path.join(icons, src), os.path.join(odir, dst))
    json.dump({'name': meta.get('name'), 'short_name': pwa.get('short', meta.get('short')), 'start_url': './', 'scope': './', 'display': 'standalone', 'orientation': 'portrait',
               'background_color': pwa.get('background', '#12171a'), 'theme_color': pwa.get('theme', '#12171a'),
               'icons': [{'src': 'icon-192.png', 'sizes': '192x192', 'type': 'image/png'}, {'src': 'icon-512.png', 'sizes': '512x512', 'type': 'image/png'}, {'src': 'icon-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}]},
              open(os.path.join(odir, 'manifest.webmanifest'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    page_name = os.path.basename(out); shutil.copy2(out, os.path.join(odir, 'index.html'))
    assets = ['./', 'index.html', page_name, 'manifest.webmanifest', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'] + ([media_base + it['file'] for it in media['items'].values()] if media else [])
    ver = hashlib.sha1((page + ''.join(sorted(assets))).encode('utf-8')).hexdigest()[:10]; pfx = os.path.splitext(page_name)[0] + '-'
    sw = ("const PREFIX=%s, CACHE=PREFIX+%s, ASSETS=%s;\n"
          "self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});\n"
          "self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});\n"
          "// the page: network first (so an update shows when online), the cached copy when offline; everything else (pictures, icons): cache first\n"
          "self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;\n"
          "  if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('index.html',cp));return res;}).catch(()=>caches.match('index.html')));return;}\n"
          "  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res;})));});\n") % (json.dumps(pfx), json.dumps(ver), json.dumps(assets))
    open(os.path.join(odir, 'sw.js'), 'w', encoding='utf-8').write(sw)
    print(f'app files: manifest, sw.js (cache {pfx}{ver}, {len(assets)} files), icons, index.html')
print(f'{out}  {os.path.getsize(out)//1024} KB  ({len(scripts)} subject scripts, {len(quiz)} quiz sets)')
