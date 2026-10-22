// ================= PICTURES for the retaining-wall problems (weeks 11 and 12): the wall in section, drawn from each problem's own numbers =================
// Red = active pressure behind the wall, green = passive pressure in front, the dark arrow = the resultant thrust. Edit an input on the map and the section redraws.
const _kPa=(s,id)=>v=>s+' = '+fmt(v[id])+' kPa';

Scene('w11q1',{kind:'wall', h:300, q:_kPa('surcharge q','q'),
  layers:[{h:'H1',kind:'sand',label:v=>'soil 1 · sand · φ′ '+fmt(v.phi1)+'°'},{h:'H2',kind:'clay',label:v=>'soil 2 · clay · c′ '+fmt(v.c2)+', φ′ '+fmt(v.phi2)+'°'}],
  front:{top:v=>v.H1-v.D1, layers:[{h:'D1',kind:'sand'},{h:'H2',kind:'clay'}]}, Dw:'H1',
  pressure:v=>[[[0,v.paa],[v.H1,v.pab]],[[v.H1,v.pac],[v.H1+v.H2,v.pad]]], passive:v=>[[[v.H1-v.D1,0],[v.H1,v.ppa]],[[v.H1,v.ppb],[v.H1+v.H2,v.ppd]]],
  caption:'Sheet pile wall. Behind it the surcharge acts in every layer; the pressure jumps at the interface because K<sub>a</sub> changes. In front, passive pressure starts at the excavation level and adds the cohesion term 2c′√K<sub>p</sub>.'});

Scene('w11q2',{kind:'wall', h:310,
  layers:[{h:'H1',kind:'clay',label:v=>'clay · c<sub>u</sub> '+fmt(v.cu1)+', φ<sub>u</sub> '+fmt(v.phu)+'°'},{h:'H2',kind:'sand',label:v=>'sand · φ′ '+fmt(v.phs)+'°'},{h:'H3',kind:'clay',label:v=>'clay · c<sub>u</sub> '+fmt(v.cu3)}],
  Dw:0, crack:'z0', crackWet:v=>!!v.wet,
  pressure:v=>[v.wet?[[0,0],[v.z0,v.gw*v.z0]]:null,[[v.z0,0],[v.H1,v.p5]],[[v.H1,v.ps5+v.u5],[v.H1+v.H2,v.ps8+v.u8]],[[v.H1+v.H2,v.p3a],[v.H1+v.H2+v.H3,v.p3b]]].filter(Boolean),
  caption:'Immediately after construction: the clays are undrained (total stress), the sand is drained and carries pore water. Above z<sub>0</sub> the clay is in tension and the crack fills with water. The thrust is the area of the red diagram.'});

Scene('w11q3',{kind:'wall', h:300,
  layers:[{h:'H1',kind:'clay',label:v=>'clay · c′ '+fmt(v.c)+', φ′ '+fmt(v.phc)+'°'},{h:'H2',kind:'sand',label:v=>'sand · φ′ '+fmt(v.phs)+'°'}],
  crack:'z0', crackWet:v=>!!v.wet,
  pressure:v=>[v.wet?[[0,0],[v.z0,v.gw*v.z0]]:null,[[v.z0,0],[v.H1,v.p3u]],[[v.H1,v.p3l],[v.H1+v.H2,v.p8]]].filter(Boolean),
  thrust:{h:'zbar', text:v=>'P = '+fmt(v.P)+' kN/m, '+fmt(v.zbar)+' m above the base'},
  caption:'Clay over sand behind the wall. Over the crack depth the clay carries no pressure (the red diagram starts at z<sub>0</sub>); the clay then acts as a surcharge on the sand. The arrow is the resultant, at the height found from moments of each area.'});

Scene('w11q4',{kind:'wall', h:280,
  layers:[{h:'H',kind:'sand',label:v=>'sand · φ′ '+fmt(v.phi)+'°, γ '+fmt(v.g)}], beta:'beta',
  pressure:v=>[[[0,0],[v.H,2*v.Pa/v.H]]], thrust:{h:v=>v.H/3, text:v=>'P<sub>a</sub> = '+fmt(v.Pa)+' kN/m'},
  caption:'A vertical wall retaining a sloping surface. In Rankine\'s theory the active pressure acts <b>parallel to the slope</b>, and the thrust is a triangle with its resultant at H/3.'});

Scene('w11q5',{kind:'wall', wall:false, h:280, layers:[{h:'Hc',kind:'clay',label:v=>'plastic clay · φ<sub>u</sub> = 0, γ '+fmt(v.g)}], crack:'z0',
  caption:'An unsupported vertical cut. The tension crack reaches only z<sub>0</sub> = 2c<sub>u</sub>/γ, <b>half</b> the depth at which the cut fails (H<sub>c</sub> = 4c<sub>u</sub>/γ): do not equate them.'});

['w11l1a','w11l1b'].forEach(id=>Scene(id,{kind:'wall', h:280,
  layers:[{h:'hd',kind:'sand',label:'sand · dry (γ)'},{h:'hw',kind:'sand',label:'sand · saturated (γ′ and water)'}], Dw:'Dw',
  pressure:v=>{ const pd=v.Ka*v.g*v.hd; return [[[0,0],[v.hd,pd]], v.hw>0?[[v.hd,pd],[v.H,pd+v.Ka*(v.gs-v.gw)*v.hw+v.gw*v.hw]]:null].filter(Boolean); },
  caption:id==='w11l1a'?'The water table is below the wall: dry sand all the way, a single triangle.':'The water table 2 m down: below it the soil carries γ′ and the water adds its own pressure, which is why the thrust rises so much.'}));

Scene('w12q1',{kind:'wall', h:300,
  layers:[{h:'H',kind:'sand',label:v=>'sand · φ′ '+fmt(v.phi)+'°, δ '+fmt(v.d)+'°'}], beta:'beta', tilt:'tilt',
  pressure:v=>[[[0,0],[v.H,2*v.Pa/v.H]]], thrust:{h:v=>v.H/3, text:v=>'P<sub>a</sub> = '+fmt(v.Pa)+' kN/m'},
  caption:'Coulomb: the back of the wall leans away from the soil by θ, the surface rises at β, and the thrust acts at the wall friction angle δ to the wall normal (the diagram here is schematic: its area is the thrust).'});

Scene('w12q3',{kind:'wall', h:290,
  layers:[{h:'H',kind:'clay',label:v=>'c′ '+fmt(v.c)+', φ′ '+fmt(v.phi)+'°, γ '+fmt(v.g)}], crack:'z0',
  pressure:v=>[[[v.z0,0],[v.H,v.pb]]], thrust:{h:v=>(v.H-v.z0)/3, text:v=>'P<sub>a</sub> = '+fmt(v.Pa)+' kN/m'},
  caption:'Cohesive backfill with wall adhesion. Pressure is positive only below z<sub>0</sub>; the thrust is that triangle, and the question asks for its <b>horizontal</b> part (P<sub>a</sub>cosδ).'});
