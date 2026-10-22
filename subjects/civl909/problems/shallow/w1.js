// ================= WEEK 1 · Bearing capacity of shallow foundations (tutorial sheet 1) =================
// Official answers come from "Week 1 Solutions.pdf". Chart readings (N_c, N_q, N_γ) are the ones the solutions use.

// ---- Q1: required width of a strip footing on gravelly sand (solve for B) ----
// Starts from the strength decision (read the profile, choose the analysis, take c, φ, γ and the N factors), then solves the bearing capacity for B.
Problem({ id:'w1q1', track:'shallow', week:1, source:'tutorial', type:'bearing', title:'W1 Q1', sub:'Strip on gravelly sand: the width B for F = 3',
  answer:'Official: B = 1.55 m', check:[{id:'B',exp:1.55,tol:0.02,label:'B',unit:'m',when:{coh:0,theory:1,zw:0.7,shape:0}}],
  text:'A strip footing is to support a dead load of 500 kN/m and an imposed load of 300 kN/m at a depth of 0.7 m in a gravelly sand (c = 0, φ = 40°). Find the width for a factor of safety of 3.0 against shear failure, assuming the water table may rise to foundation level. Unit weight above the water table 17 kN/m³, saturated 20 kN/m³. Use the Hansen chart.',
  steps:[...STR_STEPS3,{id:'s4',title:'Net capacity as a function of B'},{id:'s5',title:'Solve for B'}],
  nodes:[
    In('Dead',500,'kN/m','G','dead load per metre'), In('Imp',300,'kN/m','Q<sub>imp</sub>','imposed load per metre'), In('D',0.7,'m','D<sub>f</sub>','founding depth'), In('F',3,'','F','required factor of safety'),
    ...strengthCore({coh:0,fast:1,zw:0.7,cu:0,cp:0,php:40,g:17,gs:20},{goal:false,z:strengthZ()}), ...shapeNodes(0),
    Fn('Q','Dead+Imp',{sym:'Q',name:'total load per metre',unit:'kN/m',step:'s4',verb:'add the loads',eq:'Q = G + Q<sub>imp</sub>'}),
    Fn('q0','g*D',{sym:'q',name:'overburden pressure at the base, γD (the soil above the base is above the water)',unit:'kPa',step:'s4',verb:'find the surcharge',eq:'q = γD'}),
    Fn('A0','q0*(Nq-1)',{sym:'q<sub>nf,0</sub>',name:'the part of net capacity that does not depend on B',unit:'kPa',step:'s4',verb:'find the constant part',eq:'q<sub>nf,0</sub> = γD(N<sub>q</sub> − 1)'}),
    Fn('C1','sg*gu*Ng',{sym:'k<sub>B</sub>',name:'net capacity gained per metre of width (γ in use: γ′ when the water reaches the base)',unit:'kPa/m',step:'s4',verb:'find the B part',eq:'k<sub>B</sub> = s<sub>γ</sub>γ N<sub>γ</sub>'}),
    Fn('ca','C1/F',{sym:'a',name:'quadratic coefficient (k_B / F)',unit:'',step:'s5',verb:'form a',eq:'a = k<sub>B</sub>/F'}),
    Fn('cb','A0/F + q0',{sym:'b',name:'quadratic coefficient (q_nf,0 / F + q)',unit:'',step:'s5',verb:'form b',eq:'b = q<sub>nf,0</sub>/F + q'}),
    Fn('B','(-cb + sqrt(cb*cb + 4*ca*Q))/(2*ca)',{sym:'B',name:'required footing width',unit:'m',step:'s5',verb:'solve for B',goal:true,eq:'B = [−b + √(b² + 4aQ)] / 2a',
      how:v=>['Net capacity over F must equal the net pressure: (q<sub>nf,0</sub> + k<sub>B</sub>B)/F = Q/B − q.','Multiply by B: aB² + bB − Q = 0 with a = k<sub>B</sub>/F and b = q<sub>nf,0</sub>/F + q.',`Take the positive root: <b>B = ${fmt(v.B)} m</b>.`]}) ] });

// ---- Q2: strip on clay. ONE problem: the loading switch is the only difference between (a) and (b) ----
// (a) loaded instantaneously: undrained, c_u and φ_u = 0, total γ_sat.   (b) loaded very slowly: drained, c′ and φ′, γ′.  The water table is at the surface in both.
// The first three steps are the "Which strength?" decision (strengthCore); the bearing capacity then uses whatever it chose.
Problem({ id:'w1q2', track:'shallow', week:1, source:'tutorial', type:'bearing', title:'W1 Q2', sub:'Strip on clay: loaded instantly (a) or very slowly (b)',
  answer:'Official: (a) instantaneously, F = 4.7;  (b) very slowly, F = 6.6.  Flip the Loading switch to see the other.',
  check:[{id:'F',exp:4.7,tol:0.02,label:'F, (a) instantaneously',when:{coh:1,fast:1,theory:1,shape:0}},{id:'F',exp:6.6,tol:0.02,label:'F, (b) very slowly',when:{coh:1,fast:0,theory:1,shape:0}}],
  text:'A strip footing 3 m wide buried 1.2 m below the surface carries a central vertical load of 150 kN/m of the footing. What is the factor of safety against failure if the load is applied (a) instantaneously, (b) very slowly? The soil is a clay: c<sub>u</sub> = 25 kN/m²; φ<sub>u</sub> = 0; c′ = 10 kN/m², φ′ = 20°; γ<sub>sat</sub> = 19 kN/m³. The water table is at the ground surface. Use Hansen bearing capacity theory for shallow foundation.',
  steps:[{id:'s1',title:'Read the profile'},{id:'s2',title:'Choose the analysis'},{id:'s3',title:'Take the numbers'},{id:'s4',title:'Ultimate and net capacity'},{id:'s5',title:'Net pressure and factor of safety'}],
  nodes:[
    In('B',3,'m','B','footing width'), In('D',1.2,'m','D<sub>f</sub>','founding depth'), In('Q',150,'kN/m','Q','load per metre'),
    ...strengthCore({coh:1,fast:1,zw:0,cu:25,cp:10,php:20,g:19,gs:19},{goal:false,z:Fn('z','D',{sym:'z',name:'depth of the soil whose strength is needed: the founding level',unit:'m',step:'s1',verb:'take the founding depth',eq:'z = D<sub>f</sub>'})}), ...shapeNodes(0),
    Fn('qf','sc*cc*Nc + gu*D*Nq + sg*gu*B*Ng',{sym:'q<sub>f</sub>',name:'ultimate bearing capacity',unit:'kPa',step:'s4',eq:'q<sub>f</sub> = s<sub>c</sub>cN<sub>c</sub> + γDN<sub>q</sub> + s<sub>γ</sub>γBN<sub>γ</sub>   (c and γ as chosen above; strip: s<sub>c</sub> = 1, s<sub>γ</sub> = ½)'}),
    Fn('qnf','qf - gu*D',{sym:'q<sub>nf</sub>',name:'net ultimate bearing capacity',unit:'kPa',step:'s4',verb:'take off the overburden',eq:'q<sub>nf</sub> = q<sub>f</sub> − γD'}),
    Fn('qn','Q/B - gu*D',{sym:'q<sub>n</sub>',name:'net pressure applied',unit:'kPa',step:'s5',verb:'find the net pressure',eq:'q<sub>n</sub> = Q/B − γD'}),
    Fn('F','qnf/qn',{sym:'F',name:'factor of safety',unit:'',step:'s5',verb:'divide',goal:true,eq:'F = q<sub>nf</sub> / q<sub>n</sub>'}) ] });

// ---- Q3: square footing on sand, water table 5 m down (a) or at the base (b) ----
// Strength decision first; the water table then has three zones for the soil under the footing (at the base, within B below it, deeper); then the Terzaghi comparison of part (b).
const w1q3=(id,Dw,expF,part)=>Problem({ id, track:'shallow', week:1, source:'tutorial', type:'bearing', title:'W1 Q3 ('+part+')', sub:'Square footing on sand, water table at '+(Dw>=5?'5 m':'the base'),
  answer:'Official: F = '+expF, check:[{id:'F',exp:expF,tol:0.02,label:'F',when:{coh:0,theory:1,shape:1}}],
  text:'A footing 2.5 × 2.5 m carries a pressure of 400 kN/m² at a depth of 1 m in a sand (saturated 20 kN/m³, 17 kN/m³ above the water table; c = 0, φ = 40°). Find the factor of safety against shear failure (Hansen) with the water table (a) 5 m below ground, (b) 1 m below ground. Then compare with Terzaghi\'s bearing capacity theory (part b of the sheet).',
  steps:[...STR_STEPS3,{id:'s4',title:'Net ultimate capacity (square footing)'},{id:'s5',title:'Factor of safety'},{id:'s6',title:'Compare with Terzaghi'}],
  nodes:[
    In('B',2.5,'m','B','footing side (square)'), In('D',1,'m','D<sub>f</sub>','founding depth'), In('q',400,'kPa','q','contact pressure applied'),
    ...strengthCore({coh:0,fast:1,zw:Dw,cu:0,cp:0,php:40,g:17,gs:20},{goal:false,z:strengthZ()}), ...shapeNodes(1),
    Gate('wpart','zw>D && zw<D+B',{test:'water table within B below the base?',yes:'partly buoyant: interpolate between γ′ and γ',no:'not in the transition zone',step:'s1',info:'The lecture gives only “at the base” and “deeper than 1.5 to 2B”. In between this working uses the textbook interpolation γ̄ = γ′ + (d/B)(γ − γ′), with d the depth of the water table below the base.'}),
    Fn('gB','sat ? gp : (wpart ? gp + (zw-D)/B*(g-gp) : g)',{sym:'γ<sub>B</sub>',name:'unit weight to use in the N<sub>γ</sub> term',unit:'kN/m³',step:'s3',verb:'pick the unit weight',eq:'γ<sub>B</sub> = γ′  |  γ′ + (d/B)(γ − γ′)  |  γ',
      how:v=>v.sat?['The water table is at or above the base: the soil under the footing is submerged.',`γ<sub>B</sub> = γ′ = ${fmt(v.gB)} kN/m³.`]:v.wpart?[`The water table is ${fmt(v.zw-v.D)} m below the base, less than B = ${fmt(v.B)} m: partly buoyant.`,'Textbook interpolation (not on the slide): γ̄ = γ′ + (d/B)(γ − γ′).',`γ<sub>B</sub> = ${fmt(v.gB)} kN/m³.`]:['The water table is at least B below the base: the soil under the footing is dry.',`γ<sub>B</sub> = γ = ${fmt(v.gB)} kN/m³.`]}),
    Fn('qnf','g*D*(Nq-1) + sg*gB*B*Ng',{sym:'q<sub>nf</sub>',name:'net ultimate bearing capacity (c′ = 0)',unit:'kPa',step:'s4',verb:'find q<sub>nf</sub>',eq:'q<sub>nf</sub> = γD(N<sub>q</sub> − 1) + s<sub>γ</sub>γ<sub>B</sub>BN<sub>γ</sub>',
      how:v=>['The surcharge term uses the weight above the base, γ = 17.','The shape factor on the N<sub>γ</sub> term is s<sub>γ</sub> (0.4 for the square footing).',`<b>q<sub>nf</sub> = ${fmt(v.qnf)} kPa</b>.`]}),
    Fn('qn','q - g*D',{sym:'q<sub>n</sub>',name:'net pressure applied',unit:'kPa',step:'s5',verb:'find the net pressure',eq:'q<sub>n</sub> = q − γD'}),
    Fn('F','qnf/qn',{sym:'F',name:'factor of safety',unit:'',step:'s5',verb:'divide',goal:true,eq:'F = q<sub>nf</sub> / q<sub>n</sub>'}),
    // part (b) of the sheet: both theories side by side, whatever the chart switch says (N_c is not needed since c′ = 0)
    phiLookup('NqH','N<sub>q</sub> (H)','hansenNq',70,{step:'s6'}), phiLookup('NgH','N<sub>γ</sub> (H)','hansenNg',100,{step:'s6'}),
    Fn('NqT',"lookup('terzNq', phi)",{sym:'N<sub>q</sub> (T)',name:'Terzaghi bearing capacity factor, read from its chart',unit:'',step:'s6',verb:'read N<sub>q</sub> (Terzaghi)',
      chart:v=>({type:'curve', xl:'φ′ (°)', yl:'N<sub>q</sub>', xmin:0, xmax:45, xticks:[0,10,20,30,40], ymin:0, ymax:90, series:[{lab:'Terzaghi N<sub>q</sub>',pts:TABLES.terzNq,hi:true}], point:{x:v.phi,y:v.NqT}}),
      how:v=>[`Enter Terzaghi's chart at φ′ = <b>${fmt(v.phi)}°</b>.`,`<b>N<sub>q</sub> = ${fmt(v.NqT)}</b> (Hansen: ${fmt(v.NqH)}).`]}),
    Fn('NgT',"lookup('terzNg', phi)",{sym:'N<sub>γ</sub> (T)',name:'Terzaghi bearing capacity factor, read from its chart',unit:'',step:'s6',verb:'read N<sub>γ</sub> (Terzaghi)',
      chart:v=>({type:'curve', xl:'φ′ (°)', yl:'N<sub>γ</sub>', xmin:0, xmax:45, xticks:[0,10,20,30,40], ymin:0, ymax:110, series:[{lab:'Terzaghi N<sub>γ</sub>',pts:TABLES.terzNg,hi:true}], point:{x:v.phi,y:v.NgT}}),
      how:v=>[`Enter Terzaghi's chart at φ′ = <b>${fmt(v.phi)}°</b>.`,`<b>N<sub>γ</sub> = ${fmt(v.NgT)}</b> (Hansen: ${fmt(v.NgH)}).`]}),
    Fn('qnfH','g*D*(NqH-1) + sg*gB*B*NgH',{sym:'q<sub>nf</sub> (H)',name:'net ultimate bearing capacity with Hansen factors',unit:'kPa',step:'s6',verb:'find q<sub>nf</sub> (Hansen)',eq:'q<sub>nf</sub> = γD(N<sub>q</sub> − 1) + 0.4γ<sub>B</sub>BN<sub>γ</sub>'}),
    Fn('qnfT','g*D*(NqT-1) + sg*gB*B*NgT',{sym:'q<sub>nf</sub> (T)',name:'net ultimate bearing capacity with Terzaghi factors',unit:'kPa',step:'s6',verb:'find q<sub>nf</sub> (Terzaghi)',eq:'q<sub>nf</sub> = γD(N<sub>q</sub> − 1) + 0.4γ<sub>B</sub>BN<sub>γ</sub>'}),
    Fn('FH','qnfH/qn',{sym:'F (H)',name:'factor of safety with Hansen factors',unit:'',step:'s6',verb:'divide',eq:'F = q<sub>nf</sub> / q<sub>n</sub>'}),
    Fn('FT','qnfT/qn',{sym:'F (T)',name:'factor of safety with Terzaghi factors',unit:'',step:'s6',verb:'divide',eq:'F = q<sub>nf</sub> / q<sub>n</sub>'}),
    Fn('dF','(FT/FH - 1)*100',{side:true,sym:'ΔF',name:'Terzaghi\'s factor of safety compared with Hansen\'s',unit:'%',step:'s6',verb:'compare',eq:'ΔF = (F<sub>Terzaghi</sub>/F<sub>Hansen</sub> − 1) × 100'}) ] });
w1q3('w1q3a',5,7.0,'a'); w1q3('w1q3b',1,5.3,'b');

// ---- Q4: strip in stiff clay ----
Problem({ id:'w1q4', track:'shallow', week:1, source:'tutorial', type:'bearing', title:'W1 Q4', sub:'Strip in stiff clay, factor of safety',
  answer:'Official: F = 2.8', check:[{id:'F',exp:2.8,tol:0.02,label:'F',when:{coh:1,fast:1,theory:1,shape:0}}],
  text:'A load of 425 kN/m is carried on a strip footing 2 m wide at a depth of 1 m in a stiff clay of saturated unit weight 21 kN/m³, the water table being at ground level. Find the factor of safety against shear failure when c<sub>u</sub> = 105 kN/m² and φ<sub>u</sub> = 0. Use Hansen bearing capacity factors.',
  steps:[...STR_STEPS3,{id:'s4',title:'Ultimate and net bearing capacity'},{id:'s5',title:'Net pressure and factor of safety'}],
  nodes:[
    In('B',2,'m','B','footing width'), In('D',1,'m','D<sub>f</sub>','founding depth'), In('Q',425,'kN/m','Q','load on the strip, per metre'),
    ...strengthCore({coh:1,fast:1,zw:0,cu:105,cp:0,php:0,g:21,gs:21},{goal:false,z:strengthZ()}), ...shapeNodes(0),
    Fn('qf','sc*cc*Nc + gu*D*Nq + sg*gu*B*Ng',{sym:'q<sub>f</sub>',name:'ultimate (gross) bearing capacity',unit:'kPa',step:'s4',eq:'q<sub>f</sub> = s<sub>c</sub>cN<sub>c</sub> + γDN<sub>q</sub> + s<sub>γ</sub>γBN<sub>γ</sub>   (c and γ as chosen above)'}),
    Fn('qnf','qf - gu*D',{sym:'q<sub>nf</sub>',name:'net ultimate bearing capacity',unit:'kPa',step:'s4',verb:'take off the overburden',eq:'q<sub>nf</sub> = q<sub>f</sub> − γD'}),
    Fn('qn','Q/B - gu*D',{sym:'q<sub>n</sub>',name:'net pressure applied by the footing',unit:'kPa',step:'s5',verb:'find the net pressure',eq:'q<sub>n</sub> = Q/B − γD'}),
    Fn('F','qnf/qn',{sym:'F',name:'factor of safety against shear failure',unit:'',step:'s5',verb:'divide',goal:true,eq:'F = q<sub>nf</sub> / q<sub>n</sub>'}) ] });

// ---- Q5: retaining wall base, eccentric and inclined load ----
Problem({ id:'w1q5', track:'shallow', week:1, source:'tutorial', type:'bearing', title:'W1 Q5', sub:'Wall base: eccentric and inclined load',
  answer:'Official: F = 4.0', check:[{id:'F',exp:4.0,tol:0.03,label:'F',when:{coh:0,theory:1,shape:0}}],
  text:'The base of a long retaining wall is 3 m wide and 1 m below the ground surface in front of the wall; the water table is well below the base. The vertical and horizontal components of the base reaction are 282 and 102 kN/m. The eccentricity of the reaction is 0.36 m. c = 0, φ = 35°, γ = 18 kN/m³. Find the factor of safety against shear failure (Hansen factors).',
  steps:[...STR_STEPS3,{id:'s4',title:'Effective width and inclination'},{id:'s5',title:'Ultimate and net capacity'},{id:'s6',title:'Net pressure and factor of safety'}],
  nodes:[
    In('V',282,'kN/m','V','vertical component of the base reaction'), In('Hh',102,'kN/m','H','horizontal component of the base reaction'), In('e',0.36,'m','e','eccentricity of the reaction'),
    In('B',3,'m','B','base width'), In('D',1,'m','D<sub>f</sub>','founding depth'),
    ...strengthCore({coh:0,fast:1,zw:10,cu:0,cp:0,php:35,g:18,gs:18},{goal:false,z:strengthZ()}), ...shapeNodes(0),
    Fn('Bp','B-2*e',{sym:'B′',name:'effective width',unit:'m',step:'s4',verb:'find B′',eq:'B′ = B − 2e'}),
    Fn('iq','1-1.5*Hh/V',{sym:'i<sub>q</sub>',name:'inclination factor on N_q',unit:'',step:'s4',verb:'find i<sub>q</sub>',eq:'i<sub>q</sub> = 1 − 1.5H/V'}),
    Fn('ig','iq*iq',{sym:'i<sub>γ</sub>',name:'inclination factor on N_γ',unit:'',step:'s4',verb:'find i<sub>γ</sub>',eq:'i<sub>γ</sub> = i<sub>q</sub>²'}),
    Fn('qf','g*D*Nq*iq + sg*gu*Bp*Ng*ig',{sym:'q<sub>f</sub>',name:'ultimate bearing capacity',unit:'kPa',step:'s5',eq:'q<sub>f</sub> = γDN<sub>q</sub>i<sub>q</sub> + s<sub>γ</sub>γB′N<sub>γ</sub>i<sub>γ</sub>'}),
    Fn('qnf','qf - g*D',{sym:'q<sub>nf</sub>',name:'net ultimate bearing capacity',unit:'kPa',step:'s5',verb:'take off the overburden',eq:'q<sub>nf</sub> = q<sub>f</sub> − γD'}),
    Fn('qn','V/Bp - g*D',{sym:'q<sub>n</sub>',name:'net pressure applied on the effective width',unit:'kPa',step:'s6',verb:'find the net pressure',eq:'q<sub>n</sub> = V/B′ − γD'}),
    Fn('F','qnf/qn',{sym:'F',name:'factor of safety',unit:'',step:'s6',verb:'divide',goal:true,eq:'F = q<sub>nf</sub> / q<sub>n</sub>'}) ] });
