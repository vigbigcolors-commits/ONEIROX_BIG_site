(function () {
  var btn = document.getElementById('back-to-top');
  if (!btn) return;

  var visible = false;
  var threshold = 480;

  function toggle() {
    var show = window.scrollY > threshold;
    if (show === visible) return;
    visible = show;
    btn.classList.toggle('is-visible', show);
    btn.setAttribute('aria-hidden', show ? 'false' : 'true');
    btn.tabIndex = show ? 0 : -1;
  }

  btn.addEventListener('click', function () {
    var behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    window.scrollTo({ top: 0, behavior: behavior });
    btn.blur();
  });

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
})();
