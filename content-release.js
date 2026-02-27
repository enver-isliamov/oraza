(function(){
  const RELEASE_START_KEY = 'ramContentReleaseStart';
  const RELEASE_LAST_NOTIFIED_KEY = 'ramContentLastNotifiedCount';
  const DAY_MS = 24 * 60 * 60 * 1000;
  const MIN_AVAILABLE_COUNT = 2;

  const ARTICLE_CATALOG = [
    {
      id: 'mahram',
      section: 'general',
      title: 'Кто такие махрамы: три категории женщин, запретных для брака',
      description: 'Краткая памятка о том, кто такие махрамы, какие бывают категории и какие правила связаны с этим статусом.',
      href: 'mahram.html',
      label: 'Открыть статью'
    },
    {
      id: 'chelebidzhihan',
      section: 'general',
      title: '23 февраля: Номан Челебиджихан',
      description: 'Краткая историческая справка о Номане Челебиджихане и трагических событиях 23 февраля 1918 года.',
      href: 'chelebidzhihan.html',
      label: 'Открыть статью'
    },
    {
      id: 'zakat-ushr',
      section: 'zakat',
      title: 'Ушр (транзитный налог)',
      description: 'Разбор отличий ‘ушра от госналогов и закята, а также правил транзитной пошлины.',
      href: 'zakat-ushr.html',
      label: 'Открыть статью'
    },
    {
      id: 'zakat-payment',
      section: 'zakat',
      title: 'О выплате закята',
      description: 'Что такое закят, как он стал обязательным и какие аяты подчеркивают его важность.',
      href: 'zakat-payment.html',
      label: 'Открыть статью'
    },
    {
      id: 'zakat-who-pays',
      section: 'zakat',
      title: 'Кто платит закят',
      description: 'Условия обязательности, нисаб, исключения и особенности выплаты закята в бизнесе.',
      href: 'zakat-who-pays.html',
      label: 'Открыть статью'
    },
    {
      id: 'zakat-directions',
      section: 'zakat',
      title: 'Направления реализации закята',
      description: 'Кому выплачивается закят согласно Корану и каковы правила его распределения.',
      href: 'zakat-directions.html',
      label: 'Открыть статью'
    }
  ];

  const ZAKAT_ARTICLE_IDS = ARTICLE_CATALOG.filter((article)=>article.section==='zakat').map((article)=>article.id);

  function normalizeDate(d){
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function getStartDate(){
    const saved = localStorage.getItem(RELEASE_START_KEY);
    if(saved){
      const parsed = new Date(saved);
      if(!Number.isNaN(parsed.getTime())) return normalizeDate(parsed);
    }
    const now = normalizeDate(new Date());
    localStorage.setItem(RELEASE_START_KEY, now.toISOString());
    return now;
  }

  function getReleaseState(){
    const start = getStartDate();
    const today = normalizeDate(new Date());
    const daysPassed = Math.max(0, Math.floor((today - start) / DAY_MS));
    const availableCount = Math.min(ARTICLE_CATALOG.length, Math.max(MIN_AVAILABLE_COUNT, daysPassed + 1));
    const availableArticles = ARTICLE_CATALOG.slice(0, availableCount);
    const publishedIds = new Set(availableArticles.map((a)=>a.id));
    const allZakatPublished = ZAKAT_ARTICLE_IDS.every((id)=>publishedIds.has(id));
    const remainingDaysToAll = Math.max(0, ZAKAT_ARTICLE_IDS.reduce((maxPos,id)=>{
      const idx = ARTICLE_CATALOG.findIndex((a)=>a.id===id);
      return Math.max(maxPos, idx + 1);
    },0) - availableCount);

    return {
      start,
      today,
      totalArticles: ARTICLE_CATALOG.length,
      availableCount,
      availableArticles,
      allZakatPublished,
      remainingDaysToAll,
      nextArticle: ARTICLE_CATALOG[availableCount] || null,
      articles: ARTICLE_CATALOG
    };
  }

  function showReleaseNotification(releaseState){
    if(!('Notification' in window)) return;
    const currentCount = releaseState.availableCount;
    const lastNotified = Number(localStorage.getItem(RELEASE_LAST_NOTIFIED_KEY) || '0');
    if(currentCount <= lastNotified) return;

    const title = 'Новая статья в «Познавательно»';
    const body = `Сегодня опубликована: ${releaseState.availableArticles[currentCount - 1].title}`;
    const notify = () => {
      try{
        if('serviceWorker' in navigator){
          navigator.serviceWorker.getRegistration().then((reg)=>{
            if(reg && reg.showNotification){
              reg.showNotification(title, { body, tag: 'ramadan-material-release' });
            } else {
              new Notification(title, { body, tag: 'ramadan-material-release' });
            }
          }).catch(()=>{ new Notification(title, { body, tag: 'ramadan-material-release' }); });
        } else {
          new Notification(title, { body, tag: 'ramadan-material-release' });
        }
      }catch(e){}
      localStorage.setItem(RELEASE_LAST_NOTIFIED_KEY, String(currentCount));
    };

    if(Notification.permission === 'granted'){
      notify();
      return;
    }
    if(Notification.permission === 'default'){
      Notification.requestPermission().then((permission)=>{
        if(permission === 'granted') notify();
      }).catch(()=>{});
    }
  }

  window.ContentRelease = {
    RELEASE_START_KEY,
    ARTICLE_CATALOG,
    ZAKAT_ARTICLE_IDS,
    getZakatArticles: ()=>ARTICLE_CATALOG.filter((article)=>article.section==='zakat'),
    getReleaseState,
    showReleaseNotification
  };
})();
