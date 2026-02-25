
const THEME_KEY='ramTheme';
function applyThemeFromStorage(){
  const theme=localStorage.getItem(THEME_KEY)||'light';
  document.documentElement.setAttribute('data-theme',theme);
  const meta=document.getElementById('metaThemeColor');
  if(meta)meta.setAttribute('content',theme==='dark'?'#100e0c':'#c49a3c');
}
applyThemeFromStorage();
window.addEventListener('storage',e=>{if(e.key===THEME_KEY)applyThemeFromStorage();});
