// ================= STEP-BY-STEP WALKTHROUGH =================
let walk = {on:false, i:0, steps:[], timer:0, lastHtml:''};
let walkView = null, walkBand = null, walkNodes = null;

// one formula line: symbols, then numbers, then result appear in turn
const WL = (sym, num='', res='', note='') => ({sym, num, res, note});
const sub = (a,b) => `${a}<sub>${b}</sub>`;

function buildSteps(r){
  const st=[]; const G=r.G, D=r.D, L=r.L, pi=S.conv.pi3?'3':'π';
  const idxOf = l => S.layers.indexOf(l);
  const tipIdx = idxOf(r.bs.layer);
  const nm = s => ({alpha:'clay', spt:'sand (SPT)', beta:'sand (β)', int:'integral'})[s.mode];
  const P=PRESETS[presetKey]||{}, asks=P.asks||[];
  const design = asks.includes('L');
  const dest = design ? 'the required pile length L' : asks.includes('FSact') ? 'the safety factor of the group' : (asks.includes('Pa')||(given('FS')&&given('Q'))) ? `the allowable load P<sub>a</sub>` : G ? 'the capacity of the pile group P<sub>u,g</sub>' : 'the ultimate capacity P<sub>u</sub> of the pile';
  // 1: the equation (course Step 1), with the destination named first
  const eqLines=[WL(`${sub('P','u')} = ${sub('P','s')} + ${sub('P','b')} − W`,'','','vertical balance of the pile'),
                 WL(`${sub('P','u')} = ${sub('f','s')}${sub('A','s')} + (${sub('f','b')} + ${sub('p','o')})${sub('A','b')} − W`,'','','')];
  if (S.conv.eqn==='simple') eqLines.push(WL(`W ≈ ${sub('p','o')}${sub('A','b')}, so ${sub('P','u')} = ${sub('f','s')}${sub('A','s')} + ${sub('f','b')}${sub('A','b')}`,'','','pile weight and the overburden on the tip balance out'));
  else eqLines.push(WL('W and p<sub>o</sub>A<sub>b</sub> kept','','','full form: both are worked out before P<sub>u</sub>'));
  if (design) eqLines.push(WL(`${sub('P','u')} must reach FS × Q`,'','','L is unknown, so the shaft is worked per metre and L is solved at the end'));
  st.push({key:'q', short:'Equation', title:`Goal: ${dest}`, fly:'all',
    why:`We are asked for ${dest}. A pile carries load by friction along its sides (shaft) and bearing under its tip (base); every step below builds toward the goal.`,
    uses: design ? [['D',`${D} m`,'pile.D'],['Q',`${S.group.Q} kN`,'group.Q'],['FS',S.group.FS,'group.FS']]
                 : [['D',`${D} m`,'pile.D'],['L',`${L} m`,'pile.L']].concat(G?[['piles',G.n,'group.nx']]:[]).concat(given('FS')?[['FS',S.group.FS,'group.FS']]:[]).concat(given('Q')?[['Q',`${S.group.Q} kN`,'group.Q']]:[]),
    lines:eqLines, nodes:design?['Pu','Ps','fbAb','D','Q','FS']:['Pu','Ps','fbAb','D','L'], paths:design?['pile.D','group.Q','group.FS']:['pile.D','pile.L'],
    emph: design?['pile','load']:['pile','dims','load'], reveal:{segs:0, base:false}, band:null});
  { const rd=readStep(r); if (rd) st.push(rd); }
  // 2: analysis method (course Step 2)
  const gl=[];
  r.layers.filter(l=>l.top<L+2*D).forEach(l=>gl.push(WL(`${esc(l.name)}, ${l.top}–${l.bot} m`, l.kind==='clay'?'clay':'sand', l.kind==='clay'?'undrained, α-method':(l.sandMethod==='spt'?'drained, SPT (Meyerhof)':'drained, Kσ′tanδ'))));
  if (r.layers.some(l=>l.kind==='sand'&&l.sandMethod==='beta') || S.conv.eqn==='full'){
    gl.push(WL(`${sub('σ','v')} at tip = Σγh`, '', `${f(r.sv(L))} kPa`));
    gl.push(WL(`σ′<sub>v</sub> = ${sub('σ','v')} − u`, `${f(r.sv(L))} − ${f(r.u(L))}`, `${f(r.svp(L))} kPa`));
  }
  st.push({key:'g', short:'Analysis', title:'Analysis method', fly:'all',
    why:'The soil type picks the method. Clay drains slowly, so under the load it acts undrained and we use its strength c<sub>u</sub>. Sand drains fast, so we use drained values.',
    uses:S.layers.map((l,i)=>[esc(l.name), `${l.top}–${l.bot} m`, `layers.${i}`]),
    lines:gl, nodes:['layers','cu','N'], paths:['layers'], emph:['soil','water'], reveal:{segs:0, base:false}, band:{z1:0,z2:r.zmax}});

  const clays=r.layers.filter(l=>l.kind==='clay');
  const uniformClay = design && r.layers.length && r.layers.every(l=>l.kind==='clay') && clays.every(l=>l.cu.every(p=>p[1]===clays[0].cu[0][1]));
  if (design){
    const FSQ=S.group.FS*S.group.Q;
    if (uniformClay){
      const cu=clays[0].cu[0][1], al=r.alpha(cu), fs=al*cu, perM=fs*r.perim, Pb=9*cu*r.Ab, Lreq=(FSQ-Pb)/perM;
      st.push({key:'sL', short:'Shaft per metre', title:'Shaft resistance per metre of pile', fly:'pile',
        why:'L is what we are solving for, so the shaft is written as resistance per metre times L. Uniform clay means one α for the whole shaft.',
        uses:[['c<sub>u</sub>',`${cu} kPa`,`layers.${idxOf(clays[0])}.cu`],['D',`${D} m`,'pile.D']],
        lines:[WL('α from the chart', cu<=40?'c<sub>u</sub> ≤ 40, gate open':`read at c<sub>u</sub> = ${cu}`, `α = ${f2(al)}`),
               WL(`${sub('f','s')} = α·${sub('c','u')}`, `${f2(al)} × ${cu}`, `${f2(fs)} kPa`),
               WL('perimeter = πD', `${pi} × ${D}`, `${f3(r.perim)} m`),
               WL(`${sub('P','s')} = ${sub('f','s')}·πD·L`, `${f2(fs)} × ${f3(r.perim)} × L`, `${f(perM)}·L kN`)],
        chart:{type:'alpha', x:cu, y:al}, nodes:['cu','alpha','fs','perim','Ps'], paths:[`layers.${idxOf(clays[0])}`,'pile.D'],
        emph:['pile','shaft'], reveal:{segs:r.sh.segs.length, base:false}, band:null});
      st.push({key:'bL', short:'Base', title:'Base resistance, assuming a long pile', fly:'tip',
        why:'We do not know L yet, so assume the pile is long (L/D ≥ 4, N<sub>c</sub> = 9) and check that assumption once L is found.',
        uses:[['c<sub>u,b</sub>',`${cu} kPa`,`layers.${idxOf(clays[0])}.cu`],['D',`${D} m`,'pile.D']],
        lines:[WL('assume L/D ≥ 4', 'long pile', `${sub('N','c')} = 9`),
               WL(`${sub('A','b')} = π(D/2)²`, `${pi} × (${D}/2)²`, `${f3(r.Ab)} m²`),
               WL(`${sub('P','b')} = ${sub('N','c')}·${sub('c','u,b')}·${sub('A','b')}`, `9 × ${cu} × ${f3(r.Ab)}`, `${f(Pb)} kN`)],
        chart:{type:'nc', x:Math.max(4, Lreq/D), y:9}, nodes:['Nc','cu','fb','Ab','fbAb'], paths:['pile.D'], emph:['pile','tip'], reveal:{segs:r.sh.segs.length, base:true}, band:null});
      st.push({key:'req', short:'Required P<sub>u</sub>', title:'Capacity the pile must reach', fly:'top',
        why:'The pile must carry the working load with the required margin, so its ultimate capacity must be FS times Q.',
        uses:[['FS',S.group.FS,'group.FS'],['Q',`${S.group.Q} kN`,'group.Q']],
        lines:[WL(`${sub('P','u')} = FS × Q`, `${S.group.FS} × ${S.group.Q}`, `${f0(FSQ)} kN`)],
        nodes:['FS','Q','Pu'], paths:['group.FS','group.Q'], emph:['pile','load','check'], reveal:{segs:r.sh.segs.length, base:true}, band:null});
      st.push({key:'solve', short:'Solve L', title:'Solve for the pile length', fly:'pile',
        why:'Set the capacity equal to what is required and solve the one unknown.',
        uses:[],
        lines:[WL(`FS·Q = ${sub('P','s')} + ${sub('P','b')}`, `${f0(FSQ)} = ${f(perM)}·L + ${f(Pb)}`, ''),
               WL(`L = (FS·Q − ${sub('P','b')}) / (${sub('f','s')}·πD)`, `(${f0(FSQ)} − ${f(Pb)}) / ${f(perM)}`, `${f2(Lreq)} m`)],
        nodes:['Pu','Ps','fbAb','L'], paths:['pile.L'], emph:['pile','dims'], reveal:{segs:r.sh.segs.length, base:true}, band:null, Lreq});
      st.push({key:'chk', short:'Check L/D', title:'Check the long-pile assumption', fly:'tip',
        why:'The base step assumed N<sub>c</sub> = 9, which needs L/D ≥ 4. Confirm it with the length just found.',
        uses:[['D',`${D} m`,'pile.D']],
        lines:[WL('L/D', `${f2(Lreq)} / ${D}`, `${f2(Lreq/D)} ${Lreq/D>=4?'≥ 4, assumption holds':'< 4: redo with N<sub>c</sub> from the chart'}`),
               WL('the model’s pile', `L = ${L} m`, Math.abs(L-Lreq)/Lreq<0.03?'matches within rounding':'unlock and press “Solve L” to set it')],
        nodes:['LD','Nc'], paths:['pile.L','pile.D'], emph:['pile','tip','thr','dims'], reveal:{segs:r.sh.segs.length, base:true}, band:null});
      return st;
    }
    // fallback for non-uniform ground: trial lengths
    const sol=solveL(S);
    st.push({key:'req', short:'Required P<sub>u</sub>', title:'Capacity the pile must reach', fly:'top', why:'The ultimate capacity must be FS times Q.',
      uses:[['FS',S.group.FS,'group.FS'],['Q',`${S.group.Q} kN`,'group.Q']], lines:[WL(`${sub('P','u')} = FS × Q`, `${S.group.FS} × ${S.group.Q}`, `${f0(FSQ)} kN`)],
      nodes:['FS','Q','Pu'], paths:['group.FS','group.Q'], emph:['pile','load'], reveal:{segs:r.sh.segs.length, base:true}, band:null});
    st.push({key:'solve', short:'Solve L', title:'Solve for the pile length by trial', fly:'pile', why:'The ground is not uniform, so try lengths until P<sub>u</sub>(L) = FS × Q.',
      uses:[], lines:[WL(`${sub('P','u')}(L) = FS·Q`, 'bisection on L', sol?`L = ${f2(sol.L)} m`:'no solution below 200 m')],
      nodes:['Pu','L'], paths:['pile.L'], emph:['pile','dims'], reveal:{segs:r.sh.segs.length, base:true}, band:null});
    return st;
  }
  // shaft slices
  let run=0;
  r.sh.segs.forEach((sg,i)=>{
    const li=idxOf(sg.l), dL=sg.z2-sg.z1; run+=sg.dP;
    const lines=[]; let why='', chart=null, uses=[], nodes=[], paths=[`layers.${li}`,'pile.D'];
    if (sg.mode==='alpha'){
      why = 'Clay grips the pile by adhesion, a fraction α of its strength. Soft clay (c̄<sub>u</sub> ≤ 40 kPa) grips fully, α = 1. Stiffer clay grips proportionally less.';
      if (S.conv.shaftMethod==='m1') lines.push(WL('c̄<sub>u</sub> = mean of the points in this layer', sg.used.map(u=>f(u[1])).join(' + ')+` over ${sg.used.length}`, `${f2(sg.cuAve)} kPa`));
      else lines.push(WL('c̄<sub>u</sub> = (c<sub>u,top</sub> + c<sub>u,bottom</sub>)/2', `(${f(sg.used[0][1])} + ${f(sg.used[1][1])})/2`, `${f2(sg.cuAve)} kPa`));
      lines.push(WL('α from the chart', sg.cuAve<=40?'c̄<sub>u</sub> ≤ 40, so the gate is open':`read at c̄<sub>u</sub> = ${f(sg.cuAve)}`, `α = ${f2(sg.alpha)}`));
      lines.push(WL(`${sub('f','s')} = α·c̄<sub>u</sub>`, `${f2(sg.alpha)} × ${f2(sg.cuAve)}`, `${f2(sg.fs)} kPa`));
      chart={type:'alpha', x:sg.cuAve, y:sg.alpha};
      uses=sg.used.map(([z,c])=>[`c<sub>u</sub>(${f(z)} m)`, f(c), `layers.${li}.cu`]); nodes=['cu','cubar','alpha','fs','perim','Ps'];
    } else if (sg.mode==='spt'){
      why = 'In sand the SPT blow count N says how dense the sand is. Meyerhof turns the average N̄ along this length into side friction: f<sub>s</sub> = 2N̄ (kPa).';
      lines.push(WL('N̄ = mean of the SPT values in the layer', sg.Npts.map(p=>p[1]).join(' + ')+` over ${sg.Npts.length}`, `${f2(sg.NbarRaw)}${S.conv.roundN?` → ${sg.Nbar}`:''}`));
      lines.push(WL(`${sub('f','s')} = 2N̄`, `2 × ${sg.Nbar}`, `${f2(sg.fs)} kPa`));
      uses=sg.Npts.map(([z,n])=>[`N(${z} m)`, n, `layers.${li}.N`]); nodes=['N','Nbar','fs','perim','Ps'];
    } else if (sg.mode==='beta'){
      why = 'Sand friction is Coulomb friction: the soil presses sideways on the pile with Kσ′<sub>v</sub>, and the friction coefficient is tanδ.';
      lines.push(WL(`K = (K/${sub('K','0')})(1 − sinφ′)`, `${f2(r.Kr)} × (1 − sin ${sg.l.phi}°)`, `${f3(sg.K)}`));
      lines.push(WL('σ′<sub>v</sub> at mid-slice', '', `${f(sg.svpMid)} kPa`));
      lines.push(WL(`${sub('f','s')} = Kσ′<sub>v</sub>tanδ`, `${f3(sg.K)} × ${f(sg.svpMid)} × tan ${f(sg.delta)}°`, `${f2(sg.fs)} kPa`));
      uses=[['φ′',`${sg.l.phi}°`,`layers.${li}.phi`],['σ′<sub>v</sub>',f(sg.svpMid),null]]; nodes=['phi','sv','fs','perim','Ps'];
    } else {
      why='Method 3 adds up very thin slices, applying the rule at every depth.';
      lines.push(WL(`mean ${sub('f','s')} over the layer`, 'numerical ∫ f<sub>s</sub> dz / ΔL', `${f2(sg.fs)} kPa`));
      nodes=['fs','perim','Ps'];
    }
    if (i===0) lines.unshift(WL('perimeter = πD', `${pi} × ${D}`, `${f3(r.perim)} m`));
    if (sg.sign<0) lines.push(WL('this layer settles past the pile', 'friction points down', 'negative sign'));
    lines.push(WL(`Δ${sub('P','s')} = ${sub('f','s')} × πD × ΔL`, `${f2(sg.fs)} × ${f3(r.perim)} × ${f2(dL)}`, `${f(sg.dP)} kN`));
    lines.push(WL(`${sub('P','s')} so far`, '', `${f(run)} kN`));
    st.push({key:'s'+i, short:`Shaft ${f(sg.z1)}–${f(sg.z2)} m`, title:`Shaft slice ${i+1} of ${r.sh.segs.length}: z = ${f(sg.z1)} to ${f(sg.z2)} m, ${nm(sg)}`, fly:'seg', seg:i,
      why, uses:uses.concat([['ΔL',`${f2(dL)} m`,null]]), lines, chart, nodes, paths, emph:['pile'], reveal:{segs:i+1, base:false}, band:{z1:sg.z1, z2:sg.z2}});
  });
  st.push({key:'ps', short:'Shaft total', title:'Total shaft resistance', fly:'pile',
    why:'The slices add up. Each slice was a stress times its own strip of side area.',
    uses:r.sh.segs.map(s=>[`Δ${sub('P','s')}`, f0(s.dP), null]),
    lines:[WL(`${sub('P','s')} = Σ Δ${sub('P','s')}`, r.sh.segs.map(s=>f(s.dP)).join(' + '), `${f(r.sh.Ps)} kN`)],
    nodes:['fs','perim','Ps'], paths:[], emph:['pile','shaft'], reveal:{segs:r.sh.segs.length, base:false}, band:{z1:0, z2:L}});
  // base
  const b=r.bs; let bl=[WL(`${sub('A','b')} = π(D/2)²`, `${pi} × (${D}/2)²`, `${f3(r.Ab)} m²`)], bwhy='', bchart=null, buses=[['L',`${L} m`,'pile.L'],['D',`${D} m`,'pile.D']], bnodes=['L','D','LD','fb','Ab','fbAb'];
  if (b.mode==='clay'){
    bwhy='The tip works like a small footing buried deep. In clay (φ<sub>u</sub> = 0) Skempton\'s N<sub>c</sub> rises with depth and stops at 9 once the pile is 4 diameters long.';
    bl.push(WL('L/D', `${L} / ${D}`, f2(b.LD)));
    bl.push(WL(`${sub('N','c')} from Skempton`, b.LD>=4?'L/D ≥ 4, gate reached':'read from the chart', f2(b.Nc)));
    bl.push(S.conv.baseCu==='avg2D'&&b.cu2D!=null ? WL(`${sub('c','u,b')} = average over 2D below tip`, `(${f(b.cuTip)} + ${f(b.cu2D)})/2`, `${f2(b.cub)} kPa`) : WL(`${sub('c','u,b')} = c<sub>u</sub>(L)`, `c<sub>u</sub>(${L})`, `${f2(b.cub)} kPa`));
    bl.push(WL(`${sub('f','b')} = ${sub('N','c')}·${sub('c','u,b')}`, `${f2(b.Nc)} × ${f2(b.cub)}`, `${f(b.fb)} kPa`));
    bchart={type:'nc', x:b.LD, y:b.Nc}; buses.push([`c<sub>u</sub> at tip`, f(b.cub), `layers.${tipIdx}.cu`]); bnodes=bnodes.concat(['Nc','cu']);
  } else if (b.mode==='spt'){
    bwhy='Meyerhof\'s base rule grows with how deep the pile goes (L/D), but the sand can only give so much: it is capped at 400N, reached when L/D = 10.';
    bl.push(WL(`${sub('N','b')} at the tip`, `z = ${L} m`, f(b.Nb)));
    bl.push(WL(S.conv.LDmode==='full'?'L/D':`${sub('L','b')}/D`, '', f2(b.ratio)));
    bl.push(WL(`40N(L/D)`, `40 × ${f(b.Nb)} × ${f2(b.ratio)}`, `${f(b.fbRaw)} kPa`));
    bl.push(WL('cap 400N', `400 × ${f(b.Nb)}`, `${f(b.cap)} kPa`));
    bl.push(WL(`${sub('f','b')} = smaller of the two`, b.capped?'cap governs':'formula governs', `${f(b.fb)} kPa`));
    bchart={type:'cap', x:b.ratio, N:b.Nb}; buses.push([`N at tip`, f(b.Nb), `layers.${tipIdx}.N`]); bnodes=bnodes.concat(['Nb','N']);
  } else {
    bwhy='Base bearing in sand from the effective stress at the tip times the factor N<sub>q</sub>.';
    bl.push(WL(`${sub('f','b')} = ${sub('N','q')}·σ′<sub>v,b</sub>`, `${b.Nq} × ${f(b.svpb)}`, `${f(b.fb)} kPa`)); bnodes=bnodes.concat(['sv','phi']);
  }
  bl.push(WL(`${sub('f','b')}${sub('A','b')}`, `${f(b.fb)} × ${f3(r.Ab)}`, `${f(r.fbAb)} kN`));
  st.push({key:'b', short:'Base', title:`Base resistance, tip in ${esc(b.layer.name)}`, fly:'tip', why:bwhy, uses:buses, lines:bl, chart:bchart,
    nodes:bnodes, paths:['pile.L','pile.D',`layers.${tipIdx}`], emph:['pile','tip','thr'], reveal:{segs:r.sh.segs.length, base:true}, band:{z1:L, z2:L+2*D}});
  if (S.conv.eqn==='full'){
  st.push({key:'w', short:'W and p<sub>o</sub>', title:'The two hidden forces: pile weight and overburden', fly:'tip',
    why:'The pile\'s own weight W pushes down. The soil that used to sit on the tip area pushes back with p<sub>o</sub>A<sub>b</sub>. They nearly cancel, which is why the short formula drops both.',
    uses:[['γ<sub>p</sub>',`${r.gp}`,'pile.gp'],['z<sub>w</sub>',`${r.zw} m`,'water.zw']],
    lines:[WL('W = A<sub>b</sub>Lγ<sub>p</sub> − A<sub>b</sub>(L − z<sub>w</sub>)γ<sub>w</sub>', `${f(r.Wgross)} − ${f(r.Ubuoy)}`, `${f(r.W)} kN`),
           WL(`${sub('p','o')}${sub('A','b')} = Σγh × ${sub('A','b')}`, `${f(r.po)} × ${f3(r.Ab)}`, `${f(r.poAb)} kN`),
           WL(`${sub('p','o')}${sub('A','b')} − W`, S.conv.eqn==='simple'?'dropped in the short form':'kept in the full form', `${f(r.poAb-r.W)} kN`)],
    nodes:['gp','zw','W','po','Ab','bal'], paths:['pile.gp','water.zw'].concat(S.layers.map((l,i)=>`layers.${i}.gamma`)), emph:['pile','weight','overburden'], reveal:{segs:r.sh.segs.length, base:true}, band:{z1:0, z2:L}});
  }
  // Pu
  st.push({key:'pu', short:'P<sub>u</sub>', title:'Ultimate capacity of one pile', fly:'all',
    why:'Add the side and the tip.',
    uses:[[sub('P','s'), f0(r.sh.Ps), null],[`${sub('f','b')}${sub('A','b')}`, f0(r.fbAb), null]],
    lines:[S.conv.eqn==='simple' ? WL(`${sub('P','u')} = ${sub('P','s')} + ${sub('f','b')}${sub('A','b')}`, `${f(r.sh.Ps)} + ${f(r.fbAb)}`, `${f(r.Pu)} kN`)
                                 : WL(`${sub('P','u')} = ${sub('P','s')} + (${sub('f','b')} + ${sub('p','o')})${sub('A','b')} − W`, `${f(r.sh.Ps)} + ${f(r.fbAb+r.poAb)} − ${f(r.W)}`, `${f(r.Pu)} kN`),
           WL('share', `shaft ${f0(100*r.sh.Ps/(r.sh.Ps+r.fbAb))}%`, `base ${f0(100*r.fbAb/(r.sh.Ps+r.fbAb))}%`)],
    nodes:['Ps','fbAb','bal','Pu'], paths:[], emph:['pile','shaft','tip','load'], reveal:{segs:r.sh.segs.length, base:true}, band:null});
  if (G){
    if (S.group.mode==='eff'){
      st.push({key:'ge', short:'Group', title:'Group capacity with the given efficiency', fly:'all',
        why:'The question fixes the group efficiency, so no block check is needed: the group carries n·η times one pile.',
        uses:[['n', G.n, S.group.layout==='grid'?'group.nx':'group.nring'],['η',`${S.group.eta}%`,'group.eta'],[sub('P','u'), f0(r.Pu), null]],
        lines:[WL(`${sub('P','u,g')} = n·η·${sub('P','u')}`, `${G.n} × ${f2(G.eta)} × ${f(r.Pu)}`, `${f0(G.Pg)} kN`)],
        nodes:['Pu','layout','eta','Pg'], paths:['group.eta','group.nx','group.ny','group.nring'], emph:['pile','group'], reveal:{segs:r.sh.segs.length, base:true}, band:null});
    } else {
      const eb = S.group.mode==='endbearing';
      st.push({key:'g1', short:'n·P<sub>u</sub>', title: eb?'Group of end-bearing piles':'(A) The group as separate piles', fly:'all',
        why: eb?'End-bearing piles do not share load through the soil, so efficiency is 100%.':'If each pile fails on its own, the group carries n times one pile.',
        uses:[['n', G.n, S.group.layout==='grid'?'group.nx':'group.nring'],[sub('P','u'), f0(r.Pu), null]],
        lines:[WL(`${sub('P','u,s')} = n·${sub('P','u')}`, `${G.n} × ${f(r.Pu)}`, `${f0(G.sum)} kN`)],
        nodes:['Pu','layout','nPu'], paths:['group.nx','group.ny','group.nring','group.centre'], emph:['pile','group'], reveal:{segs:r.sh.segs.length, base:true}, band:null});
      if (!eb){
    st.push({key:'g2', short:'Block size', title:'(B) The group as an equivalent block', fly:'all',
      why:'When piles are close, the soil trapped between them moves with them. Pile and soil punch down together like one large deep foundation.',
      uses:(S.group.layout==='grid'?[['S<sub>x</sub>',`${S.group.Sx} m`,'group.Sx'],['S<sub>y</sub>',`${S.group.Sy} m`,'group.Sy']]:[['R',`${S.group.R} m`,'group.R']]).concat([['D',`${D} m`,'pile.D'],['L',`${L} m`,'pile.L']]),
      lines: G.shape==='rect'
        ? [WL('B = (n<sub>x</sub> − 1)S<sub>x</sub> + D', `(${S.group.nx} − 1) × ${S.group.Sx} + ${D}`, `${f2(G.B)} m`),
           WL('W = (n<sub>y</sub> − 1)S<sub>y</sub> + D', `(${S.group.ny} − 1) × ${S.group.Sy} + ${D}`, `${f2(G.Wd)} m`),
           WL('L/B', `${L} / ${f2(G.Bref)}`, `${f2(G.LB)}: ${G.deep?'deep block':'shallow footing'}`)]
        : [WL('block diameter = 2R + D', `2 × ${S.group.R} + ${D}`, `${f2(G.Db)} m`), WL('L/B', `${L} / ${f2(G.Db)}`, `${f2(G.LB)}`)],
      nodes:['layout','D','blockB','L','LB'], paths:['group.Sx','group.Sy','group.R','pile.D','pile.L'], emph:['block','blockdims','group'], reveal:{segs:r.sh.segs.length, base:true}, band:{z1:0,z2:L}});
    const sideLines = G.blockShaft.segs.map(sg=>WL(`sides, z = ${f(sg.z1)}–${f(sg.z2)} m`, `${sg.mode==='alpha'?'c<sub>a</sub> = '+f2(sg.cuAve):'f<sub>s</sub> = '+f2(sg.fs)} × ${f2(G.perimB)} × ${f2(sg.z2-sg.z1)}`, `${f0(sg.dP)} kN`));
    const bbl = G.baseMode==='clay' ? [WL(`${sub('N','c')} at L/B = ${f2(G.LB)}`, G.LB>=4?'gate reached':'from Skempton', f2(G.Nc)), WL(`${sub('N','c')}·${sub('c','u,b')}·A`, `${f2(G.Nc)} × ${f(G.cub)} × ${f2(G.areaB)}`, `${f0(G.PbB)} kN`)]
      : G.baseMode==='spt' ? [WL('40N(L/B) ≤ 400N', `40 × ${f(G.Nb)} × ${f2(G.LB)}, cap ${f(G.capB)}`, `${f0(G.fbB)} kPa`), WL(`${sub('f','b')}·A`, `${f0(G.fbB)} × ${f2(G.areaB)}`, `${f0(G.PbB)} kN`)]
      : [WL(`${sub('N','q')}σ′<sub>v</sub>·A`, `${G.Nq} × ${f(G.svpb)} × ${f2(G.areaB)}`, `${f0(G.PbB)} kN`)];
    bbl.unshift(...sideLines);
    bbl.push(WL(`${sub('P','u,block')} = sides + base`, `${f0(G.PsB)} + ${f0(G.PbB)}`, `${f0(G.Pblock)} kN`));
    st.push({key:'g3', short:'Block capacity', title:'Capacity of the equivalent block', fly:'pile',
      why:'Round the block, failure runs through soil, not along concrete, so there is no reduction: c<sub>a</sub> = c<sub>u</sub> (α = 1). The base is a large footing at depth L with its factor taken from the block\'s own L/B.',
      uses:[['perimeter',`${f2(G.perimB)} m`,null],['area',`${f2(G.areaB)} m²`,null],['L/B', f2(G.LB), null]], lines:bbl,
      chart: G.baseMode==='clay'?{type:'nc', x:G.LB, y:G.Nc}:G.baseMode==='spt'?{type:'cap', x:G.LB, N:G.Nb}:null,
      nodes:['cu','N','blockB','LB','Pblock'], paths:S.layers.map((l,i)=>`layers.${i}`), emph:['block','blockside','blockbase'], reveal:{segs:r.sh.segs.length, base:true}, band:{z1:0,z2:L+2*D}});
        st.push({key:'g5', short:'Group', title:'(C) Capacity of the group', fly:'all',
          why:'Floating piles fail by whichever route is weaker, so the group capacity is the smaller of the two.',
          uses:[['n·P<sub>u</sub>', f0(G.sum), null],['block', f0(G.Pblock), null]],
          lines:[WL(`${sub('P','u,g')} = min(n·${sub('P','u')}, block)`, `min(${f0(G.sum)}, ${f0(G.Pblock)})`, `${f0(G.Pg)} kN`),
                 WL('implied efficiency η', `${f0(G.Pg)} / ${f0(G.sum)}`, `${f0(100*G.effImplied)}%`)],
          chart:{type:'min', a:G.sum, b:G.Pblock, gov:G.gov, g:G.Pg},
          nodes:['nPu','Pblock','Pg'], paths:['group.mode'], emph:['block','pile','group'], reveal:{segs:r.sh.segs.length, base:true}, band:null});
      }
    }
  }
  const Pcap = G?G.Pg:r.Pu, Pa=Pcap/S.group.FS, gF=given('FS'), gQ=given('Q'), Pn=G?sub('P','u,g'):sub('P','u');
  if (gF || gQ){
    const lines = gF && gQ ? [WL(`${sub('P','a')} = ${Pn}/FS`, `${f0(Pcap)} / ${S.group.FS}`, `${f0(Pa)} kN`), WL(`Q ≤ ${sub('P','a')}?`, `${f0(S.group.Q)} vs ${f0(Pa)}`, S.group.Q<=Pa?'OK':'not OK')]
      : gF ? [WL(`${sub('P','a')} = ${Pn}/FS`, `${f0(Pcap)} / ${S.group.FS}`, `${f0(Pa)} kN`)]
      : [WL(`FS = ${Pn}/Q`, `${f0(Pcap)} / ${f0(S.group.Q)}`, f2(Pcap/S.group.Q))];
    st.push({key:'c', short: gF&&gQ?'Check':gF?'Allowed load':'Safety factor', title: gF&&gQ?'Working load check':gF?'Load allowed':'Safety factor against the working load', fly:'top',
      why: gF&&gQ?'Ultimate capacity is where the ground gives way. Divide by the safety factor to get what we allow, then compare with the working load.'
         : gF?'Ultimate capacity is where the ground gives way. Dividing by the safety factor gives the load we allow.' : 'The safety factor is how many times the working load the ground could carry.',
      uses:[].concat(gF?[['FS',S.group.FS,'group.FS']]:[]).concat(gQ?[['Q',`${S.group.Q} kN`,'group.Q']]:[]),
      lines, nodes:['Pa','FS','Q','util'].concat(G?['Pg']:['Pu']), paths:[].concat(gF?['group.FS']:[]).concat(gQ?['group.Q']:[]), emph:['pile','load','check'], reveal:{segs:r.sh.segs.length, base:true}, band:null});
  }
  if (r.settle){
    const capAsked = asks.includes('Pa');
    const out = capAsked ? st : [];
    if (!capAsked) out.push({key:'q', short:'Goal', title:'Goal: the settlement S', fly:'all',
      why:'We are asked how far the pile settles under its working load. Settlement comes from elastic theory (Poulos): the soil and pile are treated as linear elastic, and chart factors correct the basic solution for stiffness, compressibility and a rigid base.',
      uses:[['P', `${f0(r.settle.Ptot)} kN`, r.settle.Psrc==='given'?'settle.P':null],['D',`${r.D} m`,'pile.D']], lines:[], nodes:[], paths:['settle.P','pile.D'], emph:['pile','load'], reveal:{segs:0, base:false}, band:null});
    if (!capAsked){ const rd=readStep(r); if (rd) out.push(rd); }
    else { const q=out.find(s=>s.key==='q'); if (q){ q.title='Goal: the allowable load, then the settlement under it'; } }
    settleSteps(r, out);
    return out;
  }
  return st;
}

// ---------- "Read the question": conversions the question leaves to us (radius → D, 3×3 → n, GPa → MPa …) ----------
// Built from the block program's first step, so the step-by-step and the Blocks canvas list exactly the same conversions.
function readStep(r){
  const prog = typeof progOf==='function' ? progOf(r) : null; const rd = prog && prog.steps.find(x=>x.key==='rd'); if (!rd) return null;
  const byId=Object.fromEntries(prog.nodes.map(n=>[n.id,n]));
  const verbs=rd.ids.map(id=>byId[id]).filter(n=>n.kind==='verb');
  const lines=[], uses=[], paths=[];
  verbs.forEach(v=>{ const out=prog.nodes.find(n=>n.by===v.id); const ins=prog.edges.filter(e=>e.b===v.id).map(e=>byId[e.a]);
    ins.forEach(n=>{ if (n.role==='given' && !uses.some(u=>u[0]===n.name)) { uses.push([n.name, `${fv(n.val)}${n.unit?' '+n.unit:''}`, n.path||null]); if (n.path) paths.push(n.path); } });
    lines.push(WL(v.eq&&v.eq.sym || out.name, v.eq&&v.eq.num || '', `${fv(out.val)}${out.unit?' '+out.unit:''}`, v.name)); });
  return {key:'rd', short:'Read', title:rd.title, fly:'all',
    why:'The question does not always give a value in the form the method uses. Each conversion is its own small step, so nothing is swapped silently: the value as stated, the action, then the value the method needs.',
    uses, lines, nodes:[], paths, emph:['pile','dims'], reveal:{segs:0, base:false}, band:null};
}

// ---------- settlement steps, in the order the Week 9 solutions use ----------
function settleSteps(r, st){
  const s=r.settle, D=r.D, L=r.L, mm=v=>`${f(v*1000,1)} mm`, ex=v=>v.toExponential(2);
  const rd = k => s.used[k] ? ' (course reading)' : '';
  const corrList = [s.nu!=null?'R<sub>v</sub> because ν < 0.5':'', s.h?'R<sub>h</sub> because a rigid base sits at h = '+s.h+' m':''].filter(Boolean);
  const eqS = `S = P/(D·E<sub>s</sub>)·I${s.nu!=null?'·R<sub>v</sub>':''}${s.h?'·R<sub>h</sub>':''}`;
  const base = {emph:['pile'], reveal:{segs:r.sh.segs.length, base:true}, band:null, fly:'all', nodes:[]};
  const pUse = s.Psrc==='given' ? ['P',`${f0(s.Ptot)} kN`,'settle.P'] : ['P<sub>a</sub>',`${f0(s.Ptot)} kN`,null];
  if (s.mode==='group'){
    st.push({...base, key:'pp', short:'Load per pile', title:'Load carried by each pile', why:'The cap is flexible and the load is shared equally, so each pile carries the total divided by the number of piles.',
      uses:[pUse,['n', s.n, null]], lines:[WL('P = P<sub>total</sub> / n', `${f0(s.Ptot)} / ${s.n}`, `${f(s.P,1)} kN`)], paths:['settle.P']});
    st.push({...base, key:'seq', short:'Equation', title:`Settlement equation for the ${s.target}`,
      why:'By superposition, the target pile settles under its own load plus a share of every neighbour\'s settlement, scaled by an interaction factor α that falls with spacing.',
      uses:[], lines:[WL('S<sub>k</sub> = S<sub>o</sub>P<sub>k</sub> + S<sub>o</sub>Σ P<sub>i</sub>α<sub>i</sub>','','','superposition over the other piles'),
        WL(`S<sub>k</sub> = S<sub>o</sub>P(1 + ${s.classes.map(c=>`${c.count}α<sub>${f2(c.sD)}D</sub>`).join(' + ')})`,'','',`equal loads; ${s.classes.map(c=>`${c.count} pile${c.count>1?'s':''} at s = ${f2(c.s)} m`).join(', ')}`)], paths:['group.R','group.Sx','group.Sy']});
  } else {
    st.push({...base, key:'seq', short:'Equation', title:'Select the settlement equation',
      why:`A floating pile in elastic soil: the basic solution S = P·I/(D·E<sub>s</sub>) is corrected for ${corrList.length?corrList.join(' and '):'nothing further, since the soil is incompressible and deep'}.`,
      uses:[['ν', s.nu!=null?s.nu:'not given', s.nu!=null?'settle.nu':null],['h', s.h?`${s.h} m`:'deep', s.h?'settle.h':null]],
      lines:[WL(eqS,'','',s.nu==null?'ν not given: soil taken as incompressible, R<sub>v</sub> = 1':'')], paths:['settle.nu','settle.h']});
  }
  const kLines=[WL('K = (E<sub>p</sub>/E<sub>s</sub>)·R<sub>A</sub>', `(${s.Ep/1e6} GPa / ${s.Es/1000} MPa) × ${s.RA}`, f0(s.K))];
  const iLines=[WL('L/D', `${L} / ${D}`, f2(s.LD)),
    WL('K position between curves', `log(${f0(s.K)}/100)/log(1000/100)`, f2(Math.log10(Math.max(s.K,1)/100))),
    WL(`L/D between ${s.cI.a} and ${s.cI.b}`, s.cI.a===s.cI.b?'on a curve':`log(${f2(s.LD)}/${s.cI.a})/log(${s.cI.b}/${s.cI.a})`, f2(s.cI.f)),
    WL(`I from the chart${rd('I')}`, s.used.I?`chart gives ${f2(s.cI.v)}`:'log interpolation', f2(s.I))];
  const rLines=[];
  if (s.nu!=null) rLines.push(WL(`R<sub>v</sub> at K = ${f0(s.K)}, ν = ${s.nu}${rd('Rv')}`, s.used.Rv?`chart gives ${f2(s.cRv.v)}`:'straight line to 1 at ν = 0.5', f2(s.Rv)));
  if (s.h) rLines.push(WL(`R<sub>h</sub> at ${s.hL<=2?'h/L':'L/h'} = ${f2(s.hL<=2?s.hL:1/s.hL)}, L/D = ${f2(s.LD)}${rd('Rh')}`, s.used.Rh?`chart gives ${f2(s.cRh.v)}`:(s.cRh.a===s.cRh.b?'on a curve':`between L/D = ${s.cRh.a} (${f2(s.cRh.Ra)}) and ${s.cRh.b} (${f2(s.cRh.Rb)})`), f2(s.Rh)));
  if (s.mode==='group'){
    st.push({...base, key:'sSo', short:'S<sub>o</sub>', title:'Settlement of one pile under a unit load, S<sub>o</sub>',
      why:'S<sub>o</sub> is the single-pile solution for P = 1 kN. It needs the pile stiffness factor K, the influence factor I and the corrections.',
      uses:[['E<sub>p</sub>',`${s.Ep/1e6} GPa`,'settle.Ep'],['E<sub>s</sub>',`${s.Es/1000} MPa`,'settle.Es'],['R<sub>A</sub>',s.RA,'settle.RA'],['L',`${L} m`,'pile.L'],['D',`${D} m`,'pile.D']],
      lines:kLines.concat(iLines.slice(0,1)).concat([iLines[3]]).concat(rLines).concat([WL(`S<sub>o</sub> = I${s.nu!=null?'·R<sub>v</sub>':''}${s.h?'·R<sub>h</sub>':''}/(D·E<sub>s</sub>)`, `${f2(s.I)}${s.nu!=null?' × '+f2(s.Rv):''}${s.h?' × '+f2(s.Rh):''} / (${D} × ${f0(s.Es)})`, `${ex(s.So)} m/kN`)]),
      chart:{type:'I', K:s.K, LD:s.LD, v:s.I}, paths:['settle.Ep','settle.Es','settle.RA','pile.L','pile.D']});
    st.push({...base, key:'sA', short:'α', title:'Interaction factor for each spacing',
      why:'α = α<sub>F</sub>·N<sub>h</sub>·N<sub>v</sub>: α<sub>F</sub> from the spacing chart (depends on L/D and K), N<sub>h</sub> for the rigid base, N<sub>v</sub> = 1 as the course assumes.',
      uses:s.classes.map(c=>[`s/D`, f2(c.sD), null]),
      lines: s.classes.flatMap(c=>[WL(`s/D = ${f2(c.sD)}: α<sub>F</sub>${s.used.aF?' (course reading)':''}`, s.used.aF?`chart gives ${f2(c.cAF.v)}`:`between L/D = 10 (${f2(c.cAF.a10)}) and 25 (${f2(c.cAF.a25)})`, f2(c.aF)),
                                   WL(`N<sub>h</sub> at h/L = ${f2(s.hL)}${s.used.Nh?' (course reading)':''}`, s.used.Nh?`chart gives ${f2(c.cNh.v)}`:'between the h/L curves', f2(c.Nh)),
                                   WL(`α = α<sub>F</sub>·N<sub>h</sub>·N<sub>v</sub>`, `${f2(c.aF)} × ${f2(c.Nh)} × 1`, f3(c.a))]),
      chart:{type:'aF', sD:s.classes[0].sD, LD:s.LD, K:s.K, v:s.classes[0].aF}, paths:['group.R','group.Sx','group.Sy']});
    st.push({...base, key:'sS', short:'S', title:`Settlement of the ${s.target}`, why:'Put the pieces into the superposition equation.',
      uses:[['S<sub>o</sub>', ex(s.So), null],['P', `${f(s.P,1)} kN`, null]],
      lines:[WL(`S<sub>k</sub> = S<sub>o</sub>P(1 + Σ m·α)`, `${ex(s.So)} × ${f(s.P,1)} × (1 + ${s.classes.map(c=>`${c.count} × ${f3(c.a)}`).join(' + ')})`, mm(s.S))], paths:[]});
  } else {
    st.push({...base, key:'sK', short:'K', title:'Pile stiffness factor K', why:'K compares the pile\'s stiffness with the soil\'s. A stiffer pile spreads load further down and settles less.',
      uses:[['E<sub>p</sub>',`${s.Ep/1e6} GPa`,'settle.Ep'],['E<sub>s</sub>',`${s.Es/1000} MPa`,'settle.Es'],['R<sub>A</sub>',s.RA,'settle.RA']], lines:kLines, paths:['settle.Ep','settle.Es','settle.RA']});
    st.push({...base, key:'sI', short:'I', title:'Influence factor I from the chart', why:'Both axes of the I chart are logarithmic, so the position between curves and between gridlines is found with logarithms.',
      uses:[['L',`${L} m`,'pile.L'],['D',`${D} m`,'pile.D']], lines:iLines, chart:{type:'I', K:s.K, LD:s.LD, v:s.I}, paths:['pile.L','pile.D']});
    if (rLines.length) st.push({...base, key:'sR', short:'Corrections', title:`Correction factor${rLines.length>1?'s':''} ${[s.nu!=null?'R<sub>v</sub>':'', s.h?'R<sub>h</sub>':''].filter(Boolean).join(' and ')}`,
      why:'R<sub>v</sub> corrects for soil that is compressible (ν < 0.5); R<sub>h</sub> for a rigid base at a finite depth, which reduces settlement.',
      uses:[].concat(s.nu!=null?[['ν',s.nu,'settle.nu']]:[]).concat(s.h?[['h',`${s.h} m`,'settle.h']]:[]), lines:rLines, chart: s.h?{type:'Rh', hL:s.hL, LD:s.LD, v:s.Rh}:null, paths:['settle.nu','settle.h']});
    st.push({...base, key:'sS', short:'S', title:'Settlement of the pile', why:'Put the factors into the settlement equation.',
      uses:[pUse,['D',`${D} m`,'pile.D'],['E<sub>s</sub>',`${s.Es/1000} MPa`,'settle.Es']],
      lines:[WL(eqS, `${f0(s.P)} / (${D} × ${f0(s.Es)}) × ${f2(s.I)}${s.nu!=null?' × '+f2(s.Rv):''}${s.h?' × '+f2(s.Rh):''}`, mm(s.S))], paths:['settle.P']});
  }
}
