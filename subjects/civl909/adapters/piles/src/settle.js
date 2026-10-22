// ================= SETTLEMENT ENGINE (Week 9, Poulos elastic method) =================
// Charts digitised from the Week 9 slides. Where a course solution reads a chart differently,
// the problem stores that reading and it is used by default (convention: "course readings").
const SET_I = { K:[20,50,100,200,500,1000,2000,5000,10000],
  LD:{1:[0.493,0.467,0.454,0.447,0.444,0.444,0.446,0.443,0.444], 2:[0.82,0.755,0.719,0.698,0.688,0.684,0.682,0.682,0.683],
      5:[1.594,1.35,1.215,1.13,1.074,1.05,1.035,1.032,1.035], 10:[2.833,2.193,1.86,1.645,1.468,1.395,1.356,1.346,1.347],
      25:[6.202,4.59,3.682,3.003,2.393,2.111,1.934,1.823,1.793], 50:[10.808,8.415,6.862,5.374,3.849,3.156,2.668,2.318,2.22],
      100:[17.786,14.478,12.137,9.731,6.945,5.411,4.185,3.263,2.923], 200:[26.702,21.902,18.602,15.567,11.95,9.551,7.36,5.195,4.185]} };
const SET_RV0 = [[100,0.875],[500,0.836],[1000,0.824],[2000,0.83]];           // R_v at ν = 0; straight line to 1 at ν = 0.5
const SET_RH = { hL:[1.0,1.087,1.135,1.2,1.4,1.6,1.8,2.0],                    // h/L ≤ 2; beyond, straight lines in L/h to 1
  LD:{1:[0,0.034,0.053,0.085,0.181,0.282,0.367,0.438], 2:[0,0.085,0.127,0.18,0.339,0.467,0.554,0.607], 5:[0,0.247,0.32,0.404,0.548,0.637,0.697,0.737],
      10:[0,0.372,0.457,0.536,0.655,0.719,0.764,0.79], 25:[0,0.52,0.59,0.651,0.739,0.785,0.819,0.85], 50:[0,0.609,0.664,0.711,0.782,0.82,0.847,0.866]} };
// α_F and N_h are read on a combined axis t: t = s/d up to 5, then the d/s half of the chart (d/s 0.2 → 0) maps to t = 5 → 10
const SET_T = [1,2,3,4,5,6.25,7.5,8.75,10];
const SET_AF = { 10:{10:[0.47,0.31,0.24,0.19,0.155,0.12,0.09,0.05,0], 100:[0.60,0.45,0.37,0.31,0.27,0.22,0.16,0.08,0], 500:[0.73,0.545,0.45,0.37,0.315,0.255,0.17,0.085,0], 1000:[0.74,0.555,0.46,0.38,0.325,0.26,0.17,0.085,0], 100000:[0.75,0.565,0.47,0.39,0.33,0.265,0.175,0.085,0]},
                 25:{10:[0.50,0.37,0.27,0.22,0.18,0.14,0.10,0.05,0], 100:[0.50,0.41,0.33,0.30,0.27,0.24,0.20,0.11,0], 500:[0.67,0.555,0.47,0.415,0.385,0.33,0.25,0.14,0], 1000:[0.72,0.59,0.50,0.445,0.415,0.36,0.27,0.15,0], 100000:[0.80,0.64,0.535,0.47,0.44,0.39,0.30,0.16,0]} };
const SET_NH = { 1.2:[0.544,0.463,0.407,0.35,0.318,0.253,0.14,0.043,0], 1.5:[0.803,0.738,0.681,0.625,0.544,0.43,0.285,0.107,0],
                 2.5:[0.908,0.892,0.876,0.851,0.80,0.69,0.48,0.237,0], 5:[0.924,0.913,0.903,0.897,0.884,0.86,0.787,0.56,0] };

const lerp=(a,b,f)=>a+(b-a)*f;
function interp1(xs, ys, x){ if (x<=xs[0]) return ys[0]; for (let i=1;i<xs.length;i++) if (x<=xs[i]) return lerp(ys[i-1],ys[i],(x-xs[i-1])/(xs[i]-xs[i-1])); return ys[ys.length-1]; }
function bracket(keys, v){ const k=keys.map(Number).sort((a,b)=>a-b); if (v<=k[0]) return [k[0],k[0],0,true]; if (v>=k[k.length-1]) return [k[k.length-1],k[k.length-1],0,v>k[k.length-1]];
  for (let i=1;i<k.length;i++) if (v<=k[i]) return [k[i-1],k[i],0,false]; }
const tOf = sd => sd<=5 ? sd : 5 + (0.2 - 1/sd)/0.2*5;

function chartI(K, LD){
  const lk=SET_I.K.map(Math.log10), x=Math.log10(Math.max(K,1e-9));
  const at = ld => Math.pow(10, interp1(lk, SET_I.LD[ld].map(Math.log10), x));
  const [a,b,,out]=bracket(Object.keys(SET_I.LD), LD);
  const f = a===b ? 0 : Math.log10(LD/a)/Math.log10(b/a);
  return {v: Math.pow(10, lerp(Math.log10(at(a)), Math.log10(at(b)), f)), a, b, f, Ia:at(a), Ib:at(b), out: out || K<SET_I.K[0] || K>SET_I.K[SET_I.K.length-1]};
}
function chartRv(K, nu){
  if (nu==null) return {v:1, note:'ν not given: soil taken as incompressible (ν = 0.5), so R<sub>v</sub> = 1'};
  const R0 = interp1(SET_RV0.map(p=>Math.log10(p[0])), SET_RV0.map(p=>p[1]), Math.log10(K));
  return {v: R0 + (1-R0)*Math.min(nu,0.5)/0.5, R0, out: K<100||K>2000};
}
function chartRh(hL, LD){
  if (hL==null || !isFinite(hL)) return {v:1, note:'no rigid base given: deep layer, R<sub>h</sub> = 1'};
  const at = ld => { const ys=SET_RH.LD[ld]; if (hL<=2) return interp1(SET_RH.hL, ys, hL); const R2=ys[ys.length-1]; return 1-(1-R2)*(1/hL)/0.5; };
  const [a,b,,out]=bracket(Object.keys(SET_RH.LD), LD);
  const f = a===b ? 0 : (LD-a)/(b-a);
  return {v: lerp(at(a), at(b), f), a, b, f, Ra:at(a), Rb:at(b), out: out || hL<1};
}
function chartAF(sD, LD, K){
  const t=tOf(sD);
  const atLD = ld => { const tab=SET_AF[ld]; const ks=Object.keys(tab).map(Number).sort((x,y)=>x-y);
    const lk=ks.map(Math.log10), x=Math.log10(Math.min(Math.max(K,10),100000));
    let i=1; while (i<ks.length-1 && x>lk[i]) i++; const f=(x-lk[i-1])/(lk[i]-lk[i-1]);
    return lerp(interp1(SET_T, tab[ks[i-1]], t), interp1(SET_T, tab[ks[i]], t), Math.max(0,Math.min(1,f))); };
  const a10=atLD(10), a25=atLD(25); const f=(Math.min(Math.max(LD,10),25)-10)/15;
  return {v: lerp(a10,a25,f), a10, a25, f, out: LD<10 || LD>25};
}
function chartNh(hL, sD){
  if (hL==null || !isFinite(hL)) return {v:1, note:'deep layer: N<sub>h</sub> = 1'};
  const t=tOf(sD); const keys=[1.2,1.5,2.5,5];
  const at = k => interp1(SET_T, SET_NH[k], t);
  if (hL>=5){ const n5=at(5); return {v: n5 + (1-n5)*(1 - 5/hL), a:5, b:Infinity}; }
  if (hL<=1.2) return {v: at(1.2), a:1.2, b:1.2, out: hL<1.2};
  let i=1; while (hL>keys[i]) i++; const f=(hL-keys[i-1])/(keys[i]-keys[i-1]);
  return {v: lerp(at(keys[i-1]), at(keys[i]), f), a:keys[i-1], b:keys[i], f, Na:at(keys[i-1]), Nb:at(keys[i])};
}

// pile positions for the settlement of one target pile
function settleGroupPairs(S_){
  const g=S_.group, D=S_.pile.D;
  let pts=[];
  if (g.layout==='ring'){ for (let k=0;k<g.nring;k++){ const t=2*Math.PI*k/g.nring; pts.push([g.R*Math.cos(t), g.R*Math.sin(t)]); } if (g.centre) pts.push([0,0]); }
  else { for (let i=0;i<g.nx;i++) for (let j=0;j<g.ny;j++) pts.push([i*g.Sx, j*g.Sy]); }
  const tgtIdx = (S_.settle.target==='centre' && g.layout==='ring' && g.centre) ? pts.length-1 : 0;   // ring centre, or a corner pile
  const tg=pts[tgtIdx]; const classes={};
  pts.forEach((p,i)=>{ if (i===tgtIdx) return; const s=Math.hypot(p[0]-tg[0], p[1]-tg[1]); const key=(s/D).toFixed(2); (classes[key]=classes[key]||{s, sD:s/D, count:0}).count++; });
  return {n:pts.length, classes:Object.values(classes).sort((a,b)=>a.s-b.s), target: (S_.settle.target==='centre' && g.layout==='ring' && g.centre)?'centre pile':'corner pile'};
}

function computeSettle(S_, r){
  const st=S_.settle; if (!st || !st.on) return null;
  const reads = (S_.conv.reads!=='chart' && st.reads) ? st.reads : {};
  const used = {}; const pick=(k, chartVal)=>{ if (reads[k]!=null){ used[k]=true; return reads[k]; } return chartVal; };
  const D=S_.pile.D, L=S_.pile.L, Es=st.Es*1000, Ep=st.Ep*1e6, RA=st.RA;   // inputs in MPa and GPa, worked in kPa
  const K=Ep/Es*RA, LD=L/D, hL = st.h ? st.h/L : null;
  const cI=chartI(K,LD), cRv=chartRv(K, st.nu), cRh=chartRh(hL, LD);
  const I=pick('I', cI.v), Rv=pick('Rv', cRv.v), Rh=pick('Rh', cRh.v);
  const G = r && r.G;
  // load on one pile
  let Ptot, Psrc;
  if (st.load==='Pa'){ Ptot = (G?G.Pg:r.Pu)/S_.group.FS; Psrc='allowable load from part 1'; }
  else { Ptot = st.P; Psrc='given'; }
  const out = {K, LD, hL, I, Rv, Rh, cI, cRv, cRh, Es, Ep, RA, D, L, nu:st.nu, h:st.h, used, Ptot, Psrc};
  if (st.mode==='group'){
    const gp=settleGroupPairs(S_); const P=Ptot/gp.n;
    const So = I*Rv*Rh/(D*Es);
    const classes = gp.classes.map(c=>{ const aF0=chartAF(c.sD, LD, K), Nh0=chartNh(hL, c.sD);
      const key=c.sD.toFixed(1); const aF = (reads.aF && reads.aF[key]!=null) ? (used.aF=true, reads.aF[key]) : aF0.v;
      const Nh = (reads.Nh && reads.Nh[key]!=null) ? (used.Nh=true, reads.Nh[key]) : Nh0.v;
      return {...c, aF, Nh, Nv:1, a:aF*Nh, cAF:aF0, cNh:Nh0}; });
    const sumA = classes.reduce((t,c)=>t+c.count*c.a,0);
    Object.assign(out, {mode:'group', n:gp.n, target:gp.target, P, So, classes, sumA, S: So*P*(1+sumA)});
  } else {
    Object.assign(out, {mode:'single', P:Ptot, S: Ptot/(D*Es)*I*Rv*Rh});
  }
  return out;
}
if (typeof module!=='undefined') module.exports={computeSettle, chartI, chartRv, chartRh, chartAF, chartNh};
