// ================= PROBLEMS · Week 9: settlement =================
// problem(key, {model: what the engine computes from}, {question: grp, tags, text, img, asks, hide})
problem('w9ex', {
    title:'W9 Example', sub:'2×2 group: capacity, then cap settlement',
    answer:'Lecture: P<sub>u</sub> = 1850 kN, P<sub>u,g</sub> = 5900 kN, P<sub>a</sub> = 2360 kN, settlement ≈ 19 mm',
    pile:{D:1, L:10, gp:24, kType:'precast_soft', dType:'rough_conc'}, water:{zw:0, gw:10},
    layers:[clay({name:'Clay', top:0, bot:30, gamma:19, cu:[[0,40],[5,52.5],[10,65]]})],
    conv:{...baseConv, shaftMethod:'m1'}, courseOv:{alpha:0.91},
    group:{...baseGroup, on:true, nx:2, ny:2, Sx:2.5, Sy:2.5, mode:'eff', eta:80, FS:2.5, Q:2000},
    settle:{on:true, mode:'group', Es:100, nu:null, Ep:40, EpUnit:'MPa', RA:1, h:30, load:'Pa', target:'corner', reads:{I:1.6, Rh:0.86, aF:{'2.5':0.55,'3.5':0.38}, Nh:{'2.5':0.9,'3.5':0.87}}},
    assumed:['The lecture reads α = 0.91 at c̄<sub>u</sub> = 52 kPa; the α chart used elsewhere gives about 0.86. The course reading is used by default.'],
  },
{grp:'w9', tags:['group','efficiency','settlement'], hide:['Q','gp'], img:'w9ex', asks:['Pa','S'],
    text:'A square group of 4 floating concrete piles (2 × 2, spaced 2.5 m centre to centre), each 1 m in diameter and driven 10 m into a clay layer 30 m above a very stiff soil. The clay has γ = 19 kN/m³ and E<sub>s</sub> = 100 MPa; c<sub>u</sub> = 40 + 2.5z kPa. The water table is at ground level. The cap is flexible and E<sub>p</sub> = 40,000 MPa. (a) Allowable load for the group with an efficiency of 80% and FS = 2.5. (b) Settlement of the pile cap under that load.'});

problem('w9q1', {
    stated:[{type:'radius'}],
    title:'W9 Tutorial Q1', sub:'Single pile settlement in sand',
    answer:'Solution: K = 500, I = 1.8, R<sub>v</sub> = 0.90, R<sub>h</sub> = 0.81, S = 50 mm',
    pile:{D:1, L:15, gp:78, kType:'steel_dense', dType:'rough_steel'}, water:{zw:50, gw:10},
    layers:[sand({name:'Sand', top:0, bot:30, gamma:18, sandMethod:'beta', phi:32, N:[]})],
    conv:{...baseConv}, group:{...baseGroup, FS:3, Q:3000},
    settle:{on:true, mode:'single', Es:80, nu:0.2, Ep:200, RA:0.2, h:30, load:'given', P:3000, reads:{I:1.8, Rv:0.90, Rh:0.81}},
    assumed:['Capacity is not asked; the sand strength is a placeholder and is not used.'],
  },
{grp:'w9', tags:['settlement','single pile','sand'], hide:['FS','Q','gp','zw','gamma'], img:'w9q1', asks:['S'],
    text:'A hollow steel pile of circular cross section (radius 0.5 m) is driven 15 m into sand (D<sub>r</sub> = 0.6, γ = 18 kN/m³), no water. Rock bed 30 m below the surface. Settlement under 3000 kN? E<sub>s</sub> = 80 MPa, ν = 0.2, E<sub>p</sub> = 200 GPa, R<sub>A</sub> = 0.2.'});

problem('w9q2', {
    title:'W9 Tutorial Q2', sub:'Allowable load, then its settlement',
    answer:'Solution: P<sub>u</sub> = 3110 kN, P<sub>a</sub> = 1040 kN, K = 1333, I = 1.7, R<sub>h</sub> = 0.86, S = 42 mm',
    pile:{D:1.2, L:15, gp:78, kType:'steel_soft', dType:'rough_steel'}, water:{zw:1.5, gw:10},
    layers:[clay({name:'Clay', top:0, bot:42, gamma:20, cu:[[0,60]]})],
    conv:{...baseConv}, group:{...baseGroup, FS:3, Q:1000},
    settle:{on:true, mode:'single', Es:30, nu:null, Ep:200, RA:0.2, h:42, load:'Pa', reads:{I:1.7, Rh:0.86}},
    assumed:['The solution reads I = 1.7 at K = 1333, L/D = 12.5; the digitised chart gives about 1.5. The course reading is used by default.'],
  },
{grp:'w9', tags:['clay α','settlement','single pile'], hide:['Q','gp'], img:'w9q2', asks:['Pa','S'],
    text:'A hollow pile, diameter 1.2 m, is driven 15 m into uniform clay (γ<sub>sat</sub> = 20 kN/m³, c<sub>u</sub> = 60 kPa). Rock bed at 42 m; water table 1.5 m below the surface. E<sub>s</sub> = 30 MPa, E<sub>p</sub> = 200 GPa, R<sub>A</sub> = 0.2. (1) Allowable working load with FS = 3. (2) Settlement under the allowable load.'});

problem('w9q3', {
    stated:[{type:'ringDiameter'}],
    title:'W9 Tutorial Q3', sub:'Centre pile of a 7-pile ring, settlement',
    answer:'Solution: P = 640 kN per pile, S<sub>o</sub> = 6.71×10⁻⁵ m/kN, α = 0.33, S = 128 mm',
    pile:{D:1, L:15, gp:78, kType:'steel_dense', dType:'rough_steel'}, water:{zw:50, gw:10},
    layers:[sand({name:'Sand', top:0, bot:30, gamma:20, sandMethod:'beta', phi:32, N:[]})],
    conv:{...baseConv}, group:{...baseGroup, on:true, layout:'ring', nring:6, R:3.5, centre:true, mode:'min', FS:3, Q:4500},
    settle:{on:true, mode:'group', Es:20, nu:0.25, Ep:20, RA:0.5, h:30, load:'given', P:4500, target:'centre', reads:{I:1.8, Rv:0.92, Rh:0.81, aF:{'3.5':0.41}, Nh:{'3.5':0.81}}},
    assumed:['Group diameter 8 m in the sketch: centre-to-centre spacing s = (8 − 1)/2 = 3.5 m.'],
  },
{grp:'w9', tags:['settlement','group','ring','interaction'], hide:['FS','gp','zw','eta'], img:'w9q3', asks:['S'],
    text:'Seven hollow piles with a flexible cap are arranged in a circle (group diameter 8 m). Floating piles, 1 m diameter, embedded 15 m in sand that is 30 m above rock; no water. E<sub>s</sub> = 20 MPa, ν = 0.25, γ = 20 kN/m³, E<sub>p</sub> = 20 GPa, R<sub>A</sub> = 0.5. The load is shared equally. Settlement of the centre pile under a working load of 4500 kN?'});
