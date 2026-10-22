// ================= CONFIG: the interface's settings, from interface.config.json =================
// build.py puts the contents of interface.config.json into the page as UI_CONFIG. Everything here is a default:
// a setting missing from the file falls back to the value below, so an old or partial config still builds.
// Read settings as UI.blocks.step_view, UI.panels.order, and so on. Never write to UI at run time.
const UI_DEFAULTS = {
  id: 'civl909-default',
  title: 'Pile capacity explorer',
  heading: 'Pile capacity, opened up',
  subheading: 'CIVL909 weeks 7 to 10. Worked examples are locked; the playground is yours. Every slider draws what the answer does across its whole range, with the switch points marked.',
  problems: { files: ['_base', 'play', 'w7', 'w8', 'w9', 'quiz', 'w10'], only: [], start: 'playground', generator: true },
  panels: {
    order: ['question', 'walk', 'v3', 'stage', 'results', 'blocks', 'detail'],
    show_desktop: ['walk', 'v3', 'stage', 'results', 'blocks', 'detail'],
    show_phone: ['question', 'walk', 'blocks', 'v3', 'results'],
    collapsed: [],
  },
  blocks: { start_level: 'stages', step_view: 'lines', values_on_blocks: false, follow: true, legend: true, verb_icons: true, wrap_scale: 0.7, lines_scale: 1.0 },
  steps: { autoplay_seconds: 5.2, flow_sentence: true },
  layout: { default: 'page', workspace_layout: '3', workspace_views: ['walk', 'v3', 'sec', 'worked'] },
  drawings: { phys: true, force: true, stress: true, method: true, thr: true },
  practice: { hide_solution_default: false },
  theme: 'auto',
};
const UI = (() => {
  const merge = (a, b) => { if (b === undefined) return a; if (Array.isArray(a) || typeof a !== 'object' || a === null) return b;
    const o = { ...a }; Object.keys(b || {}).forEach(k => { o[k] = merge(a[k], b[k]); }); return o; };
  return merge(UI_DEFAULTS, typeof UI_CONFIG !== 'undefined' ? UI_CONFIG : {});
})();

// A changed config must show on the next open, so the remembered view choices (panels shown, open or closed, tiles,
// Lines or Wires, follow) are cleared when the config changes. The playground's own values are kept.
(() => {
  const sig = JSON.stringify(UI); let h = 0; for (let i = 0; i < sig.length; i++) h = (h * 31 + sig.charCodeAt(i)) | 0;
  try {
    if (localStorage.getItem('civl909-config') !== String(h)) {
      ['civl909-view-d', 'civl909-view-m', 'civl909-coll', 'civl909-ws', 'civl909-blook', 'civl909-bfollow', 'civl909-aside', 'civl909-hide']
        .forEach(k => localStorage.removeItem(k));
      localStorage.setItem('civl909-config', String(h));
    }
  } catch (e) {}
  if (UI.theme === 'light' || UI.theme === 'dark') document.documentElement.setAttribute('data-theme', UI.theme);
})();
