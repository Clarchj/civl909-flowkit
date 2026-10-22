r"""Card content that cannot be derived from the notation sheet, written in LaTeX (Anki renders \( \) inline and \[ \] display with MathJax).
FRONT       the words shown on the card FRONT where the notation sheet's own wording already contains an equation (it would leak the answer).
DEFINITION  the defining relation, shown on the BACK only (these are the 'f' equations that the exam paper provides).
EQUATIONS   GEOMETRY equations only: the 'hidden' ones that are not on the paper. {'tex': [display lines], 'note': 'text with \(inline math\)'}.
Keys are notation ids (n###)."""

FRONT = {
 'n003': 'effective width and length of a footing carrying an eccentric load',
 'n033': 'effective (buoyant) unit weight', 'n034': 'unit weight of water', 'n060': 'over-consolidation ratio', 'n064': 'volume compressibility',
 'n072': "ratios of a loaded rectangle's sides to the depth of the point (for the influence chart)", 'n078': 'drainage path length (double or single drainage)',
 'n086': 'modified secondary compression index', 'n097': 'self-weight of a pile, net of the water it displaces', 'n098': 'unit skin friction on the pile shaft',
 'n099': 'unit base resistance of a pile', 'n100': 'area of the pile shaft in contact with the soil', 'n101': 'area of the base of a circular pile',
 'n106': 'overburden pressure at the level of the pile base', 'n112': 'pile–soil adhesion', 'n119': 'pile–soil interface friction angle', 'n120': 'normal stress on the pile shaft',
 'n122': 'horizontal effective stress on the pile shaft', 'n124': 'at-rest earth pressure coefficient of the soil around a pile', 'n132': 'pile spacing, centre to centre',
 'n136': 'group capacity when the piles act as n single piles', 'n138': 'governing capacity of a pile group', 'n140': 'allowable load of a pile group', 'n141': 'factor of safety on pile capacity',
 'n145': 'area ratio of a pile (net area of material over gross area)', 'n148': 'pile stiffness factor (pile-to-soil stiffness)', 'n152': 'settlement of the pile head',
 'n159': 'settlement of one pile in a group', 'n160': 'load carried by each pile', 'n161': 'ring radius of a circular pile group', 'n169': 'longest drainage path of a clay layer',
 'n170': 'net ultimate bearing capacity (as written in the tutorials)', 'n171': 'net capacity gained per metre of footing width',
 'n175': 'active and passive earth pressure coefficients (Rankine)', 'n176': 'at-rest earth pressure coefficient', 'n177': 'active and passive pressure at depth z',
 'n178': 'total active / passive force per metre length of wall', 'n179': 'hydrostatic thrust of the groundwater on the wall', 'n180': 'depth of the tension crack',
 'n181': 'critical depth of an unsupported vertical cut in clay', 'n184': 'cohesion coefficient in Coulomb theory (with wall adhesion)',
}

DEFINITION = {
 'n033': r"\gamma' = \gamma_{sat} - \gamma_w", 'n034': r"\approx 9.81\ \mathrm{kN/m^3}", 'n060': r"OCR = \sigma'_{pc}/\sigma'_0", 'n064': r"m_v = a_v/(1+e_0)",
 'n086': r"C_{\alpha\varepsilon} = C_\alpha/(1+e_p)", 'n098': r"f_s=\alpha c_u\ (\text{clay}),\quad f_s=K\sigma'_v\tan\delta\ (\text{sand})",
 'n099': r"f_b=N_c c_u\ (\text{clay}),\quad f_b=N_q\sigma'_v\ (\text{sand})", 'n112': r"c_a=\alpha c_u\ (\text{sand: }0)", 'n119': r"\delta\le\varphi",
 'n120': r"\sigma_n=\sigma'_h", 'n122': r"\sigma'_h=K\sigma'_v", 'n124': r"K_o=1-\sin\varphi_{cs}", 'n132': r"S\ge 2.5D", 'n136': r"P_{g,s}=nP_u",
 'n138': r"P_{u,g}=\min(nP_u,\ P_{u,b})", 'n140': r"P_a=P_{u,g}/FS", 'n141': r"FS\approx 2.5\text{–}3", 'n148': r"K=(E_p/E_s)\,R_A", 'n152': r"S=\dfrac{P\,I\,R_v\,R_h}{D\,E_s}",
 'n159': r"S_k=S_o\,P\,(1+\Sigma\alpha)", 'n160': r"P=\text{total load}/n", 'n170': r"q_{nf}=q_f-\gamma D", 'n171': r"k_B=\tfrac12\gamma' N_\gamma",
 'n175': r"K_a=\dfrac{1-\sin\varphi'}{1+\sin\varphi'},\quad K_p=\dfrac{1}{K_a}", 'n176': r"K_0=1-\sin\varphi'\ (\text{Jaky}),\quad \times\,OCR^{0.5}\ \text{if over-consolidated}",
 'n177': r"p_a=K_a\gamma z-2c\sqrt{K_a},\quad p_p=K_p\gamma z+2c\sqrt{K_p}", 'n179': r"P_w=\tfrac12\gamma_w h_w^2", 'n180': r"z_0=\dfrac{2c}{\gamma\sqrt{K_a}},\quad z_0=\dfrac{2c_u}{\gamma}\ (\varphi_u=0)",
 'n181': r"H_c=4c_u/\gamma", 'n184': r"K_{ac}=2\sqrt{K_a\,(1+c_w/c')}",
}

_MR = {'tex': [r"m=b/z", r"n=l/z"], 'note': r"sides of the rectangle divided by the depth, read the influence chart with \(m\) and \(n\)"}
_DG = {'tex': [r"D_g=2R+D"], 'note': "circular group: ring radius \\(R\\) to the pile centres, plus one diameter"}
EQUATIONS = {
 'n003': {'tex': [r"B'=B-2e_x", r"L'=L-2e_y"], 'note': "effective width and length: only the part of the base centred on the load carries it"},
 'n009': {'tex': [r"A=\pi R^2=\pi B^2/4\quad(B=2R)"], 'note': r"area of a circular loaded area; circumference \(2\pi R\)"},
 'n007': {'tex': [r"z=z_{top}+H/2"], 'note': r"depth of the middle of a layer, where \(\sigma'_0\) and \(\Delta\sigma\) are taken"},
 'n010': {'tex': [r"H_{below\ base}=H_{layer}-D_f"], 'note': "thickness of a layer beneath the footing is measured from the foundation level, not the ground surface"},
 'n011': _MR, 'n072': _MR,
 'n012': {'tex': [r"e=M/V"], 'note': r"moment about the centre of the base over the vertical load; then \(B'=B-2e\)"},
 'n015': {'tex': [r"A=B\ (\text{strip, per metre})", r"A=B^2\ (\text{square})", r"A=BL\ (\text{rectangle})", r"A=\pi B^2/4\ (\text{circle})"], 'note': ''},
 'n036': {'tex': [r"\dfrac{\Delta H}{H}=\dfrac{\Delta e}{1+e_0}", r"H\propto 1+e"], 'note': "the height of solids is constant, so layer thickness is proportional to \\(1+e\\)"},
 'n100': {'tex': [r"A_s=\pi D L", r"A_s=4DL\ (\text{square pile})"], 'note': "perimeter times embedded length"},
 'n101': {'tex': [r"A_b=\dfrac{\pi D^2}{4}=\pi\left(\dfrac D2\right)^2"], 'note': "base area of a circular pile"},
 'n097': {'tex': [r"W=V_p\gamma_p-U_{water}\approx A_b\,h\,\gamma_s=p_oA_b"], 'note': r"pile volume \(V_p=A_bL\); the weight is taken equal to the soil it replaced"},
 'n106': {'tex': [r"p_o=\gamma_s\,h"], 'note': r"overburden pressure at the level of the base (\(\gamma'\) below the water table)"},
 'n133': {'tex': [r"B=(n_{row}-1)S+D", r"W=(n_{col}-1)S+D"], 'note': r"block size from the pile spacing \(S\) and diameter \(D\); perimeter \(2(B+W)\), base area \(BW\)"},
 'n161': _DG, 'n162': _DG,
 'n145': {'tex': [r"R_A=\dfrac{A_{net}}{A_{gross}}=\dfrac{D^2-d^2}{D^2}\ (\text{hollow})", r"R_A=1\ (\text{solid})"], 'note': ''},
 'n169': {'tex': [r"H_{dr}=H/2\ (\text{drained top and bottom})", r"H_{dr}=H\ (\text{one face})"], 'note': 'longest drainage path'},
 'n078': {'tex': [r"d=H/2\ (\text{double drainage})", r"d=H\ (\text{single drainage})"], 'note': ''},
 'n178': {'tex': [r"\text{triangle: }P=\tfrac12 pH,\ \text{acts at }H/3", r"\text{rectangle: }P=pH,\ \text{acts at }H/2", r"\text{trapezoid: }P=\tfrac12(p_1+p_2)H"], 'note': 'thrust = area of the pressure diagram; its line of action passes through the centroid of that area'},
}
