// ================= BLOCKS · PROGRAM: the solution written as a small visual program =================
// Grammar (one rule for every subject):
//   NOUN       a value: something you can point at (D, c_u, α, P_s). Value shows only when tapped.
//                role: 'given' (from the question) · 'made' (worked out) · 'rule' (fixed by a rule, e.g. N_c = 9)
//   ADJECTIVE  a quality of a noun, true or false, worded both ways ("soft" / "stiff").
//              It never carries a number; it changes how a verb behaves.
//   VERB       an action that turns nouns (and adjectives) into exactly ONE new noun ("find α", "average").
//              Chart verbs open their chart on tap.
// Every verb is followed by its own noun block, so the eye always reads: noun → verb → noun.
// Blocks are grouped into STEPS (the course solution's steps) and steps into STAGES (Shaft, Base …).

function Program(){
  const nodes=[], edges=[], steps=[]; const ids=new Set(); let cur=null;
  const add = (o) => { if (ids.has(o.id)) return o.id; ids.add(o.id); o.step = o.step!==undefined ? o.step : (cur?cur.key:null); nodes.push(o); if (cur && o.step===cur.key) cur.ids.push(o.id); return o.id; };
  const wire = (a, b, kind='flow') => { if (a && b && ids.has(a) && ids.has(b) && a!==b) edges.push({a, b, kind}); };
  const P = {
    step(key, title){ cur={key, title, ids:[]}; steps.push(cur); return key; },
    end(){ cur=null; },
    has: id => ids.has(id),
    // NOUNS
    // a given the question states in another form (a radius for D, "3×3" for n …) is converted in the open, never swapped silently
    given(id, name, o={}){ const c=P.conv && P.conv[id]; if (c && !ids.has(id)) return P.read(()=>{
        const ins=c.from.map(x=>typeof x==='string' ? x : add({kind:'noun', role:'given', step:null, ...x}));
        return P.verb(c.vid, c.verb, ins, {id, name:c.name||name, val:c.val, unit:c.unit, info:c.info||o.info}, {rule:c.rule, eq:{sym:c.sym, num:c.num}}); });
      return add({id, kind:'noun', role:'given', name, step:null, ...o}); },
    // run fn inside the first step, "Read the question" (created on first use, always first)
    read(fn){ let rd=steps.find(x=>x.key==='rd'); if (!rd){ rd={key:'rd', title:'Read the question: put each value in the form the method needs', ids:[]}; steps.unshift(rd); }
      const keep=cur; cur=rd; const out=fn(); cur=keep; return out; },
    rule(id, name, o={}){ return add({id, kind:'noun', role:'rule', name, ...o}); },
    // VERB + its NOUN. ins: noun ids; quals: adjective ids that change how the verb works.
    verb(id, name, ins, out, o={}){
      const v=add({id, kind:'verb', name, vtype:o.vtype||'calc', rule:o.rule||'', chart:o.chart||null, course:!!o.course, branch:o.branch||'', eq:o.eq||null});
      (ins||[]).forEach(i=>wire(i, v));
      (o.quals||[]).forEach(q=>wire(q, v, 'qual'));
      const n=add({id:out.id, kind:'noun', role:'made', name:out.name, val:out.val, unit:out.unit||'', info:out.info||'', ov:out.ov||null, goal:!!out.goal, by:v});
      wire(v, n, 'make');
      return n;
    },
    // ADJECTIVE: a true/false quality read off one or more nouns
    adj(id, yes, no, val, from, o={}){ const a=add({id, kind:'adj', name: val?yes:no, yes, no, val:!!val, test:o.test||'', info:o.info||''}); (from||[]).forEach(f=>wire(f, a, 'desc')); return a; },
    out(){ return {nodes, edges, steps:steps.filter(s=>s.ids.length)}; },
  };
  return P;
}
const sb = (a,b) => `${a}<sub>${b}</sub>`;

function buildProgram(r){
  const P=Program(), G=r.G, D=r.D, L=r.L, piT=S.conv.pi3?'3':'π';
  const Pk=PRESETS[presetKey]||{}, asks=Pk.asks||[];
  const st=r.settle, settleOnly = !!st && !asks.includes('Pa');
  const lyr = l => S.layers.indexOf(l);
  const goalKey = (typeof finalOf==='function') ? plain(finalOf(r).sym) : 'Pu';
  const isGoal = sym => plain(sym)===goalKey;
  P.conv = statedConversions(r);
  const blockGiven = (Pk.stated||[]).some(c=>c.type==='block');

  // ---------- GIVEN: nouns straight from the question ----------
  P.given('D','D',{val:D, unit:'m', path:'pile.D', info:'pile diameter'});
  if (!asks.includes('L')) P.given('L','L',{val:L, unit:'m', path:'pile.L', info:'embedded length'});
  const soil={};
  if (!settleOnly) r.layers.filter(l=>l.top<L+2*D).forEach(l=>{ const i=lyr(l);
    if (l.kind==='clay') soil[i]=P.given('cu'+i, `${sb('c','u')}, ${esc(l.name)}`, {val:l.cu.map(([z,v])=>`${v} at ${z} m`).join(', '), unit:'kPa', path:`layers.${i}.cu.${l.cu.length-1}.1`, info:`undrained strength of the ${esc(l.name)}, ${l.top}–${l.bot} m`});
    else if (l.sandMethod==='spt') soil[i]=P.given('N'+i, `N, ${esc(l.name)}`, {val:l.N.map(([z,v])=>`${v} at ${z} m`).join(', '), unit:'blows', path:`layers.${i}.N.${l.N.length-1}.1`, info:`SPT blow counts in the ${esc(l.name)}`});
    else soil[i]=P.given('phi'+i, `φ′, ${esc(l.name)}`, {val:l.phi, unit:'°', path:`layers.${i}.phi`, info:'friction angle'});
  });
  if (G && (!settleOnly || st.mode==='group')) P.given('n','n',{val:G.n, unit:'piles', path:S.group.layout==='grid'?'group.nx':'group.nring', info:'number of piles'});
  if (G && S.group.mode==='min' && !settleOnly && !blockGiven) P.given('S', S.group.layout==='grid'?'spacing':'ring radius', {val:S.group.layout==='grid'?`${S.group.Sx} × ${S.group.Sy}`:S.group.R, unit:'m', path:S.group.layout==='grid'?'group.Sx':'group.R', info:'centre-to-centre spacing of the piles'});
  if (given('FS') && !settleOnly) P.given('FS','FS',{val:S.group.FS, path:'group.FS', info:'safety factor'});
  if (given('Q') && !settleOnly) P.given('Q','Q',{val:S.group.Q, unit:'kN', path:'group.Q', info:'working load'});
  if (G && S.group.mode==='eff' && !settleOnly) P.given('eta','η',{val:S.group.eta, unit:'%', path:'group.eta', info:'group efficiency, given'});

  if (!settleOnly){
    // ---------- analysis method: one adjective per layer ----------
    P.step('g','Choose the analysis');
    r.layers.filter(l=>l.top<L+2*D).forEach(l=>{ const i=lyr(l);
      P.adj('dr'+i, `undrained (${esc(l.name)})`, `drained (${esc(l.name)})`, l.kind==='clay', [soil[i]],
        {test:'clay?', info: l.kind==='clay'?'Clay drains slowly, so under the load it acts undrained: use c<sub>u</sub> (α-method).':'Sand drains fast: use drained values (SPT or effective stress).'});
    });
    P.end();

    const design = asks.includes('L') && r.layers.every(l=>l.kind==='clay');
    if (design) designProgram(P, r);
    else {
      // ---------- shaft, one step per slice ----------
      r.sh.segs.forEach((sg,i)=>{ const li=lyr(sg.l), dL=sg.z2-sg.z1;
        P.step('s'+i, `Find the shaft resistance, ${f(sg.z1)}–${f(sg.z2)} m`);
        if (i===0) P.verb('vper','find perimeter',['D'],{id:'per', name:'perimeter πD', val:r.perim, unit:'m'},{rule:`πD = ${piT} × ${D}`});
        P.rule('dL'+i, 'ΔL', {val:dL, unit:'m', info:`slice from ${f(sg.z1)} to ${f(sg.z2)} m`});
        let fs;
        if (sg.mode==='alpha'){
          const cu=P.verb('vcu'+i,'average',[soil[li]],{id:'cub'+i, name:'c̄<sub>u</sub>', val:sg.cuAve, unit:'kPa'},{quals:['dr'+li],
            rule: S.conv.shaftMethod==='m1' ? `mean of ${sg.used.map(u=>f(u[1])).join(', ')}` : `(c<sub>u</sub> at ${f(sg.z1)} m + c<sub>u</sub> at ${f(sg.z2)} m) / 2 = (${f(sg.used[0][1])} + ${f(sg.used[1][1])}) / 2`});
          const soft=P.adj('soft'+i,'soft (c̄<sub>u</sub> ≤ 40)','stiff (c̄<sub>u</sub> > 40)', sg.cuAve<=40, [cu], {test:'c̄<sub>u</sub> ≤ 40 kPa?', info:'Soft clay grips the pile fully (α = 1). Stiffer clay grips less, read from the α chart.'});
          const a=P.verb('va'+i,'find α',[cu],{id:'al'+i, name:'α', val:sg.alpha, ov:'alpha'},{vtype:'chart', quals:[soft],
            branch: sg.cuAve<=40 ? 'soft, so α = 1 and the chart is not needed' : `stiff, so α is read from the chart at c̄<sub>u</sub> = ${f(sg.cuAve)} kPa`,
            chart: sg.cuAve<=40 ? null : {type:'alpha', x:sg.cuAve, y:sg.alpha}, rule:'AS2159 adhesion chart'});
          fs=P.verb('vfs'+i,'find f<sub>s</sub>',[a,cu],{id:'fs'+i, name:'f<sub>s</sub>', val:sg.fs, unit:'kPa'},{rule:`f<sub>s</sub> = α·c̄<sub>u</sub> = ${f2(sg.alpha)} × ${f2(sg.cuAve)}`});
        } else if (sg.mode==='spt'){
          const nb=P.verb('vN'+i,'average',[soil[li]],{id:'Nb'+i, name:'N̄', val:sg.Nbar},{quals:['dr'+li], rule:`mean of ${sg.Npts.map(q=>q[1]).join(', ')}${S.conv.roundN?' (rounded)':''}`});
          fs=P.verb('vfs'+i,'find f<sub>s</sub>',[nb],{id:'fs'+i, name:'f<sub>s</sub>', val:sg.fs, unit:'kPa'},{rule:`Meyerhof: f<sub>s</sub> = 2N̄ = 2 × ${sg.Nbar}`});
        } else {
          fs=P.verb('vfs'+i,'find f<sub>s</sub>',[soil[li]],{id:'fs'+i, name:'f<sub>s</sub>', val:sg.fs, unit:'kPa'},{quals:['dr'+li], rule: sg.mode==='beta'?`Kσ′<sub>v</sub>tanδ with K = ${f3(sg.K)}, σ′<sub>v</sub> = ${f(sg.svpMid)} kPa`:'integrated over thin slices'});
        }
        P.verb('vdP'+i,'find ΔP<sub>s</sub>',[fs,'per','dL'+i],{id:'dP'+i, name:'ΔP<sub>s</sub>', val:sg.dP, unit:'kN'},{rule:`f<sub>s</sub> × πD × ΔL = ${f2(sg.fs)} × ${f3(r.perim)} × ${f2(dL)}${sg.sign<0?' (negative skin friction)':''}`});
        P.end();
      });
      P.step('ps','Add up the shaft');
      P.verb('vPs','add up',r.sh.segs.map((s,i)=>'dP'+i),{id:'Ps', name:'P<sub>s</sub>', val:r.sh.Ps, unit:'kN', ov:'Ps', goal:isGoal('P<sub>s</sub>')},{rule:r.sh.segs.map(s=>f0(s.dP)).join(' + ')});
      P.end();

      // ---------- base ----------
      const b=r.bs, ti=lyr(b.layer);
      P.step('b',`Find the base resistance (tip in ${esc(b.layer.name)})`);
      const Ab=P.verb('vAb','find tip area',['D'],{id:'Ab', name:'A<sub>b</sub>', val:r.Ab, unit:'m²'},{rule:`π(D/2)² = ${piT} × (${D}/2)²`});
      const LD=P.verb('vLD','divide',['L','D'],{id:'LD', name:'L/D', val:L/D},{rule:`${L} / ${D}`});
      let fb;
      if (b.mode==='clay'){
        const lng=P.adj('long','long pile (L/D ≥ 4)','short pile (L/D < 4)', b.LD>=4, [LD], {test:'L/D ≥ 4?', info:'Long piles have N<sub>c</sub> = 9; short ones read Skempton’s chart.'});
        const Nc=P.verb('vNc','find N<sub>c</sub>',[LD],{id:'Nc', name:'N<sub>c</sub>', val:b.Nc, ov:'Nc'},{vtype:'chart', quals:[lng], branch: b.LD>=4?'long, so N<sub>c</sub> = 9':'short, so read Skempton’s chart', chart:{type:'nc', x:b.LD, y:b.Nc}, rule:'Skempton, φ<sub>u</sub> = 0'});
        const cub=P.verb('vcub','find c<sub>u</sub> at the tip',[soil[ti],'L'],{id:'cub', name:'c<sub>u,b</sub>', val:b.cub, unit:'kPa'},{rule: S.conv.baseCu==='avg2D'?'average over 2D below the tip':`c<sub>u</sub> at z = ${L} m`});
        fb=P.verb('vfb','find f<sub>b</sub>',[Nc,cub],{id:'fb', name:'f<sub>b</sub>', val:b.fb, unit:'kPa', ov:'fb'},{rule:`N<sub>c</sub>·c<sub>u,b</sub> = ${f2(b.Nc)} × ${f2(b.cub)}`});
      } else if (b.mode==='spt'){
        const Nt=P.verb('vNt','find N at the tip',[soil[ti],'L'],{id:'Nt', name:'N<sub>b</sub>', val:b.Nb},{rule:`N at z = ${L} m`});
        const capd=P.adj('capd','capped (L/D ≥ 10)','below the cap (L/D < 10)', b.capped || b.fbRaw>=b.cap, [LD], {test:'40N·L/D ≥ 400N, i.e. L/D ≥ 10?', info:'Meyerhof’s base value grows with depth until it reaches 400N.'});
        fb=P.verb('vfb','find f<sub>b</sub>',[Nt,LD],{id:'fb', name:'f<sub>b</sub>', val:b.fb, unit:'kPa', ov:'fb'},{quals:[capd], branch: b.capped?`capped: f<sub>b</sub> = 400N = 400 × ${f(b.Nb)}`:`40N·L/D = 40 × ${f(b.Nb)} × ${f2(b.ratio)}`, chart:{type:'cap', x:b.ratio, N:b.Nb}, rule:'Meyerhof: 40N(L/D) ≤ 400N'});
      } else {
        fb=P.verb('vfb','find f<sub>b</sub>',[soil[ti],'L'],{id:'fb', name:'f<sub>b</sub>', val:b.fb, unit:'kPa', ov:'fb'},{rule:`N<sub>q</sub>σ′<sub>v</sub> = ${b.Nq} × ${f(b.svpb)}`});
      }
      P.verb('vPb','find f<sub>b</sub>A<sub>b</sub>',[fb,Ab],{id:'Pb', name:'f<sub>b</sub>A<sub>b</sub>', val:r.fbAb, unit:'kN', ov:'fbAb'},{rule:`${f(b.fb)} × ${f3(r.Ab)}`});
      P.end();

      P.step('pu','Add shaft and base');
      P.verb('vPu','add',['Ps','Pb'],{id:'Pu', name:'P<sub>u</sub>', val:r.Pu, unit:'kN', ov:'Pu', goal:isGoal('P<sub>u</sub>')},{rule: S.conv.eqn==='simple'?'P<sub>s</sub> + f<sub>b</sub>A<sub>b</sub>, taking W ≈ p<sub>o</sub>A<sub>b</sub>':'P<sub>s</sub> + (f<sub>b</sub> + p<sub>o</sub>)A<sub>b</sub> − W'});
      P.end();

      let cap='Pu';
      if (G){
        if (S.group.mode==='eff'){
          P.step('ge','Find the group capacity with the given η');
          P.verb('vPg','multiply',['n','eta','Pu'],{id:'Pg', name:'P<sub>u,g</sub>', val:G.Pg, unit:'kN', goal:isGoal('P<sub>u,g</sub>')},{rule:`n·η·P<sub>u</sub> = ${G.n} × ${f2(G.eta)} × ${f(r.Pu)}`});
          P.end();
        } else {
          P.step('g1','Treat the group as separate piles');
          P.verb('vnPu','multiply',['n','Pu'],{id:'nPu', name:'n·P<sub>u</sub>', val:G.sum, unit:'kN'},{rule:`${G.n} × ${f(r.Pu)}`});
          P.end();
          if (S.group.mode==='min'){
            P.step('g2','Size the equivalent block');
            const Bz = blockGiven
              ? P.given('B','block B × W',{val:`${f2(G.B)} × ${f2(G.Wd)}`, unit:'m', info:'plan size of the group, as the question gives it'})
              : P.verb('vB','find block size',['n','S','D'],{id:'B', name:'block B × W', val:G.shape==='rect'?`${f2(G.B)} × ${f2(G.Wd)}`:`Ø ${f2(G.Db)}`, unit:'m'},{rule:G.shape==='rect'?'(n − 1)·S + D on each side':'2R + D'});
            P.verb('vLB','divide',['L',Bz],{id:'LB', name:'L/B', val:G.LB},{rule:`${L} / ${f2(G.Bref)}`});
            P.end();
            P.step('g3','Find the block capacity');
            const sides=P.verb('vPsB','find side resistance',Object.values(soil).concat(['B','L']),{id:'PsB', name:'P<sub>s,block</sub>', val:G.PsB, unit:'kN'},{rule:'soil shears on soil: c<sub>a</sub> = c<sub>u</sub> (α = 1); sand as for the piles'});
            let baseB;
            if (G.baseMode==='clay'){
              const lb=P.adj('longB','deep block (L/B ≥ 4)','squat block (L/B < 4)', G.LB>=4, ['LB'], {test:'L/B ≥ 4?'});
              const NcB=P.verb('vNcB','find N<sub>c</sub>',['LB'],{id:'NcB', name:'N<sub>c</sub> (block)', val:G.Nc},{vtype:'chart', quals:[lb], branch:G.LB>=4?'deep, so N<sub>c</sub> = 9':'read Skempton’s chart at L/B', chart:{type:'nc', x:G.LB, y:G.Nc}});
              baseB=P.verb('vPbB','find base resistance',[NcB, soil[ti], 'B'],{id:'PbB', name:'P<sub>b,block</sub>', val:G.PbB, unit:'kN'},{rule:`N<sub>c</sub>·c<sub>u,b</sub>·BW = ${f2(G.Nc)} × ${f(G.cub)} × ${f2(G.areaB)}`});
            } else {
              baseB=P.verb('vPbB','find base resistance',['LB', soil[ti], 'B'],{id:'PbB', name:'P<sub>b,block</sub>', val:G.PbB, unit:'kN'},{rule:`f<sub>b</sub> = ${f0(G.fbB)} kPa over ${f2(G.areaB)} m²`, chart: G.baseMode==='spt'?{type:'cap', x:G.LB, N:G.Nb}:null});
            }
            P.verb('vPbl','add',[sides, baseB],{id:'Pbl', name:'P<sub>u,block</sub>', val:G.Pblock, unit:'kN', ov:'Pblock'},{rule:`${f0(G.PsB)} + ${f0(G.PbB)}`});
            P.end();
            P.step('g5','Take the weaker route');
            P.verb('vPg','take the smaller',['nPu','Pbl'],{id:'Pg', name:'P<sub>u,g</sub>', val:G.Pg, unit:'kN', goal:isGoal('P<sub>u,g</sub>')},{rule:`min(${f0(G.sum)}, ${f0(G.Pblock)}): ${G.gov} governs`});
            P.end();
          } else {
            P.step('g5','End-bearing group');
            P.verb('vPg','keep',['nPu'],{id:'Pg', name:'P<sub>u,g</sub>', val:G.Pg, unit:'kN', goal:isGoal('P<sub>u,g</sub>')},{rule:'end bearing: efficiency 100%'});
            P.end();
          }
        }
        cap='Pg';
      }
      const gF=given('FS'), gQ=given('Q');
      let load=null;
      if (gF || gQ){
        P.step('c', gF&&gQ?'Check the working load':gF?'Find the load allowed':'Find the safety factor');
        if (gF){ load=P.verb('vPa','divide by FS',[cap,'FS'],{id:'Pa', name:'P<sub>a</sub>', val:(G?G.Pg:r.Pu)/S.group.FS, unit:'kN', goal:isGoal('P<sub>a</sub>')},{rule:`${G?'P<sub>u,g</sub>':'P<sub>u</sub>'} / FS`});
          if (gQ) P.adj('safe','safe (Q ≤ P<sub>a</sub>)','overloaded (Q > P<sub>a</sub>)', S.group.Q<=(G?G.Pg:r.Pu)/S.group.FS, [load,'Q'], {test:'Q ≤ P<sub>a</sub>?'}); }
        else P.verb('vFS','divide by Q',[cap,'Q'],{id:'FSa', name:'FS', val:(G?G.Pg:r.Pu)/S.group.Q, goal:isGoal('FS')},{rule:'P / Q'});
        P.end();
      }
      if (st) settleProgram(P, r, load || cap);
    }
  } else settleProgram(P, r, null);
  return P.out();
}

function designProgram(P, r){
  const cl=r.layers[0], cu=cl.cu[0][1], al=r.alpha(cu), fsv=al*cu, perM=fsv*r.perim, Pb=9*cu*r.Ab, FSQ=S.group.FS*S.group.Q, Lreq=(FSQ-Pb)/perM, D=r.D, piT=S.conv.pi3?'3':'π';
  P.step('sL','Find the shaft resistance per metre');
  const soft=P.adj('soft0','soft (c<sub>u</sub> ≤ 40)','stiff (c<sub>u</sub> > 40)', cu<=40, ['cu0'], {test:'c<sub>u</sub> ≤ 40 kPa?'});
  const a=P.verb('va','find α',['cu0'],{id:'al', name:'α', val:al},{vtype:'chart', quals:[soft], chart:cu<=40?null:{type:'alpha', x:cu, y:al}, branch:cu<=40?'soft, so α = 1':`stiff, read at c<sub>u</sub> = ${cu} kPa`});
  const fs=P.verb('vfs','find f<sub>s</sub>',[a,'cu0'],{id:'fs', name:'f<sub>s</sub>', val:fsv, unit:'kPa'},{rule:`α·c<sub>u</sub> = ${f2(al)} × ${cu}`});
  const per=P.verb('vper','find perimeter',['D'],{id:'per', name:'perimeter πD', val:r.perim, unit:'m'},{rule:`${piT} × ${D}`});
  P.verb('vpm','multiply',[fs,per],{id:'psm', name:'P<sub>s</sub> per metre', val:perM, unit:'kN/m'},{rule:`f<sub>s</sub>·πD = ${f(perM)} kN per metre of pile: L is still unknown`});
  P.end();
  P.step('bL','Find the base resistance, assuming a long pile');
  const lng=P.adj('long','long pile (assumed)','short pile', true, [], {test:'assumed L/D ≥ 4, checked at the end'});
  const Nc=P.verb('vNc','find N<sub>c</sub>',[],{id:'Nc', name:'N<sub>c</sub>', val:9},{quals:[lng], branch:'assumed long, so N<sub>c</sub> = 9'});
  const Ab=P.verb('vAb','find tip area',['D'],{id:'Ab', name:'A<sub>b</sub>', val:r.Ab, unit:'m²'},{rule:`π(D/2)²`});
  P.verb('vPb','find P<sub>b</sub>',[Nc,'cu0',Ab],{id:'Pb', name:'P<sub>b</sub>', val:Pb, unit:'kN'},{rule:`N<sub>c</sub>·c<sub>u</sub>·A<sub>b</sub> = 9 × ${cu} × ${f3(r.Ab)}`});
  P.end();
  P.step('req','Find the capacity needed');
  P.verb('vreq','multiply',['FS','Q'],{id:'Preq', name:'P<sub>u</sub> needed', val:FSQ, unit:'kN'},{rule:'FS × Q'});
  P.end();
  P.step('solve','Solve for L');
  const Lr=P.verb('vL','solve for L',['Preq','Pb','psm'],{id:'Lsol', name:'L', val:Lreq, unit:'m', goal:true},{rule:`(FS·Q − P<sub>b</sub>) / (f<sub>s</sub>·πD) = (${f0(FSQ)} − ${f(Pb)}) / ${f(perM)}`});
  P.end();
  P.step('chk','Check the long-pile assumption');
  const ld=P.verb('vLD','divide',[Lr,'D'],{id:'LD', name:'L/D', val:Lreq/D},{rule:`${f2(Lreq)} / ${D}`});
  P.adj('longok','long pile confirmed (L/D ≥ 4)','short pile: redo with the chart', Lreq/D>=4, [ld], {test:'L/D ≥ 4?'});
  P.end();
}

function settleProgram(P, r, loadFrom){
  const s=r.settle;
  const EpMPa = (PRESETS[presetKey]||{}).settle && PRESETS[presetKey].settle.EpUnit==='MPa';
  P.given('Es','E<sub>s</sub>',{val:s.Es/1000, unit:'MPa', path:'settle.Es', info:'soil Young’s modulus, as the question gives it'});
  if (EpMPa) P.given('EpM','E<sub>p</sub>',{val:s.Ep/1000, unit:'MPa', path:'settle.Ep', info:'pile Young’s modulus'});
  else { P.given('Ep','E<sub>p</sub>',{val:s.Ep/1e6, unit:'GPa', path:'settle.Ep', info:'pile Young’s modulus, as the question gives it'});
    P.read(()=>P.verb('vEpM','convert to MPa',['Ep'],{id:'EpM', name:'E<sub>p</sub> (MPa)', val:s.Ep/1000, unit:'MPa', info:'same units as E<sub>s</sub>, so the ratio K is right'},{rule:'1 GPa = 1000 MPa', eq:{sym:'E<sub>p</sub> = 1000 × E<sub>p</sub>[GPa]', num:`1000 × ${s.Ep/1e6}`}})); }
  P.read(()=>P.verb('vEsk','convert to kPa',['Es'],{id:'Esk', name:'E<sub>s</sub> (kPa)', val:s.Es, unit:'kPa', info:'kPa = kN/m², so the settlement comes out in metres'},{rule:'1 MPa = 1000 kPa', eq:{sym:'E<sub>s</sub> = 1000 × E<sub>s</sub>[MPa]', num:`1000 × ${s.Es/1000}`}}));
  P.given('RA','R<sub>A</sub>',{val:s.RA, path:'settle.RA', info:'area ratio (1 for a solid pile)'});
  if (s.nu!=null) P.given('nu','ν',{val:s.nu, path:'settle.nu', info:'Poisson’s ratio'});
  if (s.h!=null) P.given('h','h',{val:s.h, unit:'m', path:'settle.h', info:'depth to the rigid base'});
  if (!loadFrom) P.given('Pload','P',{val:s.Ptot, unit:'kN', path:'settle.P', info: s.mode==='group'?'total working load on the group':'working load'});
  if (!P.has('L')) P.given('L','L',{val:r.L, unit:'m', path:'pile.L', info:'embedded length'});
  if (s.mode==='group' && !P.has('n')) P.given('n','n',{val:s.n, unit:'piles', path:S.group.layout==='grid'?'group.nx':'group.nring'});
  let Pp = loadFrom || 'Pload';
  if (s.mode==='group'){
    P.step('pp','Share the load between the piles');
    Pp=P.verb('vPp','divide',[Pp,'n'],{id:'Pp', name:'P per pile', val:s.P, unit:'kN'},{rule:`${f0(s.Ptot)} / ${s.n}, the cap is flexible and the load is shared equally`});
    P.end();
  }
  P.step('seq','Decide which corrections apply');
  const comp=P.adj('comp','compressible soil (ν < 0.5)','incompressible soil (ν = 0.5)', s.nu!=null, s.nu!=null?['nu']:[], {test:'ν given?', info:'If ν < 0.5 the soil compresses and R<sub>v</sub> corrects for it.'});
  const rig=P.adj('rigid','rigid base below','deep layer', s.h!=null, s.h!=null?['h']:[], {test:'rigid base given?', info:'A rigid base at finite depth stiffens the response; R<sub>h</sub> corrects for it.'});
  P.end();
  const grp = s.mode==='group';
  P.step(grp?'sSo':'sK', grp?'Find the settlement of one pile under 1 kN':'Find the pile stiffness');
  const K=P.verb('vK','find K',['EpM','Es','RA'],{id:'K', name:'K', val:s.K},{rule:`(E<sub>p</sub>/E<sub>s</sub>)·R<sub>A</sub> = (${f0(s.Ep/1000)} MPa / ${s.Es/1000} MPa) × ${s.RA}`});
  if (!grp){ P.end(); P.step('sI','Find the influence factor I'); }
  const ld=P.verb('vLDs','divide',['L','D'],{id:'LDs', name:'L/D', val:s.LD},{rule:`${r.L} / ${r.D}`});
  const I=P.verb('vI','find I',[K,ld],{id:'I', name:'I', val:s.I},{vtype:'chart', course:!!s.used.I, chart:{type:'I', K:s.K, LD:s.LD, v:s.I},
    rule:`log interpolation between curves${s.used.I?`; course reading ${f2(s.I)} (the chart gives ${f2(s.cI.v)})`:''}`});
  if (!grp){ P.end(); P.step('sR','Find the corrections'); }
  const Rv=P.verb('vRv','find R<sub>v</sub>',s.nu!=null?[K,'nu']:[K],{id:'Rv', name:'R<sub>v</sub>', val:s.Rv},{vtype:'chart', quals:[comp], course:!!s.used.Rv,
    branch: s.nu!=null?`compressible: read at K = ${f0(s.K)}, ν = ${s.nu}`:'incompressible: R<sub>v</sub> = 1'});
  const Rh=P.verb('vRh','find R<sub>h</sub>',s.h!=null?['h','L',ld]:[ld],{id:'Rh', name:'R<sub>h</sub>', val:s.Rh},{vtype:'chart', quals:[rig], course:!!s.used.Rh,
    branch: s.h!=null?`rigid base at h/L = ${f2(s.hL)}`:'deep layer: R<sub>h</sub> = 1', chart: s.h!=null?{type:'Rh', hL:s.hL, LD:s.LD, v:s.Rh}:null});
  if (grp){
    const So=P.verb('vSo','find S<sub>o</sub>',[I,Rv,Rh,'D','Esk'],{id:'So', name:'S<sub>o</sub>', val:s.So.toExponential(2), unit:'m/kN'},{rule:'I·R<sub>v</sub>·R<sub>h</sub> / (D·E<sub>s</sub>), settlement under 1 kN'});
    P.end();
    P.step('sA','Find how much the neighbours add');
    const parts=[];
    const geo = S.group.layout==='ring' ? {sym:'R', v:S.group.R} : {sym:'S', v:S.group.Sx};
    if (!P.has('S')) P.given('S', S.group.layout==='grid'?'spacing S':'ring radius R', {val:geo.v, unit:'m', path:S.group.layout==='grid'?'group.Sx':'group.R', info:S.group.layout==='grid'?'centre-to-centre spacing':'distance from the centre pile to the ring'});
    s.classes.forEach((c,j)=>{
      const k=c.s/geo.v, how = Math.abs(k-1)<0.02 ? `s = ${geo.sym}` : Math.abs(k-Math.SQRT2)<0.02 ? `s = √2 · ${geo.sym}` : Math.abs(k-2)<0.02 ? `s = 2${geo.sym}` : `s = ${f2(k)} · ${geo.sym}`;
      const sj=P.verb('vs'+j,'measure the distance',['S'],{id:'s'+j, name:`s (${c.count} pile${c.count>1?'s':''})`, val:c.s, unit:'m', info:`${c.count} neighbour${c.count>1?'s':''} of the ${s.target} pile at this distance`},{rule:`${how} = ${f2(c.s)} m, centre to centre`});
      const sd=P.verb('vsd'+j,'divide',[sj,'D'],{id:'sd'+j, name:`s/D (${c.count} pile${c.count>1?'s':''})`, val:c.sD},{rule:`${f2(c.s)} / ${r.D}`});
      const aF=P.verb('vaF'+j,'find α<sub>F</sub>',[sd,K,ld],{id:'aF'+j, name:'α<sub>F</sub>', val:c.aF},{vtype:'chart', course:!!s.used.aF, chart:{type:'aF', sD:c.sD, LD:s.LD, K:s.K, v:c.aF}});
      const Nh=P.verb('vNh'+j,'find N<sub>h</sub>',[sd],{id:'Nh'+j, name:'N<sub>h</sub>', val:c.Nh},{vtype:'chart', quals:[rig], course:!!s.used.Nh, branch:s.h!=null?`h/L = ${f2(s.hL)}`:'deep: N<sub>h</sub> = 1'});
      parts.push(P.verb('vam'+j,'multiply',[aF,Nh],{id:'a'+j, name:`α × ${c.count}`, val:c.a*c.count},{rule:`α<sub>F</sub>·N<sub>h</sub>·N<sub>v</sub> × ${c.count} = ${f2(c.aF)} × ${f2(c.Nh)} × 1 × ${c.count}`}));
    });
    P.verb('vsa','add up',parts,{id:'sumA', name:'Σα', val:s.sumA},{});
    P.end();
    P.step('sS',`Find the settlement of the ${s.target}`);
    P.verb('vSk','find S<sub>k</sub>',[So,Pp,'sumA'],{id:'Sk', name:'S<sub>k</sub>', val:s.S*1000, unit:'mm', goal:true},{rule:'S<sub>o</sub>·P·(1 + Σα), superposition'});
    P.end();
  } else {
    P.end();
    P.step('sS','Find the settlement');
    P.verb('vS','find S',[Pp,'D','Esk',I,Rv,Rh],{id:'Sset', name:'S', val:s.S*1000, unit:'mm', goal:true},{rule:'P·I·R<sub>v</sub>·R<sub>h</sub> / (D·E<sub>s</sub>)'});
    P.end();
  }
}

// The step's sentence for other panels: "find I → I = 1.80"
function stepSentence(prog, key){
  const s=prog && prog.steps.find(x=>x.key===key); if (!s) return null;
  const made=prog.nodes.filter(n=>s.ids.includes(n.id) && n.kind==='noun' && n.role==='made');
  const out=made.find(n=>n.goal) || made.filter(n=>prog.edges.some(e=>e.a===n.id && !s.ids.includes(e.b))).pop() || made[made.length-1];
  if (!out) return {title:s.title};
  const v=prog.nodes.find(n=>n.id===out.by);
  return {title:s.title, verb:v?v.name:'', noun:out.name, val:out.val, unit:out.unit};
}

// one program per computed result, shared by the canvas and the step-by-step flow card
let _progR=null, _prog=null;
function progOf(r){ if (r!==_progR){ _progR=r; try{ _prog=buildProgram(r); }catch(e){ console.error(e); _prog=null; } } return _prog; }

// ---------- what the question states in another form ----------
// Per problem, from PRESETS[k].stated (plain data, so cloned problems keep it):
//   {type:'radius'}        the question gives the radius:            r → double the radius → D
//   {type:'grid'}          the question says "3×3":                    rows, columns → count the piles → n
//   {type:'ringDiameter'}  the question gives the group's diameter:   D_g, D → find the ring radius → R
//   {type:'block'}         the question gives the block's plan size:  B × W is a given, no spacing needed
function statedConversions(r){
  const out={}, list=(PRESETS[presetKey]||{}).stated||[], D=r.D, Gp=S.group;
  list.forEach(c=>{
    if (c.type==='radius') out.D = {from:[{id:'rad', name:'r', val:D/2, unit:'m', path:'pile.D', info:'pile radius, as the question gives it'}], vid:'vD', verb:'double the radius',
      name:'D', val:D, unit:'m', info:'pile diameter, what every formula uses', rule:'D = 2r', sym:'D = 2r', num:`2 × ${f2(D/2)}`};
    if (c.type==='grid') out.n = {from:[{id:'nx', name:'rows', val:Gp.nx, path:'group.nx', info:'piles along one side'},{id:'ny', name:'columns', val:Gp.ny, path:'group.ny', info:'piles along the other side'}], vid:'vn', verb:'count the piles',
      name:'n', val:Gp.nx*Gp.ny, unit:'piles', info:'number of piles', rule:`n = rows × columns = ${Gp.nx} × ${Gp.ny}`, sym:'n = rows × columns', num:`${Gp.nx} × ${Gp.ny}`};
    if (c.type==='ringDiameter') out.S = {from:[{id:'Dg', name:'D<sub>g</sub>', val:2*Gp.R+D, unit:'m', path:'group.R', info:'diameter of the group, outside edge to outside edge, as the question gives it'}, 'D'], vid:'vR', verb:'find the ring radius',
      name:'ring radius R', val:Gp.R, unit:'m', info:'centre of the group to the centre of a ring pile', rule:`D<sub>g</sub> = 2R + D, so R = (D<sub>g</sub> − D)/2 = (${f(2*Gp.R+D)} − ${D})/2`, sym:'R = (D<sub>g</sub> − D)/2', num:`(${f(2*Gp.R+D)} − ${D})/2`};
  });
  return out;
}
