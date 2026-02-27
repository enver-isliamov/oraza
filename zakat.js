const THEME_KEY='ramTheme';
const READ_PROGRESS_KEY='ramReadProgress';
const READ_COMPAT_KEY='ramReadArticles';
const MIN_READ_SECONDS=15;

function applyThemeFromStorage(){
  const theme=localStorage.getItem(THEME_KEY)||'light';
  document.documentElement.setAttribute('data-theme',theme);
  const meta=document.getElementById('metaThemeColor');
  if(meta)meta.setAttribute('content',theme==='dark'?'#100e0c':'#c49a3c');
}

function parseStoredObject(key){
  try{
    const parsed=JSON.parse(localStorage.getItem(key)||'{}');
    return parsed&&typeof parsed==='object'?parsed:{};
  }catch(e){
    return {};
  }
}

function resolveArticleId(){
  const explicit=document.body.getAttribute('data-article-id');
  if(explicit)return explicit;
  const path=window.location.pathname.split('/').pop();
  if(!window.ContentRelease||!path)return '';
  const match=window.ContentRelease.ARTICLE_CATALOG.find((article)=>article.href===path);
  return match?match.id:'';
}

function attachReadTracking(){
  const articleId=resolveArticleId();
  if(!articleId||articleId==='zakat')return;

  let sessionStartedAt=Date.now();
  let activeMs=0;

  function persistProgress(){
    if(!articleId)return;
    const now=Date.now();
    if(!document.hidden){
      activeMs+=now-sessionStartedAt;
      sessionStartedAt=now;
    }
    const progressMap=parseStoredObject(READ_PROGRESS_KEY);
    const existing=progressMap[articleId]||{};
    const totalSeconds=Math.floor((Number(existing.seconds)||0)+activeMs/1000);
    const completed=totalSeconds>=MIN_READ_SECONDS;

    progressMap[articleId]={
      seconds:totalSeconds,
      requiredSeconds:MIN_READ_SECONDS,
      estimatedReadSeconds:Math.max(MIN_READ_SECONDS,Number(existing.estimatedReadSeconds)||MIN_READ_SECONDS),
      completed,
      updatedAt:Date.now()
    };
    localStorage.setItem(READ_PROGRESS_KEY,JSON.stringify(progressMap));

    if(completed){
      const compatMap=parseStoredObject(READ_COMPAT_KEY);
      if(!compatMap[articleId]){
        compatMap[articleId]=Date.now();
        localStorage.setItem(READ_COMPAT_KEY,JSON.stringify(compatMap));
      }
    }

    activeMs=0;
  }

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){
      persistProgress();
    }else{
      sessionStartedAt=Date.now();
    }
  });

  window.addEventListener('beforeunload',persistProgress);
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

function renderZakatTiles(){
  const container=document.getElementById('zakatTiles');
  if(!container||!window.ContentRelease)return;
  const articles=window.ContentRelease.getZakatArticles();
  container.innerHTML=articles.map((article)=>`
    <a class="tile" href="${article.href}">
      <div class="tile-title">${article.title}</div>
      <div class="tile-desc">${article.description}</div>
      <div class="tile-arrow">${article.label} →</div>
    </a>
  `).join('');
}

applyThemeFromStorage();
guardZakatEntry();
renderZakatTiles();
attachReadTracking();
window.addEventListener('storage',e=>{if(e.key===THEME_KEY)applyThemeFromStorage();});
