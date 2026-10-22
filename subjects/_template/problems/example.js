// ================= EXAMPLE PROBLEMS: copy, rename, change the numbers =================
// Every block is ONE line. The wires are found from the names inside each expression, so you never draw a wire.
//   In(id, value, unit, symbol, meaning)      a value given in the question        (editable on the map)
//   Cn(id, value, unit, symbol, meaning)      a value fixed by a rule / read as the course reads it
//   Fn(id, 'expression', {sym, name, unit, verb, eq, step, goal, chart, how, num, branch})   a function; its result is its own block
//   Gate(id, 'expression', {test, yes, no, step, info})   a yes/no decision; use its id inside a Fn expression:  ok ? a : b
// Expression helpers: log10 ln exp sqrt pow abs min max PI tan atan sin cos rad deg round sum lookup('table', x)   (+ any Helper() you add)
// Ids must be plain names (letters, digits, _) and must not be a helper name. Put the symbol in HTML: 'σ<sub>y</sub>'.

Problem({ id:'ex1', track:'main', week:1, source:'tutorial', type:'basics', title:'Example 1', sub:'Stress in a bar and its safety factor',
  answer:'Check: σ = 125 MPa, F = 2.0', check:[{id:'FS', exp:2.0, tol:0.01, label:'F'}],        // check: compare a block with the official answer; a ✓ or ≠ chip shows on the map
  text:'A steel bar of area 400 mm² carries 50 kN. The yield stress is 250 MPa. Find the stress and the factor of safety.',
  steps:[{id:'s1',title:'Stress in the bar'},{id:'s2',title:'Safety'}],                          // steps become the frames drawn around blocks, and the Jump menu
  nodes:[
    In('P', 50, 'kN', 'P', 'axial load'), In('A', 400, 'mm²', 'A', 'cross-section area'), In('fy', 250, 'MPa', 'f<sub>y</sub>', 'yield stress'),
    Fn('sigma', 'P*1000/A', {sym:'σ', name:'stress in the bar', unit:'MPa', step:'s1', verb:'divide', eq:'σ = P/A'}),
    Gate('safe', 'sigma<=fy', {test:'σ ≤ f<sub>y</sub>?', yes:'elastic', no:'yields', step:'s2', info:'A yes/no decision. Functions can use it in their expression.'}),
    Fn('FS', 'safe ? fy/sigma : 0', {sym:'F', name:'factor of safety', unit:'', step:'s2', verb:'divide', goal:true, eq:'F = f<sub>y</sub>/σ'}) ] });

// a block that reads a chart: the chart is drawn in the card and a ready-made spec is enough
Table('kt', [[0,3.0],[0.1,2.7],[0.2,2.4],[0.3,2.15],[0.4,1.95]]);
Problem({ id:'ex2', track:'main', week:2, source:'tutorial', type:'lookup', title:'Example 2', sub:'A stress concentration factor read from a chart',
  answer:'Check: σ_max = 270 MPa', check:[{id:'smax', exp:270, tol:0.01, label:'σ_max'}],
  text:'A plate with a hole of ratio d/w = 0.1 carries a nominal stress of 100 MPa. Read the concentration factor and find the peak stress.',
  steps:[{id:'s1',title:'Read the chart'},{id:'s2',title:'Peak stress'}],
  nodes:[
    In('dw', 0.1, '', 'd/w', 'hole diameter over plate width'), In('snom', 100, 'MPa', 'σ<sub>nom</sub>', 'nominal stress'),
    Fn('K', "lookup('kt', dw)", {sym:'K<sub>t</sub>', name:'stress concentration factor', unit:'', step:'s1', verb:'read K<sub>t</sub>',
      chart:v=>({type:'curve', xl:'d/w', yl:'K<sub>t</sub>', xmin:0, xmax:0.5, ymin:1.5, ymax:3.2, series:[{lab:'K<sub>t</sub>', pts:TABLES.kt, hi:true}], point:{x:v.dw, y:v.K}}),
      how:v=>[`d/w = <b>${fmt(v.dw)}</b> on the horizontal axis.`, 'Go up to the curve, then across.', `<b>K<sub>t</sub> = ${fmt(v.K)}</b>.`]}),
    Fn('smax', 'K*snom', {sym:'σ<sub>max</sub>', name:'peak stress at the hole', unit:'MPa', step:'s2', verb:'multiply', goal:true, eq:'σ<sub>max</sub> = K<sub>t</sub>σ<sub>nom</sub>'}) ] });
