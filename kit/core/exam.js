// ================= KIT · EXAM GENERATOR (pure logic, no DOM) =================
// A subject supplies: EXAM (blueprint JSON: sections of slots) and ExamQ(...) templates (numerical questions built on declarative problems).
// A VERSION is a seed plus a swap counter per slot: the same code always rebuilds the same paper, and swapping one slot leaves the others alone.
const EXAMQ={};
const ExamQ=t=>{ EXAMQ[t.id]=t; };
function xrng(seed){ let a=seed>>>0; return ()=>{ a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
const xhash=s=>{ let h=2166136261; for (const c of String(s)){ h=Math.imul(h^c.charCodeAt(0),16777619); } return h>>>0; };
const xshuffle=(a,r)=>{ a=a.slice(); for (let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const xslots=()=>{ const out=[]; (EXAM.sections||[]).forEach(sec=>sec.slots.forEach((sl,i)=>out.push({sec,slot:sl,key:sec.id+(i+1)}))); return out; };

// one numerical question from a template: draw the parameters, run the declarative problem with them, keep the answers
function xnum(t,r){ const def=DECL[t.problem]; if (!def) return null; const base=defaultVals(def);
  for (let tries=0;tries<60;tries++){ const ov={};
    for (const [k,sp] of Object.entries(t.p||{})) ov[k]=Array.isArray(sp)?sp[Math.floor(r()*sp.length)]:+(sp.lo+sp.step*Math.floor(r()*(Math.round((sp.hi-sp.lo)/sp.step)+1))).toFixed(6);
    if (t.derive) Object.assign(ov,t.derive(ov));
    const vals={...base,...ov}, out=compileDecl(def,vals).vals; if (!t.asks.every(a=>isFinite(out[a.id]))) continue; if (t.ok && !t.ok(out)) continue;
    const fill=s=>s.replace(/\{(\w+)\}/g,(m,k)=>fmt(vals[k]!==undefined?vals[k]:out[k]));
    return { type:'num', tid:t.id, title:t.title, text:fill(t.text), marks:t.marks||8, problem:t.problem, overrides:ov, tpl:t,
      asks:t.asks.map(a=>{ const v=out[a.id]*(a.scale||1); return {label:a.label, unit:a.unit||'', val:v, text:(Math.abs(v)>=1000?v.toFixed(0):v.toFixed(a.d===undefined?1:a.d))}; }) }; }
  return null; }

// one multiple-choice question from the question banks, with its options shuffled
function xmcq(it,r){ const letters='ABCD', ent=xshuffle(Object.entries(it.options),r); const opts=ent.map(([k,t],i)=>({k:letters[i],t,ok:k===it.answer}));
  return { type:'mcq', id:it.id, marks:it.marks||1, text:it.q, options:opts, answer:opts.find(o=>o.ok).k, why:it.why, pattern:it.pattern, week:it.week, symbols:it.symbols||[], link:it.link||null, track:it.track }; }

// build the whole paper for a version state {seed, swaps:{key:n}}
function examBuild(st){ const used=new Set(), usedT=new Set(), paper=[]; const bank=[]; (QUIZ||[]).forEach(s=>{ if (s.patterns) s.items.forEach(x=>bank.push({...x,track:x.track||s.track})); });
  const slots=xslots(); let n=0;
  slots.forEach(({sec,slot,key})=>{ const r=xrng(xhash(st.seed+'|'+key+'|'+((st.swaps||{})[key]||0))), qs=[];
    if (sec.kind==='mcq'){ const pool=bank.filter(x=>slot.patterns.includes(x.pattern)&&!x.flag&&!used.has(x.id)&&(!slot.kind||x.kind===slot.kind)); const pick=xshuffle(pool,r).slice(0,slot.n||1); pick.forEach(it=>{ used.add(it.id); qs.push(xmcq(it,r)); }); }
    else { const pool=xshuffle((slot.pool||[]).filter(id=>EXAMQ[id]&&!usedT.has(id)),r); for (const id of pool){ const q=xnum(EXAMQ[id],r); if (q){ usedT.add(id); qs.push(q); break; } } }
    qs.forEach(q=>{ q.n=++n; q.key=key; q.label=slot.label; }); paper.push({sec,slot,key,qs}); });
  return paper; }
const examCode=st=>st.seed.toString(36).toUpperCase()+'-'+xslots().map(s=>(st.swaps||{})[s.key]||0).join('.');
function examParse(code){ const m=/^([0-9A-Za-z]+)-([0-9.]*)$/.exec(String(code).trim()); if (!m) return null; const seed=parseInt(m[1],36); if (!isFinite(seed)) return null; const sw=m[2]?m[2].split('.').map(x=>+x||0):[]; const swaps={}; xslots().forEach((s,i)=>{ if (sw[i]) swaps[s.key]=sw[i]; }); return {seed,swaps}; }
