// ---------- render the walkthrough panel ----------
// ---------- stages, links between steps, and the flow card ----------
const STAGES=[['setup','Set up',k=>['q','rd','g'].includes(k)],['shaft','Shaft',k=>/^s\d+$/.test(k)||k==='ps'||k==='sL'],['base','Base',k=>k==='b'||k==='bL'],
  ['pile','One pile',k=>k==='w'||k==='pu'],['design','Solve L',k=>['req','solve','chk'].includes(k)],['group','Group',k=>/^g\d$/.test(k)||k==='ge'],['check','Check',k=>k==='c'],['settle','Settlement',k=>['pp','seq','sK','sI','sR','sSo','sA','sS'].includes(k)]];
const stageOf = key => STAGES.findIndex(([,,f])=>f(key));
function linkSteps(steps){
  const keys=steps.map(s=>s.key), has=x=>keys.includes(x), firstSeg=keys.find(x=>/^s\d+$/.test(x));
  const firstShaft = keys.find(x=>/^s\d+$/.test(x)||x==='sL'), baseK = has('bL')?'bL':'b';
  const nx = k => k==='q'?(has('g')?['g']:[has('pp')?'pp':'seq']) : k==='g'?[firstShaft, baseK, has('req')&&!has('sL')?'req':null] : /^s\d+$/.test(k)?['ps'] : k==='sL'?['solve'] : k==='bL'?['solve'] : k==='req'?['solve'] : k==='solve'?(has('chk')?['chk']:[])
    : (k==='ps'||k==='b'||k==='w')?['pu'] : k==='pu'?(has('ge')?['ge']:has('g1')?['g1','g2']:['c']) : k==='g1'?(has('g5')?['g5']:['c']) : k==='g2'?['g3'] : k==='g3'?['g5'] : (k==='g5'||k==='ge')?['c']
    : k==='c'?[has('pp')?'pp':'seq'] : k==='pp'?['sS'] : k==='seq'?[has('sSo')?'sSo':'sK'] : k==='sK'?['sI'] : k==='sI'?[has('sR')?'sR':'sS'] : k==='sR'?['sS'] : k==='sSo'?['sA','sS'] : k==='sA'?['sS'] : [];
  // "Read the question" sits between the goal and everything the goal used to feed
  const nxr = k => has('rd') ? (k==='q' ? ['rd'] : k==='rd' ? nx('q') : nx(k)) : nx(k);
  steps.forEach(s=>{ s.next=nxr(s.key).filter(x=>x&&has(x)); s.prev=[];
    const outLine = /^s\d+$/.test(s.key) ? s.lines[s.lines.length-2] : (s.key==='q'||s.key==='g'||s.key==='seq') ? null : (s.key==='pu'||s.key==='g5') ? s.lines[0] : [...s.lines].reverse().find(l=>l.res);
    s.out = outLine || null; });
  steps.forEach(s=>s.next.forEach(n=>{ const t=steps.find(x=>x.key===n); if (t) t.prev.push(s.key); }));
  return steps;
}
function finalOf(r){
  const G=r.G, P=PRESETS[presetKey]||{}, asks=P.asks||[];
  if (asks.includes('S') && r.settle) return {sym:'S', val:`${f(r.settle.S*1000,1)} mm`};
  if (asks.includes('L')){ const s=solveL(S); return {sym:'L', val: s?`${f2(s.L)} m`:'–'}; }
  if (asks.includes('FSact')) return {sym:'FS', val:f2((G?G.Pg:r.Pu)/S.group.Q)};
  if (asks.includes('Pa') || (given('FS')&&given('Q'))) return {sym:'P<sub>a</sub>', val:`${f0((G?G.Pg:r.Pu)/S.group.FS)} kN`};
  return G ? {sym:'P<sub>u,g</sub>', val:`${f0(G.Pg)} kN`} : {sym:'P<sub>u</sub>', val:`${f0(r.Pu)} kN`};
}
function soFar(r, st){ const n=st?st.reveal.segs:0; let s=0; r.sh.segs.forEach((g,i)=>{ if (i<n) s+=g.dP; }); if (st&&st.reveal.base) s+=r.fbAb; return s; }
function stageBar(r){
  const steps=walk.steps, cur=walk.on?walk.i:-1, used=STAGES.map((s,i)=>({s, i, idx:steps.map((st,k)=>stageOf(st.key)===i?k:-1).filter(k=>k>=0)})).filter(o=>o.idx.length);
  const ci = cur>=0 ? stageOf(steps[cur].key) : -1; const stNo = used.findIndex(o=>o.i===ci);
  const fin=finalOf(r); const pct = cur>=0 ? Math.round(100*(cur+1)/steps.length) : 0;
  const design = steps.some(s=>s.key==='solve');
  const cap = !design && cur>=0 && ['shaft','base','pile'].includes(STAGES[ci][0]) ? soFar(r, steps[cur]) : null;
  const segs=used.map(o=>`<div class="sseg${o.i===ci?' on':''}${cur>=0 && o.idx[o.idx.length-1]<cur?' done':''}" style="flex:${o.idx.length}">
      <div class="sticks">${o.idx.map(k=>`<button type="button" class="stk${k===cur?' cur':k<cur?' done':''}" data-walkto="${k}" title="${k+1}. ${plain(steps[k].short)}" aria-label="Step ${k+1}: ${plain(steps[k].short)}"></button>`).join('')}</div>
      <span class="slab">${o.s[1]}</span></div>`).join('');
  return `<div class="stages" style="--p:${pct}%">
    <div class="sbar">${segs}<div class="sfin" title="final answer"><span>${fin.sym}</span></div></div>
    <div class="sinfo">${cur>=0 ? `<b>Stage ${stNo+1} of ${used.length}: ${STAGES[ci][1]}</b>, step ${cur+1} of ${steps.length}. <span class="spct">${pct}% of the way</span> to ${fin.sym} ≈ <b>${fin.val}</b>${cap!=null?`<span class="scap">, capacity so far ${f0(cap)} kN</span>`:''}.`
      : `${steps.length} steps in ${used.length} stages, ending at ${fin.sym}.`}</div></div>`;
}
// the step as a sentence: a verb (the action) and, after it, the noun it makes, standing on its own
function sentenceHtml(st){
  if (!UI.steps.flow_sentence) return '';
  const prog = (typeof progOf==='function' && last) ? progOf(last) : null; if (!prog) return '';
  const one = ss => `<div class="fsent"><span class="fverb">${ss.verb}</span><span class="fthen" aria-hidden="true">→</span><span class="fnoun"><i>${ss.noun}</i>${ss.val!=null&&ss.val!==''?` = <b>${fv(ss.val)}</b>${ss.unit?' '+ss.unit:''}`:''}</span></div>`;
  if (st.key==='rd'){ // every conversion is its own sentence
    const p=prog.steps.find(x=>x.key==='rd'); if (!p) return '';
    return p.ids.map(id=>prog.nodes.find(n=>n.id===id)).filter(n=>n.kind==='verb').map(v=>{ const o=prog.nodes.find(n=>n.by===v.id); return one({verb:v.name, noun:o.name, val:o.val, unit:o.unit}); }).join('');
  }
  const ss = stepSentence(prog, st.key);
  return ss && ss.verb ? one(ss) : '';
}
function flowCard(st){
  const steps=walk.steps, idx=k=>steps.findIndex(s=>s.key===k);
  const ins = st.uses.map(([n,v,p])=>`<span class="fchip ${p?'given':'calc'}" ${p?`data-usepath="${p}"`:''}><b>${n}</b> ${v}<i>${p?'input':'value'}</i></span>`)
    .concat(st.prev.map(k=>{ const s=steps[idx(k)]; return `<button type="button" class="fchip from" data-walkto="${idx(k)}"><b>${s.short}</b> ${s.out&&s.out.res?s.out.res:''}<i>step ${idx(k)+1}</i></button>`; }));
  const outs = st.next.length ? st.next.map(k=>{ const s=steps[idx(k)]; return `<button type="button" class="fchip to" data-walkto="${idx(k)}"><b>${s.short}</b><i>step ${idx(k)+1}</i></button>`; })
    : [`<span class="fchip final"><b>final answer</b></span>`];
  const o=st.out;
  return `<div class="flow" aria-label="What this step uses and feeds">
    <div class="fcol fin"><div class="fh">In play</div><div class="fchips">${ins.join('')||'<span class="muted">the question</span>'}</div></div>
    <div class="farr" aria-hidden="true"></div>
    <div class="fcol fnow"><div class="fh">Working on</div>${sentenceHtml(st) || `<div class="fnode">${o?`<i>${o.sym}</i><b>${o.res?(/=|→/.test(o.res)?o.res:'= '+o.res):''}</b>`:`<i>${plain(st.title)}</i>`}</div>`}</div>
    <div class="farr" aria-hidden="true"></div>
    <div class="fcol fout"><div class="fh">Feeds</div><div class="fchips">${outs.join('')}</div></div>
  </div>`;
}
function renderWalk(r){
  const el=$('#walk'); if (!el) return;
  walk.steps = linkSteps(buildSteps(r));
  const phone = typeof isPhone==='function' && isPhone();
  if (!walk.on){
    const html=`<div class="walk-intro">${stageBar(r)}<p>Unravel the problem one step at a time. The bar above is the route to the answer; each step shows what is in play, what it works out, and what that result feeds next, while the 3D, 2D, map and inputs light up to match.</p>
      <div class="lbtn"><button type="button" class="btn" id="walkStart">Start step by step</button></div></div>`;
    if (html!==walk.lastHtml){ el.innerHTML=html; walk.lastHtml=html; }
    if (typeof syncDock==='function') syncDock();
    return;
  }
  walk.i=Math.max(0,Math.min(walk.i, walk.steps.length-1));
  const st=walk.steps[walk.i];
  const lines=st.lines.map((ln,k)=>`<div class="wl" style="--d:${(0.15+k*0.55).toFixed(2)}s"><span class="sym">${ln.sym}</span>${ln.num?`<span class="num">${ln.sym.includes('=')?'= ':': '}${ln.num}</span>`:''}${ln.res?`<span class="res">${/=|→/.test(ln.res)?'→ ':'= '}${ln.res}</span>`:''}${ln.note?`<span class="note">${ln.note}</span>`:''}</div>`).join('');
  const chartLab = st.chart ? (st.chart.type==='I'?'Settlement influence factor I':st.chart.type==='Rh'?'Rigid base correction R<sub>h</sub>':st.chart.type==='aF'?'Interaction factor α<sub>F</sub>':st.chart.type==='alpha'?'α chart lookup':st.chart.type==='nc'?'Skempton N<sub>c</sub> lookup':st.chart.type==='cap'?'Meyerhof base: formula vs cap':'Two routes, the smaller wins') : '';
  const html=`${stageBar(r)}
  <div class="walk-grid">
    <div class="walk-main" data-anim="${walk.i}">
      <h3 class="wtitle">${st.title}</h3>
      <p class="why">${st.why}</p>
      ${flowCard(st)}
      <div class="wlines">${lines}</div>
    </div>
    <div class="walk-side">
      ${st.chart?`<details class="chartbox" ${phone?'':'open'}><summary class="clab">${chartLab}</summary>${miniChart(st.chart)}</details>`:''}
      ${(walk.steps.some(s=>s.key==='solve') || stageOf(st.key)===STAGES.findIndex(x=>x[0]==='settle') || (r.settle && !walk.steps.some(s=>s.key==='pu'))) ? '' : `<div class="chartbox ledgerbox"><div class="clab">Capacity so far</div>${ledger(r, st)}</div>`}
    </div>
  </div>
  <div class="wctrl">
    <button type="button" class="btn ghost" id="walkPrev" ${walk.i===0?'disabled':''}>Previous</button>
    <button type="button" class="btn" id="walkNext" ${walk.i===walk.steps.length-1?'disabled':''}>Next step</button>
    <button type="button" class="btn ghost" id="walkPlay">${walk.timer?'Pause':'Auto-play'}</button>
    <button type="button" class="btn ghost" id="walkExit">Exit</button>
    <span class="muted keys">Arrow keys work too</span>
  </div>`;
  if (html!==walk.lastHtml){ el.innerHTML=html; walk.lastHtml=html; }
}
function applyWalkView(){
  if (!walk.on){ walkView=null; walkBand=null; walkNodes=null; markInvolved([]); return; }
  const st=walk.steps[walk.i]; if (!st) return;
  walkView={on:true, emph:st.emph, seg:st.seg!=null?st.seg:null, reveal:st.reveal, fly:st.fly, index:walk.i, total:walk.steps.length, title:plain(st.title)};
  walkBand=st.band; walkNodes=new Set(st.nodes); markInvolved(st.paths);
}
function markInvolved(paths){
  document.querySelectorAll('[data-row]').forEach(row=>{ const p=row.dataset.row; row.classList.toggle('involved', paths.some(q=>p===q||p.startsWith(q+'.'))); });
  document.querySelectorAll('.layer').forEach((el,i)=>el.classList.toggle('involved', paths.some(q=>q==='layers'||q===`layers.${i}`||q.startsWith(`layers.${i}.`))));
}
function gotoStep(i, source){
  walk.i=i; applyWalkView(); if (!last) return;
  renderWalk(last); drawSection(last); drawProfiles(last); V3.build(last); drawBlocks(last);
  syncHighlights(source);
  if (typeof syncDock==='function') syncDock();
}
function walkStart(){ walk.on=true; walk.i=0; COLL.walk=false; applyWalkView(); render(); if (typeof syncDock==='function') syncDock(); }
function walkExit(){ walk.on=false; clearInterval(walk.timer); walk.timer=0; applyWalkView(); render(); V3.flyHome(); syncHighlights('render'); if (typeof syncDock==='function') syncDock(); }
function walkPlay(){ if (walk.timer){ clearInterval(walk.timer); walk.timer=0; }
  else { walk.timer=setInterval(()=>{ if (walk.i>=walk.steps.length-1){ clearInterval(walk.timer); walk.timer=0; walk.lastHtml=''; renderWalk(last); return; } gotoStep(walk.i+1); }, Math.round(UI.steps.autoplay_seconds*1000)); }
  walk.lastHtml=''; renderWalk(last); }
