// ================= WEEK 3 · Settlement I: immediate (elastic) and consolidation amount (tutorial sheet 3) =================
// Official working: "Week3 solutions.pdf". Influence factors (μ0, μ1, I_b) are chart/table readings stored only where the solution reads them.

Table('mu0D',[[0.5,0.94]]);                       // Christian & Carrier, depth factor μ0 at D/B = 0.5 (the only reading used)
Table('mu1L2',[[2,0.60],[6,0.85]]);               // μ1 for L/B = 2 at H/B = 2 and 6 (the two readings used)
Table('IbRect',[[1,0.56],[1.67,0.63],[2,0.76]]);  // influence factor I_b vs L/B for a loaded rectangle (the three readings used)

Problem({ id:'w3q1', track:'shallow', week:3, source:'tutorial', type:'elastic', title:'W3 Q1', sub:'Immediate settlement of a 4 × 2 m footing on two clays',
  answer:'Official: s ≈ 5 mm', check:[{id:'s',exp:5.1,tol:0.03,label:'s',unit:'mm'}],
  text:'A foundation 4 × 2 m carrying a uniform pressure of 150 kN/m² is at 1 m depth in a clay layer 5 m thick (E<sub>u</sub> = 40 MN/m²) over a second clay 8 m thick (E<sub>u</sub> = 75 MN/m²). A hard stratum lies below. Find the average immediate settlement.',
  steps:[{id:'s1',title:'Depth factor'},{id:'s2',title:'Upper clay alone (E = 40)'},{id:'s3',title:'Both layers with E = 75'},{id:'s4',title:'Upper layer with E = 75'},{id:'s5',title:'Superpose'}],
  nodes:[
    In('B',2,'m','B','footing width'), In('L',4,'m','L','footing length'), In('D',1,'m','D<sub>f</sub>','founding depth'), In('q',150,'kPa','q','net pressure'),
    In('Eu1',40,'MPa','E<sub>u1</sub>','undrained modulus of the upper clay'), In('Eu2',75,'MPa','E<sub>u2</sub>','undrained modulus of the lower clay'), In('H1',5,'m','H<sub>1</sub>','thickness of the upper clay'), In('H2',8,'m','H<sub>2</sub>','thickness of the lower clay'),
    Fn('DB','D/B',{sym:'D/B',name:'embedment ratio',unit:'',step:'s1',verb:'divide'}),
    Fn('mu0',"lookup('mu0D', DB)",{sym:'μ<sub>0</sub>',name:'depth factor',unit:'',step:'s1',verb:'read μ<sub>0</sub>',how:v=>[`D/B = <b>${fmt(v.DB)}</b>.`,'Enter the depth-factor chart (Christian and Carrier) at D/B and read μ<sub>0</sub>.',`<b>μ<sub>0</sub> = ${fmt(v.mu0)}</b>.`]}),
    Fn('Hf1','H1-D',{sym:'H<sub>a</sub>',name:'upper clay below the footing',unit:'m',step:'s2',verb:'subtract',eq:'H<sub>a</sub> = H<sub>1</sub> − D<sub>f</sub>'}),
    Fn('HB1','Hf1/B',{sym:'H<sub>a</sub>/B',name:'thickness ratio, upper clay',unit:'',step:'s2',verb:'divide'}),
    Fn('mu1a',"lookup('mu1L2', HB1)",{sym:'μ<sub>1a</sub>',name:'influence factor for the upper clay (L/B = 2)',unit:'',step:'s2',verb:'read μ<sub>1</sub>',
      chart:v=>({type:'curve', xl:'H/B', yl:'μ<sub>1</sub> (L/B = 2)', xmin:0, xmax:8, ymin:0, ymax:1, series:[{lab:'L/B = 2',pts:TABLES.mu1L2,hi:true}], point:{x:v.HB1,y:v.mu1a}}),
      how:v=>[`H/B = <b>${fmt(v.HB1)}</b>, L/B = <b>2</b>.`,'Enter the μ<sub>1</sub> chart on the L/B = 2 curve and read across.',`<b>μ<sub>1</sub> = ${fmt(v.mu1a)}</b>.`]}),
    Fn('s1','mu0*mu1a*q*B/Eu1',{sym:'s<sub>1</sub>',name:'settlement, upper clay with E<sub>u1</sub>',unit:'mm',step:'s2',verb:'find s<sub>1</sub>',eq:'s<sub>1</sub> = μ<sub>0</sub>μ<sub>1</sub>qB/E<sub>u1</sub>'}),
    Fn('Hf12','H1+H2-D',{sym:'H<sub>b</sub>',name:'both clays below the footing',unit:'m',step:'s3',verb:'add and subtract',eq:'H<sub>b</sub> = H<sub>1</sub> + H<sub>2</sub> − D<sub>f</sub>'}),
    Fn('HB12','Hf12/B',{sym:'H<sub>b</sub>/B',name:'thickness ratio, both clays',unit:'',step:'s3',verb:'divide'}),
    Fn('mu1b',"lookup('mu1L2', HB12)",{sym:'μ<sub>1b</sub>',name:'influence factor for both clays (L/B = 2)',unit:'',step:'s3',verb:'read μ<sub>1</sub>',
      chart:v=>({type:'curve', xl:'H/B', yl:'μ<sub>1</sub> (L/B = 2)', xmin:0, xmax:8, ymin:0, ymax:1, series:[{lab:'L/B = 2',pts:TABLES.mu1L2,hi:true}], point:{x:v.HB12,y:v.mu1b}}),
      how:v=>[`H/B = <b>${fmt(v.HB12)}</b>, L/B = <b>2</b>.`,'Enter the μ<sub>1</sub> chart on the L/B = 2 curve and read across.',`<b>μ<sub>1</sub> = ${fmt(v.mu1b)}</b>.`]}),
    Fn('s2','mu0*mu1b*q*B/Eu2',{sym:'s<sub>2</sub>',name:'settlement, both clays taken with E<sub>u2</sub>',unit:'mm',step:'s3',verb:'find s<sub>2</sub>',eq:'s<sub>2</sub> = μ<sub>0</sub>μ<sub>1</sub>qB/E<sub>u2</sub>'}),
    Fn('s3','mu0*mu1a*q*B/Eu2',{sym:'s<sub>3</sub>',name:'settlement, upper clay taken with E<sub>u2</sub>',unit:'mm',step:'s4',verb:'find s<sub>3</sub>',eq:'s<sub>3</sub> = μ<sub>0</sub>μ<sub>1</sub>qB/E<sub>u2</sub>'}),
    Fn('s','s1+s2-s3',{sym:'s',name:'average immediate settlement',unit:'mm',step:'s5',verb:'superpose',goal:true,eq:'s = s<sub>1</sub> + s<sub>2</sub> − s<sub>3</sub>',
      how:v=>['Treat the upper clay with its own E, then add the second clay as "both layers with E<sub>u2</sub>", and take away the upper layer once more with E<sub>u2</sub> (superposition).']}) ] });

Problem({ id:'w3q2', track:'shallow', week:3, source:'tutorial', type:'elastic', title:'W3 Q2', sub:'Soil heap: settlement of an L-shaped load from three rectangles',
  answer:'Official: s ≈ 1.28 m', check:[{id:'s',exp:1.28,tol:0.02,label:'s',unit:'m'}],
  text:'A proposed soil heap about 23 m high sits on a thick soft alluvial deposit (E = 15 MPa); the eventual uniform bearing pressure is about 300 kPa. Estimate the immediate settlement under point A at the surface (μ = 0.5). The plan is divided into rectangles with corner A.',
  steps:[{id:'s1',title:'Split the plan into three rectangles'},{id:'s2',title:'Influence factor of each'},{id:'s3',title:'Add them up'}],
  nodes:[
    In('p',300,'kPa','p','uniform bearing pressure of the heap'), In('E',15,'MPa','E','modulus of the alluvium'), In('mu',0.5,'','μ','Poisson ratio'),
    In('B1',50,'m','B<sub>1</sub>','rectangle 1: short side'), In('L1',100,'m','L<sub>1</sub>','rectangle 1: long side'), In('B2',50,'m','B<sub>2</sub>','rectangle 2: short side'), In('L2',50,'m','L<sub>2</sub>','rectangle 2: long side'), In('B3',30,'m','B<sub>3</sub>','rectangle 3: short side'), In('L3',50,'m','L<sub>3</sub>','rectangle 3: long side'),
    Fn('LB1','L1/B1',{sym:'L<sub>1</sub>/B<sub>1</sub>',name:'aspect ratio of rectangle 1',unit:'',step:'s1',verb:'divide'}), Fn('LB2','L2/B2',{sym:'L<sub>2</sub>/B<sub>2</sub>',name:'aspect ratio of rectangle 2',unit:'',step:'s1',verb:'divide'}), Fn('LB3','L3/B3',{sym:'L<sub>3</sub>/B<sub>3</sub>',name:'aspect ratio of rectangle 3',unit:'',step:'s1',verb:'divide'}),
    Fn('Ib1',"lookup('IbRect', LB1)",{sym:'I<sub>b1</sub>',name:'influence factor, rectangle 1',unit:'',step:'s2',verb:'read I<sub>b</sub>',chart:v=>({type:'curve',xl:'L/B',yl:'I<sub>b</sub>',xmin:0.5,xmax:2.5,ymin:0.4,ymax:0.9,series:[{lab:'I<sub>b</sub>',pts:TABLES.IbRect,hi:true}],point:{x:v.LB1,y:v.Ib1}})}),
    Fn('Ib2',"lookup('IbRect', LB2)",{sym:'I<sub>b2</sub>',name:'influence factor, rectangle 2',unit:'',step:'s2',verb:'read I<sub>b</sub>',chart:v=>({type:'curve',xl:'L/B',yl:'I<sub>b</sub>',xmin:0.5,xmax:2.5,ymin:0.4,ymax:0.9,series:[{lab:'I<sub>b</sub>',pts:TABLES.IbRect,hi:true}],point:{x:v.LB2,y:v.Ib2}})}),
    Fn('Ib3',"lookup('IbRect', LB3)",{sym:'I<sub>b3</sub>',name:'influence factor, rectangle 3 (as the solution reads it)',unit:'',step:'s2',verb:'read I<sub>b</sub>',info:'L/B = 1.67 is not in the lecture table (1, 2, 3, …). The official working uses 0.63. Linear interpolation of the lecture table gives 0.69 and the exact corner formula 0.71, which would make the answer 1.31 m instead of 1.28 m (+2.7 %).',chart:v=>({type:'curve',xl:'L/B',yl:'I<sub>b</sub>',xmin:0.5,xmax:2.5,ymin:0.4,ymax:0.9,series:[{lab:'I<sub>b</sub>',pts:TABLES.IbRect,hi:true}],point:{x:v.LB3,y:v.Ib3}})}),
    Fn('s','p/(E*1000)*(1-mu*mu)*(Ib1*B1+Ib2*B2+Ib3*B3)',{sym:'s',name:'immediate settlement under A',unit:'m',step:'s3',verb:'add up',goal:true,eq:'s = (p/E)(1 − μ²)[I<sub>b1</sub>B<sub>1</sub> + I<sub>b2</sub>B<sub>2</sub> + I<sub>b3</sub>B<sub>3</sub>]'}) ] });

// ---- Q3: final void ratio after reloading: over-consolidated, crossing p_c, or normally consolidated ----
const w3q3=(id,part,pc,sf,expE)=>Problem({ id, track:'shallow', week:3, source:'tutorial', type:'voidratio', title:'W3 Q3 ('+part+')', sub:'Final void ratio: σ′0 = 50, p_c = '+pc+', σ′f = '+sf,
  answer:'Official: e<sub>f</sub> = '+expE, check:[{id:'ef',exp:expE,tol:0.01,label:'e_f'}],
  text:'A clay has C<sub>c</sub> = 0.4, C<sub>r</sub> = 0.05. Find the final void ratio when initially σ′ = 50 kPa, e = 1.2, p<sub>c</sub> = '+pc+' kPa and finally σ′ = '+sf+' kPa.',
  steps:[{id:'s1',title:'Where does the final stress sit relative to p_c?'},{id:'s2',title:'Change in void ratio'}],
  nodes:[ In('e0',1.2,'','e<sub>0</sub>','initial void ratio'), In('s0',50,'kPa','σ′<sub>0</sub>','initial effective stress'), In('pc',pc,'kPa','p<sub>c</sub>','pre-consolidation pressure'), In('sf',sf,'kPa','σ′<sub>f</sub>','final effective stress'),
    In('Cc',0.4,'','C<sub>c</sub>','compression index'), In('Cr',0.05,'','C<sub>r</sub>','recompression index'),
    stressHistoryGate('s1'),
    Fn('de','oc ? Cr*log10(sf/s0) : Cr*log10(pc/s0) + Cc*log10(sf/pc)',{sym:'Δe',name:'drop in void ratio',unit:'',step:'s2',verb:'find Δe',eq:'Δe = C<sub>r</sub>log(p<sub>c</sub>/σ′<sub>0</sub>) + C<sub>c</sub>log(σ′<sub>f</sub>/p<sub>c</sub>)',
      how:v=>[v.oc?`σ′<sub>f</sub> does not pass p<sub>c</sub>: the clay only re-compresses, Δe = C<sub>r</sub> log(σ′<sub>f</sub>/σ′<sub>0</sub>).`:`σ′<sub>f</sub> passes p<sub>c</sub>: re-compress up to p<sub>c</sub> with C<sub>r</sub>, then follow the virgin line with C<sub>c</sub> beyond it.`,`<b>Δe = ${fmt(v.de)}</b>.`]}),
    Fn('ef','e0 - de',{sym:'e<sub>f</sub>',name:'final void ratio',unit:'',step:'s2',verb:'subtract',goal:true,eq:'e<sub>f</sub> = e<sub>0</sub> − Δe'}) ] });
w3q3('w3q3a','a',100,90,1.187); w3q3('w3q3b','b',100,190,1.074); w3q3('w3q3c','c',50,90,1.09);

Problem({ id:'w3q4', track:'shallow', week:3, source:'tutorial', type:'consol', title:'W3 Q4', sub:'Normally consolidated clay under a building',
  answer:'Official: S<sub>c</sub> = 0.234 m', check:[{id:'Sc',exp:0.234,tol:0.03,label:'S_c',unit:'m'}],
  text:'A normally consolidated clay 7 m thick lies 12 m below ground. Natural water content 40.5 %, liquid limit 48 %, G<sub>s</sub> = 2.76. The water table is 5 m down; the sand above has γ′ = 11 kN/m³ and 18 kN/m³ above the water table. The average pressure increase at the centre of the clay is 120 kN/m². Estimate the consolidation settlement.',
  steps:[{id:'s1',title:'Void ratio and compression index'},{id:'s2',title:'Stresses at the centre of the clay'},{id:'s3',title:'Consolidation settlement'}],
  nodes:[
    In('w',40.5,'%','w','natural water content'), In('LL',48,'%','w<sub>L</sub>','liquid limit'), In('Gs',2.76,'','G<sub>s</sub>','specific gravity of solids'), In('H',7,'m','H','thickness of the clay'), In('zt',12,'m','z<sub>t</sub>','depth to the top of the clay'),
    In('Dw',5,'m','D<sub>w</sub>','depth of the water table'), In('gs',18,'kN/m³','γ','unit weight of sand above the water table'), In('gps',11,'kN/m³','γ′<sub>sand</sub>','buoyant unit weight of the sand'), Cn('gw',9.81,'kN/m³','γ<sub>w</sub>','unit weight of water'), In('ds',120,'kPa','Δσ′','pressure increase at the centre of the clay'),
    Fn('e0','w/100*Gs',{sym:'e<sub>0</sub>',name:'initial void ratio (saturated clay)',unit:'',step:'s1',verb:'find e<sub>0</sub>',eq:'e<sub>0</sub> = wG<sub>s</sub>'}),
    Fn('Cc','0.009*(LL-10)',{sym:'C<sub>c</sub>',name:'compression index from the liquid limit',unit:'',step:'s1',verb:'find C<sub>c</sub>',eq:'C<sub>c</sub> = 0.009(w<sub>L</sub> − 10)'}),
    Fn('gsatc','(Gs+e0)/(1+e0)*gw',{sym:'γ<sub>sat</sub>',name:'saturated unit weight of the clay',unit:'kN/m³',step:'s2',verb:'find γ<sub>sat</sub>',eq:'γ<sub>sat</sub> = (G<sub>s</sub> + e)γ<sub>w</sub>/(1 + e)'}),
    Fn('gpc','gsatc-gw',{sym:'γ′',name:'buoyant unit weight of the clay',unit:'kN/m³',step:'s2',verb:'subtract',eq:'γ′ = γ<sub>sat</sub> − γ<sub>w</sub>'}),
    Fn('s0','gs*Dw + gps*(zt-Dw) + gpc*H/2',{sym:'σ′<sub>0</sub>',name:'effective stress at the centre of the clay',unit:'kPa',step:'s2',verb:'add the layers',eq:'σ′<sub>0</sub> = γD<sub>w</sub> + γ′<sub>sand</sub>(z<sub>t</sub> − D<sub>w</sub>) + γ′H/2'}),
    Fn('s1','s0+ds',{sym:'σ′<sub>f</sub>',name:'final effective stress at the centre',unit:'kPa',step:'s2',verb:'add',eq:'σ′<sub>f</sub> = σ′<sub>0</sub> + Δσ′'}),
    Fn('Sc','Cc*H/(1+e0)*log10(s1/s0)',{sym:'S<sub>c</sub>',name:'consolidation settlement',unit:'m',step:'s3',verb:'find S<sub>c</sub>',goal:true,eq:'S<sub>c</sub> = C<sub>c</sub>H/(1 + e<sub>0</sub>) · log(σ′<sub>f</sub>/σ′<sub>0</sub>)'}) ] });

Problem({ id:'w3q5', track:'shallow', week:3, source:'tutorial', type:'consol', title:'W3 Q5', sub:'Embankment on over-consolidated clay: past p_c',
  answer:'Official: S<sub>c</sub> = 90.1 mm', check:[{id:'Sc',exp:90.1,tol:0.02,label:'S_c',unit:'mm'}],
  text:'An embankment is built on 3 m of clay over rigid impermeable rock; the water table is 0.5 m below the surface. It applies 75 kPa at mid-depth of the clay. G<sub>s</sub> = 2.6, e<sub>0</sub> = 0.8, OCR = 4, C<sub>c</sub> = 0.21, C<sub>r</sub> = 0.035. Calculate the settlement of the centre by the one-dimensional method with a single layer.',
  steps:[{id:'s1',title:'Unit weights and stresses at mid-depth'},{id:'s2',title:'Stress history'},{id:'s3',title:'Settlement'}],
  nodes:[
    In('Gs',2.6,'','G<sub>s</sub>','specific gravity of solids'), In('e0',0.8,'','e<sub>0</sub>','void ratio at the centre of the layer'), In('OCR',4,'','OCR','over-consolidation ratio'), In('Cc',0.21,'','C<sub>c</sub>','compression index'), In('Cr',0.035,'','C<sub>r</sub>','recompression index'),
    In('H',3,'m','H','thickness of the clay'), In('Dw',0.5,'m','D<sub>w</sub>','depth of the water table'), In('ds',75,'kPa','Δσ','pressure applied by the embankment'), Cn('gw',9.81,'kN/m³','γ<sub>w</sub>','unit weight of water'),
    Fn('gd','Gs*gw/(1+e0)',{sym:'γ<sub>d</sub>',name:'unit weight above the water table (dry)',unit:'kN/m³',step:'s1',verb:'find γ<sub>d</sub>',eq:'γ<sub>d</sub> = G<sub>s</sub>γ<sub>w</sub>/(1 + e)'}),
    Fn('gsat','(Gs+e0)/(1+e0)*gw',{sym:'γ<sub>sat</sub>',name:'saturated unit weight',unit:'kN/m³',step:'s1',verb:'find γ<sub>sat</sub>',eq:'γ<sub>sat</sub> = (G<sub>s</sub> + e)γ<sub>w</sub>/(1 + e)'}),
    Fn('zm','H/2',{sym:'z<sub>m</sub>',name:'depth of the middle of the clay',unit:'m',step:'s1',verb:'halve',eq:'z<sub>m</sub> = H/2'}),
    Fn('sv','gd*Dw + gsat*(zm-Dw)',{sym:'σ<sub>0</sub>',name:'total vertical stress at mid-depth',unit:'kPa',step:'s1',verb:'add the layers',eq:'σ<sub>0</sub> = γ<sub>d</sub>D<sub>w</sub> + γ<sub>sat</sub>(z<sub>m</sub> − D<sub>w</sub>)'}),
    Fn('s0','sv-(zm-Dw)*gw',{sym:'σ′<sub>0</sub>',name:'effective stress at mid-depth',unit:'kPa',step:'s1',verb:'subtract the pore pressure',eq:'σ′<sub>0</sub> = σ<sub>0</sub> − u'}),
    Fn('pc','OCR*s0',{sym:'p<sub>c</sub>',name:'pre-consolidation pressure',unit:'kPa',step:'s2',verb:'multiply',eq:'p<sub>c</sub> = OCR·σ′<sub>0</sub>'}),
    Fn('sf','s0+ds',{sym:'σ′<sub>f</sub>',name:'final effective stress',unit:'kPa',step:'s2',verb:'add',eq:'σ′<sub>f</sub> = σ′<sub>0</sub> + Δσ'}),
    stressHistoryGate('s2'),
    Fn('Sc','1000*H/(1+e0)*(oc ? Cr*log10(sf/s0) : Cr*log10(pc/s0) + Cc*log10(sf/pc))',{sym:'S<sub>c</sub>',name:'consolidation settlement',unit:'mm',step:'s3',verb:'find S<sub>c</sub>',goal:true,eq:'S<sub>c</sub> = H/(1 + e<sub>0</sub>)·[C<sub>r</sub>log(p<sub>c</sub>/σ′<sub>0</sub>) + C<sub>c</sub>log(σ′<sub>f</sub>/p<sub>c</sub>)]'}) ] });
