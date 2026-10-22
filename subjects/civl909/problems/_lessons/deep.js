// ================= LECTURE LESSONS · deep foundations (weeks 7 to 10) =================
// The pile problems share their steps (shaft layers s0, s1 …; ps; b; pu; g1 g2 g3 g5; ge; c; pp; seq; sK sI sR sS; sSo sA), so one builder writes the lesson from a short description:
//   shaft: one letter per shaft layer, c = clay (undrained α method), s = sand (Meyerhof from N);  base: 'c' or 's';  group: true for a pile group;  settle: 'single' | 'group';  own: lecture-example slides to add.
const SH_CLAY=['w7-lay','w7-alpha'];
const shaftText={ c:'<b>Clay layer, undrained (α) method.</b> f<sub>s</sub> = α·c<sub>u</sub>, with c<sub>u</sub> the average strength of this layer and α read from the reduction-factor chart (right-hand slide: α falls as c<sub>u</sub> rises; c<sub>u</sub> = 20 kPa gives α = 1). Then P<sub>s</sub> of the layer = f<sub>s</sub>·πD·ΔL. The left slide is the layer-by-layer formula P<sub>s</sub> = πD Σ α c<sub>u</sub> ΔL.',
  s:'<b>Sand layer, drained and empirical.</b> Meyerhof (1959) for driven piles in granular soil: f<sub>s</sub> = 2N̄ kPa, with N̄ the average SPT value along this layer (average the N readings that fall in it). Then P<sub>s</sub> of the layer = f<sub>s</sub>·πD·ΔL.' };
function pileLesson(id,o){ const it=[], add=(step,slides,text)=>it.push({step,slides,text,soft:true}), mixed=new Set(o.shaft.split('')).size>1, kind=o.shaft[0]||o.base;
  add('g','w7-fsfb',mixed?'Two soil types, two methods (the slide\'s question “f<sub>s</sub> = ? and f<sub>b</sub> = ?”): the clay layers by the undrained α method, the sand by the drained, empirical method with N. Each layer is worked on its own and the pieces are added.':(kind==='c'?'The soil is clay, so the <b>undrained (α) method</b> is used for the shaft and N<sub>c</sub>c<sub>u</sub> for the base.':'The soil is sand, so the <b>drained, empirical method</b> with the SPT value N is used for shaft and base.'));
  o.shaft.split('').forEach((c,i)=>add('s'+i,c==='c'?SH_CLAY:['w8-mey'],shaftText[c]+(i===0&&o.shaft.length>1?' Each layer gets its own line on the map.':'')));
  add('ps','w7-lay','P<sub>s</sub> = Σ f<sub>s</sub>·πD·ΔL: the pieces of each layer, added (the slide\'s sum over “all layers”).');
  add('sL','w7-uni','Uniform clay: P<sub>s</sub> = α c<sub>u</sub>(πD)L. The unknown is L, so the shaft is written as a value per metre of length.');
  add('b',o.base==='c'?['w7-base','w7-nc']:['w8-mey'],o.base==='c'?'Base in clay: f<sub>b</sub> = N<sub>c</sub>c<sub>u</sub>, with c<sub>u</sub> around the base (the slide\'s Skempton equation). Skempton\'s chart (right): for L/D ≥ 4 take <b>N<sub>c</sub> = 9</b>; below that, read the chart with L/D.':'Base in sand: f<sub>b</sub> = 40N·L/D ≤ 400N kPa (Meyerhof, 1959), with N the blow count at the base. The 400N limit usually governs for long piles. The base force is f<sub>b</sub>·A<sub>b</sub>, with A<sub>b</sub> = π(D/2)<sup>2</sup>.');
  add('bL','w7-nc9','Long-pile assumption: L/D ≥ 4 gives N<sub>c</sub> = 9 on Skempton\'s chart, so the base is a fixed number that does not depend on L.');
  add('pu','w7-p45','The slide gives three equivalent forms of the capacity: P<sub>u</sub> = P<sub>s</sub> + P<sub>b</sub> − W, the same with P<sub>b</sub> = (f<sub>b</sub> + p<sub>o</sub>)A<sub>b</sub>, and P<sub>u</sub> = f<sub>s</sub>A<sub>s</sub> + f<sub>b</sub>A<sub>b</sub> when W ≈ p<sub>o</sub>A<sub>b</sub>. “Any of the equations is OK”; use the one that matches the data the question gives.');
  add('pu','w7-w','Why the short form works: the pile weight W is about the weight of the soil it replaced, p<sub>o</sub>A<sub>b</sub>, so W and the overburden term in the base resistance cancel.');
  add('req','w7-p45','Required capacity = factor of safety × the working load; this is what P<sub>u</sub> must reach.');
  add('solve','w7-uni','Put P<sub>s</sub> (per metre × L) and the fixed base into P<sub>u</sub> and solve for L.');
  add('chk','w7-nc9','Check what was assumed: L/D ≥ 4 for N<sub>c</sub> = 9. If the answer had given L/D &lt; 4, N<sub>c</sub> would have to be read from the chart and the sum repeated.');
  if (o.group){
    add('g1','w8-grp1','<b>Route 1: separate piles.</b> For floating piles, first treat the group as <i>n</i> single piles: P<sub>g,s</sub> = n × P<sub>u,single</sub>.');
    add('g2','w8-grp2','<b>Route 2: the equivalent block.</b> The piles and the soil between them act as one deep footing of plan size B × W and length L. For a 3 × 2 or 2 × 2 group the plan size is the outer pile centres plus one diameter.');
    add('g3','w8-grp3','Block capacity as a deep foundation (L/D ≥ 1). <b>Clay:</b> P<sub>u</sub> ≈ c<sub>a</sub>·2(B+W)L + c<sub>ub</sub>N<sub>c</sub>(B×W), soil sliding on soil, so no α and c<sub>a</sub> is the average c<sub>u</sub> along the sides. <b>Sand:</b> friction on the sides from the effective stress σ′<sub>v</sub> (the slide writes Fσ′<sub>v</sub>) and the base from σ′<sub>vb</sub>N<sub>q</sub>.');
    add('g5','w8-lesser','The group capacity is <b>the lesser</b> of the two routes (slide, “Step 3”): the group can fail as separate piles or as a block, and the weaker mechanism governs.');
    add('ge','w8-eff','Efficiency η = average capacity per pile in the group ÷ capacity of a single pile (generally &lt; 100 % in clay, &gt; 100 % in sand, 100 % for end-bearing piles). With η given, P<sub>u,g</sub> = n·η·P<sub>u,single</sub>.'); }
  if (o.c) add('c',o.c[0],o.c[1]);
  if (o.settle){
    add('seq','w9-rv','Which corrections apply? <b>R<sub>v</sub></b> when the soil is compressible (ν<sub>s</sub> &lt; 0.5, read against ν<sub>s</sub> for the K of this pile). <b>R<sub>h</sub></b> when a rigid layer lies at a depth h of less than about 2L (the next slide gives the chart). No correction when the soil is incompressible or the rock is deep.');
    add('sK','w9-k','Pile stiffness factor K = (E<sub>p</sub>/E<sub>s</sub>)·R<sub>A</sub>, with R<sub>A</sub> the area ratio (1 for a solid pile, net/gross area for a hollow one). E<sub>p</sub> and E<sub>s</sub> must be in the same units.');
    add('sI','w9-ik','Read the influence factor I with K on the horizontal (log) axis and the curve for this L/D. I is read at one point, so the answer is only as good as the reading.');
    add('sR','w9-rh','R<sub>h</sub> for a rigid base at depth h: enter with L/h and the curve for K. h/L &gt; 2 means no correction. (R<sub>v</sub> comes from the previous slide.)');
    if (o.settle==='single') add('sS','w9-ex7','The settlement S = (P/(D·E<sub>s</sub>))·I·R<sub>v</sub>·R<sub>h</sub>. The lecture example (a hollow steel pile in gravel above rock) works exactly this sum with I = 1.8, R<sub>v</sub> = 0.94 and R<sub>h</sub> = 0.82, and ends with “pay attention to the units of the parameters”.');
    else {
      add('pp','w9-ex2','A flexible cap and a symmetric group: every pile carries the same load, P = total load ÷ n. The lecture states that this assumption is justified when the response of every pile is the same.');
      add('sSo','w9-so','S<sub>o</sub> is the settlement of one pile under <b>1 kN</b> (a unit load): S<sub>o</sub> = (1/(D·E<sub>s</sub>))·I·R<sub>h</sub> and so on. The group formula multiplies it by the real loads.');
      add('sA','w9-af','Interaction factor of a neighbour: α = α<sub>F</sub>·N<sub>h</sub>·N<sub>v</sub>. α<sub>F</sub> depends on the spacing s/d (and L/D), N<sub>h</sub> on the finite depth of soil, N<sub>v</sub> on ν (=1 for incompressible soil). The lecture example tabulates the side and the diagonal pile.');
      add('sA','w9-ex3','The lecture example\'s table: side pile and diagonal pile have different spacing, hence different α. Here the neighbours of the pile you want are at the spacings given by the plan in the question.');
      add('sS','w9-sup','Principle of superposition: S<sub>k</sub> = S<sub>o</sub>P<sub>k</sub> + S<sub>o</sub>ΣP<sub>i</sub>α<sub>i</sub>: the pile\'s own settlement plus the effect of every other pile on it.');
      add('sS','w9-ex4','The lecture\'s last step puts the numbers in: own term + 2 side piles + 1 diagonal pile = 19 mm for the 2 × 2 example.'); } }
  (o.own||[]).forEach(x=>it.push(x));
  Lesson(id,it); }

// ---------- Week 7 ----------
Lesson('w7ex1',[ {step:null,slides:['w7-ex'],text:'The lecture\'s worked example, as printed. Its working is the sequence of slides below, step for step as the map does it; the lecturer\'s own advice on the last slide is <b>“Method 2 for test/exam!”</b> (layers).'},
  {step:'g',slides:['w7-ex1','w7-ex2'],text:'Steps 1 and 2 of the lecture: choose the equation (P<sub>u</sub> = P<sub>s</sub> + P<sub>b</sub> − W, with the weight and overburden effects balanced) and the method (soft clay with c<sub>u</sub> given: undrained analysis).',soft:true},
  {step:'s0',slides:['w7-ex4','w7-alpha'],text:'Step 3, method 2: divide the soil into layers 0–2 m, 2–7 m and 7–12 m, take the average c<sub>u</sub> of each and an α for each (α from the chart on the right).',soft:true},
  {step:'s1',slides:['w7-ex4'],text:'The second layer, 2–7 m: the lecture takes the average c<sub>u</sub> of that layer (between 20 and 40 kPa along the line) and its own α.',soft:true},
  {step:'s2',slides:['w7-ex4'],text:'The third layer, 7–12 m: average c<sub>u</sub> between 40 and 60 kPa along the line.',soft:true},
  {step:'ps',slides:['w7-lay'],text:'P<sub>s</sub> is the sum over the layers. The lecture gets 1700 kN by method 2, 1900 kN by method 1 (one average layer).',soft:true},
  {step:'b',slides:['w7-ex5','w7-nc'],text:'Step 4: c<sub>u</sub> at the base is 60 kPa, L/D = 12/1.3 &gt; 4, so N<sub>c</sub> = 9 (Skempton chart), and f<sub>b</sub>A<sub>b</sub> = N<sub>c</sub>c<sub>u</sub>π(D/2)<sup>2</sup> = 700 kN.',soft:true},
  {step:'pu',slides:['w7-ex6'],text:'Step 5: P<sub>u</sub> = P<sub>s</sub> + f<sub>b</sub>A<sub>b</sub>. The slide lists method 1 (2600 kN), method 2 (2400 kN) and method 3 (the integral).',soft:true} ]);
pileLesson('w7q1',{shaft:'cc',base:'c'});
pileLesson('w7q2',{shaft:'cc',base:'c'});
pileLesson('w7q3',{shaft:'',base:'c'});

// ---------- Week 8 ----------
Lesson('w8sand',[ {step:null,slides:['w8-ex'],text:'The lecture\'s worked example, as printed: 2 m of clay over sand, SPT counts in the sand, Meyerhof\'s equations given.'},
  {step:'g',slides:['w8-ex2'],text:'Step 2: which method for f<sub>s</sub> and f<sub>b</sub>. Clay is analysed undrained, sand drained, layer by layer.',soft:true},
  {step:'s0',slides:['w8-ex3','w7-alpha'],text:'Step 3, clay layer: c<sub>u</sub> = 50 kPa, α = 0.88 (chart), f<sub>s</sub> = αc<sub>u</sub> = 44 kPa.',soft:true},
  {step:'s1',slides:['w8-ex3','w8-mey'],text:'Step 3, sand layer: driven pile, Meyerhof f<sub>s</sub> = 2N̄. N̄ is the average of the three readings, (12 + 18 + 20)/3 ≈ 17, so f<sub>s</sub> = 34 kPa.',soft:true},
  {step:'ps',slides:['w8-ex3'],text:'Step 4: P<sub>s</sub> = f<sub>s,clay</sub>πDL<sub>clay</sub> + f<sub>s,sand</sub>πDL<sub>sand</sub> = 285 kN.',soft:true},
  {step:'b',slides:['w8-ex4','w8-mey'],text:'Step 5: sand at the base, N = 20 and L/D = 10, so f<sub>b</sub> = 40N·L/D = 8000 kPa, which equals the cap 400N = 8000 kPa; f<sub>b</sub>A<sub>b</sub> ≈ 1500 kN.',soft:true},
  {step:'pu',slides:['w8-ex4'],text:'Step 6: P<sub>u</sub> = P<sub>s</sub> + f<sub>b</sub>A<sub>b</sub> = 285 + 1500 ≈ 1800 kN.',soft:true} ]);
pileLesson('w8group',{shaft:'ccc',base:'c',group:true,c:['w8-gex','Check the question: a 3 × 3 group must carry 1600 kN with F = 3 at 9 m penetration. The lecture works it in three steps (single pile, equivalent block, the lesser); the group capacity divided by F must be at least 1600 kN.'],
  own:[{step:'g2',slides:['w8-gex2'],text:'The lecture\'s step 2 for this example: B × W × L = 4.5 × 4.5 × 9 m, L/B = 2, α = 1, c<sub>a</sub> = (26 + 38 + 50)/3 = 38 kPa, c<sub>ub</sub> = 56 kPa, N<sub>c</sub> = 8.4 (Skempton, L/B = 2): P<sub>u,b</sub> = 15 000 kN.',soft:true}]});
pileLesson('w8eff',{shaft:'ccc',base:'c',group:true,c:['w8-eff2','The lecture\'s next example: with η = 90 %, P<sub>u,g</sub> = n × η × P<sub>u,single</sub> = 9 × 0.9 × 580 = 4700 kN, and the safety factor is 4700/1600 ≈ 3.']});
pileLesson('w8q1',{shaft:'s',base:'s',group:true});
pileLesson('w8q2',{shaft:'cc',base:'c',group:true});
pileLesson('w8q3',{shaft:'sc',base:'c',group:true,c:['w8-lesser','The allowable load is the group capacity (the lesser route) divided by the required factor of safety.']});

// ---------- Week 9 ----------
pileLesson('w9q1',{shaft:'',base:'c',settle:'single'});
pileLesson('w9q2',{shaft:'c',base:'c',settle:'single',c:['w7-p45','The allowable load is the ultimate capacity divided by the safety factor (3): that load, not the ultimate one, is what goes into the settlement formula.']});
pileLesson('w9q3',{shaft:'',base:'c',settle:'group'});
Lesson('w9ex',[ {step:null,slides:['w9-ex'],text:'The lecture\'s worked example as printed: part (a) is a capacity question, part (b) the settlement of the cap under the load found in (a).'},
  {step:'s0',slides:['w7-lay','w7-alpha'],text:'Part (a), shaft: undrained clay with c<sub>u</sub> = 40 + 2.5z, averaged over the 10 m of shaft, α from the chart.',soft:true},
  {step:'g',slides:['w7-fsfb'],text:'The soil is clay, so the undrained (α) method is used for the shaft and N<sub>c</sub>c<sub>u</sub> for the base.',soft:true},
  {step:'ps',slides:['w7-lay'],text:'P<sub>s</sub> = πD Σ α c<sub>u</sub> ΔL over the shaft; here one layer with the average of c<sub>u</sub> = 40 + 2.5z.',soft:true},
  {step:'b',slides:['w7-base','w7-nc'],text:'Base: f<sub>b</sub> = N<sub>c</sub>c<sub>u</sub>, N<sub>c</sub> = 9 for a long pile.',soft:true},
  {step:'pu',slides:['w7-p45'],text:'P<sub>u</sub> = P<sub>s</sub> + f<sub>b</sub>A<sub>b</sub> (weight and overburden balanced), one of the three equivalent forms on the slide.',soft:true},
  {step:'ge',slides:['w8-eff'],text:'Group efficiency 80 %: P<sub>u,g</sub> = n·η·P<sub>u,single</sub>; then the allowable load with F = 2.5 gives 2360 kN.',soft:true},
  {step:'c',slides:['w8-eff'],text:'Allowable load of the group = P<sub>u,g</sub>/F with F = 2.5: this is the load the settlement part (b) uses.',soft:true},
  {step:'seq',slides:['w9-rv'],text:'Corrections for part (b): the lecture\'s S<sub>o</sub> line is (1/(DE<sub>s</sub>))·I·R<sub>h</sub> with I = 1.6 and R<sub>h</sub> = 0.86. Only the rigid-base correction R<sub>h</sub> appears; no R<sub>v</sub> is applied.',soft:true},
  {step:'pp',slides:['w9-ex2'],text:'Part (b) step 1: a flexible cap, symmetric group, so every pile carries 2360/4 = 590 kN.',soft:true},
  {step:'sSo',slides:['w9-so'],text:'Step 3: S<sub>o</sub> = (1/(DE<sub>s</sub>))·I·R<sub>h</sub>, the settlement of one pile under 1 kN (the lecture gets 1.38 × 10<sup>−5</sup> m per kN).',soft:true},
  {step:'sA',slides:['w9-ex3'],text:'Step 4: the interaction factors α = α<sub>F</sub>N<sub>h</sub>N<sub>v</sub> of the side pile (0.5) and the diagonal pile (0.33), from the table.',soft:true},
  {step:'sS',slides:['w9-ex4'],text:'Step 5: S<sub>k</sub> = S<sub>o</sub>P<sub>k</sub> + 2S<sub>o</sub>P<sub>i</sub>α<sub>side</sub> + S<sub>o</sub>P<sub>i</sub>α<sub>diagonal</sub> = 19 mm.',soft:true} ]);

// ---------- Week 10 ----------
pileLesson('w10q1',{shaft:'',base:'c',settle:'group'});
pileLesson('w10q2',{shaft:'ccs',base:'s',group:true});
pileLesson('w10q3',{shaft:'scc',base:'c',group:true});
pileLesson('quiz3',{shaft:'ccs',base:'s',group:true});

// ---------- the same lecture examples, re-worked as declarative problems ----------
Lesson('dpclay',[ ['s1',['w7-ex4','w7-alpha'],'The lecture\'s method 2: three layers (0–2, 2–7, 7–12 m), the average c<sub>u</sub> of each and an α for each; P<sub>s</sub> = πDΣαc<sub>u</sub>ΔL.'],
  ['s2',['w7-ex5','w7-nc'],'Base: c<sub>u</sub> averaged over 2D below the base, N<sub>c</sub> = 9 because L/D &gt; 4 (Skempton), f<sub>b</sub>A<sub>b</sub> = N<sub>c</sub>c<sub>u</sub>πD²/4.'],
  ['s3',['w7-ex6'],'P<sub>u</sub> = P<sub>s</sub> + f<sub>b</sub>A<sub>b</sub>; then divide by the factor of safety for the allowable load. The lecturer\'s note: <b>method 2 for the test or exam</b>.'] ]);
Lesson('dpsand',[ ['s1',['w8-ex3','w7-alpha'],'Clay part of the shaft: f<sub>s</sub> = αc<sub>u</sub> with α = 0.88 at c<sub>u</sub> = 50 kPa.'],
  ['s2',['w8-ex3','w8-mey'],'Sand part: Meyerhof f<sub>s</sub> = 2N̄ with N̄ the average of the readings in the sand.'],
  ['s3',['w8-ex4','w8-mey'],'Base in sand: f<sub>b</sub> = 40N·L/D, limited to 400N.'],
  ['s4',['w8-ex4'],'P<sub>u</sub> = P<sub>s</sub> + f<sub>b</sub>A<sub>b</sub>, about 1800 kN in the lecture.'] ]);
Lesson('dgroup',[ ['s1',['w8-grp1'],'Route 1: nine separate piles, P<sub>g,s</sub> = n·P<sub>u,single</sub>.'],
  ['s2',['w8-grp3','w8-gex2'],'Route 2: the block. Clay: P<sub>u,b</sub> = c<sub>a</sub>·2(B + W)L + N<sub>c</sub>c<sub>ub</sub>BW. The lecture\'s example takes c<sub>a</sub> = 38 kPa, c<sub>ub</sub> = 56 kPa and N<sub>c</sub> = 8.4.'],
  ['s3',['w8-lesser'],'The lesser of the two routes, then divide by F for the allowable load.'] ]);
Lesson('dsettle',[ ['s1',['w9-k','w9-ik'],'K = (E<sub>p</sub>/E<sub>s</sub>)R<sub>A</sub> first; then I from the chart with K and L/D.'],
  ['s2',['w9-ex7','w9-rh'],'S = (P/(DE<sub>s</sub>))·I·R<sub>v</sub>·R<sub>h</sub>. This is the lecture\'s hollow steel pile in gravel above rock; the charts give I = 1.8, R<sub>v</sub> = 0.94, R<sub>h</sub> = 0.82.'] ]);
Lesson('dgset',[ ['s1',['w9-af','w9-ex3'],'Each neighbour contributes α·P: the two side piles and the diagonal pile have different spacings, hence different α (the lecture example: 0.5 and 0.33).'],
  ['s2',['w9-sup','w9-ex4'],'S<sub>k</sub> = S<sub>o</sub>P<sub>k</sub>(1 + Σα) when all piles carry the same load: the pile\'s own settlement times one plus the sum of the interaction factors.'] ]);
