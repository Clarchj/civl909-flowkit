// ================= WEEK 1 · Which strength do I use? (drained or undrained, and what the water table changes) =================
// The idea behind tutorial 1: a soil has ONE strength law, in effective stress, τ = c′ + σ′ tanφ′ (σ′ = σ − u).
//   c_u, φ_u is not a second property: it is the same strength with the pore-pressure response of FAST loading baked in, written in total stress (τ = c_u + σ tanφ_u, φ_u = 0 for saturated clay).
//   Drained or undrained is decided by loading speed against how fast the soil drains. The water table decides u, so it decides σ′ and the unit weight (γ or γ′), never c.
// One profile, three decisions (read the profile, choose the analysis, take the numbers). Checked against Tutorial 1 Q1 to Q5 and the week 1 slide "Choice of soil parameters".
// Rules (the table of the handoff): granular → drained always; saturated cohesive → fast: undrained (c_u, φ_u = 0, total γ_sat), slow: drained (c′, φ′, γ′ below the water table).
// Out of scope and flagged, not guessed: clay above the water table (unsaturated), partly drained loading, peak against residual strength, a plain "c" given as data.

function strengthProblem(id,o){ Problem({ id, track:'shallow', week:1, source:'tutorial', type:'strength', order:o.order, title:o.title, sub:o.sub, text:o.text, answer:o.answer||'', check:o.check||[],
  steps:[{id:'s1',title:'Read the profile'},{id:'s2',title:'Choose the analysis'},{id:'s3',title:'Take the numbers'}],
  nodes:[
    ...strengthCore(o) ] }); }

// Tutorial 1: the question each case comes from, with the fact it tests
strengthProblem('w1s1',{order:11,title:'W1 Q1 · strength',sub:'Gravelly sand, water table may rise to the base',coh:0,fast:1,z:0.7,zw:0.7,cu:0,cp:0,php:40,g:17,gs:20,
  text:'Tutorial 1 Q1: a strip footing on gravelly sand (c′ = 0, φ′ = 40°) at 0.7 m; the water table may rise to foundation level. γ = 17 above the water table, γ<sub>sat</sub> = 20. Which strength and which unit weight does the soil under the base get?',
  answer:'Granular: always drained (c′ = 0, φ′ = 40°). At the base the soil below is saturated, so γ′ = 10.2.', check:[{id:'gu',exp:10.2,label:'γ in use'}]});
strengthProblem('w1s2a',{order:12,title:'W1 Q2 (a) · strength',sub:'Clay, water table at the surface, loaded instantly',coh:1,fast:1,z:1.2,zw:0,cu:25,cp:10,php:20,g:19,gs:19,
  text:'Tutorial 1 Q2(a): a strip footing 1.2 m deep on clay (c<sub>u</sub> = 25 kPa, φ<sub>u</sub> = 0; c′ = 10 kPa, φ′ = 20°; γ<sub>sat</sub> = 19). The water table is at the ground surface. The load is applied <b>instantaneously</b>. Which parameters and factors?',
  answer:'Undrained: c<sub>u</sub> = 25, φ<sub>u</sub> = 0; N<sub>c</sub> = 5.14, N<sub>q</sub> = 1, N<sub>γ</sub> = 0; γ = 19 (total).', check:[{id:'Nc',exp:5.14,label:'N_c'},{id:'Nq',exp:1,label:'N_q'},{id:'Ng',exp:0,label:'N_γ'},{id:'gu',exp:19,label:'γ in use'}]});
strengthProblem('w1s2b',{order:13,title:'W1 Q2 (b) · strength',sub:'The same clay, water table at the surface, loaded very slowly',coh:1,fast:0,z:1.2,zw:0,cu:25,cp:10,php:20,g:19,gs:19,
  text:'Tutorial 1 Q2(b): the same clay and the same water table at the surface as (a), but the load is applied <b>very slowly</b>. Only the loading changed. Which parameters and factors now?',
  answer:'Drained: c′ = 10, φ′ = 20°; N<sub>c</sub> = 15, N<sub>q</sub> = 6.4, N<sub>γ</sub> = 3.5; γ′ = 19 − 9.8 = 9.2. (The official working labels these “φ<sub>u</sub> = 20°”: a typo for φ′.)', check:[{id:'Nc',exp:15,label:'N_c'},{id:'Nq',exp:6.4,label:'N_q'},{id:'Ng',exp:3.5,label:'N_γ'},{id:'gu',exp:9.2,label:'γ in use'}]});
strengthProblem('w1s3a',{order:14,title:'W1 Q3 (a) · strength',sub:'Sand, water table 5 m down',coh:0,fast:1,z:1,zw:5,cu:0,cp:0,php:40,g:17,gs:20,
  text:'Tutorial 1 Q3: a square footing at 1 m on sand (c′ = 0, φ′ = 40°; γ = 17 above the water table, γ<sub>sat</sub> = 20). Case 1: the water table is 5 m below the ground. Which unit weight for the soil under the base?',
  answer:'Drained, c′ = 0, φ′ = 40°. The water table is below: γ = 17.', check:[{id:'gu',exp:17,label:'γ in use'}]});
strengthProblem('w1s3b',{order:15,title:'W1 Q3 (b) · strength',sub:'Sand, water table at the base',coh:0,fast:1,z:1,zw:1,cu:0,cp:0,php:40,g:17,gs:20,
  text:'Tutorial 1 Q3, case 2: the same sand, now with the water table 1 m below the ground, which is the founding level. Which unit weight for the soil under the base? What changed from (a), and what did not?',
  answer:'Same c′ = 0, φ′ = 40° (the water table never changes them). The soil under the base is saturated: γ′ = 10.2.', check:[{id:'gu',exp:10.2,label:'γ in use'}]});
strengthProblem('w1s4',{order:16,title:'W1 Q4 · strength',sub:'Stiff clay, water table at the ground surface',coh:1,fast:1,z:1,zw:0,cu:105,cp:0,php:0,g:21,gs:21,
  text:'Tutorial 1 Q4: a strip footing at 1 m in stiff clay (γ<sub>sat</sub> = 21), water table at ground level. The question gives c<sub>u</sub> = 105 kPa and φ<sub>u</sub> = 0, so the analysis has been chosen for you. Which factors and which unit weight?',
  answer:'Undrained: c<sub>u</sub> = 105, φ<sub>u</sub> = 0; N<sub>c</sub> = 5.14, N<sub>q</sub> = 1, N<sub>γ</sub> = 0; γ = 21 (total, no buoyancy).', check:[{id:'Nc',exp:5.14,label:'N_c'},{id:'gu',exp:21,label:'γ in use'}]});
strengthProblem('w1s5',{order:17,title:'W1 Q5 · strength',sub:'Wall base on sand, water table well below',coh:0,fast:1,z:1,zw:10,cu:0,cp:0,php:35,g:18,gs:18,
  text:'Tutorial 1 Q5: the base of a retaining wall, 1 m below the surface, on a soil with c′ = 0, φ′ = 35° and γ = 18 kN/m³. The water table is well below the base. Which strength and unit weight?',
  answer:'Drained, c′ = 0, φ′ = 35°; N<sub>q</sub> = 33, N<sub>γ</sub> = 41; γ = 18 (dry). γ<sub>sat</sub> is not given and not needed.', check:[{id:'gu',exp:18,label:'γ in use'},{id:'Nq',exp:33,label:'N_q'}]});
