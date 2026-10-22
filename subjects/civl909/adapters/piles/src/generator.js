// ================= PRACTICE GENERATOR: problems built from the patterns in the course set =================
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function makeRand(seed){
  const u=mulberry32(seed);
  const R=(a,b,s)=>{ const n=Math.floor((b-a)/s+1e-9); return +(a+s*Math.floor(u()*(n+1))).toFixed(3); };
  const pick=a=>a[Math.floor(u()*a.length)];
  return {R, pick, u};
}
const r1 = v => +(+v).toFixed(2);
const PATTERNS = {
  single_linear:{name:'Single pile, c<sub>u</sub> rising with depth', from:'W7 Q2, W8 group example (single pile part)', tags:['clay α','linear cu'],
    make(X){ const D=X.pick([0.5,0.6,0.8,1.0,1.2]), L=X.R(8,16,1), c0=X.R(15,45,5), k=X.R(2,6,0.5), g=X.pick([18,19,20]), zw=X.pick([0,0.5,1,1.5,2]), gp=X.pick([24,27]);
      const z40=(40-c0)/k; return { pile:{D,L,gp}, water:{zw}, layers:[clay({name:'Soft clay', top:0, bot:L+20, gamma:g, cu:[[0,c0],[L,r1(c0+k*L)]]})],
        conv:{splits: z40>0.2&&z40<L-0.2 ? [r1(z40)] : [r1(L/2)]}, group:{on:false}, hide:['FS','Q'], asks:['Pu'],
        text:`Calculate the ultimate bearing capacity of a ${L} m long pile, ${D} m in diameter, driven into soft clay. The unit weight of the pile is ${gp} kN/m³ and the saturated unit weight of the clay is ${g} kN/m³. The water table is ${zw} m below ground level. The undrained shear strength varies with depth as c<sub>u</sub> = ${c0} + ${k}z kPa.` }; } },
  two_layers:{name:'Single pile, two clay layers', from:'W7 Q1', tags:['clay α','two layers'],
    make(X){ const h1=X.R(1.5,4,0.5), cu1=X.R(20,40,5), cu2=X.R(45,90,5), D=X.pick([0.4,0.5,0.6,0.8,1.0]), L=X.R(Math.ceil(h1+3),15,1);
      return { pile:{D,L,gp:24}, water:{zw:50}, layers:[clay({name:'Upper clay', top:0, bot:h1, gamma:18, cu:[[0,cu1],[h1,cu1]]}), clay({name:'Lower clay', top:h1, bot:h1+25, gamma:18, cu:[[h1,cu2],[h1+25,cu2]]})],
        conv:{splits:[]}, group:{on:false}, hide:['FS','Q','gp','zw','gamma'], asks:['Pu'],
        text:`A single pile of diameter ${D} m is embedded ${L} m into clayey soils. The upper layer is ${h1} m thick with an undrained shear strength of ${cu1} kPa. The lower layer is 25 m thick with an undrained shear strength of ${cu2} kPa. Estimate the ultimate bearing capacity of the pile.` }; } },
  clay_sand:{name:'Single pile, clay over sand (SPT)', from:'W8 lecture example', tags:['clay over sand','SPT'],
    make(X){ const hc=X.R(1,4,0.5), cu=X.R(30,70,5), L=X.R(hc+3,14,0.5), D=X.pick([0.4,0.5,0.6,0.8]), zw=X.pick([0,0.2,0.5,1]), gs=X.pick([19,20,21]);
      const n=X.pick([3,4]); const pts=[]; let N=X.R(8,15,1); for (let i=0;i<n;i++){ const z= i===0 ? r1(hc+0.2) : i===n-1 ? L : Math.round((hc+(L-hc)*i/(n-1))*2)/2; pts.push([z,N]); N+=X.R(2,6,1); }
      return { pile:{D,L,gp:24}, water:{zw}, layers:[clay({name:'Clay', top:0, bot:hc, gamma:18, cu:[[0,cu],[hc,cu]]}), sand({name:'Sand', top:hc, bot:hc+25, gamma:gs, N:pts})],
        conv:{splits:[]}, group:{on:false}, hide:['FS','Q','gp'], asks:['Ps','Pu'],
        text:`Calculate the ultimate bearing capacity of a ${L} m pile, ${D} m in diameter. The top ${hc} m is clay (γ = 18 kN/m³, c<sub>u</sub> = ${cu} kPa); below is sand (γ = ${gs} kN/m³). The water table is ${zw} m below ground. SPT: ${pts.map(([z,n])=>`N = ${n} at z = ${z} m`).join(', ')}. Use f<sub>s</sub> = 2N̄ and f<sub>b</sub> = 40N(L/D) ≤ 400N kPa for the sand.` }; } },
  design_L:{name:'Design: find the pile length', from:'W7 Q3', tags:['clay α','design L'],
    make(X){ const cu=X.R(40,90,5), D=X.pick([0.6,0.8,1.0,1.2,1.5]), Q=X.R(600,2500,100), FS=X.pick([2,2.5,3]);
      return { pile:{D,L:10,gp:24}, water:{zw:0}, layers:[clay({name:'Soft clay', top:0, bot:80, gamma:20, cu:[[0,cu]]})], conv:{splits:[]}, group:{on:false, Q, FS},
        hide:['gp','zw'], asks:['L'], check:S=>{ const s=solveL(S); return s && s.L>4 && s.L<40; },
        text:`A single pile is designed to carry a load of ${Q} kN in a deep soft clay. The pile diameter is ${D} m. The soil is uniform with γ<sub>sat</sub> = 20 kN/m³ and c<sub>u</sub> = ${cu} kPa. A safety factor of ${FS} is required. Calculate the required pile length. (The length slider starts at a guess of 10 m.)` }; } },
  group_clay:{name:'Pile group in clay: single piles vs block', from:'W8 group example, W8 Q2', tags:['group','clay α','block'],
    make(X){ const nx=X.pick([2,3]), ny=X.pick([2,3]), D=X.pick([0.5,0.6,0.8]), S_=r1(Math.round(X.pick([2.5,3,3.5,4])*D*10)/10), L=X.R(8,15,1), c0=X.R(15,35,5), k=X.R(2,5,0.5);
      const withQ=X.u()<0.5, Q=X.R(1000,4000,100); const B=r1((nx-1)*S_+D), Wd=r1((ny-1)*S_+D);
      return { pile:{D,L,gp:24}, water:{zw:0}, layers:[clay({name:'Clay', top:0, bot:L+25, gamma:20, cu:[[0,c0],[L,r1(c0+k*L)]]})], conv:{splits:[r1(L/3),r1(2*L/3)]},
        group:{on:true, layout:'grid', nx, ny, Sx:S_, Sy:S_, mode:'min', FS:3, Q}, hide:withQ?['gp','zw']:['gp','zw','Q'], asks: withQ?['Pu','sum','Pblock','Pg','Pa']:['Pu','sum','Pblock','Pg','Pa'],
        text:`A ${nx}×${ny} pile group is driven ${L} m into soft clay (γ<sub>sat</sub> = 20 kN/m³). Pile diameter ${D} m, centre-to-centre spacing ${S_} m (block ${B} m × ${Wd} m). c<sub>u</sub> = ${c0} + ${k}z kPa. ${withQ?`The group carries ${Q} kN with a required safety factor of 3. Check the design.`:'Find the ultimate capacity of the group and the allowable load with FS = 3.'}` }; } },
  group_sand_clay:{name:'Pile group, sand over clay', from:'W8 Q3', tags:['group','sand over clay','SPT','block'],
    make(X){ const hs=X.R(2,4,0.5), N1=X.R(4,8,1), N2=X.R(12,20,1), c0=X.R(30,50,5), k=X.R(2,4,1), L=X.R(hs+4,14,0.5), D=X.pick([0.6,0.75,0.8]), nx=2, ny=X.pick([2,3]);
      const S_=r1(Math.round(X.pick([3,3.5,4,4.5])*D*10)/10);
      return { pile:{D,L,gp:24}, water:{zw:50}, layers:[sand({name:'Sand', top:0, bot:hs, gamma:18, N:[[0,N1],[r1(hs-0.5),N2]]}), clay({name:'Clay', top:hs, bot:hs+30, gamma:18, cu:[[hs,c0],[L,r1(c0+k*(L-hs))]]})],
        conv:{splits:[]}, group:{on:true, layout:'grid', nx, ny, Sx:S_, Sy:S_, mode:'min', FS:3, Q:1000}, hide:['Q','gp','zw','gamma'], asks:['Pu','Pg','Pa'],
        text:`Estimate the load allowed for a ${nx}×${ny} group of ${D} m piles driven ${L} m, spacing ${S_} m. FS = 3. Sand for the top ${hs} m: N = ${N1} at the surface and N = ${N2} at z = ${r1(hs-0.5)} m. Clay below: c<sub>u</sub> = ${c0} kPa at z = ${hs} m, rising ${k} kPa per metre.` }; } },
  group_clay_sand:{name:'Pile group, clay over sand', from:'Quiz 3', tags:['group','clay over sand','SPT','block'],
    make(X){ const hc=X.R(3,6,1), c0=X.R(20,40,5), k=X.R(3,6,1), L=X.R(hc+4,hc+9,1), D=X.pick([0.8,1.0]), zw=X.pick([0,0.4,1]), nx=3, ny=2;
      const S_=r1(Math.round(X.pick([2.5,3,3.5])*D*10)/10); const pts=[]; let N=X.R(12,18,1); [0,2,4,7,15].forEach(dz=>{ pts.push([hc+dz,N]); N+=X.R(2,5,1); });
      return { pile:{D,L,gp:27}, water:{zw}, layers:[clay({name:'Clay', top:0, bot:hc, gamma:18, cu:[[0,c0],[hc,c0+k*hc]]}), sand({name:'Sand', top:hc, bot:hc+15, gamma:20, N:pts})],
        conv:{splits: (40-c0)/k>0.2 && (40-c0)/k<hc ? [r1((40-c0)/k)] : []}, group:{on:true, layout:'grid', nx, ny, Sx:S_, Sy:S_, mode:'min', eta:100, FS:3, Q:1000}, hide:['FS','Q'], asks:['Ps','Pu','sum','Pblock','Pg'],
        text:`A group of ${nx*ny} concrete piles (${nx} × ${ny}, spacing ${S_} m) is ${D} m in diameter and embedded ${L} m. The water table is ${zw} m below the surface. Pile unit weight 27 kN/m³. Clay on top, ${hc} m thick, c<sub>u</sub> = ${c0} + ${k}z kPa. Sand below with ${pts.map(([z,n])=>`N = ${n} at ${z} m`).join(', ')}. Assume π = 3 and efficiency 100%. Find P<sub>s</sub>, P<sub>u</sub>, the group from single piles, the block, and the group capacity.` }; } },
  ring_sand:{name:'Ring group in sand, given efficiency', from:'W8 Q1', tags:['group','ring','SPT','efficiency'],
    make(X){ const n=X.pick([5,6,7,8]), D=X.pick([0.8,1.0,1.2]), L=X.R(8,15,1), eta=X.pick([70,75,80,85,90]);
      const R_=Math.ceil(Math.max(2.6*D/(2*Math.sin(Math.PI/n)), 2.6*D)*10)/10; const pts=[]; let N=X.R(6,10,1); [0.2, Math.round(L*0.5)/2, Math.round(L)/2, Math.round(L*1.4)/2, L-0.5].forEach(z=>{ pts.push([r1(z),N]); N+=X.R(2,5,1); });
      return { pile:{D,L,gp:24}, water:{zw:50}, layers:[sand({name:'Sand', top:0, bot:L+20, gamma:20, N:pts})], conv:{splits:[]},
        group:{on:true, layout:'ring', nring:n, R:R_, centre:true, mode:'eff', eta, FS:3, Q:1000}, hide:['FS','Q','gp','zw'], asks:['Pu','Pg'],
        text:`${n+1} cast-in-place piles (${n} on a ring of radius ${R_} m plus one at the centre), ${D} m in diameter, embedded ${L} m in dry sand (γ = 20 kN/m³). Group efficiency ${eta}%. SPT: ${pts.map(([z,v])=>`N = ${v} at ${z} m`).join(', ')}. Use f<sub>s</sub> = 2N̄ and f<sub>b</sub> = 40N(L/D) ≤ 400N kPa. Find the capacity of one pile and of the group.` }; } },
};
function generate(patKey, seed){
  const keys=Object.keys(PATTERNS); if (patKey==='*' || !PATTERNS[patKey]) patKey=keys[Math.floor(Math.random()*keys.length)];
  seed = seed || (1+Math.floor(Math.random()*99999));
  const P=PATTERNS[patKey];
  for (let tries=0; tries<25; tries++){
    const X=makeRand(seed+tries*7919); const g=P.make(X);
    const pre={ title:'Practice', sub:P.name.replace(/<[^>]+>/g,''), grp:'gen', tags:P.tags, answer:'Generated problem: check your answer in the Question panel.',
      pile:{kType:'precast_soft', dType:'rough_conc', ...g.pile}, water:{gw:10, ...g.water}, layers:g.layers,
      conv:{...baseConv, ...g.conv}, group:{...baseGroup, ...g.group}, assumed:[], hide:g.hide, asks:g.asks, text:g.text,
      pattern:patKey, seed: seed+tries*7919, from:P.from };
    if (g.check){ try{ if (!g.check(pre)) continue; }catch(e){ continue; } }
    try { compute(pre,{lite:true}); } catch(e){ continue; }
    return pre;
  }
  return null;
}
