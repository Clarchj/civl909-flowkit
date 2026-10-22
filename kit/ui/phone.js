// ================= KIT · PHONE behaviour (see phone.css) =================
// ⋯ opens the rest of the toolbar; the answer line expands on tap; the page remembers it is on a phone.
const isPhone=()=>window.matchMedia&&window.matchMedia('(max-width:700px)').matches;
document.addEventListener('click',e=>{
  const m=e.target.closest&&e.target.closest('#morebtn'); if (m){ $q('#bar').classList.toggle('more'); return; }
  const g=e.target.closest&&e.target.closest('#goal'); if (g&&!e.target.closest('button,a')) g.classList.toggle('open'); });
