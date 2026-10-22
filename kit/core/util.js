// ================= KIT · SHARED HELPERS (no subject knowledge in here) =================
const $q = (s,r=document)=>r.querySelector(s);
const $qa = (s,r=document)=>[...r.querySelectorAll(s)];
const fmt = v => { if (typeof v!=='number' || !isFinite(v)) return v==null?'':String(v);
  const a=Math.abs(v); const s = a>=1000 ? v.toFixed(0) : a>=100 ? v.toFixed(1) : a>=1 ? v.toFixed(2) : a===0 ? '0' : v.toPrecision(3);
  return s.includes('.') ? s.replace(/0+$/,'').replace(/\.$/,'') : s; };
const esc2 = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const plainT = s => String(s).replace(/<sub>(.*?)<\/sub>/g,'$1').replace(/<sup>(.*?)<\/sup>/g,'$1').replace(/<[^>]+>/g,'');
// linear interpolation in a table of [x, y] points (sorted by x); clamps at both ends
const interpTable = (pts,x)=>{ if (x<=pts[0][0]) return pts[0][1]; for(let i=1;i<pts.length;i++){ if (x<=pts[i][0]){ const [x0,y0]=pts[i-1],[x1,y1]=pts[i]; return y0+(y1-y0)*(x-x0)/(x1-x0); } } return pts[pts.length-1][1]; };
const lsGet=(k,d)=>{ try{ const v=localStorage.getItem('flowkit.'+(typeof SUBJECT!=='undefined'?SUBJECT.id:'x')+'.'+k); return v==null?d:JSON.parse(v); }catch(e){ return d; } };
const lsSet=(k,v)=>{ try{ localStorage.setItem('flowkit.'+(typeof SUBJECT!=='undefined'?SUBJECT.id:'x')+'.'+k, JSON.stringify(v)); }catch(e){} };
