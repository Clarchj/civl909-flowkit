// ================= KIT · TEARDOWN: the result is the product, the page is its teardown manual =================
// Reverse engineering, from the handoff (4c): start at the finished thing and go backwards. The answer (the goal block) is the PRODUCT. Take it apart into
// what it is made from, take each of those apart, and stop at the raw parts (the givens and the rules). Every value justifies itself by a path back to the product.
// No new data: the program already holds the blocks and the wires; this only walks them backwards from the goal.
//   product        the goal                         sub-assembly   a worked-out value that something else uses
//   raw part       a given or a fixed rule           lookup key     a value that only addresses a chart
//   scratch        a value that only makes a key     dead part      a value with no path to the product (kept, faint, labelled)
//   validity check a gate that only warns
const TD={ snap:null, snapKey:null };
const TD_ROLE={ side:'Side result', product:'Product', sub:'Sub-assembly', raw:'Raw part', rule:'Raw part · rule', key:'Lookup key', scratch:'Scratch', dead:'Not used by the product', check:'Validity check', gate:'Decision' };

function tdModel(){ const G=FM.leaves.find(l=>l.goal); if (!G) return null;
  const sides=FM.leaves.filter(l=>l.type==='func'&&l.node.side&&l.id!==G.id), needed=new Set([G.id,...FM.up[G.id],...sides.flatMap(s=>[s.id,...FM.up[s.id]])]), succ={}, pred={}; FM.leaves.forEach(l=>{ succ[l.id]=[]; pred[l.id]=[]; }); FM.edges.forEach(e=>{ succ[e.s].push(e.d); pred[e.d].push(e.s); });
  const isChart=id=>FM.leaf[id].type==='func' && FM.leaf[id].isChart, outNeeded=l=>succ[l.id].filter(x=>needed.has(x));
  const key=new Set(), scratch=new Set(), funcs=FM.leaves.filter(l=>l.type==='func' && needed.has(l.id) && l.id!==G.id);
  funcs.forEach(l=>{ const s=outNeeded(l); if (s.length && s.every(isChart)) key.add(l.id); });
  for (let ch=true; ch;){ ch=false; funcs.forEach(l=>{ if (key.has(l.id)||scratch.has(l.id)) return; const s=outNeeded(l); if (s.length && s.every(x=>key.has(x)||scratch.has(x))){ scratch.add(l.id); ch=true; } }); }
  const role=l=>l.id===G.id?'product': l.type==='gate'?(l.node.warn?'check':(!needed.has(l.id)?'dead':(!pred[l.id].length?'rule':'gate'))) : !needed.has(l.id)?'dead' : sides.includes(l)?'side' : l.type==='input'?'raw' : l.type==='const'?'rule' : !pred[l.id].length?'rule' : key.has(l.id)?'key' : scratch.has(l.id)?'scratch' : 'sub';
  return {G, sides, needed, succ, pred, role}; }

// "why does it exist": the chain of consumers from this block up to the product
function tdWhy(l,M){ M=M||tdModel(); if (!M) return ''; const r=M.role(l);
  if (r==='product') return 'It is the answer the question asks for.'; if (r==='side') return 'It is a second result the problem works out beside the answer (a comparison), not a part of the answer.'; if (r==='check') return 'It only checks the inputs; nothing reads it.';
  if (r==='dead') return 'Nothing reads it on the way to the answer: it is not used by the product.';
  const chain=[], seen=new Set([l.id]); let c=l;
  while (c.id!==M.G.id){ const nx=M.succ[c.id].map(x=>FM.leaf[x]).filter(x=>M.needed.has(x.id) && !seen.has(x.id) && x.type==='func').sort((a,b)=>FM.order[a.id]-FM.order[b.id])[0]; if (!nx) break; chain.push(nx); seen.add(nx.id); c=nx; if (chain.length>6) break; }
  if (!chain.length) return 'It feeds the product directly.';
  const nm=x=>'<b>'+symOf(x)+'</b>', tail=chain.length>2?`, which is needed by … and finally by ${nm(chain[chain.length-1])}`:(chain.length===2?`, which is needed by ${nm(chain[1])}`:'');
  return `${nm(l)} is needed by ${nm(chain[0])}${tail}.${r==='key'?' It is a <i>lookup key</i>: it only addresses a chart.':r==='scratch'?' It is <i>scratch</i>: it only makes a lookup key.':''}`; }
function tdLines(l){ const M=tdModel(); if (!M) return ''; const r=M.role(l); return `<div class="k">Why it exists</div><p class="m"><span class="tdrole r-${r}">${TD_ROLE[r]}</span> ${tdWhy(l,M)}</p>`; }

// ---------- the tab ----------
const tdSym=l=>l.type==='gate'?`<b>${l.node.test||l.name}</b>`:`<b>${symOf(l)}</b>`;
function tdVal(l){ if (l.type==='gate') return masked(l)?'?':(l.node.val?'yes':'no'); return (l.type==='func'||l.type==='input'||l.type==='const') ? `${esc2(vtext(l))}${unitOf(l)?' '+esc2(unitOf(l)):''}` : ''; }
function tdCard(l,M,cls){ const r=M.role(l), id=l.id, now=tdVal(l), old=TD.snap&&TD.snap[id], chg=old!=null&&old!==now;
  const kids=M.pred[id].length;
  return `<button class="tdc ${cls||''} r-${r}${chg?' chg':''}" data-cp="td" data-id="${esc2(id)}"><span class="tdrole r-${r}">${TD_ROLE[r]}</span><span class="tds">${tdSym(l)}${now?' = '+now:''}${chg?`<span class="tdold">was ${old}</span>`:''}</span>
    <span class="tdn">${l.type==='gate'?(l.node.test||l.name):l.name}</span>${kids?`<span class="tdgo">made from ${kids} ›</span>`:''}</button>`; }
function cpTeardown(){ const M=tdModel();
  if (!M) return `<div class="cq"><h3>Teardown</h3><p class="cm">This problem has no product (no goal block), so there is nothing to take apart.</p></div>`;
  if (TD.key!==presetKey){ TD.key=presetKey; TD.path=[M.G.id]; TD.snap=null; }
  let path=(TD.path||[]).filter(id=>FM.leaf[id]); if (path[0]!==M.G.id) path=[M.G.id]; TD.path=path;
  const cur=FM.leaf[path[path.length-1]], r=M.role(cur), G=M.G, mode=lsGet('tddead','dim');
  const V=(FM.prog.verify||[]), off=V.length?V.map(x=>`official ${fmt(x.exp)}${x.ok?' ✓':' ≠ ('+fmt(x.got)+')'}`).join(' · '):'';
  let h=`<div class="cq td"><h3>Teardown<small>Start from the answer and take it apart, down to the raw parts.</small></h3>
    <div class="tdbadge">Rebuilt from the raw parts: <b>${esc2(vtext(G))}${unitOf(G)?' '+esc2(unitOf(G)):''}</b>${off?' · '+off:''}</div>
    <div class="tdcrumb">${path.map((id,i)=>`<button data-cp="td" data-id="${esc2(id)}" class="${i===path.length-1?'on':''}">${tdSym(FM.leaf[id])}</button>`).join('<span>←</span>')}${path.length>1?'<button class="ghostb" data-cp="td" data-id="'+esc2(G.id)+'">back to the product</button>':''}</div>`;
  // the open part: what goes in, what comes out, why it exists
  const kids=M.pred[cur.id].map(x=>FM.leaf[x]), gates=cur.type==='gate'?[]:kids.filter(x=>x.type==='gate'), parts=kids.filter(x=>cur.type==='gate'||x.type!=='gate').sort((a,b)=>FM.order[a.id]-FM.order[b.id]), eq=eqParts(cur);
  h+=`<section class="tdopen r-${r}"><div class="tdhead"><span class="tdrole r-${r}">${TD_ROLE[r]}</span><span class="tds">${tdSym(cur)}${tdVal(cur)?' = '+tdVal(cur):''}</span></div>
    ${cur.type==='func'?`<p class="tdmade">Made by <b>${cur.name}</b></p>${eq?`<div class="we"><div class="e1">${eq.sym}</div>${eq.num&&!masked(cur)?`<div class="e2">= ${eq.num}</div>`:''}</div>`:''}`:''}
    ${cur.type==='gate'?`<p class="tdmade">The question is <b>${cur.node.test||cur.name}</b> Answer: <b>${tdVal(cur)}</b>${masked(cur)?'':' → '+esc2(cur.node.val?cur.node.yes:cur.node.no)}.</p>${cur.node.info?`<p class="cm">${cur.node.info}</p>`:''}`:''}
    ${gates.length?`<p class="tdbec">Because: ${gates.map(g=>`<button class="tdchip tdgate" data-cp="td" data-id="${esc2(g.id)}">${g.node.test||g.name} <b>${tdVal(g)}</b> ›</button>`).join(' ')}</p>`:''}
    <div class="tdio"><div><div class="k">Goes in</div>${parts.length?parts.map(x=>`<span class="tdchip">${tdSym(x)}</span>`).join(' '):'<i>nothing: it is a raw part</i>'}</div><div><div class="k">Comes out</div><span class="tdchip">${tdSym(cur)}</span></div></div>
    <div class="k">Why it exists</div><p>${tdWhy(cur,M)}</p>`;
  if (cur.type==='input' && cur.out && cur.out.path && typeof cur.out.val==='number' && get(cur.out.path)===cur.out.val) h+=`<label class="ed">Change it and watch only its path move<input data-td-in="${esc2(cur.out.path)}" type="number" step="any" value="${cur.out.val}"><span>${esc2(cur.out.unit||'')}</span></label>`;
  h+=`<div class="tdbtn"><button class="ghostb" data-cp="leaf" data-id="${esc2(cur.id)}">Show it on the map</button></div></section>`;
  if (parts.length) h+=`<h4>Made from</h4><div class="tdkids">${parts.map(x=>tdCard(x,M,'')).join('')}</div>`;
  // validity checks and parts that nothing reads
  const sidesL=M.sides; if (sidesL.length) h+=`<h4>Also made here</h4><div class="tdkids">${sidesL.map(l=>tdCard(l,M,'')).join('')}</div>`;
  const checks=FM.leaves.filter(l=>M.role(l)==='check'), dead=FM.leaves.filter(l=>M.role(l)==='dead'&&l.type!=='gate');
  if (checks.length) h+=`<h4>Validity checks</h4><div class="tdkids">${checks.map(l=>`<div class="tdc r-check"><span class="tdrole r-check">Check</span><span class="tdn">${l.node.test||l.name}: <b>${masked(l)?'?':(l.node.val?'warning':'fine')}</b></span></div>`).join('')}</div>`;
  if (dead.length) h+=`<h4>Not used by the product <span class="tdseg">${['hide','dim','show'].map(m=>`<button data-cp="tddead" data-id="${m}" class="${mode===m?'on':''}">${m}</button>`).join('')}</span></h4>${mode==='hide'?`<p class="cm">${dead.length} part${dead.length>1?'s':''} hidden: no path to the product.</p>`:`<div class="tdkids ${mode==='dim'?'faint':''}">${dead.map(l=>tdCard(l,M,'dead')).join('')}</div>`}`;
  h+=`</div>`;
  TD.snap={}; FM.leaves.forEach(l=>{ if (l.type!=='gate') TD.snap[l.id]=tdVal(l); });
  return h; }

function tdAct(a,id){ const M=tdModel(); if (!M) return;
  if (a==='tddead'){ lsSet('tddead',id); renderCompanion(); return; }
  const path=TD.path||[M.G.id], i=path.indexOf(id);
  if (i>=0) TD.path=path.slice(0,i+1);                                            // a crumb: go back up
  else { const cur=path[path.length-1]; TD.path=M.pred[cur].includes(id)?[...path,id]:[M.G.id,id]; if (M.sides.some(s=>s.id===id)) TD.path=[M.G.id,id]; }   // a card: go down one layer (a part from the dead list starts its own path)
  renderCompanion(); focusLeaf(id); }
function tdInit(){ document.addEventListener('change',e=>{ const x=e.target.closest&&e.target.closest('[data-td-in]'); if (!x) return; const v=parseFloat(x.value); if (isFinite(v)){ setPath(x.dataset.tdIn,v); recompute(); } }); }
