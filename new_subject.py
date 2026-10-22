#!/usr/bin/env python3
"""Start a new subject from the template.

    python new_subject.py thermo "Thermodynamics" --short THERMO
    -> subjects/thermo/  (subject.json, notation.json, quiz/, problems/example.js)  then builds it to dist/thermo.html

Edit subjects/thermo/subject.json (tracks, weeks, problem types), replace the example problems, add notation, build again.
"""
import argparse, json, os, shutil, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(); ap.add_argument('id'); ap.add_argument('name', nargs='?'); ap.add_argument('--short')
a = ap.parse_args()
dst = os.path.join(HERE, 'subjects', a.id)
if os.path.exists(dst): sys.exit(f'subjects/{a.id} already exists')
shutil.copytree(os.path.join(HERE, 'subjects', '_template'), dst)
p = os.path.join(dst, 'subject.json'); m = json.load(open(p, encoding='utf-8'))
m['id'] = a.id; m['name'] = a.name or a.id.title(); m['short'] = a.short or a.id.upper()[:8]
json.dump(m, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'created subjects/{a.id}'); subprocess.run([sys.executable, os.path.join(HERE, 'build.py'), '--subject', os.path.join('subjects', a.id)])
print('next: edit subjects/%s/subject.json and problems/, then  python build.py --subject subjects/%s' % (a.id, a.id))
