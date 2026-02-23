const articles = [
  {
    title: 'Женщины, запретные для брака',
    description: 'Краткая памятка о том, кто такие махрамы, какие бывают категории и какие правила связаны с этим статусом.',
    href: 'mahram.html',
    label: 'Открыть статью'
  }
];

const list = document.getElementById('articlesList');
const count = document.getElementById('articlesCount');

if (count) {
  count.textContent = String(articles.length);
}

list.innerHTML = articles
  .map((article) => `
    <a class="article-link" href="${article.href}">
      <div class="article-title">${article.title}</div>
      <div class="article-desc">${article.description}</div>
      <div class="article-meta">${article.label} →</div>
    </a>
  `)
  .join('');
