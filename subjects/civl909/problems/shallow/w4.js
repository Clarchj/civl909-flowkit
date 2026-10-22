// ================= WEEK 4 · Settlement II: stress at depth and consolidation time (tutorial sheet 4) =================
// Official working: "Week4_Solutions.pdf". Influence factors here are computed from Fadum's closed form (the solution reads 0.193 and 0.120 from the chart).

const fadumChart=(mKey,nKey,iKey)=>v=>({type:'curve', xl:'n = L/z', yl:'I<sub>σ</sub>', xmin:0, xmax:3, ymin:0, ymax:0.25,
  series:[0.5,1,2].map(m=>({lab:'m = '+m, hi:Math.abs(m-v[mKey])<1e-9, pts:Array.from({length:31},(_,i)=>{ const n=0.01+i*0.1; return [n,KH.fadum(m,n)]; })})), point:{x:v[nKey],y:v[iKey]}});

Problem({ id:'w4q1', track:'shallow', week:4, source:'tutorial', type:'stress', title:'W4 Q1', sub:'Vertical stress beside a 6 × 3 m footing, by superposition',
  answer:'Official: σ<sub>z</sub> ≈ 44 kPa', check:[{id:'sz',exp:44,tol:0.02,label:'σ_z',unit:'kPa'}],
  text:'A rectangular foundation 6 × 3 m carries a uniform pressure of 300 kN/m² near the surface. Find the vertical stress at a depth of 3 m below a point A on the centre line, 1.5 m outside a long edge of the foundation, using influence factors.',
  steps:[{id:'s1',title:'Cut the loaded area into rectangles that share corner A'},{id:'s2',title:'Influence factor of each'},{id:'s3',title:'Superpose'}],
  nodes:[
    In('q',300,'kPa','q','uniform pressure'), In('Lf',6,'m','L','footing length'), In('Bf',3,'m','B','footing width'), In('off',1.5,'m','a','distance of A outside the long edge'), In('z',3,'m','z','depth below A'),
    Fn('hl','Lf/2',{sym:'L/2',name:'half the length (A is on the centre line)',unit:'m',step:'s1',verb:'halve'}),
    Fn('x1','off+Bf',{sym:'a + B',name:'far side of the footing from A',unit:'m',step:'s1',verb:'add',eq:'a + B'}),
    Fn('m','hl/z',{sym:'m',name:'ratio for both rectangle pairs',unit:'',step:'s1',verb:'divide',eq:'m = (L/2)/z'}),
    Fn('n1','x1/z',{sym:'n<sub>1</sub>',name:'ratio for the big (loaded) rectangles',unit:'',step:'s1',verb:'divide',eq:'n<sub>1</sub> = (a + B)/z'}),
    Fn('n2','off/z',{sym:'n<sub>2</sub>',name:'ratio for the small (unloaded) rectangles',unit:'',step:'s1',verb:'divide',eq:'n<sub>2</sub> = a/z'}),
    Fn('I1','fadum(m,n1)',{sym:'I<sub>σ1</sub>',name:'influence factor, loaded rectangles',unit:'',step:'s2',verb:'read I<sub>σ</sub>',eq:'I<sub>σ1</sub> = f(m, n<sub>1</sub>)',num:v=>'f('+fmt(v.m)+', '+fmt(v.n1)+')',chart:fadumChart('m','n1','I1'),
      how:v=>[`m = <b>${fmt(v.m)}</b>, n = <b>${fmt(v.n1)}</b>.`,'Enter the influence chart (or Fadum\'s formula) with m and n.',`<b>I<sub>σ</sub> = ${fmt(v.I1)}</b> (the solution reads 0.193).`]}),
    Fn('I2','fadum(m,n2)',{sym:'I<sub>σ2</sub>',name:'influence factor, rectangles to subtract',unit:'',step:'s2',verb:'read I<sub>σ</sub>',eq:'I<sub>σ2</sub> = f(m, n<sub>2</sub>)',num:v=>'f('+fmt(v.m)+', '+fmt(v.n2)+')',chart:fadumChart('m','n2','I2'),
      how:v=>[`m = <b>${fmt(v.m)}</b>, n = <b>${fmt(v.n2)}</b>.`,'Enter the influence chart with m and n.',`<b>I<sub>σ</sub> = ${fmt(v.I2)}</b> (the solution reads 0.120).`]}),
    Fn('sz','2*q*(I1-I2)',{sym:'σ<sub>z</sub>',name:'vertical stress at depth z below A',unit:'kPa',step:'s3',verb:'superpose',goal:true,eq:'σ<sub>z</sub> = 2q(I<sub>σ1</sub> − I<sub>σ2</sub>)',
      how:v=>['A lies outside the footing, so take the big rectangle (A to the far side) twice and subtract the small one (A to the near side) twice: the difference is the footing itself.']}) ] });

// ---- consolidation time by scaling: same clay, same degree of consolidation ⇒ t ∝ H² ----
const timeScaling=(id,sub,text,dl,tl,Hf,expDays,answer)=>Problem({ id, track:'shallow', week:4, source:'tutorial', type:'time', title:'W4 '+id.slice(2).toUpperCase().replace('Q','Q'), sub, answer, check:[{id:'days',exp:expDays,tol:0.02,label:'t',unit:'days'}], text,
  steps:[{id:'s1',title:'Drainage path in the lab and in the field'},{id:'s2',title:'Same clay, same degree: scale by H²'}],
  nodes:[ In('dl',dl,'m','d','thickness of the lab sample'), In('tl',tl,'min','t<sub>lab</sub>','time to reach the degree of consolidation in the lab'), In('Hf',Hf,'m','H','thickness of the field layer'), Cn('nd',2,'','n','drainage faces (double drainage)',{step:'s1',info:'Drainage at top and bottom: the drainage path is half the thickness.'}),
    Fn('Hdl','dl/nd',{sym:'H<sub>dr,lab</sub>',name:'drainage path, lab sample',unit:'m',step:'s1',verb:'halve',eq:'H<sub>dr</sub> = d/n'}), Fn('Hdf','Hf/nd',{sym:'H<sub>dr,field</sub>',name:'drainage path, field layer',unit:'m',step:'s1',verb:'halve',eq:'H<sub>dr</sub> = H/n'}),
    Fn('ratio','Hdf/Hdl',{sym:'H<sub>f</sub>/H<sub>l</sub>',name:'ratio of drainage paths',unit:'',step:'s2',verb:'divide'}),
    Fn('t','tl*ratio*ratio',{sym:'t',name:'time in the field',unit:'min',step:'s2',verb:'scale by H²',eq:'t = t<sub>lab</sub>(H<sub>f</sub>/H<sub>l</sub>)²',how:v=>['c<sub>v</sub> and T<sub>v</sub> are the same for the same clay and the same degree of consolidation, so t = T<sub>v</sub>H²/c<sub>v</sub> scales with H².']}),
    Fn('days','t/1440',{sym:'t',name:'time in the field, in days',unit:'days',step:'s2',verb:'convert to days',goal:true,eq:'days = minutes / 1440'}) ] });
timeScaling('w4q2','Field time from a 2.5 cm lab sample','A 2.5 cm thick clay sample, loaded to 100 kN/m² with drainage top and bottom, reached 50 % of its total settlement in 3 min. Find the time for 50 % of the settlement of a building on a 6 m clay layer that extends from the ground surface and is underlain by sand.',0.025,3,6,120,'Official: t ≈ 120 days');
timeScaling('w4q4','Field time from a 2 cm oedometer sample','An oedometer test on a 2 cm clay sample reached 50 % consolidation after 5 min. After how long would the same degree be reached in the field where the clay is 3.70 m thick? Both have double drainage.',0.02,5,3.7,118,'Official: t ≈ 118 days');

Problem({ id:'w4q3', track:'shallow', week:4, source:'tutorial', type:'time', title:'W4 Q3', sub:'Settlement later on: time measured from mid-loading',
  answer:'Official: 17.14 cm', check:[{id:'S2',exp:17.14,tol:0.01,label:'S',unit:'cm'}],
  text:'The loading period of a new building runs from May 1995 to May 1997. In May 2000 the average measured settlement was 11.43 cm; the ultimate settlement will be about 35.565 cm. Estimate the settlement in May 2005. Assume double drainage.',
  steps:[{id:'s1',title:'Time datum: the middle of the loading period'},{id:'s2',title:'Is U small enough for T_v ∝ U²?'},{id:'s3',title:'Scale by √t'}],
  nodes:[ In('ts',1995,'yr','t<sub>start</sub>','loading starts'), In('te',1997,'yr','t<sub>end</sub>','loading ends'), In('y1',2000,'yr','y<sub>1</sub>','date of the measured settlement'), In('S1',11.43,'cm','S<sub>1</sub>','measured settlement at y<sub>1</sub>'), In('Su',35.565,'cm','S<sub>ult</sub>','ultimate settlement'), In('y2',2005,'yr','y<sub>2</sub>','date to predict'),
    Fn('tm','(ts+te)/2',{sym:'t<sub>0</sub>',name:'time datum: mid-loading',unit:'yr',step:'s1',verb:'average',eq:'t<sub>0</sub> = (t<sub>start</sub> + t<sub>end</sub>)/2',info:'Loading is spread over time; measuring time from the middle of it gives acceptable accuracy.'}),
    Fn('ta','y1-tm',{sym:'t<sub>1</sub>',name:'time since the datum at the measurement',unit:'yr',step:'s1',verb:'subtract',eq:'t<sub>1</sub> = y<sub>1</sub> − t<sub>0</sub>'}), Fn('tb','y2-tm',{sym:'t<sub>2</sub>',name:'time since the datum at the prediction',unit:'yr',step:'s1',verb:'subtract',eq:'t<sub>2</sub> = y<sub>2</sub> − t<sub>0</sub>'}),
    Fn('U1','S1/Su',{sym:'U<sub>1</sub>',name:'degree of consolidation at the measurement',unit:'',step:'s2',verb:'divide',eq:'U<sub>1</sub> = S<sub>1</sub>/S<sub>ult</sub>'}),
    Gate('lt60','U1<0.6',{test:'U < 60 %?',yes:'T<sub>v</sub> = (π/4)U² holds',no:'use the full U–T<sub>v</sub> chart',step:'s2',info:'For U below about 60 % the U–T<sub>v</sub> curve is a parabola, so U is proportional to √t.'}),
    Fn('S2','lt60 ? S1*sqrt(tb/ta) : NaN',{sym:'S<sub>2</sub>',name:'settlement at the later date',unit:'cm',step:'s3',verb:'scale by √t',goal:true,eq:'S<sub>2</sub> = S<sub>1</sub>√(t<sub>2</sub>/t<sub>1</sub>)',how:v=>['T<sub>v</sub> = (π/4)U² and T<sub>v</sub> = c<sub>v</sub>t/H² give U ∝ √t, so S ∝ √t while U stays below 60 %.']}) ] });
