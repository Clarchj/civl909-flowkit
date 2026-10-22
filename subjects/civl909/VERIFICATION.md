# CIVL909: how every worked answer was checked

Each declarative problem was recomputed **independently** (closed-form Hansen factors, exact Fadum and Coulomb formulas, a trial-wedge force
polygon for Coulomb) and compared with the official handwritten working. Open `dist/civl909.html#selftest` for the live comparison.

| Status | Meaning |
|---|---|
| ✓ | independent value within 1 % of the official answer |
| ≈ | the official working reads a chart or rounds; the difference is explained in the problem's Notes |
| ≠ | the official answer or the old key could not be reproduced; both are shown |
| ? | no official answer exists (hint only or no solution supplied); computed here |

## Shallow (weeks 1–5)
| Problem | Official | Independent | Status | Note |
|---|---|---|---|---|
| W1 Q1 B | 1.55 m | 1.55 | ✓ | N_γ = 1.8(N_q − 1)tanφ (lecture) reproduces 95 at 40°; with Hansen's 1.5 B would be 1.65 |
| W1 Q2a/b F | 4.7 / 6.6 | 4.72 / 6.59 | ✓ | |
| W1 Q3a/b F | 7.0 / 5.3 | 7.04 / 5.35 | ✓ | Terzaghi comparison (asked in the sheet) added to the Notes: about 8.0 / 6.2 |
| W1 Q4 F | 2.8 | 2.82 | ✓ | |
| W1 Q5 F | 4.0 | 4.08 | ✓ | |
| W2 Q1 q_a | 126 kPa | 126 (with the official C_N readings) | ≈ | C_N readings run 2–6 % above 0.77·log(2000/σ′); with the formula 122 kPa |
| W2 Q2 q_a | 138 | 138 (C_N = 1.5) | ≈ | with C_N = 1.4 (formula) 132 kPa |
| W2 Q3 s | 30.2 mm | 30.25 | ✓ | |
| W3 Q1 s | ≈ 5 mm | 5.2 | ✓ | μ₀, μ₁ are chart readings |
| W3 Q2 s | 1.28 m | 1.27 (official I_b) / 1.31 (exact I_b) | ≈ | official reads I_b = 0.63 at L/B = 1.67; table interpolation 0.69, exact 0.71 |
| W3 Q3 a–c e_f | 1.187 / 1.074 / 1.09 | 1.187 / 1.073 / 1.098 | ✓ | |
| W3 Q4 S_c | 0.234 m | 0.235 | ✓ | |
| W3 Q5 S_c | 90.1 mm | 90.3 | ✓ | |
| W4 Q1 σ_z | 44 kPa | 44.1 | ✓ | Fadum closed form gives 0.1936 and 0.1202 |
| W4 Q2, Q4, Q3 | 120 d, 118 d, 17.14 cm | 120, 118.8, 17.14 | ✓ | |
| W5 Q1 S | 0.226 m | 0.223 (unrounded) | ≈ | official rounds S_p to 0.17; t = 7 yr is used as t, not 1.3 + 7 (that gives 0.228) |
| W5 Q2 q_a | hint only | 203 kPa | ? | averaging D to D + 2B takes all six tests; five tests give 187 kPa |
| W5 Q3 s | 28 mm | 26.5 mm with the I_z triangle | ≈ | the book reads I_z = 0.41 and 0.68 in layers 1 and 2; the triangle gives 0.32 and 0.65 |

## Mid-session exam 2026 (Section II)
| Q | Key | Independent | Status |
|---|---|---|---|
| Q1 | 2686 kPa | 2686 | ✓ |
| Q2 | 125 mm | 125 | ✓ (100 mm if the dewatered sand drops to 18 kN/m³) |
| Q3 | 3.56 yr | 3.56 | ✓ |
| Q4 | ≈ 48 mm (not re-run) | 40.1 mm (E = 2.5q_c); 50 mm (E = 2q_c); 29 mm (E = 3.5q_c) | ≠ |

Section I: Q3 depends on the C_N formula (Liao–Whitman gives 23 → C; Peck's 0.77log(2000/σ′) gives 19.5 → B). The tutorial 2 C_N readings follow the Peck
curve, so **B may be the course answer**; the old key says C. Check the marked paper. Q6 is the strict-theory case (stress increase does not enter c_v).

## Retaining walls (weeks 11 and 12)
| Problem | Official | Independent | Status | Note |
|---|---|---|---|---|
| W11 Q1 pressures | 12.0, 37.9, 44.9, 55.9; 112.6, 108.4, 193.5 | 11.9, 37.6, 45.0, 56.1; 113.5, 108.1, 192.8 | ✓ | official rounds K_a to 0.24 and 0.36 (Craig example 6.2) |
| W11 Q2 P_a | 393.7 kN/m | 393.7 | ✓ | the crack is water-filled (41 kN/m); 352 kN/m if empty |
| W11 Q3 P, z̄ | 183.6 kN/m, 2.56 m | 182.1, 2.58 | ✓ | rounding of K_a; water-filled crack |
| W11 Q4 P_a | 81 kN/m | 81.1 | ✓ | |
| W11 Q5 c_u | 91.1 kPa | **45.6 kPa** | ≠ | the official working uses the crack depth z₀ = 2c_u/γ as the failure depth; the critical depth of a vertical cut is 4c_u/γ |
| W11 lecture example a/b | none | 57.6 / 93.4 kN/m | ? | |
| W12 (i) P_a | none supplied | 476 kN/m (closed form and trial wedge agree) | ? | check the wall-angle convention |
| W12 (ii) gravity wall | none supplied | not worked | — | the figure dimensions are not legible enough to rebuild |
| W12 (iii) P_a,h | none supplied | 54.7 kN/m | ? | K_ac = 2√(K_a(1 + c_w/c′)) in Craig's form; the slide prints it garbled |

## Question bank
188 items (105 shallow, 53 deep, 30 walls). Every calculation item's correct option is **computed** in `quiz/_make_bank.py` from the stated data, not typed.
Concept items come from the lecture slides (the source is tagged `lecture`), the mid-session paper (`exam`), the tutorials, or an outside source
(`external`, e.g. Mesri's C_α/C_c ≈ 0.04 and Schmertmann's 1978 I_z triangle).

## Lecture slides and question pages (20 Oct session, Lecture tab)
Each lesson text was written after looking at the slide it points to. Facts taken from a slide are quoted from it (formulas, the water-table cases, the Meyerhof equations, the worked example numbers 1700/1900/2600/2400 kN, 285 + 1500 kN, 4700 kN, 19 mm, I = 1.8, R_v = 0.94, R_h = 0.82). Statements about *this* problem (which layer, which chart) come from the problem's own Notes. Open items carried over, not decided here: exam MCQ Q3 (which C_N), W12 (i) wall-angle convention (the Lecture text says it is an open check), W11 Q5 official working.
