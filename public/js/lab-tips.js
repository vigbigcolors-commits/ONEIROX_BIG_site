/**
 * Tonight's Lab tip rotator — standalone, no defer, no search dependency.
 * Sequential cycle so each click visibly changes the line.
 */
(function () {
  'use strict';

  var TIPS = [
    { body: 'Name the body first, then the image — chest weight before “snake.” Search reads that order better.', meta: 'SIGNAL · BODY · MORNING — Oneirox method' },
    { body: 'A cool, dark room (~18–19°C) and a fixed wake time do more for dream recall than any symbol dictionary.', meta: 'Sleep hygiene · circadian anchor' },
    { body: 'Alcohol after dinner fragments second-half REM. Vivid, sticky dreams often follow — physiology, not prophecy.', meta: 'REM architecture' },
    { body: 'Caffeine after mid-afternoon can blunt deep sleep and leave you with light, plot-heavy nights.', meta: 'Adenosine · sleep depth' },
    { body: 'If you wake at 3am racing thoughts, jot one body note and return to bed — decoding at dawn beats decoding at dawn’s panic.', meta: 'Cortisol awakening response' },
    { body: 'Morning outdoor light within an hour of waking stabilizes the clock that decides when REM pressure peaks.', meta: 'Circadian timing' },
    { body: 'Jaw sore on waking? Bruxism and threat-rehearsal often travel together — map the mouth before the plot.', meta: 'Somatic marker' },
    { body: 'Heavy late meals raise night arousals. The “chase” may be autonomic noise wearing a costume.', meta: 'Autonomic load' },
    { body: 'Phones in bed delay melatonin. Dim screens an hour before sleep if you want cleaner REM later.', meta: 'Light · melatonin' },
    { body: 'Recurring dreams often mean unfinished consolidation — same mechanism file still open, not a curse.', meta: 'Emotional memory' },
    { body: 'Cannot move / chest pressure on waking: check sleep paralysis and atonia pages before omen blogs.', meta: 'REM atonia' },
    { body: 'Write three words max on waking: place · person · body. That triad beats a novel you will forget by breakfast.', meta: 'Dream recall craft' },
    { body: 'Homeland images (Ararat, Yerevan, grandmother) are dense place and attachment files — culture is the scene, not the oracle.', meta: 'Place memory · diaspora' },
    { body: 'Naps longer than ~20 minutes can steal REM pressure from tonight. Short reset; long nap reshuffles the script.', meta: 'Ultradian balance' },
    { body: 'Stress days load threat-simulation nights. A 10-minute walk after work lowers the amygdala dye more than interpretation.', meta: 'Threat rehearsal' }
  ];

  function rootFrom(el) {
    if (!el || !el.closest) return document.querySelector('[data-lab-search-tip]');
    return el.closest('[data-lab-search-tip]');
  }

  function show(root, advance) {
    if (!root || !TIPS.length) return;
    var body = root.querySelector('[data-lab-search-tip-body]');
    var meta = root.querySelector('[data-lab-search-tip-meta]');
    if (!body) return;
    var i = parseInt(root.getAttribute('data-tip-i') || '0', 10);
    if (isNaN(i) || i < 0) i = 0;
    if (advance) {
      var now = Date.now();
      if (now - (show._lock || 0) < 120) return;
      show._lock = now;
      i = (i + 1) % TIPS.length;
    }
    root.setAttribute('data-tip-i', String(i));
    body.textContent = TIPS[i].body;
    if (meta) meta.textContent = TIPS[i].meta || '';
  }

  window.__onxCycleLabTip = function (ev) {
    var btn = ev && ev.target ? ev.target : ev;
    if (ev && ev.preventDefault) {
      ev.preventDefault();
      ev.stopPropagation();
    }
    if (btn && btn.closest) btn = btn.closest('[data-lab-search-tip-next]') || btn;
    show(rootFrom(btn), true);
    return false;
  };

  document.addEventListener(
    'click',
    function (e) {
      var btn = e.target && e.target.closest && e.target.closest('[data-lab-search-tip-next]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      show(rootFrom(btn), true);
    },
    true
  );
})();
