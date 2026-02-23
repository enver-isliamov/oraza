const THEME_KEY = 'ramTheme';
const READ_KEY = 'ramReadArticles';

const articles = [
  {
    id: 'mahram',
    title: 'Женщины, запретные для брака',
    description: 'Краткая памятка о том, кто такие махрамы, какие бывают категории и какие правила связаны с этим статусом.',
    href: 'mahram.html',
    label: 'Открыть статью'
  }
];

function applyThemeFromStorage() {
  const theme = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  const metaTheme = document.getElementById('metaThemeColor');
  if (metaTheme) {
    metaTheme.setAttribute('content', theme === 'dark' ? '#100e0c' : '#c49a3c');
  }
}

function getReadMap() {
  try {
    const parsed = JSON.parse(localStorage.getItem(READ_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
}

function renderArticles() {
  const unreadList = document.getElementById('unreadArticlesList');
  const readList = document.getElementById('readArticlesList');
  const readEmpty = document.getElementById('readEmptyState');

  const totalCount = document.getElementById('articlesCount');
  const unreadCount = document.getElementById('unreadCount');
  const readCount = document.getElementById('readCount');

  const readMap = getReadMap();
  const readArticles = [];
  const unreadArticles = [];

  articles.forEach((article) => {
    if (readMap[article.id]) {
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
        <div class="article-meta">${article.label} →</div>
      </a>
    `)
    .join('');

  readList.innerHTML = readArticles
    .map((article) => `
      <a class="article-link read" href="${article.href}">
        <div class="article-title">${article.title}</div>
        <div class="article-desc">Прочитано. Нажмите, чтобы повторить материал.</div>
      </a>
    `)
    .join('');

  if (readEmpty) {
    readEmpty.classList.toggle('hidden', readArticles.length > 0);
  }

  if (totalCount) totalCount.textContent = String(articles.length);
  if (unreadCount) unreadCount.textContent = String(unreadArticles.length);
  if (readCount) readCount.textContent = String(readArticles.length);
}

applyThemeFromStorage();
renderArticles();
window.addEventListener('storage', (event) => {
  if (event.key === THEME_KEY) {
    applyThemeFromStorage();
  }
  if (event.key === READ_KEY) {
    renderArticles();
  }
});
