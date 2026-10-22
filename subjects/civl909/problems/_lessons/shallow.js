// ================= LECTURE LESSONS · shallow foundations (weeks 1 to 5 and the mid-session paper) =================
// Lesson(problemId, [[stepId|null, slideId|[ids], 'how this slide is used HERE' | v=>'…'], …]).  Slide ids are in media/_make_media.py and media/_slides_extra.py.
// The text says what to LOOK AT on the slide and what it gives this problem; the reasoning behind each step is in the Notes tab.
const _f=x=>fmt(x);

// ---------- Week 1: bearing capacity ----------
const BC_DEF=[null,'w1-def','The lecture defines two pressures. <b>q<sub>f</sub></b> is the pressure that causes shear failure of the soil under and beside the footing; <b>q<sub>a</sub></b> is the pressure you may apply, so that shear failure is safe <i>and</i> settlement is acceptable. This sheet is about the shear-failure side only.'];
Lesson('w1q1',[ BC_DEF,
  ['s1','w1-water',v=>`The slide has three cases. Water table deeper than about 1.5–2B: ignore it. Water table <b>below the base</b>: the soil under the footing is submerged, so the width term uses γ′ = γ<sub>sat</sub> − γ<sub>w</sub>. Water table <b>at the surface</b>: γ′ in both terms. The question lets the water rise to foundation level, so the soil under the base is submerged: γ′ = ${_f(v.gp)} kN/m³ in the B term, while the surcharge term keeps γ = ${_f(v.g)} (the soil above the base stays dry).`],
  ['s2','w1-soilpar','Gravelly sand is <b>granular</b>: the lecture says it is in the drained state at all stages of construction, so the strength is (c′, φ′) = (0, 40°) whatever the loading speed.'],
  ['s3','w1-hansen',v=>`Enter at φ′ = ${_f(v.phi)}° on the vertical axis and read across to the curves for N<sub>q</sub> and N<sub>γ</sub> on the log scale below. c′ = 0, so N<sub>c</sub> is not needed. The solution reads N<sub>q</sub> = ${_f(v.Nq)} and N<sub>γ</sub> = ${_f(v.Ng)}; a chart reading is good to a few per cent, which is why the answer is quoted to about 2 %.`],
  ['s4','w1-eq','The full equation: <b>cohesion</b> + <b>surcharge</b> + <b>self weight</b>. With c′ = 0 the first term vanishes. The surcharge γDN<sub>q</sub> does not contain B; the self-weight term ½Bγ′N<sub>γ</sub> grows with B. That is why the net capacity splits here into a constant part and a part proportional to B.'],
  ['s5','w1-net',v=>`The slide defines the net values: q<sub>n</sub> = q − γD and F = q<sub>nf</sub>/q<sub>n</sub>. Here F is given (3.0) and B is the unknown, so q<sub>nf</sub>/F = Q/B − γD becomes a quadratic in B, which gives <b>B = ${_f(v.B)} m</b>.`] ]);

Lesson('w1q2',[ [null,'w1-soilpar','Which strength do you use? A saturated clay loaded <b>instantly</b> has no time to drain, so the lecture says use the undrained parameters (c<sub>u</sub>, φ<sub>u</sub> = 0). Loaded <b>very slowly</b> it drains and long-term stability is checked with c′ and φ′. That is the only difference between (a) and (b).'],
  ['s1','w1-water','Water table <b>at the surface</b> (third case on the slide): the soil is saturated everywhere. The slide\'s effective unit weight γ′ is for the effective-stress (drained) analysis.'],
  ['s2','w1-soilpar','The decision: loading speed against drainage, not the water table, picks the pair of parameters.'],
  ['s3','w2-phi0',v=>v.und?'The φ = 0 slide: bearing pressure c<sub>u</sub>N<sub>c</sub>, driving pressure γD. With φ<sub>u</sub> = 0 the factors are fixed: N<sub>c</sub> = 5.14, N<sub>q</sub> = 1, N<sub>γ</sub> = 0, so the width B drops out.':'(Shown for comparison.) Undrained would give N<sub>c</sub> = 5.14, N<sub>q</sub> = 1, N<sub>γ</sub> = 0.'],
  ['s3','w1-hansen',v=>`Read at φ = ${_f(v.phi)}° (0 when undrained, φ′ = ${_f(v.php)}° when drained): N<sub>c</sub> = ${_f(v.Nc)}, N<sub>q</sub> = ${_f(v.Nq)}, N<sub>γ</sub> = ${_f(v.Ng)}.`],
  ['s4','w1-eq',v=>`All three terms with c = ${_f(v.cc)} kPa and γ = ${_f(v.gu)} kN/m³: ${v.und?'N<sub>γ</sub> = 0 removes the width term, so q<sub>f</sub> = c<sub>u</sub>N<sub>c</sub> + γD.':'cohesion, surcharge and self weight all count.'}`],
  ['s5','w1-net',v=>`F = q<sub>nf</sub>/q<sub>n</sub> = (q<sub>f</sub> − γD)/(q − γD) = <b>${_f(v.F)}</b>. Flip the Loading switch: instantly 4.7, very slowly 6.6.`] ]);

['w1q3a','w1q3b'].forEach((id,k)=>Lesson(id,[
  [null,'w1-ex','The lecture\'s own example has the same shape: a square footing on sand, with the water table far below (a) and at the surface (b). Its working is on the next slide.'],
  ['s1','w1-water',k===0?'The water table is 5 m below the ground, which is 4 m below the base, more than 1.5 B for B = 2.5 m: the first case on the slide. Treat the soil as dry; no γ′ anywhere.':'The water table is 1 m below the ground, exactly at the base (D = 1 m): the second case on the slide. The soil <i>under</i> the footing is submerged, so only the width term takes γ′. The surcharge γD keeps γ = 17 because the soil above the base is above the water. (Between “at the base” and “1.5–2B deeper” the slide says nothing: this build interpolates, and warns.)'],
  ['s2','w1-soilpar','Sand is <b>granular</b>: drained at all stages (c′ = 0, φ′ = 40°). The water table changes u and the unit weight, never these parameters.'],
  ['s3','w1-hansen','φ′ = 40° gives N<sub>q</sub> and N<sub>γ</sub> from the same chart as tutorial Q1; c′ = 0.'],
  ['s4','w1-shape','Square footing: s<sub>γ</sub> = 0.8, s<sub>c</sub> = 1.3, s<sub>q</sub> = 1. With c′ = 0 the slide\'s square-footing line reduces to γDN<sub>q</sub> + <b>0.4</b>Bγ N<sub>γ</sub> (0.5 × 0.8 = 0.4). A strip would have kept ½.'],
  ['s4','w1-ex2',k===0?'Part (b) of the lecture example shows the same arithmetic for a water table at the surface; here the dry case follows the left-hand column.':'The right-hand column of the lecture example does this: γ′ in the B term. The sheet also asks you to compare with Terzaghi (step 6).'],
  ['s5','w1-net','Then F = q<sub>nf</sub>/q<sub>n</sub> from the definition on this slide.'],
  ['s6','w1-eq','The Terzaghi chart is on this slide (factors N<sub>c</sub>, N<sub>q</sub>, N<sub>γ</sub> against φ). Reading it at φ′ = 40° gives larger factors than Hansen\'s; the sheet asks you to compare and comment.'] ]));

Lesson('w1q4',[ [null,'w1-soilpar','Stiff clay at working load, water at the surface, and the question says φ<sub>u</sub> = 0: an undrained (total stress) analysis with c<sub>u</sub>.'],
  ['s1','w1-water','Water table <b>at the ground surface</b> (third case on the slide): the clay is saturated and u &gt; 0 at the base. That sets σ′ and which unit weight applies, but it does not decide drained or undrained.'],
  ['s2','w1-soilpar','Saturated cohesive soil operates undrained during and immediately after construction: use (c<sub>u</sub>, φ<sub>u</sub>). The water table does not change that.'],
  ['s3','w2-phi0','φ<sub>u</sub> = 0: N<sub>c</sub> = 5.14, N<sub>q</sub> = 1, N<sub>γ</sub> = 0. The pressure that resists is c<sub>u</sub>N<sub>c</sub>; the one that drives is γD.'],
  ['s4','w1-eq','The equation with the last term removed (N<sub>γ</sub> = 0), then take off γD.'],
  ['s5','w1-net',v=>`q<sub>n</sub> = Q/B − γD, then F = q<sub>nf</sub>/q<sub>n</sub> = ${_f(v.F)}.`] ]);

Lesson('w1q5',[ [null,'w1-def','A real wall base is loaded off-centre and at an angle, so the plain equation needs correction factors. The slides in this lesson are the “simplified” ones the course uses.'],
  ['s1','w1-water','The water table is well below the base (deeper than 1.5–2B, the first case on the slide): the soil is dry, u = 0 and the total unit weight γ = 18 applies.'],
  ['s2','w1-soilpar','The soil is <b>granular</b>: drained (c′ = 0, φ′ = 35°), whatever the loading speed.'],
  ['s3','w1-hansen','Read N<sub>q</sub> and N<sub>γ</sub> at φ′ = 35°.'],
  ['s4','w1-incl','Bottom right of the slide: an eccentricity e moves the load off the centre, so only the central part B′ = B − 2e<sub>x</sub> (and L′ = L − 2e<sub>y</sub>) carries it. A long wall has only B′: here B′ = 3 − 2 × 0.36. Left of the slide: the load is tilted by its horizontal component H against V. i<sub>q</sub> = 1 − 1.5H/V and i<sub>γ</sub> = i<sub>q</sub>². Here H/V = 102/282. The c-term factor i<sub>c</sub> is not needed because c′ = 0.'],
  ['s5','w1-eq','Each term of the equation is multiplied by its own inclination factor, and B′ (not B) is used in the width term.'],
  ['s6','w1-net','Net pressure and F as usual, but the load is spread over B′, not over the full base width.'] ]);

// ---------- Week 2: allowable pressure ----------
Lesson('w2q1',[ [null,'w2-energy','The N values in the table are already <b>N<sub>60</sub></b> (energy-corrected to 60 %), so this slide has been applied for you. The two corrections left are for overburden and, below the water table in fine sand, dilatancy.'],
  ['s1','w2-corr',v=>`N₁ = C<sub>N</sub>·N<sub>60</sub>. On the chart go in on the vertical axis with the <b>effective</b> overburden pressure (kPa) and read C<sub>N</sub> on the top scale: the deeper the test, the larger σ′ and the smaller C<sub>N</sub>. Above the water table (3.6 m here) u = 0, so σ′ = γz.`],
  ['s2','w2-ex','The lecture example gives the same kind of table (depth, N<sub>60</sub>). Correct each N with its own C<sub>N</sub>, then take the average over the influence depth. The working here uses the tests within 1.5 B below the foundation.'],
  ['s3','w2-qa','Terzaghi and Peck chart. For B &gt; 1 m the right-hand formula is q<sub>a</sub> = 10.5·N<sub>1</sub> (kPa) for the 25 mm settlement limit, so the average N<sub>1</sub> times 10.5 gives the allowable pressure.'],
  ['s3','w2-pht','Peck, Hansen and Thornburn: the chart value assumes a dry site. A shallow water table reduces it by C<sub>w</sub> = 0.5 + 0.5D<sub>w</sub>/(D + B), where D<sub>w</sub> is the depth of the water table below the surface. No reduction when D<sub>w</sub> ≥ D + B.'] ]);

Lesson('w2q2',[
  ['s1','w2-corr','Same overburden correction as Q1: effective stress at the test depth (the sand is saturated, so subtract u), then C<sub>N</sub> from the chart.'],
  ['s2','w2-dil','Fine silty sand <b>below the water table</b> gives blow counts that are too high, because the water cannot drain during a blow. If N<sub>1</sub> &gt; 15 correct it: N′ = 15 + 0.5(N<sub>1</sub> − 15). Apply it after the overburden correction.'],
  ['s3','w2-qa','Then q<sub>a</sub> = 10.5·N′ for B &gt; 1 m and a 25 mm settlement limit.'],
  ['s3','w2-pht','The water table is 1 m below the ground, so C<sub>w</sub> = 0.5 + 0.5D<sub>w</sub>/(D + B) applies with D<sub>w</sub> = 1 m.'] ]);

Lesson('w2q3',[ [null,'w2-plate2','What the test does: load a small plate and record settlement against pressure. Decide the allowable settlement (25 mm for footings on sand), then use the plate result to find the pressure, or scale the plate settlement to the real footing.'],
  ['s1','w2-plate',`For <b>sandy soils</b> (upper formula): S = S<sub>p</sub>[2B/(B + 0.3)]², with B in metres and S<sub>p</sub> the plate settlement at the same pressure. A wider footing settles more than the plate, but less than in proportion to its width. For clays (lower formula) the ratio is simply B/B<sub>p</sub>; do not mix them up.`] ]);

Lesson('w5q2',[ [null,'w5-meyer','Meyerhof (1965) goes directly from SPT to a settlement. For B &gt; 1.25 m: s = (q<sub>a</sub> × 2.24/N)·(B/(B + 0.33))², with N the <b>average N between z = D and z = D + 2B</b>. Turn it around for q<sub>a</sub> with s = 25 mm.'],
  ['s1','w2-corr','The N values are corrected exactly as in week 2: effective stress, then C<sub>N</sub> from this chart.'],
  ['s2','w2-ex','Correct each test, then average those between D and D + 2B (the zone the slide names), here 1.5 m to 8.5 m, which takes in all six tests.'],
  ['s3','w5-meyer','Insert N and B = 3.5 m in the B &gt; 1.25 m formula, set s = 25 mm and solve for q<sub>a</sub>. The tutorial gives no numeric answer, only the hint.'] ]);

// ---------- Week 3: immediate and consolidation settlement ----------
Lesson('w3q1',[ [null,'w3-burland','Immediate settlement of a footing on saturated clay (undrained): s = μ<sub>0</sub>μ<sub>1</sub>qB/E<sub>u</sub> (Burland, 1978). μ<sub>0</sub> corrects for the depth of the footing, μ<sub>1</sub> for the thickness of the clay under it. The slide also states that <b>superposition</b> may be used when the layers have different E.'],
  ['s1','w3-mu','Top chart: μ<sub>0</sub> against D/B. Here D/B = 1/2 = 0.5.'],
  ['s2','w3-mu','Bottom chart: μ<sub>1</sub> against H/B, with the curve for L/B = 2 (a 4 × 2 m footing). H is the thickness of the layer <b>below the foundation level</b> (5 m clay − 1 m depth = 4 m).'],
  ['s3','w3-mu','The same chart again, now for H/B of both clays together, with the stiffer E<sub>u</sub>.'],
  ['s4','w3-mu','And again for the top layer alone, still with the stiffer E<sub>u</sub>.'],
  ['s5','w3-burland','The slide\'s last line: superposition. Soft top layer with its own E, plus the whole stack with the stiff E, minus the top layer with the stiff E (it is already counted).'] ]);

Lesson('w3q2',[
  ['s1','w3-fi','The formula s<sub>i</sub> = qB(1 − μ²)I<sub>f</sub>/E gives the settlement at the <b>corner</b> of a rectangle L × B. The L-shaped heap is therefore cut into rectangles that all share corner A, and their effects are added.'],
  ['s2','w3-if','Table of I<sub>f</sub> against L/B for a semi-infinite layer (1 → 0.56, 2 → 0.76, 3 → 0.89 …). For L/B between two rows, interpolate; the Notes tab compares the official reading with the interpolated one.'],
  ['s3','w3-fi','Add the three rectangles, each with its own B (the shorter side) and I<sub>f</sub>. μ = 0.5 is given; E in kPa so that q/E is dimensionless.'] ]);

const voidSteps=(s1,s2)=>[ ['s1','w3-types',s1],['s2',s2[0],s2[1]] ];
Lesson('w3q3a',voidSteps('OCR = p<sub>c</sub>/σ′<sub>0</sub> = 100/50 = 2: <b>over-consolidated</b>. The final stress 90 kPa is still below p<sub>c</sub> = 100 kPa.',['w3-oc','“If the applied load is less than p<sub>c</sub>”: only the flat recompression line applies, so Δe = C<sub>r</sub>log(σ′<sub>f</sub>/σ′<sub>0</sub>). Never use C<sub>c</sub> here.']));
Lesson('w3q3b',voidSteps('OCR = 2 again, but now the final stress (190 kPa) is <b>beyond</b> p<sub>c</sub> = 100 kPa.',['w3-oc2','“If the applied load exceeds p<sub>c</sub>”: Δe has two parts. Along C<sub>r</sub> from σ′<sub>0</sub> up to p<sub>c</sub>, then along the steeper C<sub>c</sub> from p<sub>c</sub> to σ′<sub>f</sub>.']));
Lesson('w3q3c',voidSteps('Here p<sub>c</sub> = σ′<sub>0</sub> = 50 kPa, so OCR = 1: <b>normally consolidated</b>. Any load beyond the present stress is on the virgin line.',['w3-nc','Normally consolidated: the whole change is along the virgin line, Δe = C<sub>c</sub>log(σ′<sub>f</sub>/σ′<sub>0</sub>). No C<sub>r</sub> term.']));

Lesson('w3q4',[
  ['s1','w3-cc','For undisturbed soil Terzaghi and Peck proposed C<sub>c</sub> = 0.009(w<sub>L</sub> − 10 %). The question gives only the liquid limit (48 %), so this is where C<sub>c</sub> comes from. e<sub>0</sub> = wG<sub>s</sub> for a saturated clay.'],
  ['s2','w3-ex2','The lecture example finds σ′<sub>0</sub> the same way: unit weights above and below the water table (dry or saturated above, submerged below), at the <b>middle</b> of the clay layer, then subtract u. Here the clay is under sand, so the clay\'s own submerged weight is added for half its thickness.'],
  ['s3','w3-nc','Normally consolidated: S<sub>c</sub> = C<sub>c</sub>H/(1 + e<sub>0</sub>)·log(σ′<sub>1</sub>/σ′<sub>0</sub>), where σ′<sub>1</sub> = σ′<sub>0</sub> + Δσ. Use the whole thickness of the stratum with the stress at its middle.'] ]);

Lesson('w3q5',[
  ['s1','w3-ex2','The lecture example shows how the unit weights follow from G<sub>s</sub> and e: γ<sub>sat</sub> = (G + e)γ<sub>w</sub>/(1 + e), right-hand side of the figure, and how the water table splits the layer into a dry and a submerged part.'],
  ['s2','w3-types','OCR = σ′<sub>c</sub>/σ′<sub>0</sub> = 4 means p<sub>c</sub> = 4σ′<sub>0</sub>. The decision is whether σ′<sub>0</sub> + Δσ passes it.'],
  ['s3','w3-oc2','Load beyond p<sub>c</sub>: S<sub>c</sub> = H/(1 + e<sub>0</sub>)·[C<sub>r</sub>log(p<sub>c</sub>/σ′<sub>0</sub>) + C<sub>c</sub>log(σ′<sub>1</sub>/p<sub>c</sub>)]. Two logs, two indices.'] ]);

// ---------- Week 4: stress at depth and time ----------
Lesson('w4q1',[
  ['s1','w4-rect','The slide shows a point <b>inside</b> the rectangle: cut it into four rectangles that meet at the point, and add. A point <b>outside</b> (A is 1.5 m outside the long edge) works the same way, with plus signs for the loaded rectangles and a minus sign for the strip between A and the footing, which is not loaded.'],
  ['s2','w4-fadum','I<sub>σ</sub> from m = b/z and n = l/z: both sides of the rectangle divided by the depth. The chart is valid only for the stress under a <b>corner</b>; that is why every rectangle must have a corner at A.'],
  ['s3','w4-rect','σ<sub>z</sub> = q(I<sub>1</sub> ± I<sub>2</sub> …): the bottom line of the slide. The two halves of the footing are symmetric about the centre line, hence the factor 2 in the working.'] ]);

const timeScale=[
  ['s1','w4-bc','Boundary conditions: u = 0 at both z = 0 and z = 2H, which means <b>double drainage</b> and H is the drainage <i>path</i> (half the thickness). T<sub>v</sub> = c<sub>v</sub>t/H<sup>2</sup> is at the bottom of the slide.'],
  ['s2','w4-utv','Same clay, same degree of consolidation: the same point on this curve, hence the same T<sub>v</sub>, and c<sub>v</sub> is the same. So c<sub>v</sub>t/H<sup>2</sup> is equal for the sample and the layer, and t<sub>field</sub> = t<sub>lab</sub>·(H<sub>field</sub>/H<sub>lab</sub>)². c<sub>v</sub> never has to be known.'] ];
Lesson('w4q2',timeScale); Lesson('w4q4',timeScale);

Lesson('w4q3',[
  ['s2','w4-utv','Look at the curve at small U: up to about <b>U = 60 %</b> it follows T<sub>v</sub> = (π/4)U², so time is proportional to U². Here U = 11.43/35.565 = 0.32, well inside that range.'],
  ['s3','w4-sqrt','The same fact seen in a test: the early part of a consolidation curve is a straight line against √t. So settlement ∝ √t, and S<sub>2</sub> = S<sub>1</sub>√(t<sub>2</sub>/t<sub>1</sub>), with both times measured from the middle of the loading period.'] ]);

// ---------- Week 5: secondary compression and CPT ----------
Lesson('w5q1',[
  ['s1','w3-nc','The primary settlement is the same normally-consolidated formula as in week 3, with the C<sub>c</sub> and e<sub>0</sub> given.'],
  ['s2','w5-sec','Secondary compression: S<sub>s</sub> = C<sub>α</sub>H log(t/t<sub>p</sub>)/(1 + e<sub>p</sub>), with t<sub>p</sub> the end of primary consolidation. The question gives C<sub>αε</sub> = C<sub>α</sub>/(1 + e<sub>p</sub>), so the denominator is already inside it.'],
  ['s3','w5-ex','The lecture\'s own example is the same type: C<sub>αε</sub> = 1.6 %, a 9 m clay, t<sub>p</sub> = 1 yr. Compare how it sets out the time ratio.'] ]);

Lesson('w5q3',[
  ['s1','w5-schm','Schmertmann: s = C<sub>1</sub>C<sub>2</sub>q<sub>n</sub>Σ(I<sub>z</sub>/E)Δz, E = 2.5q<sub>c</sub> for a square footing. C<sub>1</sub> = 1 − 0.5σ′<sub>0</sub>/q<sub>n</sub> corrects for the depth of the footing; C<sub>2</sub> = 1 + 0.2 log(t/0.1) is for creep (1 when no time is given).'],
  ['s2','w5-iz','The strain influence factor: a triangle that starts small at the base of the footing, peaks at about B/2 below it and falls to zero at 2B. Read I<sub>z</sub> at the <b>middle</b> of each layer.'],
  ['s3','w5-ex2','The lecture example does the same sum for a 3 × 3 m footing from a q<sub>c</sub> table: one row per layer, then add.'] ]);

// ---------- Mid-session paper 2026 (section II) ----------
Lesson('ex26q1',[
  ['s1','w1-water','Dense sand under the slab, water at the surface: every unit weight is the buoyant one, γ′ = γ<sub>sat</sub> − γ<sub>w</sub> (slide: “water table at the surface … γ′”).'],
  ['s2','w1-eq','The surcharge term γDN<sub>q</sub> is the weight of the soil <b>beside</b> the footing (the 4 m of loose silt), not of the soil it sits on. That is why the silt\'s own N<sub>q</sub> and N<sub>γ</sub> are a distractor.'],
  ['s3','w1-ex2','The lecture\'s example with the water table at the surface (right column) is the same sum: surcharge term plus ½γ′BN<sub>γ</sub>, c′ = 0. The exam asks for the gross q<sub>f</sub>, so do not subtract γD.'] ]);

Lesson('ex26q2',[
  ['s1','w3-dewater','The slide: clay settles when the ground water is lowered, because the pore pressure drops and the effective stress rises by the same amount. The total stress does not change.'],
  ['s2','w3-mv','Bottom of the slide: m<sub>v</sub> = a<sub>v</sub>/(1 + e<sub>0</sub>) and S<sub>c</sub> = m<sub>v</sub>Δσ′H. m<sub>v</sub> is given in m²/MN, so divide by 1000 to get m²/kN before multiplying by kPa.'],
  ['s3','w3-mv','S<sub>c</sub> = m<sub>v</sub>Δσ′H with H the clay thickness (5 m), then convert metres to millimetres.'] ]);

Lesson('ex26q3',[
  ['s1','w4-bc','A clay layer between sand and gravel drains from both faces: double drainage. The slide\'s H is the half-thickness, 10 m. (It cancels in the end.)'],
  ['s2','w4-utv','For U up to about 60 % the curve is a parabola, T<sub>v</sub> ∝ U², and T<sub>v</sub> ∝ t. So U ∝ √t, and the ratio of two settlements equals the ratio of their degrees of consolidation (the ultimate settlement cancels).'],
  ['s3','w4-sqrt','Settlement against √t is a straight line early on: t<sub>2</sub> = t<sub>1</sub>(S<sub>2</sub>/S<sub>1</sub>)<sup>2</sup>, from 2 yr and 30 mm to 40 mm.'] ]);

Lesson('ex26q4',[
  ['s1','w5-schm','C<sub>1</sub> = 1 − 0.5σ′<sub>0</sub>/q<sub>n</sub>, with σ′<sub>0</sub> the effective overburden at the foundation level (water table at the surface) and q<sub>n</sub> the net pressure, 140 kPa.'],
  ['s2','w5-iz','The peak of the triangle, I<sub>zp</sub> = 0.5 + 0.1√(q<sub>n</sub>/σ′<sub>vp</sub>), at B/2 below the base. The paper provides this chart with the examination paper.'],
  ['s3','w5-schm','E = 2.5q<sub>c</sub> for a square footing. Depths for I<sub>z</sub> are measured from the <b>base</b> of the footing, not the ground.'],
  ['s4','w5-ex2','The lecture example sets the sum out layer by layer in the same way: Δz, q<sub>c</sub>, E, I<sub>z</sub>, then I<sub>z</sub>Δz/E.'] ]);
