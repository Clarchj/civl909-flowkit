// ================= PROBLEM METADATA: grouping, original question, what is asked, what is not given =================
// hide: inputs the question does not give. They stay in the model at a default but are tucked away and not used in the answer.
// PGROUPS, PRESETS and PMETA are filled by problems/*.js
Object.entries(PMETA).forEach(([k,m])=>{ if (PRESETS[k]) Object.assign(PRESETS[k], m); });
// interface.config.json > problems: keep only the listed problems (the playground always stays), and drop the generator if switched off
if (UI.problems.only && UI.problems.only.length) Object.keys(PRESETS).forEach(k=>{ if (k!=='playground' && !UI.problems.only.includes(k)) delete PRESETS[k]; });
if (!UI.problems.generator) PGROUPS.splice(0, PGROUPS.length, ...PGROUPS.filter(([g])=>g!=='gen'));
PGROUPS.splice(0, PGROUPS.length, ...PGROUPS.filter(([g])=>g==='gen' || Object.values(PRESETS).some(p=>p.grp===g)));
const isSettle = () => !!(S && S.settle && S.settle.on);

// what can be asked, and how to read the answer from a result
const ASK = {
  Ps:{label:'Shaft resistance P<sub>s</sub>', unit:'kN', get:r=>r.sh.Ps},
  fbAb:{label:'Base resistance f<sub>b</sub>A<sub>b</sub>', unit:'kN', get:r=>r.fbAb},
  Pu:{label:'Single pile P<sub>u</sub>', unit:'kN', get:r=>r.Pu},
  sum:{label:'Group as single piles, n·P<sub>u</sub>', unit:'kN', get:r=>r.G?r.G.sum:NaN},
  Pblock:{label:'Equivalent block P<sub>u,b</sub>', unit:'kN', get:r=>r.G?r.G.Pblock:NaN},
  Pg:{label:'Group capacity P<sub>u,g</sub>', unit:'kN', get:r=>r.G?r.G.Pg:NaN},
  Pa:{label:'Allowable load P<sub>a</sub>', unit:'kN', get:r=>(r.G?r.G.Pg:r.Pu)/S.group.FS},
  FSact:{label:'Safety factor FS = P/Q', unit:'', get:r=>(r.G?r.G.Pg:r.Pu)/S.group.Q},
  L:{label:'Required length L', unit:'m', get:()=>{ const s=solveL(S); return s?s.L:NaN; }},
  S:{label:'Settlement S', unit:'mm', get:r=>r.settle?r.settle.S*1000:NaN},
};
const HIDE_PATHS = { FS:p=>p==='group.FS', Q:p=>p==='group.Q', gp:p=>p==='pile.gp', zw:p=>p==='water.zw'||p==='water.gw', gamma:p=>/^layers\.\d+\.gamma$/.test(p), eta:p=>p==='group.eta' };
const given = k => !((S && S.hide)||[]).includes(k);
function isHiddenPath(path){
  if (Object.entries(HIDE_PATHS).some(([k,f])=>!given(k) && f(path))) return true;
  if (path==='group.eta' && S.group.mode!=='eff') return true;
  const m=path.match(/^layers\.(\d+)\.(phi|Nq)$/); if (m){ const l=S.layers[+m[1]]; if (l && l.kind==='sand' && l.sandMethod==='spt') return true; }
  return false;
}
