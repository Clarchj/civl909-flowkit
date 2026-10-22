// ================= KIT · SHELL: master tabs, track, library, notation micro-lookup, quiz =================
// Four jobs, four tabs. The TRACK (e.g. shallow / deep) scopes everything: which problems, which notation, which quiz.
//   Map       the flow map of one problem          Library   find a problem: by week, by type, by source
//   Notation  every symbol, with units and how you get it     Quiz   multiple-choice practice
// Ctrl+K (or /) opens the micro-lookup anywhere: type a symbol, see what it is, where it appears. Inside the Map, every block's card carries its notation.
const SH={track:'', tab:'map', groupBy:'week', lq:'', nq:'', nobt:'', ngrp:'', nboth:false, lk:{q:'', sel:null}, quiz:{set:0}, seen:{}};
const SRC_ORDER={lecture:0, tutorial:1, exam:2, quiz:3, playground:4};
const SRC_NAME={lecture:'Lecture example', tutorial:'Tutorial', exam:'Exam', quiz:'Quiz', playground:'Playground'};
const trackDef=id=>SUBJECT.tracks.find(t=>t.id===id)||SUBJECT.tracks[0];
const weekName=w=>w===99?'Exam papers':w? 'Week '+w+((SUBJECT.weeks||{})[w]?' · '+SUBJECT.weeks[w]:'') : 'Free play';
const typeDef=(tr,id)=>((SUBJECT.types||{})[tr]||[]).find(t=>t.id===id)||{id,name:id,blurb:'',color:'#6b7780'};

// ---------- notation index ----------
const NOTE={list:[], byKey:{}, obtained:{}};
const nkey=s=>plainT(s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[′’`]/g,"'").replace(/'+/g,"'").replace(/\s+/g,'');
function trackOfWeeks(w){ const n=parseInt(String(w).replace(/[^\d].*$/,''),10); const t=SUBJECT.tracks.find(t=>t.weeks.includes(n)); return t?t.id:SUBJECT.tracks[0].id; }
function prettySym(sym){ return String(sym).split(/,\s*/).map(p=>{ const m=/^([A-Za-zΑ-Ωα-ω])(['′’]?)([A-Za-z0-9α-ωΑ-Ω]*)(.*)$/.exec(p); if (!m) return esc2(p);
  return esc2(m[1])+esc2(m[2])+(m[3]?`<sub>${esc2(m[3])}</sub>`:'')+esc2(m[4]); }).join(', '); }
// every way a symbol can be written: each comma part, what is inside brackets, and without a leading σ′ (σ′pc → pc)
function keysOf(sym){ const out=new Set(); String(sym).split(/,\s*/).forEach(p=>{ out.add(nkey(p)); const m=/^(.*?)\((.*)\)$/.exec(p); if (m){ out.add(nkey(m[1])); out.add(nkey(m[2])); } });
  [...out].forEach(k=>{ const t=k.replace(/^σ'/,''); if (t&&t!==k) out.add(t); }); out.delete(''); return [...out]; }
function buildNotation(){ const raw=(typeof NOTATION_RAW!=='undefined'&&NOTATION_RAW)||{symbols:[]}; NOTE.obtained=raw.obtained_values||{};
  NOTE.list=raw.symbols.map(e=>({...e, track:trackOfWeeks(e.weeks), keys:keysOf(e.symbol)}));
  NOTE.list.forEach(e=>e.keys.forEach(k=>{ (NOTE.byKey[k]=NOTE.byKey[k]||[]).push(e); })); }
const symKeyOfLeaf=l=>nkey(String((l.type==='func'&&l.out)?l.out.name:l.name).split(',')[0]);
function notesFor(key){ let a=(NOTE.byKey[key]||[]).slice(); if (!a.length){ const base=key.replace(/\d+$/,''); if (base&&base!==key) a=(NOTE.byKey[base]||[]).slice(); } /* I_z3 → I_z, q_c2 → q_c */ a.sort((x,y)=>(x.track===SH.track?0:1)-(y.track===SH.track?0:1)); return a; }
function noteTitle(l){ const e=notesFor(symKeyOfLeaf(l))[0]; return e?` — ${e.meaning}${e.unit&&e.unit!=='–'?' ('+e.unit+')':''}`:''; }
function noteHTML(l){ const key=symKeyOfLeaf(l), a=notesFor(key); if (!a.length) return ''; const e=a[0], other=a.filter(x=>x.track!==e.track);
  return `<div class="note"><span class="nk">Notation</span><b>${prettySym(e.symbol.split(/,\s*/).find(p=>nkey(p)===key)||e.symbol)}</b> ${esc2(e.meaning)}${e.unit&&e.unit!=='–'?` <span class="nu">${esc2(e.unit)}</span>`:''}<span class="nb ${esc2(e.obtained.replace(/ /g,'-'))}">${esc2(e.obtained)}</span>
    ${other.length?`<div class="nalso">also in ${esc2(trackDef(other[0].track).name)}: ${esc2(other[0].meaning)}</div>`:''}<button class="nmore" data-act="nlk" data-key="${esc2(key)}">Look up ▸</button></div>`; }

// ---------- routing and tabs ----------
const probList=(track)=>Object.values(CATALOG).filter(m=>!track||m.track===track).sort((a,b)=>(a.week-b.week)||((SRC_ORDER[a.source]??9)-(SRC_ORDER[b.source]??9))||((a.order||0)-(b.order||0))||a.id.localeCompare(b.id,undefined,{numeric:true}));
function setHash(){ try{ history.replaceState(null,'','#'+[SH.track,SH.tab,presetKey].filter(Boolean).join('/')); }catch(e){} }
function setTab(tab){ SH.tab=tab; document.body.dataset.tab=tab; $qa('.page,#tab-map').forEach(p=>p.hidden=(p.id!=='tab-'+tab));
  $qa('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));
  if (tab==='library') renderLibrary(); else if (tab==='notation') renderNotation(); else if (tab==='quiz') renderQuiz(); else if (tab==='exam') renderExam(); else fmShown();
  setHash(); lsSet('shell',{track:SH.track,tab:SH.tab,groupBy:SH.groupBy}); }
function setTrack(tr){ SH.track=tr; document.body.dataset.track=tr; document.documentElement.style.setProperty('--trk',trackDef(tr).color||'#2f6bea'); renderHeader();
  if (SH.tab==='map' && CATALOG[presetKey] && CATALOG[presetKey].track!==tr) setTab('library'); else if (SH.tab!=='map') setTab(SH.tab); else setHash(); }
function openProblem(id){ if (!CATALOG[id]) return; const m=CATALOG[id]; if (m.track!==SH.track) { SH.track=m.track; document.body.dataset.track=m.track; document.documentElement.style.setProperty('--trk',trackDef(m.track).color||'#2f6bea'); renderHeader(); }
  setProblem(id); SH.seen[id]=1; lsSet('seen',SH.seen); setTab('map'); renderMapTitle(); }
function renderMapTitle(){ const m=CATALOG[presetKey]; if (!m) return; const list=probList(m.track), i=list.findIndex(x=>x.id===m.id);
  $q('#pcur').innerHTML=`<span class="pw">${m.week?'W'+m.week:'·'}</span><b>${esc2(m.title)}</b>${m.sub?`<small>${esc2(m.sub)}</small>`:''}<i>▾</i>`; $q('#pprev').disabled=i<=0; $q('#pnext').disabled=i<0||i>=list.length-1; }
function stepProblem(d){ const m=CATALOG[presetKey], list=probList(m.track), i=list.findIndex(x=>x.id===m.id)+d; if (list[i]) openProblem(list[i].id); }

function renderHeader(){ $q('#tracks').innerHTML=SUBJECT.tracks.map(t=>`<button data-act="track" data-id="${t.id}" class="${t.id===SH.track?'on':''}" style="--tc:${t.color}">${esc2(t.name)}<small>${probList(t.id).length}</small></button>`).join(''); }

// ---------- library ----------
function renderLibrary(){ const el=$q('#tab-library'), tr=trackDef(SH.track); let items=probList(SH.track);
  const qz=(QUIZ||[]).filter(s=>s.track===SH.track).map(s=>({id:'quiz:'+s.id, engine:'quiz', track:s.track, week:99, source:'exam', type:'concept', title:s.title+' · Section I', sub:s.items.length+' multiple-choice questions', tags:[], answer:'', group:s.title, quiz:s.id}));
  items=items.concat(qz);
  const q=SH.lq.trim().toLowerCase(); if (q) items=items.filter(m=>(m.title+' '+m.sub+' '+m.tags.join(' ')+' '+m.type+' '+(m.text||'')+' '+m.answer).toLowerCase().includes(q));
  const keyOf={week:m=>m.week||0, type:m=>m.type, source:m=>m.source}[SH.groupBy];
  const groups=[]; items.forEach(m=>{ const k=keyOf(m); let g=groups.find(x=>x.k===k); if (!g){ g={k,items:[]}; groups.push(g); } g.items.push(m); });
  if (SH.groupBy==='week') groups.sort((a,b)=>a.k-b.k); else if (SH.groupBy==='source') groups.sort((a,b)=>(SRC_ORDER[a.k]??9)-(SRC_ORDER[b.k]??9));
  else { const order=((SUBJECT.types||{})[SH.track]||[]).map(t=>t.id); groups.sort((a,b)=>order.indexOf(a.k)-order.indexOf(b.k)); }
  const head=g=>SH.groupBy==='week'?weekName(g.k) : SH.groupBy==='source'?(SRC_NAME[g.k]||g.k) : typeDef(SH.track,g.k).name;
  const blurb=g=>SH.groupBy==='type'?typeDef(SH.track,g.k).blurb:'';
  const card=m=>{ const td=typeDef(m.track,m.type), seen=SH.seen[m.id]; return `<button class="pc" data-act="open" data-id="${esc2(m.id)}"><span class="pcr"><span class="pwk">${m.week?'W'+m.week:'·'}</span><span class="pty" style="--c:${td.color}">${esc2(td.name)}</span><span class="psr">${esc2(SRC_NAME[m.source]||m.source)}</span>${seen?'<span class="pse" title="opened">✓</span>':''}</span>
    <b class="pt">${esc2(m.title)}</b>${m.sub?`<span class="psub">${esc2(m.sub)}</span>`:''}${m.answer?`<span class="pans">${plainT(m.answer).slice(0,90)}</span>`:''}</button>`; };
  el.innerHTML=`<div class="phead"><div><h2>${esc2(tr.name)} <small>problems</small></h2><p class="pm">${items.length} problem${items.length===1?'':'s'}${q?' match':''} · group by</p></div>
    <div class="seg" id="gby">${[['week','Week'],['type','Type of problem'],['source','Source']].map(([k,n])=>`<button data-act="gby" data-id="${k}" class="${SH.groupBy===k?'on':''}">${n}</button>`).join('')}</div>
    <input id="lq" type="search" placeholder="Search problems…" value="${esc2(SH.lq)}"></div>
    <div class="pgroups">${groups.map(g=>`<section><h3>${esc2(head(g))}<small>${g.items.length}</small></h3>${blurb(g)?`<p class="pm">${esc2(blurb(g))}</p>`:''}<div class="pgrid">${g.items.map(card).join('')}</div></section>`).join('')||'<p class="pm">Nothing matches.</p>'}</div>`;
  const inp=$q('#lq'); inp.addEventListener('input',()=>{ SH.lq=inp.value; const pos=inp.selectionStart; renderLibrary(); const n=$q('#lq'); n.focus(); n.setSelectionRange(pos,pos); }); }

// ---------- notation tab ----------
function renderNotation(){ const el=$q('#tab-notation'); const q=SH.nq.trim().toLowerCase();
  let list=NOTE.list.filter(e=>SH.nboth||e.track===SH.track);
  if (SH.nobt) list=list.filter(e=>e.obtained===SH.nobt||(SH.nobt==='calculated'&&e.obtained==='given or calculated')); if (SH.ngrp) list=list.filter(e=>e.group===SH.ngrp);
  if (q) list=list.filter(e=>(e.symbol+' '+e.meaning+' '+e.group+' '+e.unit).toLowerCase().includes(q));
  const scope=NOTE.list.filter(e=>SH.nboth||e.track===SH.track), grps=[...new Set(scope.map(e=>e.group))];
  const sections=grps.filter(g=>list.some(e=>e.group===g)).map(g=>`<section><h3>${esc2(g)}<small>${list.filter(e=>e.group===g).length}</small></h3><div class="ntab">${list.filter(e=>e.group===g).map(e=>`<button class="nr" data-act="nlk" data-key="${esc2(e.keys[0]||'')}" data-id="${e.id}"><span class="ns">${prettySym(e.symbol)}</span><span class="nm">${esc2(e.meaning)}</span><span class="nu">${esc2(e.unit)}</span><span class="nb ${esc2(e.obtained.replace(/ /g,'-'))}">${esc2(e.obtained)}</span>${SH.nboth?`<span class="nt" style="--tc:${trackDef(e.track).color}">${esc2(trackDef(e.track).name.split(' ')[0])}</span>`:`<span class="nw">W${esc2(e.weeks)}</span>`}</button>`).join('')}</div></section>`).join('');
  el.innerHTML=`<div class="phead"><div><h2>Notation <small>${esc2(trackDef(SH.track).name)}</small></h2><p class="pm">${list.length} of ${scope.length} symbols · click one for the lookup card</p></div>
    <div class="seg"><button data-act="nboth" class="${SH.nboth?'':'on'}">This track</button><button data-act="nboth" class="${SH.nboth?'on':''}" data-all="1">Both tracks</button></div>
    <select id="nobt"><option value="">How you get it: any</option>${Object.keys(NOTE.obtained).filter(k=>k!=='given or calculated').map(k=>`<option value="${k}"${SH.nobt===k?' selected':''}>${k}: ${esc2(NOTE.obtained[k])}</option>`).join('')}</select>
    <select id="ngrp"><option value="">Group: all</option>${grps.map(g=>`<option${SH.ngrp===g?' selected':''}>${esc2(g)}</option>`).join('')}</select>
    <input id="nq" type="search" placeholder="Search symbol or meaning…" value="${esc2(SH.nq)}"></div><div class="pgroups">${sections||'<p class="pm">Nothing matches.</p>'}</div>`;
  const inp=$q('#nq'); inp.addEventListener('input',()=>{ SH.nq=inp.value; const pos=inp.selectionStart; renderNotation(); const n=$q('#nq'); n.focus(); n.setSelectionRange(pos,pos); });
  $q('#nobt').addEventListener('change',e=>{ SH.nobt=e.target.value; renderNotation(); }); $q('#ngrp').addEventListener('change',e=>{ SH.ngrp=e.target.value; renderNotation(); }); }

// ---------- micro-lookup (Ctrl+K) ----------
function problemsUsing(key){ if (!SH._used){ SH._used={}; Object.values(CATALOG).filter(m=>m.engine==='decl').forEach(m=>{ DECL[m.id].nodes.forEach(n=>{ if (n.sym){ const k=nkey(String(n.sym).split(',')[0]); (SH._used[k]=SH._used[k]||new Set()).add(m.id); const b=k.replace(/\d+$/,''); if (b&&b!==k) (SH._used[b]=SH._used[b]||new Set()).add(m.id); } }); }); }
  return [...(SH._used[key]||[])].map(id=>CATALOG[id]).sort((a,b)=>(a.track===SH.track?0:1)-(b.track===SH.track?0:1)||a.week-b.week); }
function blocksUsing(key){ return (FM.leaves||[]).filter(l=>{ const k=symKeyOfLeaf(l); return k===key||k.replace(/\d+$/,'')===key; }); }
function openLookup(key){ $q('#nlk').classList.add('on'); SH.lk.q=key?'':SH.lk.q; SH.lk.sel=key||null; renderLookup(); setTimeout(()=>{ const i=$q('#nlkq'); if (i){ i.focus(); i.select(); } },10); }
function closeLookup(){ $q('#nlk').classList.remove('on'); }
function renderLookup(){ const box=$q('#nlkbody'); const q=SH.lk.q.trim().toLowerCase(); let res=[];
  if (SH.lk.sel){ res=NOTE.byKey[SH.lk.sel]?[...new Set(NOTE.byKey[SH.lk.sel])]:[]; }
  else if (q){ res=NOTE.list.filter(e=>(e.symbol+' '+e.meaning+' '+e.group).toLowerCase().includes(q)); const exact=e=>e.keys.some(k=>k.toLowerCase()===nkey(q).toLowerCase())?0:1; res.sort((a,b)=>exact(a)-exact(b)||(a.track===SH.track?0:1)-(b.track===SH.track?0:1)); res=res.slice(0,30); }
  const row=e=>`<button class="nr lr" data-act="nlk" data-key="${esc2(e.keys[0]||'')}" data-id="${e.id}"><span class="ns">${prettySym(e.symbol)}</span><span class="nm">${esc2(e.meaning)}</span><span class="nu">${esc2(e.unit)}</span><span class="nt" style="--tc:${trackDef(e.track).color}">${esc2(trackDef(e.track).name.split(' ')[0])}</span></button>`;
  if (SH.lk.sel && res.length){ const key=SH.lk.sel, blocks=blocksUsing(key), used=problemsUsing(key);
    box.innerHTML=`<button class="nback" data-act="nlkback">‹ all results</button>`+res.map(e=>`<div class="ncard" style="--tc:${trackDef(e.track).color}"><div class="nbig">${prettySym(e.symbol)}</div><div class="ninfo"><div class="nmean">${esc2(e.meaning)}</div>
      <div class="nrow"><span class="nu">${esc2(e.unit)}</span><span class="nb ${esc2(e.obtained.replace(/ /g,'-'))}">${esc2(e.obtained)}</span><span class="nt" style="--tc:${trackDef(e.track).color}">${esc2(trackDef(e.track).name)}</span><span class="nw">Week ${esc2(e.weeks)}</span></div>
      <p class="nhow"><b>${esc2(e.obtained)}:</b> ${esc2(NOTE.obtained[e.obtained]||'')}</p><p class="ngrp">${esc2(e.group)}${e.source?' · '+esc2(e.source):''}</p></div></div>`).join('')
      +(blocks.length?`<h4>In this problem</h4><div class="chips">${blocks.map(l=>`<button class="chip ${l.type}" data-act="nfocus" data-id="${l.id}">${labelOf(l.id)}${l.out&&l.type!=='gate'?' = '+esc2(valOf(l)):''}</button>`).join('')}</div>`:'')
      +(used.length?`<h4>Used in worked problems</h4><div class="chips">${used.slice(0,16).map(m=>`<button class="chip" data-act="open" data-id="${m.id}">${esc2(m.title)}</button>`).join('')}</div>`:'')
      +(res.length>1?`<p class="pm">This symbol means different things in different tracks: check the badge.</p>`:'');
  } else box.innerHTML=res.length?res.map(row).join(''):`<p class="pm">${q?'No symbol matches.':'Type a symbol (q<sub>f</sub>, cu, Nγ, Ps…) or a word (settlement, shaft…).'}</p>`; }

// ---------- events ----------
function shellWire(){
  document.addEventListener('click',e=>{ const b=e.target.closest('[data-act],[data-tab]'); if (!b) { if (e.target.id==='nlk') closeLookup(); return; }
    if (b.dataset.tab && b.closest('#tabs')){ setTab(b.dataset.tab); return; }
    const a=b.dataset.act, id=b.dataset.id;
    if (a==='tab') setTab(b.dataset.tab); else if (a==='track') setTrack(id);
    else if (a==='open'){ closeLookup(); if (String(id).startsWith('quiz:')){ SH.quiz.set=Math.max(0,(QUIZ||[]).filter(s=>s.track===SH.track).findIndex(s=>'quiz:'+s.id===id)); setTab('quiz'); } else openProblem(id); }
    else if (a==='gby'){ SH.groupBy=id; renderLibrary(); lsSet('shell',{track:SH.track,tab:SH.tab,groupBy:SH.groupBy}); }
    else if (a==='nlk'){ if (b.dataset.key) openLookup(b.dataset.key); else openLookup(); } else if (a==='nlkback'){ SH.lk.sel=null; renderLookup(); }
    else if (a==='nfocus'){ closeLookup(); setTab('map'); FM.multi.clear(); FM.sel=id; FM.open=new Set([id]); refreshLit(); renderInspector(); renderPops(); panAbove(id); }
    else if (a==='nboth'){ SH.nboth=!!b.dataset.all; renderNotation(); }
    else if (a==='pprev') stepProblem(-1); else if (a==='pnext') stepProblem(1);
    else if (a.startsWith('x') && ['xnew','xswap','xkey','xprint','xloadgo','xsolve'].includes(a)) examAct(a,id);
    else if (QUIZ_ACTS.has(a)) quizAct(a,id,b.dataset.n);
    else if (a==='nlkclose') closeLookup(); });
  document.addEventListener('keydown',e=>{ const typing=e.target.matches&&e.target.matches('input,select,textarea');
    if ((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); $q('#nlk').classList.contains('on')?closeLookup():openLookup(); return; }
    if (quizKey(e)){ e.preventDefault(); return; }
    if (e.key==='/'&&!typing){ e.preventDefault(); openLookup(); return; }
    if (e.key==='Escape'&&$q('#nlk').classList.contains('on')){ closeLookup(); return; } });
  $q('#nlkq').addEventListener('input',e=>{ SH.lk.q=e.target.value; SH.lk.sel=null; renderLookup(); });
  $q('#nlkq').addEventListener('keydown',e=>{ if (e.key==='Enter'){ const first=$q('#nlkbody .lr'); if (first){ SH.lk.sel=first.dataset.key; renderLookup(); } } });
  window.addEventListener('hashchange',()=>route()); }

// ---------- self-test: open page.html#selftest ----------
// compiles every declarative problem, lists any broken block, and checks each against its official answer
function runSelfTest(){ const rows=[]; let bad=0;
  Object.values(CATALOG).filter(m=>m.engine==='decl').forEach(m=>{ try{ const states=[...new Set((DECL[m.id].check||[]).filter(c=>c.when).map(c=>JSON.stringify(c.when)))].map(x=>JSON.parse(x)); if (!states.length) states.push({});          // one row per state of the inputs that has its own official answer
     states.forEach(st=>{ const p=compileDecl(DECL[m.id],{...defaultVals(DECL[m.id]),...st}); const errs=Object.keys(p.errs), goal=p.nodes.find(n=>n.goal);
      const vs=p.verify.map(x=>`<span class="${x.ok?'ok':'bad'}">${x.ok?'✓':'≠'} ${fmt(x.got)} vs ${fmt(x.exp)}</span>`).join(' ');
      if (errs.length||p.verify.some(x=>!x.ok)) bad++; rows.push(`<tr><td>${m.id}${Object.keys(st).length?' <small>'+esc2(JSON.stringify(st))+'</small>':''}</td><td>${goal?fmt(goal.val):'no goal block'}</td><td>${vs||'(no official value)'}</td><td class="bad">${errs.map(e=>e+': '+p.errs[e]).join('; ')}</td></tr>`); });
    }catch(e){ bad++; rows.push(`<tr><td>${m.id}</td><td colspan="3" class="bad">${esc2(e.message)}</td></tr>`); } });
  const pile=Object.values(CATALOG).filter(m=>m.engine!=='decl'&&m.engine!=='quiz').length;
  document.body.innerHTML=`<div class="selftest"><h2>Self-test: ${esc2(SUBJECT.name)}</h2><p>${rows.length} declarative problems, ${bad} needing attention. ${pile} problems come from adapters (not tested here).</p><table><tr><th>problem</th><th>answer here</th><th>official</th><th>errors</th></tr>${rows.join('')}</table></div>`; }

// ---------- boot ----------
function route(){ const h=(location.hash||'').replace(/^#/,'').split('/').filter(Boolean); const st=lsGet('shell',{});
  let track=SUBJECT.tracks.find(t=>t.id===h[0])?h[0]:(st.track||(SUBJECT.start&&SUBJECT.start.track)||SUBJECT.tracks[0].id);
  const tabs=['map','library','notation','quiz','exam']; const tab=tabs.includes(h[1])?h[1]:(h[0]&&tabs.includes(h[0])?h[0]:null);
  const pid=h[2]&&CATALOG[h[2]]?h[2]:(presetKey&&CATALOG[presetKey]&&CATALOG[presetKey].track===track?presetKey:((SUBJECT.start&&SUBJECT.start.track===track&&CATALOG[SUBJECT.start.problem])?SUBJECT.start.problem:(probList(track)[0]||{}).id));
  SH.groupBy=st.groupBy||'week'; SH.track=track; document.body.dataset.track=track; document.documentElement.style.setProperty('--trk',trackDef(track).color||'#2f6bea'); renderHeader();
  if (pid && pid!==presetKey){ setProblem(pid); SH.seen[pid]=1; }
  renderMapTitle(); setTab(tab||'map'); }
function boot(){ if (location.hash==='#selftest'){ runSelfTest(); return; } document.title=SUBJECT.name+' · flow map'; $q('#brand').innerHTML=`<b>${esc2(SUBJECT.short||SUBJECT.name)}</b><span>flow map</span>`;
  SH.seen=lsGet('seen',{}); if (EXAM){ $q('#examtab').hidden=false; examInit(); } buildNotation(); fmInit(); shellWire(); route(); cpInit(); }
window.addEventListener('DOMContentLoaded',boot);
