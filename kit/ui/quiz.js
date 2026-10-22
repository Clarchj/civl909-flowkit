// ================= KIT · QUIZ TAB: a focused study view, built on precedent =================
// Learned from: one question per screen when you want instant feedback, with a visible progress indicator (UX StackExchange 62405);
// Quizlet's 2021 study-mode redesign (no sidebar, the same interaction everywhere, feedback in place, the CORRECT answer emphasised);
// HackerRank / Edulace style exam pages (a question grid to jump, practice vs test mode, flag for review, keyboard access, text size).
// Views: Focus (one question, grid on the left), List (everything, grouped). Modes: Practice (feedback at once) and Test (answers kept
// quiet until you finish, then a score by topic). Preferences are remembered per browser.
const SH_QUIZ_DEFAULT={set:0, wk:'', kind:'', pat:'', src:'', status:'', likely:false, view:'focus', mode:'practice', size:1, shuffle:false, idx:0, fil:false, pred:false, sum:false};
const QSRC={exam:'Exam',tutorial:'Tutorial',lecture:'Lecture',external:'External'};
const qk=x=>String(x.id||x.n);
const quizSets=()=>(QUIZ||[]).filter(s=>s.track===SH.track);
function quizPrefs(){ const Q=SH.quiz; if (Q._ready) return; Q._ready=true; Object.assign(Q,SH_QUIZ_DEFAULT,lsGet('quizprefs',{}),{idx:0,fil:false,sum:false,set:Q.set||0}); }
const quizSavePrefs=()=>{ const Q=SH.quiz; lsSet('quizprefs',{view:Q.view,mode:Q.mode,size:Q.size,shuffle:Q.shuffle,wk:Q.wk,kind:Q.kind,src:Q.src,likely:Q.likely}); };
// stores: practice answers 'quiz.<set>', test answers 'quizt.<set>', test finished 'quizd.<set>', flags 'quizf.<set>'
const quizStore=set=>({P:lsGet('quiz.'+set.id,{}), T:lsGet('quizt.'+set.id,{}), D:lsGet('quizd.'+set.id,false), F:lsGet('quizf.'+set.id,{})});
function quizState(set,x,st){ const k=qk(x), test=SH.quiz.mode==='test', a=test?st.T[k]:st.P[k]; const rev=test?(st.D&&!!a):!!a; return {k,a,rev,right:a===x.answer,flag:!!st.F[k]}; }
function quizQueue(set,st){ const Q=SH.quiz; let q=set.items.filter(x=>(!Q.wk||String(x.week)===Q.wk)&&(!Q.kind||x.kind===Q.kind)&&(!Q.pat||x.pattern===Q.pat)&&(!Q.src||x.source===Q.src)&&(!Q.likely||(x.likely||0)>=3));
  if (Q.status){ q=q.filter(x=>{ const s=quizState(set,x,st); return Q.status==='todo'?!s.a:Q.status==='wrong'?(s.a&&!s.right):Q.status==='flag'?s.flag:true; }); }
  if (Q.shuffle){ const r=xrng(xhash(set.id)); q=xshuffle(q,r); } return q; }
const quizActiveFilters=()=>{ const Q=SH.quiz; return [Q.wk,Q.kind,Q.pat,Q.src,Q.status,Q.likely].filter(Boolean).length; };

function quizOptions(set,x,s){ const test=SH.quiz.mode==='test';
  return `<div class="qo">${Object.entries(x.options).map(([k,t])=>{ let c=''; if (s.rev){ c=k===x.answer?'ok':(k===s.a?'no':''); } else if (s.a===k) c='sel';
    return `<button data-act="qans" data-n="${esc2(s.k)}" data-id="${k}" class="${c}" ${s.rev||(!test&&s.a)?'disabled':''} aria-label="Option ${k}"><b>${k}</b><span>${t}</span></button>`; }).join('')}</div>`; }
function quizFeedback(set,x,s){ if (!s.rev) return ''; const lk=x.link&&CATALOG[x.link];
  return `<div class="qw ${s.right?'good':'bad'}"><b>${s.right?'Correct.':'The answer is '+x.answer+'.'}</b> ${x.why||''}${x.flag?`<p class="qf">† ${x.flag}</p>`:''}${x.orig?`<p class="qf">From: ${esc2(x.orig)}</p>`:''}
    ${(x.symbols&&x.symbols.length)||lk?`<div class="qsy">${(x.symbols||[]).map(sy=>`<button class="qchip" data-act="nlk" data-key="${esc2(nkey(sy.split(/,\s*/)[0]))}">${prettySym(sy.split(/,\s*/).join(', '))}</button>`).join('')}${lk?`<button class="qchip go" data-act="open" data-id="${esc2(x.link)}">Worked problem: ${esc2(lk.title)} ▸</button>`:''}</div>`:''}</div>`; }
function quizMeta(set,x){ const pat=(set.patterns||[]).find(p=>p.id===x.pattern); return `<div class="qmeta"><b>${x.id?esc2(x.id):'Q'+x.n}</b><span>${x.marks} mark${x.marks>1?'s':''}</span><span>Week ${x.week}</span>${pat?`<span class="qt">${esc2(pat.name)}</span>`:`<span class="qt">${esc2(x.topic||'')}</span>`}<span class="qk ${x.kind}">${x.kind}</span>${x.source?`<span class="qs ${x.source}">${QSRC[x.source]||x.source}</span>`:''}${x.likely?`<span class="ql" title="How likely a question like this is on the final (my judgement)">${'●'.repeat(x.likely)}${'○'.repeat(3-x.likely)}</span>`:''}</div>`; }
function quizCard(set,x,st){ const s=quizState(set,x,st); return `<article class="qc ${s.rev?(s.right?'right':'wrong'):''}">${quizMeta(set,x)}<p class="qq">${x.q}</p>${quizOptions(set,x,s)}${quizFeedback(set,x,s)}</article>`; }

function quizPalette(set,q,st){ const Q=SH.quiz; return `<nav class="qpal" aria-label="Question grid">${q.map((x,i)=>{ const s=quizState(set,x,st); const c=[i===Q.idx?'cur':'',s.rev?(s.right?'ok':'bad'):(s.a?'ans':''),s.flag?'flag':''].join(' ');
  return `<button data-act="qgo" data-id="${i}" class="${c}" title="${esc2(x.id||('Q'+x.n))}${s.flag?' · flagged':''}">${i+1}</button>`; }).join('')}</nav>`; }
function quizSummary(set,st){ const Q=SH.quiz, q=quizQueue(set,st), test=Q.mode==='test'; const rows=q.map(x=>({x,s:quizState(set,x,st)})), ans=rows.filter(r=>r.s.a), ok=ans.filter(r=>r.s.a===r.x.answer), pct=ans.length?Math.round(100*ok.length/ans.length):0;
  const by={}; ans.forEach(r=>{ const key=r.x.pattern||('W'+r.x.week); (by[key]=by[key]||{n:0,ok:0}); by[key].n++; if (r.s.a===r.x.answer) by[key].ok++; });
  const name=k=>((set.patterns||[]).find(p=>p.id===k)||{}).name||k;
  const list=Object.entries(by).sort((a,b)=>(a[1].ok/a[1].n)-(b[1].ok/b[1].n));
  return `<div class="qsum"><h3>${test&&!st.D?'Finish the test?':'Results'}</h3>${test&&!st.D?`<p class="qbig"><b>${ans.length}</b> / ${q.length} answered <span></span></p>`:`<p class="qbig"><b>${ok.length}</b> / ${ans.length} answered correctly <span>${pct} %</span> · ${q.length-ans.length} not answered</p>`}
    ${test&&!st.D?`<p class="pm">Your answers stay hidden until you finish. You can still go back and change them.</p><button class="primb" data-act="qfinish">Finish and see the answers</button>`:''}
    ${list.length&&(!test||st.D)?`<h4>By topic, weakest first</h4><div class="qbars">${list.map(([k,v])=>`<div><span>${esc2(name(k))}</span><div class="qb"><i style="width:${Math.round(100*v.ok/v.n)}%"></i></div><em>${v.ok}/${v.n}</em></div>`).join('')}</div>`:''}
    <div class="qsumb">${rows.some(r=>r.s.a&&r.s.a!==r.x.answer&&(!test||st.D))?`<button class="ghostb" data-act="qstat" data-id="wrong">Review the wrong ones</button>`:''}<button class="ghostb" data-act="qstat" data-id="todo">Only unanswered</button><button class="ghostb" data-act="qretake">${test?'Retake the test':'Reset answers'}</button><button class="ghostb" data-act="qsumx">Back to questions</button></div></div>`; }

function quizFilters(set){ const Q=SH.quiz, pats=set.patterns||[], weeks=[...new Set(set.items.map(x=>x.week))].sort((a,b)=>a-b), srcs=[...new Set(set.items.map(x=>x.source).filter(Boolean))];
  const seg=(act,cur,list)=>`<div class="seg">${list.map(([k,n])=>`<button data-act="${act}" data-id="${k}" class="${cur===k?'on':''}">${n}</button>`).join('')}</div>`;
  return `<div class="qfil"><label>Week</label>${seg('qwk',Q.wk,[['','All'],...weeks.map(w=>[String(w),'W'+w])])}<label>Kind</label>${seg('qkind',Q.kind,[['','All'],['concept','Concept'],['calc','Calculation']])}
    ${srcs.length>1?`<label>Source</label>${seg('qsrc',Q.src,[['','Any'],...srcs.map(k=>[k,QSRC[k]||k])])}`:''}<label>Show</label>${seg('qstat',Q.status,[['','All'],['todo','Unanswered'],['wrong','Wrong'],['flag','Flagged']])}
    ${pats.length?`<label>Topic</label><select id="qpat"><option value="">All topics</option>${pats.map(p=>`<option value="${p.id}"${Q.pat===p.id?' selected':''}>${esc2(p.name)}</option>`).join('')}</select><button class="ghostb ${Q.likely?'on':''}" data-act="qlik">● Likely on the final</button>`:''}
    <button class="ghostb" data-act="qclear">Clear filters</button></div>`; }
function quizPrediction(set,st){ const pats=set.patterns||[]; if (!pats.length) return '';
  return `<details class="qpred"${SH.quiz.pred?' open':''}><summary>Final exam prediction <small>my judgement from the mid-session paper, lecture emphasis and tutorials; not a fact</small></summary>${set.predNote?`<p class="qpn2">${set.predNote}</p>`:''}
    <div class="qpt">${[...pats].sort((a,b)=>b.weight-a.weight).map(p=>{ const its=set.items.filter(x=>x.pattern===p.id), ans=its.filter(x=>st.P[qk(x)]||st.T[qk(x)]).length, ok=its.filter(x=>(st.P[qk(x)]||st.T[qk(x)])===x.answer).length;
      return `<div class="qpr"><div class="qpn"><b>${esc2(p.name)}</b><small>${esc2(p.blurb)}</small><i>${esc2(p.why)}</i></div><div class="qpb" title="chance a question of this kind is on the final"><span style="width:${p.weight}%"></span><em>${p.weight}%</em></div><div class="qpc">${its.length} questions<small>${ans?ok+'/'+ans+' right':'not tried'}</small></div><button class="ghostb" data-act="qpat" data-id="${p.id}">Practise</button></div>`; }).join('')}</div></details>`; }

function renderQuiz(){ quizPrefs(); const el=$q('#tab-quiz'), sets=quizSets();
  if (!sets.length){ el.innerHTML=`<div class="phead"><div><h2>Quiz <small>${esc2(trackDef(SH.track).name)}</small></h2><p class="pm">No multiple-choice sets for this track yet. Add one in <code>quiz/</code> (see SCHEMA.md).</p></div></div>`; return; }
  const Q=SH.quiz; Q.set=Math.min(Q.set,sets.length-1); const set=sets[Q.set], st=quizStore(set), q=quizQueue(set,st); Q.idx=Math.max(0,Math.min(Q.idx,q.length-1));
  const all=set.items, done=all.filter(x=>quizState(set,x,st).a).length, right=all.filter(x=>quizState(set,x,st).a===x.answer&&quizState(set,x,st).rev).length, pct=q.length?Math.round(100*q.filter(x=>quizState(set,x,st).a).length/q.length):0;
  const seg=(act,cur,list)=>`<div class="seg">${list.map(([k,n,t])=>`<button data-act="${act}" data-id="${k}" class="${cur===k?'on':''}" ${t?`title="${t}"`:''}>${n}</button>`).join('')}</div>`;
  const nf=quizActiveFilters();
  const head=`<div class="qbar"><div class="qtitle"><h2>Quiz</h2>${sets.length>1?`<select id="qset" aria-label="Question set">${sets.map((s,i)=>`<option value="${i}"${i===Q.set?' selected':''}>${esc2(s.title)}</option>`).join('')}</select>`:`<span>${esc2(set.title)}</span>`}</div>
    <div class="qctl">${seg('qmode',Q.mode,[['practice','Practice','Feedback after every answer'],['test','Test','Answers stay hidden until you finish']])}${seg('qview',Q.view,[['focus','One at a time'],['list','List']])}
    <div class="seg"><button data-act="qsize" data-id="-1" aria-label="Smaller text">A−</button><button data-act="qsize" data-id="1" aria-label="Larger text">A+</button></div>
    <button class="ghostb ${Q.shuffle?'on':''}" data-act="qshuf" title="Shuffle the order">⤮ Shuffle</button><button class="ghostb ${nf?'on':''}" data-act="qfil">Filters${nf?' · '+nf:''}</button><button class="ghostb" data-act="qsum">Results</button></div></div>
    <div class="qprog" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div><p class="qcount">${q.length} question${q.length===1?'':'s'} shown · ${q.filter(x=>quizState(set,x,st).a).length} answered${Q.mode==='test'&&!st.D?'':` · ${right} correct`}</p>`;
  let main;
  if (Q.sum) main=quizSummary(set,st);
  else if (!q.length) main='<p class="pm qempty">No question matches these filters.</p>';
  else if (Q.view==='list'){ main=`<div class="qlist">${q.map(x=>quizCard(set,x,st)).join('')}</div>`; }
  else { const x=q[Q.idx], s=quizState(set,x,st);
    main=`<div class="qfocus">${quizPalette(set,q,st)}<div class="qmain"><article class="qc big ${s.rev?(s.right?'right':'wrong'):''}">${quizMeta(set,x)}<p class="qq">${x.q}</p>${quizOptions(set,x,s)}${quizFeedback(set,x,s)}
      <div class="qnav"><button class="ghostb" data-act="qprev" ${Q.idx<=0?'disabled':''}>← Previous</button><button class="ghostb ${s.flag?'on':''}" data-act="qflag" data-id="${esc2(s.k)}" title="Flag for review (F)">⚑ ${s.flag?'Flagged':'Flag'}</button>
      ${!SH.quiz.mode==='test'&&false?'':(Q.mode==='practice'&&s.a?`<button class="ghostb" data-act="qretry" data-id="${esc2(s.k)}">Try again</button>`:'')}<span class="sp"></span>
      ${Q.idx>=q.length-1?`<button class="primb" data-act="qsum">${Q.mode==='test'&&!st.D?'Finish':'Results'}</button>`:`<button class="primb" data-act="qnext">${s.a?'Next →':'Skip →'}</button>`}</div>
      <p class="qkeys">Keys: 1–4 or A–D answer · → next · ← previous · F flag</p></article></div></div>`; }
  el.dataset.size=Q.size; el.innerHTML=`${head}${Q.fil?`<div class="qpop">${quizFilters(set)}</div>`:''}${quizPrediction(set,st)}${main}`;
  const s1=$q('#qset'); if (s1) s1.addEventListener('change',e=>{ Q.set=+e.target.value; Q.pat=''; Q.idx=0; renderQuiz(); }); const sp=$q('#qpat'); if (sp) sp.addEventListener('change',e=>{ Q.pat=e.target.value; Q.idx=0; renderQuiz(); });
  const d=$q('.qpred'); if (d) d.addEventListener('toggle',()=>{ Q.pred=d.open; }); }

function quizAnswer(n,k){ const set=quizSets()[SH.quiz.set], test=SH.quiz.mode==='test', key=(test?'quizt.':'quiz.')+set.id; const A=lsGet(key,{}); A[n]=k; lsSet(key,A); renderQuiz(); }
function quizAct(a,id){ const Q=SH.quiz, set=(quizSets()[Q.set]||{}); const re=()=>{ Q.idx=0; quizSavePrefs(); renderQuiz(); };
  if (a==='qans') quizAnswer(arguments[2],id);
  else if (a==='qwk'){ Q.wk=id; re(); } else if (a==='qkind'){ Q.kind=id; re(); } else if (a==='qsrc'){ Q.src=id; re(); } else if (a==='qstat'){ Q.status=id; Q.sum=false; re(); }
  else if (a==='qlik'){ Q.likely=!Q.likely; re(); } else if (a==='qpat'){ Q.pat=id; Q.wk=''; Q.kind=''; Q.src=''; Q.status=''; Q.likely=false; Q.sum=false; re(); window.scrollTo(0,0); }
  else if (a==='qclear'){ Q.wk=Q.kind=Q.pat=Q.src=Q.status=''; Q.likely=false; re(); }
  else if (a==='qmode'){ Q.mode=id; Q.sum=false; re(); } else if (a==='qview'){ Q.view=id; Q.sum=false; re(); } else if (a==='qsize'){ Q.size=Math.max(0,Math.min(3,Q.size+(+id))); quizSavePrefs(); renderQuiz(); }
  else if (a==='qshuf'){ Q.shuffle=!Q.shuffle; re(); } else if (a==='qfil'){ Q.fil=!Q.fil; renderQuiz(); }
  else if (a==='qsum'){ Q.sum=!Q.sum; renderQuiz(); } else if (a==='qsumx'){ Q.sum=false; renderQuiz(); }
  else if (a==='qgo'){ Q.idx=+id; Q.sum=false; renderQuiz(); } else if (a==='qnext'){ Q.idx++; renderQuiz(); window.scrollTo(0,0); } else if (a==='qprev'){ Q.idx=Math.max(0,Q.idx-1); renderQuiz(); window.scrollTo(0,0); }
  else if (a==='qflag'){ const F=lsGet('quizf.'+set.id,{}); if (F[id]) delete F[id]; else F[id]=1; lsSet('quizf.'+set.id,F); renderQuiz(); }
  else if (a==='qretry'){ const P=lsGet('quiz.'+set.id,{}); delete P[id]; lsSet('quiz.'+set.id,P); renderQuiz(); }
  else if (a==='qfinish'){ lsSet('quizd.'+set.id,true); renderQuiz(); }
  else if (a==='qretake'||a==='qreset'){ lsSet('quiz.'+set.id,{}); lsSet('quizt.'+set.id,{}); lsSet('quizd.'+set.id,false); Q.sum=false; Q.status=''; re(); } }
const QUIZ_ACTS=new Set(['qans','qwk','qkind','qsrc','qstat','qlik','qpat','qclear','qmode','qview','qsize','qshuf','qfil','qsum','qsumx','qgo','qnext','qprev','qflag','qretry','qfinish','qretake','qreset']);
// keyboard: 1-4 or A-D answers, arrows move, F flags (only in the one-at-a-time view, never while typing)
function quizKey(e){ if (SH.tab!=='quiz'||e.ctrlKey||e.metaKey||e.altKey) return false; const t=e.target; if (t.matches&&t.matches('input,select,textarea')) return false; const Q=SH.quiz; if (Q.view!=='focus'||Q.sum) return false;
  const set=quizSets()[Q.set]; if (!set) return false; const st=quizStore(set), q=quizQueue(set,st), x=q[Q.idx]; if (!x) return false; const k=e.key.toLowerCase();
  const map={'1':'A','2':'B','3':'C','4':'D',a:'A',b:'B',c:'C',d:'D'}; if (map[k]&&x.options[map[k]]){ const s=quizState(set,x,st); if (Q.mode==='practice'&&s.a) return true; quizAnswer(qk(x),map[k]); return true; }
  if (k==='arrowright'||k==='n'){ if (Q.idx<q.length-1){ Q.idx++; renderQuiz(); } return true; } if (k==='arrowleft'||k==='p'){ Q.idx=Math.max(0,Q.idx-1); renderQuiz(); return true; }
  if (k==='f'){ quizAct('qflag',qk(x)); return true; } return false; }
