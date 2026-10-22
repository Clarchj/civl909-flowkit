// ================= KIT · DECLARATIVE PROBLEMS =================
// A problem is a small set of named blocks. Each function block holds ONE expression over other blocks' ids; the wires are found
// from the identifiers in the expression, so nothing is wired by hand and every number is really computed here.
//   In(id, value, unit, symbol, meaning)        a value given in the question (editable)
//   Cn(id, value, unit, symbol, meaning)        a value fixed by a rule or read from a chart as the course reads it
//   Fn(id, 'expression', {sym,name,unit,verb,eq,num,step,goal,chart,how,branch,course})   a function: its result is its own block
//   Fn(..., {side:true}) marks a SIDE RESULT: a second product (e.g. a comparison) that is not the goal; the Teardown tab shows it as its own product, not as an unused part.
//   Gate(id, 'expression', {test,yes,no,step,info})   a yes/no decision; a function can use it in its expression (soft ? 1 : …)
//   Gate(id, 'bad', {test,yes,no,warn:true})           a validity check: when TRUE the page shows the 'yes' text as a warning (top bar, Question and Solution tabs). Keep it out of every expression, so it never changes a number.
// Helpers inside expressions: log10 ln exp sqrt pow abs min max PI tan atan sin cos rad deg round sum lookup('table', x)
const DECL={}, TABLES={}, ENGINES={}, CATALOG={}, NOTES={}, SCENES={}, ORIGINS={}, LESSONS={}, BOARDS={};
// Scene(id, {kind, …})  the picture of a problem (see kit/ui/scene.js); kept apart from the numbers like Notes()
const Scene=(id,o)=>{ SCENES[id]=o; return o; };
// Board(id, {gates:[{n, chips:[{t,on:v=>bool,set}], because:v=>html, skip:v=>reason, fixed}], strip:v=>html})   the gate board: every either / or of the problem in one panel at the top (kit/ui/board.js)
const Board=(id,o)=>{ BOARDS[id]=o; return o; };
// Origin(id, [pictureId…], {note})   the page the question was set on (a picture from the subject's media folder), shown at the top of the Question tab
const Origin=(id,ids,o={})=>{ ORIGINS[id]={ids:[].concat(ids), ...o}; return ORIGINS[id]; };
// Lesson(id, [[stepId|null, pictureId|[ids], 'text' | v=>'text'], …])   the lecture slides the working draws on, each with a line on how it is used HERE (Lecture tab).
// stepId is a step of the problem (null = about the whole problem); an item given as an object {step,slides,text,soft:true} is dropped when the problem has no such step (for templates shared by many problems). A text function gets the computed values of the problem so numbers stay true when an input is edited.
const Lesson=(id,items)=>{ LESSONS[id]=items.map(it=>Array.isArray(it)?{step:it[0],slides:[].concat(it[1]),text:it[2]}:{...it,slides:[].concat(it.slides||[])}); return LESSONS[id]; };
// Notes(id, {idea, asks, steps:{stepId:'why'}, traps:[…], assumed:[…]})  the teaching text that goes with a problem (kept apart from the numbers)
const Notes=(id,o)=>{ NOTES[id]=o; return o; };
const Table=(name,pts)=>{ TABLES[name]=pts; return pts; };
const KH={ log10:Math.log10, ln:Math.log, exp:Math.exp, sqrt:Math.sqrt, pow:Math.pow, abs:Math.abs, min:Math.min, max:Math.max, PI:Math.PI, tan:Math.tan, atan:Math.atan, sin:Math.sin, cos:Math.cos,
  rad:d=>d*Math.PI/180, deg:r=>r*180/Math.PI, round:Math.round, sum:(...a)=>a.reduce((s,x)=>s+x,0), lookup:(t,x)=>interpTable(typeof t==='string'?TABLES[t]:t,x) };
const KH_NAMES=Object.keys(KH);
const Helper=(name,fn)=>{ KH[name]=fn; if (!KH_NAMES.includes(name)) KH_NAMES.push(name); };   // a subject can add its own helper to expressions
const In=(id,val,unit,sym,name,o={})=>({k:'in',id,val,unit,sym,name,...o});
const Cn=(id,val,unit,sym,name,o={})=>({k:'const',id,val,unit,sym,name,...o});
const Fn=(id,expr,o={})=>({k:'fn',id,expr,...o});
const Gate=(id,expr,o={})=>({k:'gate',id,expr,...o});

function Problem(def){ DECL[def.id]=def;
  CATALOG[def.id]={id:def.id, engine:'decl', track:def.track||'', week:def.week||0, source:def.source||'', type:def.type||'', title:def.title, sub:def.sub||'', tags:def.tags||[], answer:def.answer||'', text:def.text||'', order:def.order||0, group:def.group||''};
  return def; }

const identsOf=expr=>{ const s=String(expr).replace(/'[^']*'|"[^"]*"/g,'').replace(/\.[A-Za-z_]\w*/g,''); return [...new Set(s.match(/[A-Za-z_][A-Za-z0-9_]*/g)||[])]; };

// evaluate every block in dependency order; returns the values and what each block depends on
function evalDecl(def, vals){
  const byId={}; def.nodes.forEach(n=>{ if (byId[n.id]) throw new Error('duplicate block id '+n.id); byId[n.id]=n; });
  const v={}, deps={}, state={}, errs={};
  const go=id=>{ const n=byId[id]; if (id in v) return v[id]; if (state[id]===1) throw new Error('loop at '+id); state[id]=1;
    if (n.k==='in'||n.k==='const'){ v[id]=(vals&&id in vals&&n.k==='in')?vals[id]:n.val; state[id]=2; return v[id]; }
    const d=identsOf(n.expr).filter(x=>byId[x]&&x!==id&&!KH_NAMES.includes(x)); deps[id]=d; d.forEach(go);
    try{ v[id]=new Function(...d,...KH_NAMES,'return ('+n.expr+');')(...d.map(x=>v[x]),...KH_NAMES.map(k=>KH[k])); }catch(e){ v[id]=NaN; errs[id]=e.message; }
    state[id]=2; return v[id]; };
  def.nodes.forEach(n=>go(n.id));
  return {v, deps, byId, errs}; }

// the numbers put into an expression, for the "= 1.00 × 30.00" line
function numLine(n, v){ const toks=identsOf(n.expr); let s=String(n.expr).replace(/Math\./g,'');
  toks.forEach(t=>{ if (t in v && !KH_NAMES.includes(t)){ const x=typeof v[t]==='boolean'?(v[t]?'yes':'no'):fmt(v[t]); s=s.replace(new RegExp('\\b'+t+'\\b','g'),'§'+x+'§'); } });
  s=s.replace(/lookup\(\s*'[^']*'\s*,\s*([^)]*)\)/g,'chart($1)');
  s=s.replace(/§/g,'').replace(/\*\*/g,'^').replace(/\*/g,' × ').replace(/\//g,' ÷ ').replace(/\s+/g,' ').trim();
  return s; }

// turn a problem into the "program" the flow map draws: blocks, wires, steps, stages
function compileDecl(def, vals){
  const {v,deps,byId,errs}=evalDecl(def,vals), nodes=[], edges=[];
  const stepNodes={}; const mark=(step,id)=>{ if (step) (stepNodes[step]=stepNodes[step]||[]).push(id); };
  def.nodes.forEach(n=>{
    const info=n.name?(n.info?n.name+'. '+n.info:n.name):(n.info||'');
    if (n.k==='in') nodes.push({id:n.id, kind:'noun', role:'given', name:n.sym, val:v[n.id], unit:n.unit||'', info, path:'vals.'+n.id, step:null});
    else if (n.k==='const'){ nodes.push({id:n.id, kind:'noun', role:'rule', name:n.sym, val:v[n.id], unit:n.unit||'', info, step:n.step||null}); mark(n.step,n.id); }
    else if (n.k==='gate'){ const val=!!v[n.id]; nodes.push({id:n.id, kind:'adj', name:val?n.yes:n.no, yes:n.yes, no:n.no, val, test:n.test||'', info:n.info||'', step:n.step||null, warn:!!n.warn}); mark(n.step,n.id);
      (deps[n.id]||[]).forEach(d=>edges.push({a:d,b:n.id,kind:'desc'})); }
    else { const vid='v_'+n.id; const chart=typeof n.chart==='function'?n.chart(v):(n.chart||null);
      const num=typeof n.num==='function'?n.num(v):(n.num!=null?n.num:numLine(n,v)); const rule=(n.eq?n.eq+' = ':'')+num;
      nodes.push({id:vid, kind:'verb', side:!!n.side, name:n.verb||('find '+n.sym), vtype:chart?'chart':(n.vtype||'calc'), rule, chart, course:!!n.course, branch:typeof n.branch==='function'?n.branch(v):(n.branch||''), eq:null, step:n.step||null, how:typeof n.how==='function'?n.how(v):(n.how||null)});
      nodes.push({id:n.id, kind:'noun', role:'made', name:n.sym, val:v[n.id], unit:n.unit||'', info, ov:null, goal:!!n.goal, by:vid, step:n.step||null});
      mark(n.step,vid); mark(n.step,n.id);
      (deps[n.id]||[]).forEach(d=>edges.push({a:d,b:vid,kind:byId[d].k==='gate'?'qual':'flow'}));
      edges.push({a:vid,b:n.id,kind:'make'}); } });
  const steps=(def.steps||[]).map(s=>({key:s.id,title:s.title,ids:stepNodes[s.id]||[],stage:s.stage||null})).filter(s=>s.ids.length);
  const stages=(def.stages||[]).map(s=>[s[0],s[1]]);
  const checks=(def.check||[]).filter(c=>!c.when||Object.entries(c.when).every(([k,val])=>v[k]===val));         // a check with when:{input:value} is the official answer for that state of the inputs only
  const verify=checks.map(c=>({label:c.label||'', exp:c.exp, got:v[c.id], tol:c.tol==null?0.02:c.tol, unit:c.unit||'', ok:isFinite(v[c.id])&&Math.abs(v[c.id]-c.exp)<=Math.abs(c.exp)*(c.tol==null?0.02:c.tol)+1e-9, note:c.note||''}));
  const warns=def.nodes.filter(n=>n.k==='gate'&&n.warn&&v[n.id]).map(n=>({id:n.id,msg:n.yes,info:n.info||''}));
  const noOfficial=(def.check||[]).some(c=>c.when)&&!checks.length;
  return {nodes, edges, steps, stages, warns, noOfficial, scene:def.scene||SCENES[def.id]||null, vals:v, stageOf:k=>{ const s=steps.find(x=>x.key===k); return s&&s.stage?stages.findIndex(x=>x[0]===s.stage):-1; }, verify, errs};
}

const defaultVals=def=>{ const o={}; def.nodes.forEach(n=>{ if (n.k==='in') o[n.id]=n.val; }); return o; };
ENGINES.decl={
  open(id){ return {vals:defaultVals(DECL[id])}; },
  base(id){ return {vals:defaultVals(DECL[id])}; },
  recompute(){ },
  changed(id,S){ const b=defaultVals(DECL[id]); return Object.keys(b).filter(k=>S.vals[k]!==b[k]).length; },   // how many givens the student has edited
  program(id,S){ return compileDecl(DECL[id], S.vals); } };
