// ================= PROBLEMS · Playground =================
// problem(key, {model: what the engine computes from}, {question: grp, tags, text, img, asks, hide})
problem('playground', {
    title:'Playground', sub:'Free to change anything', playground:true,
    answer:'Your own configuration: no reference answer.',
    pile:{D:0.6, L:14, gp:24, kType:'precast_dense', dType:'rough_conc'},
    water:{zw:1.5, gw:10},
    layers:[clay({name:'Soft clay', top:0, bot:6, gamma:18, cu:[[0,25],[6,49]]}),
            sand({name:'Dense sand', top:6, bot:30, gamma:20, N:[[6,12],[9,18],[12,22],[16,26],[22,30]]})],
    conv:{...baseConv, splits:[3.75]},
    group:{...baseGroup, on:true, nx:3, ny:2, Sx:1.8, Sy:1.8, mode:"min", eta:100, FS:2.5, Q:7500},
    assumed:[],
  },
{grp:'play', tags:['free'], hide:[]});
