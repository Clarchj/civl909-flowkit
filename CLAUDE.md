# CLAUDE.md: brief for any AI session working in flowkit

You are working in **flowkit**, a self-contained study-interface kit. Read `README.md` (what it is), `SCHEMA.md` (file formats), `DESIGN_LOG.md` (every decision and why). Do not re-litigate decisions in DESIGN_LOG.md; extend them.

## Rules that must not break
1. **The kit never knows a subject.** Subject content lives only in `subjects/<id>/`. If you need a kit change for a subject, make it generic (an option, a helper, a hook), then use it.
2. **Wires come from expressions.** Never hand-draw edges for declarative problems. Every number on the map must be *computed* by an expression, not typed in as a result (a given or a chart reading may be typed; mark chart readings with `Cn`/`how` and say where they come from).
3. **Verify against the official answer.** Every problem that has an official answer gets `check:[{id, exp, tol}]`. Open `dist/<subject>.html#selftest` after building. If this build differs from the official answer, **keep the difference visible** (note it) instead of tuning numbers to match.
4. **Nothing hidden**: no collapsing boxes, no aggregated ports. Groups (stage/step) are frames only.
5. **Layout flows left to right with no wrapping**; do not add wrap/rows. Long wires use lanes automatically.
6. **One type scale** (`--fs-1…6`) and the logo/dimension colour system (DESIGN_LOG §8). New function kinds: extend `fnKind` (glyph + family), do not invent new styles.
7. **Track scopes everything.** A problem has a `track`, a `week`, a `source`, a `type`. A notation entry's `weeks` decides its track.
8. The inspection is a **dialog** (scrolls, flat); the companion is where reading happens. Do not put long text on the canvas.
9. Keep `DESIGN_LOG.md` updated: **every UI or logic change you make gets an entry** (what, why, what was rejected).

## To add a problem (the usual job)
1. Read the question and the official solution (handwritten PDFs: render pages to PNG and view them; do not guess numbers).
2. `Problem({...})` in `subjects/<id>/problems/<track>/<week>.js`: `In` for givens, `Cn` for fixed/chart readings, `Fn` for each calculation step in the order the solution does it (one expression per line), `Gate` for each decision ("is the water table at the base?"), `steps` named after the solution's steps, `eq` for every equation (symbolic, with the left side), `chart` + `how` for every look-up, `check` for the official answer, `goal:true` on the answer.
3. Add the teaching text and the picture in `problems/_notes/`: `Notes(id,{idea,steps,traps,assumed})` (one `why` per step) and `Scene(id,{...})`, so the companion's Picture and Solution tabs are complete.
3b. Add where the question was set and the slides its working uses: `Origin(id,[...])` and `Lesson(id,[...])` in `problems/_lessons/`, then `python subjects/<id>/media/_make_media.py` (renders only the pictures named). Look at every slide before writing a line about it.
4. Put shared tables/helpers in `problems/_lib/*.js` (the folder name sorts first). Put each new symbol in `notation.json`.
5. Build, open `#selftest` (all ✓ or a documented ≠), then look at the map: nothing overlapping, names readable, the equation card reads like the working.

## To add a question bank
Write a generator that **computes** every calculation answer (see `subjects/civl909/quiz/_make_bank.py`), tag each item with week, pattern, source, likelihood and notation symbols, run it, rebuild. Record how each worked answer was checked in the subject's `VERIFICATION.md`. Never leave an official-versus-computed difference hidden.

## To add exam templates
Write `ExamQ` templates over declarative problems (SCHEMA.md, Exam). Draw only inputs that are not typed chart readings; keep chart inputs inside the stored range; add `ok` to reject silly draws; stress-test with `xnum` over many seeds.

## To start a new subject
`python new_subject.py <id> "<Name>" --short <TAG>`, then edit `subject.json` (tracks, weeks, types), replace the example problems, fill `notation.json` and `quiz/`. If the subject already has a computation engine, write an adapter (SCHEMA.md "Engines") instead of re-authoring problems.

## Commands
```
python build.py --subject subjects/civl909          # build one subject -> dist/civl909.html (+ dist/civl909_media/, keep it beside the html)
python build.py --subject subjects/_template        # the template
python new_subject.py thermo "Thermodynamics"       # scaffold + build
dist/<x>.html#selftest                              # run every declarative problem against its official answer
```
No npm, no network. Edit only `kit/` and `subjects/`; `dist/` is generated.

## Ask the user, do not guess, when
- an official answer is not in the sources, or a convention is unclear (which C_N chart? which unit weight?),
- a chart value is needed that the solutions do not read,
- the **Anki export** of the notation is requested (card layout, fields, tags, deck structure, file type).
