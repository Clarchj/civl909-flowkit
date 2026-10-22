// ================= WEEK 1 · validity checks for the bearing capacity problems (Q1 to Q5) =================
// Each check is a Gate with warn:true: when it is TRUE the page says so (top bar, Question and Solution tabs, and the gate on the map).
// They read inputs and results only and feed no expression, so no official answer changes. They flag three kinds of trouble:
//   impossible inputs (a negative width, a load outside the base), a formula used outside its range (φ above the 40° end of the chart, i_q ≤ 0),
//   and a case the lecture does not cover (a water table between the base and B below it).
const _w=(id,expr,test,msg,info)=>Gate(id,expr,{test,yes:msg,no:'fine',warn:true,info:info||''});
const _phiW=(id,phiId)=>_w(id,`${phiId}>40 || ${phiId}<0`,'φ′ outside the chart (0 to 40°)?','φ′ is outside the chart (0 to 40°): the factors are held at the end values, not extrapolated, so F is not reliable','The N-factor tables stop at 40°.');
const _netW=(id,expr)=>_w(id,expr,'net pressure applied ≤ 0?','the net pressure Q/B − γD is not positive: the footing carries less than the soil it removed, so F has no meaning','Check the load, the width and the depth.');
const _gamW=(id,gs,gw)=>_w(id,`${gs}<=${gw}`,'γ<sub>sat</sub> not above γ<sub>w</sub>?','γ<sub>sat</sub> must be larger than γ<sub>w</sub> (9.8): γ′ would be zero or negative','');
const _checks=(id,gates)=>DECL[id].nodes.push(...gates);

_checks('w1q1',[ _w('wQ','Q<=0','total load ≤ 0?','the total load is not positive'), _gamW('wg','gs','gw') ]);
_checks('w1q2',[ _netW('wnet','qn<=0'), _w('wB','B<=0','width ≤ 0?','the footing width must be positive'), _w('wc','und && cu<=0','undrained strength ≤ 0?','c<sub>u</sub> must be positive'), _gamW('wg','gs','gw') ]);
['w1q3a','w1q3b'].forEach(id=>_checks(id,[ _w('wcoh','cc>0','cohesion present?','this problem\'s net-capacity line has no cohesion term (it was written for c′ = 0): add it before using c′ &gt; 0'), _netW('wnet','q<=g*D'), _gamW('wg','gs','gw'), _w('wDw','zw<0','water table above the ground?','the water table depth is negative (above the ground surface): this problem assumes it is below'),
  _w('wzone','zw>D && zw<D+B','water table between the base and B below it?','the water table is within B below the base: the soil under the footing is partly buoyant. The lecture covers only “at the base” and “deeper than 1.5 to 2B”; this working interpolates between γ′ and γ (textbook rule, not on the slide)','The two cases on the slide “Effect of water table on bearing capacity” leave this gap.'),
  _w('wabove','zw<D && zw>=0','water table above the base?','the water table is above the base: the surcharge γD would also be partly buoyant, which this working does not model (it only treats the soil under the footing)','Tutorial 1 Q3 has the water table at or below the base.') ]));
_checks('w1q4',[ _netW('wnet','qn<=0'), _w('wc','und && cu<=0','undrained strength ≤ 0?','c<sub>u</sub> must be positive'), _w('wB','B<=0','width ≤ 0?','the footing width must be positive') ]);
_checks('w1q5',[ _w('wV','V<=0','vertical load ≤ 0?','the vertical load must be positive'),
  _w('wBp','Bp<=0','effective width ≤ 0?','the load acts outside the base: e ≥ B/2, so the effective width B′ = B − 2e is zero or negative and F has no meaning'),
  _w('wiq','iq<=0 && Bp>0','inclination factor ≤ 0?','H/V is so large that i<sub>q</sub> ≤ 0: the inclination formula no longer applies, and sliding will govern before bearing','The simplified factors i<sub>q</sub> = 1 − 1.5H/V need H/V &lt; 0.67.'),
  _w('wthird','e>B/6 && Bp>0','load outside the middle third?','the resultant is outside the middle third (e &gt; B/6): part of the base may lose contact with the soil. The effective-width method still applies, but check the contact pressure','Effective width is valid while e &lt; B/2.') ]);
