/**
 * Oneirox — Sleep Cycle Lab
 * Zero-API calculator. Ultradian rhythm ~90 min (Kleitman), +14 min sleep-onset latency.
 */
(function () {
  'use strict';

  var CYCLE_MIN = 90;
  var ONSET_MIN = 14;

  var root = document.getElementById('cyc-root');
  if (!root) return;

  var btnWake = document.getElementById('cyc-mode-wake');
  var btnBed = document.getElementById('cyc-mode-bed');
  var timeLabel = document.getElementById('cyc-time-label');
  var timeInput = document.getElementById('cyc-time-input');
  var nowBtn = document.getElementById('cyc-now-btn');
  var calcBtn = document.getElementById('cyc-calc-btn');
  var results = document.getElementById('cyc-results');
  var resultsLabel = document.getElementById('cyc-results-label');
  var mechText = document.getElementById('cyc-mech-text');

  var mode = 'wake'; // 'wake' = user gives wake time, we suggest bedtimes. 'bed' = opposite.

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function fmtTime(d) {
    var h = d.getHours();
    var m = d.getMinutes();
    var suffix = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return h12 + ':' + pad(m) + ' ' + suffix;
  }

  function fmtDuration(min) {
    var h = Math.floor(min / 60);
    var m = min % 60;
    return h + 'h ' + (m ? pad(m) + 'm' : '');
  }

  function labelFor(n) {
    if (n === 6) return { label: 'Full restoration', badge: true };
    if (n === 5) return { label: 'Solid recovery', badge: false };
    if (n === 4) return { label: 'Minimum viable', badge: false };
    return { label: 'Short — expect sleep inertia', badge: false };
  }

  function setMode(next) {
    mode = next;
    btnWake.classList.toggle('is-active', mode === 'wake');
    btnBed.classList.toggle('is-active', mode === 'bed');
    timeLabel.textContent = mode === 'wake' ? 'I need to wake up at' : 'I am going to sleep at';
    calcBtn.textContent = mode === 'wake' ? 'Find bedtimes \u2192' : 'Find wake times \u2192';
    results.classList.remove('is-visible');
  }

  function parseTimeInput(val) {
    if (!val) return null;
    var parts = val.split(':');
    if (parts.length !== 2) return null;
    var h = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    var d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }

  function render(list, forWake) {
    resultsLabel.textContent = forWake
      ? 'Go to sleep at one of these times'
      : 'You will surface near one of these times';
    var html = '';
    list.forEach(function (item) {
      var info = labelFor(item.n);
      html += '<div class="onx-cyc-result' + (info.badge ? ' onx-cyc-result--best' : '') + '">'
        + '<div class="onx-cyc-result__time">' + fmtTime(item.time) + '</div>'
        + '<div class="onx-cyc-result__body">'
        + '<p class="onx-cyc-result__label">' + item.n + ' cycles \u00b7 ' + fmtDuration(item.n * CYCLE_MIN) + ' asleep</p>'
        + '<p class="onx-cyc-result__meta">' + info.label + '</p>'
        + '</div>'
        + (info.badge ? '<span class="onx-cyc-result__badge">Best</span>' : '')
        + '</div>';
    });
    results.innerHTML = '<p class="onx-cyc-results__label" id="cyc-results-label">' + resultsLabel.textContent + '</p>' + html;
    results.classList.add('is-visible');
    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function calcFromWake(wakeDate) {
    var list = [];
    for (var n = 6; n >= 3; n--) {
      var totalMin = n * CYCLE_MIN + ONSET_MIN;
      var bed = new Date(wakeDate.getTime() - totalMin * 60000);
      list.push({ n: n, time: bed });
    }
    render(list, true);
    mechText.textContent = 'Your brain needs about ' + ONSET_MIN + ' minutes to fall asleep, then cycles through ~90-minute blocks of NREM and REM. Waking between cycles (light sleep) feels sharp. Waking mid-cycle triggers sleep inertia — grogginess from an interrupted slow-wave or REM phase.';
  }

  function calcFromBed(bedDate) {
    var list = [];
    for (var n = 3; n <= 6; n++) {
      var totalMin = n * CYCLE_MIN + ONSET_MIN;
      var wake = new Date(bedDate.getTime() + totalMin * 60000);
      list.push({ n: n, time: wake });
    }
    render(list, false);
    mechText.textContent = 'Counting forward from sleep onset (~' + ONSET_MIN + ' min after lights-out), each 90-minute block completes one full NREM\u2192REM cycle. Set an alarm near a cycle boundary — not mid-cycle — to avoid sleep inertia.';
  }

  function run() {
    var d = parseTimeInput(timeInput.value);
    if (!d) return;
    if (mode === 'wake') calcFromWake(d);
    else calcFromBed(d);
  }

  btnWake.addEventListener('click', function () { setMode('wake'); });
  btnBed.addEventListener('click', function () { setMode('bed'); });
  calcBtn.addEventListener('click', run);
  timeInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });

  nowBtn.addEventListener('click', function () {
    var now = new Date();
    timeInput.value = pad(now.getHours()) + ':' + pad(now.getMinutes());
    if (mode !== 'bed') setMode('bed');
    run();
  });

  setMode('wake');
})();
