# flowkit file formats

## `subject.json`
```jsonc
{
  "id": "civl909", "name": "CIVL909 · Foundation engineering", "short": "CIVL909",
  "tracks": [ {"id":"shallow","name":"Shallow foundations","weeks":[1,2,3,4,5,6],"color":"#2f6bea"}, … ],   // weeks decide a notation entry's track
  "weeks":  { "1": "Bearing capacity", … },                       // titles for the Library "by week" view
  "types":  { "shallow": [ {"id":"bearing","name":"Bearing capacity","color":"#2f6bea","blurb":"one line"} , … ], "deep": […] },   // per track
  "start":  { "track":"shallow", "problem":"w1q4" },              // what opens first
  "globals":{ "UI_CONFIG": "adapters/piles/interface.config.json" },  // optional: JSON injected as `const NAME = …` before any script
  "notation":"notation.json", "quiz":["quiz/midsession_2026.json"],
  "scripts": [ "adapters/piles/src/config.js", …, "problems/**/*.js" ]   // loaded in this order; globs allowed (sorted). Engines/adapters first.
}
```
Everything is concatenated into **one global scope** (see "Gotchas" in DESIGN_LOG.md): do not redeclare a name the kit or an earlier script owns.

## Declarative problem: `Problem({...})` in `problems/**/*.js`
```
id, track, week, source ('tutorial'|'exam'|'lecture'|'quiz'), type (a type id of that track), title, sub, answer (html), text (html: the question),
steps:  [{id, title, stage?}]            frames drawn around blocks, and the Jump menu
stages: [['key','Title'], …]             optional outer frames that group steps (a step names its stage)
check:  [{id, exp, tol, label, unit, note}]   compare block `id` with the official `exp` (relative tol, default 2 %). Shows ✓ or ≠ on the map and in #selftest
group:  'Mid-session 2026 · Section II'  optional label
nodes:  [ In(...), Cn(...), Fn(...), Gate(...) ]
```
| builder | meaning | options |
|---|---|---|
| `In(id, value, unit, sym, name, {info,step})` | given in the question; editable on the map | |
| `Cn(id, value, unit, sym, name, {info,step})` | fixed by a rule / read as the course reads it | |
| `Fn(id, 'expr', o)` | a function; its **result is a separate block** | `sym` (html), `name`, `unit`, `verb` (default "find sym"), `eq` (symbolic equation, html, **with** the left side: `σ = P/A`), `num` (string or `v=>string` for the numbers line; auto-generated otherwise), `step`, `goal:true` (the final result), `chart` (spec or `v=>spec`), `how` (array or `v=>array` of html lines), `branch`, `course:true` |
| `Gate(id, 'expr', o)` | a yes/no decision; use its id in a `Fn` expression (`ok ? a : b`) | `test`, `yes`, `no`, `step`, `info` |

* **Wires** = identifiers in the expression that are other blocks' ids. A gate used in an expression draws a dashed (qualifier) wire.
* Expression helpers: `log10 ln exp sqrt pow abs min max PI tan atan sin cos rad deg round sum lookup('table', x)`; add yours with `Helper('name', fn)`.
* Tables: `Table('name', [[x,y],…])` (linear interpolation, clamped). `TABLES.name` gives the points back for charts.
* Ids: letters, digits, `_`; never a helper name; unique per problem.
* The opened card shows, in this order: notation, the **equation** (from `eq` + numbers + result), what the block takes, **how it was found** (the chart from `chart`, the lines from `how`), switch-off, what it feeds. If you give no `how`, the working line is used.

**Validity checks:** `Gate(id,'condition that is wrong',{test,yes:'message',no:'fine',warn:true,info})`: shown as a warning when TRUE (top bar, Question and Solution tabs); never use its id in an expression.

**Official answers per state:** `check:[{id,exp,tol,label,when:{inputId:value,…}}]`. A check with `when` applies only when those inputs have those values (one problem, several official answers: e.g. a Loading switch). The self-test runs one row per state; with no match the page says there is no official answer for these inputs.

**Gate board:** `Board(problemId,{gates:[{n:'name', chips:[{t:'label', on:v=>bool, set:{inputId:value}|v=>({…})}], because:v=>html, skip:v=>reason|null, fixed:true}], strip:v=>html})`: every either / or of the problem in one panel at the top (lit chip = the true branch; tap a faded chip to preview, then Apply). See `strengthBoard` in `subjects/civl909/problems/_lib/strength_lib.js`.

### Teaching text and pictures (kept apart from the numbers)
```js
Notes('w1q4', { idea:'what the problem tests', steps:{ s1:'why this step exists' }, traps:['...'], assumed:['convention the official working uses'] });
Scene('w1q4', { kind:'footing', B:'B', D:'D', Dw:0, soil:'clay', loadText:v=>'Q = '+fmt(v.Q)+' kN/m', caption:'...' });
```
Scene numbers are literals, a block id, or a function `v=>...` of the current values. Kinds: `footing` (B, D, Dw, layers[{kind,bot,label}], soil, ecc, H, plate, loadText) · `stack` (layers[{h,kind,label,note,noh}], Dw, Dw2, load{at,w,text}, target{layer|at,label}, drain) · `plan` (rects[{x,y,w,h,label,sign}], point, centre) · `cpt` (layers[{dz,qc,iz,zm}], B, zeroAt) · `spt` (tests[{z,N,M}], B, D, Dw) · `chart` (chart: v=>spec). Layer kinds: clay sand silt gravel rock fill soil.

### Picture kinds and controls (`Scene(id,{kind,…})`)
Kinds: `footing`, `stack`, `plan`, `cpt`, `spt`, `chart`, and `profile` (one soil column with a water table, a point `z`, a card `chips:v=>({title,color,lines,flag})`, a strength strip `strip:v=>[[z,τ],…]`; `Dw` as an input id makes the water table draggable). The `profile` kind also takes `layers:[{kind,label,bot},…]` (the last runs to the bottom) and `chips:v=>({cards:[{title,color,lines,flag},…]})` for one card per layer. Example: `problems/shallow/strength_profile.js`.
`wall`: a retaining wall in section: `{layers:[{h,kind,label}], front:{top,layers}, Dw, q, beta, tilt, crack, crackWet, wall:false, pressure:v=>[[[z,p],…],…], passive, thrust:{h,text}}` (see `problems/_notes/walls_scenes.js`).
Any scene may carry `controls:[{id (an input), label, type:'range', min,max,step,unit} | {id,label,type:'switch',options:[[value,name],…]}]`: they appear under the picture and write the input. Example: `problems/_lib/strength_lib.js`.

### Chart specs (`chartHTML`)
`{type:'curve', xl, yl, xmin, xmax, ymin, ymax, yrev?, xlog?, ylog?, xticks?, yticks?, series:[{lab, pts:[[x,y],…], hi?}], point:{x,y,lab?}, marks:[{x,lab}]}`; `yrev:true` draws depth plots (0 at the top). A subject may add more chart types by defining `miniChart(spec)` in an adapter (CIVL909 does, for pile charts).

### Pictures: where a question was set, and the slides behind each step (optional)
`subject.json "media": "media"` names a folder with `media.json` (`{items:{id:{file,w,h,kind:'question'|'slide',cap,from}}}`) and the image files; `build.py` copies them to `dist/<name>_media/`. Make them with a script (see `subjects/civl909/media/_make_media.py`: PDF pages or page areas to WebP).
- `Origin(problemId, [pictureId…], {note})`: shown at the top of the **Question** tab ("As set"), above the typed text.
- `Lesson(problemId, [[stepId|null, slideId|[ids], 'text' | v=>'text'], …])`: the **Lecture** tab, in the order of the problem's steps; `null` = about the whole problem. The text says what to look at on the slide and what it gives this problem; a function gets the computed values `v`. An item may be an object `{step, slides, text, soft:true}`: it is dropped when the problem has no such step (templates for many problems).
The Lecture tab appears only when the subject has media.

## `notation.json`
`{ about, obtained_values:{given,chart,rule,calculated,"given or calculated"}, symbols:[{id, symbol, meaning, unit, group, weeks, obtained, source}] }`
`symbol` may list several: `"Nc,Nq,Nγ"` or `"σ'pc(σ'c)"`; each part is a lookup key. A block's symbol (`N<sub>c</sub>` → `Nc`) finds its entry; a trailing index falls back (`Iz3` → `Iz`). `weeks` (e.g. `"1-5"`, `"7-8"`) selects the track.

## Home Screen app (optional): `subject.json` `"pwa": {"short","theme","background","icons":"pwa"}`
`build.py` then also writes `manifest.webmanifest`, `sw.js` (precaches the page, icons and every picture; page network first, offline fallback), the icons from the subject's `pwa/` folder (`_make_icons.py` draws them) and `index.html` beside the built page. Upload the whole `dist/`. See `HOSTING.md`.

## `quiz/*.json`
`{ id, title, track, score, source, items:[{n, marks, week, topic, kind:'concept'|'calc', q (html), options:{A:…,B:…}, answer:'B', why (html), flag}] }`

**Question bank** (adds filters, grouping and the prediction panel): `{ id, title, track, predNote?, patterns:[{id,name,blurb,weight 0-100,why}], items:[{id, week, pattern, kind, source:'exam'|'tutorial'|'lecture'|'external', likely:1-3, marks, q, options, answer, why, symbols:['Nc,Nq,Nγ',…] (notation keys), link:'w1q4' (a problem id), flag?, orig?}] }`. Generate it with a script that computes the calculation answers (see `subjects/civl909/quiz/_make_bank.py`).

## Engines / adapters (when a subject already has its own computation)
```js
ENGINES.myengine = {
  open(id){ …set globals…; return S; },      // returns the problem's state S (the kit keeps it; editing a given block does setPath(path, v) on S)
  base(id){ return pristineS; },             // for "back to the question's value"
  recompute(id, S){ },                       // after an edit
  changed(id, S){ return 0; },               // optional: how many givens were edited (shows 'Back to the question')
  program(id, S){ return {nodes, edges, steps, stages, stageOf, verify}; } };
CATALOG[id] = {id, engine:'myengine', track, week, source, type, title, sub, tags, answer, text, order};
```
**Program shape** (what the canvas draws; the declarative compiler produces the same):
`nodes`: noun `{id,kind:'noun',role:'given'|'rule'|'made',name(sym html),val,unit,info,path?,goal?,by?,step}`; verb `{id,kind:'verb',name,vtype:'calc'|'chart',rule,chart,how?,branch,step}`; adjective (gate) `{id,kind:'adj',name,yes,no,val,test,info,step}`.
`edges`: `{a,b,kind:'flow'|'qual'|'desc'|'make'}` (noun→verb, adjective→verb, noun→adjective, verb→its noun). `steps`: `[{key,title,ids,stage?}]`. `stages`: `[[key,title]]`; `stageOf(stepKey)` → index or -1. `verify`: `[{label,exp,got,tol,unit,ok,note}]`.
Editable givens carry `path` (`'vals.cu'`); the card shows "Use my own value" when `get(path)===val` and it is a number.

## Globals the kit owns (do not redeclare)
`S presetKey last ENG FM SH CP SUBJECT NOTATION_RAW QUIZ DECL TABLES NOTES SCENES ENGINES CATALOG KH KH_NAMES In Cn Fn Gate Table Helper Problem Notes Scene sceneSVG fmt esc2 plainT $q $qa interpTable lsGet lsSet identsOf evalDecl compileDecl numLine defaultVals svgS niceTicks curveChart chartHTML` and every function in `kit/ui/*.js`.

## Exam (optional): `subject.json` `"exam": "exam/blueprint.json"` and a template script
`blueprint.json`: `{title, time, intro, sections:[{id,title,note,kind:'mcq'|'numeric',slots:[{label, patterns:[…], n, kind?}  |  {label, pool:['template ids']}]}]}`.
Templates (a script listed in `scripts`): `ExamQ({id, problem:'w1q4', title, marks, p:{input:[choices] | {lo,hi,step}}, derive:o=>({…}), ok:out=>bool, text:'… {input} …', asks:[{id,label,unit,scale,d}]})`. `{name}` in `text` is replaced by the drawn input (or a computed value). The answer comes from the declarative problem, so it always matches the Map.
