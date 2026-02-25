const THEME_KEY = 'ramTheme';
const READ_PROGRESS_KEY = 'ramReadProgress';
const READ_COMPAT_KEY = 'ramReadArticles';
const WORDS_PER_MINUTE = 180;

function applyThemeFromStorage() {
  const theme = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  const metaTheme = document.getElementById('metaThemeColor');
  if (metaTheme) {
    metaTheme.setAttribute('content', theme === 'dark' ? '#100e0c' : '#c49a3c');
  }
}

function parseStoredObject(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
}

function getProgressMap() {
  return parseStoredObject(READ_PROGRESS_KEY);
}

function getCompatReadMap() {
  return parseStoredObject(READ_COMPAT_KEY);
}

function stripToWords(text) {
  const words = text.match(/[A-Za-zА-Яа-яЁё0-9]+/g);
  return words ? words.length : 0;
}

async function estimateArticleTime(article) {
  try {
    const response = await fetch(article.href, { cache: 'no-store' });
    const html = await response.text();
    const documentFromArticle = new DOMParser().parseFromString(html, 'text/html');
    documentFromArticle.querySelectorAll('script, style, noscript').forEach((el) => el.remove());
    const text = (documentFromArticle.querySelector('main') || documentFromArticle.body)?.textContent || '';
    const words = stripToWords(text);
    const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
    return { minutes, seconds: minutes * 60 };
  } catch (error) {
    return { minutes: 1, seconds: 60 };
  }
}

function renderNextReleaseHint(releaseState) {
  const container = document.getElementById('releaseHint');
  if (!container) return;
  if (!releaseState.nextArticle) {
    container.textContent = 'Все материалы уже опубликованы.';
    return;
  }
  container.textContent = `Следующая публикация завтра: «${releaseState.nextArticle.title}».`;
}

async function renderArticles() {
  const unreadList = document.getElementById('unreadArticlesList');
  const readList = document.getElementById('readArticlesList');
  const readEmpty = document.getElementById('readEmptyState');

  const totalCount = document.getElementById('articlesCount');
  const unreadCount = document.getElementById('unreadCount');
  const readCount = document.getElementById('readCount');

  unreadList.innerHTML = '<div class="empty-state">Подготовка материалов…</div>';
  readList.innerHTML = '';

  const progressMap = getProgressMap();
  const compatReadMap = getCompatReadMap();
  const releaseState = window.ContentRelease.getReleaseState();
  const publishedArticles = releaseState.availableArticles;

  renderNextReleaseHint(releaseState);
  window.ContentRelease.showReleaseNotification(releaseState);

  const articlesWithTime = await Promise.all(
    publishedArticles.map(async (article) => ({
      ...article,
      reading: await estimateArticleTime(article)
    }))
  );

  const readArticles = [];
  const unreadArticles = [];

  articlesWithTime.forEach((article) => {
    const progress = progressMap[article.id];
    const isRead = Boolean((progress && progress.completed) || compatReadMap[article.id]);
    if (isRead) {
      readArticles.push(article);
    } else {
      unreadArticles.push(article);
    }
  });

  unreadList.innerHTML = unreadArticles
    .map((article) => `
      <a class="article-link" href="${article.href}">
        <div class="article-title">${article.title}</div>
        <div class="article-desc">${article.description}</div>
        <div class="article-meta">⏱ ~${article.reading.minutes} мин · ${article.label} →</div>
      </a>
    `)
    .join('') || '<div class="empty-state">Новых статей нет.</div>';

  readList.innerHTML = readArticles
    .map((article) => `
      <a class="article-link read" href="${article.href}">
        <div class="article-title">${article.title}</div>
        <div class="article-desc">Прочитано · ~${article.reading.minutes} мин</div>
      </a>
    `)
    .join('');

  if (readEmpty) {
    readEmpty.classList.toggle('hidden', readArticles.length > 0);
  }

  if (totalCount) totalCount.textContent = String(releaseState.totalArticles);
  if (unreadCount) unreadCount.textContent = String(unreadArticles.length);
  if (readCount) readCount.textContent = String(readArticles.length);
}

applyThemeFromStorage();
renderArticles();

window.addEventListener('storage', (event) => {
  if (event.key === THEME_KEY) {
    applyThemeFromStorage();
  }
  if (event.key === READ_PROGRESS_KEY || event.key === READ_COMPAT_KEY || event.key === window.ContentRelease.RELEASE_START_KEY) {
    renderArticles();
  }
});
