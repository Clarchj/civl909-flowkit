// ================= PROBLEMS · Week 10: review =================
// problem(key, {model: what the engine computes from}, {question: grp, tags, text, img, asks, hide})
problem('w10q3', {
    stated:[{type:'block'}],
    title:'W10 Tutorial Q3', sub:'6-pile group, sand over clay',
    answer:'Solution: P<sub>s</sub> = 1320 kN, P<sub>u</sub> = 1630 kN, 6P<sub>u</sub> ≈ 9800 kN, block ≈ 11 000 kN, group = 9800 kN',
    pile:{D:1, L:12, gp:27, kType:'precast_dense', dType:'rough_conc'}, water:{zw:0.4, gw:10},
    layers:[sand({name:'Sand', top:0, bot:5, gamma:18, N:[[1,16],[3,20],[5,22]]}), clay({name:'Clay', top:5, bot:15, gamma:18, cu:[[5,25],[12,46]]})],
    conv:{...baseConv, splits:[10]}, group:{...baseGroup, on:true, nx:3, ny:2, Sx:1.5, Sy:2, mode:'min', eta:100, FS:3, Q:1000},
    assumed:['Plan 4 m × 3 m read as the block size, as in Quiz 3.','Soil unit weights are not given; 18 kN/m³ assumed (not used in the short form).'],
  },
{grp:'w10', tags:['group','sand over clay','SPT','block'], hide:['FS','Q'], img:'w10q3', asks:['Ps','Pu','sum','Pblock','Pg'],
    text:'Six concrete piles (4 × 3 m), 1 m diameter, embedded 12 m. Water table 0.4 m below the surface; pile unit weight 27 kN/m³. Sand on top, 5 m thick, N = 16, 20, 22 at 1, 3, 5 m; clay below (10 m thick), c<sub>u</sub> = 10 + 3z kPa. π = 3, efficiency 100%. Capacity of the group from single piles and from the block.'});

sameAs('w10q1', 'w9q3', {title:'W10 Tutorial Q1', sub:'Same as W9 Q3: centre pile settlement'});
PMETA.w10q1 = {grp:'w10', tags:['settlement','group','ring','same as W9 Q3'], hide:['FS','gp','zw','eta'], img:'w10q1', asks:['S'],
    text:'Same as Week 9 Q3: seven hollow piles in a circle (group diameter 8 m), 1 m diameter, 15 m in sand 30 m above rock. E<sub>s</sub> = 20 MPa, ν = 0.25, E<sub>p</sub> = 20 GPa, R<sub>A</sub> = 0.5. Settlement of the centre pile under 4500 kN.'};

sameAs('w10q2', 'quiz3', {title:'W10 Tutorial Q2', sub:'Same as Quiz 3: group, clay over sand'});
PMETA.w10q2 = {grp:'w10', tags:['group','clay over sand','SPT','block','same as Quiz 3'], hide:['FS','Q'], img:'w10q2', asks:['Ps','Pu','sum','Pblock','Pg'],
    text:'Six concrete piles (4 × 3 m), 1 m diameter, embedded 12 m. Water table 0.4 m below the surface; pile unit weight 27 kN/m³. Clay on top, 5 m thick, c<sub>u</sub> = 30 + 5z kPa; sand below with N = 16, 20, 22, 25, 32 at 5, 7, 9, 12, 20 m. π = 3, efficiency 100%. Capacity of the group from single piles and from the block.'};
