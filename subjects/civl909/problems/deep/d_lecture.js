// ================= DEEP · declarative pile problems from the week 7 to 9 lecture examples (they feed the exam generator) =================
// Chart readings (α, N_c, I, R_v, R_h, interaction factors) are typed givens, as the lectures read them. Everything else is computed.
// Check values come from the lecture slides (which round π to 3, so a 2-3 % difference from exact π is expected).
const DP={ track:'deep', source:'lecture' };

// ---- clay: layered shaft, N_c = 9 base (lecture week 7, "Method 2 for test/exam") ----
Problem({ ...DP, id:'dpclay', week:7, type:'capacity-clay', title:'Pile in layered clay', sub:'Shaft by layers (α·c_u), base 9·c_u (lecture week 7)',
  answer:'Lecture: P<sub>u</sub> ≈ 2400 kN (slide takes π ≈ 3); exact π gives 2473 kN', check:[{id:'Pu',exp:2400,tol:0.04,label:'P_u',unit:'kN',note:'The slide rounds π to 3 and P_b to 700 kN: 1700 + 700 = 2400 kN.'}],
  text:'Ultimate capacity of a 12 m long, 1.3 m diameter pile in soft clay. Undrained strength, averaged over each layer: 0–2 m: 30 kPa (α = 1), 2–7 m: 30 kPa (α = 1), 7–12 m: 50 kPa (α = 0.88). c<sub>u</sub> over the 2D below the base averages 60 kPa. L/D > 4, so N<sub>c</sub> = 9. Neglect the pile weight and the overburden at the base (they balance).',
  steps:[{id:'s1',title:'Shaft resistance, layer by layer'},{id:'s2',title:'Base resistance'},{id:'s3',title:'Capacity and allowable load'}],
  nodes:[ In('D',1.3,'m','D','pile diameter'), In('L1',2,'m','L<sub>1</sub>','layer 1'), In('L2',5,'m','L<sub>2</sub>','layer 2'), In('L3',5,'m','L<sub>3</sub>','layer 3'),
    In('c1',30,'kPa','c<sub>u1</sub>','average c<sub>u</sub>, layer 1'), In('c2',30,'kPa','c<sub>u2</sub>','layer 2'), In('c3',50,'kPa','c<sub>u3</sub>','layer 3'),
    In('a1',1,'','α<sub>1</sub>','adhesion factor read from the AS 2159 chart'), In('a2',1,'','α<sub>2</sub>','adhesion factor'), In('a3',0.88,'','α<sub>3</sub>','adhesion factor'),
    In('cb',60,'kPa','c<sub>u,b</sub>','average c<sub>u</sub> over 2D below the base'), Cn('Nc',9,'','N<sub>c</sub>','L/D ≥ 4 (Skempton)'), In('FS',2.5,'','FS','factor of safety'),
    Fn('Ps','PI*D*(a1*c1*L1 + a2*c2*L2 + a3*c3*L3)',{sym:'P<sub>s</sub>',name:'shaft resistance',unit:'kN',step:'s1',verb:'sum the layers',eq:'P<sub>s</sub> = πD Σ α<sub>i</sub>c<sub>u,i</sub>L<sub>i</sub>'}),
    Fn('Pb','Nc*cb*PI*D*D/4',{sym:'P<sub>b</sub>',name:'base resistance',unit:'kN',step:'s2',verb:'find P<sub>b</sub>',eq:'P<sub>b</sub> = N<sub>c</sub>c<sub>u,b</sub>πD²/4'}),
    Fn('Pu','Ps+Pb',{sym:'P<sub>u</sub>',name:'ultimate capacity',unit:'kN',step:'s3',verb:'add',goal:true,eq:'P<sub>u</sub> = P<sub>s</sub> + P<sub>b</sub>'}),
    Fn('Pa','Pu/FS',{sym:'P<sub>a</sub>',name:'allowable load',unit:'kN',step:'s3',verb:'divide',eq:'P<sub>a</sub> = P<sub>u</sub>/FS'}) ] });

// ---- sand: clay above, sand below, Meyerhof (lecture week 8) ----
Problem({ ...DP, id:'dpsand', week:8, type:'capacity-sand', title:'Pile through clay into sand', sub:'Clay by α·c_u, sand by Meyerhof f_s = 2N̄, f_b = 40N L/D ≤ 400N (lecture week 8)',
  answer:'Lecture: P<sub>u</sub> ≈ 1800 kN (π ≈ 3); exact π gives about 1870 kN', check:[{id:'Pu',exp:1800,tol:0.05,label:'P_u',unit:'kN',note:'The slide uses π ≈ 3 and rounds the parts: 285 + 1500.'}],
  text:'A 5 m long, 0.5 m diameter driven pile passes through 2 m of clay (c<sub>u</sub> = 50 kPa, α = 0.88) into sand. Average SPT N in the sand shaft is 17 and N at the base is 20. Use Meyerhof (1959): f<sub>s</sub> = 2N̄ kPa, f<sub>b</sub> = 40N<sub>b</sub>L/D ≤ 400N<sub>b</sub> kPa. Neglect the pile weight and the overburden at the base.',
  steps:[{id:'s1',title:'Clay part of the shaft'},{id:'s2',title:'Sand part of the shaft'},{id:'s3',title:'Base'},{id:'s4',title:'Capacity'}],
  nodes:[ In('D',0.5,'m','D','pile diameter'), In('Lc',2,'m','L<sub>c</sub>','pile length in clay'), In('Ls',3,'m','L<sub>s</sub>','pile length in sand'), In('cu',50,'kPa','c<sub>u</sub>','clay'), In('al',0.88,'','α','adhesion factor for this c<sub>u</sub>'), In('Nm',17,'blows','N̄','average SPT N over the sand shaft'), In('Nb',20,'blows','N<sub>b</sub>','SPT N at the base'), In('FS',2.5,'','FS','factor of safety'),
    Fn('Psc','al*cu*PI*D*Lc',{sym:'P<sub>s,clay</sub>',name:'shaft resistance in the clay',unit:'kN',step:'s1',verb:'find P<sub>s</sub>',eq:'P<sub>s</sub> = αc<sub>u</sub>πDL<sub>c</sub>'}),
    Fn('fs','2*Nm',{sym:'f<sub>s</sub>',name:'unit shaft friction in the sand (Meyerhof)',unit:'kPa',step:'s2',verb:'find f<sub>s</sub>',eq:'f<sub>s</sub> = 2N̄'}),
    Fn('Pss','fs*PI*D*Ls',{sym:'P<sub>s,sand</sub>',name:'shaft resistance in the sand',unit:'kN',step:'s2',verb:'find P<sub>s</sub>',eq:'P<sub>s</sub> = f<sub>s</sub>πDL<sub>s</sub>'}),
    Fn('fb','min(40*Nb*(Lc+Ls)/D, 400*Nb)',{sym:'f<sub>b</sub>',name:'unit base resistance (Meyerhof, capped at 400N)',unit:'kPa',step:'s3',verb:'find f<sub>b</sub>',eq:'f<sub>b</sub> = min(40N<sub>b</sub>L/D, 400N<sub>b</sub>)'}),
    Fn('Pb','fb*PI*D*D/4',{sym:'P<sub>b</sub>',name:'base resistance',unit:'kN',step:'s3',verb:'find P<sub>b</sub>',eq:'P<sub>b</sub> = f<sub>b</sub>πD²/4'}),
    Fn('Pu','Psc+Pss+Pb',{sym:'P<sub>u</sub>',name:'ultimate capacity',unit:'kN',step:'s4',verb:'add',goal:true,eq:'P<sub>u</sub> = P<sub>s,clay</sub> + P<sub>s,sand</sub> + P<sub>b</sub>'}),
    Fn('Pa','Pu/FS',{sym:'P<sub>a</sub>',name:'allowable load',unit:'kN',step:'s4',verb:'divide',eq:'P<sub>a</sub> = P<sub>u</sub>/FS'}) ] });

// ---- group in clay: n single piles against the equivalent block (lecture week 8) ----
Problem({ ...DP, id:'dgroup', week:8, type:'group', title:'Pile group in clay', sub:'Lesser of n·P_u and the equivalent block (lecture week 8)',
  answer:'Computed: group capacity = lesser of n·P<sub>u</sub> and P<sub>u,b</sub>',
  text:'A 3 × 3 group of 0.5 m piles at a spacing giving a block 4.5 m × 4.5 m, 9 m long, in clay. One pile has P<sub>u</sub> = 580 kN. The block\'s side adhesion is the average c<sub>u</sub> = 38 kPa, the base c<sub>u</sub> = 56 kPa and N<sub>c</sub> = 8.4 (L/B = 2). The load is 1600 kN and FS = 3.',
  steps:[{id:'s1',title:'As nine separate piles'},{id:'s2',title:'As one equivalent block'},{id:'s3',title:'The lesser, and the allowable load'}],
  nodes:[ In('n',9,'','n','number of piles'), In('Pus',580,'kN','P<sub>u</sub>','capacity of one pile'), In('B',4.5,'m','B','block width'), In('W',4.5,'m','W','block length'), In('L',9,'m','L','embedded length'), In('ca',38,'kPa','c<sub>a</sub>','soil–soil adhesion: average c<sub>u</sub> (not reduced)'), In('cb',56,'kPa','c<sub>u,b</sub>','c<sub>u</sub> at the base'), In('Nc',8.4,'','N<sub>c</sub>','Skempton chart at L/B = 2'), In('FS',3,'','FS','factor of safety'), In('Q',1600,'kN','Q','load to carry'),
    Fn('Pgs','n*Pus',{sym:'P<sub>g,s</sub>',name:'capacity as separate piles',unit:'kN',step:'s1',verb:'multiply',eq:'P<sub>g,s</sub> = nP<sub>u</sub>'}),
    Fn('Pub','ca*2*(B+W)*L + Nc*cb*B*W',{sym:'P<sub>u,b</sub>',name:'capacity as an equivalent block',unit:'kN',step:'s2',verb:'find P<sub>u,b</sub>',eq:'P<sub>u,b</sub> = c<sub>a</sub>·2(B + W)L + N<sub>c</sub>c<sub>u,b</sub>BW'}),
    Fn('Pug','min(Pgs,Pub)',{sym:'P<sub>u,g</sub>',name:'group capacity: the lesser',unit:'kN',step:'s3',verb:'take the lesser',goal:true,eq:'P<sub>u,g</sub> = min(P<sub>g,s</sub>, P<sub>u,b</sub>)'}),
    Fn('Pag','Pug/FS',{sym:'P<sub>a</sub>',name:'allowable group load',unit:'kN',step:'s3',verb:'divide',eq:'P<sub>a</sub> = P<sub>u,g</sub>/FS'}),
    Fn('eta','Pug/Pgs',{sym:'η',name:'group efficiency',unit:'',step:'s3',verb:'divide',eq:'η = P<sub>u,g</sub>/(nP<sub>u</sub>)'}) ] });

// ---- settlement of a single pile (lecture week 9) ----
Problem({ ...DP, id:'dsettle', week:9, type:'settlement', title:'Single pile settlement', sub:'S = P·I·R_v·R_h/(D·E_s) (lecture week 9)',
  answer:'Lecture: S ≈ 14 mm', check:[{id:'S',exp:14,tol:0.04,label:'S',unit:'mm'}],
  text:'A hollow steel pile (E<sub>p</sub> = 200 GPa, R<sub>A</sub> = 0.15), D = 1.2 m, 12 m long, in gravel with E<sub>s</sub> = 200 MPa and ν = 0.3 over rock 35 m down. Load 2500 kN. From the charts: I = 1.8, R<sub>v</sub> = 0.94, R<sub>h</sub> = 0.82.',
  steps:[{id:'s1',title:'Pile stiffness factor K'},{id:'s2',title:'Settlement'}],
  nodes:[ In('P',2500,'kN','P','load on the pile'), In('D',1.2,'m','D','pile diameter'), In('Es',200,'MPa','E<sub>s</sub>','soil modulus'), In('Ep',200000,'MPa','E<sub>p</sub>','pile modulus (200 GPa)'), In('RA',0.15,'','R<sub>A</sub>','area ratio'), In('I',1.8,'','I','influence factor from the I–K chart'), In('Rv',0.94,'','R<sub>v</sub>','Poisson ratio correction'), In('Rh',0.82,'','R<sub>h</sub>','rigid base correction'),
    Fn('K','Ep/Es*RA',{sym:'K',name:'pile stiffness factor',unit:'',step:'s1',verb:'find K',eq:'K = (E<sub>p</sub>/E<sub>s</sub>)R<sub>A</sub>'}),
    Fn('S','P*I*Rv*Rh/(D*Es*1000)*1000',{sym:'S',name:'settlement of the pile head',unit:'mm',step:'s2',verb:'find S',goal:true,eq:'S = P·I·R<sub>v</sub>·R<sub>h</sub> / (D·E<sub>s</sub>)'}) ] });

// ---- settlement of a pile in a group (lecture week 9) ----
Problem({ ...DP, id:'dgset', week:9, type:'settlement', title:'Settlement in a pile group', sub:'S_k = S_o·P(1 + Σα) for a 2 × 2 group',
  answer:'Computed: 18.8 mm for the lecture-style numbers',
  text:'Four identical piles at the corners of a square each carry 1000 kN. One pile alone under that load settles 8 mm. Interaction factors: 0.5 to each of the two adjacent piles and 0.35 to the diagonal pile.',
  steps:[{id:'s1',title:'Sum the interaction factors'},{id:'s2',title:'Settlement of a pile in the group'}],
  nodes:[ In('S0',8,'mm','S<sub>single</sub>','settlement of one pile alone under the same load'), In('aa',0.5,'','α<sub>adj</sub>','interaction factor, adjacent pile'), In('ad',0.35,'','α<sub>diag</sub>','interaction factor, diagonal pile'),
    Fn('sa','2*aa+ad',{sym:'Σα',name:'sum of the interaction factors of the neighbours',unit:'',step:'s1',verb:'add',eq:'Σα = 2α<sub>adj</sub> + α<sub>diag</sub>'}),
    Fn('Sk','S0*(1+sa)',{sym:'S<sub>k</sub>',name:'settlement of a pile in the group',unit:'mm',step:'s2',verb:'find S<sub>k</sub>',goal:true,eq:'S<sub>k</sub> = S<sub>single</sub>(1 + Σα)'}) ] });
