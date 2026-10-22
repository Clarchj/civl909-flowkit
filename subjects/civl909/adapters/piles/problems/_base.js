// ================= PROBLEMS · BASE: shared defaults, the registry, and the groups =================
// Each other file in problems/ adds problems with  problem(key, {the model}, {the question})  and nothing else.
// build.py loads the files listed in interface.config.json > problems.files, in that order.
const baseConv = {reads:'course', pi3:true, alphaSrc:'chart', shaftMethod:'m2', splits:[], baseCu:'tip', eqn:'simple',
  LDmode:'full', roundN:false, crit:0, blockB:'larger'};
const baseGroup = {on:false, layout:'grid', nx:3, ny:3, Sx:2, Sy:2, nring:6, R:3, centre:true,
  mode:'min', eta:90, FS:3, Q:1000};
const clay = (o)=>({kind:'clay', sandMethod:'spt', phi:32, Nq:40, nsf:false, N:[], ...o});
const sand = (o)=>({kind:'sand', sandMethod:'spt', phi:32, Nq:40, nsf:false, cu:[], ...o});

const PRESETS = {}, PMETA = {};
const PGROUPS = [['play','Playground'], ['w7','Week 7: single piles'], ['w8','Week 8: sand and groups'], ['w9','Week 9: settlement'], ['w10','Week 10: review'], ['quiz','Quizzes'], ['gen','Practice generator'],];
// register one problem: the model (what the engine computes from) and the question (text, image, what is asked)
function problem(key, model, question){ PRESETS[key]=model; if (question) PMETA[key]=question; }
// a problem that repeats another one with a new title
function sameAs(key, fromKey, extra){ PRESETS[key]={...JSON.parse(JSON.stringify(PRESETS[fromKey])), ...extra}; }
