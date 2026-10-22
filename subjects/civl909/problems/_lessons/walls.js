// ================= LECTURE LESSONS · retaining walls (weeks 11 and 12) =================
const RK_SLIDES=[null,'w11-k','The three states on the slide. A wall that moves <b>away</b> from the soil lets σ′<sub>h</sub> fall to the <b>active</b> value (K<sub>a</sub>); pushed <b>into</b> the soil it rises to the <b>passive</b> value (K<sub>p</sub>); a wall that does not move has the <b>at-rest</b> value K<sub>0</sub>. K = σ′<sub>h</sub>/σ′<sub>v</sub>.'];

Lesson('w11q1',[ RK_SLIDES,
  ['s1','w11-ka','The slide\'s box: p′<sub>a</sub> = K<sub>a</sub>σ′<sub>v</sub> − 2c′√K<sub>a</sub>, with K<sub>a</sub> = (1 − sinφ′)/(1 + sinφ′). Each soil has its own φ′, so each gets its own K<sub>a</sub>; K<sub>p</sub> = 1/K<sub>a</sub> (next slides).'],
  ['s2','w11-sur','A uniform surcharge q acts as extra vertical stress in every layer: σ′<sub>v</sub> = q + γz. At the interface K<sub>a</sub> changes, so the pressure jumps, and the whole of soil 1 (with the surcharge) is a surcharge on soil 2.'],
  ['s3','w11-pas','Passive side: p′<sub>p</sub> = K<sub>p</sub>σ′<sub>v</sub> + 2c′√K<sub>p</sub>. The cohesion term is now <b>added</b>. In front of the wall there is no surcharge, and soil 1 is only 1.5 m thick.'] ]);

Lesson('w11q2',[ [null,'w11-water','Short term versus long term: “if short term stability is considered use undrained parameters, if long term, drained”. The question says <b>immediately after construction</b>, so the clays are analysed in total stress (c<sub>u</sub>, φ<sub>u</sub>), while the sand drains at once and takes effective stress plus pore water.'],
  ['s1','w11-crack','Tension zone: z<sub>0</sub> = 2c<sub>u</sub>/(γ√K<sub>a</sub>), where the slide\'s pressure line −2c√K<sub>a</sub> crosses zero. Above it there is no soil pressure; the working fills the crack with water.'],
  ['s2','w11-force','Total thrust = effective thrust + water: P<sub>a</sub> = P′<sub>a</sub> + P<sub>w</sub> (blue box). In the sand: σ′<sub>v</sub> = σ<sub>v</sub> − u, p′<sub>a</sub> = K<sub>a</sub>σ′<sub>v</sub>, and the pore pressure u is added on top.'],
  ['s3','w11-ka','Bottom clay with φ<sub>u</sub> = 0: K<sub>a</sub> = 1, so p<sub>a</sub> = σ<sub>v</sub> − 2c<sub>u</sub>. It is a total stress, so the water is already in it.'],
  ['s4','w11-force','The thrust is the <b>area of the pressure diagram</b>: pieces for the crack water, the top clay, the sand (a trapezium) and the bottom clay (a trapezium).'] ]);

Lesson('w11q3',[ RK_SLIDES,
  ['s1','w11-crack','Clay with c′: the pressure is negative at the surface and zero at z<sub>0</sub> = 2c′/(γ√K<sub>a</sub>). The slide draws the triangle that remains below z<sub>0</sub>, with its centroid at (H − z<sub>0</sub>)/3 above the base.'],
  ['s2','w11-ka','Pressures at the key depths: just above and just below the interface (K<sub>a</sub> differs, so two values at 3 m) and at the base.'],
  ['s3','w11-force','Thrust = area of the diagram. Cut it into triangles and rectangles; the slide marks the centroid height of the triangle, 1/3 of its height above its base.'],
  ['s4','w11-force','The line of action: the moment of each area about the base, divided by the thrust. The tutorial asks for the thrust and its distance from the base.'] ]);

Lesson('w11q4',[ ['s1','w11-slope2','Sloping surface, active case: K<sub>a</sub> = [cosβ − √(cos²β − cos²φ′)]/[cosβ + √(cos²β − cos²φ′)]. The slope β must be smaller than φ′ or the root fails.'],
  ['s1','w11-slope','The assumption behind it: the active pressure acts <b>parallel to the slope</b>, so it is not horizontal.'],
  ['s2','w11-slope2','p′<sub>a</sub> = K<sub>a</sub>γ′z cosβ acts parallel to the slope. The thrust is the triangle ½·K<sub>a</sub>γH²cosβ.'] ]);

Lesson('w11q5',[ ['s1','w11-crack','Set the total thrust ½γH² − 2c<sub>u</sub>H of an unsupported cut to zero (the pressure diagram of the slide with K<sub>a</sub> = 1) and you get the critical depth H<sub>c</sub> = 4c<sub>u</sub>/γ. The slide\'s z<sub>0</sub> = 2c/(γ√K<sub>a</sub>) is only the depth of the tension crack, <b>half</b> of that. The Notes tab explains why the official working differs.'] ]);

const w11ex=[ ['s1','w11-ka','K<sub>a</sub> = (1 − sinφ′)/(1 + sinφ′) = 0.271 for φ′ = 35°.'],
  ['s2','w11-water','The water table brings the pore pressure: the soil below it carries γ′, and the water adds its own thrust ½γ<sub>w</sub>h<sub>w</sub><sup>2</sup> (slide: P<sub>a</sub> = P′<sub>a</sub> + P<sub>w</sub>).'],
  ['s2','w11-force','The thrust is the area of the diagram: the dry triangle, the dry layer acting as a surcharge on the wet layer (a rectangle), the submerged soil, and the water.'] ];
Lesson('w11l1a',[[null,'w11-ex','The lecture states this example (no answer is printed): a 5 m wall in sand, part (a) with the water table below the wall.'],...w11ex]);
Lesson('w11l1b',[[null,'w11-ex','The lecture states this example (no answer is printed): part (b) raises the water table to 2 m below the surface.'],...w11ex]);

// ---------- Week 12 ----------
Lesson('w12q1',[ [null,'w12-coul','Coulomb looks at the whole wedge of soil between the wall and a trial failure plane. The wall may be inclined (angle α) and the surface sloping (β); the wall reaction acts at the friction angle δ to the wall normal.'],
  ['s1','w12-coul','The formula takes the wall inclination α as drawn on the slide. A back that slopes away from the soil by 10° from the vertical is entered as α = 80° here (the figure in tutorial (ii) marks 100° on the soil side). Books measure this angle differently: the Notes tab flags it as an open check.'],
  ['s2','w12-kac','The Coulomb K<sub>a</sub> (left; with c = 0 the K<sub>ac</sub> term drops out) from φ′, δ, β and α. The formula is long: put it in step by step.'],
  ['s3','w12-coul','P<sub>a</sub> = ½K<sub>a</sub>γH². It acts at the angle δ to the normal of the wall (the force triangle on the slide), so the resultant is inclined, not horizontal. H is the vertical height.'] ]);

Lesson('w12q3',[ ['s1','w12-kac','Coulomb with cohesion: p′<sub>a</sub> = K<sub>a</sub>γz − K<sub>ac</sub>c′, with K<sub>ac</sub> = 2√(K<sub>a</sub>(1 + c<sub>w</sub>/c′)). The factor (1 + c<sub>w</sub>/c′) is the wall adhesion c<sub>w</sub> at work.'],
  ['s2','w12-kac','Depth of the tension crack, left of the figure: z<sub>0</sub> = 2c′(1 + c<sub>w</sub>/c′)/(γ√K<sub>a</sub>), where the pressure becomes positive. Ignore the negative pressure above it.'],
  ['s3','w12-water','Total thrust = effective thrust (+ water, none here). The tutorial asks for the <b>horizontal</b> component: P<sub>a</sub> acts at δ = 15° to the horizontal on a vertical wall, so resolve it with cosδ.'] ]);
