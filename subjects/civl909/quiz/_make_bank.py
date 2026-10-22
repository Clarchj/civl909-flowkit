"""Generates quiz/bank.json: the CIVL909 multiple-choice bank (exam items + new items), every number computed here.
Run:  python subjects/civl909/quiz/_make_bank.py      (from flowkit/). Then rebuild the page.
Each item: id, track, week, pattern, kind (concept|calc), source (exam|tutorial|lecture|external), likely (1-3: how likely a similar
question is on the final), marks, q, options{A-D}, answer, why, symbols[] (notation keys), link (a Map problem id), flag.
Correct option is given FIRST and shuffled deterministically, so the answer letters are spread out."""
import json, math, random, hashlib, io, sys
from math import log10, sqrt, pi
sys.stdout.reconfigure(encoding='utf-8')
HERE = __file__.rsplit('\\',1)[0].rsplit('/',1)[0] if False else None
import os
HERE = os.path.dirname(os.path.abspath(__file__))
NOT = json.load(open(os.path.join(HERE,'..','notation.json'),encoding='utf-8'))
def keys(sym):
    out=set()
    for p in sym.split(','):
        p=p.strip(); out.add(nk(p))
        if '(' in p: a,b=p.split('(',1); out.add(nk(a)); out.add(nk(b.rstrip(')')))
    return out
def nk(s):
    import re, unicodedata
    s=re.sub(r'<[^>]+>','',s); s=unicodedata.normalize('NFD',s); s=''.join(c for c in s if not unicodedata.combining(c))
    s=s.replace('′',"'").replace('’',"'").replace('`',"'"); s=re.sub(r"'+","'",s); return re.sub(r'\s+','',s)
NKEYS=set()
for s in NOT['symbols']: NKEYS|=keys(s['symbol'])

PATTERNS = [
 # id, track, name, blurb, weight (0-100: judged chance a question of this pattern is in the final), why
 ('modes','shallow','Failure modes and foundation types','General, local and punching shear; shallow vs deep; load-settlement curves.',45,'Two of the 14 mid-session MCQs (Q10, Q13) tested it, and it is the cheapest marks on the paper.'),
 ('terms','shallow','Bearing capacity terms and factors','What each term of q_f is; what N_c, N_q, N_γ depend on; φ = 0 clay; which parameters to use.',70,'Mid-session Q1, Q11 and Q12 were all of this kind, and W1 is the foundation of everything after it.'),
 ('shape','shallow','Shape, depth, inclination, eccentricity','Square and circular factors, B′ = B − 2e, i_q and i_γ.',35,'Appears in tutorial 1 Q5 and as a one-line concept check (mid-session Q2).'),
 ('net','shallow','Gross, net and factor of safety','q_nf = q_f − γD, F = q_nf/q_n, heave of an excavation, required width.',55,'Every bearing capacity numerical in the tutorials ends here (mid-session Section II Q1 asks for the gross value).'),
 ('water-bc','shallow','Water table and bearing capacity','γ′ in each term, when the water table stops mattering.',55,'Tutorial 1 Q3, Q1 and mid-session Section II Q1 all turn on it.'),
 ('spt','shallow','SPT and CPT: tests and corrections','Energy, overburden, dilatancy; the CPT quantities and the q_c–N link.',50,'Mid-session Q3 and the tutorial 2 working. The C_N convention is the risk.'),
 ('allow','shallow','Allowable pressure, C_w, plate load','q_a from N, the water table correction, plate-to-footing scaling.',55,'Mid-session Q4 and Q14, tutorial 2 Q1–Q3.'),
 ('elastic','shallow','Immediate (elastic) settlement','s = qB(1 − ν²)I/E, μ₀ and μ₁, layers by superposition, rigidity factor.',35,'Tutorial 3 Q1–Q2. Not on the mid-session paper, so it may be owed.'),
 ('stress','shallow','Stress increase at depth','Point load, corner of a rectangle (Fadum), superposition, outside points.',40,'Tutorial 4 Q1. A natural calculation for a closed-book paper with a provided chart.'),
 ('voidr','shallow','Void ratio and stress history','e–log σ′, C_c and C_r, p_c, OCR, H ∝ 1 + e.',60,'Mid-session Q8, Q9; tutorial 3 Q3.'),
 ('consol','shallow','Consolidation settlement','S_c from C_c, C_r, e₀, m_v; dewatering; the stress at mid-layer.',75,'Mid-session Q5 and Section II Q2. The most repeated calculation in weeks 3 to 5.'),
 ('time','shallow','Consolidation time','T_v, drainage path, t ∝ d², √t scaling, c_v.',75,'Mid-session Q6, Q7 and Section II Q3, tutorial 4 Q2–Q4.'),
 ('secondary','shallow','Secondary compression','C_α, C_αε, log(t/t_p), after primary.',30,'Tutorial 5 Q1 only; short.'),
 ('cpt','shallow','CPT and SPT settlement (Schmertmann, Meyerhof)','E = 2.5q_c, I_z triangle, C_1, C_2, Meyerhof 1965.',55,'Mid-session Section II Q4 carried 8 marks, the biggest single item.'),
 ('pile-concept','deep','Pile types and load transfer','Displacement or not, end-bearing or floating, P_u = P_s + P_b − W.',50,'Week 7 opens with it; concept marks on a final are usual.'),
 ('pile-clay','deep','Pile capacity in clay (undrained)','f_s = αc_u, N_c = 9, c_u over 2D, layered shafts.',80,'The week 7 slides mark the layered method "for test/exam!".'),
 ('pile-sand','deep','Pile capacity in sand (drained)','K, δ, K₀, Meyerhof f_s = 2N̄ and f_b = 40N L/D ≤ 400N.',70,'Week 8 tutorial and worked example.'),
 ('pile-group','deep','Pile groups and the equivalent block','n·P_u against the block, spacing, efficiency.',75,'Week 8 worked example and tutorial; the "lesser of the two" rule is a classic.'),
 ('pile-settle','deep','Settlement of a single pile','S = P·I·R_v·R_h/(D·E_s), K, movement ratio.',70,'Week 9 worked examples (14 mm twice).'),
 ('group-settle','deep','Settlement of a pile group','Interaction factors, S_k = S_o(P_k + ΣαP_i), superposition.',60,'Week 9 and tutorial 9.'),
 ('piled-raft','deep','Piled rafts and design codes','Piled raft behaviour, AS 2159 reduction factors and load factors.',40,'Week 10 content that the mid-session could not have covered.'),
 ('rankine','walls','Rankine pressures','K_a, K_p, K₀; pressure at depth; surcharge; which way the wall moves.',65,'The core of week 11 and the base of every later wall question.'),
 ('wall-layers','walls','Layers, water and thrust','Layered soils, pore pressure, total thrust and where it acts.',60,'Tutorial 11 Q1 to Q3 are all this; the working is long, so it suits a numerical question.'),
 ('wall-cohesive','walls','Cohesive soil, tension cracks, critical depth','z₀ = 2c/(γ√K_a), H_c = 4c_u/γ, undrained analysis.',55,'Tutorial 11 Q2 and Q5. The official Q5 working mixes z₀ with H_c, so learn the difference.'),
 ('coulomb','walls','Coulomb theory and slopes','Wall friction, inclined wall, sloping backfill, plane-failure limits.',40,'Week 12 tutorial; no official solution was supplied.'),
 ('embedded','walls','Embedded walls and wall stability','Cantilever sheet piles, factors of safety, overturning, sliding, bearing.',35,'Week 12 lecture, one worked example; the tutorial gravity wall check is the same family.'),]

def okSym(s): return nk(s) in NKEYS or all(nk(p) in NKEYS for p in s.split(','))
ITEMS=[]
def Q(id, wk, pat, kind, src, lik, marks, q, opts, why, syms=(), link=None, flag='', track=None):
    pt=[p for p in PATTERNS if p[0]==pat]; assert pt,(id,pat)
    assert len(opts)==4 and len(set(opts))==4,(id,'options must be 4 distinct',opts)
    for s in syms: assert okSym(s),(id,'symbol not in notation',s)
    r=random.Random(int(hashlib.md5(id.encode()).hexdigest()[:8],16)); rest=[1,2,3]; r.shuffle(rest); pos=len(ITEMS)%4; order=rest[:]; order.insert(pos,0)
    letters='ABCD'; options={}; ans=''
    for pos,o in enumerate(order):
        options[letters[pos]]=opts[o]
        if o==0: ans=letters[pos]
    ITEMS.append(dict(id=id, track=track or pt[0][1], week=wk, pattern=pat, kind=kind, source=src, likely=lik, marks=marks, q=q, options=options, answer=ans, why=why, symbols=list(syms), link=link, flag=flag))
def f(x,d=1): return f'{x:.{d}f}'.rstrip('0').rstrip('.') if d else str(round(x))
def around(x,d=1,*mult):
    """distractors from multipliers"""
    return [f(x*m,d) for m in mult]

# ============================================================== SHALLOW · WEEK 1 ==============================================================
Q('S-W1-01',1,'terms','concept','lecture',3,1,'For a saturated clay loaded so fast that no water can escape (φ<sub>u</sub> = 0), the Hansen bearing capacity factors are',
  ['N<sub>c</sub> = 5.14, N<sub>q</sub> = 1, N<sub>γ</sub> = 0','N<sub>c</sub> = 5.14, N<sub>q</sub> = 1, N<sub>γ</sub> = 1','N<sub>c</sub> = 0, N<sub>q</sub> = 1, N<sub>γ</sub> = 5.14','N<sub>c</sub> = 1, N<sub>q</sub> = 5.14, N<sub>γ</sub> = 0'],
  'φ = 0 gives N<sub>q</sub> = e<sup>π tanφ</sup>tan²(45° + φ/2) = 1, N<sub>γ</sub> = 1.8(N<sub>q</sub> − 1)tanφ = 0 and N<sub>c</sub> = π + 2 = 5.14.',['Nc,Nq,Nγ','φu'],'w1q4')
Q('S-W1-02',1,'terms','concept','lecture',3,1,'In q<sub>f</sub> = cN<sub>c</sub> + γDN<sub>q</sub> + ½γBN<sub>γ</sub> the middle term represents',
  ['the surcharge from the soil beside the footing','the cohesion of the soil under the footing','the self-weight of the soil under the footing','the weight of the footing itself'],
  'The three terms are cohesion (cN<sub>c</sub>), surcharge from the soil at the base level (γDN<sub>q</sub>) and the weight of soil in the failure wedge (½γBN<sub>γ</sub>).',['qf','Nq'])
Q('S-W1-03',1,'terms','concept','lecture',2,1,'For a footing in sand with c = 0, doubling the footing width B (same depth, same soil) changes the capacity as follows',
  ['Only the ½γBN<sub>γ</sub> term doubles; the γDN<sub>q</sub> term is unchanged','Both q<sub>f</sub> terms double','q<sub>f</sub> is unchanged because it is a pressure','Only the γDN<sub>q</sub> term doubles'],
  'B appears only in the unit-weight term. The surcharge term depends on the depth D, so total q<sub>f</sub> rises by less than a factor of 2.',['B','Nγ'])
Q('S-W1-04',1,'net','concept','lecture',3,1,'The net ultimate bearing capacity is defined as',
  ['q<sub>nf</sub> = q<sub>f</sub> − γD','q<sub>nf</sub> = q<sub>f</sub> + γD','q<sub>nf</sub> = q<sub>f</sub>/γD','q<sub>nf</sub> = q<sub>f</sub> − γB'],
  'The soil that was excavated already carried γD, so only the pressure above it counts: q<sub>nf</sub> = q<sub>f</sub> − γD.',['qnf','qf'],'w1q4')
Q('S-W1-05',1,'net','concept','lecture',2,1,'The factor of safety against shear failure used in the tutorials is',
  ['F = q<sub>nf</sub> / q<sub>n</sub>, net capacity over net applied pressure','F = q<sub>f</sub> / q<sub>applied</sub>, gross over gross, always','F = q<sub>n</sub> / q<sub>nf</sub>','F = q<sub>f</sub> − q<sub>applied</sub>'],
  'Both capacity and applied pressure are taken net of γD: F = q<sub>nf</sub>/q<sub>n</sub>. (Gross over gross is also seen, but it is not the tutorial convention.)',['F','qn'])
# calc: strip on clay
cu,B,D,g,Qv=40,2,1.5,18,150; qnf=cu*5.14; qn=Qv/B-g*D; F=qnf/qn
Q('S-W1-06',1,'net','calc','tutorial',3,2,f'A strip footing {B} m wide at {D} m depth in saturated clay (c<sub>u</sub> = {cu} kPa, φ<sub>u</sub> = 0, γ = {g} kN/m³) carries {Qv} kN/m. The factor of safety (Hansen, N<sub>c</sub> = 5.14) is about',
  [f(F,1), f((cu*5.14+g*D)/(Qv/B),1), f(cu*5.14/(Qv/B),1), f(qnf/(Qv/B-g*B),1)],
  f'q<sub>nf</sub> = c<sub>u</sub>N<sub>c</sub> = {f(qnf,1)} kPa; q<sub>n</sub> = Q/B − γD = {Qv/B:.0f} − {g*D:.0f} = {f(qn,0)} kPa; F = {f(qnf,1)}/{f(qn,0)} = {f(F,1)}.',['cu','qnf','qn','F'],'w1q4')
# calc: square footing on sand, factors stated
Bq,Dq,gq,Nq_,Ng_=2,1,18,18.4,18.1; qf=gq*Dq*Nq_+0.4*gq*Bq*Ng_
Q('S-W1-07',1,'shape','calc','lecture',3,2,f'A {Bq} m square footing at {Dq} m depth in dry sand (c = 0, γ = {gq} kN/m³, φ = 30°). Take N<sub>q</sub> = {Nq_} and N<sub>γ</sub> = {Ng_}. Using the simplified shape factors, q<sub>f</sub> is about',
  [f(qf,0), f(gq*Dq*Nq_+0.5*gq*Bq*Ng_,0), f(0.4*gq*Bq*Ng_,0), f(qf-gq*Dq,0)],
  f'Square: q<sub>f</sub> = γDN<sub>q</sub> + 0.4γBN<sub>γ</sub> = {gq*Dq*Nq_:.0f} + {0.4*gq*Bq*Ng_:.0f} = {f(qf,0)} kPa. (½ is for a strip; {f(qf-gq*Dq,0)} is the net value.)',['qf','Nq','Nγ'])
Q('S-W1-08',1,'shape','concept','lecture',3,1,'The simplified shape factors for a <b>square</b> footing in the unit-weight and cohesion terms are',
  ['0.4γBN<sub>γ</sub> (instead of ½) and 1.3cN<sub>c</sub>','0.3γBN<sub>γ</sub> and 1.3cN<sub>c</sub>','0.5γBN<sub>γ</sub> and 1.3cN<sub>c</sub>','0.4γBN<sub>γ</sub> and 1.0cN<sub>c</sub>'],
  'Square: s<sub>γ</sub> = 0.8 (so 0.4γBN<sub>γ</sub>), s<sub>c</sub> = 1.3, s<sub>q</sub> = 1. Circular: 0.3γBN<sub>γ</sub> with s<sub>c</sub> = 1.3.',['sc,sq,sγ'])
Q('S-W1-09',1,'water-bc','concept','lecture',3,1,'In a saturated sand with the water table at the ground surface, which unit weight goes into q<sub>f</sub> = γDN<sub>q</sub> + ½γBN<sub>γ</sub>?',
  ['γ′ = γ<sub>sat</sub> − γ<sub>w</sub> in both terms','γ<sub>sat</sub> in both terms','γ′ in the first term and γ<sub>sat</sub> in the second','γ<sub>w</sub> in both terms'],
  'Both the soil beside the footing and the soil under it are submerged, so both terms carry the buoyant unit weight.',["γ'",'γsat','γw'],'w1q2')
Q('S-W1-10',1,'water-bc','concept','lecture',3,1,'Dry sand above a water table that rests exactly at the footing base. In q<sub>f</sub> = γDN<sub>q</sub> + ½γBN<sub>γ</sub>',
  ['the first term keeps γ and the second uses γ′','both terms use γ′','both terms keep γ','the first term uses γ′ and the second keeps γ'],
  'The surcharge term involves the soil <i>above</i> the base, which is above the water table, so γ. The wedge below the base is submerged, so γ′.',["γ'",'γ'],'w1q3b')
Q('S-W1-11',1,'water-bc','concept','lecture',2,1,'The water table need not be considered for bearing capacity (the soil is treated as dry) when it is deeper than about',
  ['1.5 to 2 times the footing width below the base','0.5 times the footing width below the base','the footing depth D below the ground','the footing length L below the ground'],
  'The failure wedge extends about 1.5 to 2B below the base. Below that depth the water table does not touch it.',['B','Dw'])
Q('S-W1-12',1,'water-bc','calc','tutorial',3,2,'A strip footing in saturated sand (γ<sub>sat</sub> = 20 kN/m³, γ<sub>w</sub> = 9.81 kN/m³, c = 0) has the water table at the surface. The weight to use in both q<sub>f</sub> terms is',
  ['10.2 kN/m³','20 kN/m³','9.81 kN/m³','29.8 kN/m³'],'γ′ = 20 − 9.81 = 10.19 ≈ 10.2 kN/m³.',["γ'",'γsat','γw'])
Q('S-W1-13',1,'shape','calc','tutorial',3,2,'A strip footing 3 m wide carries a vertical load at an eccentricity e = 0.4 m. The effective width is',
  ['2.2 m','2.6 m','1.8 m','3.0 m'],"B′ = B − 2e = 3 − 0.8 = 2.2 m. The load acts on the middle part that is symmetric about it.",["B'",'ex, ey'],'w1q5')
Vv,Hh=300,60; iq=1-1.5*Hh/Vv
Q('S-W1-14',1,'shape','calc','tutorial',2,2,f'For an inclined load with V = {Vv} kN/m and H = {Hh} kN/m, i<sub>q</sub> = 1 − 1.5H/V. The factor on the unit-weight term, i<sub>γ</sub> = i<sub>q</sub>², is',
  [f(iq*iq,2), f(iq,2), f(1-1.5*(Hh/Vv)**2,2), f((1-0.5*Hh/Vv)**2,2)],
  f'i<sub>q</sub> = 1 − 1.5·{Hh}/{Vv} = {f(iq,2)}; i<sub>γ</sub> = i<sub>q</sub>² = {f(iq*iq,2)}. The unit-weight term is cut more than the surcharge term.',['ic,iq,iγ'],'w1q5')
Q('S-W1-15',1,'terms','concept','lecture',2,1,'Which soil parameters should a stability check <b>immediately after construction</b> of a footing on saturated clay use?',
  ['c<sub>u</sub> and φ<sub>u</sub> = 0 (undrained)','c′ and φ′ (drained)','c′ and φ<sub>u</sub> = 0','γ<sub>w</sub> and φ′ only'],
  'Clay loaded quickly cannot drain, so the short-term case is undrained with total-stress parameters. The long-term check uses c′ and φ′.',['cu, φu',"c', φ'"],'w1q2')
Q('S-W1-16',1,'terms','concept','lecture',2,1,'Which of these is <b>not</b> an assumption of Terzaghi\'s bearing capacity theory?',
  ['The soil is layered, anisotropic and the load is inclined','The failure is by general shear','The base of the footing is rough','The overburden is replaced by a surcharge γD'],
  'Terzaghi assumes a homogeneous, isotropic, semi-infinite soil, a vertical symmetric load on a strip, a rough base, general shear and a surcharge γD. Layers and inclination need extensions.',[])
Q('S-W1-17',1,'modes','concept','lecture',3,1,'A foundation is classed as <b>shallow</b> when, in the lecture, its depth-to-width ratio',
  ['D/B is less than about 1','D/B is greater than 4','L/B is less than 1','D is below the water table'],'The course treats a footing or raft as shallow when D/B < 1; piles are deep (L/D large).',['D','B'])
Q('S-W1-18',1,'modes','concept','lecture',3,1,'Load-settlement behaviour with a well-defined peak, heave of the ground on both sides and tilting of the footing indicates',
  ['general shear failure','local shear failure','punching shear failure','consolidation settlement'],'General shear: a continuous failure surface reaches the ground surface; typical of dense sand or stiff clay.',[])
Q('S-W1-19',1,'modes','concept','lecture',3,1,'Large settlements, no heave away from the footing and no tilting, with a load-settlement curve that has no clear peak, are typical of',
  ['punching shear failure','general shear failure','a stiff clay under a surface strip','elastic compression only'],'Punching: the soil is compressible (loose) or the footing is deep; the footing sinks as a plug with vertical shearing at its edges.',[])
Q('S-W1-20',1,'modes','concept','lecture',2,1,'Which pair is correct?',
  ['Local shear: failure surfaces do not reach the surface, only slight heave, ultimate load not well defined','Local shear: a clear peak load and large heave on both sides','General shear: footing punches vertically with no heave','Punching: continuous slip surface to the ground and tilting'],
  'Local shear sits between general and punching: significant compression, slip surfaces that do not reach the surface, slight heave.',[])
Q('S-W1-21',1,'net','concept','lecture',2,1,'Excavations in soft clay can fail by bottom heave. For φ = 0 the factor of safety against heave is',
  ['F = c<sub>u</sub>N<sub>c</sub> / (γD), plus the surcharge q<sub>s</sub> in the denominator if there is one','F = γD / (c<sub>u</sub>N<sub>c</sub>)','F = c<sub>u</sub>N<sub>c</sub> / (γD − q<sub>s</sub>)','F = c<sub>u</sub> / (γD)'],
  'The bearing pressure is c<sub>u</sub>N<sub>c</sub>; the pressure driving failure is the weight of clay beside the excavation, γD (+ q<sub>s</sub> for a surcharge).',['cu','Nc'])
cu2,D2,g2=30,6,17; Fh=cu2*5.14/(g2*D2)
Q('S-W1-22',1,'net','calc','lecture',2,2,f'A {D2} m deep excavation in clay (c<sub>u</sub> = {cu2} kPa, γ = {g2} kN/m³, φ = 0) has no surcharge. The factor of safety against bottom heave (N<sub>c</sub> = 5.14) is',
  [f(Fh,2), f(cu2/(g2*D2),2), f(cu2*5.14/(g2*D2/2),2), f((g2*D2)/(cu2*5.14),2)],
  f'F = c<sub>u</sub>N<sub>c</sub>/(γD) = {cu2*5.14:.1f}/{g2*D2} = {f(Fh,2)}.',['cu','Nc'])
Q('S-W1-23',1,'modes','concept','lecture',2,1,'Which pair names the two limit states every foundation design must satisfy?',
  ['Ultimate limit state (collapse) and serviceability limit state (excessive deformation)','Elastic limit and plastic limit','Drained and undrained state','Active and passive state'],'ULS: the soil must not fail in shear. SLS: settlement must not harm the structure or its function.',['F','sL'])
Q('S-W1-24',1,'modes','concept','lecture',1,1,'Raft foundations are chosen over separate footings mainly when',
  ['the soil bearing capacity is low or the columns are so close that footings would overlap','the soil is very dense rock','the water table is deep','the load is only vertical'],'A raft spreads load, lowers contact pressure and reduces differential settlement on weak or variable soil.',[])
Q('S-W1-25',1,'terms','concept','lecture',2,1,'The bearing capacity factors N<sub>q</sub>, N<sub>c</sub> and N<sub>γ</sub> increase rapidly with φ. When φ increases from 30° to 40° (Hansen), N<sub>q</sub> roughly',
  ['multiplies by about 3.5 (18 to 64)','stays within 10 %','doubles (18 to 36)','multiplies by about 10'],'N<sub>q</sub> = 18.4 at 30° and 64.2 at 40°; N<sub>γ</sub> rises even faster (18 to 95). Small errors in φ change q<sub>f</sub> a lot.',['Nc,Nq,Nγ',"c', φ'"])

# ============================================================== SHALLOW · WEEK 2 ==============================================================
Q('S-W2-01',2,'spt','concept','lecture',3,1,'In the standard penetration test the blow count N is the number of blows for the',
  ['last two 150 mm increments (300 mm) of a 450 mm drive','first 150 mm only','whole 450 mm drive','last 150 mm only'],'The first 150 mm is seating; N is the sum of the second and third 150 mm. The hammer is 63.5 kg dropped 760 mm.',['N'])
ER,Nm=75,20; N60=Nm*ER/60
Q('S-W2-02',2,'spt','calc','lecture',2,2,f'A SPT with an energy ratio of {ER} % gives N = {Nm}. Corrected to the standard 60 % energy, N<sub>60</sub> is',
  [f(N60,0), f(Nm*60/ER,0), f(Nm,0), f(Nm*ER/100,0)],f'N<sub>60</sub> = N·ER/60 = {Nm}·{ER}/60 = {f(N60,0)}.',['N','N60','ER'])
Q('S-W2-03',2,'spt','concept','lecture',3,1,'The overburden correction factor C<sub>N</sub> is larger for a test at',
  ['shallow depth (low effective stress)','great depth (high effective stress)','a depth just below the water table only','the same value at all depths'],'High confining stress inflates N, so deep tests are scaled down; C<sub>N</sub> falls as σ′ rises and exceeds 1 near the surface.',['CN',"σ'v,σ'h"])
Q('S-W2-04',2,'spt','concept','lecture',3,1,'The dilatancy correction N′ = 15 + ½(N<sub>1</sub> − 15) is applied',
  ['to fine or silty sand below the water table when N<sub>1</sub> > 15','to clean gravel above the water table','to clay at any depth','to every SPT test'],'In saturated fine sand the pore pressure cannot dissipate in the blow, so counts above 15 read too high and are reduced.',['N1'],'w2q2')
N1x=25
Q('S-W2-05',2,'spt','calc','lecture',3,2,f'Fine saturated sand below the water table gives N<sub>1</sub> = {N1x} after the overburden correction. The dilatancy-corrected count is',
  [f(15+0.5*(N1x-15),0), f(N1x,0), f(0.5*N1x,0), f(N1x+0.5*(N1x-15),0)],f'N′ = 15 + ½({N1x} − 15) = {f(15+0.5*(N1x-15),0)}.',['N1'],'w2q2')
Q('S-W2-06',2,'spt','concept','lecture',2,1,'The order of the corrections in tutorial 2 Q2 is',
  ['energy to N<sub>60</sub>, then overburden (C<sub>N</sub>), then dilatancy if N<sub>1</sub> > 15','dilatancy, then overburden, then energy','overburden, then energy, then dilatancy','dilatancy only'],'Each step uses the result of the one before; dilatancy needs the overburden-corrected N<sub>1</sub>.',['N60','CN','N1'],'w2q2')
Q('S-W2-07',2,'allow','calc','lecture',3,2,'A square footing B = 2 m at D = 1 m; the water table is 1.5 m below the surface. The water table correction C<sub>w</sub> = 0.5 + 0.5D<sub>w</sub>/(D + B) is',
  ['0.75','0.5','0.88','1.0'],'C<sub>w</sub> = 0.5 + 0.5·1.5/(1 + 2) = 0.75.',['Cw','Dw'],'w2q1')
Q('S-W2-08',2,'allow','concept','exam',3,1,'The water table correction on allowable bearing pressure is 0.5 when the water table is',
  ['at the ground surface (or at the base for a surface footing)','at a depth B below the base','at 2B below the base','well below the base'],'C<sub>w</sub> falls linearly from 1 (water table ≥ B below the base) to 0.5 (at the ground level). In the 2026 paper Q4 the base is the surface.',['Cw'])
Bpl=0.3; Bf=1.5; Spl=8; rat=(2*Bf/(Bf+Bpl))**2
Q('S-W2-09',2,'allow','calc','tutorial',3,2,f'A plate load test (0.3 m plate) on sand settles {Spl} mm at a given pressure. A {Bf} m square footing at that pressure settles about',
  [f(Spl*rat,1), f(Spl*Bf/Bpl,0), f(Spl,0), f(Spl*(Bf/Bpl)**2,0)],f'Sand: s = s<sub>p</sub>[2B/(B + B<sub>p</sub>)]² = {Spl}·{f(rat,2)} = {f(Spl*rat,1)} mm. A direct ratio of widths ({Spl*Bf/Bpl:.0f} mm) is the clay rule, not the sand rule.',['splate,sfooting','Bf, Bp'],'w2q3')
Q('S-W2-10',2,'allow','calc','tutorial',2,2,'A plate load test (0.305 m plate) on <b>clay</b> settles 6 mm under a given pressure. The settlement of a 1.525 m wide footing at that pressure is about',
  ['30 mm','6 mm','150 mm','18 mm'],'In clay the settlement scales with width: s = s<sub>p</sub>·B/B<sub>p</sub> = 6 × 1.525/0.305 = 30 mm.',['splate,sfooting'],'w2q3')
Q('S-W2-11',2,'allow','concept','lecture',2,1,'A plate load test can give a misleading result because',
  ['the plate stresses only a shallow zone (about 2B<sub>p</sub>) and misses weak layers deeper down','plates are always too heavy','the water table has no effect on it','it measures only shear strength'],'A 0.3 m plate loads a zone about 0.6 m deep; the real footing stresses a much deeper zone, so a weak layer below goes unseen.',['Bf, Bp'])
Q('S-W2-12',2,'allow','concept','exam',3,1,'The allowable bearing pressure of a foundation depends on',
  ['both the ultimate bearing capacity and the allowable settlement: the smaller of the two controls','allowable settlement only','ultimate capacity only','neither; it is fixed by the code'],'q<sub>a</sub> is the lesser of q<sub>nf</sub>/F and the pressure that keeps settlement within the limit. On sand the settlement limit usually governs.',['qa','sL'])
Q('S-W2-13',2,'spt','concept','lecture',2,1,'The standard CPT uses a cone with',
  ['60° apex, 1000 mm² end area, pushed at 20 mm/s','30° apex, 1000 mm² end area, pushed at 2 mm/s','60° apex, 100 mm² area, hammered in','90° apex, 5000 mm² area, 20 mm/s'],'Standard cone: diameter 35.7 mm, 10 cm² end area, 60° tip, 20 mm/s; it measures q<sub>c</sub>, f<sub>s</sub> and u.',['qc','fs','uw'])
Q('S-W2-14',2,'spt','calc','lecture',2,2,'Using q<sub>c</sub> (MN/m²) = 0.4N (Meyerhof 1956), a layer with N = 15 has a cone resistance of about',
  ['6 MPa','37.5 MPa','0.4 MPa','15 MPa'],'q<sub>c</sub> = 0.4 × 15 = 6 MN/m².',['qc','N'])
Q('S-W2-15',2,'spt','concept','lecture',2,1,'A limitation of the CPT, compared with the SPT, is that',
  ['it cannot penetrate gravels or cobbles and gives no sample','it gives only isolated values with depth','it depends strongly on the operator','it needs a borehole'],'CPT gives continuous, repeatable profiles without boring but cannot push through coarse gravel or cobbles, and takes no sample.',['qc'])
Q('S-W2-16',2,'allow','concept','lecture',2,1,'On sand, s = s<sub>p</sub>[2B/(B + B<sub>p</sub>)]². For a footing much wider than the plate (B ≫ B<sub>p</sub>) the ratio s/s<sub>p</sub> tends to',
  ['4, not to B/B<sub>p</sub>','B/B<sub>p</sub>','1','2'],'As B ≫ B<sub>p</sub>, 2B/(B + B<sub>p</sub>) → 2, so the ratio → 4: settlement grows with width on sand, but saturates at about 4 times the plate value.',['splate,sfooting'])

# ============================================================== SHALLOW · WEEK 3 ==============================================================
Q('S-W3-01',3,'elastic','concept','lecture',2,1,'Coarse-grained soils settle mainly by',
  ['immediate (elastic) compression','primary consolidation','secondary compression','swelling'],'Their permeability is high, so pore water drains at once; the settlement is essentially immediate.',[])
Q('S-W3-02',3,'elastic','calc','lecture',3,2,'A flexible footing: q = 100 kPa, B = 2 m, ν = 0.5, I<sub>f</sub> = 0.56, E = 20 MPa. s<sub>i</sub> = qB(1 − ν²)I<sub>f</sub>/E is about',
  ['4.2 mm','5.6 mm','7.0 mm','0.42 mm'],'s = 100·2·0.75·0.56/20 000 = 0.0042 m = 4.2 mm (E in kPa).',['si','E','μ','If'],'w3q2')
Q('S-W3-03',3,'elastic','concept','lecture',2,1,'In Burland\'s s<sub>i</sub> = μ<sub>0</sub>μ<sub>1</sub>qB/E<sub>u</sub>',
  ['μ₀ allows for the depth of embedment and μ₁ for the layer thickness and shape of the loaded area','μ₀ allows for the layer thickness and μ₁ for the embedment depth','both are Poisson ratios','both depend only on E<sub>u</sub>'],'μ<sub>0</sub> depends on D/B (embedment); μ<sub>1</sub> on H/B and L/B.',['μ0, μ1','Eu'],'w3q1')
Q('S-W3-04',3,'elastic','concept','lecture',2,1,'For a layered clay, the immediate settlement is found by superposition. The usual pattern is',
  ['s = s₁(upper, E₁) + s₂(both layers, E₂) − s₃(upper, E₂)','s = s₁ + s₂ + s₃','s = s₁ − s₂','the average of s₁ and s₂'],'Count the soft upper layer with its own E, add the whole stack with E₂, and remove the upper part counted twice (with E₂).',['si','Eu'],'w3q1')
Q('S-W3-05',3,'elastic','concept','lecture',1,1,'The mean settlement of a rigid foundation is commonly taken as about',
  ['0.8 times the centre settlement of the same flexible foundation','2 times the corner settlement','the corner settlement','1.2 times the centre settlement'],'The rigidity factor 0.8 reduces the flexible centre settlement to the mean value of a rigid footing.',[])
Q('S-W3-06',3,'consol','concept','lecture',3,1,'The three components of foundation settlement, in the order they develop, are',
  ['elastic (immediate), primary consolidation, secondary compression','primary, elastic, secondary','secondary, primary, elastic','elastic, secondary, primary'],'Elastic: on loading. Primary: as excess pore pressure dissipates. Secondary: creep after the pore pressure has gone.',['si','Sc','Ss'])
Q('S-W3-07',3,'voidr','concept','lecture',3,1,'The pre-consolidation pressure σ′<sub>pc</sub> is',
  ['the greatest vertical effective stress the soil has ever carried','the present effective overburden stress','the pore pressure at the clay mid-depth','the stress at which the clay fails'],'Below it the clay re-compresses stiffly (C<sub>r</sub>); beyond it, virgin compression (C<sub>c</sub>).',["σ'pc(σ'c)"])
Q('S-W3-08',3,'voidr','concept','lecture',3,1,'A clay with OCR < 1 is',
  ['under-consolidated, still consolidating under its present load','normally consolidated','over-consolidated','fully drained'],'OCR = σ′<sub>c</sub>/σ′<sub>0</sub>. OCR = 1 normally consolidated, > 1 over-consolidated, < 1 under-consolidated (σ′<sub>0</sub> > σ′<sub>c</sub>).',['OCR',"σ'0"])
Q('S-W3-09',3,'voidr','concept','exam',3,1,'The recompression index C<sub>r</sub> is compared with the compression index C<sub>c</sub> as',
  ['much smaller (the re-compression line is flat)','about equal','much larger','unrelated'],'The e–log σ′ curve is flat below p<sub>c</sub> (C<sub>r</sub>, often a fifth to a tenth of C<sub>c</sub>) and steeper beyond it.',['Cc','Cr'])
e1,s0,pc,sf,Cc3,Cr3=1.2,50,100,190,0.4,0.05; de=Cr3*log10(pc/s0)+Cc3*log10(sf/pc)
Q('S-W3-10',3,'voidr','calc','tutorial',3,2,f'A clay with C<sub>c</sub> = {Cc3} and C<sub>r</sub> = {Cr3} has e = {e1}, σ′<sub>0</sub> = {s0} kPa, p<sub>c</sub> = {pc} kPa and is loaded to {sf} kPa. The final void ratio is about',
  [f(e1-de,3), f(e1-Cc3*log10(sf/s0),3), f(e1-Cr3*log10(sf/s0),3), f(e1-Cc3*log10(sf/pc),3)],
  f'Re-compress to p<sub>c</sub> with C<sub>r</sub>: {f(Cr3*log10(pc/s0),4)}; then virgin to {sf}: {f(Cc3*log10(sf/pc),4)}. Δe = {f(de,3)}, e<sub>f</sub> = {f(e1-de,3)}.',['Cc','Cr','Δe','ef'],'w3q3b')
Q('S-W3-11',3,'voidr','calc','exam',3,2,'The initial and final void ratios in a consolidation test are 1.0 and 0.5. The sample was 2.4 cm thick at the start. Its final thickness is',
  ['1.8 cm','1.2 cm','1.3 cm','2.2 cm'],'The solids height is constant: H ∝ (1 + e). H<sub>f</sub> = 2.4·1.5/2.0 = 1.8 cm.',['e,e0,e1,ep,ef','H'])
w_,Gs_=0.4,2.7
Q('S-W3-12',3,'consol','calc','lecture',3,2,f'A saturated clay has w = {w_*100:.0f} % and G<sub>s</sub> = {Gs_}. Its void ratio is',
  [f(w_*Gs_,2), f(w_/Gs_,2), f(Gs_*(1+w_),2), f(w_*Gs_/(1+w_*Gs_),2)],f'S = 1: e = wG<sub>s</sub> = {w_}·{Gs_} = {f(w_*Gs_,2)}.',['Gs','e,e0,e1,ep,ef','w'] if False else ['Gs','e,e0,e1,ep,ef'])
wL=60
Q('S-W3-13',3,'consol','calc','lecture',2,2,f'Terzaghi and Peck estimate C<sub>c</sub> = 0.009(w<sub>L</sub> − 10) for undisturbed clay. For w<sub>L</sub> = {wL} %, C<sub>c</sub> is',
  [f(0.009*(wL-10),2), f(0.007*(wL-10),2), f(0.009*wL,2), f(0.09*(wL-10),2)],f'C<sub>c</sub> = 0.009·{wL-10} = {f(0.009*(wL-10),2)} (0.007 is the remoulded relation).',['Cc','wL'],'w3q4')
Cc4,H4,e04,s04,sf4=0.3,4,1.0,100,200; Sc4=Cc4*H4/(1+e04)*log10(sf4/s04)
Q('S-W3-14',3,'consol','calc','tutorial',3,2,f'A normally consolidated clay layer {H4} m thick: C<sub>c</sub> = {Cc4}, e<sub>0</sub> = {e04}. The effective stress at mid-depth rises from {s04} to {sf4} kPa. The consolidation settlement is about',
  [f(Sc4*1000,0)+' mm', f(Cc4*H4*log10(sf4/s04)*1000,0)+' mm', f(Cc4*H4/(1+e04)*(sf4-s04)/s04*1000,0)+' mm', f(Cc4*H4/(1+e04)*log10(sf4/s04)*100,0)+' mm'],
  f'S<sub>c</sub> = C<sub>c</sub>H/(1 + e<sub>0</sub>)·log(σ′<sub>f</sub>/σ′<sub>0</sub>) = {Cc4}·{H4}/2·0.301 = {f(Sc4,3)} m = {f(Sc4*1000,0)} mm.',['Sc','Cc','e,e0,e1,ep,ef',"σ'0","σ'f"],'w3q4')
Cr5,Cc5,e05,H5,s05,pc5,sf5=0.05,0.4,0.9,2,50,100,200; Sc5=H5/(1+e05)*(Cr5*log10(pc5/s05)+Cc5*log10(sf5/pc5))
Q('S-W3-15',3,'consol','calc','tutorial',3,2,f'An over-consolidated clay, H = {H5} m, e<sub>0</sub> = {e05}, C<sub>r</sub> = {Cr5}, C<sub>c</sub> = {Cc5}, σ′<sub>0</sub> = {s05} kPa, p<sub>c</sub> = {pc5} kPa, σ′<sub>f</sub> = {sf5} kPa. The settlement is about',
  [f(Sc5*1000,0)+' mm', f(H5/(1+e05)*Cc5*log10(sf5/s05)*1000,0)+' mm', f(H5/(1+e05)*Cr5*log10(sf5/s05)*1000,0)+' mm', f(H5/(1+e05)*Cc5*log10(sf5/pc5)*1000,0)+' mm'],
  f'Two parts: C<sub>r</sub>log(p<sub>c</sub>/σ′<sub>0</sub>) = {f(Cr5*log10(pc5/s05),4)} and C<sub>c</sub>log(σ′<sub>f</sub>/p<sub>c</sub>) = {f(Cc5*log10(sf5/pc5),4)}; S<sub>c</sub> = H/(1 + e<sub>0</sub>)·sum = {f(Sc5*1000,0)} mm.',['Sc','Cc','Cr',"σ'pc(σ'c)"],'w3q5')
Q('S-W3-16',3,'consol','calc','exam',3,2,'A normally consolidated, saturated silty clay 1 m thick, specific gravity 2.7, w = 45 %, C<sub>c</sub> = 0.45, σ′<sub>0</sub> = 100 kPa, Δσ = 20 kPa. The primary settlement is',
  ['16 mm','2 mm','9 mm','14 mm'],'e<sub>0</sub> = wG<sub>s</sub> = 1.215; S = 0.45·1/(2.215)·log(120/100) = 16 mm. (Using C<sub>r</sub> instead of C<sub>c</sub> would give about 2 mm.)',['Sc','Cc','OCR'])
mv6,ds6,H6=0.4,80,5
Q('S-W3-17',3,'consol','calc','exam',3,2,f'The coefficient of volume compressibility of a clay is m<sub>v</sub> = {mv6} m²/MN. A {H6} m layer takes an effective stress increase of {ds6} kPa. The settlement is',
  [f(mv6*1e-3*ds6*H6*1000,0)+' mm', f(mv6*ds6*H6*1000,0)+' mm', f(mv6*1e-3*ds6*H6*100,0)+' mm', f(mv6*1e-3*ds6*H6*1000/2,0)+' mm'],
  f'S = m<sub>v</sub>Δσ′H. Convert m<sub>v</sub> to m²/kN: {mv6}/1000 = 0.0004. S = 0.0004·{ds6}·{H6} = {f(mv6*1e-3*ds6*H6,2)} m = {f(mv6*1e-3*ds6*H6*1000,0)} mm. The unit change is the trap.',['mv','Sc'],'ex26q2')
Q('S-W3-18',3,'consol','calc','exam',3,2,'The water table in a thick sand over a 5 m clay layer is lowered 4 m by pumping; total stress at the clay does not change. γ<sub>w</sub> = 9.81 kN/m³. The effective stress in the clay rises by about',
  ['39 kPa','4 kPa','0 kPa (the water table does not matter)','78 kPa'],'The pore pressure falls by γ<sub>w</sub>Δh = 39.2 kPa; with total stress unchanged, σ′ rises by the same.',['Δσ','Δu','mv'],'ex26q2')
Q('S-W3-19',3,'consol','concept','lecture',2,1,'Clay settles when it is dewatered (for example by groundwater pumping) because',
  ['the effective stress on the clay increases','the clay swells','the total stress decreases','the grain size changes'],'Lower pore pressure means higher effective stress, which compresses the clay.',["σ'v,σ'h",'Δu'])
Q('S-W3-20',3,'voidr','concept','exam',3,1,'On an e–log σ′<sub>v</sub> plot the slope of the straight virgin line is',
  ['the compression index C<sub>c</sub>','the coefficient of consolidation c<sub>v</sub>','the coefficient of permeability k','the coefficient of volume compressibility m<sub>v</sub>'],'C<sub>c</sub> = −Δe/Δlog σ′. The others are not slopes of that plot.',['Cc'])
Q('S-W3-21',3,'voidr','concept','lecture',2,1,'Estimating σ′<sub>pc</sub> from an oedometer curve is most affected by',
  ['sample disturbance, which rounds the curve and lowers the apparent p<sub>c</sub>','the water table','the footing width','the time of loading'],'Disturbed samples give a rounded e–log σ′ curve, and p<sub>c</sub> is hard to read; a systematic error towards a low value.',["σ'pc(σ'c)"])

# ============================================================== SHALLOW · WEEK 4 ==============================================================
Q('S-W4-01',4,'stress','concept','lecture',2,1,'The vertical stress under a point load Q at depth z and radial distance r is σ<sub>z</sub> = I<sub>p</sub>Q/z². I<sub>p</sub> is largest',
  ['directly under the load (r = 0), where I<sub>p</sub> = 3/(2π) ≈ 0.48','at r = z','at r = 2z','at the depth z = 0 and any r'],'Boussinesq: I<sub>p</sub> = 3/(2π)·[1/(1 + (r/z)²)]<sup>5/2</sup>, maximum 0.477 at r = 0.',['σz','Ip','Q'])
Q('S-W4-02',4,'stress','calc','lecture',2,2,'A point load of 500 kN acts on the surface of an elastic half-space. The vertical stress directly below it at 2 m depth (I<sub>p</sub> = 0.478) is about',
  ['60 kPa','120 kPa','250 kPa','30 kPa'],'σ<sub>z</sub> = 0.478·500/2² = 59.7 kPa.',['σz','Ip','Q'])
Q('S-W4-03',4,'stress','concept','lecture',3,1,'The influence-factor chart for a rectangular area (m = B/z, n = L/z) gives the stress',
  ['under a <b>corner</b> of the loaded rectangle','under the centre of the rectangle','under any point, without superposition','at the edge mid-point only'],'Fadum\'s I<sub>σ</sub> is for the corner. For other points divide the area into rectangles that share the point as a corner.',['Iσ','m, n','σz'],'w4q1')
Q('S-W4-04',4,'stress','calc','lecture',3,2,'A 4 × 4 m square carries q = 100 kPa. Using I<sub>σ</sub> = 0.175 for m = n = 1, the vertical stress at 2 m depth under its <b>centre</b> is about',
  ['70 kPa','17.5 kPa','35 kPa','140 kPa'],'Split into four 2 × 2 squares with a corner at the centre; m = n = 2/2 = 1, I<sub>σ</sub> = 0.175 each. σ<sub>z</sub> = 4·0.175·100 = 70 kPa.',['Iσ','m, n','σz'])
Q('S-W4-05',4,'stress','concept','tutorial',3,1,'To find the stress at a point A outside the loaded rectangle, with A on the centre line 1.5 m outside a long edge, the working uses',
  ['two large rectangles (A to the far edge) minus two small rectangles (A to the near edge)','one rectangle with the largest m','the stress at the centre times 0.5','the point-load formula for the whole area'],'Rectangles sharing corner A: large ones (loaded + gap) minus the small ones (gap only), doubled by symmetry. σ<sub>z</sub> = 2q(I<sub>1</sub> − I<sub>2</sub>).',['Iσ','σz'],'w4q1')
Q('S-W4-06',4,'consol','concept','lecture',2,1,'In the Skempton–Bjerrum method, s<sub>c</sub> = μ s<sub>oed</sub> with μ = A + α(1 − A). The factor μ corrects for',
  ['lateral strain in the field, which the oedometer test prevents','secondary compression','the water table','rigid base effects'],'The oedometer has zero lateral strain; in the field the initial pore pressure depends on A, and μ (about 0.5 to 1) adjusts s<sub>oed</sub>.',['sc','μs','A'])
Q('S-W4-07',4,'time','concept','lecture',2,1,'Which is <b>not</b> an assumption of Terzaghi\'s one-dimensional consolidation theory?',
  ['The soil is partly saturated','The soil is homogeneous and saturated','Darcy\'s law is valid and flow is one-dimensional','Water and solid particles are incompressible'],'The theory needs a saturated soil; the others are standard assumptions.',['cv','k'])
Q('S-W4-08',4,'time','concept','exam',3,1,'Increasing the permeability of a clay, others unchanged,',
  ['raises c<sub>v</sub> = k/(γ<sub>w</sub>m<sub>v</sub>) and shortens the time to consolidate','lowers c<sub>v</sub>','does not change c<sub>v</sub>','lengthens the time to consolidate'],'c<sub>v</sub> = k/(γ<sub>w</sub>m<sub>v</sub>); t = T<sub>v</sub>H²/c<sub>v</sub>. Higher k, higher c<sub>v</sub>, shorter t. The stress increase does not enter c<sub>v</sub> or T<sub>v</sub>.',['cv','k','mv','t'])
Q('S-W4-09',4,'time','concept','lecture',3,1,'The time factor is',
  ['T<sub>v</sub> = c<sub>v</sub>t/H<sub>dr</sub>², with H<sub>dr</sub> the longest drainage path','T<sub>v</sub> = c<sub>v</sub>t/H','T<sub>v</sub> = c<sub>v</sub>H²/t','T<sub>v</sub> = k t/H²'],'H<sub>dr</sub> is H for single drainage, H/2 for drainage at top and bottom.',['Tv','cv','Hdr','t'])
Q('S-W4-10',4,'time','calc','lecture',3,2,'For U < 60 % the time factor is T<sub>v</sub> = (π/4)U². At U = 50 %, T<sub>v</sub> is about',
  ['0.196','0.5','0.785','0.098'],'(π/4)·0.5² = 0.196 (the exact T<sub>50</sub> is 0.197).',['Tv','U'])
Q('S-W4-11',4,'time','calc','lecture',2,2,'For U > 60 %, T<sub>v</sub> = 1.781 − 0.933 log(100 − U%). At U = 90 %, T<sub>v</sub> is',
  ['0.848','0.636','1.781','0.933'],'1.781 − 0.933·log 10 = 1.781 − 0.933 = 0.848.',['Tv','U'])
Q('S-W4-12',4,'time','calc','tutorial',3,2,'A 2 cm clay sample with double drainage reaches 50 % consolidation in 5 min. A field layer of the same clay, 2 m thick with double drainage, will take',
  ['50 000 min (about 35 days)','500 min','5 000 min','500 000 min'],'t ∝ H<sub>dr</sub>²; the thickness ratio is 200/2 = 100; t = 5·100² = 50 000 min ≈ 34.7 days.',['t','Hdr','d'],'w4q4')
Q('S-W4-13',4,'time','calc','exam',3,2,'The same clay layer is first drained at the top and bottom, then at the top only. The time to reach the same U becomes',
  ['4 times longer','2 times longer','2 times shorter','unchanged'],'H<sub>dr</sub> doubles when one drain is removed; t ∝ H<sub>dr</sub>².',['Hdr','t'])
Q('S-W4-14',4,'time','calc','lecture',2,2,'A 2 cm sample with double drainage reaches 50 % in 10 min (T<sub>50</sub> = 0.197). The coefficient of consolidation is',
  ['3.3 × 10⁻⁴ cm²/s','3.3 × 10⁻³ cm²/s','1.97 × 10⁻² cm²/s','6.6 × 10⁻⁴ cm²/s'],'H<sub>dr</sub> = 1 cm; c<sub>v</sub> = 0.197·1²/600 s = 3.28 × 10⁻⁴ cm²/s. (Using 2 cm as the path gives four times more.)',['cv','t50,t90','Hdr'])
Q('S-W4-15',4,'time','calc','tutorial',3,2,'A clay is 11.43 cm settled at 4 years from mid-loading (ultimate 35.565 cm). At 9 years from the same datum, assuming U < 60 %, it will have settled',
  ['17.1 cm','25.7 cm','12.9 cm','35.6 cm'],'U ∝ √t: 11.43·√(9/4) = 17.14 cm; U at 4 years is 32 %, below 60 %.',['t','U','sult'],'w4q3')
Q('S-W4-16',4,'time','concept','lecture',2,1,'In Taylor\'s square-root-of-time method the 90 % point is found by drawing a line whose abscissa is',
  ['1.15 times that of the initial straight line','0.5 times that of the initial straight line','2 times that of the initial straight line','1.15 times the final settlement'],'Line d<sub>0</sub>B with d<sub>0</sub>B = 1.15·d<sub>0</sub>A meets the curve at √t<sub>90</sub>, and T<sub>90</sub> = 0.848.',['cv','t50,t90'])
Q('S-W4-17',4,'time','concept','lecture',2,1,'Vertical drains (PVDs) speed consolidation because they',
  ['shorten the drainage path and make the flow horizontal','increase the load','reduce the compressibility of the soil','lower the water table'],'The drainage distance becomes half the drain spacing, orders of magnitude shorter than the layer thickness, and t ∝ d².',['Hdr','cv'])
Q('S-W4-18',4,'time','concept','exam',3,1,'More compressible clay (higher m<sub>v</sub>), other properties equal, has',
  ['a lower c<sub>v</sub> and consolidates more slowly','a higher c<sub>v</sub>','the same c<sub>v</sub>','no consolidation'],'c<sub>v</sub> = k/(γ<sub>w</sub>m<sub>v</sub>): a more compressible clay has more water to expel for the same permeability, so t = T<sub>v</sub>H²/c<sub>v</sub> grows.',['cv','mv'])

# ============================================================== SHALLOW · WEEK 5 ==============================================================
Q('S-W5-01',5,'secondary','concept','lecture',3,1,'Secondary compression is',
  ['settlement that continues after the excess pore pressure has dissipated, linear in log time','settlement under the first load increment only','the elastic rebound after unloading','settlement caused by the water table dropping'],'S<sub>s</sub> = C<sub>α</sub>H log(t/t<sub>p</sub>)/(1 + e<sub>p</sub>) after primary is complete.',['Ss','Cα','tp'],'w5q1')
Cae,Hs,tp,t_=0.01,8,1,10
Q('S-W5-02',5,'secondary','calc','lecture',3,2,f'A clay layer {Hs} m thick has C<sub>αε</sub> = {Cae*100:.0f} % (strain per log cycle) and primary consolidation ends at t<sub>p</sub> = {tp} yr. The secondary compression by t = {t_} yr is',
  [f(Cae*Hs*log10(t_/tp)*1000,0)+' mm', f(Cae*Hs*(t_-tp)*1000,0)+' mm', f(Cae*Hs*log10(t_/tp)*100,0)+' mm', f(Cae*Hs*1000/2,0)+' mm'],
  f'S<sub>s</sub> = C<sub>αε</sub>H log(t/t<sub>p</sub>) = 0.01·{Hs}·log 10 = 0.08 m = 80 mm. One log cycle gives C<sub>αε</sub>H.',['Ss','Cαe','tp'],'w5q1')
Q('S-W5-03',5,'secondary','concept','lecture',2,1,'The secondary compression index C<sub>αε</sub> relates to C<sub>α</sub> by',
  ['C<sub>αε</sub> = C<sub>α</sub>/(1 + e<sub>p</sub>)','C<sub>αε</sub> = C<sub>α</sub>(1 + e<sub>p</sub>)','C<sub>αε</sub> = C<sub>α</sub>/C<sub>c</sub>','C<sub>αε</sub> = C<sub>α</sub>·log e<sub>p</sub>'],'C<sub>α</sub> is Δe per log cycle; dividing by 1 + e<sub>p</sub> turns it into strain per log cycle.',['Cα','Cαe','e,e0,e1,ep,ef'])
Q('S-W5-04',5,'secondary','concept','external',1,1,'For a normally consolidated clay, the ratio C<sub>α</sub>/C<sub>c</sub> is roughly constant: about',
  ['0.04 for inorganic clays and a little more for organic soils','1.0','0.4 for all soils','0.0004'],'Mesri and co-workers found C<sub>α</sub>/C<sub>c</sub> ≈ 0.04 ± 0.01 for inorganic clays and silts and ≈ 0.05 for organic ones (external; not in the lecture).',['Cα','Cc'])
qa5=lambda N,B,s=25: s*N/2.24*((B+0.33)/B)**2
Q('S-W5-05',5,'cpt','calc','lecture',2,2,'Meyerhof (1965), B > 1.25 m: s<sub>L</sub> = (q<sub>a</sub>·2.24/N)[B/(B + 0.33)]². For N = 15, B = 2 m, s<sub>L</sub> = 25 mm, q<sub>a</sub> is about',
  [f(qa5(15,2),0)+' kPa', f(25*15/2.24,0)+' kPa', f(qa5(15,2)/2,0)+' kPa', f(qa5(15,2)*2,0)+' kPa'],f'q<sub>a</sub> = s<sub>L</sub>N/2.24·[(B + 0.33)/B]² = 167.4·1.357 = {f(qa5(15,2),0)} kPa.',['qa','sL','N'],'w5q2')
Q('S-W5-06',5,'cpt','concept','lecture',3,1,'In Schmertmann\'s method, for a square footing the modulus of each layer is estimated as',
  ['E = 2.5q<sub>c</sub> (3.5q<sub>c</sub> for a long strip)','E = 0.4q<sub>c</sub>','E = 10q<sub>c</sub>','E = N'],'The lecture gives E = 2.5q<sub>c</sub> for L/B = 1 and 3.5q<sub>c</sub> for L/B ≥ 10.',['E','qc','Iz'],'w5q3')
Q('S-W5-07',5,'cpt','concept','external',2,1,'For a <b>square</b> footing the strain influence factor I<sub>z</sub> is',
  ['0.1 at the base, peak I<sub>zp</sub> at B/2 below it, zero at 2B','0 at the base, peak at 2B, 0.1 at depth','constant with depth','peak at the base, zero at B/2'],'Schmertmann\'s triangle: 0.1 at z = 0, peak at z = B/2, zero at z = 2B (strip: peak at B, zero at 4B).',['Iz','Izp'])
Q('S-W5-08',5,'cpt','calc','lecture',3,2,'The peak strain influence factor I<sub>zp</sub> = 0.5 + 0.1√(q<sub>n</sub>/σ′<sub>vp</sub>). For q<sub>n</sub> = 150 kPa and σ′<sub>vp</sub> = 37.5 kPa it is',
  ['0.70','0.40','0.60','0.80'],'√(150/37.5) = 2; I<sub>zp</sub> = 0.5 + 0.2 = 0.70. σ′<sub>vp</sub> is at the depth of the peak (B/2 below the base).',['Izp','qn',"σ'vp"],'w5q3')
Q('S-W5-07b',5,'cpt','calc','lecture',3,2,'The depth correction is C<sub>1</sub> = 1 − 0.5σ′<sub>v0</sub>/q<sub>n</sub>. For σ′<sub>v0</sub> = 20 kPa and q<sub>n</sub> = 100 kPa, C<sub>1</sub> is',
  ['0.90','0.80','0.95','1.10'],'1 − 0.5·20/100 = 0.90. Deeper footings are stiffer: less settlement.',['C1, C2',"σ'v0",'qn'],'w5q3')
Q('S-W5-09',5,'cpt','calc','lecture',2,2,'The creep factor C<sub>2</sub> = 1 + 0.2 log(t/0.1), t in years. For t = 10 years it is',
  ['1.4','1.2','2.0','1.0'],'1 + 0.2·log(100) = 1.4. With no time given, C<sub>2</sub> = 1.',['C1, C2','t'])
Q('S-W5-10',5,'cpt','calc','lecture',3,2,'One layer 2 m thick with q<sub>c</sub> = 4 MPa, mid-layer I<sub>z</sub> = 0.5, q<sub>n</sub> = 100 kPa, C<sub>1</sub> = C<sub>2</sub> = 1 (square footing, E = 2.5q<sub>c</sub>). The settlement is',
  ['10 mm','2 mm','25 mm','100 mm'],'s = qn·I<sub>z</sub>Δz/E = 100 kPa·0.5·2 m/10 MPa = 10 mm (kPa·m/MPa gives mm).',['Iz','E','qc','qn'],'w5q3')

# ============================================================== DEEP · WEEK 7 ==============================================================
Q('D-W7-01',7,'pile-concept','concept','lecture',3,1,'The static equilibrium of a pile at failure gives',
  ['P<sub>u</sub> = P<sub>s</sub> + P<sub>b</sub> − W','P<sub>u</sub> = P<sub>s</sub> − P<sub>b</sub> + W','P<sub>u</sub> = P<sub>s</sub> + P<sub>b</sub> + W','P<sub>u</sub> = P<sub>b</sub> − P<sub>s</sub>'],'Downward: P<sub>u</sub> and the pile weight W. Upward: shaft resistance P<sub>s</sub> and base resistance P<sub>b</sub>. So P<sub>u</sub> = P<sub>s</sub> + P<sub>b</sub> − W.',['Pu','Ps','Pb','W'])
Q('D-W7-02',7,'pile-concept','concept','lecture',3,1,'If the pile weight is assumed equal to the overburden removed (W = p<sub>o</sub>A<sub>b</sub>), the capacity becomes',
  ['P<sub>u</sub> = f<sub>s</sub>A<sub>s</sub> + f<sub>b</sub>A<sub>b</sub>','P<sub>u</sub> = f<sub>s</sub>A<sub>s</sub> + (f<sub>b</sub> + p<sub>o</sub>)A<sub>b</sub>','P<sub>u</sub> = f<sub>b</sub>A<sub>b</sub> only','P<sub>u</sub> = f<sub>s</sub>A<sub>s</sub> − f<sub>b</sub>A<sub>b</sub>'],'The p<sub>o</sub>A<sub>b</sub> in the base term cancels the −W term, leaving the shaft and the net base resistance.',['Pu','fs','fb','po'])
Q('D-W7-03',7,'pile-concept','concept','lecture',2,1,'A driven precast concrete pile is classified as a',
  ['displacement pile','non-displacement pile','small-displacement pile only if hollow','replacement pile'],'Driving pushes soil aside (large displacement). Bored cast-in-place piles remove soil first (non-displacement); H-piles and screw piles are small-displacement.',[])
Q('D-W7-04',7,'pile-concept','concept','lecture',2,1,'A pile that carries its load mainly by friction along the shaft, with little at the base, is called',
  ['a floating (friction) pile','an end-bearing pile','a sheet pile','a soil-compactor pile'],'End-bearing piles transfer load to a hard stratum at the base; floating piles use shaft and base within a soft deposit.',['Ps','Pb'])
Q('D-W7-05',7,'pile-concept','concept','lecture',2,1,'Reasons to choose piles over shallow foundations include',
  ['very large loads, weak or compressible soil near the surface, scour, or a high water table','a deep, dense, uniform sand at the surface','low column loads on a thick gravel','absence of any construction constraint'],'Piles carry load to deeper stiff strata or by skin friction, bypassing weak near-surface soil.',[])
Q('D-W7-06',7,'pile-concept','concept','lecture',2,1,'In pile design the two calculations that must both be checked are',
  ['bearing capacity (strength) and settlement (serviceability)','lateral load and torsion','corrosion and fire','scour and heave'],'As for shallow foundations: ultimate and serviceability limit states.',['Pu','S (settlement)'])
Q('D-W7-07',7,'pile-clay','concept','lecture',3,1,'For a pile in clay under undrained loading the unit shaft friction is',
  ['f<sub>s</sub> = αc<sub>u</sub>, with α ≤ 1 depending on c<sub>u</sub>, pile type and installation','f<sub>s</sub> = Kσ′<sub>v</sub>tanδ','f<sub>s</sub> = 2N̄','f<sub>s</sub> = N<sub>c</sub>c<sub>u</sub>'],'Adhesion c<sub>a</sub> = αc<sub>u</sub> (α from the AS 2159 chart: 1.0 at low c<sub>u</sub>, falling at high c<sub>u</sub>). Kσ′tanδ is the sand expression, 2N̄ the Meyerhof sand relation.',['fs','α','cu','ca'])
Q('D-W7-08',7,'pile-clay','concept','lecture',3,1,'The base resistance of a long pile (L/D ≥ 4) in clay is f<sub>b</sub> =',
  ['9c<sub>u</sub>, with c<sub>u</sub> averaged over about 2D below the base','5.14c<sub>u</sub>','c<sub>u</sub>','9c<sub>u</sub> with c<sub>u</sub> at the ground surface'],'Skempton: N<sub>c</sub> = 9 for L/D ≥ 4 (chart below that). The base acts like a deep footing, so the strength 2D below the base counts.',['fb','Nc','cu,ave'])
Dp,Lp,cu7,al7=0.6,10,50,0.88; Ps7=al7*cu7*pi*Dp*Lp; Pb7=9*cu7*pi*Dp**2/4; Pu7=Ps7+Pb7
Q('D-W7-09',7,'pile-clay','calc','lecture',3,3,f'A {Dp} m diameter pile, {Lp} m long, in uniform clay with c<sub>u</sub> = {cu7} kPa (α = {al7} for this c<sub>u</sub>), N<sub>c</sub> = 9. Neglect the pile weight and overburden at the base. P<sub>u</sub> is about',
  [f(Pu7,0)+' kN', f(cu7*pi*Dp*Lp+Pb7,0)+' kN', f(Ps7,0)+' kN', f(Ps7+9*cu7*Dp*Dp,0)+' kN'],
  f'P<sub>s</sub> = αc<sub>u</sub>πDL = {al7}·{cu7}·π·{Dp}·{Lp} = {f(Ps7,0)} kN; P<sub>b</sub> = 9c<sub>u</sub>πD²/4 = {f(Pb7,0)} kN; P<sub>u</sub> = {f(Pu7,0)} kN.',['Pu','Ps','Pb','As','Ab'])
Q('D-W7-10',7,'pile-clay','calc','lecture',3,2,'A pile shaft crosses two clay layers of 4 m (c<sub>u</sub> = 30 kPa, α = 1) and 6 m (c<sub>u</sub> = 60 kPa, α = 0.8). D = 0.5 m. The shaft resistance is',
  ['1.13 MN (about 1131 kN)','0.85 MN','1.5 MN','1.9 MN'],'P<sub>s</sub> = Σα c<sub>u</sub>πDL = π·0.5·(1·30·4 + 0.8·60·6) = π·0.5·(120 + 288) = 641 kN... see below',['Ps','α','cu']) if False else None
Ps10=pi*0.5*(1*30*4+0.8*60*6)
Q('D-W7-10',7,'pile-clay','calc','lecture',3,2,'A pile shaft (D = 0.5 m) crosses two clay layers: 4 m with c<sub>u</sub> = 30 kPa (α = 1) and 6 m with c<sub>u</sub> = 60 kPa (α = 0.8). The shaft resistance is',
  [f(Ps10,0)+' kN', f(pi*0.5*(30*4+60*6),0)+' kN', f(pi*0.5*10*(30+60)/2,0)+' kN', f(pi*0.5*(1*30*4+0.8*60*6)*2,0)+' kN'],
  f'Layer by layer: P<sub>s</sub> = πD·Σα c<sub>u</sub>L = π·0.5·(30·4 + 0.8·60·6) = π·0.5·{30*4+0.8*60*6:.0f} = {f(Ps10,0)} kN. The week 7 slides mark the layered method for the test and exam.',['Ps','α','cu','ca'])
Q('D-W7-11',7,'pile-clay','concept','lecture',3,1,'The week 7 slides give three ways to find P<sub>s</sub> when c<sub>u</sub> varies with depth. The one marked for the test and exam is',
  ['dividing the shaft into layers, each with its average c<sub>u</sub> and α','one average c<sub>u</sub> and α for the whole shaft','a full integral of αc<sub>u</sub>πD dz','using c<sub>u</sub> at the base only'],'"Method 2 for test/exam": layers with their own average c<sub>u</sub> and α.',['cu,ave','α'])
Q('D-W7-12',7,'pile-clay','concept','lecture',2,1,'Why is the strength 2D below the base, not at the base, used for N<sub>c</sub>c<sub>u</sub>?',
  ['The failure zone beneath the base extends about 2D, so the soil there supports the pile','The pile is 2D long','c<sub>u</sub> is always constant over 2D','It is a safety factor of 2'],'Base resistance is a bearing capacity, mobilised in the soil in the failure zone below the base.',['cu,ave','D'])

# ============================================================== DEEP · WEEK 8 ==============================================================
Q('D-W8-01',8,'pile-sand','concept','lecture',3,1,'For a pile in sand (drained analysis) the unit shaft friction is',
  ['f<sub>s</sub> = Kσ′<sub>v</sub>tanδ','f<sub>s</sub> = αc<sub>u</sub>','f<sub>s</sub> = c<sub>u</sub>N<sub>c</sub>','f<sub>s</sub> = γ<sub>w</sub>z'],'Mohr–Coulomb at the interface: f<sub>s</sub> = c<sub>a</sub> + σ<sub>n</sub>tanδ with c<sub>a</sub> = 0 and σ<sub>n</sub> = σ′<sub>h</sub> = Kσ′<sub>v</sub>.',['fs','K',"σ'v",'δ'])
Q('D-W8-02',8,'pile-sand','concept','lecture',3,1,'The interface friction angle δ is',
  ['generally less than the soil friction angle φ, depending on the pile material','always greater than φ','always equal to φ','independent of the pile material'],'Rough concrete gives δ/φ ≈ 1; smooth steel only 0.5 to 0.7.',['δ','φ'])
Q('D-W8-03',8,'pile-sand','calc','lecture',2,2,'For a normally consolidated sand with φ<sub>cs</sub> = 30°, the at-rest coefficient K<sub>o</sub> = 1 − sinφ is',
  ['0.50','0.58','0.33','1.0'],'1 − sin 30° = 0.5. The pile K is K<sub>o</sub> times a factor (e.g. 1 for a dense driven pile).',['Ko','φcs'])
Q('D-W8-04',8,'pile-sand','concept','lecture',2,1,'The pile coefficient K is, relative to K<sub>o</sub>, largest for',
  ['a driven pile in soft/loose soil (K/K<sub>o</sub> up to 2)','a bored pile with slurry','a jetted pile','all piles equally'],'Driving displaces and densifies the soil, raising the horizontal stress; boring or jetting lowers it (K/K<sub>o</sub> ≈ 2/3 to 3/4).',['K','Ko'])
Q('D-W8-05',8,'pile-sand','calc','lecture',3,2,'Meyerhof (1959) for driven piles in granular soil: f<sub>s</sub> = 2N̄ (kPa). For N̄ = 17,',
  ['34 kPa','8.5 kPa','340 kPa','2 kPa'],'f<sub>s</sub> = 2·17 = 34 kPa.',['fs','N̄'])
Q('D-W8-06',8,'pile-sand','calc','lecture',3,3,'Meyerhof: f<sub>b</sub> = 40N<sub>b</sub>L/D ≤ 400N<sub>b</sub> kPa. For N<sub>b</sub> = 20 and L/D = 10 the base resistance is',
  ['8000 kPa (the limit 400N)','800 kPa','20 000 kPa','4000 kPa'],'40·20·10 = 8000 = 400·20, exactly at the cap.',['fb','Nb'])
Q('D-W8-07',8,'pile-sand','concept','lecture',2,1,'In the Meyerhof base relation f<sub>b</sub> = 40N<sub>b</sub>L/D, the cap 400N<sub>b</sub> applies because',
  ['beyond L/D = 10 the base resistance stops increasing (critical depth)','N is limited to 400','D cannot exceed L','f<sub>b</sub> cannot exceed f<sub>s</sub>'],'Resistance does not increase indefinitely with depth; the limit is reached at L/D = 10.',['fb','Nb'])
Q('D-W8-08',8,'pile-sand','concept','lecture',2,1,'The N used in the Meyerhof relations is',
  ['the SPT count of the 2nd + 3rd 150 mm of drive, averaged over the shaft for f<sub>s</sub> and near the base for f<sub>b</sub>','the first 150 mm count','the CPT q<sub>c</sub>','the number of piles'],'N̄ over the shaft for f<sub>s</sub>; N<sub>b</sub> around the base for f<sub>b</sub>.',['N','N̄','Nb'])
Q('D-W8-09',8,'pile-sand','concept','lecture',1,1,'Using the critical-state friction angle φ<sub>cs</sub> instead of the peak φ<sub>p</sub> in design is',
  ['more conservative, because φ<sub>cs</sub> < φ<sub>p</sub> for dense sand','less conservative','the same','only valid in clay'],'At large strains dense sand softens to φ<sub>cs</sub>; peak values overestimate capacity if the soil strains a lot.',['φp','φcs'])
Q('D-W8-10',8,'pile-group','concept','lecture',3,1,'The recommended minimum spacing S (centre to centre) between piles in a group is',
  ['2.5 D','1 D','0.5 D','10 D'],'Closer spacing overlaps the stress bulbs and reduces group efficiency.',['S','D'])
Q('D-W8-11',8,'pile-group','concept','lecture',3,1,'The capacity of a group of <b>floating</b> piles is taken as',
  ['the lesser of n·P<sub>u</sub> and the equivalent block capacity P<sub>u,b</sub>','the greater of the two','their average','n·P<sub>u</sub> always'],'Two failure modes: individual piles, or the block of piles and soil. The weaker governs.',['Pu,g','Pg,s','Pu,b'])
Q('D-W8-12',8,'pile-group','calc','lecture',3,3,'A 3 × 3 group of piles with P<sub>u</sub> = 580 kN each, and an equivalent block capacity of 15 000 kN. The group capacity and the load for FS = 3 are',
  ['5220 kN, allowable 1740 kN','15 000 kN, allowable 5000 kN','5220 kN, allowable 5220 kN','580 kN, allowable 193 kN'],'n·P<sub>u</sub> = 9·580 = 5220 kN < 15 000, so governs; P<sub>a</sub> = 5220/3 = 1740 kN.',['Pu,g','Pg,s','Pa','FS'])
Q('D-W8-13',8,'pile-group','calc','lecture',3,3,'The equivalent block of a clay group: B = W = 3 m, L = 10 m, c<sub>a</sub> = 40 kPa, c<sub>u,base</sub> = 60 kPa, N<sub>c</sub> = 9. P<sub>u,b</sub> = c<sub>a</sub>·2(B + W)L + N<sub>c</sub>c<sub>u</sub>BW is',
  [f(40*2*6*10+9*60*9,0)+' kN', f(40*2*6*10,0)+' kN', f(40*6*10+9*60*9,0)+' kN', f(9*60*9,0)+' kN'],f'Skin on the block perimeter: 40·2(3 + 3)·10 = {40*2*6*10} kN; base: 9·60·3·3 = {9*60*9} kN. Sum = {40*2*6*10+9*60*9} kN.',['Pu,b','B,W,L (block)','ca'])
Q('D-W8-14',8,'pile-group','concept','lecture',2,1,'In the equivalent block (clay) analysis the soil-to-soil side shear on the block is',
  ['not reduced: c<sub>a</sub> is the soil c<sub>u</sub> because the failure surface lies in soil','reduced by α like a pile','taken as zero','taken as 2c<sub>u</sub>'],'"No reduction on c<sub>u</sub> required" for the soil–soil interface.',['ca','cu,ave','α'])
Q('D-W8-15',8,'pile-group','concept','lecture',2,1,'For a group of <b>end-bearing</b> piles on rock, the group capacity is',
  ['n·P<sub>u,single</sub>, set by the base resistance','the block capacity only','half of the sum','independent of n'],'Each pile bears on the hard layer, so the piles act independently.',['Pu,g','n'])
Q('D-W8-16',8,'pile-group','concept','lecture',2,1,'A hollow (open-ended) pile has the soil plug inside. Its base capacity, if the pile is not too thin,',
  ['is not reduced by the hollow core','is halved','is zero','depends only on the wall'],'The soil inside the pile supports load too, so the base is treated as a full section.',['Ab','Pb'])
Q('D-W8-17',8,'pile-group','calc','lecture',2,2,'Group efficiency η = P<sub>u,g</sub>/(nP<sub>u</sub>). Four piles each with P<sub>u</sub> = 1000 kN and a block capacity of 3200 kN give η =',
  ['0.80','1.00','0.25','1.25'],'P<sub>u,g</sub> = min(4000, 3200) = 3200; η = 3200/4000 = 0.8.',['η','Pu,g','n'])

# ============================================================== DEEP · WEEK 9 ==============================================================
Q('D-W9-01',9,'pile-settle','concept','lecture',3,1,'In Poulos\' elastic solution the settlement of a single floating pile under load P is',
  ['S = P·I/(E<sub>s</sub>·D), I from the stiffness factor K and L/D','S = P·L/(A<sub>p</sub>E<sub>p</sub>)','S = P·D/(E<sub>s</sub>·I)','S = E<sub>s</sub>·D/(P·I)'],'I is an influence factor read against K and L/D, with corrections R<sub>v</sub> and R<sub>h</sub> as needed.',['S (settlement)','I','Es','D'])
Q('D-W9-02',9,'pile-settle','calc','lecture',3,2,'A solid steel pile (E<sub>p</sub> = 200 GPa, R<sub>A</sub> = 1) in soil with E<sub>s</sub> = 200 MPa. The stiffness factor K = (E<sub>p</sub>/E<sub>s</sub>)R<sub>A</sub> is',
  ['1000','1','200','0.001'],'200 000 MPa/200 MPa = 1000, times R<sub>A</sub> = 1.',['K (pile)','Ep','Es','RA'])
Q('D-W9-03',9,'pile-settle','calc','lecture',3,3,'P = 2000 kN, D = 1.0 m, E<sub>s</sub> = 200 MPa, I = 1.4 (L/D = 10, K = 1000). S = PI/(E<sub>s</sub>D) is',
  ['14 mm','1.4 mm','140 mm','28 mm'],'2000·1.4/(200 000·1.0) = 0.014 m.',['S (settlement)','I','Es'])
Q('D-W9-04',9,'pile-settle','calc','lecture',3,3,'P = 2500 kN, D = 1.2 m, E<sub>s</sub> = 200 MPa, I = 1.8, R<sub>v</sub> = 0.94, R<sub>h</sub> = 0.82. The settlement is',
  ['14 mm','18 mm','9 mm','32 mm'],'S = P·I·R<sub>v</sub>R<sub>h</sub>/(D·E<sub>s</sub>) = 2500·1.8·0.94·0.82/(1.2·200 000) = 0.0145 m.',['S (settlement)','Rv','Rh'])
Q('D-W9-05',9,'pile-settle','concept','lecture',2,1,'R<sub>h</sub> < 1 corrects the settlement for',
  ['a rigid layer at finite depth h below the pile, which reduces settlement','a soil that is incompressible','the pile material','the number of piles'],'A stiff base within the influence zone stiffens the system; the pile settles less than in an infinite half-space.',['Rh','h'])
Q('D-W9-06',9,'pile-settle','concept','lecture',2,1,'R<sub>v</sub> (Poisson\'s ratio correction) is applied when',
  ['the soil is compressible, ν < 0.5 (the chart is for ν = 0.5)','the soil is saturated clay','the pile is hollow','the load is lateral'],'The basic solution assumes an incompressible soil (ν = 0.5); R<sub>v</sub> adjusts for a real ν.',['Rv','ν'])
Q('D-W9-07',9,'pile-settle','calc','lecture',2,2,'An end-bearing pile on rock: the settlement is mainly the elastic shortening, S = MR·PL/(A<sub>p</sub>E<sub>p</sub>). P = 1000 kN, L = 20 m, A<sub>p</sub> = 0.2 m², E<sub>p</sub> = 30 GPa, MR = 0.8 gives',
  ['2.7 mm','3.3 mm','27 mm','0.27 mm'],'0.8·1000·20/(0.2·30 000 000) = 0.00267 m. MR (movement ratio) comes from K and L/D.',['S (settlement)','Ep','Ap' if False else 'Ep'])
Q('D-W9-08',9,'group-settle','concept','lecture',3,1,'The settlement of a pile in a group is found by',
  ['superposition: its own settlement plus the effect of each neighbour (interaction factors)','multiplying the single pile settlement by n','dividing by n','the block settlement only'],'S<sub>k</sub> = S<sub>o</sub>(P<sub>k</sub> + Σ α<sub>i</sub>P<sub>i</sub>); it needs linear elastic behaviour and small deformation.',['Sk','So','Σα'])
Q('D-W9-09',9,'group-settle','concept','lecture',3,1,'The interaction factor α between two piles is',
  ['the extra settlement caused by the neighbour under unit load, divided by the settlement of a single pile under unit load','the ratio of loads','the ratio of diameters','the group efficiency'],'It is dimensionless and falls with spacing s/D.',['αF','So'])
Q('D-W9-10',9,'group-settle','calc','lecture',3,3,'Two identical piles each carry 1000 kN. One pile alone under 1000 kN settles 10 mm; the interaction factor is 0.4. The settlement of each pile in the group is',
  ['14 mm','10 mm','20 mm','4 mm'],'S = 10 + 0.4·10 = 14 mm (S<sub>o</sub>P + αS<sub>o</sub>P).',['Sk','αF','So'])
Q('D-W9-11',9,'group-settle','calc','lecture',3,3,'Four identical piles at the corners of a square each carry the same load; a single pile alone settles 8 mm. Interaction factors: 0.5 to each adjacent pile (two) and 0.35 to the diagonal. Each pile in the group settles',
  ['18.8 mm','8 mm','16 mm','32 mm'],'S = 8(1 + 0.5 + 0.5 + 0.35) = 8·2.35 = 18.8 mm.',['Sk','Σα','So'])
Q('D-W9-12',9,'group-settle','concept','lecture',2,1,'As the pile spacing s/D increases, the interaction factor',
  ['decreases, so group settlement approaches that of a single pile','increases','stays at 1','becomes negative'],'Neighbours influence each other less when farther apart.',['αF','s/D'])
Q('D-W9-13',9,'group-settle','concept','lecture',2,1,'The superposition principle used for pile groups is exact only if',
  ['the soil is linear elastic and the deformations are small','the soil is saturated','the piles are identical','the load is vertical'],'Linear elasticity is needed for the effects to add; otherwise it is an approximation, "better than nothing".',['Sk'])
Q('D-W9-14',9,'group-settle','concept','lecture',2,1,'A group of piles under the same load per pile settles',
  ['more than a single pile, because of interaction','less than a single pile','the same as a single pile','by half as much'],'Each pile feels its neighbours: Σα > 0 adds settlement.',['Sk','So','Σα'])

# ============================================================== DEEP · WEEK 10 ==============================================================
Q('D-W10-01',10,'piled-raft','concept','lecture',3,1,'In a piled raft foundation',
  ['the raft and the piles share the load, piles mainly reducing settlement and differential settlement','the piles carry all the load and the raft none','the raft carries all the load','the piles act only as tension anchors'],'Piled raft: load carried partly by the raft contact and partly by the piles.',[])
Q('D-W10-02',10,'piled-raft','concept','lecture',2,1,'A piled raft is <b>not</b> suitable when',
  ['the surface soil is very soft clay or very loose sand (the raft can lose contact)','the soil is stiff clay','the building is tall','settlement must be limited'],'Contact support from very soft or loose soil is small or lost, so the piles would carry everything.',[])
Q('D-W10-03',10,'piled-raft','concept','lecture',2,1,'Increasing the number of piles in a piled raft',
  ['lowers settlement, but the benefit per pile decreases once the number passes a critical value','raises settlement','has no effect','always doubles capacity'],'Diminishing returns: efficiency of the piles falls after a point.',['n'])
Q('D-W10-04',10,'piled-raft','concept','lecture',1,1,'Poulos suggested a three-stage design: preliminary design, assessment of piling requirement, and',
  ['final detailed design (accurate numerical analysis)','construction','maintenance','cost estimation'],'The lecture stresses that simple spreadsheet methods are only for a rough estimate; advanced numerical analysis is needed in the final stage.',[])
Q('D-W10-05',10,'piled-raft','concept','lecture',3,1,'In AS 2159 the strength reduction factor φ<sub>g</sub> for the ultimate pile capacity is highest (0.70 to 0.90) when the capacity is assessed by',
  ['static load testing to failure','static analysis using SPT data (cohesionless soil)','static analysis using CPT data','static analysis using laboratory data (cohesive soil)'],'The better the direct measurement, the higher φ<sub>g</sub>: static test to failure 0.70–0.90, CPT 0.45–0.65, lab data 0.45–0.55, SPT 0.40–0.55.',['Pu'])
Q('D-W10-06',10,'piled-raft','concept','lecture',3,1,'In limit-state (LRFD) design with AS 1170 load factors, the design action for dead load G and live load Q is',
  ['1.25G + 1.5Q','G + Q','1.5G + 1.25Q','0.9G + 1.5Q'],'S* = 1.25G + 1.5Q is the dead + live combination quoted in the lecture; R* = φ<sub>g</sub>R<sub>u</sub> must be at least S*.',['Pa'])
Q('D-W10-07',10,'piled-raft','calc','lecture',2,2,'A pile has R<sub>u</sub> = 2000 kN from static analysis with SPT data, φ<sub>g</sub> = 0.5. The design capacity R* is',
  ['1000 kN','4000 kN','500 kN','2000 kN'],'R* = φ<sub>g</sub>R<sub>u</sub> = 0.5·2000 = 1000 kN. With G = 300 kN, Q = 400 kN, S* = 1.25·300 + 1.5·400 = 975 kN, so it just passes.',['Pu'])
Q('D-W10-08',10,'piled-raft','concept','lecture',2,1,'In working-stress design, the overall factor of safety on pile capacity is typically in the range',
  ['2 to 5','0.5 to 1','10 to 20','1.0 exactly'],'The lecture quotes 2 to 5; 2.5 to 3 is used in the examples.',['FS'])
Q('D-W10-09',10,'pile-concept','concept','lecture',3,1,'Which method for the pile ultimate capacity is called the most important in the course?',
  ['static analysis (and static tests)','dynamic analysis','the wave equation','pile driving formulas'],'The lecture: static methods are "the" foundation for all calculations on pile foundations.',['Pu'])
Q('D-W10-10',10,'pile-clay','calc','lecture',3,3,'The lecture example: D = 1.3 m, L = 12 m, c<sub>u</sub> by layers with α = 1, 1 and 0.88 over 2, 5 and 5 m (average c<sub>u</sub> 30, 30 and 50 kPa). Method 2 gives P<sub>s</sub> =',
  ['1700 kN','1900 kN','2600 kN','740 kN'],'P<sub>s</sub> = πD·Σαc<sub>u</sub>L = π·1.3·(30·2 + 30·5 + 0.88·50·5) = π·1.3·430. The slide takes π ≈ 3 (3·1.3·430 = 1677 ≈ 1700 kN; exact π gives 1756). With P<sub>b</sub> = 700 kN, P<sub>u</sub> = 2400 kN (method 1, one average layer, gave 2600).',['Ps','cu,ave','α'])


# ============================================================== WALLS · WEEKS 11-12 ==============================================================
Q('W-W11-01',11,'rankine','concept','lecture',3,1,'As a smooth vertical wall moves <b>away</b> from the soil it retains, the horizontal effective stress on the wall',
  ['falls from the at-rest value K₀σ′<sub>v</sub> to the active value K<sub>a</sub>σ′<sub>v</sub>','rises to the passive value','stays at the at-rest value','becomes equal to the vertical stress'],'Lateral expansion lets the soil mobilise its shear strength, so the horizontal stress drops until the soil is at the point of failure (active state).',['Ka,Kp','K0'])
Q('W-W11-02',11,'rankine','calc','lecture',3,2,'For φ′ = 30° the Rankine coefficients are',
  ['K<sub>a</sub> = 1/3 and K<sub>p</sub> = 3','K<sub>a</sub> = 0.5 and K<sub>p</sub> = 2','K<sub>a</sub> = 0.5 and K<sub>p</sub> = 3','K<sub>a</sub> = 1/3 and K<sub>p</sub> = 2'],'K<sub>a</sub> = (1 − sin30°)/(1 + sin30°) = 0.5/1.5 = 1/3; K<sub>p</sub> = 1/K<sub>a</sub> = 3.',['Ka,Kp'])
Q('W-W11-03',11,'rankine','calc','lecture',2,2,'Jaky\'s K₀ = 1 − sinφ′ for a normally consolidated sand with φ′ = 30° is 0.5. For an over-consolidated clay with the same K₀(NC) and OCR = 4, K₀ = K₀(NC)·OCR<sup>0.5</sup> is',
  ['1.0','2.0','0.25','0.5'],'0.5 × 4<sup>0.5</sup> = 0.5 × 2 = 1.0. Over-consolidation locks in horizontal stress.',['K0','OCR'])
Q('W-W11-04',11,'rankine','calc','lecture',3,2,'Dry sand, γ = 18 kN/m³, φ′ = 30°, horizontal surface. The Rankine active pressure at 5 m depth is',
  ['30 kPa','90 kPa','45 kPa','15 kPa'],'p<sub>a</sub> = K<sub>a</sub>γz = (1/3)·18·5 = 30 kPa (K<sub>p</sub> would give 270).',['pa,pp','Ka,Kp'],'w11l1a')
Q('W-W11-05',11,'rankine','calc','lecture',3,2,'The total active thrust on a 5 m wall in the same dry sand (γ = 18, φ′ = 30°) and the height at which it acts above the base are',
  ['75 kN/m at 1.67 m','150 kN/m at 1.67 m','75 kN/m at 2.5 m','37.5 kN/m at 1.67 m'],'P<sub>a</sub> = ½K<sub>a</sub>γH² = ½·(1/3)·18·25 = 75 kN/m. A triangular pressure acts at H/3 = 1.67 m above the base.',['Pa,Pp','Ka,Kp'],'w11l1a')
Q('W-W11-06',11,'rankine','concept','lecture',2,1,'A uniform surcharge q on the surface adds to the active pressure',
  ['K<sub>a</sub>q, constant with depth','q, constant with depth','K<sub>a</sub>qz, increasing with depth','nothing below the water table'],'The vertical stress at every depth rises by q, so the horizontal pressure rises by K<sub>a</sub>q everywhere: a rectangle on the diagram.',['pa,pp','Ka,Kp'],'w11q1')
Q('W-W11-07',11,'rankine','concept','lecture',2,1,'Compared with the movement needed to reach the active state, the movement needed to mobilise full passive resistance is',
  ['much larger','much smaller','the same','zero'],'Passive failure needs the soil to be compressed substantially; this is why walls rely on only part of the passive resistance.',['Ka,Kp'])
Q('W-W11-08',11,'rankine','concept','lecture',2,1,'Which is <b>not</b> an assumption of Rankine\'s theory?',
  ['The wall is rough, so shear stresses act on its back','The soil is homogeneous and isotropic','The wall is smooth, so the stress on it is a principal stress','Every point in the soil is on the verge of failure (Mohr–Coulomb)'],'A smooth wall carries no shear, which keeps vertical and horizontal stresses principal. Wall roughness belongs to Coulomb.',['Ka,Kp'])
Q('W-W11-09',11,'wall-layers','concept','lecture',3,1,'At the interface between two soils with different friction angles, the Rankine pressure diagram',
  ['jumps, because K<sub>a</sub> changes while the vertical stress does not','is continuous','falls to zero','reverses sign'],'σ′<sub>v</sub> is continuous but K is not, so p = Kσ′<sub>v</sub> has a step. Compute the pressure just above and just below.',['Ka,Kp','pa,pp'],'w11q1')
Q('W-W11-10',11,'wall-layers','calc','lecture',3,3,'Sand φ′ = 35° (K<sub>a</sub> = 0.271), 5 m wall, γ = 17 kN/m³ above the water table, saturated 20 kN/m³ below. With the water table 2 m below the surface the total thrust (soil and water, g<sub>w</sub> = 9.81) is about',
  ['93 kN/m','58 kN/m','49 kN/m','44 kN/m'],'Soil above: ½·0.271·17·2² = 9.2; surcharge of that layer on the wet part: 0.271·17·2·3 = 27.6; submerged soil: ½·0.271·10.19·3² = 12.4; water: ½·9.81·3² = 44.1. Total 93.4 kN/m. Without the water table: 57.6 kN/m.',['Pa,Pp','Pw'],'w11l1b')
Q('W-W11-11',11,'wall-layers','concept','lecture',3,1,'The water in the pores of the backfill',
  ['adds a hydrostatic thrust ½γ<sub>w</sub>h<sub>w</sub>² on top of the effective soil thrust','is already included in K<sub>a</sub>','reduces the thrust because soil weight is buoyant, and nothing is added','acts only on the passive side'],'The soil part uses γ′ (smaller), but the pore pressure acts fully on the wall, so the total thrust is larger than the dry case.',['Pw'],'w11q2')
Q('W-W11-12',11,'wall-layers','calc','lecture',3,2,'Undrained analysis of a clay (φ<sub>u</sub> = 0): K<sub>a</sub> = 1 and p<sub>a</sub> = σ<sub>v</sub> − 2c<sub>u</sub>. At 6 m with γ = 18 kN/m³ and c<sub>u</sub> = 30 kPa the pressure is',
  ['48 kPa','108 kPa','168 kPa','78 kPa'],'σ<sub>v</sub> = 18·6 = 108 kPa; p<sub>a</sub> = 108 − 2·30 = 48 kPa (a total stress: no separate water pressure).',['pa,pp','cu, φu'],'w11q2')
Q('W-W11-13',11,'wall-layers','concept','lecture',2,1,'"Immediately after construction", a clay layer is analysed with',
  ['total stress and undrained strength c<sub>u</sub>, φ<sub>u</sub> = 0','effective stress and c′, φ′','the at-rest coefficient K₀ only','a drained strength with u = 0'],'Clay has not had time to drain, so excess pore pressures remain; the sand drains at once and is analysed in effective stress.',['cu, φu'],'w11q2')
Q('W-W11-14',11,'wall-cohesive','calc','lecture',3,2,'A clay with c<sub>u</sub> = 10 kPa, φ<sub>u</sub> = 0, γ = 18 kN/m³. The depth of the tension crack z₀ = 2c<sub>u</sub>/γ is',
  ['1.11 m','2.22 m','0.56 m','5.4 m'],'2·10/18 = 1.11 m (K<sub>a</sub> = 1).',['z0','cu, φu'],'w11q5')
Q('W-W11-15',11,'wall-cohesive','concept','lecture',3,1,'Tension cracks in the backfill can occur in',
  ['clays (cohesive soils), mainly in undrained conditions','clean sands','gravels','any soil'],'Without cohesion the active pressure is positive from the surface; negative values (tension) need c.',['z0'])
Q('W-W11-16',11,'wall-cohesive','calc','lecture',3,2,'The critical depth of an unsupported vertical cut in clay (φ<sub>u</sub> = 0) is H<sub>c</sub> = 4c<sub>u</sub>/γ. For c<sub>u</sub> = 30 kPa and γ = 18 kN/m³ it is',
  ['6.7 m','3.3 m','1.7 m','13.3 m'],'4·30/18 = 6.67 m. This is twice the crack depth z₀ = 2c<sub>u</sub>/γ = 3.3 m.',['Hc','cu, φu'],'w11q5')
Q('W-W11-17',11,'wall-cohesive','concept','lecture',2,1,'If a tension crack fills with water, the thrust on the wall',
  ['rises by ½γ<sub>w</sub>z₀², which is the conservative design assumption','falls because water supports the soil','is unchanged','becomes zero'],'The water pressure acts on the wall over the crack depth and cannot be relied on to be absent.',['Pw','z0'],'w11q3')
Q('W-W11-18',11,'wall-cohesive','concept','lecture',2,1,'The depth of the tension crack is the depth at which',
  ['the active pressure p<sub>a</sub> = K<sub>a</sub>γz − 2c′√K<sub>a</sub> becomes zero','the passive pressure becomes zero','the water table is met','the soil becomes undrained'],'z₀ = 2c′/(γ√K<sub>a</sub>). Above it the formula gives tension, which soil cannot carry.',['z0','pa,pp'])
Q('W-W11-19',11,'coulomb','concept','lecture',2,1,'For a sloping surface (angle β) in Rankine\'s theory, the active pressure acts',
  ['parallel to the slope, p<sub>a</sub> = K<sub>a</sub>γz cosβ','horizontally','normal to the wall at δ','vertically'],'The lecture states the pressure on a vertical plane acts parallel to the surface, so P<sub>a</sub> = ½K<sub>a</sub>γH²cosβ with K<sub>a</sub> from the sloping-surface formula.',['Ka,Kp','β'],'w11q4')
Q('W-W11-20',11,'coulomb','calc','lecture',2,2,'K<sub>a</sub> for φ′ = 40° and β = 20° is 0.266. For a 6 m wall, γ = 18 kN/m³, the thrust P<sub>a</sub> = ½K<sub>a</sub>γH²cosβ is about',
  ['81 kN/m','86 kN/m','76 kN/m','162 kN/m'],'½·0.266·18·36·cos20° = 81.1 kN/m.',['Pa,Pp','β'],'w11q4')
Q('W-W12-01',12,'coulomb','concept','lecture',3,1,'Coulomb\'s theory differs from Rankine\'s because it',
  ['balances the forces on a trial soil wedge and allows wall friction and an inclined wall back','assumes a smooth wall','is exact for passive pressure with large δ','ignores the weight of the wedge'],'The wedge is in limiting equilibrium under its weight, the wall reaction at δ to the normal and the plane reaction at φ′. The maximum over trial planes is the active thrust.',['Pa,Pp','cw'])
Q('W-W12-02',12,'coulomb','concept','lecture',2,1,'Wall friction δ, compared with a smooth wall,',
  ['reduces the active thrust and increases the passive resistance','increases the active thrust','has no effect on either','reduces the passive resistance'],'Friction on the wall helps carry the wedge, so the active thrust falls; in the passive case it adds resistance (but the failure surface curves).',['cw','Pa,Pp'])
Q('W-W12-03',12,'coulomb','concept','lecture',3,1,'Coulomb\'s plane-failure assumption for <b>passive</b> pressure',
  ['overestimates resistance for large δ (above about φ′/3), which is unsafe; use Caquot and Kerisel instead','is always conservative','is exact','only matters for dry sand'],'The failure surface is clearly curved in the passive case; the lecture recommends Caquot–Kerisel or Sokolovski coefficients for larger δ.',['Ka,Kp'])
Q('W-W12-04',12,'coulomb','concept','lecture',2,1,'Where does the Coulomb active thrust act on a vertical wall, relative to the wall normal?',
  ['at δ to the normal (so it has a vertical component)','along the normal','horizontally, always','vertically'],'The reaction P makes angle δ with the normal to the wall (below it for an active wedge that slides down). On a vertical wall the horizontal component is P cosδ.',['Pa,Pp','cw'],'w12q3')
Q('W-W12-05',12,'coulomb','calc','lecture',2,2,'A Coulomb thrust P<sub>a</sub> = 56.7 kN/m acts at δ = 15° to the horizontal on a vertical wall. Its horizontal component is',
  ['54.8 kN/m','56.7 kN/m','14.7 kN/m','58.7 kN/m'],'P<sub>a</sub>cosδ = 56.7·0.966 = 54.8 kN/m. The vertical part P<sub>a</sub>sinδ = 14.7 kN/m adds to the wall load.',['Pa,Pp'],'w12q3')
Q('W-W12-06',12,'embedded','concept','lecture',3,1,'In design, the mobilised friction angle is taken lower than the critical-state value φ<sub>cs</sub> because',
  ['loads and soil properties are uncertain, small wall rotations do not mobilise peak strength, and backfill can contain shear bands','φ<sub>cs</sub> cannot be measured','the wall is smooth','water table effects reduce φ'],'Design values are conservative: uncertainty, tolerable rotation and construction quality (lecture list).',["c', φ'"])
Q('W-W12-07',12,'embedded','concept','lecture',2,1,'Embedded (sheet pile, secant pile, diaphragm) walls differ from gravity walls because they',
  ['are flexural members whose weight is ignored and which depend on mobilised passive resistance','are heavy and resist by weight','need no excavation','act only in rock'],'Excavation follows installation; stability comes from the embedded length and the passive resistance in front.',['Pp' if False else 'Pa,Pp'])
Q('W-W12-08',12,'embedded','concept','lecture',3,1,'The three stability checks for a gravity retaining wall are',
  ['overturning, sliding and bearing capacity of the foundation soil','buckling, shear and fatigue','settlement, heave and piping','compaction, drainage and cost'],'The thrust must not overturn the wall about the toe, slide it along the base, or exceed the bearing capacity (tutorial 12(ii) checks the pressure on the foundation against 250 kPa).',['Pa,Pp'])
Q('W-W12-09',12,'embedded','concept','lecture',2,1,'In the lecture\'s cantilever sheet pile example, two factors are used: 1.2 on the soil shear strength and 1.3 on the embedment. The aim is to',
  ['reduce the strength used in K<sub>a</sub>, K<sub>p</sub>, and then increase the calculated driving depth, so the wall is safe against rotation','reduce the surcharge','increase the cohesion','remove the water pressure'],'Soil strength is divided by 1.2 before finding K<sub>a</sub> and K<sub>p</sub>; the embedment found for equilibrium is multiplied by 1.3 for the safe driving depth.',["c', φ'"])
Q('W-W12-10',12,'embedded','concept','lecture',2,1,'A good retaining wall design includes',
  ['a high-quality drainage system to keep water out of the backfill','a backfill of soft clay','no drainage, to keep the soil strong','a rough wall only'],'Water pressure on the wall can double the thrust; drained granular backfill is the usual design.',['Pw'])

# ============================================================== 14 mid-session items (verbatim from quiz/midsession_2026.json) ==============================================================
EX=json.load(open(os.path.join(HERE,'midsession_2026.json'),encoding='utf-8'))
EXPAT={1:'terms',2:'shape',3:'spt',4:'allow',5:'consol',6:'time',7:'time',8:'voidr',9:'voidr',10:'modes',11:'terms',12:'terms',13:'modes',14:'allow'}
EXSYM={1:['qnf','cu'],2:['qf','sc,sq,sγ'],3:['N1','CN'],4:['Cw','qa'],5:['Sc','Cc','e,e0,e1,ep,ef'],6:['cv','mv','k'],7:['Hdr','t'],8:['Cc'],9:['e,e0,e1,ep,ef','H'],10:[],11:["c', φ'"],12:['Nc,Nq,Nγ',"c', φ'"],13:[],14:['qa','sL']}
for it in EX['items']:
    n=it['n']; opts=it['options']; letters='ABCD'
    ITEMS.append(dict(id=f'X-26-{n:02d}', track='shallow', week=it['week'], pattern=EXPAT[n], kind=it['kind'], source='exam', likely=3, marks=it['marks'],
        q=it['q'], options=opts, answer=it['answer'], why=it['why'], symbols=EXSYM[n], link=None, flag=it.get('flag',''), orig=f'Mid-session 2026 Section I Q{n}'))
    for s in EXSYM[n]: assert okSym(s),(n,s)

# ---- exam-source items in my own words that mirror each mid-session idea are tagged 'exam' above; the 'source' field says where the IDEA comes from.

# ---- sanity ----
ids=[i['id'] for i in ITEMS]; assert len(ids)==len(set(ids)),'duplicate ids'
PRED={'shallow':'The final covers the whole course, so weeks 1 to 5 can return, but the mid-session already tested them. Expect the same ideas from another angle (a concept swapped for a calculation, a different soil) rather than a repeat. Calculations that need several steps and a chart are the likeliest to carry the most marks.',
 'walls':'Weeks 11 and 12 are the newest material and are not in the mid-session. Expect an earth-pressure diagram (layers, a surcharge, water, a cohesive layer) with the thrust and its height, plus short concept items on Rankine against Coulomb and the tension crack. The official week 11 Q5 and the week 12 tutorial need a check with your tutor (see the notes on each problem).',
 'deep':'Weeks 7 to 10 were not on the mid-session, so they are new ground for the final. The lectures themselves point at three things: the layered clay shaft method ("Method 2 for test/exam"), the "lesser of the two" rule for a group, and the P·I·R<sub>v</sub>·R<sub>h</sub>/(D·E<sub>s</sub>) settlement worked twice at 14 mm.'}
for tr,title in (('shallow','Question bank · shallow'),('deep','Question bank · deep'),('walls','Question bank · retaining walls')):
    its=[i for i in ITEMS if i['track']==tr]
    out=dict(id='bank_'+tr, title=title, predNote=PRED[tr], track=tr, source='Generated by quiz/_make_bank.py from the lectures, tutorials and the mid-session paper.',
             patterns=[dict(id=p[0],track=p[1],name=p[2],blurb=p[3],weight=p[4],why=p[5]) for p in PATTERNS if p[1]==tr], items=its)
    json.dump(out,open(os.path.join(HERE,'bank_%s.json'%tr),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
from collections import Counter
print('items',len(ITEMS)); print('by track',Counter(i['track'] for i in ITEMS)); print('by pattern',sorted(Counter(i['pattern'] for i in ITEMS).items()))
print('by week',sorted(Counter(i['week'] for i in ITEMS).items())); print('by source',Counter(i['source'] for i in ITEMS)); print('answers',Counter(i['answer'] for i in ITEMS))
