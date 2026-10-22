// ================= UTIL: formatting and tiny helpers shared by every file =================
const $ = s => document.querySelector(s);
const clone = o => (typeof structuredClone==='function' ? structuredClone(o) : JSON.parse(JSON.stringify(o)));
const f = (v, d=1) => (v==null||isNaN(v)) ? '–' : Number(v).toLocaleString('en-AU',{minimumFractionDigits:d, maximumFractionDigits:d});
const f0 = v => f(v,0), f2 = v => f(v,2), f3 = v => f(v,3);
const fa = v => Math.abs(v)>=100 ? f0(v) : Math.abs(v)>=10 ? f(v,1) : f(v,2);
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const plain = s => String(s).replace(/<sub>(.*?)<\/sub>/g,'$1').replace(/<[^>]+>/g,'');
const METHOD_NAME = {m1:'Method 1: one layer, average c<sub>u</sub>', m2:'Method 2: split into layers', m3:'Method 3: integral'};
const svgSub = s => String(s).replace(/<sub>(.*?)<\/sub>/g,'<tspan dy="2" font-size="8">$1</tspan><tspan dy="-2">\u200a</tspan>');
// a value for display: whole numbers stay whole (9 piles, not 9.00), the rest get sensible decimals
const fv = v => typeof v!=='number' ? (v==null ? '–' : String(v)) : !isFinite(v) ? '–' : Number.isInteger(v) ? v.toLocaleString('en-AU') : fa(v);
