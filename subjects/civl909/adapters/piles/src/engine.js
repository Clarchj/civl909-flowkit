// ================= ENGINE: Weeks 7–8 pile capacity =================
// Pure functions. compute(S) -> result. No DOM access.

// α vs cu design curve (AS2159-78), digitised from W7 slide 51 and
// anchored to every α value the course solutions read off it.
const ALPHA_CHART = [[0,1],[40,1],[46,0.94],[48,0.92],[50,0.88],[54,0.83],[55,0.83],
  [59,0.79],[60,0.78],[70,0.70],[80,0.64],[90,0.575],[100,0.52],[120,0.45],
  [140,0.395],[160,0.355],[180,0.33],[200,0.32]];
// Skempton Nc vs L/D (phi_u = 0), digitised from W7 slide 57.
const NC_CIRC = [[0,6.2],[0.25,6.75],[0.5,7.15],[0.75,7.45],[1,7.7],[1.5,8.1],[2,8.4],
  [2.5,8.65],[3,8.85],[3.5,8.97],[4,9]];
const NC_STRIP = [[0,5.14],[0.5,5.9],[1,6.45],[1.5,6.85],[2,7.15],[2.5,7.35],[3,7.5],[4,7.65],[5,7.7]];

// K/K0 (installation effect) and δ/φ tables, W8 slides 8–9
const K_TABLE = {
  jetted_dense:{label:'Jetted pile, dense sand', r:0.5},
  jetted_soft:{label:'Jetted pile, loose sand', r:2/3},
  bored_stiff:{label:'Bored cast-in-place, stiff clay', r:1},
  bored_slurry:{label:'Bored cast-in-place, slurry', r:2/3},
  steel_dense:{label:'Driven steel, dense', r:0.75},
  steel_soft:{label:'Driven steel, loose', r:1.25},
  precast_dense:{label:'Driven precast concrete, dense', r:1},
  precast_soft:{label:'Driven precast concrete, loose', r:2},
};
const D_TABLE = {
  rough_conc:{label:'Sand / rough concrete', r:1.0},
  smooth_conc:{label:'Sand / smooth concrete (0.8–1.0)', r:0.9},
  rough_steel:{label:'Sand / rough steel (0.7–0.9)', r:0.8},
  smooth_steel:{label:'Sand / smooth steel (0.5–0.7)', r:0.6},
  timber:{label:'Sand / timber (0.8–0.9)', r:0.85},
  bored:{label:'Bored pile', r:1.0},
};

const f_ = v => (Math.round(v*100)/100).toString();
function interp(t, x){
  if (x <= t[0][0]) return t[0][1];
  for (let i=1;i<t.length;i++){
    if (x <= t[i][0]){ const [x0,y0]=t[i-1],[x1,y1]=t[i]; return y0+(y1-y0)*(x-x0)/(x1-x0); }
  }
  return t[t.length-1][1];
}
const deg = d => d*Math.PI/180;

function compute(S, opts={}){
  const lite=!!opts.lite;
  const OV={...((S.conv && S.conv.reads!=='chart' && S.courseOv)||{}), ...(S.ov||{})}; const has=k=>OV[k]!=null && isFinite(OV[k]);
  const flags = [];
  const P = S.conv.pi3 ? 3 : Math.PI;
  const {D, L, gp} = S.pile;
  const zw = S.water.zw, gw = S.water.gw;
  const layers = S.layers.slice().sort((a,b)=>a.top-b.top);
  const Kr = K_TABLE[S.pile.kType].r, Dr = D_TABLE[S.pile.dType].r;
  const zc = S.conv.crit>0 ? S.conv.crit*D : Infinity;

  // ---- ground model ----
  const layerAt = z => {
    for (const l of layers) if (z >= l.top - 1e-9 && z < l.bot - 1e-9) return l;
    return z < layers[0].top ? layers[0] : layers[layers.length-1];
  };
  const sv = z => { // total vertical stress
    let s=0;
    for (const l of layers){ const a=Math.max(l.top,0), b=Math.min(l.bot,z); if (b>a) s+=l.gamma*(b-a); }
    const last=layers[layers.length-1]; if (z>last.bot) s+=last.gamma*(z-last.bot);
    return s;
  };
  const u = z => gw*Math.max(0, z-zw);
  const svp = z => sv(z)-u(z);
  const svpCap = z => svp(Math.min(z, zc));
  const cuAt = (l, z) => {
    const p=l.cu; if (!p || !p.length) return NaN; if (p.length===1) return p[0][1];
    if (z<=p[0][0]) return p[0][1];
    for (let i=1;i<p.length;i++) if (z<=p[i][0]){ const [x0,y0]=p[i-1],[x1,y1]=p[i]; return y0+(y1-y0)*(z-x0)/(x1-x0); }
    const [x0,y0]=p[p.length-2],[x1,y1]=p[p.length-1]; return y1+(y1-y0)/(x1-x0)*(z-x1); // extrapolate last slope
  };
  const NAt = (l, z) => {
    const p=l.N; if (!p || !p.length) return NaN; return interp(p, z);
  };
  const alpha = cu => {
    if (has('alpha')) return OV.alpha;
    if (S.conv.alphaSrc==='formula') return cu<=40 ? 1 : 0.21+26/cu;
    return interp(ALPHA_CHART, cu);
  };
  const K0 = l => 1-Math.sin(deg(l.phi));
  const Kpile = l => Kr*K0(l);
  const delta = l => Dr*l.phi;

  // ---- geometry ----
  const Ab = P*(D/2)**2, perim = P*D;
  const Vp = Ab*L;
  const Wgross = Vp*gp, Ubuoy = Ab*Math.max(0, L-zw)*gw;
  const W = has('W') ? OV.W : Wgross-Ubuoy;
  const po = sv(L), poAb = po*Ab;

  // ---- shaft engine: returns segments for a given method on a given perimeter ----
  // soilSoil = true for equivalent block (α = 1, δ = φ, K = K0)
  function shaft(method, per, soilSoil){
    const segs=[]; const splits=(S.conv.splits||[]).filter(z=>z>0&&z<L).sort((a,b)=>a-b);
    for (const l of layers){
      const z1=Math.max(l.top,0), z2=Math.min(l.bot,L); if (z2<=z1+1e-9) continue;
      const sign = l.nsf ? -1 : 1;
      if (method==='m3'){
        const n=400, h=(z2-z1)/n; let I=0;
        for (let i=0;i<n;i++){ const z=z1+(i+0.5)*h; I+=fsPoint(l,z,soilSoil)*h; }
        segs.push({l, z1, z2, kind:l.kind, mode:'int', fs:I/(z2-z1), dP:sign*I*per, sign,
          note: 'numerical ∫ over '+n+' slices'});
        continue;
      }
      let bounds=[z1];
      if (method==='m2') splits.forEach(s=>{ if (s>z1+1e-9 && s<z2-1e-9) bounds.push(s); });
      bounds.push(z2);
      for (let i=0;i<bounds.length-1;i++){
        const a=bounds[i], b=bounds[i+1];
        const seg={l, z1:a, z2:b, kind:l.kind, sign};
        if (l.kind==='clay'){
          let cuAve, used;
          if (method==='m1'){
            used=[a]; l.cu.forEach(([z])=>{ if (z>a+1e-9 && z<b-1e-9) used.push(z); }); used.push(b);
            cuAve = used.reduce((s,z)=>s+cuAt(l,z),0)/used.length;
          } else { used=[a,b]; cuAve=(cuAt(l,a)+cuAt(l,b))/2; }
          seg.used=used.map(z=>[z,cuAt(l,z)]); seg.cuAve=cuAve;
          seg.alpha = soilSoil ? 1 : alpha(cuAve);
          seg.fs = seg.alpha*cuAve; seg.mode='alpha';
        } else if (l.sandMethod==='spt'){
          const pts=l.N.filter(([z])=>z>=z1-1e-9 && z<=z2+1e-9);
          let Nbar = pts.length ? pts.reduce((s,p)=>s+p[1],0)/pts.length : NAt(l,(z1+z2)/2);
          seg.NbarRaw=Nbar; seg.Npts=pts;
          if (S.conv.roundN) Nbar=Math.round(Nbar);
          seg.Nbar=Nbar; seg.fs=2*Nbar; seg.mode='spt';
        } else {
          const zm=(a+b)/2, s=svpCap(zm);
          const K = soilSoil ? K0(l) : Kpile(l), d = soilSoil ? l.phi : delta(l);
          seg.svpMid=s; seg.K=K; seg.delta=d; seg.fs=K*s*Math.tan(deg(d)); seg.mode='beta';
        }
        seg.dP = sign*seg.fs*per*(b-a);
        segs.push(seg);
      }
    }
    const pos=segs.filter(s=>s.sign>0).reduce((t,s)=>t+s.dP,0);
    const neg=segs.filter(s=>s.sign<0).reduce((t,s)=>t+s.dP,0);
    return {segs, Ps:pos+neg, pos, neg};
  }
  function fsPoint(l, z, soilSoil){
    if (l.kind==='clay'){ const c=cuAt(l,z); return (soilSoil?1:alpha(c))*c; }
    if (l.sandMethod==='spt') return 2*NAt(l,z);
    const K = soilSoil ? K0(l) : Kpile(l), d = soilSoil ? l.phi : delta(l);
    return K*svpCap(z)*Math.tan(deg(d));
  }

  // ---- base engine ----
  function base(){
    const tl = layerAt(L); const b={layer:tl, kind:tl.kind, LD:L/D};
    if (tl.kind==='clay'){
      const cTip=cuAt(tl,L);
      let cub=cTip;
      if (S.conv.baseCu==='avg2D'){
        const l2=layerAt(L+2*D);
        if (l2.kind==='clay'){ b.cu2D=cuAt(l2,L+2*D); cub=(cTip+b.cu2D)/2; }
        else flags.push({t:'warn', m:'The 2D zone below the tip reaches a sand layer, so c<sub>u,b</sub> falls back to the tip value.'});
      }
      b.cuTip=cTip; b.cub=cub;
      b.Nc = b.LD>=4 ? 9 : interp(NC_CIRC, b.LD); b.NcFromChart = b.LD<4;
      if (has('Nc')){ b.Nc=OV.Nc; b.NcFromChart=false; }
      b.fb = b.Nc*cub; b.mode='clay';
    } else if (tl.sandMethod==='spt'){
      b.Nb = NAt(tl, L);
      b.ratio = S.conv.LDmode==='embed' ? (L-Math.max(tl.top,0))/D : L/D;
      b.fbRaw = 40*b.Nb*b.ratio; b.cap=400*b.Nb; b.fb=Math.min(b.fbRaw,b.cap); b.capped=b.fbRaw>b.cap; b.mode='spt';
    } else {
      b.svpb=svpCap(L); b.Nq=tl.Nq; b.fb=b.Nq*b.svpb; b.mode='beta';
    }
    if (has('fb')){ b.fb=OV.fb; b.capped=false; }
    return b;
  }

  const methods={}; (lite?[S.conv.shaftMethod]:['m1','m2','m3']).forEach(m=>methods[m]=shaft(m, perim, false));
  let sh = methods[S.conv.shaftMethod];
  if (has('Ps')){ const k = Math.abs(sh.Ps)>1e-9 ? OV.Ps/sh.Ps : 0; const segs=sh.segs.map(s=>({...s, dP:s.dP*k, fs:s.fs*k}));
    sh={segs, Ps:OV.Ps, pos:segs.filter(s=>s.sign>0).reduce((t,s)=>t+s.dP,0), neg:segs.filter(s=>s.sign<0).reduce((t,s)=>t+s.dP,0)}; methods[S.conv.shaftMethod]=sh; }
  const bs = base(); let fbAb = bs.fb*Ab;
  if (has('fbAb')){ fbAb=OV.fbAb; bs.fb=fbAb/Ab; }
  const PuOf = Ps => S.conv.eqn==='full' ? Ps+(bs.fb+po)*Ab-W : Ps+fbAb;
  const Pu = has('Pu') ? OV.Pu : PuOf(sh.Ps);
  const PuM = lite ? {} : {m1:PuOf(methods.m1.Ps), m2:PuOf(methods.m2.Ps), m3:PuOf(methods.m3.Ps)};

  // ---- profiles for the hidden realm ----
  const zmax = Math.max(L+2*D+1, L*1.2);
  const prof=[]; const nz=lite?-1:240;
  // cumulative shaft along the selected method's segments
  const PsCum = z => { let s=0; for (const g of sh.segs){ if (z<=g.z1) break; const f=Math.min(1,(z-g.z1)/(g.z2-g.z1)); s+=g.dP*f; } return s; };
  const Wcum = z => Ab*(gp*z - gw*Math.max(0,z-zw));
  for (let i=0;i<=nz;i++){
    const z=zmax*i/nz, l=layerAt(z);
    const row={z, sv:sv(z), u:u(z), svp:svp(z), kind:l.kind};
    if (l.kind==='clay'){ row.cu=cuAt(l,z); row.alpha=alpha(row.cu); }
    else if (l.sandMethod==='spt'){ row.N=NAt(l,z); }
    else { row.K=Kpile(l); row.shp=row.K*svpCap(z); }
    if (z<=L+1e-9){
      row.fs=(l.nsf?-1:1)*fsPoint(l,z,false);
      row.Nax = S.conv.eqn==='full' ? Pu+Wcum(z)-PsCum(z) : Pu-PsCum(z);
    }
    prof.push(row);
  }

  // ---- flags ----
  if (S.conv.pi3) flags.push({t:'conv', m:'π = 3 (lecture convention, W7 slide 38). Exact π raises every area and perimeter by 4.7%.'});
  const clayCus = sh.segs.filter(s=>s.mode==='alpha').map(s=>s.cuAve);
  clayCus.filter(c=>c>40).slice(0,1).forEach(c=>{
    const ac=interp(ALPHA_CHART,c), af=0.21+26/c;
    flags.push({t:'conv', m:`α at c<sub>u</sub> = ${c.toFixed(1)} kPa: chart ${ac.toFixed(2)} vs formula 0.21+26/c<sub>u</sub> = ${af.toFixed(2)}. Course solutions follow the chart; the slide-54 formula does not reproduce them.`});
  });
  if (clayCus.some(c=>c>200)) flags.push({t:'warn', m:'c<sub>u</sub> above 200 kPa is off the α chart; α held at 0.32.'});
  if (bs.mode==='spt') flags.push({t:'conv', m: S.conv.LDmode==='full'
    ? `Meyerhof f<sub>b</sub> uses L/D = ${(L/D).toFixed(2)} with the full pile length (lecture, W8 slide 30). Using embedment into sand gives L<sub>b</sub>/D = ${((L-Math.max(bs.layer.top,0))/D).toFixed(2)}.`
    : `Meyerhof f<sub>b</sub> uses embedment into sand L<sub>b</sub>/D. The lecture example uses the full pile length.`});
  if (S.conv.eqn==='simple') flags.push({t:'info', m:`Short form P<sub>u</sub> = f<sub>s</sub>A<sub>s</sub> + f<sub>b</sub>A<sub>b</sub> assumes W ≈ p<sub>o</sub>A<sub>b</sub>. Here W = ${W.toFixed(1)} kN vs p<sub>o</sub>A<sub>b</sub> = ${poAb.toFixed(1)} kN (difference ${(poAb-W).toFixed(1)} kN).`});
  if (layers.some(l=>l.kind==='sand' && l.sandMethod==='beta')) flags.push({t:'warn', m:'β-method N<sub>q</sub> is an input: the lecture gives no N<sub>q</sub>–φ chart. Check against Das before using the number.'});
  if (S.conv.crit>0 && layers.some(l=>l.kind==='sand'&&l.sandMethod==='beta')) flags.push({t:'info', m:`Critical depth on: σ′<sub>v</sub> held constant below z<sub>c</sub> = ${S.conv.crit}D = ${zc.toFixed(2)} m for β-method sand (W8 slide 57).`});
  if (sh.neg<0) flags.push({t:'info', m:`Negative skin friction: settling layer drags the pile down with ${(-sh.neg).toFixed(1)} kN.`});
  (S.assumed||[]).forEach(a=>flags.push({t:'assume', m:a}));
  Object.keys(OV).forEach(k=>{ if (has(k) && !(S.ov&&S.ov[k]!=null)) flags.push({t:'conv', m:`Course reading used: <b>${k}</b> = ${OV[k]}, as read in the official solution. Switch “Chart readings” to the digitised chart to compare.`}); });
  Object.keys(S.ov||{}).forEach(k=>{ if (has(k)) flags.push({t:'warn', m:`You set <b>${k}</b> = ${OV[k]} by hand in the map. Everything that normally feeds it is ignored until you clear it.`}); });

  // ---- group ----
  let G=null;
  if (S.group.on){
    const g=S.group; G={};
    let pts=[];
    if (g.layout==='grid'){
      for (let i=0;i<g.nx;i++) for (let j=0;j<g.ny;j++) pts.push([i*g.Sx, j*g.Sy]);
      G.B=(g.nx-1)*g.Sx+D; G.Wd=(g.ny-1)*g.Sy+D; G.shape='rect';
      G.perimB=2*(G.B+G.Wd); G.areaB=G.B*G.Wd; G.Smin=Math.min(g.nx>1?g.Sx:Infinity, g.ny>1?g.Sy:Infinity);
    } else {
      for (let k=0;k<g.nring;k++){ const t=2*Math.PI*k/g.nring; pts.push([g.R*Math.cos(t), g.R*Math.sin(t)]); }
      if (g.centre) pts.push([0,0]);
      G.Db=2*g.R+D; G.B=G.Db; G.Wd=G.Db; G.shape='circ';
      G.perimB=P*G.Db; G.areaB=P*G.Db**2/4;
      const chord=2*g.R*Math.sin(Math.PI/g.nring); G.Smin=g.centre?Math.min(chord,g.R):chord;
    }
    G.pts=pts; G.n=pts.length;
    G.spacingOK = G.Smin>=2.5*D;
    G.sum = G.n*Pu;
    // equivalent block
    const Bref = g.layout==='grid' ? (S.conv.blockB==='larger'?Math.max(G.B,G.Wd):Math.min(G.B,G.Wd)) : G.Db;
    G.Bref=Bref; G.LB=L/Bref; G.deep=G.LB>=1;
    const bsh = shaft(S.conv.shaftMethod, G.perimB, true);
    G.blockShaft=bsh;
    const tl=layerAt(L);
    if (tl.kind==='clay'){
      G.cub=cuAt(tl,L); G.Nc = G.LB>=4?9:interp(NC_CIRC,G.LB); G.fbB=G.Nc*G.cub; G.baseMode='clay';
    } else if (tl.sandMethod==='spt'){
      G.Nb=NAt(tl,L); G.fbBraw=40*G.Nb*G.LB; G.capB=400*G.Nb; G.fbB=Math.min(G.fbBraw,G.capB); G.baseMode='spt';
      flags.push({t:'conv', m:`Block base in sand uses Meyerhof with the block width: f<sub>b</sub> = 40N(L/B) ≤ 400N = 40 × ${f_(G.Nb)} × ${G.LB.toFixed(2)} = ${f_(G.fbB)} kPa. The lecture gives only N<sub>q</sub>σ′<sub>v</sub> for a sand block; this is the SPT analogue.`});
    } else {
      G.svpb=svpCap(L); G.Nq=tl.Nq; G.fbB=G.Nq*G.svpb; G.baseMode='sand';
      flags.push({t:'warn', m:`Block base sits in sand: f<sub>b</sub> = N<sub>q</sub>σ′<sub>v</sub> with N<sub>q</sub> = ${tl.Nq} (input, not from the lecture).`});
    }
    if (G.deep){ G.PbB=G.fbB*G.areaB; G.PsB=bsh.Ps; G.Pblock=G.PsB+G.PbB; }
    else { G.PsB=0; G.PbB=(G.fbB+po)*G.areaB; G.Pblock=G.PbB; }
    if (has('Pblock')) G.Pblock=OV.Pblock;
    G.eta = g.eta/100; G.Peta = G.n*G.eta*Pu;
    if (g.mode==='min'){ G.Pg=Math.min(G.sum,G.Pblock); G.gov = G.sum<=G.Pblock?'individual':'block'; }
    else if (g.mode==='endbearing'){ G.Pg=G.sum; G.gov='end-bearing'; }
    else { G.Pg=G.Peta; G.gov='efficiency'; }
    G.effImplied = G.Pg/G.sum;
    G.Pa=G.Pg/g.FS; G.ok = G.Pa>=g.Q;
    if (g.layout==='grid') flags.push({t:'conv', m: S.conv.blockB==='larger'
      ? `Block L/B uses the larger plan side B = ${Bref.toFixed(2)} m (course solutions). Skempton defines B as the smaller side, which gives a higher N<sub>c</sub>.`
      : `Block L/B uses the smaller plan side (Skempton). Course solutions use the larger side.`});
    if (!G.spacingOK) flags.push({t:'warn', m:`Pile spacing ${G.Smin.toFixed(2)} m is below 2.5D = ${(2.5*D).toFixed(2)} m.`});
    if (bsh.segs.some(s=>s.mode==='beta')) flags.push({t:'assume', m:'Block side friction in β-sand uses F = K<sub>0</sub>tanφ (soil–soil). The lecture writes F without defining it.'});
  }

  // single-pile service check
  const single = {FS:S.group.FS, Q:S.group.Q, Pa:Pu/S.group.FS};

  const out_ = {P, Ab, perim, Vp, Wgross, Ubuoy, W, po, poAb, methods, sh, bs, fbAb, Pu, PuM,
    prof, zmax, flags, G, single, layers, D, L, zw, gw, gp, sv, u, svp, cuAt, NAt, alpha, layerAt, Kr, Dr};
  out_.settle = (S.settle && S.settle.on && typeof computeSettle==='function') ? computeSettle(S, out_) : null;
  return out_;
}

// solve for pile length so that Pu = FS * Q (single pile)
function solveL(S){
  const target=S.group.FS*S.group.Q;
  let lo=Math.max(0.5, S.pile.D), hi=200;
  const f=L=>compute({...S, pile:{...S.pile, L}},{lite:true}).Pu-target;
  if (f(lo)>0) return {L:lo, note:'already satisfied at minimum length'};
  if (f(hi)<0) return null;
  for (let i=0;i<60;i++){ const m=(lo+hi)/2; if (f(m)<0) lo=m; else hi=m; }
  return {L:hi, target};
}
