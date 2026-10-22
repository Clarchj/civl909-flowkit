// ================= KIT · GENERIC CHARTS =================
// chartHTML(spec) draws the chart a look-up block reads from. A subject can add its own chart types (miniChart in an adapter);
// 'curve' is generic: any number of series, a marked reading, optional reversed y axis (depth plots) and vertical marks.
//   {type:'curve', xl, yl, xmin, xmax, ymin, ymax, yrev, series:[{lab,pts:[[x,y]…],hi}], point:{x,y,lab}, marks:[{x,lab}], xticks, yticks}
const svgS = s => String(s).replace(/<sub>(.*?)<\/sub>/g,'<tspan dy="2" font-size="8">$1</tspan><tspan dy="-2"> </tspan>');
const niceTicks=(min,max,n=5)=>{ const span=max-min; if (!(span>0)) return [min]; const raw=span/n, p=Math.pow(10,Math.floor(Math.log10(raw))), m=raw/p, step=(m<1.5?1:m<3?2:m<7?5:10)*p, out=[];
  for(let x=Math.ceil(min/step)*step; x<=max+step*1e-6; x+=step) out.push(+x.toFixed(10)); return out; };
function curveChart(c){
  const W=250,H=160,l=38,b=28,t=12,rr=12, xmin=c.xmin??0, xmax=c.xmax, ymin=c.ymin??0, ymax=c.ymax;
  const fx=c.xlog?Math.log10:(x=>x), fy=c.ylog?Math.log10:(y=>y);
  const X=x=>l+(fx(x)-fx(xmin))/(fx(xmax)-fx(xmin))*(W-l-rr), Y=y=>c.yrev ? t+(fy(y)-fy(ymin))/(fy(ymax)-fy(ymin))*(H-b-t) : H-b-(fy(y)-fy(ymin))/(fy(ymax)-fy(ymin))*(H-b-t);
  const logTicks=(a,z)=>{ const o=[]; for(let e=Math.ceil(Math.log10(a)); e<=Math.floor(Math.log10(z)); e++) o.push(Math.pow(10,e)); return o.length?o:[a,z]; };
  let s=`<svg viewBox="0 0 ${W} ${H}" class="mini" role="img" aria-label="Chart look-up">`;
  (c.xticks||(c.xlog?logTicks(xmin,xmax):niceTicks(xmin,xmax))).forEach(x=>{ s+=`<line x1="${X(x)}" y1="${t}" x2="${X(x)}" y2="${H-b}" stroke="var(--faint)"/><text x="${X(x)}" y="${H-b+11}" font-size="8.5" text-anchor="middle" fill="var(--muted)">${fmt(x)}</text>`; });
  (c.yticks||(c.ylog?logTicks(ymin,ymax):niceTicks(ymin,ymax))).forEach(y=>{ s+=`<line x1="${l}" y1="${Y(y)}" x2="${W-rr}" y2="${Y(y)}" stroke="var(--faint)"/><text x="${l-3}" y="${Y(y)+3}" font-size="8.5" text-anchor="end" fill="var(--muted)">${fmt(y)}</text>`; });
  s+=`<line x1="${l}" y1="${H-b}" x2="${W-rr}" y2="${H-b}" stroke="var(--muted)"/><line x1="${l}" y1="${t}" x2="${l}" y2="${H-b}" stroke="var(--muted)"/>`;
  s+=`<text x="${W-rr}" y="${H-4}" font-size="9.5" text-anchor="end" fill="var(--muted)">${svgS(c.xl||'')}</text><text x="2" y="${t-1}" font-size="9.5" fill="var(--muted)">${svgS(c.yl||'')}</text>`;
  (c.marks||[]).forEach(m=>{ s+=`<line x1="${X(m.x)}" y1="${t}" x2="${X(m.x)}" y2="${H-b}" stroke="var(--hidden)" stroke-dasharray="3 2"/><text x="${X(m.x)+3}" y="${t+9}" font-size="9" fill="var(--hidden)">${svgS(m.lab||'')}</text>`; });
  (c.series||[]).forEach(se=>{ const d=se.pts.map((p,i)=>(i?'L':'M')+X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)).join(''); s+=`<path d="${d}" fill="none" stroke="${se.hi?'var(--ink)':'var(--rule)'}" stroke-width="${se.hi?1.9:1.3}" stroke-linejoin="round"/>`;
    if (se.lab){ const e=se.pts[se.pts.length-1]; s+=`<text x="${Math.min(X(e[0]),W-rr)-2}" y="${Y(e[1])-3}" font-size="8.5" text-anchor="end" fill="var(--muted)">${svgS(se.lab)}</text>`; } });
  if (c.point){ const p=c.point, px=X(p.x), py=Y(p.y), bx=c.yrev?t:H-b;
    s+=`<path d="M${px},${bx} L${px},${py} L${l},${py}" fill="none" stroke="var(--down)" stroke-width="2"/><circle cx="${px}" cy="${py}" r="4.5" fill="var(--down)"/>`;
    s+=`<text x="${l+3}" y="${py-4}" font-size="10" fill="var(--down)" font-weight="700">${esc2(p.lab!=null?p.lab:fmt(p.y))}</text>`; }
  return s+'</svg>'; }
function chartHTML(spec){ if (!spec) return ''; if (spec.type==='curve') return curveChart(spec); return typeof miniChart==='function' ? miniChart(spec) : ''; }
