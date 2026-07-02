/**
 * Defer non-critical scripts until after load + idle (mobile PageSpeed).
 */
(function () {
  'use strict';

  var DEFERRED = [
    '/js/oneirox-neural-bg.js',
    '/js/oneirox-share.js',
    '/js/back-to-top.js'
  ];

  function loadDeferred() {
    DEFERRED.forEach(function (src) {
      if (document.querySelector('script[src="' + src + '"]')) return;
      var s = document.createElement('script');
      s.src = src;
      s.defer = true;
      s.setAttribute('data-cfasync', 'false');
      document.body.appendChild(s);
    });
  }

  function schedule() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadDeferred, { timeout: 2800 });
    } else {
      setTimeout(loadDeferred, 1500);
    }
  }

  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
})();
