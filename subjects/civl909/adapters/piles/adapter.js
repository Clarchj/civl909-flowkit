// ================= CIVL909 · DEEP FOUNDATIONS · pile engine adapter =================
// The pile engine (src/*.js, problems/*.js) computes everything for weeks 7 to 10 in one pass and writes the solution as a program
// (buildProgram). This adapter plugs that engine into the kit's ENGINES interface, and lists its problems in the library.
//   open(id)  -> the problem's state      program() -> blocks, wires, steps, stages      base(id) -> untouched state (for "back to the question's value")
ENGINES.pile = {
  open(id){ presetKey=id; S=JSON.parse(JSON.stringify(PRESETS[id])); last=compute(S); return S; },
  base(id){ return PRESETS[id]; },
  recompute(){ last=compute(S); },
  program(){ const p=buildProgram(last); p.stages=STAGES.map(s=>[s[0],s[1]]); p.stageOf=k=>stageOf(k); return p; } };

// type of a pile problem, read from what the problem asks and what it contains
function pileType(P){ const asks=P.asks||[];
  if (P.title && /playground/i.test(P.title)) return 'playground';
  if (asks.includes('L')) return 'design-length';
  if (asks.includes('S') || (P.settle && P.settle.on)) return 'settlement';
  if (P.group && P.group.on) return 'group';
  return (P.layers||[]).some(l=>l.kind==='sand') ? 'capacity-sand' : 'capacity-clay'; }
Object.keys(PRESETS).forEach(k=>{ const P=PRESETS[k]; const wk=(/^w(\d+)/.exec(P.grp||'')||[])[1]; 
  CATALOG[k]={ id:k, engine:'pile', track:'deep', week:wk?+wk:(P.grp==='quiz'?10:0), source:P.grp==='quiz'?'quiz':(/ex\d*$/.test(k)||/example/i.test(plain(P.title||''))?'lecture':(P.grp==='play'?'playground':'tutorial')),
    type:pileType(P), title:plain(P.title||k), sub:plain(P.sub||''), tags:P.tags||[], answer:P.answer||'', text:P.text||'', order:0, group:P.grp||'' }; });
