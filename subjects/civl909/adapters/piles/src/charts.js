// ---------- mini charts ----------
function miniChart(c){
  if (!c) return '';
  if (c.type==='I' || c.type==='Rh' || c.type==='aF'){
    const W=250, H=160, l=36, b=26, t=10, rr=10;
    let X, Y, curves=[], px, py, xl, yl, xt=[], yt=[];
    if (c.type==='I'){
      const lx=v=>Math.log10(v), x0=lx(10), x1=lx(10000), y0=lx(0.4), y1=lx(30);
      X=k=>l+(lx(k)-x0)/(x1-x0)*(W-l-rr); Y=i=>H-b-(lx(i)-y0)/(y1-y0)*(H-b-t);
      [5,10,25,50].forEach(ld=>{ curves.push({lab:'L/D '+ld, hi: ld===chartI(c.K,c.LD).a || ld===chartI(c.K,c.LD).b, pts:SET_I.K.map((k,i)=>[X(k),Y(SET_I.LD[ld][i])])}); });
      px=X(c.K); py=Y(c.v); xl='K (log)'; yl='I (log)'; xt=[[10,'10'],[100,'100'],[1000,'1000'],[10000,'10⁴']].map(([v,s])=>[X(v),s]); yt=[[0.5,'0.5'],[1,'1'],[2,'2'],[5,'5'],[10,'10'],[20,'20']].map(([v,s])=>[Y(v),s]);
    } else if (c.type==='Rh'){
      const hmax=Math.max(4, Math.min(8, (c.hL||2)*1.4));
      X=h=>l+(h-1)/(hmax-1)*(W-l-rr); Y=v=>H-b-v*(H-b-t);
      [5,10,25,50].forEach(ld=>{ const pts=[]; for (let h=1; h<=hmax+1e-9; h+=0.05) pts.push([X(h),Y(chartRh(h,ld).v)]); curves.push({lab:'L/D '+ld, hi: ld===chartRh(c.hL,c.LD).a||ld===chartRh(c.hL,c.LD).b, pts}); });
      px=X(Math.min(c.hL,hmax)); py=Y(c.v); xl='h/L'; yl='R<sub>h</sub>'; xt=[1,2,3,4,6].filter(v=>v<=hmax).map(v=>[X(v),String(v)]); yt=[0.2,0.4,0.6,0.8,1].map(v=>[Y(v),String(v)]);
    } else {
      X=sd=>l+(Math.min(tOf(sd),10)-1)/9*(W-l-rr); Y=v=>H-b-v*(H-b-t);
      [10,25].forEach(ld=>{ const pts=[]; for (let sd=1; sd<=60; sd*=1.04) pts.push([X(sd),Y(chartAF(sd, ld, c.K).v)]); curves.push({lab:'L/D '+ld+', K '+f0(c.K), hi:true, pts}); });
      px=X(c.sD); py=Y(c.v); xl='s/D (right half: d/s)'; yl='α<sub>F</sub>'; xt=[[1,'1'],[2,'2'],[3,'3'],[4,'4'],[5,'5'],[10,'d/s .1'],[1e9,'0']].map(([v,s])=>[X(v),s]); yt=[0.2,0.4,0.6,0.8].map(v=>[Y(v),String(v)]);
    }
    let s=`<svg viewBox="0 0 ${W} ${H}" class="mini" role="img" aria-label="Chart lookup">`;
    xt.forEach(([x,lab])=>{ s+=`<line x1="${x}" y1="${t}" x2="${x}" y2="${H-b}" stroke="var(--faint)"/><text x="${x}" y="${H-b+11}" font-size="8.5" text-anchor="middle" fill="var(--muted)">${lab}</text>`; });
    yt.forEach(([y,lab])=>{ s+=`<line x1="${l}" y1="${y}" x2="${W-rr}" y2="${y}" stroke="var(--faint)"/><text x="${l-3}" y="${y+3}" font-size="8.5" text-anchor="end" fill="var(--muted)">${lab}</text>`; });
    s+=`<line x1="${l}" y1="${H-b}" x2="${W-rr}" y2="${H-b}" stroke="var(--muted)"/><line x1="${l}" y1="${t}" x2="${l}" y2="${H-b}" stroke="var(--muted)"/>`;
    s+=`<text x="${W-rr}" y="${H-3}" font-size="9.5" text-anchor="end" fill="var(--muted)">${xl}</text><text x="2" y="${t+8}" font-size="9.5" fill="var(--muted)">${svgSub(yl)}</text>`;
    curves.forEach(cv=>{ const d=cv.pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(''); s+=`<path d="${d}" fill="none" stroke="${cv.hi?'var(--ink)':'var(--rule)'}" stroke-width="${cv.hi?1.8:1.2}"/>`;
      const e=cv.pts[cv.pts.length-1]; if (cv.hi) s+=`<text x="${Math.min(e[0],W-rr)-2}" y="${e[1]-3}" font-size="8.5" text-anchor="end" fill="var(--muted)">${cv.lab}</text>`; });
    s+=`<path class="ptr" d="M${px},${H-b} L${px},${py} L${l},${py}" fill="none" stroke="var(--down)" stroke-width="2"/><circle class="pop" cx="${px}" cy="${py}" r="4.5" fill="var(--down)"/>`;
    s+=`<text class="pop" x="${l+3}" y="${py-4}" font-size="10" fill="var(--down)" font-weight="700">${f2(c.v)}</text>`;
    return s+'</svg>';
  }
  const W=250, H=150, l=34, b=24, t=10, rr=10; let s=`<svg viewBox="0 0 ${W} ${H}" class="mini" role="img" aria-label="Chart lookup">`;
  const axes=(xl,yl)=>`<line x1="${l}" y1="${H-b}" x2="${W-rr}" y2="${H-b}" stroke="var(--muted)"/><line x1="${l}" y1="${t}" x2="${l}" y2="${H-b}" stroke="var(--muted)"/>
    <text x="${W-rr}" y="${H-6}" font-size="10" text-anchor="end" fill="var(--muted)">${xl}</text><text x="4" y="${t+8}" font-size="10" fill="var(--muted)">${yl}</text>`;
  if (c.type==='alpha' || c.type==='nc'){
    const tbl = c.type==='alpha' ? (S.conv.alphaSrc==='chart'?ALPHA_CHART:[...Array(41)].map((_,i)=>{const cu=i*5; return [cu, cu<=40?1:0.21+26/cu];})) : NC_CIRC.concat([[5,9],[6,9]]);
    const xmax = c.type==='alpha' ? Math.max(120, c.x*1.2) : Math.max(5, Math.min(c.x*1.1, 12));
    const [ylo,yhi] = c.type==='alpha' ? [0,1.1] : [5.5,9.5];
    const X=x=>l+Math.min(x,xmax)/xmax*(W-l-rr), Y=y=>H-b-(y-ylo)/(yhi-ylo)*(H-b-t);
    s+=axes(c.type==='alpha'?'c̄u (kPa)':'L/D', c.type==='alpha'?'α':'Nc');
    let d=''; tbl.filter(p=>p[0]<=xmax).forEach((p,i)=>d+=(i?'L':'M')+X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)); d+='L'+X(xmax)+','+Y(c.type==='alpha'?(S.conv.alphaSrc==='chart'?interp(ALPHA_CHART,xmax):0.21+26/xmax):9);
    s+=`<path d="${d}" fill="none" stroke="var(--ink)" stroke-width="1.8"/>`;
    const gx = c.type==='alpha'?40:4; s+=`<line x1="${X(gx)}" y1="${t}" x2="${X(gx)}" y2="${H-b}" stroke="var(--hidden)" stroke-dasharray="3 2"/><text x="${X(gx)+3}" y="${t+9}" font-size="9.5" fill="var(--hidden)">gate ${gx}</text>`;
    s+=`<path class="ptr" d="M${X(c.x)},${H-b} L${X(c.x)},${Y(c.y)} L${l},${Y(c.y)}" fill="none" stroke="var(--down)" stroke-width="2"/>`;
    s+=`<circle class="pop" cx="${X(c.x)}" cy="${Y(c.y)}" r="4.5" fill="var(--down)"/>`;
    s+=`<text class="pop" x="${X(c.x)}" y="${H-b+12}" font-size="10" text-anchor="middle" fill="var(--down)" font-weight="600">${fa(c.x)}${c.x>xmax?' (off scale)':''}</text><text class="pop" x="${l-3}" y="${Y(c.y)+3}" font-size="10" text-anchor="end" fill="var(--down)" font-weight="600">${f2(c.y)}</text>`;
  } else if (c.type==='cap'){
    const xmax=Math.max(20, c.x*1.15), ymax=400*c.N*1.3; const X=x=>l+x/xmax*(W-l-rr), Y=y=>H-b-y/ymax*(H-b-t);
    s+=axes('L/D','fb');
    s+=`<line x1="${X(0)}" y1="${Y(0)}" x2="${X(xmax)}" y2="${Y(40*c.N*xmax)}" stroke="var(--muted)" stroke-dasharray="4 3"/>`;
    s+=`<line x1="${X(0)}" y1="${Y(400*c.N)}" x2="${X(xmax)}" y2="${Y(400*c.N)}" stroke="var(--hidden)" stroke-width="1.5"/><text x="${X(xmax)-2}" y="${Y(400*c.N)-4}" font-size="9.5" text-anchor="end" fill="var(--hidden)">cap 400N</text>`;
    s+=`<path d="M${X(0)},${Y(0)} L${X(10)},${Y(400*c.N)} L${X(xmax)},${Y(400*c.N)}" fill="none" stroke="var(--ink)" stroke-width="1.8"/>`;
    const fb=Math.min(40*c.N*c.x, 400*c.N);
    s+=`<path class="ptr" d="M${X(c.x)},${H-b} L${X(c.x)},${Y(fb)} L${l},${Y(fb)}" fill="none" stroke="var(--down)" stroke-width="2"/><circle class="pop" cx="${X(c.x)}" cy="${Y(fb)}" r="4.5" fill="var(--down)"/>`;
    s+=`<text class="pop" x="${X(c.x)}" y="${H-b+12}" font-size="10" text-anchor="middle" fill="var(--down)" font-weight="600">${f2(c.x)}</text><text class="pop" x="${l-3}" y="${Y(fb)+3}" font-size="9.5" text-anchor="end" fill="var(--down)" font-weight="600">${f0(fb)}</text>`;
  } else if (c.type==='min'){
    const mx=Math.max(c.a,c.b)*1.1; const X=v=>l+v/mx*(W-l-rr-40);
    [['n·Pu',c.a,c.gov==='individual'],['block',c.b,c.gov==='block']].forEach(([n,v,on],i)=>{ const y=28+i*46;
      s+=`<text x="4" y="${y+14}" font-size="10.5" fill="var(--muted)">${n}</text><rect class="grow" x="${l}" y="${y}" width="${X(v)-l}" height="20" fill="${on?'var(--up)':'var(--faint)'}" stroke="var(--rule)"/><text class="pop" x="${X(v)+4}" y="${y+14}" font-size="10.5" fill="var(--ink)" font-weight="${on?700:400}">${f0(v)}</text>`; });
    s+=`<text class="pop" x="${l}" y="${H-8}" font-size="10.5" fill="var(--up)" font-weight="600">smaller governs: ${f0(c.g)} kN</text>`;
  }
  return s+'</svg>';
}

// ---------- ledger: capacity filling up ----------
function ledger(r, step){
  const segsN=step.reveal.segs, base=step.reveal.base, G=r.G;
  const W=520, l=86, bw=W-l-60; const full=Math.max(r.Pu, r.sh.Ps+r.fbAb, 1); const X=v=>v/full*bw;
  let s=`<svg viewBox="0 0 ${W} ${G?112:62}" class="ledger" role="img" aria-label="Capacity so far">`;
  s+=`<text x="0" y="24" font-size="11.5" font-weight="600" fill="var(--ink)">one pile</text>`;
  s+=`<rect x="${l}" y="10" width="${bw}" height="22" fill="none" stroke="var(--rule)" stroke-dasharray="4 3"/>`;
  let x=l, sum=0;
  r.sh.segs.forEach((sg,i)=>{ if (i>=segsN) return; const w=X(Math.abs(sg.dP)); const cur = step.seg===i;
    s+=`<rect class="${cur?'grow':''}" x="${x}" y="10" width="${w}" height="22" fill="${sg.sign<0?'var(--down)':'var(--up)'}" opacity="${cur?1:0.55+0.1*(i%2)}"/>`; x+=w; sum+=sg.dP; });
  if (base){ const w=X(r.fbAb); s+=`<rect class="${step.key==='b'?'grow':''}" x="${x}" y="10" width="${w}" height="22" fill="var(--base)" opacity="${step.key==='b'?1:0.7}"/>`; x+=w; sum+=r.fbAb; }
  s+=`<text x="${l+bw+6}" y="26" font-size="11.5" fill="var(--ink)" font-weight="600">${f0(sum)}</text>`;
  s+=`<text x="${l}" y="48" font-size="10.5" fill="var(--muted)">dashed outline = final P<tspan font-size="8" dy="2">u</tspan><tspan dy="-2"> ${f0(r.Pu)} kN</tspan></text>`;
  if (G){
    const gi = ['g1','g2','g3','g5','c'].indexOf(step.key) >=0 ? [0,1,3,4,5][['g1','g2','g3','g5','c'].indexOf(step.key)] : (step.key==='ge'?4:-1); const gm=Math.max(G.sum,G.Pblock)*1.02; const Xg=v=>v/gm*bw;
    if (gi>=0){
      s+=`<text x="0" y="78" font-size="11.5" font-weight="600" fill="var(--ink)">group</text>`;
      s+=`<rect x="${l}" y="66" width="${Xg(G.sum)}" height="12" fill="var(--up)" opacity=".7"/><text x="${l+Xg(G.sum)+4}" y="76" font-size="10" fill="var(--muted)">n·Pu ${f0(G.sum)}</text>`;
      if (gi>=1 && S.group.mode!=='eff'){ const bv = gi>=3?G.Pblock:gi===2?G.PsB:0; if (bv) s+=`<rect class="${gi<=3?'grow':''}" x="${l}" y="82" width="${Xg(bv)}" height="12" fill="var(--hidden)" opacity=".75"/><text x="${l+Xg(bv)+4}" y="92" font-size="10" fill="var(--muted)">block ${gi===2?'sides ':''}${f0(bv)}</text>`; }
      if (gi>=4){ s+=`<line x1="${l+Xg(G.Pg)}" y1="62" x2="${l+Xg(G.Pg)}" y2="98" stroke="var(--ink)" stroke-width="2"/><text x="${l+Xg(G.Pg)}" y="108" font-size="10" text-anchor="middle" fill="var(--ink)" font-weight="600">P<tspan font-size="8" dy="2">u,g</tspan><tspan dy="-2"> ${f0(G.Pg)}</tspan></text>`; }
    }
  }
  return s+'</svg>';
}
