// ================= PROBLEMS · Quizzes =================
// problem(key, {model: what the engine computes from}, {question: grp, tags, text, img, asks, hide})
problem('quiz3', {
    stated:[{type:'block'}],
    title:'Quiz 3', sub:'6 piles, clay over sand, η = 100%',
    answer:'Official solution (W10 Q2): P<sub>s</sub> = 1470 kN, P<sub>u</sub> ≈ 9000 kN, 6P<sub>u</sub> = 54 000 kN, block = 43 100 kN, group = 43 100 kN',
    pile:{D:1, L:12, gp:27, kType:'precast_dense', dType:'rough_conc'},
    water:{zw:0.4, gw:10},
    layers:[clay({name:'Clay', top:0, bot:5, gamma:18, cu:[[0,30],[5,55]]}),
            sand({name:'Sand', top:5, bot:20, gamma:20, N:[[5,16],[7,20],[9,22],[12,25],[20,32]]})],
    conv:{...baseConv, splits:[2]},
    group:{...baseGroup, on:true, nx:3, ny:2, Sx:1.5, Sy:2, mode:'min', eta:100, FS:1, Q:0},
    assumed:['Plan 4 m × 3 m read as the block size B × W (course convention), so S<sub>x</sub> = (4 − 1)/2 = 1.5 m and S<sub>y</sub> = 2 m. If 4 m × 3 m is the centre-to-centre extent, set S<sub>x</sub> = 2, S<sub>y</sub> = 3: the block grows to 5 × 4 m and the single-pile route governs instead.',
             'Soil unit weights are not in the question text; γ<sub>clay</sub> = 18 and γ<sub>sand</sub> = 20 kN/m³ assumed. They only matter in the full equation (switch Equation to see it).',
             'Clay shaft split at z = 2 m, where c<sub>u</sub> = 30 + 5z reaches 40 kPa (α = 1 above).',
             'No FS given: FS = 1 and Q = 0, so P<sub>a</sub> equals the ultimate value.'],
  },
{grp:'quiz', tags:['group','clay over sand','SPT','block'], hide:['FS','Q'], asks:['Ps','Pu','sum','Pblock','Pg'],
    text:'A concrete pile group has 6 piles (3 × 2, plan 4 m × 3 m). The piles are 1 m in diameter and embedded 12 m. The water table is 0.4 m below the surface. Pile unit weight 27 kN/m³. Clay on top, 5 m thick, c<sub>u</sub> = 30 + 5z kPa. Sand below (15 m thick) with N = 16, 20, 22, 25, 32 at z = 5, 7, 9, 12, 20 m. Assume π = 3 and efficiency 100%. Q1 shaft resistance of a single pile; Q2 ultimate capacity of a single pile; Q3 group capacity from single piles; Q4 group capacity as an equivalent block; Q5 capacity of the group.'});
