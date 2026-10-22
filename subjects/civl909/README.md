# CIVL909 pack

Two tracks, one notation, one exam.

| Track | Weeks | Source of the problems |
|---|---|---|
| **Shallow foundations** | 1-5 (no week 6 material) | declarative: `problems/shallow/w1.js … w5.js` (tutorial sheets 1-5 with the official handwritten solutions) and `problems/exam/midsession_2026.js` (Section II); `quiz/midsession_2026.json` (Section I, 14 MCQ) |
| **Deep foundations** | 7-10 | the pile engine, through `adapters/piles/adapter.js` (19 problems + playground) |

* `notation.json`: 174 symbols (162 original + 12 added). Weeks 1-5 → shallow (105), weeks 7-10 → deep (69). The original and its Anki builder: `interface_playbook/knowledge/notation/`.
* `problems/_lib/shallow_lib.js`: shared tables (Hansen/course N_q, N_c, N_γ; Peck–Hanson–Thornburn C_N), Fadum's influence factor, the Schmertmann I_z helper, and builders (SPT working, stress-history gate).
* Problem types (shallow): bearing capacity · allowable pressure from SPT · plate load test · immediate (elastic) settlement · stress increase at depth · void ratio and stress history · consolidation settlement · consolidation time · secondary compression · CPT / Schmertmann · concept (MCQ).
* Check everything: `python ../../build.py --subject subjects/civl909` then open `dist/civl909.html#selftest` (28 declarative problems; 27 match the official answer, exam Q4 is a documented difference).

## Where each official answer comes from
Tutorial sheets: `Sources/Tutorial Questions and Solutions/` (week 1-5 questions and solutions; the solutions for weeks 1, 3 (Q1), 4 (Q1), 5 are typeset, the others handwritten scans). Exam: `interface_playbook/knowledge/exams/midsession_2026/` (`Mid_Session_2026_Questions_Only.pdf`, `ANSWER_KEY.md`, `questions.json`).

## Sources that decide a number (so they can be re-checked)
- Hansen/Craig factors: φ = 40° N_q = 64, N_γ = 95 (W1 Q1, Q3); φ = 35° N_q = 33, N_γ = 41 (Q5); φ = 20° N_c = 15, N_q = 6.4, N_γ = 3.5 (Q2b).
- Week 2: the 10.5 kPa-per-blow figure and C_N = 1.5, 1.35, 1.24, 1.15, 1.10 are the readings in the handwritten working.
- Week 3: μ0 = 0.94, μ1 = 0.60 (H/B = 2), 0.85 (H/B = 6), I_b = 0.76, 0.56, 0.63.
- Week 5 Q3: Table 8.6 (Δz, q_c, I_z) as printed.
- Exam Q4: layers 2, 1, 3, 2 m with q_c = 3, 3.5, 5, 4 MPa read from the figure on page 5 of the paper.
