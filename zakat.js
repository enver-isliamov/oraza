const THEME_KEY='ramTheme';

function applyThemeFromStorage(){
  const theme=localStorage.getItem(THEME_KEY)||'light';
  document.documentElement.setAttribute('data-theme',theme);
  const meta=document.getElementById('metaThemeColor');
  if(meta)meta.setAttribute('content',theme==='dark'?'#100e0c':'#c49a3c');
}

function guardZakatEntry(){
  if(!window.ContentRelease) return;
  const release=window.ContentRelease.getReleaseState();
  const path=window.location.pathname.split('/').pop();
  const isZakatLanding=path==='zakat.html';
  if(!isZakatLanding) return;

  const params=new URLSearchParams(window.location.search);
  const fromAmount=params.get('entry')==='fitir-amount';
  if(!release.allZakatPublished && !fromAmount){
    window.location.replace('index.html');
  }
}

applyThemeFromStorage();
guardZakatEntry();
window.addEventListener('storage',e=>{if(e.key===THEME_KEY)applyThemeFromStorage();});
