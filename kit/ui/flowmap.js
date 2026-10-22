// ================= FLOW MAP: the solution as a Grasshopper-style graph =================
// One idea: a FUNCTION takes inputs and returns a RESULT; the result is its own block and feeds the next function.
//   input     a value from the question (purple edge), editable
//   const     a value fixed by a rule (dashed)
//   function  an equation, chart reading or table lookup. Always followed by a result block that shows what it returned.
//   gate      a decision: reads a value, answers yes/no, and switches how the functions it feeds behave (dashed wire)
//   group     a stage or step: only a coloured frame drawn around its blocks, like a Grasshopper Group. It hides nothing, owns no pins,
//             wires pass straight through it, it resizes to its members as they move, and dragging its title moves them all.
// Wiring (switch on): unplug a wire (click it, or drag it off a pin) and everything downstream loses its result,
// like null data in Grasshopper; plug it back by dragging from the result block to the pin, or click the red ghost wire.
// A function can also be switched off (power button). The numbers come from the app's own engine (compute) and
// solution program (an engine's program()): nothing is recomputed here, so an unplugged wire cuts the dependency, not the arithmetic.

// ---------- state the engine expects ----------
let S, presetKey='', last=null, ENG=null;   // S: the open problem's state. presetKey: its id. ENG: the engine that computes it (see ENGINES)
function get(path,o=S){ return path.split('.').reduce((a,k)=>a?.[k],o); }
function setPath(path,v){ const ks=path.split('.'); let o=S; for(let i=0;i<ks.length-1;i++) o=o[ks[i]]; o[ks[ks.length-1]]=v; }
let COLL={};
const pts2txt=p=>(p||[]).map(([z,v])=>z+':'+v).join(', ');

// ---------- model ----------
const FM = {key:null, prog:null, leaves:[], leaf:{}, groups:{}, edges:[], order:{}, up:{}, down:{},
  collapsed:new Set(), peek:new Set(), off:{}, sel:null, vp:{x:40,y:40,k:1}, LAY:null, vis:null,
  wiring:false, practice:false, known:new Set(), focus:null, open:new Set(), multi:new Set(), tool:'pan', space:false, cut:new Set(), dis:new Set(), undo:[], status:{}, level:1};
const ekey = e => e.s+'>'+e.d+'>'+e.kind;

function buildModel(){
  const p=FM.prog=ENG.program(presetKey,S);
  const nodes=p.nodes, by=Object.fromEntries(nodes.map(n=>[n.id,n]));
  const leaves=[], leaf={}, n2l={};
  const mk=o=>{ leaf[o.id]=o; leaves.push(o); return o; };
  nodes.forEach(n=>{
    if (n.kind==='verb'){ const out=nodes.find(m=>m.kind==='noun' && m.by===n.id);
      const L=mk({id:'F:'+n.id, type:'func', node:n, out, step:n.step, name:n.name, goal:!!(out&&out.goal)}); if (out) n2l[out.id]=L.id; }
    else if (n.kind==='adj') mk({id:'G:'+n.id, type:'gate', node:n, step:n.step, name:n.name});
    else if (n.kind==='noun' && !n.by) { const L=mk({id:(n.role==='given'?'I:':'C:')+n.id, type:n.role==='given'?'input':'const', node:n, out:n, step:n.step||null, name:n.name}); n2l[n.id]=L.id; }
  });
  nodes.forEach(n=>{ if (n.kind==='adj') n2l[n.id]='G:'+n.id; });
  const E=[], seen=new Set();
  p.edges.forEach(e=>{ if (e.kind==='make') return;
    const s=n2l[e.a]; const d = by[e.b] && by[e.b].kind==='verb' ? 'F:'+e.b : by[e.b] && by[e.b].kind==='adj' ? 'G:'+e.b : null;
    if (!s||!d||s===d) return; const k=s+'>'+d+'>'+e.kind; if (seen.has(k)) return; seen.add(k); E.push({s,d,kind:e.kind}); });
  leaves.forEach(l=>{ if (l.type!=='func') return; l.isChart=l.node.vtype==='chart'; l.chart=l.node.chart||null;
    if (!l.chart && l.isChart && /^va\d*$/.test(l.node.id)){ const e=E.find(e=>e.d===l.id && e.kind==='flow' && leaf[e.s].out && typeof leaf[e.s].out.val==='number');
      if (e && l.out && typeof l.out.val==='number') l.chart={type:'alpha', x:leaf[e.s].out.val, y:l.out.val}; } });
  // groups: one per step, one per stage that holds several steps
  const groups={}, stageSteps={};
  p.steps.forEach(st=>{ const si=p.stageOf?p.stageOf(st.key):-1; const sk = si>=0 ? p.stages[si][0] : 'other';
    (stageSteps[sk]=stageSteps[sk]||[]).push(st); });
  Object.keys(stageSteps).forEach(sk=>{ const sts=stageSteps[sk]; let parent=null;
    if (sts.length>1 && sk!=='other'){ const nm=((p.stages||[]).find(x=>x[0]===sk)||[sk,sk])[1]; parent='T:'+sk; groups[parent]={id:parent, kind:'stage', title:nm, parent:null, ids:[]}; }
    sts.forEach(st=>{ groups['S:'+st.key]={id:'S:'+st.key, kind:'step', title:st.title, parent, key:st.key, ids:[]}; }); });
  leaves.forEach(l=>{ l.grp = l.step && groups['S:'+l.step] ? 'S:'+l.step : null; });
  FM.leaves=leaves; FM.leaf=leaf; FM.groups=groups; FM.edges=E;
  leaves.forEach((l,i)=>{ FM.order[l.id]=i; });
  Object.values(groups).forEach(g=>{ g.ids=[]; });
  leaves.forEach(l=>{ for(let g=l.grp; g; g=groups[g].parent) groups[g].ids.push(l.id); });
  Object.keys(groups).forEach(g=>{ if (!groups[g].ids.length) delete groups[g]; });
  const succ={}, pred={}; leaves.forEach(l=>{ succ[l.id]=[]; pred[l.id]=[]; }); E.forEach(e=>{ succ[e.s].push(e.d); pred[e.d].push(e.s); });
  const reach=(m)=>{ const R={}; leaves.forEach(l=>{ const o=new Set(), st=[...m[l.id]]; while(st.length){ const x=st.pop(); if (o.has(x)) continue; o.add(x); m[x].forEach(y=>st.push(y)); } R[l.id]=o; }); return R; };
  FM.down=reach(succ); FM.up=reach(pred);
  if (FM.key!==presetKey){ FM.key=presetKey; FM.peek=new Set(); FM.off={}; FM.sel=null; FM.known=new Set(); FM.focus=null; FM.open=new Set(); FM.multi=new Set(); FM.cut=new Set(); FM.dis=new Set(); FM.undo=[]; FM._fit=true; }
  else FM.collapsed=new Set([...FM.collapsed].filter(g=>groups[g]));
  evalStatus();
}

// ---------- evaluation: which blocks still have a result ----------
function evalStatus(){ const st={}, inc={}; FM.leaves.forEach(l=>inc[l.id]=[]); FM.edges.forEach(e=>inc[e.d].push(e));
  const go=id=>{ if (id in st) return st[id]; st[id]='ok'; // (graph is acyclic; guard anyway)
    let r='ok'; if (FM.dis.has(id)) r='off'; else for(const e of inc[id]){ if (FM.cut.has(ekey(e)) || go(e.s)!=='ok'){ r='starved'; break; } }
    return st[id]=r; };
  FM.leaves.forEach(l=>go(l.id)); FM.status=st; }
const stOf = id => FM.status[id]||'ok';
function groupStatus(g){ const ls=g.ids.map(i=>FM.leaf[i]).filter(l=>l.type==='func'); const bad=ls.filter(l=>stOf(l.id)!=='ok').length; return {n:ls.length, bad}; }

// ---------- visibility ----------
function repOf(id){ return id; } // groups are frames only: every block is always itself
function kidsOf(parent){
  const gs=Object.values(FM.groups).filter(g=>g.parent===parent), ls=FM.leaves.filter(l=>l.grp===parent);
  const items=[...gs.map(g=>({id:g.id,o:Math.min(...g.ids.map(i=>FM.order[i]))})), ...ls.map(l=>({id:l.id,o:FM.order[l.id]}))];
  items.sort((a,b)=>a.o-b.o); return items.map(i=>i.id); }
function leavesIn(id){ return FM.groups[id] ? FM.groups[id].ids : [id]; }
const hasRC = id => FM.leaf[id].type==='func'||FM.leaf[id].type==='gate'; // has a result column

function computeVisible(){
  const rep={}; FM.leaves.forEach(l=>rep[l.id]=repOf(l.id));
  const wires=[], wk={}, inRows={}, outRows={};
  const add=(m,k,v)=>{ (m[k]=m[k]||[]); if (!m[k].includes(v)) m[k].push(v); };
  FM.edges.forEach(e=>{ const rs=rep[e.s], rd=rep[e.d]; if (rs===rd) return;
    const key=e.s+'>'+rd+'>'+e.kind; let w=wk[key];
    if (!w){ w=wk[key]={s:e.s, rs, rd, kind:e.kind, pairs:[], edges:[]}; wires.push(w); add(inRows, rd, e.s+'|'+e.kind); add(outRows, rs, e.s); }
    w.pairs.push([e.s,e.d]); w.edges.push(e); });
  wires.forEach(w=>{ const c=w.edges.filter(e=>FM.cut.has(ekey(e))).length; w.state = c===0?'live' : c===w.edges.length?'cut':'part'; });
  const items={};
  const reg=id=>{ if (items[id]) return; const g=FM.groups[id];
    if (!g || FM.collapsed.has(id)){ const ls=leavesIn(id); const isLeaf=!g;
      let outL = isLeaf ? [id] : [...(outRows[id]||[])]; if (!isLeaf) ls.forEach(l=>{ if (FM.leaf[l].goal && !outL.includes(l)) outL.push(l); });
      outL.sort((a,b)=>FM.order[a]-FM.order[b]);
      const ins=(inRows[id]||[]).slice().sort((a,b)=>FM.order[a.split('|')[0]]-FM.order[b.split('|')[0]]);
      items[id]={id, leaf:isLeaf, ins, outs:outL}; } };
  const walk=p=>kidsOf(p).forEach(k=>{ reg(k); if (FM.groups[k] && !FM.collapsed.has(k)) walk(k); });
  walk(null);
  FM.vis={rep, wires, items};
}

// ---------- sizes and layered layout ----------
// Everything is minimal until clicked: a function is a small logo square, a value is a small pill.
const HH=28, GAP=26, VW=108, RBH=24, FW=58, GW=50, PW=112, PH=26;   // a function (58) is clearly bigger than a value (26): it is built from smaller parts
function itemSize(id){ const it=FM.vis.items[id], l=FM.leaf[id];
  if (l.type==='func'||l.type==='gate'){ const n=Math.max(1,it.ins.length); const W=l.type==='gate'?GW:FW; return {w:W, h:Math.max(W,16*n+12), rw:GAP+VW}; }
  return {w:PW, h:PH, rw:0}; }
const numericish=t=>{ const x=plainT(t).replace(/π|kPa|kN|MPa|GPa|mm|m²|m\b/g,''); return /\d/.test(x) && !/[A-Za-zα-ωΑ-Ω]/.test(x); };
// split a rule such as "f_s = α·c̄_u = 1.00 × 30.00" into the symbolic equation and the numbers put into it
function eqParts(l){ const r=l.node.rule; if (!r || l.node.vtype==='chart' || l.type!=='func') return null; const P=r.split(' = ').map(x=>x.trim()), out=l.out&&l.out.name||'';
  if (P.length>=3 && numericish(P[P.length-1])) return {sym:P.slice(0,-1).join(' = '), num:P[P.length-1]};
  if (P.length===2 && numericish(P[1])) return {sym:(P[0].length>6 && !plainT(P[0]).startsWith(plainT(out)) ? out+' = ' : '')+P[0], num:P[1]};
  if (P.length===1 && numericish(P[0]) && /[+×·÷\-−\/]/.test(plainT(P[0]))) return {sym:out, num:P[0]};
  if (P.length===1 && !/^(mean of|AS2159|Skempton,)/.test(plainT(r)) && /[×·÷\/+−^²≤≥()]/.test(plainT(r))){ const m=r.match(/^([A-Za-z]+): (.*)$/); return {sym:out+' = '+(m?m[2]:r), num:null, tag:m?m[1]:null}; }
  if (P.length>=2) return {sym:r, num:null};
  return null; }
function howSteps(l,skipWork){ const n=l.node, c=l.chart, v=fmt, o=[];
  if (n.how && n.how.length){ const h=n.how.slice(); if (n.branch) h.push(`Because ${n.branch}.`); return h; }   // a problem can write its own steps
  if (c){
    if (c.type==='alpha'){ const gate=c.x<=40; o.push(`Start from the average strength c̄<sub>u</sub> = <b>${v(c.x)} kPa</b>.`);
      o.push(gate?`c̄<sub>u</sub> ≤ 40 kPa, so the decision gate is open: the clay grips the pile fully and α = 1. The curve is shown for reference only.`:`Find ${v(c.x)} on the horizontal axis, go up to the α curve (${S.conv.alphaSrc==='chart'?'digitised AS 2159 chart':'course rule'}), then across to the vertical axis.`); o.push(`Read <b>α = ${v(c.y)}</b>.`); }
    else if (c.type==='nc'){ o.push(`Start from the slenderness ratio = <b>${v(c.x)}</b>.`);
      o.push(c.x>=4?`It is 4 or more, so the pile is long and Skempton's curve is flat at N<sub>c</sub> = 9.`:`It is under 4, so go up from ${v(c.x)} on the horizontal axis to Skempton's curve, then across to the vertical axis.`); o.push(`Read <b>N<sub>c</sub> = ${v(c.y)}</b>.`); }
    else if (c.type==='cap'){ const N=c.N, a=40*N*c.x, cap=400*N; o.push(`N at the tip = <b>${v(N)}</b>, L/D = <b>${v(c.x)}</b>.`); o.push(`Meyerhof: f<sub>b</sub> = 40N·L/D = ${v(a)} kPa, but never more than 400N = ${v(cap)} kPa.`); o.push(`Take the smaller: <b>f<sub>b</sub> = ${v(Math.min(a,cap))} kPa</b>${a>=cap?' (capped)':''}.`); }
    else if (c.type==='I'){ const ch=chartI(c.K,c.LD); o.push(`K = <b>${v(c.K)}</b> on the horizontal (log) axis; L/D = <b>${v(c.LD)}</b>.`);
      o.push(ch.a===ch.b?`Go up from K to the L/D = ${ch.a} curve.`:`Go up from K to the two nearest curves, L/D = ${ch.a} (I = ${v(ch.Ia)}) and L/D = ${ch.b} (I = ${v(ch.Ib)}), then interpolate between them at L/D = ${v(c.LD)}.`);
      o.push(`Read <b>I = ${v(c.v)}</b>${n.course?'. The course solution\'s own reading is used.':'.'}`); }
    else if (c.type==='Rh'){ const ch=chartRh(c.hL,c.LD); o.push(`h/L = <b>${v(c.hL)}</b> on the horizontal axis; L/D = <b>${v(c.LD)}</b>.`);
      o.push(ch.a===ch.b?`Go up to the L/D = ${ch.a} curve.`:`Go up to the L/D = ${ch.a} (R<sub>h</sub> = ${v(ch.Ra)}) and L/D = ${ch.b} (R<sub>h</sub> = ${v(ch.Rb)}) curves, then interpolate at L/D = ${v(c.LD)}.`);
      o.push(`Read <b>R<sub>h</sub> = ${v(c.v)}</b>${n.course?'. The course solution\'s own reading is used.':'.'}`); }
    else if (c.type==='aF'){ o.push(`s/D = <b>${v(c.sD)}</b>, K = <b>${v(c.K)}</b>, L/D = <b>${v(c.LD)}</b>.`); o.push(`Go along the s/D axis to the curve for this L/D and K, then across to the vertical axis.`); o.push(`Read <b>α<sub>F</sub> = ${v(c.v)}</b>${n.course?'. The course solution\'s own reading is used.':'.'}`); }
    else if (c.type==='min'){ o.push(`Individual piles: <b>${v(c.a)} kN</b>; block: <b>${v(c.b)} kN</b>.`); o.push(`The smaller one governs: <b>${v(c.g)} kN</b>.`); }
  }
  if (n.branch) o.push(`Because ${n.branch}.`);
  if (n.rule && !c && !skipWork) o.push(`Working: ${n.rule}.`); else if (n.rule && c && c.type!=='alpha') o.push(`Working: ${n.rule}.`);
  if (!o.length && !skipWork) o.push('No chart or table: it is worked out directly from its inputs.');
  return o; }
function openChart(id){ const l=FM.leaf[id]; if (!l||!l.chart) return; const b=$q('#lb'); b.classList.add('on'); $q('#lbk').textContent='How it was found'; $q('#lbside').style.display='';
  $q('#lbtitle').innerHTML=`${l.name} <small>${labelOf(id)} = <b>${esc2(valOf(l))}</b></small>`;
  $q('#lbstage').innerHTML=`<div class="cbox big">${chartHTML(l.chart)}</div>`; $q('#lbhow').innerHTML=howSteps(l).map(x=>`<p>${x}</p>`).join('');
  LB.k=1; LB.x=0; LB.y=0; lbApply(); }
// the same viewer for a picture (a slide or a question page): wheel/pinch to zoom, drag to move; the side panel carries the text that goes with it
function openImage(id, side){ const m=MEDIA&&MEDIA.items[id]; if (!m) return; $q('#lb').classList.add('on'); $q('#lbk').textContent='How it is used here'; $q('#lbside').style.display=side?'':'none';
  $q('#lbtitle').innerHTML=`${esc2(m.from)} <small>${m.kind==='slide'?esc2(m.cap):''}</small>`;
  $q('#lbstage').innerHTML=`<div class="cbox big imgbox"><img src="${MEDIA.base+m.file}" alt="${esc2(m.cap)}"></div>`; $q('#lbhow').innerHTML=side||'';
  LB.k=1; LB.x=0; LB.y=0; lbApply(); }
const LB={k:1,x:0,y:0};
function lbApply(){ const st=$q('#lbstage .cbox'); if (st) st.style.transform=`translate(${LB.x}px,${LB.y}px) scale(${LB.k})`; }
function lbWire(){ const box=$q('#lbview'); let d=null; const ps=new Map(); let pd=null;
  box.addEventListener('wheel',e=>{ e.preventDefault(); const r=box.getBoundingClientRect(), f=Math.exp(-e.deltaY*0.0015), k=Math.min(12,Math.max(0.5,LB.k*f)), q=k/LB.k, cx=e.clientX-r.left-r.width/2, cy=e.clientY-r.top-r.height/2; LB.x=cx-(cx-LB.x)*q; LB.y=cy-(cy-LB.y)*q; LB.k=k; lbApply(); },{passive:false});
  box.addEventListener('pointerdown',e=>{ box.setPointerCapture(e.pointerId); ps.set(e.pointerId,{x:e.clientX,y:e.clientY}); if (ps.size===2){ const [a,b]=[...ps.values()]; pd=Math.hypot(a.x-b.x,a.y-b.y); } d={x:e.clientX,y:e.clientY,ox:LB.x,oy:LB.y}; });
  box.addEventListener('pointermove',e=>{ if (!ps.has(e.pointerId)) return; ps.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if (ps.size===2){ const [a,b]=[...ps.values()]; const n=Math.hypot(a.x-b.x,a.y-b.y); LB.k=Math.min(12,Math.max(0.5,LB.k*n/pd)); pd=n; lbApply(); return; }
    if (d){ LB.x=d.ox+e.clientX-d.x; LB.y=d.oy+e.clientY-d.y; lbApply(); } });
  const up=e=>{ ps.delete(e.pointerId); d=null; pd=null; }; box.addEventListener('pointerup',up); box.addEventListener('pointercancel',up);
  $q('#lb').addEventListener('click',e=>{ const a=e.target.closest('[data-lb]'); if (!a) return; const w=a.dataset.lb;
    if (w==='x'||e.target.id==='lb') $q('#lb').classList.remove('on'); else if (w==='in'){ LB.k=Math.min(12,LB.k*1.4); lbApply(); } else if (w==='out'){ LB.k=Math.max(0.5,LB.k/1.4); lbApply(); } else if (w==='reset'){ LB.k=1; LB.x=0; LB.y=0; lbApply(); } });
  document.addEventListener('keydown',e=>{ if (e.key==='Escape') $q('#lb').classList.remove('on'); }); }
function peekText(l){ const n=l.node; return [n.rule, n.branch && ('Because: '+n.branch), n.chart && 'chart: '+n.chart.type].filter(Boolean).join('  '); }
function peekHeight(l,w){ const t=peekText(l).replace(/<[^>]+>/g,''); return 18 + Math.ceil(t.length/(w/6.2))*15; }

// Layered layout that makes every wire flow left to right.
//  - each block sits one column to the right of everything that feeds it (cycle-safe)
//  - a wire that has to cross several columns gets its own lane (a dummy slot in every column it crosses),
//    so it passes between blocks instead of through them, and lanes take part in crossing minimisation
//  - rows are never wrapped back, so no wire ever has to run backwards
function layoutContainer(kids,cid){
  const sizes={}; kids.forEach(k=>{ sizes[k]=FM.groups[k]&&!FM.collapsed.has(k) ? layoutFrame(k) : itemSize(k); });
  const inK={}; kids.forEach(k=>{ (FM.groups[k]?FM.groups[k].ids:[k]).forEach(l=>inK[l]=k); });
  const succ={}, pred={}; kids.forEach(k=>{ succ[k]=[]; pred[k]=[]; });
  const seen=new Set();
  FM.edges.forEach(e=>{ const a=inK[e.s], b=inK[e.d]; if (!a||!b||a===b) return; const key=a+'>'+b; if (seen.has(key)) return; seen.add(key); succ[a].push(b); pred[b].push(a); });
  // columns: longest path from the left, ignoring any back edge
  const layer={}, stt={};
  const lv=k=>{ if (stt[k]===2) return layer[k]; if (stt[k]===1) return -1; stt[k]=1; let l=0; pred[k].forEach(p=>{ const v=lv(p); if (v>=0) l=Math.max(l,v+1); }); stt[k]=2; return layer[k]=l; };
  kids.forEach(lv);
  kids.forEach(k=>{ if (!pred[k].length && succ[k].length) layer[k]=Math.min(...succ[k].map(s=>layer[s]))-1; });   // an input waits next to its first user
  const mn=Math.min(0,...kids.map(k=>layer[k])); kids.forEach(k=>layer[k]-=mn);
  const nl=Math.max(0,...kids.map(k=>layer[k]))+1; const cols=Array.from({length:nl},()=>[]); kids.forEach(k=>cols[layer[k]].push(k));
  // lanes: one chain of dummy slots per (source block, destination block) that spans more than one column
  const isD=k=>k[0]==='~', chains={}, longPair=new Set();
  FM.edges.forEach(e=>{ const a=inK[e.s], b=inK[e.d]; if (!a||!b||a===b||layer[b]-layer[a]<2) return;
    longPair.add(a+'>'+b); const key=e.s+'>'+b; if (chains[key]) return; const ids=[];
    for(let L=layer[a]+1; L<layer[b]; L++){ const id='~'+key+'~'+L; ids.push(id); sizes[id]={w:0,h:10,rw:0}; layer[id]=L; cols[L].push(id); pred[id]=[]; succ[id]=[]; }
    chains[key]={ids,a,b}; });
  longPair.forEach(pr=>{ const [a,b]=pr.split('>'); succ[a]=succ[a].filter(x=>x!==b); pred[b]=pred[b].filter(x=>x!==a); });
  Object.values(chains).forEach(c=>{ const seq=[c.a,...c.ids,c.b]; for(let i=0;i<seq.length-1;i++){ succ[seq[i]].push(seq[i+1]); pred[seq[i+1]].push(seq[i]); } });
  // vertical order: barycentre sweeps, lanes included
  const cy={};
  const gapAfter=(a,b)=> (isD(a)||isD(b)) ? 12 : 30;
  const stack=col=>{ let y=0; col.forEach((k,i)=>{ cy[k]=y+sizes[k].h/2; y+=sizes[k].h+(col[i+1]?gapAfter(k,col[i+1]):30); }); };
  const place=(col,want)=>{ col.sort((a,b)=>want(a)-want(b)); let y=0; col.forEach((k,i)=>{ const h=sizes[k].h; const t=Math.max(want(k)-h/2, y); cy[k]=t+h/2; y=t+h+(col[i+1]?gapAfter(k,col[i+1]):30); }); };
  cols.forEach(stack);
  const mean=(ns,d)=>ns.length? ns.reduce((s,n)=>s+cy[n],0)/ns.length : d;
  for(let it=0; it<16; it++){
    for(let i=1;i<nl;i++) place(cols[i], k=>mean(pred[k].filter(p=>layer[p]<layer[k]), cy[k]));
    for(let i=nl-2;i>=0;i--) place(cols[i], k=>mean(succ[k].filter(s=>layer[s]>layer[k]), cy[k]));
  }
  for(let it=0; it<3; it++) for(let i=0;i<nl;i++) place(cols[i], k=>mean([...pred[k],...succ[k]].filter(n=>layer[n]!==layer[k]), cy[k]));
  // x: columns left to right, never wrapped
  const colW=cols.map(col=>{ const real=col.filter(k=>!isD(k)); return real.length ? Math.max(...real.map(k=>sizes[k].w+(sizes[k].rw||0))) : 16; });
  const colX=[]; let x=0; cols.forEach((c,i)=>{ colX[i]=x; x+=colW[i]+70; });
  let top=Infinity, bot=-Infinity; cols.forEach(col=>col.forEach(k=>{ top=Math.min(top,cy[k]-sizes[k].h/2); bot=Math.max(bot,cy[k]+sizes[k].h/2); }));
  if (!isFinite(top)){ top=0; bot=0; }
  const pos={}; cols.forEach((col,i)=>col.forEach(k=>{ pos[k]={x:colX[i], y:cy[k]-sizes[k].h/2-top}; }));
  const lanes={}; Object.entries(chains).forEach(([key,c])=>{ lanes[key]=c.ids.map(id=>({x0:colX[layer[id]], x1:colX[layer[id]]+colW[layer[id]], y:pos[id].y+5})); });
  FM.lanes[cid]=lanes;
  return {kids, pos, sizes, w:Math.max(0,x-70), h:Math.max(0,bot-top)};
}
function layoutFrame(id){ const inner=layoutContainer(kidsOf(id),id); FM.frames[id]=inner; return {w:inner.w+36, h:inner.h+HH+22+14, frame:true, rw:0}; }

function layoutAll(){
  FM.frames={}; FM.lanes={}; computeVisible();
  const root=layoutContainer(kidsOf(null),'root'); FM.root=root;
  const abs={};
  const rec=(c,ox,oy,anc)=>{ c.kids.forEach(k=>{ const p=c.pos[k], s=c.sizes[k]; const x=ox+p.x, y=oy+p.y;
      abs[k]={id:k, bx:x, by:y, w:s.w, h:s.h, rw:s.rw||0, anc:anc.slice(), frame:!!s.frame};
      if (s.frame) rec(FM.frames[k], x+18, y+HH+14, [...anc,k]); }); };
  rec(root,0,0,[]); FM.LAY=abs;
  const yOf=src=>{ const r=FM.vis.rep[src], a=abs[r]; return a? a.by+a.h/2 : 0; };
  Object.values(FM.vis.items).forEach(it=>{ it.ins.sort((a,b)=>yOf(a.split('|')[0])-yOf(b.split('|')[0])); });
}
function absPos(id){ const a=FM.LAY[id]; let x=a.bx+(FM.off[id]?FM.off[id][0]:0), y=a.by+(FM.off[id]?FM.off[id][1]:0);
  a.anc.forEach(g=>{ const o=FM.off[g]; if (o){ x+=o[0]; y+=o[1]; } }); return {x,y,w:a.w,h:a.h,rw:a.rw}; }

// ---------- group frames: drawn around their members, like a Grasshopper Group ----------
function frameRects(){ const R={}, PL=18, PR=18, PT=HH+14, PB=22;
  const rec=g=>{ let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
    FM.leaves.filter(l=>l.grp===g).forEach(l=>{ if(!FM.LAY[l.id]) return; const p=absPos(l.id); x0=Math.min(x0,p.x); y0=Math.min(y0,p.y); x1=Math.max(x1,p.x+p.w+p.rw); y1=Math.max(y1,p.y+p.h); });
    Object.values(FM.groups).filter(c=>c.parent===g).forEach(c=>{ const r=rec(c.id); if (r){ x0=Math.min(x0,r.x); y0=Math.min(y0,r.y); x1=Math.max(x1,r.x+r.w); y1=Math.max(y1,r.y+r.h); } });
    if (!isFinite(x0)) return null; return R[g]={x:x0-PL, y:y0-PT, w:x1-x0+PL+PR, h:y1-y0+PT+PB}; };
  Object.values(FM.groups).filter(g=>!g.parent).forEach(g=>rec(g.id)); return R; }

// ---------- ports ----------
function portPos(item, side, key){ const p=absPos(item), it=FM.vis.items[item];
  if (side==='out') return {x:p.x+p.w+p.rw, y:p.y+p.h/2};
  const n=Math.max(1,it.ins.length), i=Math.max(0,it.ins.indexOf(key)); return {x:p.x, y:p.y+p.h*(i+1)/(n+1)}; }

// ---------- the logo system ----------
// FUNCTIONS are small squares; the logo says what KIND of operation it is (colour = family, glyph = operation).
// VALUES are small pills; the colour says what physical quantity the number IS (its dimension), the chip is its symbol.
const SV=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
// One icon family: 24px grid, 2px round strokes (Lucide's rules), white on a gradient tile. Each says WHAT the operation accomplishes
// (like Blender's node icons) and is drawn bold enough to stay distinct at small size.
const ICON={
  soil:   SV('<path d="M3 6c3-2 6-2 9 0s6 2 9 0"/><path d="M3 12c3-2 6-2 9 0s6 2 9 0"/><path d="M3 18c3-2 6-2 9 0s6 2 9 0"/>'),                       // ground strata
  lookup: SV('<path d="M4 4v16h16"/><path d="M7 16c3-1 4-8 8-9s3 0 5-1"/><circle cx="14.5" cy="8.6" r="1.7" fill="currentColor" stroke="none"/><path d="M14.5 10.6V20" stroke-dasharray="1.6 2.6" stroke-width="1.6"/>'), // curve + reading point
  geo:    SV('<path d="M4 4v16h16z"/><path d="M4 15h5v5"/>'),                                                                                          // set square with right angle
  calc:   SV('<path d="M15 4.5c-2.2-.9-4.5.2-4.5 3.3V19c0 1.7-.9 2.4-2.6 2"/><path d="M6.5 11.5h8.5"/>'),                                          // f of x
  mul:    SV('<path d="M6 6l12 12M18 6L6 18"/>'),
  div:    SV('<path d="M5 12h14"/><circle cx="12" cy="5.8" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="18.2" r="1.5" fill="currentColor" stroke="none"/>'),
  plus:   SV('<path d="M12 5v14M5 12h14"/>'),
  sum:    SV('<path d="M18 5.5H6.5l6.2 6.5-6.2 6.5H18"/>'),
  min:    SV('<path d="M12 4v11"/><path d="M7.5 11 12 15.5 16.5 11"/><path d="M5 20h14"/>'),                                                              // down to the lower bar
  conv:   SV('<path d="M4 8h14.5M15 4.5 18.5 8 15 11.5"/><path d="M20 16H5.5M9 12.5 5.5 16 9 19.5"/>'),
  count:  SV('<path d="M5 9h14M5 15h14M9.5 4 8 20M16 4l-1.5 16"/>'),
  dec:    SV('<path d="M12 20v-8"/><path d="M12 12 6.5 6.5M12 12l5.5-5.5"/><path d="M6.5 10.5v-4h4M17.5 10.5v-4h-4"/>') };                              // one road in, two out
function fnKind(l){ const n=l.node, t=plainT(n.name).toLowerCase();
  if (l.type==='gate') return {fam:'dec', glyph:ICON.dec, name:'Decision'};
  if (n.vtype==='chart') return {fam:'lookup', glyph:ICON.lookup, name:'Chart look-up'};
  if (/average|at the tip/.test(t)) return {fam:'soil', glyph:ICON.soil, name:'Read the soil profile'};
  if (/convert/.test(t)) return {fam:'conv', glyph:ICON.conv, name:'Convert units'};
  if (/count the piles/.test(t)) return {fam:'conv', glyph:ICON.count, name:'Count'};
  if (/perimeter|area|block size|distance|ring radius|double the radius/.test(t)) return {fam:'geo', glyph:ICON.geo, name:'Geometry'};
  if (/smaller|weaker|governs/.test(t)) return {fam:'agg', glyph:ICON.min, name:'Take the smaller'};
  if (/^add up/.test(t)) return {fam:'agg', glyph:ICON.sum, name:'Add up'};
  if (/^add/.test(t)) return {fam:'agg', glyph:ICON.plus, name:'Add'};
  if (/^multiply/.test(t)) return {fam:'calc', glyph:ICON.mul, name:'Multiply'};
  if (/divide/.test(t)) return {fam:'calc', glyph:ICON.div, name:'Divide'};
  return {fam:'calc', glyph:ICON.calc, name:'Equation'}; }
const DIMS={'m':['len','length'],'m²':['area','area'],'kN':['force','force'],'kPa':['stress','stress'],'MPa':['stress','stress'],'GPa':['stress','stress'],'mm':['disp','settlement'],'°':['ang','angle'],'%':['ratio','efficiency'],'piles':['count','count of piles'],'blows':['count','SPT blows'],'m/kN':['flex','flexibility'],'kN/m':['stiff','stiffness']};
const dimOf=u=>{ const d=DIMS[u||'']; return d?{c:'d-'+d[0],n:d[1]}:{c:'d-ratio',n:u?u:'factor / ratio'}; };
const symOf=l=>String((l.type==='func'&&l.out)?l.out.name:l.name).split(',')[0];

function labelOf(leafId){ const l=FM.leaf[leafId]; return l.type==='func' && l.out ? l.out.name : l.name; }
const masked=l=>FM.practice && (l.type==='func'||l.type==='gate') && !FM.known.has(l.id);
function valOf(l){ if (masked(l)) return '?'; const s=stOf(l.id); if (s==='off') return 'off'; if (s==='starved') return '—'; const o=l.out; if (!o) return ''; return fmt(o.val)+(o.unit?' '+o.unit:''); }
function vtext(l){ if (masked(l)) return '?'; const s=stOf(l.id); if (s==='off') return 'off'; if (s==='starved') return '—'; const o=l.out; return o ? (typeof o.val==='number'?fmt(o.val):String(o.val)) : ''; }
function unitOf(l){ return !masked(l) && stOf(l.id)==='ok' && l.out ? (l.out.unit||'') : ''; }
function pillInner(l){ return `<span class="sy">${symOf(l)}</span><span class="vv">${esc2(vtext(l))}</span><span class="un">${esc2(unitOf(l))}</span>`; }
function rbHTML(leafId,item){ const l=FM.leaf[leafId], s=stOf(leafId);
  if (l.type==='gate'){ const ok=s==='ok', y=l.node.val; return `<div class="rb val flag gate ${s}" data-id="${leafId}" data-item="${item}" title="${ok?esc2(plainT(y?l.node.yes:l.node.no)):''}"><span class="sy">${masked(l)?'?':ok?(y?'✓':'✗'):'·'}</span><span class="vv">${masked(l)?'?':ok?(y?'yes':'no'):(s==='off'?'off':'—')}</span></div>`; }
  const d=dimOf(l.out&&l.out.unit);
  return `<div class="rb val ${d.c} ${s}${l.goal?' goal':''}" data-id="${leafId}" data-item="${item}">${pillInner(l)}</div>`; }
function logoHTML(l){ if (l.type==='func'||l.type==='gate'){ const k=fnKind(l); return `<span class="lgo fam-${k.fam}">${k.glyph}</span>`; }
  const d=dimOf(l.out&&l.out.unit); return `<span class="lgo val ${d.c}">${symOf(l)}</span>`; }

function html(){
  const parts=[], frames=[], rbs=[];
  const litState=litSets();
  const cls=id=>{ if (!litState) return ''; const ls=leavesIn(id); if (ls.some(x=>litState.seed.has(x))) return ' sel'; if (ls.some(x=>litState.up.has(x))) return ' up'; if (ls.some(x=>litState.down.has(x))) return ' down'; return ' dim'; };
  Object.values(FM.groups).forEach(g=>{ frames.push(`<div class="frame ${g.kind}${cls(g.id)}" data-id="${g.id}" data-item="${g.id}"><div class="fh"><span class="t">${esc2(g.title)}</span></div></div>`); });
  FM.leaves.forEach(l=>{ const id=l.id, a=FM.LAY[id], s=stOf(id), open=FM.open.has(id)?' open':'';
    if (l.type==='func'||l.type==='gate'){ const k=fnKind(l);
      parts.push(`<div class="it fn fam-${k.fam} ${l.type}${l.goal?' goal':''} ${s}${open}${cls(id)}" data-id="${id}" data-item="${id}" style="width:${a.w}px;height:${a.h}px" title="${esc2(k.name)}: ${esc2(plainT(l.type==='gate'?(l.node.test||l.name):l.name))}"><span class="lg">${k.glyph}</span><span class="cap">${l.type==='gate'?(l.node.test||'decision'):l.name}</span></div>`);
      rbs.push(rbHTML(id,id)); }
    else { const d=dimOf(l.out&&l.out.unit);
      parts.push(`<div class="it val ${d.c} ${l.type} ${s}${open}${cls(id)}" data-id="${id}" data-item="${id}" style="width:${a.w}px;height:${a.h}px" title="${esc2(plainT(l.name))}${typeof noteTitle==='function'?esc2(noteTitle(l)):''}">${pillInner(l)}</div>`); } });
  return frames.join('')+'<svg class="wires" width="1" height="1"><defs><marker id="ar" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="var(--line)"/></marker></defs><g id="wg"></g></svg>'+parts.join('')+rbs.join('');
}

// ---------- pop-up: the full content of one block, a proper dialog ----------
function sensHTML(l){ if (ENG!==ENGINES.decl || l.type!=='input' || typeof l.out.val!=='number' || !l.out.val) return ''; const def=DECL[presetKey], g=def.nodes.find(n=>n.goal); if (!g) return '';
  try{ const id=l.node.id, a=evalDecl(def,S.vals).v[g.id], b=evalDecl(def,{...S.vals,[id]:S.vals[id]*1.1}).v[g.id]; if (!isFinite(a)||!isFinite(b)) return ''; const pct=(b/a-1)*100;
    return `<section><h5>Effect on the answer</h5><p>${Math.abs(pct)<0.005?`A 10 % change in ${l.name} <b>does not change</b> ${g.sym}. It is given but not needed here.`:`A 10 % increase in ${l.name} moves ${g.sym} by <b>${pct>0?'+':''}${fmt(pct)} %</b>.`}</p></section>`; }catch(e){ return ''; } }
function practiceHTML(l){ const id=l.id; if (l.type==='gate') return `<section class="pr"><h5>Your answer</h5><div class="pbtn"><button data-act="chkg" data-id="${id}" data-v="1">Yes</button><button data-act="chkg" data-id="${id}" data-v="0">No</button><button class="ghostb" data-act="rev" data-id="${id}">Reveal</button></div></section>`;
  return `<section class="pr"><h5>Your answer${l.out&&l.out.unit?' ('+esc2(l.out.unit)+')':''}</h5><div class="pbtn"><input id="myans" type="text" inputmode="decimal" placeholder="your value" data-id="${id}"><button data-act="chk" data-id="${id}">Check</button><button class="ghostb" data-act="rev" data-id="${id}">Reveal</button></div><p class="m">Within 3 % counts as right: course answers are rounded.</p></section>`; }
function popHTML(l){ const id=l.id, n=l.node, s=stOf(id), ins=FM.edges.filter(e=>e.d===id), outs=FM.edges.filter(e=>e.s===id), mk=masked(l);
  const fk=(l.type==='func'||l.type==='gate')?fnKind(l):null, dm=l.out?dimOf(l.out.unit):null;
  const kind=fk?fk.name:(l.type==='input'?'Given in the question':'Fixed by a rule');
  const eq=eqParts(l); let b='';
  if (s!=='ok') b+=`<p class="warnp">${s==='off'?'Switched off: it returns nothing.':'No result: an input is unplugged, or comes from something with no result.'}</p>`;
  if (mk) b+=practiceHTML(l);
  if (l.type==='func'){
    if (eq) b+=`<section><h5>Equation${eq.tag?' · '+esc2(eq.tag):''}</h5><div class="meq fam-${fk.fam}"><div class="e1">${eq.sym}</div>${eq.num&&!mk?`<div class="e2">= ${eq.num}</div>`:''}<div class="e3">= ${mk?'?':esc2(valOf(l))}<span>${dm.n}</span></div></div></section>`;
    else b+=`<section><h5>Result</h5><p class="res">${l.out.name} = <b>${esc2(valOf(l))}</b><span class="dm">${dm.n}</span></p></section>`; }
  if (l.type==='gate') b+=`<section><h5>Decision</h5><p class="res">${mk?'?':s==='ok'?'<b>'+(n.val?'Yes':'No')+'</b> · '+(n.val?n.yes:n.no):'—'}</p>${n.info?`<p class="m">${n.info}</p>`:''}<p class="m">The other branch: ${n.val?n.no:n.yes}</p></section>`;
  if (l.type==='input'||l.type==='const'){ b+=`<section><h5>Value</h5><p class="res">${l.name} = <b>${esc2(valOf(l))}</b><span class="dm">${dm.n}</span></p>${l.out.info?`<p class="m">${l.out.info}</p>`:''}`;
    const ed=l.type==='input' && l.out.path && typeof l.out.val==='number' && get(l.out.path)===l.out.val;
    if (ed) b+=`<label class="ed">Use my own value<input id="own" type="number" step="any" value="${l.out.val}" data-path="${l.out.path}"><span>${l.out.unit||''}</span></label><button class="ghostb" data-act="reset" data-id="${id}">Back to the question's value</button>`;
    b+='</section>'+sensHTML(l); }
  if (ins.length) b+=`<section><h5>Takes</h5><div class="chips">${ins.map(e=>chip(e.s)+(FM.cut.has(ekey(e))?'<span class="ct">unplugged</span>':'')).join('')}</div></section>`;
  if (l.type==='func' && !mk && (l.chart || howSteps(l,!!eq).length)) b+=`<section><h5>How it was found</h5>${l.chart?`<div class="cbox" data-act="zoomchart" data-id="${id}" title="Click to enlarge and zoom">${chartHTML(l.chart)}<span class="zm">⤢</span></div>`:''}<div class="how">${howSteps(l,!!eq).map(x=>`<p>${x}</p>`).join('')}</div></section>`;
  if (typeof noteHTML==='function') b+=noteHTML(l);
  b+=`<section><h5>Feeds</h5><div class="chips">${outs.map(e=>chip(e.d)).join('')||'<i>nothing: it is the end</i>'}</div></section>`;
  return `<header class="mh">${logoHTML(l)}<div class="mt"><div class="mk">${kind}</div><div class="mn">${l.type==='gate'?(n.test||l.name):l.name}</div></div><button class="mx" data-act="popx" data-id="${id}" title="Close (Esc)">×</button></header>
    <div class="mb" id="modbody">${b}</div>
    <footer class="mf">${(l.type==='func'||l.type==='gate')?`<button data-act="pow" data-id="${id}">⏻ Switch ${FM.dis.has(id)?'on':'off'}</button>`:''}<span class="sp"></span><button class="pri" data-act="popx" data-id="${id}">Close</button></footer>`; }
function renderPops(){ const wrap=$q('#mod'), box=$q('#modwin'); if (!wrap) return; const id=[...FM.open].slice(-1)[0];
  if (!id || !FM.leaf[id]){ wrap.classList.remove('on'); box.innerHTML=''; FM._modId=null; return; }
  const sc=(FM._modId===id && $q('#modbody')) ? $q('#modbody').scrollTop : 0; box.innerHTML=popHTML(FM.leaf[id]); wrap.classList.add('on'); FM._modId=id; const mb=$q('#modbody'); if (mb) mb.scrollTop=sc; placeMod(); }
function placeMod(){ const w=$q('#modwin'); if (!w||!$q('#mod').classList.contains('on')) return; if (!FM.modPos) FM.modPos=lsGet('modpos',null);
  const ww=w.offsetWidth||560, p=FM.modPos||{x:Math.max(12,innerWidth-ww-24),y:84}; p.x=Math.min(Math.max(120-ww,p.x),innerWidth-120); p.y=Math.min(Math.max(0,p.y),innerHeight-48); w.style.left=p.x+'px'; w.style.top=p.y+'px'; }
function placePops(){ }
function panAbove(id){ const p=rectOf(id), r=FM.view.getBoundingClientRect(), kk=Math.max(FM.vp.k,0.8); animateTo({k:kk, x:r.width/2-(p.x+p.w/2)*kk, y:r.height*0.5-(p.y+p.h/2)*kk}); }
function toggleOpen(id){ if (FM.open.has(id)) FM.open.clear(); else FM.open=new Set([id]); renderPops(); }
function closePops(){ if (FM.open.size){ FM.open.clear(); renderPops(); } }
// ---------- jump between steps (subtle) ----------
const stepOrder=()=>Object.values(FM.groups).sort((a,b)=>Math.min(...a.ids.map(i=>FM.order[i]))-Math.min(...b.ids.map(i=>FM.order[i])));
const stepsSeq=()=>stepOrder().filter(g=>g.kind==='step');
function curStepId(){ const seq=stepsSeq(); if (!seq.length||!FM.fr) return null; const v=FM.view.getBoundingClientRect(), k=FM.vp.k, cx=(v.width/2-FM.vp.x)/k, cy=(v.height/2-FM.vp.y)/k; let best=null, bd=Infinity;
  seq.forEach(g=>{ const r=FM.fr[g.id]; if (!r) return; const d=Math.hypot(Math.max(r.x-cx,0,cx-(r.x+r.w)), Math.max(r.y-cy,0,cy-(r.y+r.h))); if (d<bd){ bd=d; best=g.id; } }); return best; }
function updateJump(){ const el=$q('#jcur'); if (!el) return; const id=curStepId(); if (id===FM.jcur) return; FM.jcur=id; const seq=stepsSeq(), i=seq.findIndex(g=>g.id===id);
  el.innerHTML=id?`<small>${i+1}/${seq.length}</small> ${esc2(FM.groups[id].title)}`:'Steps'; document.querySelectorAll('#jmenu button').forEach(b=>b.classList.toggle('cur',b.dataset.id===id)); }
function renderJump(){ const m=$q('#jmenu'); if (!m) return; const all=stepOrder(); let h='';
  all.filter(g=>!g.parent).forEach(g=>{ if (g.kind==='stage'){ h+=`<div class="st">${esc2(g.title)}</div>`+all.filter(c=>c.parent===g.id).map(c=>`<button data-act="jto" data-id="${c.id}">${esc2(c.title)}</button>`).join(''); } else h+=`<button data-act="jto" data-id="${g.id}">${esc2(g.title)}</button>`; });
  m.innerHTML=h; FM.jcur=undefined; updateJump(); }
function jumpTo(id){ $q('#jmenu').classList.remove('on'); const r=FM.fr&&FM.fr[id]; if (r) fitRectOf(r,1,60); }
// a problem opens showing the whole map; on a phone that is too small to read, so it opens on the first step instead (the step bar walks on from there)
function firstView(){ const seq=stepsSeq(); if (typeof isPhone==='function'&&isPhone()&&seq.length&&FM.fr&&FM.fr[seq[0].id]) jumpTo(seq[0].id); else fit(false); }
function jumpStep(d){ const seq=stepsSeq(); if (!seq.length) return; let i=seq.findIndex(g=>g.id===FM.jcur); i=i<0?0:Math.min(seq.length-1,Math.max(0,i+d)); jumpTo(seq[i].id); }
function renderKey(){ const GL={soil:ICON.soil,lookup:ICON.lookup,geo:ICON.geo,calc:ICON.calc,agg:ICON.sum,conv:ICON.conv,dec:ICON.dec};
  const F=[['soil','Read the soil profile','average, value at depth'],['lookup','Chart or table look-up','α, N<sub>c</sub>, I, R<sub>h</sub>'],['geo','Geometry','perimeter, area, block size'],['calc','Equation','×, ÷, f<sub>s</sub> = α·c<sub>u</sub>'],['agg','Add up, take the smaller','Σ, min'],['conv','Convert or count','kPa ⇄ MPa, number of piles'],['dec','Decision','yes / no gate']];
  const D=[['len','length','m'],['area','area','m²'],['force','force','kN'],['stress','stress, strength','kPa MPa GPa'],['disp','settlement','mm'],['count','count','piles, blows'],['ratio','factor or ratio','α, η, N<sub>c</sub>, %'],['flex','flexibility','m/kN'],['stiff','stiffness','kN/m']];
  $q('#key').innerHTML=`<div class="cols"><div><h4>Functions: the logo says what it does</h4>${F.map(([f,n,e])=>`<div class="row"><span class="lgo fam-${f}">${GL[f]}</span><span><b>${n}</b><br><small>${e}</small></span></div>`).join('')}</div>
    <div><h4>Values: the colour says what it is</h4>${D.map(([c,n,e])=>`<div class="row"><span class="lgo val d-${c}">x</span><span><b>${n}</b><br><small>${e}</small></span></div>`).join('')}
    <div class="row"><span class="val input d-ratio" style="width:38px;height:22px;border-radius:11px"></span><span><b>purple halo</b> = given in the question</span></div>
    <div class="row"><span class="val const d-ratio" style="width:38px;height:22px;border-radius:11px"></span><span><b>dashed</b> = fixed by a rule</span></div>
    <div class="row"><span class="val goal d-ratio" style="width:38px;height:22px;border-radius:11px"></span><span><b>dark</b> = the final result</span></div></div></div><p style="margin:8px 0 0;color:var(--mut)">Click any block to open it. Click empty canvas to close.</p>`; }
function litSets(){ const seeds=FM.multi.size?[...FM.multi]:(FM.sel?leavesIn(FM.sel):(FM.focus&&FM.focus.size?[...FM.focus]:null)); if (!seeds) return null; const up=new Set(), down=new Set();
  seeds.forEach(s=>{ FM.up[s].forEach(x=>up.add(x)); FM.down[s].forEach(x=>down.add(x)); }); const seed=new Set(seeds); seeds.forEach(s=>{ up.delete(s); down.delete(s); });
  return {seed, up, down}; }

function wirePath(a,b){ const dx=b.x-a.x; const h=dx>0 ? Math.max(40,dx*0.5) : Math.max(70,-dx*0.4+40);
  return `M${a.x},${a.y} C${a.x+h},${a.y} ${b.x-h},${b.y} ${b.x},${b.y}`; }
// the chain of groups a leaf sits in, outermost first
function groupChain(id){ const ch=[]; for(let g=FM.leaf[id].grp; g; g=FM.groups[g].parent) ch.unshift(g); return ch; }
// lane waypoints a long wire follows between the columns (see layoutContainer), in canvas coordinates
function lanePts(s,d){ const A=groupChain(s), B=groupChain(d); let i=0; while(i<A.length && i<B.length && A[i]===B[i]) i++;
  const cont=i?A[i-1]:'root', kb=B[i]||d; const L=FM.lanes[cont], lane=L&&L[s+'>'+kb]; if (!lane) return null;
  let ox=0, oy=0; if (cont!=='root'){ if (!FM.LAY[cont]) return null; const p=absPos(cont); ox=p.x+18; oy=p.y+HH+14; }
  return lane.map(q=>({x0:ox+q.x0, x1:ox+q.x1, y:oy+q.y})); }
// smooth wire that leaves its pin to the right, rides its lane across the columns, and arrives from the left
function wireD(a,b,lane){ if (!lane||!lane.length||b.x<=a.x) return wirePath(a,b);
  let d=`M${a.x},${a.y}`, px=a.x, py=a.y;
  lane.forEach(q=>{ const h=Math.max(22,(q.x0-px)*0.5); d+=` C${px+h},${py} ${q.x0-h},${q.y} ${q.x0},${q.y} L${q.x1},${q.y}`; px=q.x1; py=q.y; });
  const h=Math.max(22,(b.x-px)*0.5); return d+` C${px+h},${py} ${b.x-h},${b.y} ${b.x},${b.y}`; }
function drawWires(){
  const g=$q('#wg',FM.world); if (!g) return; const lit=litSets(); let s='', hits='';
  FM.vis.wires.forEach((w,i)=>{ const a=portPos(w.rs,'out',w.s), b=portPos(w.rd,'in',w.s+'|'+w.kind); const d=wireD(a,b,lanePts(w.s,w.rd));
    let c=w.kind+(w.state==='cut'?' cut':w.state==='part'?' part':'');
    if (lit){ const A=new Set([...lit.up,...lit.seed]), B=new Set([...lit.down,...lit.seed]);
      const up=w.pairs.some(([x,y])=>A.has(x)&&A.has(y)), dn=w.pairs.some(([x,y])=>B.has(x)&&B.has(y)); c+= up ? ' up' : dn ? ' down' : ' dim'; }
    s+=`<path class="w ${c}" data-rs="${w.rs}" data-rd="${w.rd}" d="${d}"/>`; hits+=`<path class="hit" data-wire="${i}" d="${d}"/>`; });
  // short link from each function/group card to its result block
  Object.keys(FM.vis.items).forEach(id=>{ if (!FM.LAY[id]||!hasRC(id)) return; const it=FM.vis.items[id], p=absPos(id);
    it.outs.forEach(o=>{ const y=p.y+p.h/2; s+=`<path class="w mk ${stOf(o)!=='ok'?'dead':''}" d="M${p.x+p.w},${y} L${p.x+p.w+GAP},${y}" marker-end="url(#ar)"/>`; }); });
  g.innerHTML=s+hits;
}
function applyPositions(){
  FM.fr=frameRects(); FM.world.querySelectorAll('.frame').forEach(e=>{ const r=FM.fr[e.dataset.id]; if (r){ e.style.left=r.x+'px'; e.style.top=r.y+'px'; e.style.width=r.w+'px'; e.style.height=r.h+'px'; } });
  FM.world.querySelectorAll('.it,.rb').forEach(e=>{ const id=e.dataset.item||e.dataset.id; if (!FM.LAY[id]) return; const p=absPos(id);
    if (e.classList.contains('rb')){ e.style.left=(p.x+p.w+GAP)+'px'; e.style.top=(p.y+p.h/2-RBH/2)+'px'; }
    else { e.style.left=p.x+'px'; e.style.top=p.y+'px'; } });
  FM.world.querySelectorAll('.pin').forEach(e=>e.remove());
  drawWires(); drawPins(); drawMini(); placePops();
}
function drawPins(){ const V=FM.vis; let s='';
  Object.keys(V.items).forEach(id=>{ if (!FM.LAY[id]) return; const it=V.items[id];
    it.ins.forEach(k=>{ const [src,kind]=k.split('|'); const w=V.wires.find(w=>w.rd===id&&w.s===src&&w.kind===kind); const cut=w&&w.state!=='live'; const q=portPos(id,'in',k);
      s+=`<i class="pin in ${kind}${cut?' open':''}" data-pin="in" data-item="${id}" data-key="${k}" style="left:${q.x}px;top:${q.y}px"></i>`; });
    it.outs.forEach(k=>{ const q=portPos(id,'out',k); s+=`<i class="pin out" data-pin="out" data-src="${k}" style="left:${q.x}px;top:${q.y}px"></i>`; }); });
  FM.world.insertAdjacentHTML('beforeend', s);
}

// ---------- render ----------
function render(keepView){
  evalStatus(); layoutAll(); FM.world.innerHTML=html(); applyPositions(); applyVP();
  if (FM._fit && !keepView && FM.view.clientWidth>0){ FM._fit=false; firstView(); }
  renderInspector(); renderTop(); renderPops(); renderJump(); if (typeof renderCompanion==='function') renderCompanion(); if (typeof renderBoard==='function') renderBoard();
}
function applyVP(){ const v=FM.vp; FM.world.style.transform=`translate(${v.x}px,${v.y}px) scale(${v.k})`;
  updateJump(); FM.view.classList.toggle('far', v.k<0.5); FM.view.classList.toggle('near', v.k>=0.4); FM.view.style.setProperty('--lab', Math.max(12,11/v.k)+'px'); placePops(); 
  FM.view.style.backgroundSize=`${24*v.k}px ${24*v.k}px`; FM.view.style.backgroundPosition=`${v.x}px ${v.y}px`; drawMini(); $q('#zl').textContent=Math.round(v.k*100)+'%'; }
function bounds(){ let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity; const add=(x,y,w,h)=>{ x0=Math.min(x0,x); y0=Math.min(y0,y); x1=Math.max(x1,x+w); y1=Math.max(y1,y+h); };
  FM.leaves.forEach(l=>{ if (FM.LAY[l.id]){ const p=absPos(l.id); add(p.x,p.y,p.w+p.rw,p.h); } }); Object.values(FM.fr||{}).forEach(r=>add(r.x,r.y,r.w,r.h)); return {x0,y0,x1,y1}; }
const rectOf = id => FM.groups[id] ? FM.fr[id] : (()=>{ const p=absPos(id); return {x:p.x,y:p.y,w:p.w+p.rw,h:p.h}; })();
let anim=0;
function animateTo(t,ms=350,ease='io'){ const f={...FM.vp}, t0=performance.now(); cancelAnimationFrame(anim); FM.tvp=t;
  const step=now=>{ const u=Math.min(1,(now-t0)/ms), e=ease==='out'?1-Math.pow(1-u,3):(u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2); FM.vp={x:f.x+(t.x-f.x)*e, y:f.y+(t.y-f.y)*e, k:f.k+(t.k-f.k)*e}; applyVP(); if (u<1) anim=requestAnimationFrame(step); else FM.tvp=null; }; anim=requestAnimationFrame(step); }
function stopMotion(){ cancelAnimationFrame(anim); FM.tvp=null; }
function glide(vx,vy){ stopMotion(); let last=performance.now(); const step=now=>{ const dt=Math.min(40,now-last); last=now; FM.vp.x+=vx*dt; FM.vp.y+=vy*dt; const f=Math.pow(0.02,dt/1000); vx*=f; vy*=f; applyVP(); if (Math.hypot(vx,vy)>0.03) anim=requestAnimationFrame(step); }; anim=requestAnimationFrame(step); }
function fit(animate=true, pad=50){ const b=bounds(), r=FM.view.getBoundingClientRect(); if (!isFinite(b.x0)) return;
  const k=Math.min(1.2, Math.max(0.1, Math.min((r.width-2*pad)/(b.x1-b.x0), (r.height-2*pad)/(b.y1-b.y0))));
  const t={k, x:(r.width-(b.x1-b.x0)*k)/2-b.x0*k, y:(r.height-(b.y1-b.y0)*k)/2-b.y0*k}; if (animate) animateTo(t); else { FM.vp=t; applyVP(); } }
function centerOn(id,k){ const p=rectOf(id), r=FM.view.getBoundingClientRect(); const kk=k||Math.max(FM.vp.k,0.8);
  animateTo({k:kk, x:r.width/2-(p.x+p.w/2)*kk, y:r.height/2-(p.y+p.h/2)*kk}); }
function ensureVisible(id){ const p=rectOf(id), r=FM.view.getBoundingClientRect(), v=FM.vp, k=v.k, m=30;
  const x0=p.x*k+v.x, y0=p.y*k+v.y, x1=(p.x+p.w)*k+v.x, y1=(p.y+p.h)*k+v.y; let dx=0, dy=0;
  if (x1>r.width-m) dx=r.width-m-x1; if (x0+dx<m) dx=m-x0; if (y1>r.height-m) dy=r.height-m-y1; if (y0+dy<m) dy=m-y0;
  if (dx||dy) animateTo({k, x:v.x+dx, y:v.y+dy}); }
function zoomSmooth(f,cx,cy){ const v=FM.tvp||FM.vp; const k=Math.min(4,Math.max(0.05,v.k*f)), r=k/v.k; animateTo({k, x:cx-(cx-v.x)*r, y:cy-(cy-v.y)*r},170,'out'); }
function fitRectOf(r,max=1.2,pad=70){ const v=FM.view.getBoundingClientRect(); const k=Math.min(max,Math.max(0.05,Math.min((v.width-2*pad)/r.w,(v.height-2*pad)/r.h))); animateTo({k, x:v.width/2-(r.x+r.w/2)*k, y:v.height/2-(r.y+r.h/2)*k},380); }
function selRect(){ const ids=FM.multi.size?[...FM.multi]:(FM.sel?[FM.sel]:[]); if (!ids.length) return null; let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
  ids.forEach(i=>{ const r=rectOf(i); if (!r) return; x0=Math.min(x0,r.x); y0=Math.min(y0,r.y); x1=Math.max(x1,r.x+r.w); y1=Math.max(y1,r.y+r.h); }); return isFinite(x0)?{x:x0,y:y0,w:x1-x0,h:y1-y0}:null; }
function zoomAt(f,cx,cy){ const v=FM.vp; const k=Math.min(4,Math.max(0.05,v.k*f)); const r=k/v.k; FM.vp={k, x:cx-(cx-v.x)*r, y:cy-(cy-v.y)*r}; applyVP(); }

// ---------- minimap ----------
function drawMini(){ const m=$q('#mini'); if (!m || !FM.LAY) return; const b=bounds(); if (!isFinite(b.x0)) return;
  const W=170,H=110, pad=40, sx=(W)/(b.x1-b.x0+2*pad), sy=(H)/(b.y1-b.y0+2*pad), s=Math.min(sx,sy), ox=(W-(b.x1-b.x0)*s)/2-b.x0*s, oy=(H-(b.y1-b.y0)*s)/2-b.y0*s;
  FM.mini={s,ox,oy}; let h='';
  Object.values(FM.fr||{}).forEach(r=>{ h+=`<rect class="fr" x="${r.x*s+ox}" y="${r.y*s+oy}" width="${r.w*s}" height="${r.h*s}"/>`; });
  FM.leaves.forEach(l=>{ if (!FM.LAY[l.id]) return; const p=absPos(l.id); h+=`<rect class="${l.type}${(FM.sel===l.id||FM.multi.has(l.id))?' s':''}" x="${p.x*s+ox}" y="${p.y*s+oy}" width="${Math.max(2,(p.w+p.rw)*s)}" height="${Math.max(2,p.h*s)}"/>`; });
  const r=FM.view.getBoundingClientRect(), v=FM.vp;
  h+=`<rect class="vp" x="${(-v.x/v.k)*s+ox}" y="${(-v.y/v.k)*s+oy}" width="${r.width/v.k*s}" height="${r.height/v.k*s}"/>`;
  m.innerHTML=h; }

// ---------- inspector ----------
function chip(id){ const l=FM.leaf[id]; return `<button class="chip ${l.type} ${stOf(id)}" data-act="goto" data-id="${id}">${labelOf(id)}${l.out&&l.type!=='gate'?' = '+esc2(valOf(l)):''}</button>`; }
function renderInspector(){ const box=$q('#insp'), id=FM.sel;
  if (FM.multi.size){ const ids=[...FM.multi], sw=ids.filter(i=>FM.leaf[i].type==='func'||FM.leaf[i].type==='gate'), allOff=sw.length&&sw.every(i=>FM.dis.has(i)); box.classList.add('open');
    box.innerHTML=`<button class="x" data-act="close" title="Clear selection">×</button><div class="k">Selection</div><h3>${ids.length} blocks</h3><p class="m">Drag any selected block to move them all together. Shift-drag or Shift-click adds more.</p>
      ${sw.length?`<button class="btn" data-act="mpow">⏻ Switch ${allOff?'on':'off'} (${sw.length})</button> `:''}<button class="btn" data-act="mclear">Clear selection</button>
      <div class="k">Blocks</div><div class="chips">${ids.slice(0,40).map(chip).join('')}${ids.length>40?`<i> and ${ids.length-40} more</i>`:''}</div>`; return; }
  if (id && FM.leaf[id]){ box.classList.remove('open'); box.innerHTML=''; return; }
  box.classList.toggle('open', !!id); if (!id){ box.innerHTML=''; return; }
  let h='<button class="x" data-act="close" title="Close">×</button>';
  if (FM.groups[id]){ const g=FM.groups[id], ls=g.ids.map(x=>FM.leaf[x]), gs=groupStatus(g);
    const ext=(dir)=>{ const s=new Set(g.ids), o=new Set(); FM.edges.forEach(e=>{ if (dir==='in' && s.has(e.d)&&!s.has(e.s)) o.add(e.s); if (dir==='out' && s.has(e.s)&&!s.has(e.d)) o.add(e.d); }); return [...o]; };
    h+=`<div class="k">${g.kind==='stage'?'Group · stage':'Group · step'} (a frame, nothing more)</div><h3>${esc2(g.title)}</h3><p>${gs.n} functions · ${ls.filter(l=>l.type==='gate').length} decisions${gs.bad?` · <b>${gs.bad} without a result</b>`:''}</p>
      <div class="k">Takes</div><div class="chips">${ext('in').map(chip).join('')||'<i>nothing from outside</i>'}</div>
      <div class="k">Feeds</div><div class="chips">${ext('out').map(chip).join('')||'<i>nothing: it holds the result</i>'}</div>`;
  } else { const l=FM.leaf[id], n=l.node, ins=FM.edges.filter(e=>e.d===l.id), outs=FM.edges.filter(e=>e.s===l.id), s=stOf(id);
    h+=`<div class="k">${{func:'Function',gate:'Decision',input:'Input from the question',const:'Fixed by a rule'}[l.type]}</div><h3>${l.type==='func'?l.name:l.type==='gate'?(n.test||l.name):l.name}</h3>`;
    if (s!=='ok') h+=`<p class="warnp">${s==='off'?'Switched off: it returns nothing.':'No result: an input is unplugged or comes from something that has no result.'}</p>`;
    if (l.type==='func') h+=`<p class="res">Result: ${labelOf(l.id)} = <b>${esc2(valOf(l))}</b></p>${l.isChart?`<div class="k">How it was found</div>${l.chart?`<div class="cbox" data-act="zoomchart" data-id="${l.id}">${chartHTML(l.chart)}<span class="zm">⤢</span></div>`:''}${howSteps(l).map(x=>`<p>${x}</p>`).join('')}`:`${n.rule?`<div class="k">Rule</div><p>${n.rule}</p>`:''}${n.branch?`<div class="k">Because</div><p>${n.branch}</p>`:''}`}${l.out&&l.out.info?`<p class="m">${l.out.info}</p>`:''}`;
    if (l.type==='gate') h+=`<p class="res">Answer: <b>${s==='ok'?(n.val?'yes':'no'):'—'}</b>${s==='ok'?' → '+(n.val?n.yes:n.no):''}</p>${n.info?`<p>${n.info}</p>`:''}<p class="m">The other branch: ${n.val?n.no:n.yes}</p>`;
    if (l.type==='input'||l.type==='const'){ const o=l.out; h+=`<p class="res">${l.name} = <b>${esc2(valOf(l))}</b></p>${o.info?`<p>${o.info}</p>`:''}`;
      const ed = l.type==='input' && o.path && typeof o.val==='number' && get(o.path)===o.val;
      if (ed) h+=`<label class="ed">Use my own value<input id="own" type="number" step="any" value="${o.val}" data-path="${o.path}"><span>${o.unit||''}</span></label><button class="btn ghost" data-act="reset">Back to the question's value</button>`; }
    if (l.type==='func'||l.type==='gate') h+=`<button class="btn" data-act="pow" data-id="${l.id}">⏻ Switch ${FM.dis.has(l.id)?'on':'off'}</button>`;
    h+=`<div class="k">Takes</div><div class="chips">${ins.map(e=>chip(e.s)).join('')||'<i>nothing: it starts the chain</i>'}</div>
      <div class="k">Feeds</div><div class="chips">${outs.map(e=>chip(e.d)).join('')||'<i>nothing: it is the end</i>'}</div>
      <div class="k">Everything it depends on</div><p class="m">${FM.up[l.id].size} blocks upstream (blue) · ${FM.down[l.id].size} downstream (orange)</p>${typeof tdLines==='function'?tdLines(l):''}`; }
  box.innerHTML=h; }
function renderTop(){ const G=FM.leaves.find(l=>l.goal); const el=$q('#goal'); const P=CATALOG[presetKey]||{}; const V=(FM.prog&&FM.prog.verify)||[];
  const nc=FM.cut.size, nd=FM.dis.size, ed=(ENG&&ENG.changed)?ENG.changed(presetKey,S):0;
  const W=(FM.prog&&FM.prog.warns)||[];
  el.innerHTML = W.map(w=>`<span class="warnchip" title="${esc2(w.info)}">⚠ ${w.msg}</span> `).join('')+(G? `Result <b>${labelOf(G.id)} = ${esc2(valOf(G))}</b>` : '')+ (P&&P.answer?` <span class="off">${P.answer}</span>`:'') + (FM.prog&&FM.prog.noOfficial?' <span class="off">No official answer for this combination of inputs.</span>':'') + V.map(x=>` <span class="vf ${x.ok?'ok':'bad'}" title="${esc2(x.note||'')}">${x.ok?'✓ matches':'≠ differs from'} the official ${esc2(x.label||'answer')} ${fmt(x.exp)}${x.unit?' '+esc2(x.unit):''}${x.ok?'':' (here '+fmt(x.got)+')'}</span>`).join('')
    + (ed?` <span class="alert">${ed} input${ed>1?'s':''} changed <button data-act="resetinputs">Back to the question</button></span>`:'') + (FM.practice?' <span class="pmode">Practice: results hidden</span>':'') + ((nc||nd)?` <span class="alert">${nc?nc+' wire'+(nc>1?'s':'')+' unplugged':''}${nc&&nd?' · ':''}${nd?nd+' off':''} <button data-act="restore">Plug everything back</button></span>`:'');
  $q('#wirebtn').classList.toggle('on',FM.wiring); $q('#toolbtn').textContent=FM.tool==='select'?'Select':'Pan'; $q('#toolbtn').classList.toggle('on',FM.tool==='select'); FM.view.classList.toggle('tsel',FM.tool==='select'); document.body.classList.toggle('wiring',FM.wiring);
  $q('#grpbtn').classList.toggle('on',!FM.hideGroups); document.body.classList.toggle('nogroups',!!FM.hideGroups);
  $q('#undobtn').disabled=!FM.undo.length; }

// ---------- editing the wires ----------
function practiceAct(a,id,btn){
  const l=id&&FM.leaf[id];
  if (a==='practice'){ FM.practice=!FM.practice; lsSet('practice',FM.practice); render(true); if (typeof renderCompanion==='function') renderCompanion(); return; }
  if (a==='revall'){ FM.known=new Set(FM.leaves.map(x=>x.id)); render(true); renderCompanion(); return; }
  if (a==='resetinputs'){ const b=ENG.base(presetKey); S.vals=JSON.parse(JSON.stringify(b.vals)); recompute(); return; }
  if (!l) return;
  if (a==='rev'){ FM.known.add(id); render(true); renderCompanion(); return; }
  if (a==='chkg'){ const ok=(!!+btn.dataset.v)===!!l.node.val; if (ok){ FM.known.add(id); toast('Right.'); render(true); renderCompanion(); } else toast('Not quite: think again, or reveal.'); return; }
  if (a==='chk'){ const x=parseFloat(String(($q('#myans')||{}).value||'').replace(/,/g,'')), v=l.out&&l.out.val; if (!isFinite(x)){ toast('Type a number first.'); return; }
    if (Math.abs(x-v)<=Math.max(0.03*Math.abs(v),1e-6)){ FM.known.add(id); toast('Right: '+fmt(v)+(l.out.unit?' '+l.out.unit:'')); render(true); renderCompanion(); } else toast('Not quite: check the equation and the inputs, or reveal.'); }
}
function snap(){ FM.undo.push(JSON.stringify({c:[...FM.cut],d:[...FM.dis]})); if (FM.undo.length>60) FM.undo.shift(); }
function undo(){ const s=FM.undo.pop(); if (!s) return; const o=JSON.parse(s); FM.cut=new Set(o.c); FM.dis=new Set(o.d); render(true); }
function setWire(w,cut){ snap(); w.edges.forEach(e=>{ cut?FM.cut.add(ekey(e)):FM.cut.delete(ekey(e)); }); render(true); }
function togglePower(ids){ snap(); const allOff=ids.every(i=>FM.dis.has(i)); ids.forEach(i=>allOff?FM.dis.delete(i):FM.dis.add(i)); render(true); }
let toastT=0; function toast(t){ const e=$q('#toast'); e.textContent=t; e.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>e.classList.remove('on'),2800); }
function plugTo(src,item){ const ws=FM.vis.wires.filter(w=>w.s===src && w.rd===item);
  if (!ws.length){ const exp=FM.vis.wires.filter(w=>w.rd===item).map(w=>labelOf(w.s).replace(/<[^>]+>/g,'')); const nm=plainT(labelOf(src));
    toast(exp.length?`"${plainT(FM.groups[item]?FM.groups[item].title:labelOf(item))}" has no pin for ${nm}. Its pins take: ${[...new Set(exp)].join(', ')}.`:`That block takes nothing from outside.`); return false; }
  snap(); ws.forEach(w=>w.edges.forEach(e=>FM.cut.delete(ekey(e)))); render(true); return true; }

// ---------- interaction ----------
function refreshLit(){
  const lit=litSets(); FM.world.querySelectorAll('.it,.frame,.rb').forEach(e=>{ e.classList.remove('sel','up','down','dim'); if (!lit) return; const ls=leavesIn(e.dataset.id);
    e.classList.add(ls.some(x=>lit.seed.has(x))?'sel': ls.some(x=>lit.up.has(x))?'up': ls.some(x=>lit.down.has(x))?'down':'dim'); });
  drawWires(); drawMini(); }

function setHover(id){ if (FM.hover===id) return; FM.hover=id; const svg=$q('#wg',FM.world); if (!svg) return; svg.parentNode.classList.toggle('hovering',!!id);
  svg.querySelectorAll('.w[data-rs]').forEach(p=>p.classList.toggle('hov', !!id && (p.dataset.rs===id||p.dataset.rd===id))); }
function wire(){
  const view=FM.view; const ptr=new Map(); let mode=null, start=null, moved=false, pinch=null, rub=null;
  const world=e=>{ const r=view.getBoundingClientRect(); return {x:(e.clientX-r.left-FM.vp.x)/FM.vp.k, y:(e.clientY-r.top-FM.vp.y)/FM.vp.k}; };
  const startRubber=(src,e)=>{ rub={src,a:portPos(FM.vis.rep[src],'out',src)}; mode='rubber';
    FM.world.querySelectorAll('.it').forEach(it=>{ if (FM.vis.wires.some(w=>w.s===src&&w.rd===it.dataset.id)) it.classList.add('accept'); });
    const g=$q('#wg',FM.world); g.insertAdjacentHTML('beforeend',`<path class="w rub" d="${wirePath(rub.a,world(e))}"/>`); };
  view.addEventListener('pointerdown',e=>{
    const hit=e.target.closest('.hit'); if (hit && FM.wiring){ const w=FM.vis.wires[+hit.dataset.wire]; setWire(w, w.state==='cut'?false:true); return; }
    const pin=e.target.closest('.pin');
    if (pin && FM.wiring){ view.setPointerCapture(e.pointerId); e.preventDefault();
      if (pin.dataset.pin==='out'){ startRubber(pin.dataset.src,e); return; }
      const [src,kind]=pin.dataset.key.split('|'); const w=FM.vis.wires.find(w=>w.rd===pin.dataset.item&&w.s===src&&w.kind===kind);
      if (w && w.state!=='cut') setWire(w,true); startRubber(src,e); return; }
    if (e.target.closest('button,input,label,.cbox,#key,#jump,#jmenu,#insp,#qcard')) return; view.setPointerCapture(e.pointerId); ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if (ptr.size===2){ const [a,b]=[...ptr.values()]; pinch={d:Math.hypot(a.x-b.x,a.y-b.y)}; mode='pinch'; return; }
    const it=e.target.closest('.it,.frame,.rb'); moved=false; stopMotion();
    const item=it?(it.dataset.item||it.dataset.id):null; const frameBody=!!(it && it.classList.contains('frame') && !e.target.closest('.fh'));
    const hand=FM.space||e.button===1||e.button===2, add=e.shiftKey||e.ctrlKey||e.metaKey;
    start={x:e.clientX,y:e.clientY,vx:FM.vp.x,vy:FM.vp.y,id:it?it.dataset.id:null,item,add,group:null,base:null,hist:[]};
    if (e.button===1) e.preventDefault();
    if (it && !frameBody && !hand){ mode='drag'; const ids=(start.id && FM.multi.has(start.id))?[...FM.multi]:[item]; start.group=ids.map(i=>[i,(FM.off[i]||[0,0]).slice()]); }
    else if (hand || (FM.tool==='pan' && !add)) mode='pan';
    else { mode='marquee'; start.base=add?new Set(FM.multi):new Set(); } });
  view.addEventListener('pointermove',e=>{
    if (mode==='rubber' && rub){ const p=$q('.rub',FM.world); if (p) p.setAttribute('d',wirePath(rub.a,world(e))); return; }
    if (!ptr.has(e.pointerId)) return; ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if (mode==='pinch' && ptr.size===2){ const [a,b]=[...ptr.values()]; const d=Math.hypot(a.x-b.x,a.y-b.y); const r=view.getBoundingClientRect(); zoomAt(d/pinch.d, (a.x+b.x)/2-r.left, (a.y+b.y)/2-r.top); pinch.d=d; return; }
    if (!start) return; const dx=e.clientX-start.x, dy=e.clientY-start.y; if (Math.abs(dx)+Math.abs(dy)>4) moved=true; if (!moved) return;
    if (mode==='pan'){ FM.vp.x=start.vx+dx; FM.vp.y=start.vy+dy; applyVP(); start.hist.push([performance.now(),e.clientX,e.clientY]); if (start.hist.length>6) start.hist.shift(); }
    else if (mode==='drag'){ start.group.forEach(([i,o])=>{ FM.off[i]=[o[0]+dx/FM.vp.k, o[1]+dy/FM.vp.k]; }); applyPositions(); }
    else if (mode==='marquee'){ let m=$q('.marq',view); if (!m){ m=document.createElement('div'); m.className='marq'; view.appendChild(m); } const r=view.getBoundingClientRect();
      m.style.left=Math.min(start.x,e.clientX)-r.left+'px'; m.style.top=Math.min(start.y,e.clientY)-r.top+'px'; m.style.width=Math.abs(dx)+'px'; m.style.height=Math.abs(dy)+'px'; } });
  const up=e=>{
    if (mode==='rubber' && rub){ const t=document.elementFromPoint(e.clientX,e.clientY); const dst=t&&t.closest('.it,.pin'); const item=dst&&(dst.dataset.item||dst.dataset.id);
      const src=rub.src; rub=null; mode=null; FM.world.querySelectorAll('.accept').forEach(x=>x.classList.remove('accept')); const r=$q('.rub',FM.world); if (r) r.remove();
      if (item && item!==FM.vis.rep[src]) plugTo(src,item); else if (!item) {/* dropped on empty canvas: stays unplugged */} return; }
    ptr.delete(e.pointerId); if (mode==='pinch'){ if (ptr.size<2){ mode=null; start=null; } return; }
    if (start && !moved) FM.focus=null;
    if (start){
      if (mode==='marquee'){ const m=$q('.marq',view); if (m){ const mr=m.getBoundingClientRect(), vr=view.getBoundingClientRect(), k=FM.vp.k; const hit=new Set(start.base);
          FM.leaves.forEach(l=>{ if (!FM.LAY[l.id]) return; const p=absPos(l.id), x0=vr.left+p.x*k+FM.vp.x, y0=vr.top+p.y*k+FM.vp.y, x1=x0+(p.w+p.rw)*k, y1=y0+p.h*k;
            if (x0<mr.right && x1>mr.left && y0<mr.bottom && y1>mr.top) hit.add(l.id); });
          FM.multi=hit; FM.sel=null; m.remove(); refreshLit(); renderInspector(); }
        else if (!start.add){ FM.multi.clear(); FM.sel=null; refreshLit(); renderInspector(); } }
      else if (!moved){ const id=start.id;
        if (start.add && id && FM.leaf[id]){ if (!FM.multi.size && FM.sel && FM.leaf[FM.sel]) FM.multi.add(FM.sel); FM.multi.has(id)?FM.multi.delete(id):FM.multi.add(id); FM.sel=null; }
        else { FM.multi.clear(); FM.sel=id||null; if (id && FM.leaf[id]) toggleOpen(id); }
        refreshLit(); renderInspector(); } }
    if (mode==='pan' && moved && start && start.hist.length>2){ const a=start.hist[0], b=start.hist[start.hist.length-1], dt=b[0]-a[0]; if (dt>0 && performance.now()-b[0]<60){ const vx=(b[1]-a[1])/dt, vy=(b[2]-a[2])/dt; if (Math.hypot(vx,vy)>0.25) glide(vx,vy); } }
    mode=null; start=null; };
  view.addEventListener('pointerup',up); view.addEventListener('pointercancel',up);
  // Design-tool navigation (React Flow's "design tool" model): pinch or Ctrl/Cmd+scroll zooms, two-finger scroll pans,
  // a mouse wheel (big integer steps) still zooms, Shift+wheel pans sideways, middle/right drag and Space+drag pan.
  view.addEventListener('wheel',e=>{ if (e.target.closest('#insp,#qcard,#jmenu,#key')) return; e.preventDefault(); const r=view.getBoundingClientRect();
    const mouseWheel = e.deltaMode!==0 || (e.deltaX===0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY)>=50);
    if (e.ctrlKey||e.metaKey||(mouseWheel && !e.shiftKey)){ const f=Math.exp(-e.deltaY*(e.ctrlKey?0.012:mouseWheel?0.0016:0.004)); if (mouseWheel&&!e.ctrlKey) zoomSmooth(f, e.clientX-r.left, e.clientY-r.top); else { stopMotion(); zoomAt(f, e.clientX-r.left, e.clientY-r.top); } }
    else { stopMotion(); const dx=e.shiftKey&&!e.deltaX?e.deltaY:e.deltaX, dy=e.shiftKey&&!e.deltaX?0:e.deltaY; FM.vp.x-=dx; FM.vp.y-=dy; applyVP(); } },{passive:false});
  view.addEventListener('contextmenu',e=>e.preventDefault());
  view.addEventListener('dblclick',e=>{ if (e.target.closest('button,input,label,.cbox,.pin')) return; const it=e.target.closest('.it,.rb');
    if (it){ fitRectOf(rectOf(it.dataset.item||it.dataset.id),1.3,90); } else { const r=view.getBoundingClientRect(); zoomSmooth(e.shiftKey?0.5:2, e.clientX-r.left, e.clientY-r.top); } });
  // hovering a block lights up only its wires (when nothing is selected)
  view.addEventListener('pointerover',e=>{ if (FM.sel||FM.multi.size||mode) return; const it=e.target.closest('.it,.rb'); setHover(it?(it.dataset.item||it.dataset.id):null); });
  view.addEventListener('pointerleave',()=>setHover(null));
  document.addEventListener('click',e=>{ if (!e.target.closest('#jump,#jmenu')) $q('#jmenu').classList.remove('on'); const b=e.target.closest('[data-act]'); if (!b) return; const a=b.dataset.act, id=b.dataset.id;
    if (a==='chk'||a==='chkg'||a==='rev'||a==='revall'||a==='practice'||a==='resetinputs'){ practiceAct(a,id,b); return; }
    if (a==='zoomchart') openChart(id);
    else if (a==='zoomimg'){ const lt=b.closest('.lit'), t=lt&&lt.querySelector('.lt'); openImage(id, t?t.innerHTML:''); }
    else if (a==='pow') togglePower([id]);
    else if (a==='close'||a==='mclear'){ FM.sel=null; FM.multi.clear(); refreshLit(); renderInspector(); }
    else if (a==='mpow') togglePower([...FM.multi].filter(i=>FM.leaf[i].type==='func'||FM.leaf[i].type==='gate'));
    else if (a==='tool'){ FM.tool=FM.tool==='select'?'pan':'select'; renderTop(); toast(FM.tool==='select'?'Select (V): drag on empty canvas to box-select. Space, middle or right button still pans.':'Pan (H): drag on empty canvas to move the view. Shift+drag box-selects.'); }
    else if (a==='goto'){ FM.multi.clear(); FM.sel=id; FM.open=new Set(FM.leaf[id]?[id]:[]); refreshLit(); renderInspector(); renderPops(); if (FM.leaf[id]) panAbove(id); else centerOn(id); }
    else if (a==='popx'){ FM.open.delete(id); renderPops(); }
    else if (a==='jprev') jumpStep(-1); else if (a==='jnext') jumpStep(1);
    else if (a==='jmenu'){ $q('#jmenu').classList.toggle('on'); }
    else if (a==='jto') jumpTo(id);
    else if (a==='key'){ FM.keyOn=!FM.keyOn; $q('#key').classList.toggle('on',FM.keyOn); $q('#keybtn').classList.toggle('on',FM.keyOn); if (FM.keyOn) renderKey(); }
    else if (a==='fit') fit(); else if (a==='zin') zoomSmooth(1.35,view.clientWidth/2,view.clientHeight/2); else if (a==='zout') zoomSmooth(1/1.35,view.clientWidth/2,view.clientHeight/2);
    else if (a==='one'){ const v=FM.vp, r=view.getBoundingClientRect(), cx=r.width/2, cy=r.height/2; animateTo({k:1,x:cx-(cx-v.x)/v.k,y:cy-(cy-v.y)/v.k}); }
    else if (a==='sel'){ const r=selRect(); if (r) fitRectOf(r); else toast('Select something first.'); }
    else if (a==='tidy'){ snap(); FM.off={}; render(true); fit(); toast('Tidied: blocks are back where the layout puts them.'); }
    else if (a==='groups'){ FM.hideGroups=!FM.hideGroups; renderTop(); }
    else if (a==='wiring'){ FM.wiring=!FM.wiring; renderTop(); toast(FM.wiring?'Wiring on: click a wire to unplug it, drag from a result block\'s pin to a pin to plug it.':'Wiring off: wires are locked.'); }
    else if (a==='undo') undo();
    else if (a==='restore'){ snap(); FM.cut.clear(); FM.dis.clear(); render(true); }
    else if (a==='reset'){ const l=FM.leaf[id||FM.sel]; if (l && l.node.path){ const base=ENG.base(presetKey); setPath(l.node.path, get(l.node.path,base)); recompute(); } } });
  // the inspector is a portable window: no backdrop, drag it by its header, resize it from the corner, it stays while you pan, zoom and pick other blocks
  $q('#modwin').addEventListener('pointerdown',e=>{ const h=e.target.closest('.mh'); if (!h||e.target.closest('button')) return; const w=$q('#modwin'), r=w.getBoundingClientRect(), dx=e.clientX-r.left, dy=e.clientY-r.top; h.setPointerCapture(e.pointerId); w.classList.add('drag');
    const mv=ev=>{ FM.modPos={x:ev.clientX-dx,y:ev.clientY-dy}; placeMod(); }, up=()=>{ h.removeEventListener('pointermove',mv); h.removeEventListener('pointerup',up); w.classList.remove('drag'); lsSet('modpos',FM.modPos); };
    h.addEventListener('pointermove',mv); h.addEventListener('pointerup',up); e.preventDefault(); });
  window.addEventListener('resize',placeMod);
  document.addEventListener('change',e=>{ if (e.target.id==='own'){ const v=parseFloat(e.target.value); if (isFinite(v)){ setPath(e.target.dataset.path, v); recompute(); } } });
  document.addEventListener('keydown',e=>{ if (document.body.dataset.tab!=='map' || e.target.matches('input,select,textarea')) return; const k=e.key;
    if ((e.ctrlKey||e.metaKey) && k.toLowerCase()==='z'){ e.preventDefault(); undo(); return; }
    if (k==='f'||k==='F') fit(); else if (k==='+'||k==='=') zoomSmooth(1.25,view.clientWidth/2,view.clientHeight/2); else if (k==='-') zoomSmooth(1/1.25,view.clientWidth/2,view.clientHeight/2);
    else if (k==='Escape'){ FM.sel=null; FM.multi.clear(); FM.open.clear(); renderPops(); refreshLit(); renderInspector(); }
    else if ((e.ctrlKey||e.metaKey) && k.toLowerCase()==='a'){ e.preventDefault(); FM.multi=new Set(FM.leaves.map(l=>l.id)); FM.sel=null; refreshLit(); renderInspector(); }
    else if (k===' '){ e.preventDefault(); FM.space=true; FM.view.classList.add('hand'); }
    else if (k==='Home') fit(); else if (k==='[') jumpStep(-1); else if (k===']') jumpStep(1);
    else if (k.startsWith('Arrow')){ e.preventDefault(); const st=e.shiftKey?240:80; cancelAnimationFrame(anim); FM.vp.x+=k==='ArrowLeft'?st:k==='ArrowRight'?-st:0; FM.vp.y+=k==='ArrowUp'?st:k==='ArrowDown'?-st:0; applyVP(); }
    else if (k==='w'||k==='W'){ FM.wiring=!FM.wiring; renderTop(); }
    else if (k==='v'||k==='V'){ FM.tool='select'; renderTop(); } else if (k==='h'||k==='H'){ FM.tool='pan'; renderTop(); }
    else if (k==='z'||k==='Z'){ const r=selRect(); if (r) fitRectOf(r); else fit(); } else if (k==='0') { const r=view.getBoundingClientRect(), v=FM.vp, cx=r.width/2, cy=r.height/2; animateTo({k:1,x:cx-(cx-v.x)/v.k,y:cy-(cy-v.y)/v.k}); } });
  document.addEventListener('keyup',e=>{ if (e.key===' '){ FM.space=false; FM.view.classList.remove('hand'); } });
  const sIn=$q('#find'), sBox=$q('#hits');
  sIn.addEventListener('input',()=>{ const q=sIn.value.trim().toLowerCase(); if (!q){ sBox.innerHTML=''; return; }
    const hits=[...FM.leaves.map(l=>({id:l.id,t:plainT(l.type==='func'&&l.out?l.out.name+' ← '+l.name:l.name)})), ...Object.values(FM.groups).map(g=>({id:g.id,t:g.title}))].filter(x=>x.t.toLowerCase().includes(q)).slice(0,8);
    sBox.innerHTML=hits.map(h=>`<button data-act="goto" data-id="${h.id}">${esc2(h.t)}</button>`).join(''); });
  sBox.addEventListener('click',()=>{ sBox.innerHTML=''; sIn.value=''; });
  window.addEventListener('resize',()=>{ applyVP(); });
  const mini=$q('#mini'); let mdown=false;
  const goMini=(e,ms)=>{ const r=mini.getBoundingClientRect(), m=FM.mini; if(!m) return; const x=(e.clientX-r.left-m.ox)/m.s, y=(e.clientY-r.top-m.oy)/m.s, v=view.getBoundingClientRect();
    const t={k:FM.vp.k, x:v.width/2-x*FM.vp.k, y:v.height/2-y*FM.vp.k}; if (ms){ animateTo(t,ms); } else { stopMotion(); FM.vp=t; applyVP(); } };
  mini.addEventListener('pointerdown',e=>{ mdown=true; mini.setPointerCapture(e.pointerId); goMini(e,160); });
  mini.addEventListener('pointermove',e=>{ if (mdown) goMini(e,0); }); mini.addEventListener('pointerup',()=>{ mdown=false; });
}

// ---------- boot ----------
function recompute(){ ENG.recompute(presetKey,S); buildModel(); render(true); }
function setProblem(k){ const m=CATALOG[k]; if (!m) return false; presetKey=k; ENG=ENGINES[m.engine]; S=ENG.open(k); FM.key=null; buildModel(); render(false); return true; }
function fmInit(){ FM.view=$q('#view'); FM.world=$q('#world'); wire(); lbWire(); }
// the Map tab was hidden while sizes were unknown: measure again and, if a fit is pending, do it
function fmShown(){ if (!FM.LAY) return; applyVP(); if (FM._fit){ FM._fit=false; firstView(); } placePops(); }
