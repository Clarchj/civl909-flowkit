// ================= WEEK 12 · Lateral earth pressure II: Coulomb and retaining walls (tutorial sheet 12) =================
// NO official solution was provided for this sheet. The numbers below are computed here and cross-checked by an independent trial-wedge force
// polygon (agrees to 4 significant figures for the cohesionless cases). Question (ii) (gravity wall check) needs figure dimensions that are not
// legible enough to rebuild, so it is not worked as a problem; see its Library note.
const WK2={ track:'walls', week:12, source:'tutorial' };

// Coulomb coefficient. a = angle of the wall back to the horizontal measured through the WALL (the angle in the formula);
// for a wall back that slopes away from the soil by θ to the vertical, the angle on the soil side is 90° + θ and a = 90° − θ.
const KCOUL='pow(sin(rad(a+phi)),2) / (pow(sin(rad(a)),2) * sin(rad(a-d)) * pow(1+sqrt(sin(rad(phi+d))*sin(rad(phi-beta))/(sin(rad(a-d))*sin(rad(a+beta)))),2))';

Problem({ ...WK2, id:'w12q1', type:'coulomb', title:'W12 (i)', sub:'Coulomb thrust on a 10.7 m wall that slopes away from the soil',
  answer:'No official answer. This build: P<sub>a</sub> ≈ 476 kN/m (resultant, at 19° to the normal of the wall back)',
  text:'The back of a 10.7 m high wall slopes away from the soil it retains at 10° to the vertical. The surface of the cohesionless soil slopes up from the top of the wall at 20°. γ = 17.6 kN/m³, φ′ = 33°, wall friction δ = 19°. Determine the total thrust on the wall using Coulomb\'s theory.',
  steps:[{id:'s1',title:'The wall angle the formula uses'},{id:'s2',title:'Coulomb K_a'},{id:'s3',title:'Thrust'}],
  nodes:[ In('H',10.7,'m','H','vertical height of the wall'), In('g',17.6,'kN/m³','γ','unit weight of the soil'), In('phi',33,'°','φ′','friction angle (c′ = 0)'), In('d',19,'°','δ','wall friction angle'), In('beta',20,'°','β','slope of the retained surface'), In('tilt',10,'°','θ','back of the wall slopes away from the soil, from the vertical',{info:'The tutorial figure (ii) marks 100° between the base and the wall back on the soil side, the same geometry.'}),
    Fn('a','90-tilt',{sym:'α',name:'wall angle in the formula (through the wall)',unit:'°',step:'s1',verb:'subtract',eq:'α = 90° − θ',info:'Checked by a trial-wedge force polygon: a wall that slopes AWAY from the soil carries more soil on its back and the thrust rises from 358 kN/m (vertical wall) to 476 kN/m. Compare your textbook\'s definition of α before using a different convention.'}),
    Fn('Ka',KCOUL,{sym:'K<sub>a</sub>',name:'Coulomb active coefficient',unit:'',step:'s2',verb:'find K<sub>a</sub>',eq:'K<sub>a</sub> = sin²(α+φ′) / { sin²α·sin(α−δ)·[1 + √( sin(φ′+δ)sin(φ′−β) / (sin(α−δ)sin(α+β)) )]² }'}),
    Fn('Pa','0.5*Ka*g*H*H',{sym:'P<sub>a</sub>',name:'total thrust, acting at δ to the normal of the wall back',unit:'kN/m',step:'s3',verb:'find P<sub>a</sub>',goal:true,eq:'P<sub>a</sub> = ½K<sub>a</sub>γH²'}) ] });

Problem({ ...WK2, id:'w12q3', type:'coulomb', title:'W12 (iii)', sub:'Cohesive backfill with wall adhesion: horizontal thrust',
  answer:'No official answer. This build: P<sub>a,h</sub> ≈ 55 kN/m (tension zone not carrying load)',
  text:'A soil has γ = 18 kN/m³, φ′ = 30°, c′ = 5 kPa. It is retained behind a 6 m high vertical wall with a horizontal surface level with the top. With wall adhesion c′<sub>w</sub> = 5 kPa and wall friction δ = 15°, determine the total active horizontal thrust on the back of the wall.',
  steps:[{id:'s1',title:'K_a and K_ac'},{id:'s2',title:'Pressure and tension zone'},{id:'s3',title:'Thrust and its horizontal part'}],
  nodes:[ In('H',6,'m','H','wall height'), In('g',18,'kN/m³','γ','unit weight'), In('phi',30,'°','φ′','friction angle'), In('c',5,'kPa','c′','cohesion of the soil'), In('cw',5,'kPa','c′<sub>w</sub>','adhesion between wall and soil'), In('d',15,'°','δ','wall friction angle'),
    Fn('Ka','pow(cos(rad(phi)),2) / (cos(rad(d)) * pow(1+sqrt(sin(rad(phi+d))*sin(rad(phi))/cos(rad(d))),2))',{sym:'K<sub>a</sub>',name:'Coulomb coefficient (vertical wall, horizontal surface)',unit:'',step:'s1',verb:'find K<sub>a</sub>',eq:'K<sub>a</sub> = cos²φ′ / { cosδ [1 + √( sin(φ′+δ)sinφ′ / cosδ )]² }'}),
    Fn('Kac','2*sqrt(Ka*(1+cw/c))',{sym:'K<sub>ac</sub>',name:'cohesion coefficient',unit:'',step:'s1',verb:'find K<sub>ac</sub>',eq:'K<sub>ac</sub> = 2√(K<sub>a</sub>(1 + c′<sub>w</sub>/c′))',info:'Form used in Craig (the slide prints it garbled). Check it against your lecture notes.'}),
    Fn('z0','Kac*c/(Ka*g)',{sym:'z<sub>0</sub>',name:'depth of the tension zone',unit:'m',step:'s2',verb:'find z<sub>0</sub>',eq:'z<sub>0</sub> = K<sub>ac</sub>c′/(K<sub>a</sub>γ)'}),
    Fn('pb','Ka*g*H - Kac*c',{sym:'p<sub>a</sub>(H)',name:'pressure at the base',unit:'kPa',step:'s2',verb:'find p<sub>a</sub>',eq:'p<sub>a</sub> = K<sub>a</sub>γH − K<sub>ac</sub>c′'}),
    Fn('Pa','0.5*pb*(H-z0)',{sym:'P<sub>a</sub>',name:'thrust, tension zone ignored',unit:'kN/m',step:'s3',verb:'find the area',eq:'P<sub>a</sub> = ½p<sub>a</sub>(H)(H − z<sub>0</sub>)'}),
    Fn('Ph','Pa*cos(rad(d))',{sym:'P<sub>a,h</sub>',name:'horizontal component',unit:'kN/m',step:'s3',verb:'resolve',goal:true,eq:'P<sub>a,h</sub> = P<sub>a</sub>cosδ',info:'P<sub>a</sub> acts at δ to the horizontal on a vertical wall. If the tension zone were allowed to carry suction, the thrust would be ½K<sub>a</sub>γH² − K<sub>ac</sub>c′H = 97.7 − 46.6 = 51.1 kN/m (49 kN/m horizontal). Ignoring suction is the safe choice.'}) ] });
