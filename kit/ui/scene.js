// ================= KIT · PICTURES: the physical situation, drawn from the problem's own numbers =================
// A problem may carry  scene:{kind, …}  where numbers are either literals or the id of a block (its current value is used, so
// editing an input redraws the picture). Kinds:
//   footing  ground, soil layers, water table, a footing of width B at depth D, load arrow, dimensions
//   stack    a vertical stack of layers with thicknesses, water table, loaded area, drainage arrows, a marked point
//   plan     rectangles in plan (loaded areas, signed for superposition) and a point
//   cpt      cone resistance bars by layer with the strain influence factor beside them
//   spt      blow counts (measured and corrected) against depth with the water table and the influence depth
//   profile  one soil column with a water table, a point at depth z, a card saying what is in use there, and a strength-with-depth strip.
//            The water table can be dragged (c.Dw must be an input id); c.controls are sliders / switches under the picture (sceneControls).
//   wall     a retaining wall in section: retained soil in layers, soil in front, water table, surcharge, slope, leaning wall back, tension crack,
//            the pressure diagram behind (and in front of) the wall and the line of the resultant thrust (see sceneWall)
//   chart    any chart spec:  chart: v => spec
const SCN={clay:'#c9a27a', sand:'#e8d7a5', silt:'#d8c7a8', gravel:'#cdbf9a', rock:'#b8bec6', fill:'#aab2bb', soil:'#d9c9a6'};
const scnDefs='<defs><marker id="sa" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="currentColor"/></marker><marker id="sb" markerWidth="7" markerHeight="7" refX="1" refY="3.5" orient="auto"><path d="M7,0 L0,3.5 L7,7 z" fill="currentColor"/></marker>'+
  '<pattern id="sh" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#c0392b" stroke-width="2" opacity=".55"/></pattern></defs>';
const scT=(x,y,t,o={})=>`<text x="${x}" y="${y}" font-size="${o.fs||10}" text-anchor="${o.a||'middle'}" fill="${o.c||'var(--ink)'}" ${o.b?'font-weight="600"':''} ${o.i?'font-style="italic"':''}>${svgS(t)}</text>`;
const scA=(x1,y1,x2,y2,o={})=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.c||'currentColor'}" stroke-width="${o.w||1.2}" ${o.d?'stroke-dasharray="'+o.d+'"':''} ${o.end===false?'':'marker-end="url(#sa)"'} ${o.both?'marker-start="url(#sb)"':''} style="color:${o.c||'var(--ink)'}"/>`;
const scV=(v,x)=>typeof x==='function'?x(v):typeof x==='string'?v[x]:x;
const scF=(x,d)=>fmt(x);

function sceneSVG(c,v){ if (!c) return ''; if (c.kind==='chart') return `<div class="cbox big0">${chartHTML(c.chart(v))}</div>`;
  const fn={footing:sceneFooting, stack:sceneStack, plan:scenePlan, cpt:sceneCpt, spt:sceneSpt, profile:sceneProfile, wall:sceneWall}[c.kind]; return fn?`<svg viewBox="0 0 340 ${c.h||230}" class="scn" role="img" aria-label="Drawing of the problem">${scnDefs}${fn(c,v)}</svg>`:''; }

function sceneFooting(c,v){ const B=scV(v,c.B), D=scV(v,c.D)||0, Dw=c.Dw!=null?scV(v,c.Dw):null;
  const layers=(c.layers&&c.layers.length)?c.layers:[{kind:c.soil||'sand',label:c.soilLabel||''}]; const bots=layers.map(l=>l.bot==null?null:scV(v,l.bot));
  const maxD=Math.max(D*2.3, B*1.5, Dw!=null&&isFinite(Dw)?Dw*1.2:0, ...bots.filter(x=>x!=null).map(x=>x*1.15), 1.2), Wm=Math.max(B*3.4,3.4), s=Math.min(240/Wm,138/maxD), cx=170, gy=70, bw=Math.max(14,B*s), ft=Math.max(6,Math.min(13,bw*0.1)), fy=gy+D*s;
  let o=`<rect x="20" y="${gy-52}" width="300" height="52" fill="var(--card)"/>`, top=0;
  layers.forEach((l,i)=>{ const bot=bots[i]==null?maxD:bots[i]; o+=`<rect x="20" y="${gy+top*s}" width="300" height="${(bot-top)*s}" fill="${SCN[l.kind||'sand']}" opacity=".8"/>`; if (l.label) o+=scT(314,gy+top*s+11,l.label,{a:'end',fs:9,c:'#5b4a32'}); top=bot; });
  o+=`<line x1="20" y1="${gy}" x2="320" y2="${gy}" stroke="var(--ink)" stroke-width="1.4"/>`;
  if (Dw!=null&&isFinite(Dw)){ const wy=gy+Dw*s; o+=`<line x1="20" y1="${wy}" x2="320" y2="${wy}" stroke="#2f6bea" stroke-width="1.4" stroke-dasharray="5 3"/>${scT(26,wy-3,'▽ water table',{a:'start',fs:9,c:'#2f6bea'})}`; }
  const ex=c.ecc!=null?scV(v,c.ecc)*s:0, lx=cx+ex;
  o+=`<rect x="${cx-bw/2}" y="${fy-ft}" width="${bw}" height="${ft}" fill="#59636e"/>`;
  if (c.plate!=null){ const pw=Math.max(8,scV(v,c.plate)*s); o+=`<rect x="${cx+bw/2+16}" y="${fy-ft}" width="${pw}" height="${ft}" fill="#9aa5b1"/>${scT(cx+bw/2+16+pw/2,fy+12,'plate',{fs:8,c:'var(--mut)'})}`; }
  o+=scA(lx,gy-46,lx,fy-ft-1,{w:2.2,c:'#c0392b'}); o+=scT(lx,gy-50,typeof c.loadText==='function'?c.loadText(v):(c.loadText||''),{c:'#c0392b',b:true,fs:10});
  if (c.H!=null){ const hy=fy-ft/2; o+=scA(lx+bw/2+34,hy,lx+bw/2+2,hy,{w:2,c:'#c0392b'})+scT(lx+bw/2+36,hy-4,'H',{a:'start',c:'#c0392b',fs:9}); }
  o+=scA(cx-bw/2,fy+14,cx+bw/2,fy+14,{both:true,w:1})+scT(cx,fy+25,'B = '+fmt(B)+' m',{fs:10});
  if (D>0) o+=scA(26,gy+1,26,fy,{both:true,w:1})+scT(30,gy+D*s/2+3,'D = '+fmt(D)+' m',{a:'start',fs:10});
  if (c.ecc!=null) o+=`<line x1="${cx}" y1="${fy-ft-6}" x2="${cx}" y2="${fy-ft+ft}" stroke="var(--mut)" stroke-dasharray="2 2"/>`+scT(cx+ex/2,fy-ft-8,'e = '+fmt(scV(v,c.ecc))+' m',{fs:9,c:'var(--mut)'});
  return o; }

function sceneStack(c,v){ const L=c.layers.map(l=>({...l,h:scV(v,l.h)})), total=L.reduce((a,l)=>a+l.h,0)||1, s=Math.min(150/total,48), x0=70, w=180, y0=34; let o='', y=y0;
  L.forEach(l=>{ const hh=l.h*s; o+=`<rect x="${x0}" y="${y}" width="${w}" height="${hh}" fill="${SCN[l.kind||'soil']}" opacity=".85" stroke="var(--ink)" stroke-width=".8"/>`;
    o+=scT(x0+w/2,y+hh/2+3,(l.label||'')+(l.noh?'':' · '+fmt(l.h)+' m'),{fs:10,c:'#3b2f1f',b:true}); if (l.note) o+=scT(x0+w/2,y+hh/2+15,l.note,{fs:8.5,c:'#5b4a32'}); y+=hh; });
  if (c.Dw!=null){ const dw=scV(v,c.Dw); if (isFinite(dw)){ const wy=y0+dw*s; o+=`<line x1="${x0-14}" y1="${wy}" x2="${x0+w+14}" y2="${wy}" stroke="#2f6bea" stroke-width="1.6" stroke-dasharray="5 3"/>${scT(x0+w+16,wy+3,'▽ WT',{a:'start',fs:9,c:'#2f6bea'})}`; } }
  if (c.Dw2!=null){ const dw=scV(v,c.Dw2); const wy=y0+dw*s; o+=`<line x1="${x0-14}" y1="${wy}" x2="${x0+w+14}" y2="${wy}" stroke="#2f6bea" stroke-width="1.2" stroke-dasharray="2 3"/>${scT(x0+w+16,wy+3,'lowered WT',{a:'start',fs:9,c:'#2f6bea'})}`; }
  if (c.load){ const at=scV(v,c.load.at)||0, wm=c.load.w!=null?scV(v,c.load.w):null, lw=Math.min(w-20,Math.max(30,(wm||total*0.3)*s)), ly=y0+at*s; o+=`<rect x="${x0+w/2-lw/2}" y="${ly-6}" width="${lw}" height="6" fill="#59636e"/>`+scA(x0+w/2,ly-36,x0+w/2,ly-7,{w:2.2,c:'#c0392b'})+scT(x0+w/2,ly-40,typeof c.load.text==='function'?c.load.text(v):(c.load.text||''),{c:'#c0392b',b:true,fs:10}); }
  if (c.target){ let yy=y0, hh=0; if (c.target.at!=null){ yy=y0+scV(v,c.target.at)*s-2; hh=4; } else { for(let i=0;i<c.target.layer;i++) yy+=L[i].h*s; hh=L[c.target.layer].h*s; } o+=`<circle cx="${x0+w/2}" cy="${yy+hh/2}" r="4" fill="#c0392b"/>`+scT(x0-6,yy+hh/2+3,c.target.label||'point',{a:'end',fs:9,c:'#c0392b'});
    if (c.drain){ o+=scA(x0+w-22,yy+14,x0+w-22,yy-10,{c:'#2f6bea',w:1.6}); if (c.drain==='double') o+=scA(x0+w-22,yy+hh-14,x0+w-22,yy+hh+10,{c:'#2f6bea',w:1.6}); o+=scT(x0+w-10,yy+hh/2+3,c.drain==='double'?'drains both ways':'drains up',{a:'end',fs:8.5,c:'#2f6bea'}); } }
  y=y0; L.forEach(l=>{ const hh=l.h*s; if (!l.noh) o+=scA(x0+w+44,y,x0+w+44,y+hh,{both:true,w:.9,c:'var(--mut)'})+scT(x0+w+48,y+hh/2+3,fmt(l.h)+' m',{a:'start',fs:9,c:'var(--mut)'}); y+=hh; });
  return o; }

function scenePlan(c,v){ const R=c.rects.map(r=>({...r,x:scV(v,r.x),y:scV(v,r.y),w:scV(v,r.w),h:scV(v,r.h)})), P=c.point?{x:scV(v,c.point.x),y:scV(v,c.point.y)}:null;
  const xs=[...R.flatMap(r=>[r.x,r.x+r.w]),...(P?[P.x]:[])], ys=[...R.flatMap(r=>[r.y,r.y+r.h]),...(P?[P.y]:[])]; const x0=Math.min(...xs), x1=Math.max(...xs), y0=Math.min(...ys), y1=Math.max(...ys);
  const s=Math.min(250/((x1-x0)||1),165/((y1-y0)||1)), ox=45-x0*s, oy=205+y0*s; const X=x=>ox+x*s, Y=y=>oy-y*s; let o='';
  R.forEach(r=>{ const neg=(r.sign||1)<0; o+=`<rect x="${X(r.x)}" y="${Y(r.y+r.h)}" width="${r.w*s}" height="${r.h*s}" fill="${neg?'url(#sh)':'rgba(47,107,234,.22)'}" stroke="${neg?'#c0392b':'#2f6bea'}" stroke-width="1.4" ${neg?'stroke-dasharray="4 3"':''}/>`+scT(X(r.x)+r.w*s/2,Y(r.y)-r.h*s/2+3,r.label||fmt(r.w)+' × '+fmt(r.h)+' m',{fs:9.5,c:neg?'#c0392b':'#1f4fb0',b:true}); });
  if (c.centre!=null){ const cy=scV(v,c.centre); o+=`<line x1="20" y1="${Y(cy)}" x2="325" y2="${Y(cy)}" stroke="var(--mut)" stroke-dasharray="4 3"/>`+scT(322,Y(cy)-3,'centre line',{a:'end',fs:8.5,c:'var(--mut)'}); }
  if (P) o+=`<circle cx="${X(P.x)}" cy="${Y(P.y)}" r="4.5" fill="#c0392b"/>`+scT(X(P.x)-8,Y(P.y)-7,c.point.label||'A',{a:'end',c:'#c0392b',b:true,fs:11});
  if (c.note) o+=scT(170,224,c.note,{fs:8.5,c:'var(--mut)',i:true}); return o; }

function sceneCpt(c,v){ let z=0; const L=c.layers.map(l=>{ const dz=scV(v,l.dz), r={z0:z,dz,qc:scV(v,l.qc),iz:l.iz!=null?scV(v,l.iz):null,zm:l.zm!=null?scV(v,l.zm):z+dz/2}; z+=dz; return r; }); const total=Math.max(z,(c.B?2*scV(v,c.B):z)), s=170/total, y0=30, qmax=Math.max(...L.map(l=>l.qc))*1.15; let o='';
  o+=scT(95,18,'q'+'<sub>c</sub> (MPa)',{fs:9,c:'var(--mut)'})+scT(255,18,'I<sub>z</sub>',{fs:9,c:'var(--mut)'});
  o+=`<line x1="40" y1="${y0}" x2="40" y2="${y0+total*s}" stroke="var(--ink)"/><line x1="40" y1="${y0}" x2="150" y2="${y0}" stroke="var(--ink)"/><line x1="190" y1="${y0}" x2="190" y2="${y0+total*s}" stroke="var(--ink)"/><line x1="190" y1="${y0}" x2="320" y2="${y0}" stroke="var(--ink)"/>`;
  L.forEach(l=>{ o+=`<rect x="41" y="${y0+l.z0*s}" width="${l.qc/qmax*105}" height="${l.dz*s}" fill="rgba(27,138,90,.35)" stroke="#1b8a5a"/>`+scT(44,y0+l.z0*s+Math.min(l.dz*s/2+3,l.dz*s-2),fmt(l.qc),{a:'start',fs:8.5,c:'#0f5c3b'});
    o+=`<line x1="40" y1="${y0+l.z0*s}" x2="320" y2="${y0+l.z0*s}" stroke="var(--rule)" stroke-dasharray="2 3"/>`; });
  o+=`<line x1="40" y1="${y0+z*s}" x2="320" y2="${y0+z*s}" stroke="var(--rule)" stroke-dasharray="2 3"/>`;
  const pts=L.filter(l=>l.iz!=null).map(l=>[190+l.iz/0.8*125,y0+l.zm*s]); if (c.zeroAt!=null) pts.push([190,y0+scV(v,c.zeroAt)*s]); if (pts.length) o+=`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#d62f7d" stroke-width="2"/>`+pts.slice(0,L.length).map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="2.6" fill="#d62f7d"/>`).join('');
  o+=scT(34,y0+4,'0',{a:'end',fs:8.5,c:'var(--mut)'})+scT(34,y0+total*s+3,fmt(total)+' m',{a:'end',fs:8.5,c:'var(--mut)'})+scT(170,226,'depth below the footing base',{fs:8.5,c:'var(--mut)',i:true}); return o; }

function sceneSpt(c,v){ const T=c.tests.map(t=>({z:scV(v,t.z),N:scV(v,t.N),M:t.M!=null?scV(v,t.M):null})), D=scV(v,c.D)||0, B=scV(v,c.B)||0, Dw=c.Dw!=null?scV(v,c.Dw):null; const zmax=Math.max(...T.map(t=>t.z),D+1.5*B,Dw||0)*1.08, s=175/zmax, y0=30, nmax=Math.max(...T.map(t=>Math.max(t.N,t.M||0)))*1.15, X=n=>60+n/nmax*240, Y=z=>y0+z*s; let o='';
  o+=`<rect x="60" y="${Y(D)}" width="240" height="${1.5*B*s}" fill="rgba(47,107,234,.10)" stroke="#2f6bea" stroke-dasharray="3 3"/>`+scT(298,Y(D)+10,'influence depth 1.5B',{a:'end',fs:8.5,c:'#2f6bea'});
  o+=`<line x1="60" y1="${y0}" x2="60" y2="${y0+zmax*s}" stroke="var(--ink)"/><line x1="60" y1="${y0}" x2="300" y2="${y0}" stroke="var(--ink)"/>`+scT(180,18,'N (blows)',{fs:9,c:'var(--mut)'});
  if (D>0) o+=`<line x1="40" y1="${Y(D)}" x2="320" y2="${Y(D)}" stroke="#59636e" stroke-width="3"/>`+scT(36,Y(D)+3,'base',{a:'end',fs:8.5,c:'#59636e'});
  if (Dw!=null&&isFinite(Dw)) o+=`<line x1="40" y1="${Y(Dw)}" x2="320" y2="${Y(Dw)}" stroke="#2f6bea" stroke-width="1.5" stroke-dasharray="5 3"/>`+scT(36,Y(Dw)+3,'WT',{a:'end',fs:8.5,c:'#2f6bea'});
  o+=`<polyline points="${T.map(t=>X(t.N)+','+Y(t.z)).join(' ')}" fill="none" stroke="#2f6bea" stroke-width="1.6"/>`+T.map(t=>`<circle cx="${X(t.N)}" cy="${Y(t.z)}" r="3" fill="#2f6bea"/>`).join('');
  if (T.every(t=>t.M!=null)) o+=`<polyline points="${T.map(t=>X(t.M)+','+Y(t.z)).join(' ')}" fill="none" stroke="#e69500" stroke-width="1.6"/>`+T.map(t=>`<circle cx="${X(t.M)}" cy="${Y(t.z)}" r="3" fill="#e69500"/>`).join('')+scT(300,y0+14,'● corrected N₁',{a:'end',fs:9,c:'#e69500'})+scT(300,y0+26,'● measured N₆₀',{a:'end',fs:9,c:'#2f6bea'});
  T.forEach(t=>{ o+=scT(54,Y(t.z)+3,fmt(t.z),{a:'end',fs:8.5,c:'var(--mut)'}); }); o+=scT(30,y0-6,'z (m)',{fs:8.5,c:'var(--mut)'}); return o; }

// ---- profile: the soil column, the water table (draggable), the point z, what is in use there, and how strength grows with depth ----
//  c: {z, Dw, depth, layer:{kind|v=>kind, label|v=>label}  OR  layers:[{kind,label,bot}, ...] (bot = depth of the bottom, the last one runs to the bottom of the picture),
//      chips:v=>({title,color,lines:[...],flag}) OR chips:v=>({cards:[{title,color,lines,flag}, ...]}) (one card per layer), strip:v=>[[z,tau],...], stripLabel, h}
function sceneProfile(c,v){ const z=scV(v,c.z), zw=scV(v,c.Dw), D=Math.max(1,scV(v,c.depth)||Math.max(4,z*1.8,(isFinite(zw)?zw*1.25:0)));
  const info=c.chips?c.chips(v):{}, cards=info.cards||[info], ch=cd=>24+(cd.lines||[]).length*14, cardsH=cards.reduce((a,cd)=>a+ch(cd)+6,0)-6, X0=26, W=84, TOP=cardsH+34, HH=(c.h||300)-TOP-14, s=HH/D, SX0=196, SX1=330; let o='', cy=4;
  cards.forEach(cd=>{ const hh=ch(cd), col=cd.color||'var(--bd)'; o+=`<rect x="5" y="${cy}" width="330" height="${hh}" rx="8" fill="var(--card)" stroke="${col}" stroke-width="1.5"/><rect x="5" y="${cy}" width="5" height="${hh}" rx="2" fill="${col}"/>`+scT(18,cy+18,cd.title||'',{a:'start',fs:11.5,b:true,c:cd.color||'var(--ink)'});
    (cd.lines||[]).forEach((t,i)=>o+=scT(18,cy+34+i*14,t,{a:'start',fs:10})); if (cd.flag) o+=scT(330,cy+18,cd.flag,{a:'end',fs:9,c:'#c0392b',b:true}); cy+=hh+6; });
  const LY=(c.layers||[c.layer]).map((l,i,arr)=>({kind:typeof l.kind==='function'?l.kind(v):(l.kind||'soil'), label:typeof l.label==='function'?l.label(v):(l.label||''), bot:(l.bot==null||i===arr.length-1)?D:Math.min(D,scV(v,l.bot))}));
  let top=0; LY.forEach((l,i)=>{ o+=`<rect x="${X0}" y="${TOP+top*s}" width="${W}" height="${(l.bot-top)*s}" fill="${SCN[l.kind]||SCN.soil}" opacity=".85" stroke="var(--ink)" stroke-width=".8"/>`+scT(X0+W/2,TOP+(l.bot*s)-6,l.label,{fs:9,c:'#3b2f1f',b:true}); top=l.bot; });
  const step=D>10?5:D>5?2:1; for (let d=0; d<=D+1e-9; d+=step) o+=`<line x1="${X0-3}" y1="${TOP+d*s}" x2="${X0}" y2="${TOP+d*s}" stroke="var(--mut)"/>`+scT(X0-5,TOP+d*s+3,fmt(d),{a:'end',fs:8,c:'var(--mut)'});
  o+=scT(X0-5,TOP-8,'z (m)',{a:'end',fs:8,c:'var(--mut)'});
  const wy=TOP+zw*s, hasW=isFinite(zw)&&zw>=0&&zw<=D;
  if (hasW){ o+=`<rect x="${X0}" y="${wy}" width="${W}" height="${TOP+HH-wy}" fill="rgba(47,107,234,.2)"/>`+`<line x1="${X0-8}" y1="${wy}" x2="${SX1}" y2="${wy}" stroke="#2f6bea" stroke-width="1.5" stroke-dasharray="5 3" opacity=".9"/>`+scT(X0+W+6,wy-4,'▽ water table '+fmt(zw)+' m',{a:'start',fs:9,c:'#2f6bea',b:true});
    if (typeof c.Dw==='string') o+=`<rect class="wtdrag" data-id="${c.Dw}" data-y0="${TOP}" data-s="${s}" data-max="${D}" x="${X0-10}" y="${wy-9}" width="${W+20}" height="18" fill="rgba(47,107,234,.001)" style="cursor:ns-resize"><title>Drag to move the water table</title></rect><path d="M${X0-6},${wy-5} l-5,5 l5,5 z" fill="#2f6bea"/>`; }
  const py=TOP+z*s; o+=`<line x1="${X0+W/2}" y1="${py}" x2="${SX1}" y2="${py}" stroke="#c0392b" stroke-width="1" stroke-dasharray="2 3"/><circle cx="${X0+W/2}" cy="${py}" r="4.5" fill="#c0392b"/>`+scT(X0+W/2+8,py+(py-wy>-12&&py-wy<12?12:3),'z = '+fmt(z)+' m',{a:'start',fs:9,c:'#c0392b',b:true});
  const pts=c.strip?c.strip(v):[]; if (pts.length){ const tm=Math.max(...pts.map(p=>p[1]),1)*1.1;
    o+=`<line x1="${SX0}" y1="${TOP}" x2="${SX0}" y2="${TOP+HH}" stroke="var(--ink)"/><line x1="${SX0}" y1="${TOP+HH}" x2="${SX1}" y2="${TOP+HH}" stroke="var(--ink)"/>`+scT((SX0+SX1)/2,TOP-8,c.stripLabel||'strength with depth',{fs:9,c:'var(--mut)'})+scT(SX1,TOP+HH+11,fmt(tm)+' kPa',{a:'end',fs:8,c:'var(--mut)'})+scT(SX0,TOP+HH+11,'0',{fs:8,c:'var(--mut)'});
    const X=t=>SX0+t/tm*(SX1-SX0), Y=d=>TOP+d*s; o+=`<polyline fill="none" stroke="#1b7f5c" stroke-width="2" points="${pts.map(p=>X(p[1]).toFixed(1)+','+Y(p[0]).toFixed(1)).join(' ')}"/>`;
    let tz=pts[pts.length-1][1]; for (let i=1;i<pts.length;i++) if (pts[i][0]>=z){ const a=pts[i-1],b=pts[i]; tz=a[1]+(b[1]-a[1])*((z-a[0])/((b[0]-a[0])||1)); break; }
    o+=`<circle cx="${X(tz)}" cy="${py}" r="4" fill="#c0392b"/>`+scT(Math.min(X(tz)+6,SX1-2),py-6,'τf = '+fmt(tz)+' kPa',{a:X(tz)>SX1-60?'end':'start',fs:9,c:'#c0392b',b:true}); }
  return o; }

// the controls under a picture: {id (an input), label, type:'range'|'switch', min,max,step,unit | options:[[value,name],...]}
function sceneControls(c,v){ if (!c||!c.controls) return '';
  return `<div class="sctl">${c.controls.filter(k=>k.id in v).map(k=>{ const cur=v[k.id];
    if (k.type==='switch') return `<div class="ctl"><span class="cl">${esc2(k.label)}</span><div class="seg">${k.options.map(([val,name])=>`<button data-ctl="set" data-id="${k.id}" data-val="${val}" class="${+cur===+val?'on':''}">${esc2(name)}</button>`).join('')}</div></div>`;
    return `<label class="ctl"><span class="cl">${esc2(k.label)}</span><input type="range" data-ctl="range" data-id="${k.id}" min="${k.min}" max="${k.max}" step="${k.step||0.1}" value="${cur}"><b class="ctlv" data-for="${k.id}" data-unit="${k.unit||''}">${fmt(cur)}${k.unit?' '+esc2(k.unit):''}</b></label>`; }).join('')}</div>`; }

// ---- wall: a retaining wall in section (kit: nothing about a subject) ----
//  c: {layers:[{h,kind,label}] retained soil from the top down (h: number | id | v=>number), wall:false for an unsupported cut, wallBottom (depth, default the retained depth),
//      front:{top:v=>depth where the soil in front starts, layers:[{h,kind,label}]}, Dw (water table behind the wall, depth), q (surcharge: text or v=>text), beta (slope of the surface, degrees),
//      tilt (the back of the wall leans away from the soil, degrees), crack (depth z0 of a tension crack), crackWet (v=>true when it is full of water),
//      pressure: v=>[ [[z,p],[z,p],…], … ]  one list of points per piece of the diagram behind the wall (kPa),  passive: same for the soil in front,
//      thrust:{h:v=>height of the resultant above the base, text}, label:'text for the diagram', h: picture height}
function sceneWall(c,v){ const L=c.layers.map(l=>({...l,h:scV(v,l.h)})).filter(l=>isFinite(l.h)&&l.h>0), Ht=L.reduce((a,l)=>a+l.h,0), Wd=c.wallBottom!=null?scV(v,c.wallBottom):Ht;
  const beta=c.beta!=null?scV(v,c.beta):0, tilt=c.tilt!=null?scV(v,c.tilt):0, hasWall=c.wall!==false, xw=hasWall?112:150, ww=hasWall?22:0, XR=332, TOP=58+(beta?Math.max(0,Math.tan(beta*Math.PI/180)*(XR-xw-ww)-22):0), HH=c.h||290, s=(HH-TOP-26)/Math.max(Wd,1e-6);
  const y=z=>TOP+z*s, shift=Math.tan(tilt*Math.PI/180)*Wd*s, xb=xw+ww+(tilt?shift:0), xl=z=>xb-shift*(1-z/Wd), y0=y(0), yb=y(Wd); let o='';
  // retained soil, layer by layer (the left edge follows the back of the wall)
  let top=0; L.forEach(l=>{ const bot=top+l.h; o+=`<polygon points="${xl(top)},${y(top)} ${XR},${y(top)} ${XR},${y(bot)} ${xl(bot)},${y(bot)}" fill="${SCN[l.kind||'soil']}" opacity=".85" stroke="var(--ink)" stroke-width=".7"/>`; const lb=typeof l.label==='function'?l.label(v):l.label; if (lb) o+=scT(XR-12,y(top)+11,lb,{a:'end',fs:8.5,c:'#3b2f1f',b:true}); top=bot; });
  if (beta){ const rise=Math.tan(beta*Math.PI/180)*(XR-xl(0)); o+=`<polygon points="${xl(0)},${y0} ${XR},${y0-rise} ${XR},${y0}" fill="${SCN[(L[0]||{}).kind||'soil']}" opacity=".85" stroke="var(--ink)" stroke-width=".7"/>`+scT(XR-30,y0-rise+14,'β = '+fmt(beta)+'°',{a:'end',fs:9,c:'var(--ink)',b:true}); }
  // soil in front of the wall (embedded walls)
  if (c.front){ const zf=scV(v,c.front.top); let t=zf; (c.front.layers||[]).forEach(l=>{ const h=scV(v,l.h); if (!(h>0)) return; o+=`<rect x="8" y="${y(t)}" width="${xw-8}" height="${h*s}" fill="${SCN[l.kind||'soil']}" opacity=".85" stroke="var(--ink)" stroke-width=".7"/>`; t+=h; }); o+=`<line x1="8" y1="${y(zf)}" x2="${xw}" y2="${y(zf)}" stroke="var(--ink)" stroke-width="1.4"/>`+scT(12,y(zf)-4,'excavation level',{a:'start',fs:8.5,c:'var(--mut)'}); }
  // water behind the wall
  const Dw=c.Dw!=null?scV(v,c.Dw):null; if (Dw!=null&&isFinite(Dw)&&Dw>=0&&Dw<Wd){ o+=`<polygon points="${xl(Dw)},${y(Dw)} ${XR},${y(Dw)} ${XR},${yb} ${xl(Wd)},${yb}" fill="rgba(47,107,234,.2)"/><line x1="${xl(Dw)}" y1="${y(Dw)}" x2="${XR}" y2="${y(Dw)}" stroke="#2f6bea" stroke-width="1.5" stroke-dasharray="5 3"/>`+scT(XR-12,y(Dw)-3,'▽ water table '+fmt(Dw)+' m',{a:'end',fs:9,c:'#2f6bea',b:true}); }
  o+=`<line x1="${xl(0)}" y1="${y0}" x2="${beta?XR:XR}" y2="${beta?y0-Math.tan(beta*Math.PI/180)*(XR-xl(0)):y0}" stroke="var(--ink)" stroke-width="1.4"/>`;
  // the wall
  if (hasWall) o+=`<polygon points="${xb-ww-shift-4},${y0} ${xb-shift},${y0} ${xb},${yb} ${xb-ww-shift-4},${yb}" fill="#7b858f" stroke="var(--ink)" stroke-width="1"/>`+scT(xb-ww/2-shift/2-2,(y0+yb)/2,'wall',{fs:9,c:'#fff',b:true});
  else o+=`<line x1="${xb}" y1="${y0}" x2="${xb}" y2="${yb}" stroke="var(--ink)" stroke-width="1.6"/>`;
  // surcharge
  if (c.q){ const qt=typeof c.q==='function'?c.q(v):c.q; for (let x=xl(0)+14; x<XR-10; x+=30) o+=scA(x,y0-28,x,y0-3,{w:1.8,c:'#c0392b'}); o+=`<line x1="${xl(0)}" y1="${y0-30}" x2="${XR-6}" y2="${y0-30}" stroke="#c0392b" stroke-width="2"/>`+scT((xl(0)+XR)/2,y0-35,qt,{fs:10,c:'#c0392b',b:true}); }
  // tension crack
  if (c.crack!=null){ const z0=scV(v,c.crack); if (z0>0){ const wet=c.crackWet&&c.crackWet(v); o+=`<rect x="${xl(0)}" y="${y0}" width="16" height="${z0*s}" fill="${wet?'rgba(47,107,234,.4)':'rgba(255,255,255,.55)'}" stroke="#c0392b" stroke-dasharray="3 2"/>`+scT(xl(0)+20,y(Math.min(z0,Wd))-3,'tension crack z₀ = '+fmt(z0)+' m'+(wet?' (water)':''),{a:'start',fs:8.5,c:'#c0392b',b:true}); } }
  // pressure diagrams: behind the wall (red, to the right) and in front (green, to the left)
  const act=c.pressure?c.pressure(v):[], pas=c.passive?c.passive(v):[], pmax=Math.max(1,...act.flat().map(p=>p[1]),...pas.flat().map(p=>p[1])), ps=Math.min(0.9,70/pmax);
  act.forEach(pts=>{ pts=pts.filter(p=>isFinite(p[0])&&isFinite(p[1])); if (pts.length<2) return; const f=pts[0], l=pts[pts.length-1];
    o+=`<polygon points="${pts.map(p=>(xl(p[0])+Math.max(0,p[1])*ps).toFixed(1)+','+y(p[0]).toFixed(1)).join(' ')} ${xl(l[0])},${y(l[0])} ${xl(f[0])},${y(f[0])}" fill="rgba(192,57,43,.28)" stroke="#c0392b" stroke-width="1.2"/>`; });
  const lastA=act.length?act[act.length-1]:null; if (lastA&&lastA.length>1){ const e=lastA[lastA.length-1]; o+=scT(xl(e[0])+Math.max(0,e[1])*ps+4,y(e[0])-3,fmt(e[1])+' kPa',{a:'start',fs:8.5,c:'#c0392b',b:true}); }
  pas.forEach(pts=>{ pts=pts.filter(p=>isFinite(p[0])&&isFinite(p[1])); if (pts.length<2) return; const f=pts[0], l=pts[pts.length-1];
    o+=`<polygon points="${pts.map(p=>(xw-Math.max(0,p[1])*ps).toFixed(1)+','+y(p[0]).toFixed(1)).join(' ')} ${xw},${y(l[0])} ${xw},${y(f[0])}" fill="rgba(27,127,92,.28)" stroke="#1b7f5c" stroke-width="1.2"/>`; });
  const lastP=pas.length?pas[pas.length-1]:null; if (lastP&&lastP.length>1){ const e=lastP[lastP.length-1]; o+=scT(Math.max(10,xw-Math.max(0,e[1])*ps-4),y(e[0])-3,fmt(e[1])+' kPa',{a:'end',fs:8.5,c:'#1b7f5c',b:true}); }
  if (act.length) o+=scT(xl(Wd)+8,yb+14,'active pressure on the back',{a:'start',fs:8.5,c:'#c0392b'}); if (pas.length) o+=scT(xw-4,yb+14,'passive in front',{a:'end',fs:8.5,c:'#1b7f5c'});
  // the resultant thrust
  if (c.thrust){ const h=scV(v,c.thrust.h); if (isFinite(h)){ const ty=y(Wd-h), tx=xl(Wd-h); o+=scA(tx+Math.max(54,70*ps),ty,tx+2,ty,{w:2.6,c:'#7a1f14'})+scT(XR-10,ty-11,typeof c.thrust.text==='function'?c.thrust.text(v):(c.thrust.text||'P'),{a:'end',fs:9.5,c:'#7a1f14',b:true}); } }
  // the height
  o+=scA(XR-4,y0+1,XR-4,yb,{both:true,w:1,c:'var(--mut)'})+scT(XR-8,yb-5,'H = '+fmt(Wd)+' m',{a:'end',fs:9,c:'var(--mut)'});
  return o; }
