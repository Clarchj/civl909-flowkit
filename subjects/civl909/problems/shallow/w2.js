// ================= WEEK 2 · Allowable bearing pressure: SPT and plate load tests (tutorial sheet 2) =================
// Official working: "Week 2 tutorial solution.pdf" (handwritten). The 10.5 kPa-per-blow figure is the chart reading the solution uses.

Problem({ id:'w2q1', track:'shallow', week:2, source:'tutorial', type:'spt', title:'W2 Q1', sub:'Allowable pressure from SPT (Peck, Hanson, Thornburn), 25 mm',
  answer:'Official: q<sub>a</sub> ≈ 126 kPa', check:[{id:'qa',exp:126.4,tol:0.02,label:'q_a',unit:'kPa'}],
  text:'A square footing of 3.5 m side is to be founded at 1.5 m in a medium sand (γ = 19.4 kN/m³). The water table is at 3.6 m. A standard penetration test gave N<sub>60</sub> = 7, 9, 12, 12, 17, 20 at depths 1.5, 2.2, 3.0, 3.8, 4.6, 5.4 m. Estimate the allowable bearing capacity for an immediate settlement limit of 25 mm using Peck, Hanson and Thornburn. (The solution corrects the first five tests.)',
  steps:[{id:'s1',title:'Effective stress and C_N at each test'},{id:'s2',title:'Correct each N and average'},{id:'s3',title:'Read q_a and correct for the water table'}],
  nodes:(()=>{ const S=sptNodes([[1.5,7],[2.2,9],[3.0,12],[3.8,12],[4.6,17]],'s1','s2'); return [
    In('B',3.5,'m','B','footing width (square)'), In('D',1.5,'m','D<sub>f</sub>','founding depth'), In('g',19.4,'kN/m³','γ','unit weight of the sand'), In('Dw',3.6,'m','D<sub>w</sub>','depth of the water table'), Cn('gw',9.81,'kN/m³','γ<sub>w</sub>','unit weight of water'),
    ...S.nodes,
    Fn('Navg',S.avg,{sym:'N̄<sub>1</sub>',name:'average corrected blow count over the influence depth',unit:'blows',step:'s2',verb:'average',eq:'N̄<sub>1</sub> = mean of N<sub>1</sub>'}),
    Cn('qaN',10.5,'kPa/blow','q<sub>a</sub>/N','allowable pressure per blow for B = 3.5 m and 25 mm, read from the chart',{step:'s3',info:'Peck, Hanson and Thornburn design chart, as read in the solution.'}),
    Fn('qa0','qaN*Navg',{sym:'q<sub>a,0</sub>',name:'allowable pressure, water table far below',unit:'kPa',step:'s3',verb:'multiply',eq:'q<sub>a,0</sub> = (q<sub>a</sub>/N)·N̄<sub>1</sub>'}),
    Fn('Cw','0.5 + 0.5*Dw/(D+B)',{sym:'C<sub>w</sub>',name:'water table correction',unit:'',step:'s3',verb:'find C<sub>w</sub>',eq:'C<sub>w</sub> = 0.5 + 0.5D<sub>w</sub>/(D<sub>f</sub> + B)'}),
    Fn('qa','qa0*Cw',{sym:'q<sub>a</sub>',name:'allowable bearing pressure for 25 mm',unit:'kPa',step:'s3',verb:'apply C<sub>w</sub>',goal:true,eq:'q<sub>a</sub> = q<sub>a,0</sub>·C<sub>w</sub>'}) ]; })() });

Problem({ id:'w2q2', track:'shallow', week:2, source:'tutorial', type:'spt', title:'W2 Q2', sub:'SPT on saturated fine sand: dilatancy and water table',
  answer:'Official: q<sub>a</sub> ≈ 138 kPa', check:[{id:'qa',exp:138,tol:0.02,label:'q_a',unit:'kPa'}],
  text:'A fine sand is saturated throughout (20 kN/m³), water table 1 m below the surface. A standard penetration test at 2 m gave N<sub>60</sub> = 18. With settlement limited to 25 mm, find an allowable bearing pressure for a 2 m square foundation founded at 2 m.',
  steps:[{id:'s1',title:'Correct N for overburden'},{id:'s2',title:'Correct N for dilatancy'},{id:'s3',title:'Read q_a and correct for the water table'}],
  nodes:[
    In('g',20,'kN/m³','γ<sub>sat</sub>','saturated unit weight'), Cn('gw',9.81,'kN/m³','γ<sub>w</sub>','unit weight of water'), In('Dw',1,'m','D<sub>w</sub>','depth of the water table'),
    In('z',2,'m','z','depth of the test'), In('N60',18,'blows','N<sub>60</sub>','measured blow count'), In('B',2,'m','B','footing side (square)'), In('D',2,'m','D<sub>f</sub>','founding depth'),
    Fn('sp','g*z - max(0,(z-Dw)*gw)',{sym:'σ′',name:'effective vertical stress at the test depth',unit:'kPa',step:'s1',verb:'find σ′',eq:'σ′ = γ<sub>sat</sub>z − u'}),
    Fn('CN',"lookup('phtCN', sp)",{sym:'C<sub>N</sub>',name:'overburden correction, read from the C_N chart',unit:'',step:'s1',verb:'read C<sub>N</sub>',
      chart:v=>({type:'curve', xl:'σ′ (kPa)', yl:'C<sub>N</sub>', xmin:20, xmax:100, ymin:0.8, ymax:1.6, series:[{lab:'C<sub>N</sub>',pts:TABLES.phtCN,hi:true}], point:{x:v.sp,y:v.CN}}),
      how:v=>[`σ′ at the test is <b>${fmt(v.sp)} kPa</b>.`,'Enter the C<sub>N</sub> chart at that stress and read across (the solution reads about 1.5).',`<b>C<sub>N</sub> = ${fmt(v.CN)}</b>.`]}),
    Fn('N1','CN*N60',{sym:'N<sub>1</sub>',name:'blow count corrected for overburden',unit:'blows',step:'s1',verb:'correct N',eq:'N<sub>1</sub> = C<sub>N</sub>·N<sub>60</sub>'}),
    Gate('dil','N1>15',{test:'N<sub>1</sub> > 15 in saturated fine sand?',yes:'apply the dilatancy correction',no:'no correction',step:'s2',info:'Fine or silty sand below the water table gives falsely high blow counts above 15 (pore pressure cannot dissipate): the count is reduced.'}),
    Fn('Nd','dil ? 15 + 0.5*(N1-15) : N1',{sym:'N′',name:'blow count after the dilatancy correction',unit:'blows',step:'s2',verb:'correct for dilatancy',eq:'N′ = 15 + ½(N<sub>1</sub> − 15)'}),
    Cn('qaN',10.5,'kPa/blow','q<sub>a</sub>/N','allowable pressure per blow for B > 1 m and 25 mm, read from the chart',{step:'s3'}),
    Fn('qa0','qaN*Nd',{sym:'q<sub>a,0</sub>',name:'allowable pressure, water table far below',unit:'kPa',step:'s3',verb:'multiply',eq:'q<sub>a,0</sub> = (q<sub>a</sub>/N)·N′'}),
    Fn('Cw','0.5 + 0.5*Dw/(D+B)',{sym:'C<sub>w</sub>',name:'water table correction',unit:'',step:'s3',verb:'find C<sub>w</sub>',eq:'C<sub>w</sub> = 0.5 + 0.5D<sub>w</sub>/(D<sub>f</sub> + B)'}),
    Fn('qa','qa0*Cw',{sym:'q<sub>a</sub>',name:'allowable bearing pressure for 25 mm',unit:'kPa',step:'s3',verb:'apply C<sub>w</sub>',goal:true,eq:'q<sub>a</sub> = q<sub>a,0</sub>·C<sub>w</sub>'}) ] });

Problem({ id:'w2q3', track:'shallow', week:2, source:'tutorial', type:'plate', title:'W2 Q3', sub:'Plate load test scaled to a 2 m footing',
  answer:'Official: s = 30.2 mm', check:[{id:'s',exp:30.24,tol:0.02,label:'s',unit:'mm'}],
  text:'A plate load test with a 30 × 30 cm plate was done at the level of a prototype foundation in cohesionless soil (water table at great depth). The plate settled 10 mm at 160 kN/m². Find the settlement of a 2 × 2 m square footing under the same pressure.',
  steps:[{id:'s1',title:'Scale the plate settlement'}],
  nodes:[
    In('sp',10,'mm','s<sub>p</sub>','settlement of the plate'), In('Bp',0.3,'m','B<sub>p</sub>','plate width'), In('q',160,'kPa','q','pressure in the test (the same under the footing)'), In('B',2,'m','B','footing width'),
    Fn('s','sp*pow(2*B/(B+Bp),2)',{sym:'s',name:'settlement of the footing at the same pressure',unit:'mm',step:'s1',verb:'scale up',goal:true,eq:'s = s<sub>p</sub>[2B/(B + B<sub>p</sub>)]²',
      how:v=>['In cohesionless soil settlement grows with width, but less than in proportion (Terzaghi and Peck).',`Ratio of footing to plate settlement = [2B/(B + B<sub>p</sub>)]² = <b>${fmt(Math.pow(2*v.B/(v.B+v.Bp),2))}</b>.`,`<b>s = ${fmt(v.s)} mm</b>.`]}) ] });
