// ================= SHARED for the "Which strength?" problems: the profile picture's helpers (loaded before the notes and the problems) =================
// Terzaghi (1943) general-shear factors, the textbook table; the week 1 chart (p22) gives them within reading error. Hansen is in shallow_lib.js.
Table('terzNc',[[0,5.7],[5,7.3],[10,9.6],[15,12.9],[20,17.7],[25,25.1],[30,37.2],[35,57.8],[40,95.7]]);
Table('terzNq',[[0,1],[5,1.6],[10,2.7],[15,4.4],[20,7.4],[25,12.7],[30,22.5],[35,41.4],[40,81.3]]);
Table('terzNg',[[0,0],[5,0.5],[10,1.2],[15,2.5],[20,5],[25,9.7],[30,19.7],[35,42.4],[40,100.4]]);
// a chart look-up that follows the theory switch (1 = Hansen, 0 = Terzaghi): ONE choice drives all three factors, so charts are never mixed
const thLookup=(id,sym,key,ymax,o={})=>{ const tb=v=>(v.theory>0.5?'hansen':'terz')+key;
  return Fn(id,`theory>0.5 ? lookup('hansen${key}', phi) : lookup('terz${key}', phi)`,{sym,name:'bearing capacity factor, read from the chart of the chosen theory',unit:'',verb:'read '+sym,
    chart:v=>({type:'curve', xl:'φ in use (°)', yl:sym, xmin:0, xmax:45, xticks:[0,10,20,30,40], ymin:0, ymax, series:[{lab:(v.theory>0.5?'Hansen ':'Terzaghi ')+sym,pts:TABLES[tb(v)],hi:true}], point:{x:v.phi,y:v[id]}}),
    how:v=>[`Chart of the chosen theory: <b>${v.theory>0.5?'Hansen':'Terzaghi'}</b>. All three factors come from the same chart.`,`Enter at φ = <b>${fmt(v.phi)}°</b> (0 when undrained, φ′ when drained), go up to the ${sym} curve and across.`,`Read <b>${sym} = ${fmt(v[id])}</b>.`],...o}); };

const strengthDepth=v=>Math.max(4,v.z*1.8,v.zw*1.25);
// shear strength available with depth: the same law either way, in total stress (undrained) or effective stress (drained)
const strengthStrip=v=>{ const D=strengthDepth(v), zs=new Set([0,D]); for (let i=1;i<24;i++) zs.add(D*i/24); if (v.zw>0&&v.zw<D) zs.add(v.zw);
  return [...zs].sort((a,b)=>a-b).map(z=>{ const u=Math.max(0,v.gw*(z-v.zw)), sv=v.g*Math.min(z,v.zw)+v.gs*Math.max(0,z-v.zw); return [z, v.cc+(v.und?sv:sv-u)*Math.tan(v.phi*Math.PI/180)]; }); };
const strengthChips=v=>({ color:v.und?'#2b6fd6':'#1b7f5c', title:v.und?'Undrained · total stress':'Drained · effective stress', flag:v.oos?'clay above the water table: out of scope':(v.oor?'φ outside the chart: do not trust N':''),
  lines:[ v.und?`c = c<sub>u</sub> = ${fmt(v.cu)} kPa,   φ = φ<sub>u</sub> = 0`:`c = c′ = ${fmt(v.cp)} kPa,   φ = φ′ = ${fmt(v.php)}°`,
          `γ in use = ${fmt(v.gu)} kN/m³  (${v.und?'γ<sub>sat</sub>, total':(v.sat?'γ′ = γ<sub>sat</sub> − γ<sub>w</sub>':'γ, above the water table')})`,
          `u = ${fmt(v.u)} kPa,   σ′ = ${fmt(v.sp)} kPa  at z = ${fmt(v.z)} m`,
          `${v.theory>0.5?'Hansen':'Terzaghi'}:  N<sub>c</sub> = ${fmt(v.Nc)},  N<sub>q</sub> = ${fmt(v.Nq)},  N<sub>γ</sub> = ${fmt(v.Ng)}` ] });
const strengthScene={ kind:'profile', h:326, z:'z', Dw:'zw', depth:strengthDepth, layer:{kind:v=>v.coh>0.5?'clay':'sand', label:v=>v.coh>0.5?'cohesive layer':'granular layer'}, chips:strengthChips, strip:strengthStrip, stripLabel:'shear strength τ_f (kPa)',
  controls:[ {id:'zw',label:'Water table depth',type:'range',min:0,max:8,step:0.1,unit:'m'}, {id:'z',label:'Point z',type:'range',min:0.2,max:8,step:0.1,unit:'m'}, {id:'fast',label:'Loading',type:'switch',options:[[1,'Fast (short term)'],[0,'Slow (long term)']]}, {id:'coh',label:'Soil',type:'switch',options:[[1,'Cohesive'],[0,'Granular']]}, {id:'theory',label:'Chart',type:'switch',options:[[1,'Hansen'],[0,'Terzaghi']]} ],
  caption:'Two controls with two different jobs: the <b>water table</b> changes u, σ′ and γ vs γ′; only the <b>loading</b> switch (for a cohesive soil) changes drained against undrained.' };

// The three steps of "Which strength?" (read the profile, choose the analysis, take the numbers) as a list of blocks, so a bearing capacity problem can start from them.
// o: {coh, fast, z, zw, cu, cp, php, g, gs};  x.z: a block that replaces the input z (e.g. z = the founding depth);  x.goal:false when the problem has its own goal block.
// Steps used: s1, s2, s3.  Blocks made: sat, oos, u, sv, sp, und, cc, phi, gp, gu, oor, Nc, Nq, Ng, tau.
function strengthCore(o,x={}){ return [
    In('coh',o.coh,'','type','layer type: 1 = cohesive (clay), 0 = granular (sand, gravel)'), In('fast',o.fast,'','loading','loading speed: 1 = fast (short term), 0 = slow (long term)'), In('theory',1,'','theory','chart: 1 = Hansen (as the tutorials), 0 = Terzaghi. One choice for all three factors.'),
    (x.z||In('z',o.z,'m','z','depth of the soil whose strength is needed (the soil at and below the founding level)')), In('zw',o.zw,'m','z<sub>w</sub>','depth of the water table'),
    In('cu',o.cu,'kPa','c<sub>u</sub>','undrained strength (0 if the question gives none)'), In('cp',o.cp,'kPa','c′','effective cohesion'), In('php',o.php,'°','φ′','effective friction angle'),
    In('g',o.g,'kN/m³','γ','unit weight above the water table'), In('gs',o.gs,'kN/m³','γ<sub>sat</sub>','saturated unit weight'), Cn('gw',9.8,'kN/m³','γ<sub>w</sub>','unit weight of water (9.8 as in the official solution)'),
    Gate('sat','zw<=z',{test:'below the water table at z?',yes:'saturated: u &gt; 0',no:'above the water table: u = 0',step:'s1',info:'Only the water table decides this, and it only decides u, σ′ and the unit weight. It never changes c.'}),
    Gate('oos','coh>0.5 && !sat',{test:'cohesive soil above the water table?',yes:'out of scope: clay above the water table is only partly saturated',no:'in scope',step:'s1',warn:true,info:'The rules here are for saturated clay. Clay above the water table is partly saturated: the numbers below would be a guess, so the page flags it instead.'}),
    Fn('u','sat ? gw*(z-zw) : 0',{sym:'u',name:'pore pressure at z',unit:'kPa',step:'s1',verb:'find the pore pressure',eq:'u = γ<sub>w</sub>(z − z<sub>w</sub>)'}),
    Fn('sv','g*min(z,zw) + gs*max(0,z-zw)',{sym:'σ<sub>v</sub>',name:'total vertical stress at z',unit:'kPa',step:'s1',verb:'find the total stress',eq:'σ = γ·z<sub>w</sub> + γ<sub>sat</sub>(z − z<sub>w</sub>)'}),
    Fn('sp','sv - u',{sym:'σ′<sub>v</sub>',name:'effective vertical stress at z',unit:'kPa',step:'s1',verb:'find the effective stress',eq:'σ′ = σ − u'}),
    Gate('und','coh>0.5 && fast>0.5',{test:'cohesive soil loaded fast?',yes:'undrained: total stress, c<sub>u</sub> and φ<sub>u</sub> = 0',no:'drained: effective stress, c′ and φ′',step:'s2',info:'Loading speed against how fast the soil drains decides this. Sand and gravel drain fast, so they are always drained. Clay drains slowly: load it fast and the water cannot leave (undrained); load it very slowly and it can (drained). The water table is not in this decision.'}),
    Fn('cc','und ? cu : cp',{sym:'c',name:'cohesion in use (the c of the equation is replaced by c<sub>u</sub> or c′)',unit:'kPa',step:'s3',verb:'take the cohesion',goal:x.goal!==false,eq:'c = c<sub>u</sub> (undrained)  or  c′ (drained)',branch:v=>`${v.coh>0.5?(v.sat?'clay, saturated':'clay, above the water table'):'sand or gravel'}, ${v.coh>0.5?(v.fast>0.5?'loaded fast':'loaded slowly'):'drains quickly'}, so ${v.und?'undrained: c = c<sub>u</sub>':'drained: c = c′'}`}),
    Fn('phi','und ? 0 : php',{sym:'φ',name:'friction angle in use (φ<sub>u</sub> = 0, or φ′)',unit:'°',step:'s3',verb:'take the friction angle',eq:'φ = φ<sub>u</sub> = 0  or  φ′',branch:v=>v.und?'undrained saturated clay behaves as a φ = 0 material in total stress':'drained: the effective friction angle φ′ governs'}),
    Fn('gp','gs - gw',{sym:'γ′',name:'buoyant unit weight',unit:'kN/m³',step:'s3',verb:'subtract the water',eq:'γ′ = γ<sub>sat</sub> − γ<sub>w</sub>'}),
    Fn('gu','und ? gs : (sat ? gp : g)',{sym:'γ in use',name:'unit weight in use: total γ<sub>sat</sub> (undrained), γ′ below the water table, γ above it',unit:'kN/m³',step:'s3',verb:'take the unit weight',eq:'γ = γ<sub>sat</sub> | γ′ | γ',branch:v=>v.und?'undrained uses the total stress, so the total γ<sub>sat</sub> with no water subtracted':(v.sat?'drained and below the water table: effective stress, so γ′ = γ<sub>sat</sub> − γ<sub>w</sub>':'above the water table: the total unit weight γ')}),
    Gate('oor','phi>40',{test:'φ outside the chart (above 40°)?',yes:'φ is above the 40° end of the chart: the factors are held at the 40° values, not extrapolated',no:'inside the chart',step:'s3',warn:true,info:'The tables stop at 40°. Beyond that a reading would be a guess.'}),
    thLookup('Nc','N<sub>c</sub>','Nc',100,{step:'s3'}), thLookup('Nq','N<sub>q</sub>','Nq',90,{step:'s3'}), thLookup('Ng','N<sub>γ</sub>','Ng',110,{step:'s3'}),
    Fn('tau','cc + (und ? sv : sp)*tan(rad(phi))',{sym:'τ<sub>f</sub>',name:'shear strength available at z',unit:'kPa',step:'s3',verb:'apply the strength law',eq:'τ<sub>f</sub> = c + σ tanφ   (σ′ when drained, σ when undrained)'}) ]; }

// the first three steps of every bearing capacity problem of week 1: read the profile, choose the analysis, take the numbers
const STR_STEPS3=[{id:'s1',title:'Read the profile'},{id:'s2',title:'Choose the analysis'},{id:'s3',title:'Take the numbers'}];
// z = the founding depth D (the soil whose strength matters is the soil at and below the base)
const strengthZ=()=>Fn('z','D',{sym:'z',name:'depth of the soil whose strength is needed: the founding level',unit:'m',step:'s1',verb:'take the founding depth',eq:'z = D<sub>f</sub>'});

// footing shape (the shape fork): strip, square, circular. s_γ multiplies the weight term (strip ½, square 0.4, circular 0.3); s_c the cohesion term (strip 1, others 1.3) (Week 1 slide 25).
const shapeNodes=def=>[ In('shape',def,'','shape','footing shape: 0 = strip, 1 = square, 2 = circular'),
  Fn('sg','shape>1.5 ? 0.3 : (shape>0.5 ? 0.4 : 0.5)',{sym:'s<sub>γ</sub>',name:'shape factor on the weight term (strip ½, square 0.4, circular 0.3)',unit:'',step:'s3',verb:'take the shape factor',eq:'s<sub>γ</sub> = ½ | 0.4 | 0.3'}),
  Fn('sc','shape>0.5 ? 1.3 : 1',{sym:'s<sub>c</sub>',name:'shape factor on the cohesion term (strip 1, square and circular 1.3)',unit:'',step:'s3',verb:'take the shape factor',eq:'s<sub>c</sub> = 1 | 1.3'}) ];

// the gate board of the week 1 bearing problems (kit/ui/board.js): soil, loading, water table twice, theory, shape, and the fixed net rule.
// o: above(v) / below(v) the unit weight above / below the base; aboveModelled (the surcharge uses the weight in use, so a wet soil above the base is handled);
//    fastSkip / shapeSkip: why that gate does not apply to this question.
function strengthBoard(o){ const th=v=>v.theory>0.5?'Hansen':'Terzaghi', shp=v=>v.shape>1.5?'circular':v.shape>0.5?'square':'strip', gm=(a,b)=>fmt(a)===fmt(b)?`γ = ${fmt(a)} above and below`:`γ = ${fmt(a)} above, ${fmt(b)} below`;
  const gates=[
    {n:'1 · Soil',chips:[{t:'Granular',on:v=>v.coh<0.5,set:{coh:0}},{t:'Clay',on:v=>v.coh>0.5,set:{coh:1}}],because:v=>v.coh<0.5?'sand and gravel drain fast, so they are always drained':'clay drains slowly: the loading speed decides (next row)'},
    {n:'2 · Loading',chips:[{t:'Fast: undrained',on:v=>v.fast>0.5,set:{fast:1}},{t:'Slow: drained',on:v=>v.fast<0.5,set:{fast:0}}],skip:v=>v.coh<0.5?'sand always drains, so no choice here':(o.fastSkip||null),
      because:v=>v.fast>0.5?'the load comes on faster than the clay can drain: total stress, c<sub>u</sub> and φ<sub>u</sub> = 0':'the load comes on slowly, the water leaves as it goes: effective stress, c′ and φ′'},
    {n:'3a · Water table, soil above the base',chips:[{t:'Above it: dry',on:v=>v.zw>=v.D,set:v=>({zw:v.D+3*(v.B||1)})},{t:'Below it: wet',on:v=>v.zw<v.D,set:v=>({zw:v.D*0.5})}],
      because:v=>v.zw>=v.D?`the water is below the base: u = 0 and the surcharge γD uses γ = ${fmt(o.above(v))}`:(o.aboveModelled?`the water is above the base: the surcharge uses ${v.und?'the total γ<sub>sat</sub>':'γ′'} = ${fmt(o.above(v))}`:'the water is above the base: this working does not model it (see the warning)')},
    {n:'3b · Water table, soil below the base',chips:[{t:'Above it: γ',on:v=>!v.sat,set:v=>({zw:v.D+3*(v.B||1)})},{t:v=>0,on:v=>v.sat,set:v=>({zw:v.D})}],
      because:v=>v.sat?(v.und?'saturated, undrained: the total γ<sub>sat</sub> acts (u does not change the strength)':'saturated, drained: u &gt; 0 so γ′ = γ<sub>sat</sub> − γ<sub>w</sub> acts'):(v.wpart?`the water is ${fmt(v.zw-v.D)} m below the base, less than B: partly buoyant, interpolated (textbook rule)`:'u = 0: the total unit weight γ acts')},
    {n:'4 · Theory',chips:[{t:'Hansen',on:v=>v.theory>0.5,set:{theory:1}},{t:'Terzaghi',on:v=>v.theory<0.5,set:{theory:0}}],because:v=>`named by the question; the chart is entered at φ = ${fmt(v.phi)}° (0 when undrained, φ′ when drained)`},
    {n:'5 · Footing shape',chips:[{t:'Strip',on:v=>v.shape<0.5,set:{shape:0}},{t:'Square',on:v=>v.shape>0.5&&v.shape<1.5,set:{shape:1}},{t:'Circular',on:v=>v.shape>1.5,set:{shape:2}}],skip:()=>o.shapeSkip||null,
      because:v=>v.shape>1.5?'s<sub>γ</sub> = 0.3 on the weight term, s<sub>c</sub> = 1.3 on the cohesion term':v.shape>0.5?'s<sub>γ</sub> = 0.4 on the weight term, s<sub>c</sub> = 1.3 on the cohesion term':'s<sub>γ</sub> = ½ on the weight term, s<sub>c</sub> = 1'},
    {n:'Rule · Compare',fixed:true,chips:[{t:'net with net',on:()=>true}],because:()=>'q<sub>nf</sub> against q<sub>n</sub>, never gross with net (Week 1, slide 28)'} ];
  gates[3].chips[1].t='Below it: '+'γ′ or γ<sub>sat</sub>';
  return {gates, strip:v=>[ v.und?'undrained':'drained', v.und?`c<sub>u</sub> = ${fmt(v.cu)}, φ<sub>u</sub> = 0`:`c′ = ${fmt(v.cp)}, φ′ = ${fmt(v.php)}°`, gm(o.above(v),o.below(v)), th(v), shp(v), 'net with net' ].join(' · ') }; }
