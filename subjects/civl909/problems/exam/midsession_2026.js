// ================= MID-SESSION EXAMINATION 2026 · Section II (4 numerical problems, 20 marks) =================
// Paper: "Mid_Session_2026_Questions_Only.pdf". Steps follow ANSWER_KEY.md ("takes → verb → makes"). Section I (14 multiple choice) is in quiz/midsession_2026.json.
const EX={ track:'shallow', source:'exam', group:'Mid-session 2026 · Section II' };

Problem({ ...EX, id:'ex26q1', week:1, type:'bearing', title:'Exam 2026 · Q1', sub:'Strip basement slab on dense sand under loose silt (4 marks)',
  answer:'Key: q<sub>f</sub> ≈ 2686 kPa', check:[{id:'qf',exp:2686,tol:0.01,label:'q_f',unit:'kPa'}],
  text:'A multistorey building has a basement slab (strip foundation, 6 m wide) resting on dense sand under 4 m of loose silt; the water table is at the surface. Dense sand: γ<sub>sat</sub> = 20 kN/m³, N<sub>q</sub> = 40, N<sub>γ</sub> = 45. Loose silt: γ<sub>sat</sub> = 18 kN/m³, N<sub>q</sub> = 15, N<sub>γ</sub> = 20. c′ = 0 for both; γ<sub>w</sub> = 9.81. Neglect shape and depth factors. Calculate the ultimate bearing capacity in kPa.',
  steps:[{id:'s1',title:'Buoyant unit weights'},{id:'s2',title:'Surcharge from the silt beside the slab'},{id:'s3',title:'The two terms and their sum'}],
  nodes:[ In('gsand',20,'kN/m³','γ<sub>sat,sand</sub>','dense sand, saturated'), In('gsilt',18,'kN/m³','γ<sub>sat,silt</sub>','loose silt, saturated'), Cn('gw',9.81,'kN/m³','γ<sub>w</sub>','unit weight of water'),
    In('hs',4,'m','D<sub>f</sub>','silt above the slab: the founding depth'), In('B',6,'m','B','slab width (strip)'), In('Nq',40,'','N<sub>q</sub>','dense sand'), In('Ng',45,'','N<sub>γ</sub>','dense sand'),
    In('c',0,'kPa','c′','effective cohesion: the c·N_c term drops out',{info:'c′ = 0, so the cohesion term vanishes. The silt\'s own N factors (15, 20) are a distractor: only the soil below the base matters for N.'}),
    Fn('gps','gsand-gw',{sym:'γ′<sub>sand</sub>',name:'buoyant unit weight of the sand',unit:'kN/m³',step:'s1',verb:'subtract',eq:'γ′ = γ<sub>sat</sub> − γ<sub>w</sub>'}),
    Fn('gpt','gsilt-gw',{sym:'γ′<sub>silt</sub>',name:'buoyant unit weight of the silt',unit:'kN/m³',step:'s1',verb:'subtract',eq:'γ′ = γ<sub>sat</sub> − γ<sub>w</sub>'}),
    Fn('q','gpt*hs',{sym:'q',name:'surcharge: the silt beside the basement',unit:'kPa',step:'s2',verb:'multiply',eq:'q = γ′<sub>silt</sub>D<sub>f</sub>'}),
    Fn('tq','q*Nq',{sym:'qN<sub>q</sub>',name:'surcharge term',unit:'kPa',step:'s3',verb:'multiply',eq:'qN<sub>q</sub>'}),
    Fn('tg','0.5*gps*B*Ng',{sym:'½γ′BN<sub>γ</sub>',name:'width term',unit:'kPa',step:'s3',verb:'multiply',eq:'½γ′<sub>sand</sub>BN<sub>γ</sub>'}),
    Fn('qf','tq+tg',{sym:'q<sub>f</sub>',name:'ultimate bearing capacity',unit:'kPa',step:'s3',verb:'add',goal:true,eq:'q<sub>f</sub> = qN<sub>q</sub> + ½γ′BN<sub>γ</sub>'}) ] });

Problem({ ...EX, id:'ex26q2', week:3, type:'consol', title:'Exam 2026 · Q2', sub:'Settlement from lowering the water table, m_v method (4 marks)',
  answer:'Key: 125 mm (100 mm if the dewatered sand drops to 18 kN/m³)', check:[{id:'smm',exp:125,tol:0.02,label:'s',unit:'mm',note:'Convention: 125 mm keeps the dewatered sand at 20 kN/m³ (Δσ′ = 100 kPa, the common published key); 100 mm if it drops to 18 kN/m³.'}],
  text:'The water table, initially 5 m below ground, is permanently lowered to 15 m by pumping. Sand above the water table 18 kN/m³; sand and clay below the water table 20 kN/m³; γ<sub>w</sub> = 10 kN/m³; m<sub>v</sub> = 0.25 m²/MN. The clay layer is 5 m thick. What is the compression of the clay layer, in mm?',
  steps:[{id:'s1',title:'Change in pore pressure and effective stress'},{id:'s2',title:'A hidden unit change'},{id:'s3',title:'Settlement'}],
  nodes:[ Cn('gw',10,'kN/m³','γ<sub>w</sub>','unit weight of water (as given)'), In('z0',5,'m','z<sub>w0</sub>','original depth of the water table'), In('z1',15,'m','z<sub>w1</sub>','lowered depth of the water table'), In('mv',0.25,'m²/MN','m<sub>v</sub>','coefficient of volume compressibility'), In('H',5,'m','H','thickness of the clay'),
    Fn('du','-gw*(z1-z0)',{sym:'Δu',name:'change in pore pressure at mid-clay',unit:'kPa',step:'s1',verb:'multiply',eq:'Δu = −γ<sub>w</sub>(z<sub>w1</sub> − z<sub>w0</sub>)'}),
    Fn('ds','-du',{sym:'Δσ′',name:'increase in effective stress at mid-clay',unit:'kPa',step:'s1',verb:'negate',eq:'Δσ′ = −Δu',info:'Total stress is unchanged if the dewatered sand keeps 20 kN/m³, so effective stress rises by exactly the pore pressure lost. If the sand dried to 18 kN/m³ the answer would be 80 kPa and 100 mm.'}),
    Fn('mvk','mv/1000',{sym:'m<sub>v</sub>',name:'m_v in m²/kN: the hidden unit change',unit:'m²/kN',step:'s2',verb:'convert to m²/kN',eq:'m²/MN ÷ 1000 = m²/kN'}),
    Fn('s','mvk*ds*H',{sym:'s',name:'compression of the clay',unit:'m',step:'s3',verb:'multiply',eq:'s = m<sub>v</sub>Δσ′H'}),
    Fn('smm','s*1000',{sym:'s',name:'compression of the clay in mm',unit:'mm',step:'s3',verb:'convert to mm',goal:true,eq:'mm = m × 1000'}) ] });

Problem({ ...EX, id:'ex26q3', week:4, type:'time', title:'Exam 2026 · Q3', sub:'Consolidation time scaling: 30 mm at 2 yr, when 40 mm? (4 marks)',
  answer:'Key: t ≈ 3.56 yr', check:[{id:'t2',exp:3.56,tol:0.01,label:'t',unit:'yr'}],
  text:'A 20 m thick clay layer is sandwiched between a sand layer and a gravel layer. It experiences 30 mm settlement in 2 years. c<sub>v</sub> = 0.003 cm²/s. Calculate the time (yr) for the deposit to experience a total settlement of 40 mm.',
  steps:[{id:'s1',title:'Drainage and what is NOT needed'},{id:'s2',title:'Degree of consolidation'},{id:'s3',title:'Scale the time'}],
  nodes:[ In('S1',30,'mm','S<sub>1</sub>','settlement at the first time'), In('t1',2,'yr','t<sub>1</sub>','first time'), In('S2',40,'mm','S<sub>2</sub>','settlement wanted'), In('H',20,'m','H','thickness of the clay'),
    In('cv',0.003,'cm²/s','c<sub>v</sub>','coefficient of consolidation: given, but it cancels',{info:'A distractor: c_v appears on both sides of the scaling and cancels.'}),
    Fn('d','H/2',{sym:'d',name:'drainage path (double drainage: sand above, gravel below)',unit:'m',step:'s1',verb:'halve',eq:'d = H/2',info:'Not needed in the end, because the same clay with the same drainage is compared with itself.'}),
    Gate('lt60','1',{test:'U < 60 %?',yes:'T<sub>v</sub> = (π/4)U²',no:'use the chart',step:'s2',info:'Assumed: at 30 and 40 mm the layer is still below 60 % consolidated, so T<sub>v</sub> = (π/4)U² and U ∝ √t.'}),
    Fn('ratio','S2/S1',{sym:'U<sub>2</sub>/U<sub>1</sub>',name:'ratio of degrees of consolidation (the ultimate settlement cancels)',unit:'',step:'s2',verb:'divide',eq:'U<sub>2</sub>/U<sub>1</sub> = S<sub>2</sub>/S<sub>1</sub>'}),
    Fn('t2','lt60 ? t1*ratio*ratio : NaN',{sym:'t<sub>2</sub>',name:'time to 40 mm',unit:'yr',step:'s3',verb:'scale by U²',goal:true,eq:'t<sub>2</sub> = t<sub>1</sub>(U<sub>2</sub>/U<sub>1</sub>)²',how:v=>['T<sub>v</sub> ∝ t and T<sub>v</sub> ∝ U², so t ∝ U²: t<sub>2</sub> = t<sub>1</sub>(U<sub>2</sub>/U<sub>1</sub>)².']}) ] });

Problem({ ...EX, id:'ex26q4', week:5, type:'cpt', title:'Exam 2026 · Q4', sub:'Schmertmann settlement from a CPT profile (8 marks)',
  answer:'Key: s ≈ 48 mm (not re-run); this build gives about 40 mm', check:[{id:'s',exp:48,tol:0.02,label:'s',unit:'mm',note:'The key (from a worked solution, not re-run) says about 48 mm. This build, with C₂ = 1 and I_z read from the standard square-footing triangle at each layer middle, gives about 40 mm. An independent recomputation from the lecture rules (E = 2.5q_c) agrees with 40 mm; E = 2q_c would give 50 mm and E = 3.5q_c 29 mm, so 48 mm cannot be reproduced from these data. The cone profile here was redrawn from photos, so check it and the paper\'s own I_z chart against the marked paper.'}],
  text:'A square foundation 4.0 m wide is founded at 2 m in medium fine sand (γ = 17.5 kN/m³, γ<sub>sat</sub> = 18 kN/m³). The water table is at the ground surface. The net loading intensity is 140 kN/m². Using the cone resistance measured below the foundation (layers 2.0, 1.0, 3.0 and 2.0 m thick with q<sub>c</sub> = 3, 3.5, 5, 4 MPa), estimate the probable settlement (Schmertmann).',
  steps:[{id:'s1',title:'Effective stress and the depth correction C_1'},{id:'s2',title:'Peak strain influence factor'},{id:'s3',title:'Each layer: depth of middle, I_z, E'},{id:'s4',title:'Settlement'}],
  nodes:(()=>{ const L=[[2,3],[1,3.5],[3,5],[2,4]], out=[], terms=[];
    L.forEach(([dz,qc],i)=>{ const k=i+1; const before=L.slice(0,i).map((_,j)=>'dz'+(j+1)).join('+');
      out.push(In('dz'+k,dz,'m','Δz<sub>'+k+'</sub>','thickness of layer '+k+' below the base'), In('qc'+k,qc,'MPa','q<sub>c'+k+'</sub>','cone resistance in layer '+k),
        Fn('zm'+k,(before?before+'+':'')+`dz${k}/2`,{sym:'z<sub>'+k+'</sub>',name:'depth of the middle of layer '+k+' below the base',unit:'m',step:'s3',verb:'find the middle',eq:'z = Σ(layers above) + Δz/2'}),
        Fn('Iz'+k,`izSq(zm${k},B,Izp)`,{sym:'I<sub>z'+k+'</sub>',name:'strain influence factor at the middle of layer '+k,unit:'',step:'s3',verb:'read I<sub>z</sub>',eq:'I<sub>z</sub> = f(z/B)',num:v=>'f('+fmt(v['zm'+k])+' / '+fmt(v.B)+')',
          chart:v=>({type:'curve', xl:'I<sub>z</sub>', yl:'depth below the base (m)', xmin:0, xmax:0.8, ymin:0, ymax:8, yrev:true, series:[{lab:'I<sub>z</sub> (square footing)',pts:[[0.1,0],[v.Izp,v.B/2],[0,2*v.B]],hi:true}], point:{x:v['Iz'+k],y:v['zm'+k]}}),
          how:v=>[`Depth of the middle of layer ${k}: <b>${fmt(v['zm'+k])} m</b> below the base (B = ${fmt(v.B)} m).`,'For a square footing I<sub>z</sub> is 0.1 at the base, rises straight to I<sub>zp</sub> at B/2 and falls straight to zero at 2B.',`<b>I<sub>z</sub> = ${fmt(v['Iz'+k])}</b>.`]}),
        Fn('E'+k,`2.5*qc${k}`,{sym:'E<sub>'+k+'</sub>',name:'modulus of layer '+k,unit:'MPa',step:'s3',verb:'find E',eq:'E = 2.5q<sub>c</sub> (square footing)'}),
        Fn('T'+k,`Iz${k}*dz${k}/E${k}`,{sym:'T<sub>'+k+'</sub>',name:'contribution of layer '+k,unit:'m/MPa',step:'s3',verb:'find I<sub>z</sub>Δz/E',eq:'T = I<sub>z</sub>Δz/E'})); terms.push('T'+k); });
    return [ In('B',4,'m','B','footing side (square)'), In('D',2,'m','D<sub>f</sub>','founding depth'), In('gsat',18,'kN/m³','γ<sub>sat</sub>','saturated unit weight (water table at the surface)'), Cn('gw',9.81,'kN/m³','γ<sub>w</sub>','unit weight of water'), In('qn',140,'kPa','q<sub>n</sub>','net loading intensity'),
      In('C2',1,'','C<sub>2</sub>','creep factor: not given in the question, taken as 1',{info:'No time is stated, so C₂ = 1. A creep factor above 1 would raise the answer towards the key\'s 48 mm.'}),
      Fn('sv0','(gsat-gw)*D',{sym:'σ′<sub>v0</sub>',name:'effective stress at the base',unit:'kPa',step:'s1',verb:'find σ′<sub>v0</sub>',eq:'σ′<sub>v0</sub> = (γ<sub>sat</sub> − γ<sub>w</sub>)D<sub>f</sub>'}),
      Fn('C1','1 - 0.5*sv0/qn',{sym:'C<sub>1</sub>',name:'depth correction factor',unit:'',step:'s1',verb:'find C<sub>1</sub>',eq:'C<sub>1</sub> = 1 − 0.5σ′<sub>v0</sub>/q<sub>n</sub>'}),
      Fn('svp','sv0+(gsat-gw)*B/2',{sym:'σ′<sub>vp</sub>',name:'effective stress at the depth of the peak (B/2 below the base)',unit:'kPa',step:'s2',verb:'find σ′<sub>vp</sub>',eq:'σ′<sub>vp</sub> = σ′<sub>v0</sub> + γ′B/2'}),
      Fn('Izp','0.5 + 0.1*sqrt(qn/svp)',{sym:'I<sub>zp</sub>',name:'peak strain influence factor',unit:'',step:'s2',verb:'find I<sub>zp</sub>',eq:'I<sub>zp</sub> = 0.5 + 0.1√(q<sub>n</sub>/σ′<sub>vp</sub>)'}),
      ...out,
      Fn('sumT',terms.join('+'),{sym:'ΣT',name:'sum of I_zΔz/E over the layers',unit:'m/MPa',step:'s4',verb:'add up',eq:'ΣT = Σ I<sub>z</sub>Δz/E'}),
      Fn('s','C1*C2*qn*sumT',{sym:'s',name:'Schmertmann settlement',unit:'mm',step:'s4',verb:'find s',goal:true,eq:'s = C<sub>1</sub>C<sub>2</sub>q<sub>n</sub>ΣI<sub>z</sub>Δz/E'}) ]; })() });
