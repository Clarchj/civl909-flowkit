// ================= KIT · EXAM TAB: a generated, variable paper =================
// State {seed, swaps, key}: seed draws the whole paper, a swap re-draws ONE slot, the code (seed-swaps) rebuilds the same version anywhere.
const XS={st:null, paper:null};
function examInit(){ const s=lsGet('exam',null); XS.st=(s&&s.seed)?s:{seed:(Math.random()*1e9)|0, swaps:{}, key:false}; XS.st.swaps=XS.st.swaps||{}; }
function examSave(){ lsSet('exam',XS.st); }
function examMarks(){ return (XS.paper||[]).reduce((t,b)=>t+b.qs.reduce((u,q)=>u+q.marks,0),0); }
function examQuestionHTML(q){ const key=XS.st.key;
  const head=`<header><b>Q${q.n}</b><span class="xm">${q.marks} mark${q.marks>1?'s':''}</span><span class="xl">${esc2(q.label)}</span><span class="sp"></span><button class="ghostb xsw" data-act="xswap" data-id="${q.key}" title="Replace this question with another one from the same slot">↻ Swap</button></header>`;
  if (q.type==='mcq') return `<article class="xq">${head}<p class="xt">${q.text}</p><div class="xo">${q.options.map(o=>`<div class="${key&&o.ok?'ok':''}"><b>${o.k}</b><span>${o.t}</span></div>`).join('')}</div>
    ${key?`<div class="xk"><b>Answer ${q.answer}.</b> ${q.why||''}${q.link&&CATALOG[q.link]?` <button class="qchip go" data-act="open" data-id="${esc2(q.link)}">Worked problem ▸</button>`:''}</div>`:''}</article>`;
  return `<article class="xq">${head}<p class="xt">${q.text}</p><p class="xa">${q.asks.map(a=>esc2(a.label)).join(' · ')}</p>
    ${key?`<div class="xk"><b>Answer:</b> ${q.asks.map(a=>`${esc2(a.label)} = <b>${a.text}</b> ${esc2(a.unit)}`).join(' &nbsp;·&nbsp; ')}<br><button class="qchip go" data-act="xsolve" data-id="${q.n}">Worked solution on the map (with these numbers) ▸</button></div>`:''}</article>`; }
function renderExam(){ const el=$q('#tab-exam'); if (!el) return; if (!XS.st) examInit(); XS.paper=examBuild(XS.st); const st=XS.st, code=examCode(st);
  el.innerHTML=`<div class="xhead"><div><h2>${esc2(EXAM.title||'Exam')} <small>practice paper</small></h2><p class="pm">${esc2(EXAM.intro||'')}</p></div>
    <div class="xtool"><span class="xcode" title="The version code rebuilds this exact paper">Version <b>${code}</b></span><input id="xload" placeholder="paste a version code" size="16"><button class="ghostb" data-act="xloadgo">Load</button>
    <button class="ghostb" data-act="xnew">New version</button><button class="ghostb ${st.key?'on':''}" data-act="xkey">Answer key</button><button class="ghostb" data-act="xprint">Print</button></div></div>
    <div class="xmeta"><span>${esc2(EXAM.time||'')}</span><span>Total <b>${examMarks()}</b> marks</span><span>${XS.paper.reduce((t,b)=>t+b.qs.length,0)} questions</span><span>Swap one question and the others stay; share the version code to get the same paper.</span></div>
    ${XS.paper.reduce((h,b,i,a)=>{ const first=!i||a[i-1].sec.id!==b.sec.id; return h+(first?`<h3 class="xsec">${esc2(b.sec.title)}<small>${esc2(b.sec.note||'')}</small></h3>`:'')+b.qs.map(examQuestionHTML).join(''); },'')}
    ${st.key?`<div class="xkeyhint">Answer key shown. Switch it off before printing the paper for a student.</div>`:''}`; }
function examAct(a,id){ const st=XS.st;
  if (a==='xnew'){ st.seed=(Math.random()*1e9)|0; st.swaps={}; }
  else if (a==='xswap'){ st.swaps[id]=((st.swaps[id]||0)+1); }
  else if (a==='xkey'){ st.key=!st.key; }
  else if (a==='xprint'){ window.print(); return; }
  else if (a==='xloadgo'){ const p=examParse(($q('#xload')||{}).value||''); if (!p){ toast('That is not a version code (like K3F9A2-0.1.0.0)'); return; } st.seed=p.seed; st.swaps=p.swaps; }
  else if (a==='xsolve'){ const q=XS.paper.flatMap(b=>b.qs).find(x=>x.n===+id); if (!q) return; openProblem(q.problem); Object.assign(S.vals,q.overrides); recompute(); return; }
  examSave(); renderExam(); }
