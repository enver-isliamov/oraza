(function (w, d, id) {
  if (w.__YA_METRICA_INITIALIZED__) {
    return;
  }

  w.__YA_METRICA_INITIALIZED__ = true;
  w.dataLayer = w.dataLayer || [];

  (function (m, e, t, r, i, k, a) {
    m[i] =
      m[i] ||
      function () {
        (m[i].a = m[i].a || []).push(arguments);
      };
    m[i].l = 1 * new Date();

    for (var j = 0; j < d.scripts.length; j += 1) {
      if (d.scripts[j].src === r) {
        return;
      }
    }

    k = e.createElement(t);
    a = e.getElementsByTagName(t)[0];
    k.async = 1;
    k.src = r;
    a.parentNode.insertBefore(k, a);
  })(w, d, "script", "https://mc.yandex.ru/metrika/tag.js?id=" + id, "ym");

  w.ym(id, "init", {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: "dataLayer",
    referrer: d.referrer,
    url: w.location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  });
})(window, document, 106936532);
