// ================= WEEK 5 · Settlement III: secondary compression, SPT (Meyerhof), CPT (Schmertmann) (tutorial sheet 5) =================
// Official working: "Week 5 Solution.pdf". Q2 has only a hint in the solution (no numeric answer), so no check is shown for it.

Problem({ id:'w5q1', track:'shallow', week:5, source:'tutorial', type:'secondary', title:'W5 Q1', sub:'Total settlement of organic clay 7 yr after primary consolidation',
  answer:'Official: S ≈ 0.226 m (rounded steps)', check:[{id:'S',exp:0.226,tol:0.03,label:'S',unit:'m',note:'The official working rounds the primary part to 0.17 m and the secondary part to 0.056 m; unrounded this build gives about 0.223 m.'}],
  text:'An embankment is planned on organic clay 5 m thick. Initial void ratio 0.75, compression index 0.6, primary consolidation completes in 1.3 yr. Find the total settlement 7 yr after the completion of primary consolidation. Average effective pressure σ′<sub>0</sub> = 100 kPa, Δσ′ = 25 kPa, secondary compression index C<sub>αε</sub> = 1.6 %.',
  steps:[{id:'s1',title:'Primary consolidation'},{id:'s2',title:'Secondary compression'},{id:'s3',title:'Total'}],
  nodes:[
    In('e0',0.75,'','e<sub>0</sub>','initial void ratio'), In('Cc',0.6,'','C<sub>c</sub>','compression index'), In('H',5,'m','H','thickness of the clay'), In('s0',100,'kPa','σ′<sub>0</sub>','average effective pressure'), In('ds',25,'kPa','Δσ′','pressure increase'),
    In('tp',1.3,'yr','t<sub>p</sub>','time to complete primary consolidation'), In('t',7,'yr','t','time considered (the solution uses 7)'), In('Cae',0.016,'','C<sub>αε</sub>','secondary compression index, strain per log cycle (1.6 %)'),
    Fn('de','Cc*log10((s0+ds)/s0)',{sym:'Δe',name:'change in void ratio, primary',unit:'',step:'s1',verb:'find Δe',eq:'Δe = C<sub>c</sub>log[(σ′<sub>0</sub> + Δσ′)/σ′<sub>0</sub>]'}),
    Fn('ep','de*H/(1+e0)',{sym:'S<sub>p</sub>',name:'primary consolidation settlement',unit:'m',step:'s1',verb:'find S<sub>p</sub>',eq:'S<sub>p</sub> = ΔeH/(1 + e<sub>0</sub>)'}),
    Fn('Hc','H-ep',{sym:'H<sub>c</sub>',name:'layer thickness after primary consolidation',unit:'m',step:'s2',verb:'subtract',eq:'H<sub>c</sub> = H − S<sub>p</sub>'}),
    Fn('ss','Cae*Hc*log10(t/tp)',{sym:'S<sub>s</sub>',name:'secondary compression settlement',unit:'m',step:'s2',verb:'find S<sub>s</sub>',eq:'S<sub>s</sub> = C<sub>αε</sub>H<sub>c</sub>log(t/t<sub>p</sub>)'}),
    Fn('S','ep+ss',{sym:'S',name:'total consolidation settlement',unit:'m',step:'s3',verb:'add',goal:true,eq:'S = S<sub>p</sub> + S<sub>s</sub>'}) ] });

Problem({ id:'w5q2', track:'shallow', week:5, source:'tutorial', type:'spt', title:'W5 Q2', sub:'Allowable pressure from SPT: Meyerhof (1965), 25 mm',
  answer:'No numeric answer in the solution (hint only). This build: q<sub>a</sub> ≈ 203 kPa',
  text:'Same footing and SPT data as tutorial 2 Q1 (3.5 m square at 1.5 m in medium sand, γ = 19.4 kN/m³, water table 3.6 m, N<sub>60</sub> = 7, 9, 12, 12, 17, 20). Estimate the allowable bearing capacity for an immediate settlement limit of 25 mm using Meyerhof (1965). Hint: correct N as in week 2 Q1 and average between z = D and D + 2B; for B > 1.25 m, s<sub>L</sub> = (q<sub>a</sub> × 2.24 / N)·[B/(B + 0.33)]².',
  steps:[{id:'s1',title:'Effective stress and C_N at each test'},{id:'s2',title:'Correct each N and average'},{id:'s3',title:'Solve Meyerhof for q_a'}],
  nodes:(()=>{ const S=sptNodes([[1.5,7],[2.2,9],[3.0,12],[3.8,12],[4.6,17],[5.4,20]],'s1','s2'); return [
    In('B',3.5,'m','B','footing width (square)'), In('D',1.5,'m','D<sub>f</sub>','founding depth'), In('g',19.4,'kN/m³','γ','unit weight of the sand'), In('Dw',3.6,'m','D<sub>w</sub>','depth of the water table'), Cn('gw',9.81,'kN/m³','γ<sub>w</sub>','unit weight of water'), In('sL',25,'mm','s<sub>L</sub>','settlement limit'),
    ...S.nodes,
    Fn('Navg',S.avg,{sym:'N̄<sub>1</sub>',name:'average corrected blow count (all six tests: D to D + 2B = 1.5 to 8.5 m)',unit:'blows',step:'s2',verb:'average',eq:'N̄<sub>1</sub> = mean of N<sub>1</sub>'}),
    Fn('qa','sL*Navg/2.24*pow((B+0.33)/B,2)',{sym:'q<sub>a</sub>',name:'allowable bearing pressure for the settlement limit',unit:'kPa',step:'s3',verb:'solve for q<sub>a</sub>',goal:true,eq:'q<sub>a</sub> = (s<sub>L</sub>N̄/2.24)·[(B + 0.33)/B]²',
      how:v=>['Meyerhof (1965) for B > 1.25 m: s<sub>L</sub> = (q<sub>a</sub>·2.24/N)·[B/(B + 0.33)]².','Turn it around for q<sub>a</sub>.',`<b>q<sub>a</sub> = ${fmt(v.qa)} kPa</b> (no water table correction is applied in the hint).`]}) ]; })() });

// ---- Q3: Schmertmann from the CPT table (Craig Table 8.6) ----
Problem({ id:'w5q3', track:'shallow', week:5, source:'tutorial', type:'cpt', title:'W5 Q3', sub:'Schmertmann settlement from a CPT profile (6 layers)',
  answer:'Official: s ≈ 28 mm', check:[{id:'s',exp:28,tol:0.03,label:'s',unit:'mm'}],
  text:'A footing 2.5 × 2.5 m supports a net foundation pressure of 150 kN/m² at 1.0 m depth in a deep deposit of normally consolidated fine sand, γ = 17 kN/m³. The cone resistance profile is divided into six layers. Estimate the settlement by Schmertmann\'s method (C<sub>2</sub> = 1).',
  steps:[{id:'s1',title:'Peak strain influence and depth correction'},{id:'s2',title:'Each layer: E and I_z·Δz/E'},{id:'s3',title:'Settlement'}],
  nodes:(()=>{ const L=[[0.9,2.3,0.41],[0.5,3.6,0.68],[1.6,5.0,0.50],[0.4,7.5,0.33],[1.2,3.3,0.18],[0.4,9.9,0.04]]; const out=[], terms=[]; let z=0; const mids=[];
    L.forEach(([dz,qc,iz],i)=>{ const k=i+1; mids.push([z+dz/2,iz]); z+=dz;
      out.push(In('dz'+k,dz,'m','Δz<sub>'+k+'</sub>','thickness of layer '+k), In('qc'+k,qc,'MPa','q<sub>c'+k+'</sub>','cone resistance in layer '+k),
        Fn('E'+k,`2.5*qc${k}`,{sym:'E<sub>'+k+'</sub>',name:'modulus of layer '+k,unit:'MPa',step:'s2',verb:'find E',eq:'E = 2.5q<sub>c</sub> (square footing)'}),
        Cn('Iz'+k,iz,'','I<sub>z'+k+'</sub>','strain influence factor at the middle of layer '+k+', read from the I_z diagram',{step:'s2'}),
        Fn('T'+k,`Iz${k}*dz${k}/E${k}`,{sym:'T<sub>'+k+'</sub>',name:'contribution of layer '+k,unit:'m/MPa',step:'s2',verb:'find I<sub>z</sub>Δz/E',eq:'T = I<sub>z</sub>Δz/E'})); terms.push('T'+k); });
    return [ In('B',2.5,'m','B','footing side (square)'), In('D',1,'m','D<sub>f</sub>','founding depth'), In('qn',150,'kPa','q<sub>n</sub>','net foundation pressure'), In('g',17,'kN/m³','γ','unit weight of the sand'), Cn('C2',1,'','C<sub>2</sub>','creep factor (time not given)',{step:'s3'}),
      Fn('svp','g*(D+B/2)',{sym:'σ′<sub>vp</sub>',name:'effective stress at the depth of the peak',unit:'kPa',step:'s1',verb:'find σ′<sub>vp</sub>',eq:'σ′<sub>vp</sub> = γ(D<sub>f</sub> + B/2)'}),
      Fn('Izp','0.5 + 0.1*sqrt(qn/svp)',{info:'Check: the straight-line I_z triangle (0.1 at the base, peak at B/2, zero at 2B) gives 0.32, 0.65, 0.52, 0.34, 0.19, 0.04 at the layer middles, so the book reads layer 1 (0.41) and layer 2 (0.68) a little high. Triangle values would give about 26 mm instead of 28 mm.',sym:'I<sub>zp</sub>',name:'peak strain influence factor',unit:'',step:'s1',verb:'find I<sub>zp</sub>',eq:'I<sub>zp</sub> = 0.5 + 0.1√(q<sub>n</sub>/σ′<sub>vp</sub>)',
        chart:v=>({type:'curve', xl:'I<sub>z</sub>', yl:'depth below the base (m)', xmin:0, xmax:0.8, ymin:0, ymax:5, yrev:true, series:[{lab:'I<sub>z</sub> read at the layer middles',pts:[...mids.map(([d,i])=>[i,d]),[0,5]],hi:true}], point:{x:v.Izp,y:B_half(v)}}),
        how:v=>[`σ′ at the depth of the peak (B/2 below the base) is <b>${fmt(v.svp)} kPa</b>.`,`I<sub>zp</sub> = 0.5 + 0.1√(${fmt(v.qn)}/${fmt(v.svp)}) = <b>${fmt(v.Izp)}</b>.`,'The I<sub>z</sub> triangle rises to this peak at B/2 below the base and falls to zero at 2B. The solution reads I<sub>z</sub> off that diagram at the middle of each layer.']}),
      Fn('C1','1 - 0.5*g*D/qn',{sym:'C<sub>1</sub>',name:'depth correction factor',unit:'',step:'s1',verb:'find C<sub>1</sub>',eq:'C<sub>1</sub> = 1 − 0.5σ′<sub>v0</sub>/q<sub>n</sub>'}),
      ...out,
      Fn('sumT',terms.join('+'),{sym:'ΣT',name:'sum of I_zΔz/E over the layers',unit:'m/MPa',step:'s3',verb:'add up',eq:'ΣT = Σ I<sub>z</sub>Δz/E'}),
      Fn('s','C1*C2*qn*sumT',{sym:'s',name:'Schmertmann settlement',unit:'mm',step:'s3',verb:'find s',goal:true,eq:'s = C<sub>1</sub>C<sub>2</sub>q<sub>n</sub>ΣI<sub>z</sub>Δz/E'}) ]; })() });
function B_half(v){ return v.B/2; }
