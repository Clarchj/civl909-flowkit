# flowkit: a flow-map study interface you can drop in front of any subject

Turn a subject's worked problems into **flow maps**: every function is a block, every result is its own block, wires carry results to the next function, and you can open any block to see the equation, the chart it read, and how the number was found. The kit also gives you a **library** (by week, by type of problem, by source), a **notation lookup** (Ctrl+K), and a **multiple-choice quiz**, all scoped by a **track** (CIVL909 has two: shallow and deep foundations).

Everything is plain files. **No npm, no network, no install**: Python 3 and a browser.

```
flowkit/
  README.md  CLAUDE.md  SCHEMA.md  DESIGN_LOG.md      read these (CLAUDE.md is the brief for any AI session)
  build.py                 python build.py --subject subjects/<name>   ->  dist/<name>.html  (one offline file)
  new_subject.py           python new_subject.py thermo "Thermodynamics"   (copies the template and builds it)
  kit/                     the engine and interface: knows nothing about any subject
    core/   util.js decl.js chart.js        helpers, the declarative problem compiler, generic charts
    ui/     flowmap.js flowmap.css shell.js shell.css        the canvas; the tabs, library, notation, quiz
    page.html                the page skeleton
  subjects/
    _template/             a working 2-problem subject to copy
    civl909/               the real one: notation, shallow tutorials weeks 1-5, mid-session exam, pile engine adapter (deep)
  dist/                    built pages (open them directly in a browser; a subject with pictures also gets a `<name>_media/` folder that must stay beside the html)
```

## Five-minute start for a new subject

1. `python new_subject.py thermo "Thermodynamics" --short THERMO`  (creates `subjects/thermo/` and builds `dist/thermo.html`; open it)
2. Edit `subjects/thermo/subject.json`: the **tracks** (e.g. one, or two like shallow/deep), the **weeks** and their titles, the **problem types** with a one-line blurb each.
3. Replace `problems/example.js` with your problems. One block per line:
   ```js
   Problem({ id:'w1q1', track:'main', week:1, source:'tutorial', type:'basics', title:'W1 Q1', sub:'…', answer:'Official: x = 12',
     text:'the question…', steps:[{id:'s1',title:'Stress in the bar'}], check:[{id:'x',exp:12,tol:0.02}],
     nodes:[ In('P',50,'kN','P','axial load'), In('A',400,'mm²','A','area'),
             Fn('x','P*1000/A',{sym:'σ',name:'stress',unit:'MPa',step:'s1',goal:true,eq:'σ = P/A'}) ] });
   ```
   Wires come from the names inside each expression. Every number is computed, so editing an input on the map recomputes the whole chain.
4. Fill `notation.json` (symbol, meaning, unit, group, weeks, how you get it). The lookup and the notation card on each block use it.
5. `python build.py --subject subjects/thermo`, open `dist/thermo.html`. Open `dist/thermo.html#selftest` to run every problem against its official answer.

To **hand it to Claude**: drop the whole `flowkit/` folder into the new project and say: "Read flowkit/CLAUDE.md, then build the <subject> pack from these lecture/tutorial files." CLAUDE.md holds every rule and design decision.

## What you get

| Tab | What it is |
|---|---|
| **Map** | the flow map of one problem: pan, zoom, box-select, drag blocks, plug/unplug wires, switch functions off, jump between steps, minimap, question card, official-answer check |
| **Companion** (beside the map) | **Question** (what it asks, given, given-but-not-needed, check your answer, practice mode) · **Picture** (the situation drawn from the numbers) · **Solution** (the working written out, follows the map) · **Notes** (the idea, traps, conventions, symbols) |
| **Library** | problems grouped by **week**, **type of problem** or **source** (tutorial, exam, lecture example); search; ✓ for opened |
| **Notation** | every symbol with unit and how you get it, scoped to the track; "both tracks" shows symbols that mean different things in each |
| **Quiz** | a focused study view (one question at a time, a question grid, Practice and Test modes, flags, text size, keyboard, remembered preferences) over **question banks**; filters, a final-exam prediction panel, a results screen by topic; each answer links to its notation symbols and its worked problem |
| **Exam** | a generated practice paper (multiple choice from the banks + numerical templates with re-drawn numbers); swap one question, new version, version code, answer key, print, worked solution with that version's numbers |
| **Anki** | `python anki_export.py --subject subjects/<name>` writes a reverse-card deck of the notation (meaning on the front, notation on the back) |
| **Ctrl+K / `/`** | micro-lookup anywhere: type a symbol or a word, see what it is, where it appears in this problem and in other worked problems |

## Two kinds of problem source

- **Declarative** (the normal way): `problems/*.js` with `Problem({...})`. The kit evaluates them itself. Use this for every new subject.
- **Adapter** (an existing computation engine): a subject can plug in its own engine by registering `ENGINES.<name>` (open / base / recompute / program) and adding its problems to `CATALOG`. CIVL909's deep-foundation track does this with the pile engine it already had (`subjects/civl909/adapters/piles/adapter.js`). See SCHEMA.md.

## Honest notes

- Unplugging a wire cuts the dependency and propagates "no result" downstream (like null data in Grasshopper). Declarative problems *can* support real re-wiring later because their functions are executable; adapter problems cannot.
- Where a tutorial reads a value off a chart, the problem stores **the reading the official solution uses** and flags it; in-between points of a stored chart may be interpolated (`_lib/shallow_lib.js` says which).
- A problem whose answer differs from the official one shows a red "≠ differs" chip with the reason (see `ex26q4`), never a silent match.
