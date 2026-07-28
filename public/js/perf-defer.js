/**
 * Defer non-critical scripts + analytics until after load + idle (mobile PageSpeed).
 */
(function () {
  'use strict';

  var DEFERRED = [
    '/js/oneirox-neural-bg.js',
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

  function schedule() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(function () {
        loadDeferred();
        loadAnalytics();
      }, { timeout: 2500 });
    } else {
      setTimeout(function () {
        loadDeferred();
        loadAnalytics();
      }, 1200);
    }
  }

  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
})();
