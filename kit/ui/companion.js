// ================= KIT · COMPANION: everything a student needs beside the flow map =================
// Learned from the old pile explorer (question panel, worked solution, drawings, "check your answer", flags), rebuilt around first principles:
//   a map shows HOW things relate; a student also needs  what was asked (Question) · what it looks like (Picture) · the working written
//   out in order (Solution, linked to the map) · why, and what to watch for (Notes) · and a way to test themselves (Check / Practice).
// Tabs:  Question · Picture · Solution · Lecture (only when the subject has pictures) · Notes.   Open/closed with the Companion button (remembered).
const CP={tab:'question', follow:true, open:true, scroll:{}};
const CP_TABS=[['question','Question'],['picture','Picture'],['solution','Solution'],['teardown','Teardown'],['lecture','Lecture'],['notes','Notes']];
const cpTabs=()=>CP_TABS.filter(([k])=>k!=='lecture'||(typeof MEDIA!=='undefined'&&MEDIA&&Object.keys(MEDIA.items).length));
// a picture from the subject's media folder (the page a question was set on, a lecture slide): click to enlarge; says so if the file is not beside the page
function mediaImg(id){ const m=typeof MEDIA!=='undefined'&&MEDIA&&MEDIA.items[id]; if (!m) return '';
  return `<figure class="mfig ${m.kind}" data-act="zoomimg" data-id="${esc2(id)}" title="Click to enlarge"><img src="${MEDIA.base+m.file}" width="${m.w}" height="${m.h}" loading="lazy" alt="${esc2(m.cap)}" onerror="this.closest('figure').classList.add('miss')"><span class="mzm">⤢</span>
    <figcaption><b>${esc2(m.from)}</b>${m.kind==='slide'?' · '+esc2(m.cap):''}</figcaption><div class="mmiss">Picture not found. Keep the <code>${esc2(MEDIA.base)}</code> folder next to this file.</div></figure>`; }

function cpInit(){ CP.open=lsGet('comp', window.innerWidth>=1100); CP.tab=lsGet('cptab','question'); FM.practice=lsGet('practice',false);
  document.body.classList.toggle('comp-on',CP.open); $q('#cbtn').classList.toggle('on',CP.open);
  $q('#compbody').addEventListener('scroll',()=>{ CP.scroll[CP.tab]=$q('#compbody').scrollTop; if (CP.tab!=='solution'||!CP.follow) return; clearTimeout(CP._t);
    CP._t=setTimeout(()=>{ const body=$q('#compbody'), top=body.getBoundingClientRect().top+70; let best=null; $qa('.wst[data-step]',body).forEach(sec=>{ const r=sec.getBoundingClientRect(); if (r.top<=top&&r.bottom>top) best=sec.dataset.step; });
      if (best&&best!==CP._cur){ CP._cur=best; focusStep(best); } },220); });
  document.addEventListener('click',e=>{ const b=e.target.closest('[data-cp]'); if (!b) return; const a=b.dataset.cp, id=b.dataset.id;
    if (a==='tab'){ CP.tab=id; lsSet('cptab',id); renderCompanion(); } else if (a==='toggle') cpToggle();
    else if (a==='leaf') focusLeaf(id); else if (a==='step'){ CP._cur=id; focusStep(id); }
    else if (a==='check') cpCheck(); else if (a==='follow'){ CP.follow=b.checked; }
    else if (a==='td'||a==='tddead') tdAct(a,id);
    else if (a==='lec'){ CP.tab='lecture'; CP.jump=id; lsSet('cptab','lecture'); renderCompanion(); } });
  tdInit();
  // sliders, switches and the dragged water table under a profile picture: redraw the picture live and keep the control in the page
  const live=(id,val)=>{ setPath('vals.'+id,val); CP.live=true; try{ recompute(); } finally { CP.live=false; } };
  document.addEventListener('input',e=>{ const r=e.target.closest&&e.target.closest('[data-ctl=range]'); if (r) live(r.dataset.id,parseFloat(r.value)); });
  document.addEventListener('change',e=>{ const r=e.target.closest&&e.target.closest('[data-ctl=range]'); if (r) renderCompanion(); });
  document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('[data-ctl=set]'); if (b){ setPath('vals.'+b.dataset.id,+b.dataset.val); recompute(); } });
  let wt=null;
  document.addEventListener('pointerdown',e=>{ const h=e.target.closest&&e.target.closest('.wtdrag'); if (!h) return; e.preventDefault(); wt={id:h.dataset.id,y0:+h.dataset.y0,s:+h.dataset.s,max:+h.dataset.max}; });
  document.addEventListener('pointermove',e=>{ if (!wt) return; const svg=$q('#compbody .scn'); if (!svg) return; const pt=svg.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY; const p=pt.matrixTransform(svg.getScreenCTM().inverse());
    const d=Math.max(0,Math.min(wt.max,Math.round((p.y-wt.y0)/wt.s*10)/10)); if (d!==FM.prog.vals[wt.id]) live(wt.id,d); });
  const endDrag=()=>{ if (wt){ wt=null; renderCompanion(); } }; document.addEventListener('pointerup',endDrag); document.addEventListener('pointercancel',endDrag);
  renderCompanion(); if (CP.open) setTimeout(()=>{ if (FM.LAY&&FM.view.clientWidth) firstView(); },40); }
function cpToggle(open){ CP.open=open===undefined?!CP.open:open; lsSet('comp',CP.open); document.body.classList.toggle('comp-on',CP.open); $q('#cbtn').classList.toggle('on',CP.open); if (CP.open) renderCompanion(); setTimeout(()=>{ if (FM.LAY&&FM.view.clientWidth){ applyVP(); fit(true); } },60); }
function focusLeaf(id){ if (!FM.leaf[id]) return; FM.multi.clear(); FM.focus=null; FM.sel=id; refreshLit(); renderInspector(); centerOn(id); }
function focusStep(gid){ const g=FM.groups[gid]; if (!g) return; FM.sel=null; FM.multi.clear(); FM.focus=new Set(g.ids); FM.open.clear(); renderPops(); refreshLit(); renderInspector(); const r=FM.fr&&FM.fr[gid]; if (r&&FM.view.clientWidth) fitRectOf(r,1,60); }

function renderCompanion(){ const body=$q('#compbody'); if (!body||!CP.open||!FM.prog) return; const keep=CP.scroll[CP.tab]||0;
  if (CP.live&&CP.tab==='picture'){ const bx=$q('.scnbox',body); if (bx){ bx.innerHTML=sceneSVG(FM.prog.scene,FM.prog.vals); $qa('[data-for]',body).forEach(el=>{ const id=el.dataset.for; if (id in FM.prog.vals) el.textContent=fmt(FM.prog.vals[id])+(el.dataset.unit?' '+el.dataset.unit:''); }); return; } }
  if (!cpTabs().some(t=>t[0]===CP.tab)) CP.tab='question';
  $q('#comptabs').innerHTML=cpTabs().map(([k,n])=>`<button data-cp="tab" data-id="${k}" class="${CP.tab===k?'on':''}">${n}</button>`).join('')+`<button class="cx" data-cp="toggle" title="Hide the companion">×</button>`;
  body.innerHTML={question:cpQuestion, picture:cpPicture, solution:cpSolution, teardown:cpTeardown, lecture:cpLecture, notes:cpNotes}[CP.tab](); body.scrollTop=keep;
  if (CP.jump){ const el=$q(`[data-lstep="${CP.jump}"]`,body); CP.jump=null; if (el) body.scrollTop=el.offsetTop-12; } }

const cpGoal=()=>FM.leaves.find(l=>l.goal);
// validity checks that are firing (gates with warn:true): said at the top of the Question and Solution tabs
const cpWarns=()=>{ const W=(FM.prog&&FM.prog.warns)||[]; return W.length?`<div class="warnbox"><b>Check the inputs</b><ul>${W.map(w=>`<li>${w.msg}${w.info?`<span class="cm"> ${w.info}</span>`:''}</li>`).join('')}</ul></div>`:''; };
const cpSym=l=>symOf(l);
function cpRow(l){ return `<li data-cp="leaf" data-id="${l.id}"><b>${cpSym(l)}</b> = ${esc2(vtext(l))}${unitOf(l)?' '+esc2(unitOf(l)):''}${l.out&&l.out.info?`<span class="cm"> ${l.out.info}</span>`:''}</li>`; }

// ---------- Question ----------
function cpQuestion(){ const m=CATALOG[presetKey]||{}, G=cpGoal(), tr=trackDef(m.track), td=typeDef(m.track,m.type);
  const inputs=FM.leaves.filter(l=>l.type==='input'), consts=FM.leaves.filter(l=>l.type==='const');
  const needed=l=>G?(l.id===G.id||FM.down[l.id].has(G.id)):true; const unused=[...inputs,...consts].filter(l=>!needed(l)), unusedIds=new Set(unused.map(l=>l.id));
  let h=`<div class="cq"><div class="cqr"><span class="cwk">${m.week?'Week '+m.week:'Free play'}</span><span class="cty" style="--c:${td.color}">${esc2(td.name)}</span><span class="csr">${esc2(SRC_NAME[m.source]||m.source||'')}</span></div>
    <h3>${esc2(m.title||'')}${m.sub?`<small>${esc2(m.sub)}</small>`:''}</h3>${cpWarns()}
    ${(ORIGINS[presetKey]||{ids:[]}).ids.length?`<div class="cqorig"><div class="k">As set</div>${ORIGINS[presetKey].ids.map(mediaImg).join('')}${ORIGINS[presetKey].note?`<p class="cm">${ORIGINS[presetKey].note}</p>`:''}<div class="k">Transcribed</div></div>`:''}
    <div class="cqtext">${m.text||'<i>The question text is not recorded for this problem.</i>'}</div>`;
  if (G) h+=`<h4>What it asks</h4><p>Find <b>${cpSym(G)}</b>${G.out.info?': '+G.out.info:''}${G.out.unit?' (in '+esc2(G.out.unit)+')':''}.</p>`;
  h+=`<h4>Given in the question</h4><ul class="cl">${inputs.filter(l=>!unusedIds.has(l.id)).map(cpRow).join('')||'<li><i>no inputs</i></li>'}</ul>`;
  if (unused.length) h+=`<h4>Given, but not needed</h4><p class="cm">These do not reach the answer: the question includes them on purpose (or as a trap).</p><ul class="cl faint">${unused.map(cpRow).join('')}</ul>`;
  const used=consts.filter(l=>!unusedIds.has(l.id)); if (used.length) h+=`<h4>Fixed by a rule or read from a chart</h4><ul class="cl">${used.map(cpRow).join('')}</ul>`;
  h+=`<h4>Check your answer</h4><div class="cchk">`;
  if (G) h+=`<label>${cpSym(G)}</label><input id="cpans" type="text" inputmode="decimal" placeholder="your value"><span class="cu">${esc2(G.out.unit||'')}</span><button data-cp="check">Check</button><button class="ghostb" data-act="revall">Reveal everything</button>`;
  h+=`</div><div id="cpmsg" class="cmsg"></div><p class="cm">Within 3 % counts as right: course answers are rounded.${m.answer?' '+m.answer:''}</p>
    <label class="chk"><input type="checkbox" data-act="practice" ${FM.practice?'checked':''}> <span>Practice: hide every result on the map until I check or reveal it</span></label>`;
  return h+'</div>'; }
function cpCheck(){ const G=cpGoal(); const x=parseFloat(String(($q('#cpans')||{}).value||'').replace(/,/g,'')), msg=$q('#cpmsg'); if (!G||!msg) return;
  if (!isFinite(x)){ msg.className='cmsg'; msg.textContent='Type a number first.'; return; }
  const v=G.out.val, ok=Math.abs(x-v)<=Math.max(0.03*Math.abs(v),1e-6);
  if (ok){ msg.className='cmsg ok'; msg.textContent='Right: '+fmt(v)+(G.out.unit?' '+G.out.unit:'')+'. The working is on the map and in the Solution tab.'; FM.known=new Set(FM.leaves.map(l=>l.id)); render(true); }
  else { msg.className='cmsg bad'; msg.textContent='Not quite ('+fmt(x)+'). Look at the units, the steps and the inputs, then try again, or reveal.'; } }

// ---------- Picture ----------
function cpPicture(){ const sc=FM.prog.scene, m=CATALOG[presetKey]||{};
  if (!sc) return `<div class="cq"><h3>Picture</h3><p class="cm">There is no drawing for this problem yet. A problem can carry a <code>scene</code> (see SCHEMA.md): the picture is drawn from its own numbers and redraws when you edit an input.</p></div>`;
  return `<div class="cq"><h3>Picture<small>drawn from the numbers on the map</small></h3><div class="scnbox">${sceneSVG(sc,FM.prog.vals)}</div>${sceneControls(sc,FM.prog.vals)}${sc.caption?`<p class="cm">${sc.caption}</p>`:''}<p class="cm">Edit an input on the map (click a purple block) and this redraws.</p></div>`; }

// ---------- Solution: the working written out in order, linked to the map ----------
function wItem(l){ const n=l.node, mk=masked(l), eq=eqParts(l), id=l.id;
  if (l.type==='const') return `<div class="wi const" data-cp="leaf" data-id="${id}"><div class="wv">Take <b>${cpSym(l)}</b> = ${esc2(valOf(l))}</div>${l.out.info?`<div class="wh">${l.out.info}</div>`:''}</div>`;
  if (l.type==='gate') return `<div class="wi gate" data-cp="leaf" data-id="${id}"><div class="wv">Decision: ${n.test||l.name}</div><div class="wr">${mk?'?':(n.val?'Yes · '+n.yes:'No · '+n.no)}</div>${n.info?`<div class="wh">${n.info}</div>`:''}</div>`;
  const how=mk?[]:howSteps(l,!!eq); const fk=fnKind(l);
  return `<div class="wi" data-cp="leaf" data-id="${id}"><div class="wv">${n.name}<span class="wk">${fk.name}</span></div>
    ${eq?`<div class="we"><div class="e1">${eq.sym}</div>${eq.num&&!mk?`<div class="e2">= ${eq.num}</div>`:''}<div class="e3">= ${mk?'?':esc2(valOf(l))}</div></div>`:`<div class="we">${n.rule&&!mk?`<div class="e2">${n.rule}</div>`:''}<div class="e3">${l.out.name} = ${mk?'?':esc2(valOf(l))}</div></div>`}
    ${l.chart&&!mk?`<div class="wc" data-act="zoomchart" data-id="${id}" title="Click to enlarge">${chartHTML(l.chart)}</div>`:''}
    ${how.length?`<details class="wd"><summary>How it was found</summary>${how.map(x=>`<p>${x}</p>`).join('')}</details>`:''}</div>`; }
function cpSolution(){ const N=NOTES[presetKey]||{}, G=cpGoal(), P=FM.prog; let h=`<div class="ws">${cpWarns()}<label class="chk"><input type="checkbox" data-cp="follow" ${CP.follow?'checked':''}> <span>Follow while reading: the map shows the step you read</span></label>`;
  if (N.idea) h+=`<p class="widea">${N.idea}</p>`;
  h+=`<h4>Given</h4><ul class="cl">${FM.leaves.filter(l=>l.type==='input').map(cpRow).join('')}</ul>`;
  if (G) h+=`<h4>Goal</h4><p>Find <b>${cpSym(G)}</b>${G.out.info?': '+G.out.info:''}.</p>`;
  const stepped=new Set();
  P.steps.forEach((st,i)=>{ const items=FM.leaves.filter(l=>l.step===st.key&&l.type!=='input').sort((a,b)=>FM.order[a.id]-FM.order[b.id]); items.forEach(l=>stepped.add(l.id)); if (!items.length) return;
    h+=`<section class="wst" data-step="S:${st.key}"><h3 data-cp="step" data-id="S:${st.key}"><b>${i+1}</b>${esc2(st.title)}${lessonItems(st.key).length?`<button class="lecchip" data-cp="lec" data-id="${st.key}" title="The lecture slides for this step">Slides</button>`:''}</h3>${(N.steps||{})[st.key]?`<p class="why">${N.steps[st.key]}</p>`:''}${items.map(wItem).join('')}</section>`; });
  if (G){ h+=`<section class="wst ans"><h3><b>✓</b>Answer</h3><div class="we"><div class="e3">${cpSym(G)} = ${esc2(valOf(G))}</div></div>${(P.verify||[]).map(x=>`<p class="vf ${x.ok?'ok':'bad'}">${x.ok?'✓ matches':'≠ differs from'} the official ${esc2(x.label||'answer')} ${fmt(x.exp)}${x.unit?' '+esc2(x.unit):''}${x.ok?'':' (here '+fmt(x.got)+')'}${x.note?'<br><span class="cm">'+x.note+'</span>':''}</p>`).join('')}${(CATALOG[presetKey]||{}).answer?`<p class="cm">${CATALOG[presetKey].answer}</p>`:''}</section>`; }
  return h+'</div>'; }

// ---------- Lecture: the slides each step draws on, with a line on how they are used in THIS problem ----------
const lessonItems=key=>(LESSONS[presetKey]||[]).filter(it=>it.step===key);
function lessonText(it){ try{ return typeof it.text==='function'?it.text(FM.prog.vals||{}):(it.text||''); }catch(e){ return ''; } }
function lessonItem(it){ const t=lessonText(it); return `<div class="lit">${t?`<p class="lt">${t}</p>`:''}${it.slides.map(mediaImg).join('')}</div>`; }
function cpLecture(){ const all=LESSONS[presetKey]||[], P=FM.prog, m=CATALOG[presetKey]||{};
  if (!all.length) return `<div class="cq"><h3>Lecture</h3><p class="cm">No lecture slides are linked to this problem yet. A problem can carry a <code>Lesson('${esc2(presetKey)}', [...])</code> (see SCHEMA.md): the slides its working uses, each with a line on how.</p></div>`;
  const known=new Set(P.steps.map(s=>s.key)), whole=all.filter(it=>!it.step), stray=all.filter(it=>it.step&&!known.has(it.step)&&!it.soft);
  const weeks=[...new Set(all.flatMap(it=>it.slides).map(id=>{ const x=MEDIA.items[id]; return x&&x.kind==='slide'?(x.from.match(/Week \d+/)||[''])[0]:''; }).filter(Boolean))];
  let h=`<div class="cq lec"><h3>Lecture<small>${weeks.length?esc2(weeks.join(', ')+' slides'):'slides'} this working draws on. Click a slide to enlarge it.</small></h3>`;
  if (whole.length) h+=`<h4>The idea in the lecture</h4>${whole.map(lessonItem).join('')}`;
  P.steps.forEach((st,i)=>{ const its=lessonItems(st.key); if (!its.length) return;
    h+=`<section class="wst lsec" data-lstep="${st.key}"><h3 data-cp="step" data-id="S:${st.key}"><b>${i+1}</b>${esc2(st.title)}</h3>${its.map(lessonItem).join('')}</section>`; });
  if (stray.length) h+=`<h4>Also relevant</h4>${stray.map(lessonItem).join('')}`;
  return h+'</div>'; }

// ---------- Notes: the idea, what to watch, conventions, symbols, related problems ----------
function cpNotes(){ const N=NOTES[presetKey]||{}, m=CATALOG[presetKey]||{}; let h='<div class="cq">';
  h+=`<h3>Notes</h3>`; if (N.idea) h+=`<h4>The idea</h4><p>${N.idea}</p>`; else h+=`<p class="cm">No notes written for this problem yet (add <code>Notes('${esc2(presetKey)}', {idea, steps, traps, assumed})</code>).</p>`;
  if ((N.traps||[]).length) h+=`<h4>Watch for</h4><ul class="cl bul">${N.traps.map(t=>`<li>${t}</li>`).join('')}</ul>`;
  const asm=[...(N.assumed||[]),...((FM.prog.verify||[]).filter(x=>x.note).map(x=>x.note)),...FM.leaves.filter(l=>l.type==='input'&&l.out.info&&/official|solution|assum|not given|taken as/i.test(l.out.info)).map(l=>cpSym(l)+': '+l.out.info)];
  if (asm.length) h+=`<h4>Conventions and flags</h4><ul class="cl bul">${asm.map(t=>`<li>${t}</li>`).join('')}</ul>`;
  const keys=[...new Set(FM.leaves.map(symKeyOfLeaf))]; const rows=keys.map(k=>({k,e:notesFor(k)[0]})).filter(x=>x.e);
  h+=`<h4>Symbols in this problem</h4>${rows.length?`<div class="ntab cn">${rows.map(({k,e})=>`<button class="nr" data-act="nlk" data-key="${esc2(k)}"><span class="ns">${prettySym(e.symbol.split(/,\s*/).find(p=>nkey(p)===k)||e.symbol)}</span><span class="nm">${esc2(e.meaning)}</span><span class="nu">${esc2(e.unit)}</span><span class="nb ${esc2(e.obtained.replace(/ /g,'-'))}">${esc2(e.obtained)}</span></button>`).join('')}</div>`:'<p class="cm">None of the symbols are in the notation sheet.</p>'}`;
  const rel=Object.values(CATALOG).filter(x=>x.id!==presetKey&&x.track===m.track&&x.type===m.type&&x.engine!=='quiz').slice(0,8);
  if (rel.length) h+=`<h4>More of this type: ${esc2(typeDef(m.track,m.type).name)}</h4><div class="chips">${rel.map(x=>`<button class="chip" data-act="open" data-id="${x.id}">${esc2(x.title)}</button>`).join('')}</div>`;
  return h+'</div>'; }
