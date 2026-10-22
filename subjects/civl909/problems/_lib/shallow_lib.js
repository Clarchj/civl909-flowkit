// ================= SHALLOW FOUNDATIONS · shared tables, helpers, builders =================
// Loaded before every problem file (the folder name sorts first). Nothing here is a problem.

// ---- bearing capacity factors vs friction angle φ′ (Hansen / Craig Fig 8.4), as the tutorials read them ----
// N_q and N_c follow the standard Hansen values. N_γ follows the lecture formula N_γ = 1.8(N_q − 1)tanφ (checked independently: 3.5, 41, 95 at 20°, 35°, 40°
// are exactly the chart readings the tutorials use). Every point is the closed form, so in-between angles are consistent too.
Table('hansenNq',[[0,1],[5,1.57],[10,2.47],[15,3.94],[20,6.4],[25,10.7],[30,18.4],[35,33],[40,64]]);
Table('hansenNc',[[0,5.14],[5,6.49],[10,8.34],[15,11],[20,15],[25,20.7],[30,30.1],[35,46.1],[40,75.3]]);
Table('hansenNg',[[0,0],[5,0.1],[10,0.5],[15,1.4],[20,3.5],[25,8.1],[30,18.1],[35,41],[40,95]]);
// ---- SPT overburden factor C_N vs effective stress, as read in the week 2 working (Peck, Hanson, Thornburn chart) ----
Table('phtCN',[[29.1,1.5],[42.7,1.35],[58.2,1.24],[71.7,1.15],[79.4,1.10],[87.1,1.05]]);

// ---- Fadum's influence factor for the vertical stress under the corner of a uniformly loaded rectangle (m = B/z, n = L/z) ----
Helper('fadum',(m,n)=>{ const a=m*m, b=n*n, r=Math.sqrt(a+b+1), t1=(2*m*n*r/(a+b+a*b+1))*((a+b+2)/(a+b+1)); let t2=Math.atan2(2*m*n*r, a+b-a*b+1); if (t2<0) t2+=Math.PI; return (t1+t2)/(4*Math.PI); });
// ---- Schmertmann strain influence factor for a square footing: 0.1 at the base, peak I_zp at z = B/2, zero at z = 2B ----
Helper('izSq',(z,B,Izp)=> z<=B/2 ? 0.1+(Izp-0.1)*z/(B/2) : Math.max(0,Izp*(2*B-z)/(1.5*B)));

// ---- chart specs ----
const phiChart=(id,label,tbl,ymax)=>v=>({type:'curve', xl:'φ′ (°)', yl:label, xmin:0, xmax:45, xticks:[0,10,20,30,40], ymin:0, ymax, series:[{lab:label,pts:TABLES[tbl],hi:true}], point:{x:v.phi,y:v[id]}});
// a chart look-up block: reads a bearing capacity factor from the chart at φ′ (the block with id 'phi' must exist)
const phiLookup=(id,sym,tbl,ymax,o={})=>Fn(id,`lookup('${tbl}', phi)`,{sym,name:'bearing capacity factor, read from the chart',unit:'',verb:'read '+sym,chart:phiChart(id,sym,tbl,ymax),
  how:v=>[`Enter the chart at φ′ = <b>${fmt(v.phi)}°</b> on the horizontal axis.`,`Go up to the ${sym} curve, then across to the vertical axis.`,`Read <b>${sym} = ${fmt(v[id])}</b>, as the course reads it.`],...o});

// ---- the settlement of a clay layer in one expression: re-compression up to p_c, then virgin compression beyond it ----
// (used by week 3 Q5, Q3 and the exam). Needs blocks: Cr, Cc, s0 (σ′0), sf (σ′f), pc (σ′c) and, for settlement, H and e0.
const stressHistoryGate=(step)=>Gate('oc','sf<=pc',{test:'final stress ≤ p<sub>c</sub>?',yes:'still over-consolidated',no:'passes p<sub>c</sub>',step,info:'Below the pre-consolidation pressure the clay re-compresses along the stiff C<sub>r</sub> line; beyond it, it follows the soft virgin C<sub>c</sub> line.'});

// ---- the SPT working of tutorial 2 (Peck, Hanson, Thornburn): corrected N for each test depth ----
// depths: [[z, N60], …]. Gives nodes σ′0 and N1 for every depth, then N̄ (average over the influence depth).
const sptNodes=(depths,stepA,stepB)=>{ const nodes=[], names=[];
  depths.forEach(([z,N],i)=>{ const k=i+1;
    nodes.push(In('z'+k,z,'m','z<sub>'+k+'</sub>','depth of test '+k), In('N'+k,N,'blows','N<sub>60,'+k+'</sub>','measured blow count at depth '+z+' m'));
    nodes.push(Fn('sp'+k,`g*z${k} - max(0,(z${k}-Dw)*gw)`,{sym:'σ′<sub>'+k+'</sub>',name:'effective vertical stress at depth '+z+' m',unit:'kPa',step:stepA,verb:'find σ′',eq:'σ′ = γz − u'}));
    nodes.push(Fn('C'+k,`lookup('phtCN', sp${k})`,{sym:'C<sub>N,'+k+'</sub>',name:'overburden correction, read from the C_N chart',unit:'',step:stepA,verb:'read C<sub>N</sub>',
      chart:v=>({type:'curve', xl:'σ′ (kPa)', yl:'C<sub>N</sub>', xmin:20, xmax:100, ymin:0.8, ymax:1.6, series:[{lab:'C<sub>N</sub>',pts:TABLES.phtCN,hi:true}], point:{x:v['sp'+k],y:v['C'+k]}}),
      how:v=>[`Effective stress here is <b>${fmt(v['sp'+k])} kPa</b>.`,'Enter the C<sub>N</sub> chart at that stress and read across.',`<b>C<sub>N</sub> = ${fmt(v['C'+k])}</b>.`]}));
    nodes.push(Fn('M'+k,`C${k}*N${k}`,{sym:'N<sub>1,'+k+'</sub>',name:'blow count corrected for overburden',unit:'blows',step:stepB,verb:'correct N',eq:'N<sub>1</sub> = C<sub>N</sub>·N<sub>60</sub>'})); names.push('M'+k); });
  return {nodes, avg:`(${names.join('+')})/${names.length}`}; };
