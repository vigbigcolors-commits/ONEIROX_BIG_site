/**
 * Defer non-critical scripts + analytics until after first paint.
 * Hero neural background loads directly from index.html (not here).
 */
(function () {
  'use strict';

  var DEFERRED = [
    '/js/oneirox-share.js',
    '/js/back-to-top.js'
  ];

  function loadScript(src) {
    if (document.querySelector('script[src="' + src + '"]')) return;
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    s.setAttribute('data-cfasync', 'false');
    document.body.appendChild(s);
  }

  function loadDeferred() {
    DEFERRED.forEach(loadScript);
  }

  function loadAnalytics() {
    if (window.__onxGtagLoaded) return;
    window.__onxGtagLoaded = true;
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-R95EFBPZ6R', { transport_type: 'beacon' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-R95EFBPZ6R';
    s.setAttribute('data-cfasync', 'false');
    document.head.appendChild(s);
  }

  bindScrollPause();

  var ran = false;
  function schedule() {
    if (ran) return;
    ran = true;
    if ('requestIdleCallback' in window) {
      requestIdleCallback(function () {
        loadDeferred();
        loadAnalytics();
      }, { timeout: 1800 });
    } else {
      setTimeout(function () {
        loadDeferred();
        loadAnalytics();
      }, 800);
    }
  }

  function bindScrollPause() {
    if (window.__onxScrollPauseBound) return;
    window.__onxScrollPauseBound = true;
    var scrolling = false;
    var timer = 0;
    var root = document.documentElement;
    window.addEventListener(
      'scroll',
      function () {
        if (!scrolling) {
          scrolling = true;
          root.classList.add('is-scrolling');
        }
        clearTimeout(timer);
        timer = setTimeout(function () {
          scrolling = false;
          root.classList.remove('is-scrolling');
        }, 120);
      },
      { passive: true }
    );
  }

  // Hard fallbacks: idle path alone can miss if load/complete never settles (CF quirks).
  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(schedule, 2000);
    }, { once: true });
  }
  setTimeout(schedule, 3500);
})();
