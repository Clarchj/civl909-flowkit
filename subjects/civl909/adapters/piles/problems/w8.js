// ================= PROBLEMS · Week 8: sand and groups =================
// problem(key, {model: what the engine computes from}, {question: grp, tags, text, img, asks, hide})
problem('w8sand', {
    title:'W8 Example', sub:'Clay over sand, SPT',
    answer:'Lecture: P<sub>s</sub> = 285 kN, f<sub>b</sub>A<sub>b</sub> = 1500 kN, P<sub>u</sub> ≈ 1800 kN',
    pile:{D:0.5, L:5, gp:24, kType:'precast_dense', dType:'rough_conc'},
    water:{zw:0.2, gw:10},
    layers:[clay({name:'Clay', top:0, bot:2, gamma:18, cu:[[0,50],[2,50]]}),
            sand({name:'Sand', top:2, bot:20, gamma:21, N:[[2.2,12],[3,18],[5,20]]})],
    conv:{...baseConv, roundN:true},
    group:{...baseGroup, FS:3, Q:500},
    assumed:['Pile unit weight γ<sub>p</sub> = 24 kN/m³ assumed (not given). It only matters in the full equation.'],
  },
{grp:'w8', tags:['clay over sand','SPT'], hide:['FS','Q','gp'], img:'w8sand', asks:['Ps','Pu'],
    text:'Calculate the ultimate bearing capacity of a 5 m pile with diameter 0.5 m driven into a soil stratum, using the empirical expressions f<sub>s</sub> = 2N̄ and f<sub>b</sub> = 40N(L/D) ≤ 400N kPa for the sand. The water table is 0.2 m below the ground. The clay (top 2 m, γ<sub>t</sub> = 18 kN/m³) has c<sub>u</sub> = 50 kPa. The sand (γ<sub>t</sub> = 21 kN/m³) has N = 12 at z = 2.2 m, N = 18 at z = 3 m and N = 20 at z = 5 m.'});

problem('w8group', {
    stated:[{type:'grid'}],
    title:'W8 Group example', sub:'3×3 group, c<sub>u</sub> = 20 + 4z',
    answer:'Lecture: single 580 kN, 9 piles 5220 kN, block ≈ 15 000 kN, P<sub>a</sub> = 1740 kN',
    pile:{D:0.5, L:9, gp:24, kType:'precast_soft', dType:'rough_conc'},
    water:{zw:0, gw:10},
    layers:[clay({name:'Clay', top:0, bot:30, gamma:18, cu:[[0,20],[9,56]]})],
    conv:{...baseConv, splits:[3,6]},
    group:{...baseGroup, on:true, nx:3, ny:3, Sx:2, Sy:2, mode:'min', eta:90, FS:3, Q:1600},
    assumed:['γ = 18 kN/m³, γ<sub>p</sub> = 24 kN/m³ and water at surface assumed (not given; no effect on the short-form answer).',
             'Spacing 2.0 m back-calculated from the 4.5 m block width: B = 2S + D.'],
  },
{grp:'w8', tags:['group','clay α','block'], hide:['gp','zw','gamma'], img:'w8group', asks:['Pu','sum','Pblock','Pg','Pa'],
    text:'A 3×3 pile group was driven into clayey soil to support a compressive load of 1600 kN. The undrained shear strength of the soil increases with depth as c<sub>u</sub> = 20 + 4z kPa. The diameter of the pile is 0.5 m. Check a length of penetration of 9 m is adequate. A safety factor of 3 is required. (Block B = W = 4.5 m.)'});

problem('w8eff', {
    stated:[{type:'grid'}],
    title:'W8 Efficiency example', sub:'3×3 group, η = 90%, find FS',
    answer:'Lecture: P<sub>u,g</sub> = 9 × 90% × 580 ≈ 4700 kN, FS = 4700/1600 ≈ 3',
    pile:{D:0.5, L:9, gp:24, kType:'precast_soft', dType:'rough_conc'},
    water:{zw:0, gw:10},
    layers:[clay({name:'Clay', top:0, bot:30, gamma:18, cu:[[0,20],[9,56]]})],
    conv:{...baseConv, splits:[3,6]},
    group:{...baseGroup, on:true, nx:3, ny:3, Sx:2, Sy:2, mode:'eff', eta:90, FS:3, Q:1600},
    assumed:['Same pile and soil as the 3×3 group example.'],
  },
{grp:'w8', tags:['group','efficiency'], hide:['FS','gp','zw','gamma'], img:'w8eff', asks:['Pu','Pg','FSact'],
    text:'A 3×3 pile group was driven into clayey soil to support a compressive load of 1600 kN. The undrained shear strength of the soil increases with depth as c<sub>u</sub> = 20 + 4z kPa. The diameter of the pile is 0.5 m. If the efficiency of the pile group is 90%, find the bearing capacity safety factor of the pile group.'});

problem('w8q1', {
    stated:[{type:'ringDiameter'}],
    title:'W8 Tutorial Q1', sub:'7 piles in a ring, sand, η = 75%',
    answer:'Solution: single ≈ 11 400 kN, group ≈ 60 000 kN',
    pile:{D:1.2, L:12, gp:24, kType:'bored_stiff', dType:'bored'},
    water:{zw:50, gw:10},
    layers:[sand({name:'Sand', top:0, bot:30, gamma:20, N:[[0.2,8],[3,15],[6,18],[8,20],[11.5,23]]})],
    conv:{...baseConv, roundN:true},
    group:{...baseGroup, on:true, layout:'ring', nring:6, R:3.4, centre:true, mode:'eff', eta:75, FS:3, Q:10000},
    assumed:['Ring radius taken from the sketch: group diameter D<sub>g</sub> = 8 m = 2R + D, so R = 3.4 m.'],
  },
{grp:'w8', tags:['group','ring','SPT','efficiency'], hide:['FS','Q','gp','zw'], img:'w8q1', asks:['Pu','Pg'],
    text:'A group of seven piles is arranged in a circle (group diameter 8 m). All are floating concrete piles, 1.2 m in diameter, cast in place and embedded 12 m into sand. No water exists within the layer. The sand has a total unit weight of 20 kN/m³. The group efficiency is 75%. Determine the bearing capacity of the pile group using f<sub>s</sub> = 2N̄ and f<sub>b</sub> = 40N(L/D) ≤ 400N kPa. SPT: z = 0.2, 3, 6, 8, 11.5 m; N = 8, 15, 18, 20, 23.'});

problem('w8q2', {
    stated:[{type:'grid'}],
    title:'W8 Tutorial Q2', sub:'2×2 group, c<sub>u</sub> = 20 + 4z',
    answer:'Solution: single 1400 kN, 4 piles 5600 kN, block 10 400 kN, group 5600 kN',
    pile:{D:0.8, L:12, gp:24, kType:'precast_soft', dType:'rough_conc'},
    water:{zw:0, gw:10},
    layers:[clay({name:'Soft clay', top:0, bot:40, gamma:20, cu:[[0,20],[12,68]]})],
    conv:{...baseConv, splits:[5]},
    group:{...baseGroup, on:true, nx:2, ny:2, Sx:2.2, Sy:1.7, mode:'min', FS:3, Q:1000},
    assumed:['Spacing back-calculated from the 3 m × 2.5 m block in the solution: S = B − D. S<sub>y</sub> = 1.7 m is below 2.5D; the figure may differ.',
             'Water table not given; taken at the surface. γ<sub>p</sub> = 24 kN/m³ assumed.'],
  },
{grp:'w8', tags:['group','clay α','block'], hide:['FS','Q','gp','zw'], img:'w8q2', asks:['Pu','sum','Pblock','Pg'],
    text:'A 2×2 pile group is driven 12 m into a deep soft clay foundation. The pile diameter is 0.8 m. The soil is uniform with γ<sub>sat</sub> = 20 kN/m³. The undrained shear strength is 20 kPa at the surface and increases by 4 kPa per metre. Calculate the ultimate bearing capacity of the pile foundation. (Block B = 3 m, W = 2.5 m.)'});

problem('w8q3', {
    stated:[{type:'block'}],
    title:'W8 Tutorial Q3', sub:'2×2 group, sand over clay',
    answer:'Solution: single 860 kN, group 3440 kN, block 9900 kN, P<sub>a</sub> ≈ 1150 kN',
    pile:{D:0.75, L:8, gp:24, kType:'precast_dense', dType:'rough_conc'},
    water:{zw:50, gw:10},
    layers:[sand({name:'Sand', top:0, bot:3, gamma:18, N:[[0,5],[2.5,18]]}),
            clay({name:'Clay', top:3, bot:30, gamma:18, cu:[[3,40],[8,55]]})],
    conv:{...baseConv},
    group:{...baseGroup, on:true, nx:2, ny:2, Sx:3.25, Sy:2.25, mode:'min', FS:3, Q:1000},
    assumed:['Unit weights and water table not given; assumed γ = 18 kN/m³, no water.',
             'Spacing back-calculated from the 4 m × 3 m block: S = B − D.'],
  },
{grp:'w8', tags:['group','sand over clay','SPT','block'], hide:['Q','gp','zw','gamma'], img:'w8q3', asks:['Pu','Pg','Pa'],
    text:'Estimate the load allowed for a group of four identical piles (block 4 m × 3 m). Pile diameter 0.75 m, driven 8 m. A safety factor of 3 is required. Sand for the top 3 m: N = 5 at the top and N = 18 at z = 2.5 m. Clay below: c<sub>u</sub> = 40 kPa at z = 3 m, increasing by 3 kPa per metre.'});
