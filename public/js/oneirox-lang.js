/* Remember language choice. No geo-redirect — SEO-safe. */
(function () {
  'use strict';
  var path = location.pathname || '/';
  var isRu = path === '/ru' || path.indexOf('/ru/') === 0;
  try {
    localStorage.setItem('onx_lang', isRu ? 'ru' : 'en');
  } catch (e) {}

  document.querySelectorAll('.site-lang a').forEach(function (a) {
    a.addEventListener('click', function () {
      var lang = a.getAttribute('hreflang') || (a.lang === 'ru' ? 'ru' : 'en');
      try {
        localStorage.setItem('onx_lang', lang);
      } catch (err) {}
    });
  });
})();
