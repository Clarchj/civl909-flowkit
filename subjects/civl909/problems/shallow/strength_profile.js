// ================= WEEK 1 · Which strength? A TWO-LAYER profile (the handoff's per-layer chips and strength strip) =================
// Two layers of soil, one water table, one loading speed, and a point z where the strength is needed. Each layer gets its own decision: granular → drained; cohesive → fast: undrained, slow: drained.
// The water table moves u, σ′ and the unit weight in every layer, never which parameters a layer uses; the Loading switch flips only the cohesive layers.
// Layer 2 runs down without end. A layer is evaluated for the soil at z when z lies in it; the chips say what each layer uses wherever the water table is.

const profDepth=v=>Math.max(4,v.z*1.8,v.zw*1.25,v.H1*2);
const profSv=(z,v)=>{ const a=Math.min(z,v.H1), b=Math.max(0,z-v.H1), da=Math.min(a,Math.max(0,v.zw)), db=Math.min(b,Math.max(0,v.zw-v.H1)); return v.g1*da+v.gs1*(a-da)+v.g2*db+v.gs2*(b-db); };
const profTau=(z,v,i)=>{ const u=Math.max(0,v.gw*(z-v.zw)), sv=profSv(z,v); return v['cc'+i]+(v['und'+i]?sv:sv-u)*Math.tan(v['phi'+i]*Math.PI/180); };
const profStrip=v=>{ const D=profDepth(v), zs=new Set([0,D]); for (let k=1;k<24;k++) zs.add(D*k/24); if (v.zw>0&&v.zw<D) zs.add(v.zw);
  const pts=[]; [...zs].filter(z=>z<=v.H1).sort((a,b)=>a-b).forEach(z=>pts.push([z,profTau(z,v,1)])); pts.push([v.H1,profTau(v.H1,v,1)],[v.H1+1e-4,profTau(v.H1,v,2)]);
  [...zs].filter(z=>z>v.H1).sort((a,b)=>a-b).forEach(z=>pts.push([z,profTau(z,v,2)])); return pts; };
const profCard=(v,i)=>{ const und=v['und'+i], coh=v['coh'+i]>0.5, top=i===1?0:v.H1, bot=i===1?v.H1:Infinity, here=(i===1)===(v.z<=v.H1), gsat=v['gs'+i], gdry=v['g'+i], gp=gsat-v.gw, wet=v.zw<=top, dry=v.zw>=bot;
  const w=und?`γ = γ<sub>sat</sub> = ${fmt(gsat)} kN/m³ (total stress)`:(wet?`γ′ = ${fmt(gp)} kN/m³ (submerged)`:(dry?`γ = ${fmt(gdry)} kN/m³ (above the water table)`:`γ = ${fmt(gdry)} above ${fmt(v.zw)} m, γ′ = ${fmt(gp)} below`));
  return { color:und?'#2b6fd6':'#1b7f5c', title:`Layer ${i} · ${coh?'cohesive':'granular'} · ${und?'undrained':'drained'}`, flag:v['oos'+i]?'clay above the water table: out of scope':'',
    lines:[ und?`c = c<sub>u</sub> = ${fmt(v['cu'+i])} kPa,   φ = φ<sub>u</sub> = 0`:`c = c′ = ${fmt(v['cp'+i])} kPa,   φ = φ′ = ${fmt(v['php'+i])}°`, w,
      here?`z = ${fmt(v.z)} m is here: u = ${fmt(v.u)}, σ′ = ${fmt(v.sp)} kPa; N<sub>c</sub> ${fmt(v.Nc)}, N<sub>q</sub> ${fmt(v.Nq)}, N<sub>γ</sub> ${fmt(v.Ng)}`:`z = ${fmt(v.z)} m is in the other layer` ] }; };
const profScene={ kind:'profile', h:392, z:'z', Dw:'zw', depth:profDepth,
  layers:[{kind:v=>v.coh1>0.5?'clay':'sand', label:v=>v.coh1>0.5?'layer 1 · cohesive':'layer 1 · granular', bot:'H1'},{kind:v=>v.coh2>0.5?'clay':'sand', label:v=>v.coh2>0.5?'layer 2 · cohesive':'layer 2 · granular'}],
  chips:v=>({cards:[profCard(v,1),profCard(v,2)]}), strip:profStrip, stripLabel:'shear strength τ_f (kPa)',
  controls:[ {id:'fast',label:'Loading',type:'switch',options:[[1,'Fast (short term)'],[0,'Slow (long term)']]}, {id:'zw',label:'Water table depth',type:'range',min:0,max:8,step:0.1,unit:'m'}, {id:'z',label:'Point z',type:'range',min:0.2,max:8,step:0.1,unit:'m'}, {id:'H1',label:'Layer 1 thickness',type:'range',min:0.5,max:5,step:0.1,unit:'m'},
    {id:'coh1',label:'Layer 1 soil',type:'switch',options:[[1,'Cohesive'],[0,'Granular']]}, {id:'coh2',label:'Layer 2 soil',type:'switch',options:[[1,'Cohesive'],[0,'Granular']]}, {id:'theory',label:'Chart',type:'switch',options:[[1,'Hansen'],[0,'Terzaghi']]} ],
  caption:'Each layer decides for itself: granular is always drained, cohesive follows the <b>Loading</b> switch. The <b>water table</b> moves u, σ′ and γ vs γ′ in every layer but never changes which parameters a layer uses. The strength strip jumps at the interface because the two layers use different laws.' };

function profileProblem(id,o){ Problem({ id, track:'shallow', week:1, source:'playground', type:'strength', order:o.order, title:o.title, sub:o.sub, text:o.text, answer:'No official answer: an explorer. Move the water table and the Loading switch and watch what changes.',
  steps:[{id:'s1',title:'Read the profile'},{id:'s2',title:'Choose the analysis, layer by layer'},{id:'s3',title:'Take the numbers'}],
  nodes:[
    In('fast',o.fast,'','loading','loading speed: 1 = fast (short term), 0 = slow (long term)'), In('theory',1,'','theory','chart: 1 = Hansen, 0 = Terzaghi'), In('z',o.z,'m','z','depth of the point where the strength is needed'), In('zw',o.zw,'m','z<sub>w</sub>','depth of the water table'), In('H1',o.H1,'m','H<sub>1</sub>','thickness of layer 1 (layer 2 runs below it)'),
    In('coh1',o.l1.coh,'','type 1','layer 1: 1 = cohesive, 0 = granular'), In('cu1',o.l1.cu,'kPa','c<sub>u1</sub>','layer 1 undrained strength'), In('cp1',o.l1.cp,'kPa','c′<sub>1</sub>','layer 1 effective cohesion'), In('php1',o.l1.ph,'°','φ′<sub>1</sub>','layer 1 effective friction angle'), In('g1',o.l1.g,'kN/m³','γ<sub>1</sub>','layer 1 unit weight above the water table'), In('gs1',o.l1.gs,'kN/m³','γ<sub>sat1</sub>','layer 1 saturated unit weight'),
    In('coh2',o.l2.coh,'','type 2','layer 2: 1 = cohesive, 0 = granular'), In('cu2',o.l2.cu,'kPa','c<sub>u2</sub>','layer 2 undrained strength'), In('cp2',o.l2.cp,'kPa','c′<sub>2</sub>','layer 2 effective cohesion'), In('php2',o.l2.ph,'°','φ′<sub>2</sub>','layer 2 effective friction angle'), In('g2',o.l2.g,'kN/m³','γ<sub>2</sub>','layer 2 unit weight above the water table'), In('gs2',o.l2.gs,'kN/m³','γ<sub>sat2</sub>','layer 2 saturated unit weight'),
    Cn('gw',9.8,'kN/m³','γ<sub>w</sub>','unit weight of water (9.8 as in the official solution)'),
    Gate('in1','z<=H1',{test:'is z in layer 1?',yes:'z is in layer 1',no:'z is in layer 2',step:'s1'}),
    Gate('sat','zw<=z',{test:'below the water table at z?',yes:'saturated: u &gt; 0',no:'above the water table: u = 0',step:'s1',info:'Only the water table decides this, and it only decides u, σ′ and the unit weight. It never changes c.'}),
    Gate('oos1','coh1>0.5 && zw>0',{test:'layer 1 is clay with part of it above the water table?',yes:'layer 1 is clay above the water table: out of scope (partly saturated)',no:'in scope',step:'s1',warn:true,info:'The rules here are for saturated clay.'}),
    Gate('oos2','coh2>0.5 && zw>H1',{test:'layer 2 is clay with part of it above the water table?',yes:'layer 2 is clay above the water table: out of scope (partly saturated)',no:'in scope',step:'s1',warn:true,info:'The rules here are for saturated clay.'}),
    Fn('u','sat ? gw*(z-zw) : 0',{sym:'u',name:'pore pressure at z',unit:'kPa',step:'s1',verb:'find the pore pressure',eq:'u = γ<sub>w</sub>(z − z<sub>w</sub>)'}),
    Fn('sv','g1*min(min(z,H1),zw) + gs1*(min(z,H1)-min(min(z,H1),zw)) + g2*min(max(0,z-H1),max(0,zw-H1)) + gs2*(max(0,z-H1)-min(max(0,z-H1),max(0,zw-H1)))',{sym:'σ<sub>v</sub>',name:'total vertical stress at z (both layers, dry above the water table and saturated below)',unit:'kPa',step:'s1',verb:'find the total stress',eq:'σ = Σ γ·thickness'}),
    Fn('sp','sv - u',{sym:'σ′<sub>v</sub>',name:'effective vertical stress at z',unit:'kPa',step:'s1',verb:'find the effective stress',eq:'σ′ = σ − u'}),
    Gate('und1','coh1>0.5 && fast>0.5',{test:'layer 1 cohesive and loaded fast?',yes:'layer 1 undrained: total stress, c<sub>u</sub>, φ<sub>u</sub> = 0',no:'layer 1 drained: effective stress, c′, φ′',step:'s2',info:'Granular layers are always drained. A cohesive layer follows the loading speed. The water table is not in this decision.'}),
    Gate('und2','coh2>0.5 && fast>0.5',{test:'layer 2 cohesive and loaded fast?',yes:'layer 2 undrained: total stress, c<sub>u</sub>, φ<sub>u</sub> = 0',no:'layer 2 drained: effective stress, c′, φ′',step:'s2',info:'Granular layers are always drained. A cohesive layer follows the loading speed. The water table is not in this decision.'}),
    Gate('und','in1 ? und1 : und2',{test:'is the soil at z analysed undrained?',yes:'the soil at z is undrained',no:'the soil at z is drained',step:'s2',info:'The layer that contains z decides.'}),
    Fn('cc1','und1 ? cu1 : cp1',{sym:'c<sub>1</sub>',name:'cohesion in use in layer 1',unit:'kPa',step:'s3',verb:'take the cohesion (layer 1)',eq:'c = c<sub>u</sub> or c′'}),
    Fn('phi1','und1 ? 0 : php1',{sym:'φ<sub>1</sub>',name:'friction angle in use in layer 1',unit:'°',step:'s3',verb:'take the friction angle (layer 1)',eq:'φ = 0 or φ′'}),
    Fn('cc2','und2 ? cu2 : cp2',{sym:'c<sub>2</sub>',name:'cohesion in use in layer 2',unit:'kPa',step:'s3',verb:'take the cohesion (layer 2)',eq:'c = c<sub>u</sub> or c′'}),
    Fn('phi2','und2 ? 0 : php2',{sym:'φ<sub>2</sub>',name:'friction angle in use in layer 2',unit:'°',step:'s3',verb:'take the friction angle (layer 2)',eq:'φ = 0 or φ′'}),
    Fn('cc','in1 ? cc1 : cc2',{sym:'c',name:'cohesion in use at z',unit:'kPa',step:'s3',verb:'take the layer at z',goal:true,eq:'c of the layer that contains z'}),
    Fn('phi','in1 ? phi1 : phi2',{sym:'φ',name:'friction angle in use at z',unit:'°',step:'s3',verb:'take the layer at z',eq:'φ of the layer that contains z'}),
    Fn('gu','und ? (in1 ? gs1 : gs2) : (sat ? (in1 ? gs1 : gs2) - gw : (in1 ? g1 : g2))',{sym:'γ in use',name:'unit weight in use at z: total γ<sub>sat</sub> (undrained), γ′ below the water table, γ above it',unit:'kN/m³',step:'s3',verb:'take the unit weight',eq:'γ = γ<sub>sat</sub> | γ′ | γ',
      branch:v=>v.und?'undrained uses the total stress, so the total γ<sub>sat</sub> with no water subtracted':(v.sat?'drained and below the water table: effective stress, so γ′ = γ<sub>sat</sub> − γ<sub>w</sub>':'above the water table: the total unit weight γ')}),
    Gate('oor','phi>40',{test:'φ outside the chart (above 40°)?',yes:'φ is above the 40° end of the chart: the factors are held at the 40° values, not extrapolated',no:'inside the chart',step:'s3',warn:true,info:'The tables stop at 40°. Beyond that a reading would be a guess.'}),
    thLookup('Nc','N<sub>c</sub>','Nc',100,{step:'s3'}), thLookup('Nq','N<sub>q</sub>','Nq',90,{step:'s3'}), thLookup('Ng','N<sub>γ</sub>','Ng',110,{step:'s3'}),
    Fn('tau','cc + (und ? sv : sp)*tan(rad(phi))',{sym:'τ<sub>f</sub>',name:'shear strength available at z',unit:'kPa',step:'s3',verb:'apply the strength law',eq:'τ<sub>f</sub> = c + σ tanφ   (σ′ when drained, σ when undrained)'}) ] }); }

profileProblem('w1sp1',{order:20,title:'Two layers · sand over soft clay',sub:'Explorer: each layer decides for itself',fast:1,z:3,zw:1,H1:2,
  l1:{coh:0,cu:0,cp:0,ph:35,g:17,gs:20}, l2:{coh:1,cu:30,cp:5,ph:22,g:18,gs:18},
  text:'An explorer, not a tutorial question. 2 m of sand (φ′ = 35°, γ = 17, γ<sub>sat</sub> = 20) lies on soft clay (c<sub>u</sub> = 30 kPa; c′ = 5 kPa, φ′ = 22°; γ<sub>sat</sub> = 18). The water table is 1 m down. What does each layer use, and what is the strength and the N-factors at 3 m? Then flip the loading speed, and move the water table, and see which of the two changes the answer.'});
profileProblem('w1sp2',{order:21,title:'Two layers · stiff clay over sand',sub:'Explorer: the clay follows the loading, the sand never does',fast:1,z:4,zw:0,H1:3,
  l1:{coh:1,cu:80,cp:8,ph:25,g:20,gs:20}, l2:{coh:0,cu:0,cp:0,ph:38,g:18,gs:20},
  text:'An explorer, not a tutorial question. 3 m of stiff clay (c<sub>u</sub> = 80 kPa; c′ = 8 kPa, φ′ = 25°; γ<sub>sat</sub> = 20) over sand (φ′ = 38°, γ = 18, γ<sub>sat</sub> = 20). The water table is at the surface. Which layer changes when the loading goes from fast to slow, and which does not?'});

// picture, notes, lecture, origin (the explorer has no tutorial page: its origin is the slide that states the rule)
['w1sp1','w1sp2'].forEach(id=>{ Scene(id,profScene);
  Notes(id,{idea:STR_IDEA+' With two layers each one decides for itself: a granular layer is always drained; a cohesive layer follows the loading speed. The water table moves u, σ′ and γ vs γ′ in both layers and never changes which parameters a layer uses.',
    steps:{ s1:'Is z in layer 1 or 2, and is it below the water table? That gives u, σ and σ′ by adding the layers above z. Clay above the water table is flagged (out of scope).', s2:'One decision per layer. The layer that contains z decides the numbers below; the other layer\'s chip shows what it would use.', s3:'c, φ and the unit weight of the layer at z, the N-factors from one chart at that φ, and the shear strength τ<sub>f</sub> = c + σ tanφ (σ′ when drained, σ when undrained). The strip in the Picture shows τ<sub>f</sub> against depth: it kinks at the water table where σ′ stops growing as fast, and jumps at the interface.' },
    traps:STR_TRAPS, assumed:STR_ASSUMED});
  Origin(id,'w1-soilpar',{note:'The rule this explorer shows (week 1, “Choice of soil parameters”). There is no tutorial question for a layered profile.'});
  Lesson(id,[ [null,'w1-soilpar','Granular materials are drained at all stages; saturated cohesive soil is undrained during and immediately after construction (c<sub>u</sub>, φ<sub>u</sub>), and the long-term check uses c′, φ′. Each layer applies this on its own.'],
    ['s1','w1-water','The water table sets u, σ′ and the unit weight in each layer (γ′ below it, γ above it); it does not touch c or φ.'],
    ['s2','w1-soilpar','Loading speed against drainage decides, layer by layer.'],
    ['s3','w1-hansen','The N-factors are read once, for the φ of the layer at z (0 if that layer is undrained).'],
    ['s3','w2-phi0','An undrained cohesive layer is a φ = 0 material: N<sub>c</sub> = 5.14, N<sub>q</sub> = 1, N<sub>γ</sub> = 0.'] ]); });
