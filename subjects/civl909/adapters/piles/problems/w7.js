// ================= PROBLEMS · Week 7: single piles =================
// problem(key, {model: what the engine computes from}, {question: grp, tags, text, img, asks, hide})
problem('w7ex1', {
    title:'W7 Example 1', sub:'Single pile, soft clay, kinked c<sub>u</sub>',
    answer:'Lecture: P<sub>u</sub> ≈ 2600 kN (Method 1), ≈ 2400 kN (Method 2)',
    pile:{D:1.3, L:12, gp:27, kType:'precast_soft', dType:'rough_conc'},
    water:{zw:1, gw:10},
    layers:[clay({name:'Soft clay', top:0, bot:30, gamma:17, cu:[[0,40],[2,20],[12,60]]})],
    conv:{...baseConv, splits:[2,7]},
    group:{...baseGroup, FS:2.5, Q:1000},
    assumed:['γ above the water table taken as γ<sub>sat</sub> = 17 kN/m³ (only value given).'],
  },
{grp:'w7', tags:['clay α','kinked cu','Methods 1–3'], hide:['FS','Q'], img:'w7ex1', asks:['Pu'],
    text:'Calculate the ultimate bearing capacity of a 12 m pile with a diameter of 1.3 m driven into a soft clay with γ<sub>sat</sub> = 17 kN/m³. The unit weight of the pile is 27 kN/m³. The water table is 1 m below the ground. The undrained shear strength of the soil is shown in the diagram: 40 kPa at the surface, 20 kPa at 2 m, and c<sub>u</sub> = 20 + 4(z − 2) kPa below.'});

problem('w7q1', {
    title:'W7 Tutorial Q1', sub:'Two clay layers, 30 and 55 kPa',
    answer:'Solution: P<sub>s</sub> = 360 kN, P<sub>b</sub> = 90 kN, P<sub>u</sub> = 450 kN',
    pile:{D:0.5, L:6, gp:24, kType:'precast_soft', dType:'rough_conc'},
    water:{zw:50, gw:10},
    layers:[clay({name:'Upper clay', top:0, bot:2, gamma:18, cu:[[0,30],[2,30]]}),
            clay({name:'Lower clay', top:2, bot:22, gamma:18, cu:[[2,55],[22,55]]})],
    conv:{...baseConv},
    group:{...baseGroup, FS:3, Q:100},
    assumed:['Unit weights and water table not given; γ = 18, γ<sub>p</sub> = 24 kN/m³ assumed (no effect on the short form).'],
  },
{grp:'w7', tags:['clay α','two layers'], hide:['FS','Q','gp','zw','gamma'], img:'w7q1', asks:['Pu'],
    text:'A single pile of diameter 0.5 m is embedded 6 m into clayey soils. There are two soil layers. The upper layer is 2 m thick and has an undrained shear strength of 30 kPa. The lower layer is 20 m thick and has an undrained shear strength of 55 kPa. Estimate the ultimate bearing capacity of the pile.'});

problem('w7q2', {
    title:'W7 Tutorial Q2', sub:'c<sub>u</sub> = 40 + 2.5z, two 5 m layers',
    answer:'Solution: P<sub>s</sub> = 1620 kN, P<sub>b</sub> = 630 kN, P<sub>u</sub> = 2250 kN',
    pile:{D:1.2, L:10, gp:27, kType:'precast_soft', dType:'rough_conc'},
    water:{zw:0.5, gw:10},
    layers:[clay({name:'Soft clay', top:0, bot:30, gamma:20, cu:[[0,40],[10,65]]})],
    conv:{...baseConv, splits:[5]},
    group:{...baseGroup, FS:3, Q:500},
    assumed:['γ above the water table taken as γ<sub>sat</sub> = 20 kN/m³.'],
  },
{grp:'w7', tags:['clay α','linear cu'], hide:['FS','Q'], img:'w7q2', asks:['Pu'],
    text:'Calculate the ultimate bearing capacity of a 10 m long pile with a diameter of 1.2 m driven into soft clay. The unit weight of the pile is 27 kN/m³ and the saturated unit weight of the clay is 20 kN/m³. The water table is 0.5 m below ground level. The undrained shear strength varies with depth as c<sub>u</sub> = 40 + 2.5z (kPa), 0 ≤ z ≤ 10 m.'});

problem('w7q3', {
    title:'W7 Tutorial Q3', sub:'Design: find L for 1200 kN',
    answer:'Solution: L = 14.2 m (α = 0.78). Press “Solve L”.',
    pile:{D:1.2, L:14.2, gp:24, kType:'precast_soft', dType:'rough_conc'},
    water:{zw:0, gw:10},
    layers:[clay({name:'Soft clay', top:0, bot:40, gamma:20, cu:[[0,60]]})],
    conv:{...baseConv},
    group:{...baseGroup, FS:2.5, Q:1200},
    assumed:[],
  },
{grp:'w7', tags:['clay α','design L'], hide:['gp','zw'], img:'w7q3', asks:['L'],
    text:'A single pile is designed to carry a load of 1200 kN in a deep soft clay foundation. The selected pile diameter is 1.2 m. The soil is uniform, with a saturated unit weight of 20 kN/m³ and an undrained shear strength of 60 kPa. A safety factor of 2.5 is required. Calculate the required pile length.'});
