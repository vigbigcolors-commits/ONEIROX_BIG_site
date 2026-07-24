/* ════════════════════════════════════════════════════════════════
   ONEIROX DECODE ACTIONS v3
   Unified bar · journal · print · morning check-in · 7-day patterns
   · mapper refine · night compare · SIGNAL stories card hook
   Does NOT touch sacred .onx-search-wrap / decode API contract.
════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var JOURNAL_KEY = 'onx_dream_journal';
  var PENDING_KEY = 'onx_pending_dream';
  var CHECKIN_SKIP_KEY = 'onx_checkin_skip';
  var MAX_ENTRIES = 60;
  var CHECKIN_MIN_MS = 8 * 60 * 60 * 1000;
  var CHECKIN_MAX_MS = 12 * 60 * 60 * 1000;
  var WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  var lastEntry = null;
  var checkinTimer = null;

  /* ── i18n ── */
  function lang() {
    var l = (document.documentElement.lang || 'en').toLowerCase().slice(0, 2);
    if (location.pathname.indexOf('/ru') === 0) l = 'ru';
    return l === 'ru' ? 'ru' : 'en';
  }

  function t(key) {
    var ru = lang() === 'ru';
    var map = {
      shareCard: ru ? 'Карточка' : 'Share Card',
      signalCard: ru ? 'SIGNAL' : 'SIGNAL',
      copy: ru ? 'Копировать' : 'Copy',
      copyLink: ru ? 'Ссылка' : 'Copy link',
      save: ru ? 'В журнал' : 'Save',
      saved: ru ? 'Сохранено' : 'Saved',
      pdf: ru ? 'PDF' : 'PDF',
      journal: ru ? 'Журнал' : 'Journal',
      email: ru ? 'Email' : 'Email',
      empty: ru ? 'Пока пусто — Decode и Save.' : 'Empty — Decode, then Save.',
      close: ru ? 'Закрыть' : 'Close',
      delete: ru ? 'Удалить' : 'Delete',
      open: ru ? 'Открыть' : 'Open',
      copied: ru ? 'Скопировано' : 'Copied',
      title: ru ? 'Журнал снов' : 'Dream journal',
      hint: ru ? 'Только в этом браузере. На сервер не уходит.' : 'This browser only. Never uploaded.',
      label: ru ? 'Сохранить и поделиться' : 'Save & share your reading',
      refine: ru ? 'Уточнить соматику' : 'Clarify somatics',
      refineHint: ru ? 'Mapper → затем Decode с телесным контекстом' : 'Mapper → then Decode with body context',
      patterns: ru ? 'Паттерны 7 дней' : '7-day patterns',
      patternsEmpty: ru ? 'Мало записей за неделю — Decode ещё пару ночей.' : 'Need a few nights this week to spot patterns.',
      patternsLocal: ru ? 'Локально · без аккаунта' : 'Local · no account',
      checkinTitle: ru ? 'Утренний check-in' : 'Morning check-in',
      checkinQ: ru ? 'Что осталось в теле?' : 'What remains in the body?',
      checkinSub: ru ? 'Допишем к той же записи сна. 8–12 часов после Decode.' : 'Appended to the same dream entry. 8–12 hours after Decode.',
      checkinSave: ru ? 'Сохранить' : 'Save check-in',
      checkinLater: ru ? 'Позже' : 'Later',
      checkinSkip: ru ? 'Пропустить' : 'Skip',
      checkinSaved: ru ? 'Тело' : 'Body note',
      compareTitle: ru ? 'Эта ночь vs похожий SIGNAL' : 'This night vs similar SIGNAL',
      compareNone: ru ? 'Похожих ночей в журнале пока нет.' : 'No similar nights in your journal yet.',
      compareScore: ru ? 'совпадение' : 'match',
      compareOpen: ru ? 'Открыть прошлую' : 'Open past night',
    };
    return map[key] || key;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function parseSection(text, tag) {
    var re = new RegExp('\\[' + tag + '\\]([\\s\\S]*?)(?=\\[|$)');
    var m = String(text || '').match(re);
    return m ? m[1].trim() : '';
  }

  function uid() {
    return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function loadJournal() {
    try {
      var raw = localStorage.getItem(JOURNAL_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveJournal(arr) {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(arr.slice(0, MAX_ENTRIES)));
  }

  function findEntry(id) {
    return loadJournal().find(function (x) { return x.id === id; }) || null;
  }

  function upsertEntry(entry) {
    var prev = findEntry(entry.id);
    if (prev) {
      if (!entry.checkin && prev.checkin) entry.checkin = prev.checkin;
      if (entry.checkinSkipped == null && prev.checkinSkipped) entry.checkinSkipped = prev.checkinSkipped;
      if (!entry.ts || (prev.ts && entry.ts > prev.ts && entry.raw === prev.raw)) entry.ts = prev.ts;
    }
    var arr = loadJournal().filter(function (x) { return x.id !== entry.id; });
    arr.unshift(entry);
    saveJournal(arr);
    lastEntry = entry;
    bumpFabBadge();
    return entry;
  }

  function entryUrl(id) {
    var base = location.origin + (location.pathname.indexOf('/ru') === 0 ? '/ru/' : '/');
    return base + '#onx-entry=' + encodeURIComponent(id);
  }

  function formatPlain(entry) {
    var lines = ['ONEIROX · Neural reading', new Date(entry.ts).toLocaleString(), ''];
    if (entry.dream) lines.push('Dream:\n' + entry.dream, '');
    if (entry.signal) lines.push('SIGNAL\n' + entry.signal, '');
    if (entry.body) lines.push('BODY\n' + entry.body, '');
    if (entry.morning) lines.push('MORNING\n' + entry.morning, '');
    if (entry.checkin && entry.checkin.text) {
      lines.push('BODY CHECK-IN\n' + entry.checkin.text, '');
    }
    lines.push(entryUrl(entry.id));
    return lines.join('\n');
  }

  function toast(btn, label) {
    if (!btn) return;
    var prev = btn.getAttribute('data-label') || btn.textContent;
    btn.setAttribute('data-label', prev);
    btn.textContent = label;
    btn.classList.add('is-done');
    setTimeout(function () {
      btn.textContent = prev;
      btn.classList.remove('is-done');
    }, 1500);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
    return Promise.resolve();
  }

  /* ── Theme / similarity (local, no API) ── */
  var THEME_RULES = [
    { id: 'threat', en: 'Threat / fear', ru: 'Угроза / страх', keys: ['threat', 'fear', 'alarm', 'danger', 'угроз', 'страх', 'тревог'] },
    { id: 'flight', en: 'Run / flight', ru: 'Бег / побег', keys: ['sprint', 'run', 'flee', 'escape', 'бег', 'побег', 'убега'] },
    { id: 'freeze', en: 'Freeze / atonia', ru: 'Замирание / атония', keys: ['atonia', 'paralysis', 'freeze', 'still', 'immobil', 'атони', 'паралич', 'замир', 'неподвиж'] },
    { id: 'weight', en: 'Heaviness', ru: 'Тяжесть', keys: ['heav', 'weight', 'collapse', 'crush', 'тяжест', 'давлен', 'коллапс', 'раздавл'] },
    { id: 'fall', en: 'Fall / drop', ru: 'Падение', keys: ['fall', 'drop', 'sink', 'пада', 'провал'] },
    { id: 'chase', en: 'Chase', ru: 'Преследование', keys: ['chase', 'pursu', 'преслед', 'догоня'] },
    { id: 'thermal', en: 'Heat / cold', ru: 'Жар / холод', keys: ['heat', 'cold', 'temp', 'sweat', 'жар', 'холод', 'температ', 'пот'] },
    { id: 'heart', en: 'Heart / arousal', ru: 'Сердце / arousal', keys: ['heart', 'pulse', 'arousal', 'сердц', 'пульс', 'сердцеби'] },
    { id: 'voice', en: 'Voice / scream', ru: 'Голос / крик', keys: ['voice', 'scream', 'shout', 'голос', 'крик', 'кричат'] },
    { id: 'water', en: 'Water / drown', ru: 'Вода', keys: ['water', 'drown', 'flood', 'вод', 'тону', 'утоп'] },
    { id: 'motor', en: 'Motor mismatch', ru: 'Моторный сбой', keys: ['motor', 'cortex', 'brainstem', 'command', 'мотор', 'ствол', 'команд'] },
    { id: 'rem', en: 'REM / sleep gate', ru: 'REM / сон', keys: ['rem', 'dream sleep', 'sleep', 'rem-', 'фаз'] },
  ];

  var STOP = {
    the: 1, and: 1, with: 1, your: 1, this: 1, that: 1, from: 1, into: 1, during: 1,
    became: 1, became: 1, your: 1, their: 1, were: 1, was: 1, are: 1, for: 1, not: 1,
    all: 1, but: 1, you: 1, how: 1, what: 1, when: 1, which: 1, while: 1,
    это: 1, как: 1, что: 1, при: 1, или: 1, для: 1, был: 1, была: 1, были: 1,
  };

  function themesOf(signal) {
    var s = String(signal || '').toLowerCase();
    var out = [];
    THEME_RULES.forEach(function (rule) {
      for (var i = 0; i < rule.keys.length; i++) {
        if (s.indexOf(rule.keys[i]) !== -1) {
          out.push(rule.id);
          return;
        }
      }
    });
    return out;
  }

  function themeLabel(id) {
    var ru = lang() === 'ru';
    for (var i = 0; i < THEME_RULES.length; i++) {
      if (THEME_RULES[i].id === id) return ru ? THEME_RULES[i].ru : THEME_RULES[i].en;
    }
    return id;
  }

  function tokenSet(text) {
    var words = String(text || '').toLowerCase().replace(/[^a-zа-яё0-9\s-]/gi, ' ').split(/\s+/);
    var set = {};
    words.forEach(function (w) {
      if (w.length < 4 || STOP[w]) return;
      set[w] = 1;
    });
    return set;
  }

  function jaccard(a, b) {
    var keysA = Object.keys(a);
    if (!keysA.length) return 0;
    var inter = 0;
    var union = {};
    keysA.forEach(function (k) { union[k] = 1; if (b[k]) inter++; });
    Object.keys(b).forEach(function (k) { union[k] = 1; });
    var u = Object.keys(union).length;
    return u ? inter / u : 0;
  }

  function weekPatterns() {
    var now = Date.now();
    var counts = {};
    var nights = 0;
    loadJournal().forEach(function (e) {
      if (!e.ts || now - e.ts > WEEK_MS) return;
      nights++;
      themesOf(e.signal).forEach(function (id) {
        counts[id] = (counts[id] || 0) + 1;
      });
    });
    var ranked = Object.keys(counts).map(function (id) {
      return { id: id, n: counts[id], label: themeLabel(id) };
    }).sort(function (a, b) { return b.n - a.n; });
    return { nights: nights, ranked: ranked };
  }

  function findSimilar(entry) {
    if (!entry || !entry.signal) return null;
    var baseTokens = tokenSet(entry.signal);
    var baseThemes = themesOf(entry.signal);
    var best = null;
    loadJournal().forEach(function (other) {
      if (!other || other.id === entry.id || !other.signal) return;
      var score = jaccard(baseTokens, tokenSet(other.signal));
      var shared = themesOf(other.signal).filter(function (id) {
        return baseThemes.indexOf(id) !== -1;
      });
      if (shared.length) score += 0.12 * shared.length;
      if (score < 0.14) return;
      if (!best || score > best.score) {
        best = { entry: other, score: score, shared: shared };
      }
    });
    return best;
  }

  function buildEntry(detail) {
    var raw = detail.raw || '';
    return {
      id: detail.id || uid(),
      ts: detail.ts || Date.now(),
      dream: detail.dream || '',
      raw: raw,
      signal: parseSection(raw, 'SIGNAL'),
      body: parseSection(raw, 'BODY'),
      morning: parseSection(raw, 'MORNING'),
      lang: detail.lang || lang(),
      checkin: detail.checkin || null,
      checkinSkipped: !!detail.checkinSkipped,
    };
  }

  function syncShareModule(entry) {
    if (window.OneiroxShare && typeof window.OneiroxShare.setReading === 'function') {
      window.OneiroxShare.setReading({
        dream: entry.dream,
        signal: entry.signal,
        body: entry.body,
        morning: entry.morning,
        raw: entry.raw,
      });
    }
  }

  /* ── Journal UI ── */
  function bindJournalNavBtn() {
    var btn = document.getElementById('onx-journal-open');
    if (!btn) {
      var actions = document.querySelector('.site-header__actions');
      if (!actions) return;
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'onx-journal-open';
      btn.className = 'onx-journal-nav';
      btn.setAttribute('aria-label', t('journal'));
      btn.innerHTML =
        '<span class="onx-journal-nav__label">' + escapeHtml(t('journal')) + '</span>' +
        '<span class="onx-journal-nav__badge" id="onx-journal-badge" hidden></span>';
      var cta = actions.querySelector('.btn--primary');
      if (cta) actions.insertBefore(btn, cta);
      else actions.appendChild(btn);
    }
    if (btn.getAttribute('data-onx-bound') === '1') return;
    btn.setAttribute('data-onx-bound', '1');
    btn.addEventListener('click', openJournal);
  }

  function ensureJournalUi() {
    bindJournalNavBtn();
    if (document.getElementById('onx-journal-root')) return;
    var root = document.createElement('div');
    root.id = 'onx-journal-root';
    root.innerHTML =
      '<div class="onx-journal-drawer" id="onx-journal-drawer" hidden>' +
        '<div class="onx-journal-drawer__panel" role="dialog" aria-modal="true" aria-labelledby="onx-journal-title">' +
          '<header class="onx-journal-drawer__head">' +
            '<div class="onx-journal-drawer__brand">' +
              '<span class="onx-journal-drawer__mark" aria-hidden="true"></span>' +
              '<div>' +
                '<h2 id="onx-journal-title">' + escapeHtml(t('title')) + '</h2>' +
                '<p class="onx-journal-drawer__hint">' + escapeHtml(t('hint')) + '</p>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="onx-journal-drawer__close" id="onx-journal-close">' + escapeHtml(t('close')) + '</button>' +
          '</header>' +
          '<section class="onx-patterns" id="onx-patterns" aria-label="' + escapeHtml(t('patterns')) + '"></section>' +
          '<div class="onx-journal-drawer__list" id="onx-journal-list"></div>' +
        '</div>' +
      '</div>' +
      '<div class="onx-checkin" id="onx-checkin" hidden>' +
        '<div class="onx-checkin__card" role="dialog" aria-modal="true" aria-labelledby="onx-checkin-title">' +
          '<p class="onx-checkin__kicker">' + escapeHtml(t('checkinTitle')) + '</p>' +
          '<h3 id="onx-checkin-title">' + escapeHtml(t('checkinQ')) + '</h3>' +
          '<p class="onx-checkin__sub" id="onx-checkin-sub"></p>' +
          '<textarea id="onx-checkin-input" rows="4" maxlength="800" placeholder="' + escapeHtml(t('checkinQ')) + '"></textarea>' +
          '<div class="onx-checkin__actions">' +
            '<button type="button" class="onx-act onx-act--primary" id="onx-checkin-save">' + escapeHtml(t('checkinSave')) + '</button>' +
            '<button type="button" class="onx-act" id="onx-checkin-later">' + escapeHtml(t('checkinLater')) + '</button>' +
            '<button type="button" class="onx-act onx-act--ghost" id="onx-checkin-skip">' + escapeHtml(t('checkinSkip')) + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);
    document.getElementById('onx-journal-close').addEventListener('click', closeJournal);
    document.getElementById('onx-journal-drawer').addEventListener('click', function (e) {
      if (e.target.id === 'onx-journal-drawer') closeJournal();
    });
    document.getElementById('onx-checkin-save').addEventListener('click', saveCheckin);
    document.getElementById('onx-checkin-later').addEventListener('click', hideCheckin);
    document.getElementById('onx-checkin-skip').addEventListener('click', skipCheckin);
  }

  function bumpFabBadge() {
    var badge = document.getElementById('onx-journal-badge');
    if (!badge) return;
    var due = eligibleCheckin();
    if (due) {
      badge.hidden = false;
      badge.textContent = '1';
    } else {
      badge.hidden = true;
    }
  }

  function openJournal() {
    ensureJournalUi();
    renderPatterns();
    renderJournalList();
    document.getElementById('onx-journal-drawer').hidden = false;
    document.body.classList.add('onx-journal-open');
  }

  function closeJournal() {
    var drawer = document.getElementById('onx-journal-drawer');
    if (drawer) drawer.hidden = true;
    document.body.classList.remove('onx-journal-open');
  }

  function renderPatterns() {
    var el = document.getElementById('onx-patterns');
    if (!el) return;
    var data = weekPatterns();
    if (!data.ranked.length) {
      el.innerHTML =
        '<div class="onx-patterns__head"><strong>' + escapeHtml(t('patterns')) + '</strong>' +
        '<span>' + escapeHtml(t('patternsLocal')) + '</span></div>' +
        '<p class="onx-patterns__empty">' + escapeHtml(t('patternsEmpty')) + '</p>';
      return;
    }
    el.innerHTML =
      '<div class="onx-patterns__head"><strong>' + escapeHtml(t('patterns')) + '</strong>' +
      '<span>' + escapeHtml(t('patternsLocal')) + ' · ' + data.nights + '</span></div>' +
      '<ul class="onx-patterns__list">' +
      data.ranked.slice(0, 5).map(function (row) {
        return '<li><span>' + escapeHtml(row.label) + '</span><b>×' + row.n + '</b></li>';
      }).join('') +
      '</ul>';
  }

  function renderJournalList() {
    var list = document.getElementById('onx-journal-list');
    if (!list) return;
    var items = loadJournal();
    if (!items.length) {
      list.innerHTML = '<p class="onx-journal-empty">' + escapeHtml(t('empty')) + '</p>';
      return;
    }
    list.innerHTML = items.map(function (e) {
      var preview = (e.signal || e.dream || '').slice(0, 160);
      var tags = themesOf(e.signal).slice(0, 2).map(function (id) {
        return '<span class="onx-journal-tag">' + escapeHtml(themeLabel(id)) + '</span>';
      }).join('');
      var check = e.checkin && e.checkin.text
        ? '<p class="onx-journal-checkin"><strong>' + escapeHtml(t('checkinSaved')) + ':</strong> ' +
          escapeHtml(e.checkin.text.slice(0, 120)) + (e.checkin.text.length > 120 ? '…' : '') + '</p>'
        : '';
      return (
        '<article class="onx-journal-item" data-id="' + escapeHtml(e.id) + '">' +
          '<time datetime="' + escapeHtml(new Date(e.ts).toISOString()) + '">' +
            escapeHtml(new Date(e.ts).toLocaleString()) +
          '</time>' +
          (tags ? '<div class="onx-journal-tags">' + tags + '</div>' : '') +
          '<p>' + escapeHtml(preview) + (preview.length >= 160 ? '…' : '') + '</p>' +
          check +
          '<div class="onx-journal-item__actions">' +
            '<button type="button" data-act="open">' + escapeHtml(t('open')) + '</button>' +
            '<button type="button" data-act="copy">' + escapeHtml(t('copy')) + '</button>' +
            '<button type="button" data-act="del">' + escapeHtml(t('delete')) + '</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    list.querySelectorAll('.onx-journal-item').forEach(function (node) {
      node.addEventListener('click', function (ev) {
        var act = ev.target && ev.target.getAttribute('data-act');
        if (!act) return;
        var id = node.getAttribute('data-id');
        var entry = findEntry(id);
        if (!entry) return;
        if (act === 'open') {
          showEntryInResult(entry);
          closeJournal();
          var box = document.getElementById('onx-decode-result');
          if (box) box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (act === 'copy') {
          copyText(formatPlain(entry));
        } else if (act === 'del') {
          saveJournal(loadJournal().filter(function (x) { return x.id !== id; }));
          renderPatterns();
          renderJournalList();
          bumpFabBadge();
        }
      });
    });
  }

  function showEntryInResult(entry) {
    document.dispatchEvent(new CustomEvent('onx-decode-result', {
      detail: {
        raw: entry.raw,
        dream: entry.dream || '',
        lang: entry.lang || lang(),
        fromJournal: true,
        id: entry.id,
        ts: entry.ts,
        checkin: entry.checkin || null,
        checkinSkipped: !!entry.checkinSkipped,
      },
    }));
  }

  /* ── Morning check-in ── */
  function eligibleCheckin() {
    var now = Date.now();
    var skipUntil = 0;
    try { skipUntil = Number(sessionStorage.getItem(CHECKIN_SKIP_KEY) || 0); } catch (e) {}
    if (now < skipUntil) return null;
    var candidates = loadJournal().filter(function (e) {
      if (!e || !e.ts || e.checkin || e.checkinSkipped) return false;
      var age = now - e.ts;
      return age >= CHECKIN_MIN_MS && age <= CHECKIN_MAX_MS;
    });
    candidates.sort(function (a, b) { return b.ts - a.ts; });
    return candidates[0] || null;
  }

  function showCheckin(entry) {
    ensureJournalUi();
    var root = document.getElementById('onx-checkin');
    if (!root || !entry) return;
    root.setAttribute('data-id', entry.id);
    var sub = document.getElementById('onx-checkin-sub');
    var snippet = (entry.signal || entry.dream || '').slice(0, 110);
    sub.textContent = t('checkinSub') + (snippet ? ' · “' + snippet + (snippet.length >= 110 ? '…' : '') + '”' : '');
    var input = document.getElementById('onx-checkin-input');
    if (input) input.value = '';
    root.hidden = false;
  }

  function hideCheckin() {
    var root = document.getElementById('onx-checkin');
    if (root) root.hidden = true;
    try { sessionStorage.setItem(CHECKIN_SKIP_KEY, String(Date.now() + 45 * 60 * 1000)); } catch (e) {}
    bumpFabBadge();
  }

  function skipCheckin() {
    var root = document.getElementById('onx-checkin');
    var id = root && root.getAttribute('data-id');
    var entry = id ? findEntry(id) : null;
    if (entry) {
      entry.checkinSkipped = true;
      upsertEntry(entry);
    }
    if (root) root.hidden = true;
    bumpFabBadge();
  }

  function saveCheckin() {
    var root = document.getElementById('onx-checkin');
    var id = root && root.getAttribute('data-id');
    var input = document.getElementById('onx-checkin-input');
    var text = input ? input.value.trim() : '';
    if (!id || !text) {
      if (input) input.focus();
      return;
    }
    var entry = findEntry(id);
    if (!entry) return;
    entry.checkin = { ts: Date.now(), text: text };
    upsertEntry(entry);
    if (root) root.hidden = true;
    bumpFabBadge();
    if (lastEntry && lastEntry.id === entry.id) {
      lastEntry = entry;
      var box = document.getElementById('onx-decode-result');
      if (box && box.style.display !== 'none') {
        injectCheckinBlock(box, entry);
      }
    }
  }

  function injectCheckinBlock(resultBox, entry) {
    if (!entry.checkin || !entry.checkin.text) return;
    var old = resultBox.querySelector('.onx-decode__checkin');
    if (old) old.remove();
    var el = document.createElement('div');
    el.className = 'onx-decode__checkin';
    el.innerHTML =
      '<span class="onx-decode__checkin-label">' + escapeHtml(t('checkinSaved')) + '</span>' +
      '<p>' + escapeHtml(entry.checkin.text) + '</p>';
    var insight = resultBox.querySelector('.onx-decode-insight');
    var actions = resultBox.querySelector('.onx-decode-actions');
    if (insight) resultBox.insertBefore(el, insight);
    else if (actions) resultBox.insertBefore(el, actions);
    else resultBox.appendChild(el);
  }

  function scheduleCheckinProbe() {
    if (checkinTimer) clearInterval(checkinTimer);
    var probe = function () {
      var due = eligibleCheckin();
      bumpFabBadge();
      var root = document.getElementById('onx-checkin');
      if (due && root && root.hidden) showCheckin(due);
    };
    setTimeout(probe, 1200);
    checkinTimer = setInterval(probe, 5 * 60 * 1000);
  }

  /* ── Print / PDF: sheet is a direct body child so @media print can show it ── */
  function ensurePrintSheet() {
    var sheet = document.getElementById('onx-print-sheet');
    if (sheet) {
      if (sheet.parentNode !== document.body) document.body.appendChild(sheet);
      return sheet;
    }
    sheet = document.createElement('div');
    sheet.id = 'onx-print-sheet';
    sheet.setAttribute('aria-hidden', 'true');
    document.body.appendChild(sheet);
    return sheet;
  }

  function printBrainBlock() {
    var ru = lang() === 'ru';
    var kicker = ru ? 'Структуры мозга, которые читает Decode' : 'Brain structures Decode reads';
    var cards = ru
      ? [
          {
            n: '01', cls: 'amy', system: 'Лимбическая система', title: 'Миндалина', color: '#00a5a8',
            hit: '<ellipse cx="78" cy="88" rx="14" ry="10" fill="#00a5a8" opacity=".35"/><ellipse cx="78" cy="88" rx="9" ry="6.5" fill="#00a5a8"/>',
            fn: 'Детекция угрозы и эмоциональная метка.',
            rem: 'REM: репетиция страха без моторного выхода.',
            decode: 'Погони, хищники, паника — симуляция угрозы, не символы.',
          },
          {
            n: '02', cls: 'thal', system: 'Промежуточный мозг', title: 'Таламус', color: '#3189cc',
            hit: '<ellipse cx="88" cy="72" rx="18" ry="10" fill="#3189cc" opacity=".35"/><ellipse cx="88" cy="72" rx="14" ry="7" fill="#3189cc"/>',
            fn: 'Центральный релейный фильтр сенсорных сигналов.',
            rem: 'Сон: внутренние образы ощущаются как восприятие.',
            decode: 'Гиперреальные текстуры и звук — таламо-кортикальные петли.',
          },
          {
            n: '03', cls: 'hip', system: 'Медиальная височная доля', title: 'Гиппокамп', color: '#5cb888',
            hit: '<path d="M58 108 C68 98 82 96 92 102 C102 108 108 118 104 128 C100 136 86 138 74 132 C62 126 54 118 58 108Z" fill="#5cb888" opacity=".85"/>',
            fn: 'Связывает эпизоды в нарративную память.',
            rem: 'REM: реплей опыта и эмоций в сюжет сна.',
            decode: 'Повторяющиеся люди и места — консолидация, не символизм.',
          },
        ]
      : [
          {
            n: '01', cls: 'amy', system: 'Limbic system', title: 'Amygdala', color: '#00a5a8',
            hit: '<ellipse cx="78" cy="88" rx="14" ry="10" fill="#00a5a8" opacity=".35"/><ellipse cx="78" cy="88" rx="9" ry="6.5" fill="#00a5a8"/>',
            fn: 'Threat detection and emotional tagging.',
            rem: 'REM: rehearses fear without motor output.',
            decode: 'Chase, predators, panic — threat simulation, not symbols.',
          },
          {
            n: '02', cls: 'thal', system: 'Diencephalon', title: 'Thalamus', color: '#3189cc',
            hit: '<ellipse cx="88" cy="72" rx="18" ry="10" fill="#3189cc" opacity=".35"/><ellipse cx="88" cy="72" rx="14" ry="7" fill="#3189cc"/>',
            fn: 'Central relay — filters sensory signals to cortex.',
            rem: 'Sleep: internally generated imagery feels like perception.',
            decode: 'Hyper-real textures and sound — thalamic-cortical loops.',
          },
          {
            n: '03', cls: 'hip', system: 'Medial temporal lobe', title: 'Hippocampus', color: '#5cb888',
            hit: '<path d="M58 108 C68 98 82 96 92 102 C102 108 108 118 104 128 C100 136 86 138 74 132 C62 126 54 118 58 108Z" fill="#5cb888" opacity=".85"/>',
            fn: 'Binds episodes into narrative memory.',
            rem: 'REM: replays experience into dream plots.',
            decode: 'Recurring people and places — consolidation, not symbolism.',
          },
        ];

    var brainOutline =
      '<path d="M28 28 C55 18 95 22 118 42 C138 60 148 88 142 118 C136 142 110 152 82 148 C52 144 32 124 26 96 C20 68 28 38 28 28Z" fill="#eef2ea" stroke="#9aaa90" stroke-width="1.2"/>';

    var lblFn = ru ? 'Фн' : 'Fn';
    var lblRem = 'REM';
    var lblDec = 'Decode';

    return (
      '<section class="onx-print-brain">' +
        '<p class="onx-print-brain__kicker">' + escapeHtml(kicker) + '</p>' +
        '<div class="onx-print-brain__grid">' +
        cards.map(function (c) {
          return (
            '<article class="onx-print-brain__card onx-print-brain__card--' + c.cls + '">' +
              '<header>' +
                '<span style="background:' + c.color + '">' + c.n + '</span>' +
                '<div>' +
                  '<p class="onx-print-brain__sys">' + escapeHtml(c.system) + '</p>' +
                  '<h3>' + escapeHtml(c.title) + '</h3>' +
                '</div>' +
              '</header>' +
              '<svg class="onx-print-brain__svg" viewBox="0 0 160 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
                brainOutline + c.hit +
              '</svg>' +
              '<p><strong>' + lblFn + '</strong> ' + escapeHtml(c.fn) + '</p>' +
              '<p><strong>' + lblRem + '</strong> ' + escapeHtml(c.rem) + '</p>' +
              '<p class="onx-print-brain__decode"><strong>' + lblDec + '</strong> ' + escapeHtml(c.decode) + '</p>' +
            '</article>'
          );
        }).join('') +
        '</div>' +
      '</section>'
    );
  }

  function printEntry(entry) {
    var sheet = ensurePrintSheet();
    var dream = entry.dream || '';
    if (dream.length > 280) dream = dream.slice(0, 277).replace(/\s+\S*$/, '') + '…';

    var chars =
      dream.length +
      (entry.signal || '').length +
      (entry.body || '').length +
      (entry.morning || '').length +
      ((entry.checkin && entry.checkin.text) ? entry.checkin.text.length : 0);
    var density = chars > 1600 ? ' onx-print-doc--dense' : chars > 1000 ? ' onx-print-doc--compact' : '';

    sheet.innerHTML =
      '<article class="onx-print-doc' + density + '">' +
        '<header class="onx-print-brand">' +
          '<img class="onx-print-brand__logo" src="/images/neiro.webp" alt="" width="56" height="56" />' +
          '<div class="onx-print-brand__text">' +
            '<p class="onx-print-brand__name">Oneirox.com</p>' +
            '<p class="onx-print-brand__sub">Neural dream reading</p>' +
          '</div>' +
          '<p class="onx-print-brand__date">' + escapeHtml(new Date(entry.ts || Date.now()).toLocaleString()) + '</p>' +
        '</header>' +
        (dream ? '<section><h2>Dream</h2><p>' + escapeHtml(dream) + '</p></section>' : '') +
        (entry.signal ? '<section><h2>Signal</h2><p class="onx-print-signal">' + escapeHtml(entry.signal) + '</p></section>' : '') +
        (entry.body ? '<section><h2>Body</h2><p>' + escapeHtml(entry.body) + '</p></section>' : '') +
        (entry.morning ? '<section><h2>Morning</h2><p class="onx-print-morning">' + escapeHtml(entry.morning) + '</p></section>' : '') +
        (entry.checkin && entry.checkin.text
          ? '<section><h2>Body check-in</h2><p>' + escapeHtml(entry.checkin.text) + '</p></section>'
          : '') +
        printBrainBlock() +
        '<footer class="onx-print-foot">oneirox.com · Not medical advice</footer>' +
      '</article>';

    var cleaned = false;
    var cleanup = function () {
      if (cleaned) return;
      cleaned = true;
      document.body.classList.remove('onx-printing');
      sheet.innerHTML = '';
      sheet.setAttribute('aria-hidden', 'true');
      window.removeEventListener('afterprint', cleanup);
      if (mq) {
        try { mq.removeEventListener('change', onMq); } catch (e) {
          try { mq.removeListener(onMq); } catch (e2) {}
        }
      }
    };

    var mq = window.matchMedia ? window.matchMedia('print') : null;
    var onMq = function (e) {
      if (e && e.matches === false) cleanup();
    };

    document.body.classList.add('onx-printing');
    sheet.setAttribute('aria-hidden', 'false');
    window.addEventListener('afterprint', cleanup);
    if (mq) {
      if (mq.addEventListener) mq.addEventListener('change', onMq);
      else if (mq.addListener) mq.addListener(onMq);
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        window.print();
        setTimeout(cleanup, 60 * 1000);
      });
    });
  }

  /* ── Mapper refine ── */
  function goMapperRefine(entry) {
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify({
        text: entry.dream || '',
        entryId: entry.id,
        lang: entry.lang || lang(),
        ts: Date.now(),
      }));
    } catch (e) {}
    location.href = '/tools/oneirox-dream-mapper.html';
  }

  /* ── Compare + insight strip ── */
  function renderInsightStrip(resultBox, entry) {
    var old = resultBox.querySelector('.onx-decode-insight');
    if (old) old.remove();

    var similar = findSimilar(entry);
    var strip = document.createElement('div');
    strip.className = 'onx-decode-insight';

    var compareHtml;
    if (similar) {
      var pct = Math.round(Math.min(similar.score, 1) * 100);
      var past = (similar.entry.signal || '').slice(0, 140);
      var shared = similar.shared.slice(0, 2).map(themeLabel).join(' · ');
      compareHtml =
        '<div class="onx-compare">' +
          '<div class="onx-compare__head">' +
            '<strong>' + escapeHtml(t('compareTitle')) + '</strong>' +
            '<span>' + pct + '% ' + escapeHtml(t('compareScore')) +
            (shared ? ' · ' + escapeHtml(shared) : '') + '</span>' +
          '</div>' +
          '<p class="onx-compare__past">' + escapeHtml(past) + (past.length >= 140 ? '…' : '') + '</p>' +
          '<button type="button" class="onx-act onx-act--ghost" data-compare-open="' +
            escapeHtml(similar.entry.id) + '">' + escapeHtml(t('compareOpen')) + '</button>' +
        '</div>';
    } else {
      compareHtml =
        '<div class="onx-compare onx-compare--empty">' +
          '<strong>' + escapeHtml(t('compareTitle')) + '</strong>' +
          '<p>' + escapeHtml(t('compareNone')) + '</p>' +
        '</div>';
    }

    strip.innerHTML =
      compareHtml +
      '<button type="button" class="onx-act onx-act--refine" data-act-refine="1" title="' +
        escapeHtml(t('refineHint')) + '">' + escapeHtml(t('refine')) + '</button>';

    var actions = resultBox.querySelector('.onx-decode-actions');
    if (actions) resultBox.insertBefore(strip, actions);
    else resultBox.appendChild(strip);

    strip.querySelector('[data-act-refine]') &&
      strip.querySelector('[data-act-refine]').addEventListener('click', function () {
        upsertEntry(entry);
        goMapperRefine(entry);
      });

    var openBtn = strip.querySelector('[data-compare-open]');
    if (openBtn) {
      openBtn.addEventListener('click', function () {
        var pastEntry = findEntry(openBtn.getAttribute('data-compare-open'));
        if (pastEntry) {
          showEntryInResult(pastEntry);
          var box = document.getElementById('onx-decode-result');
          if (box) box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }
  }

  function attachActions(resultBox, entry) {
    var old = resultBox.querySelector('.onx-decode-actions');
    if (old) old.remove();
    var oldInsight = resultBox.querySelector('.onx-decode-insight');
    if (oldInsight) oldInsight.remove();
    var oldCheck = resultBox.querySelector('.onx-decode__checkin');
    if (oldCheck) oldCheck.remove();
    var legacy = document.getElementById('onx-share-bar');
    if (legacy) legacy.remove();

    var bar = document.createElement('div');
    bar.className = 'onx-decode-actions';
    bar.innerHTML =
      '<p class="onx-decode-actions__label">' + escapeHtml(t('label')) + '</p>' +
      '<div class="onx-decode-actions__row onx-decode-actions__row--share" role="group">' +
        '<button type="button" class="onx-act onx-act--primary" data-act="card">' + escapeHtml(t('shareCard')) + '</button>' +
        '<button type="button" class="onx-act onx-act--signal" data-act="signal">' + escapeHtml(t('signalCard')) + '</button>' +
        '<button type="button" class="onx-act" data-act="copy">' + escapeHtml(t('copy')) + '</button>' +
        '<button type="button" class="onx-act" data-act="copyLink">' + escapeHtml(t('copyLink')) + '</button>' +
        '<button type="button" class="onx-act" data-act="email">' + escapeHtml(t('email')) + '</button>' +
      '</div>' +
      '<div class="onx-decode-actions__row onx-decode-actions__row--keep" role="group">' +
        '<button type="button" class="onx-act onx-act--save" data-act="save">' + escapeHtml(t('save')) + '</button>' +
        '<button type="button" class="onx-act" data-act="pdf">' + escapeHtml(t('pdf')) + '</button>' +
      '</div>';
    resultBox.appendChild(bar);
    lastEntry = entry;
    syncShareModule(entry);
    renderInsightStrip(resultBox, entry);
    injectCheckinBlock(resultBox, entry);

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var act = btn.getAttribute('data-act');

      if (act === 'save') {
        upsertEntry(entry);
        toast(btn, t('saved'));
        return;
      }
      if (act === 'copy') {
        upsertEntry(entry);
        copyText(formatPlain(entry)).then(function () { toast(btn, t('copied')); });
        return;
      }
      if (act === 'copyLink') {
        upsertEntry(entry);
        copyText(entryUrl(entry.id)).then(function () { toast(btn, t('copied')); });
        return;
      }
      if (act === 'pdf') {
        upsertEntry(entry);
        printEntry(entry);
        return;
      }
      if (act === 'card') {
        upsertEntry(entry);
        syncShareModule(entry);
        if (window.OneiroxShare && window.OneiroxShare.openCard) window.OneiroxShare.openCard();
        return;
      }
      if (act === 'signal') {
        upsertEntry(entry);
        syncShareModule(entry);
        if (window.OneiroxShare && window.OneiroxShare.openSignalCard) window.OneiroxShare.openSignalCard();
        return;
      }
      if (act === 'email') {
        upsertEntry(entry);
        syncShareModule(entry);
        if (window.OneiroxShare && window.OneiroxShare.openEmail) window.OneiroxShare.openEmail();
      }
    });
  }

  function onResult(detail) {
    ensureJournalUi();
    var resultBox = document.getElementById('onx-decode-result');
    if (!resultBox || !detail || !detail.raw) return;

    if (detail.fromJournal) {
      var signal = parseSection(detail.raw, 'SIGNAL');
      var body = parseSection(detail.raw, 'BODY');
      var morning = parseSection(detail.raw, 'MORNING');
      var html = '';
      if (signal) html += '<div class="onx-decode__signal">' + escapeHtml(signal) + '</div>';
      if (body) {
        html += body.split(/\n\n+/).map(function (p) {
          var clean = p.trim();
          return clean ? '<p class="onx-decode__para">' + escapeHtml(clean) + '</p>' : '';
        }).join('');
      }
      if (morning) html += '<div class="onx-decode__morning">' + escapeHtml(morning) + '</div>';
      resultBox.innerHTML = html || '<pre class="onx-decode__para">' + escapeHtml(detail.raw) + '</pre>';
      resultBox.style.display = 'block';
    }

    var entry = buildEntry(detail);
    if (detail.id) entry.id = detail.id;
    if (detail.ts) entry.ts = detail.ts;
    if (detail.checkin) entry.checkin = detail.checkin;
    if (detail.checkinSkipped) entry.checkinSkipped = true;

    // Quiet auto-archive so check-in / patterns / compare always have a home.
    if (!detail.fromJournal) upsertEntry(entry);

    attachActions(resultBox, entry);
    bumpFabBadge();

    try {
      var pending = localStorage.getItem(PENDING_KEY);
      if (pending && !detail.fromJournal) localStorage.removeItem(PENDING_KEY);
    } catch (e) {}
  }

  function bootJournal() {
    ensureJournalUi();
    scheduleCheckinProbe();
    bumpFabBadge();
    var m = location.hash.match(/onx-entry=([^&]+)/);
    if (m) {
      var id = decodeURIComponent(m[1]);
      var entry = findEntry(id);
      if (entry) {
        setTimeout(function () {
          showEntryInResult(entry);
          var box = document.getElementById('onx-decode-result');
          if (box) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
      }
    }
  }

  document.addEventListener('onx-decode-result', function (e) {
    onResult(e.detail || {});
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootJournal);
  } else {
    bootJournal();
  }
})();
