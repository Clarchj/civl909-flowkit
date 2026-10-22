// ================= KIT · GATE BOARD: every either / or of a problem in ONE panel at the top =================
// The handoff (4a): the forks of a problem used to be scattered over its steps. The board puts them side by side, in the order they are answered.
// A problem declares it with  Board(id, {gates:[…], strip:v=>html})  (kit/core/decl.js). A gate is  {n:'name', chips:[{t, on:v=>bool, set:{inputId:value}|v=>{…}}], because:v=>html, skip:v=>reason|null, fixed:true}.
// The lit chip is the branch that is true; the other is faded. Tap a faded chip to PREVIEW what would change (the result strip and the answer) without changing the problem, then Apply or Cancel.
// A gate that does not apply is greyed with its reason (never a silent default). The board only reads and previews; the calculation stays in the blocks.
const BD={ key:null, open:true, preview:null };

function bdSet(c,v){ return typeof c.set==='function'?c.set(v):(c.set||{}); }
function bdPreview(){ const p=BD.preview, cfg=BOARDS[presetKey], d=typeof DECL!=='undefined'&&DECL[presetKey]; if (!p||!cfg||!d) return ''; const g=cfg.gates[p.g], c=g.chips[p.c], set=bdSet(c,FM.prog.vals);
  let v2; try{ v2=compileDecl(d,{...S.vals,...set}).vals; }catch(e){ return ''; }
  const G=FM.leaves.find(l=>l.goal), id=G&&G.out&&G.out.id, now=FM.prog.vals[id], nw=v2[id];
  return `<div class="bd-prev"><div><b>What if</b> · ${g.n}: <b>${c.t}</b></div><div class="bd-strip alt">${cfg.strip(v2)}</div>${G?`<div>${G.out.name} <b>${fmt(now)}</b> → <b>${fmt(nw)}</b>${G.out.unit?' '+G.out.unit:''}</div>`:''}
    <div class="bd-btns"><button data-bd="apply">Apply it to the problem</button><button class="ghostb" data-bd="cancel">Cancel</button></div></div>`; }

function renderBoard(){ const el=$q('#board'); if (!el) return; const cfg=BOARDS[presetKey];
  if (!cfg||!FM.prog){ el.hidden=true; el.innerHTML=''; return; }
  const ph=typeof isPhone==='function'&&isPhone(); if (BD.key!==presetKey||BD.ph!==ph){ BD.key=presetKey; BD.ph=ph; BD.preview=null; BD.open=lsGet(ph?'board_ph':'board',ph?false:true); }
  el.hidden=false; el.classList.toggle('sheet',ph&&BD.open); const v=FM.prog.vals;
  let h=`<div class="bd-head"><b>Gates</b><span class="bd-sub">every either / or of this problem, in the order they are answered</span><button class="bd-tog" data-bd="toggle">${BD.open?(BD.ph?'Close':'Hide'):(BD.ph?'Open gates':'Show')}</button></div>`;
  if (BD.open){
    h+=`<div class="bd-rows">`+cfg.gates.map((g,i)=>{ const skip=g.skip&&g.skip(v), fixed=!!g.fixed;
      const chips=g.chips.map((c,j)=>{ const on=c.on(v); return `<button class="bd-chip ${on?'on':'off'}${BD.preview&&BD.preview.g===i&&BD.preview.c===j?' prev':''}" data-bd="pick" data-g="${i}" data-c="${j}" ${skip||fixed||on?'disabled':''}>${c.t}</button>`; }).join('<span class="bd-or">or</span>');
      return `<div class="bd-row${skip?' skip':''}${fixed?' fixed':''}"><div class="bd-name">${g.n}</div><div class="bd-chips">${chips}</div><div class="bd-why">${skip?'<i>'+skip+'</i>':(g.because?g.because(v):'')}</div></div>`; }).join('')+`</div>`;
    h+=`<div class="bd-strip"><span class="bd-lbl">Result</span> ${cfg.strip(v)}</div>`+bdPreview(); }
  else if (BD.ph) h+=`<div class="bd-strip">${cfg.strip(v)}</div>`;
  el.innerHTML=h; }

document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('[data-bd]'); if (!b) return; const a=b.dataset.bd, cfg=BOARDS[presetKey]; if (!cfg) return;
  if (a==='toggle'){ BD.open=!BD.open; lsSet(BD.ph?'board_ph':'board',BD.open); renderBoard(); }
  else if (a==='pick'){ BD.preview={g:+b.dataset.g,c:+b.dataset.c}; renderBoard(); }
  else if (a==='cancel'){ BD.preview=null; renderBoard(); }
  else if (a==='apply'&&BD.preview){ const set=bdSet(cfg.gates[BD.preview.g].chips[BD.preview.c],FM.prog.vals); BD.preview=null; Object.keys(set).forEach(k=>setPath('vals.'+k,set[k])); recompute(); } });
