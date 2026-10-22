// ================= PROBLEMS · TEMPLATE (not loaded: copy this file, rename it, add its name to problems.files) =================
// problem(key, {model: what the engine computes from}, {question: grp, tags, text, img, asks, hide})
// Fill the model with ONLY what the question gives. Anything read off a sketch or assumed goes in `assumed`.
// When the question gives a value in another form, say so in `stated` so it shows as its own step:
//   {type:'radius'} radius → D,  {type:'grid'} 3×3 → n,  {type:'ringDiameter'} group diameter → R,  {type:'block'} block size given.
problem('w11q1', {
    title:'W11 Tutorial Q1', sub:'one line saying what is special about it',
    answer:'Solution: P<sub>u</sub> = … kN',                      // the official answer, as written in the solution
    stated:[],
    pile:{D:0.5, L:10, gp:24, kType:'precast_soft', dType:'rough_conc'},
    water:{zw:50, gw:10},                                        // 50 m = no water within reach
    layers:[clay({name:'Clay', top:0, bot:30, gamma:18, cu:[[0,40],[10,60]]})],
    conv:{...baseConv},                                          // π = 3, course chart readings, short-form equation
    group:{...baseGroup},                                        // on:false = a single pile
    courseOv:{},                                                 // a chart reading the solution uses, e.g. {alpha:0.85}
    assumed:[],
  },
  {grp:'w10', tags:['clay α'], hide:['FS','Q'], asks:['Pu'],    // grp must be a group in PGROUPS (_base.js); asks = what the question asks for
    text:'The question, word for word.'});
