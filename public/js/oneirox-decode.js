/* ════════════════════════════════════════════════════════════════
   ONEIROX DECODE v1.0 — ISOLATED MODULE
   ⚠️ DO NOT EDIT unless changing decode API behaviour.

   HTML CONTRACT (required selectors):
     .onx-search-wrap
     .onx-search-wrap form
     form input[type="search"] or input[type="text"]
     form button[type="submit"]
   Creates dynamically: #onx-decode-result, #onx-mapper-banner
════════════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var searchWrap = document.querySelector('.onx-search-wrap');
  var searchForm = searchWrap ? searchWrap.querySelector('form') : null;
  if (!searchForm) return;

  var resultBox = document.getElementById('onx-decode-result');
  if (!resultBox) {
    resultBox = document.createElement('div');
    resultBox.id = 'onx-decode-result';
    searchWrap.parentNode.insertBefore(resultBox, searchWrap.nextSibling);
  }

  /* ── MAPPER CONTEXT BANNER ── */
  var mapperData = null;
  try {
    var _mRaw = localStorage.getItem('onx_mapper_data');
    if (_mRaw) {
      var _mParsed = JSON.parse(_mRaw);
      if (Date.now() - _mParsed.timestamp < 30 * 60 * 1000) {
        mapperData = _mParsed;
      } else {
        localStorage.removeItem('onx_mapper_data');
      }
    }
  } catch (e) {}

  /* Restore dream text after Mapper refine (Clarify somatics) */
  try {
    var _pendingRaw = localStorage.getItem('onx_pending_dream');
    if (_pendingRaw) {
      var _pending = JSON.parse(_pendingRaw);
      if (_pending && _pending.text && Date.now() - (_pending.ts || 0) < 2 * 60 * 60 * 1000) {
        var _inp = searchForm.querySelector('textarea') ||
          searchForm.querySelector('input[type="search"]') ||
          searchForm.querySelector('input[type="text"]');
        if (_inp && !_inp.value.trim()) _inp.value = _pending.text;
      }
    }
  } catch (e) {}

  if (mapperData && !document.getElementById('onx-mapper-banner')) {
    var banner = document.createElement('div');
    banner.id = 'onx-mapper-banner';
    banner.className = 'onx-mapper-banner';
    var _tags = [mapperData.thermal];
    if (mapperData.textures && mapperData.textures.length) _tags = _tags.concat(mapperData.textures);
    banner.innerHTML = '<span class="onx-mapper-banner__text">'
      + '◈ <strong>Somatic context loaded:</strong> '
      + mapperData.profile.name + ' · ' + _tags.join(' · ')
      + '</span>'
      + '<button type="button" id="onx-banner-clear" class="onx-mapper-banner__clear">✕ clear</button>';
    searchWrap.parentNode.insertBefore(banner, searchWrap);
    document.getElementById('onx-banner-clear').addEventListener('click', function () {
      localStorage.removeItem('onx_mapper_data');
      mapperData = null;
      banner.remove();
    });
  }

  function getInput() {
    return searchForm.querySelector('textarea') ||
           searchForm.querySelector('input[type="search"]') ||
           searchForm.querySelector('input[type="text"]');
  }

  function parseSection(text, tag) {
    var re = new RegExp('\\[' + tag + '\\]([\\s\\S]*?)(?=\\[|$)');
    var m = text.match(re);
    return m ? m[1].trim() : '';
  }

  function parseMd(t) {
    return t
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+?)\*/g, '<em>$1</em>');
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showError(msg) {
    resultBox.innerHTML = '<span class="onx-decode__error">' + escapeHtml(msg) + '</span>';
  }

  function renderResult(raw) {
    if (!raw || typeof raw !== 'string') {
      showError('Something went wrong. Try again.');
      return;
    }
    var signal  = parseSection(raw, 'SIGNAL');
    var body    = parseSection(raw, 'BODY');
    var morning = parseSection(raw, 'MORNING');
    var html    = '';

    if (signal) {
      html += '<div class="onx-decode__signal">'
        + parseMd(signal.replace(/^\*+|\*+$/g, '').trim())
        + '</div>';
    }

    if (body) {
      html += body.split('\n\n').map(function (p) {
        var clean = p.replace(/^\*+|\*+$/g, '').trim();
        if (!clean) return '';
        return '<p class="onx-decode__para">' + parseMd(clean) + '</p>';
      }).join('');
    }

    if (morning) {
      html += '<div class="onx-decode__morning">'
        + parseMd(morning.replace(/^\*+|\*+$/g, '').trim())
        + '</div>';
    }

    resultBox.innerHTML = html || raw;
  }

  searchForm.addEventListener('submit', function (e) {
    var input = getInput();
    var text  = input ? input.value.trim() : '';
    if (!text) return;
    e.preventDefault();

    var pageLang = (document.documentElement.lang || 'en').toLowerCase().slice(0, 2);
    if (location.pathname.indexOf('/ru') === 0) pageLang = 'ru';

    var loadingText = pageLang === 'ru'
      ? 'Мозг читает сигнал…'
      : 'The brain is reading the signal…';
    var errGeneric = pageLang === 'ru'
      ? 'Что-то пошло не так. Попробуйте ещё раз.'
      : 'Something went wrong. Try again.';
    var errNetwork = pageLang === 'ru'
      ? 'Не удалось связаться с декодером. Проверьте соединение и попробуйте снова.'
      : 'Could not reach the decoder. Check your connection and try again.';
    var btnLabel = 'Decode';
    var btnReading = pageLang === 'ru' ? 'Читаю…' : 'Reading…';

    var btn = searchForm.querySelector('button[type="submit"]') || searchForm.querySelector('button');
    if (btn) { btn.disabled = true; btn.textContent = btnReading; }
    resultBox.style.display = 'block';
    resultBox.classList.add('is-loading');

    resultBox.innerHTML = '<div class="onx-decode__loading">'
      + '<div class="onx-decode__loading-text">' + loadingText + '</div>'
      + '<div class="onx-decode__progress-track">'
      + '<div class="onx-decode__progress-bar" id="onx-prog-bar"></div>'
      + '</div></div>';

    var _progEl = document.getElementById('onx-prog-bar');
    var _prog = 0;
    var _progInt = setInterval(function () {
      _prog += (100 - _prog) * 0.07;
      if (_progEl) _progEl.style.width = Math.min(_prog, 92) + '%';
    }, 400);

    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    var apiText = text;
    if (mapperData) {
      apiText += '\n\n[SOMATIC CONTEXT from Sensory Mapper]'
        + '\nProfile: ' + mapperData.profile.name + ' (' + mapperData.profile.code + ')'
        + '\nThermal: ' + mapperData.thermal
        + (mapperData.textures && mapperData.textures.length ? '\nTextures: ' + mapperData.textures.join(', ') : '')
        + (mapperData.zones && mapperData.zones.length ? '\nBody zones: ' + mapperData.zones.join(', ') : '')
        + (mapperData.sound ? '\nSound: ' + mapperData.sound : '')
        + '\nBio-signal: ' + mapperData.signal + '/99';
    }

    var apiUrl = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
      ? 'http://127.0.0.1:8000/analyze'
      : 'https://oneirox-api-production.up.railway.app/analyze';

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: apiText, lang: pageLang })
    })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, status: r.status, data: data };
        });
      })
      .then(function (res) {
        resultBox.classList.remove('is-loading');
        if (!res.ok) {
          var msg = (res.data && res.data.detail)
            ? res.data.detail
            : errGeneric;
          if (Array.isArray(msg)) {
            msg = msg.map(function (item) { return item.msg || item; }).join(' ');
          }
          showError(msg);
          return;
        }
        if (!res.data || !res.data.interpretation) {
          showError(errGeneric);
          return;
        }
        renderResult(res.data.interpretation);
        document.dispatchEvent(new CustomEvent('onx-decode-result', {
          detail: {
            raw: res.data.interpretation,
            dream: text,
            lang: pageLang
          }
        }));
      })
      .catch(function () {
        resultBox.classList.remove('is-loading');
        showError(errNetwork);
      })
      .finally(function () {
        clearInterval(_progInt);
        if (_progEl) _progEl.style.width = '100%';
        if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
      });
  });
});
