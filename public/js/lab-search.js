/**
 * ONEIROX LAB SEARCH
 * Dream / body text → nearest PSEO Lab pages (somatic + dream mechanisms).
 * Priority: somatic markers → phase/context → dream theme → token overlap.
 * Zero API. Client-side index: /data/lab-search-index.json
 */
(function () {
  'use strict';

  var INDEX_URL = '/data/lab-search-index.json';
  var index = null;
  var loading = null;

  /* Mechanism-first sleep tips — not omen folklore */
  var LAB_TIPS = [
    {
      body: 'Name the body first, then the image — chest weight before “snake.” Search reads that order better.',
      meta: 'SIGNAL · BODY · MORNING — Oneirox method'
    },
    {
      body: 'A cool, dark room (~18–19°C) and a fixed wake time do more for dream recall than any symbol dictionary.',
      meta: 'Sleep hygiene · circadian anchor'
    },
    {
      body: 'Alcohol after dinner fragments second-half REM. Vivid, sticky dreams often follow — physiology, not prophecy.',
      meta: 'REM architecture'
    },
    {
      body: 'Caffeine after mid-afternoon can blunt deep sleep and leave you with light, plot-heavy nights.',
      meta: 'Adenosine · sleep depth'
    },
    {
      body: 'If you wake at 3am racing thoughts, jot one body note and return to bed — decoding at dawn beats decoding at dawn’s panic.',
      meta: 'Cortisol awakening response'
    },
    {
      body: 'Morning outdoor light within an hour of waking stabilizes the clock that decides when REM pressure peaks.',
      meta: 'Circadian timing'
    },
    {
      body: 'Jaw sore on waking? Bruxism and threat-rehearsal often travel together — map the mouth before the plot.',
      meta: 'Somatic marker'
    },
    {
      body: 'Heavy late meals raise night arousals. The “chase” may be autonomic noise wearing a costume.',
      meta: 'Autonomic load'
    },
    {
      body: 'Phones in bed delay melatonin. Dim screens an hour before sleep if you want cleaner REM later.',
      meta: 'Light · melatonin'
    },
    {
      body: 'Recurring dreams often mean unfinished consolidation — same mechanism file still open, not a curse.',
      meta: 'Emotional memory'
    },
    {
      body: 'Cannot move / chest pressure on waking: check sleep paralysis and atonia pages before omen blogs.',
      meta: 'REM atonia'
    },
    {
      body: 'Write three words max on waking: place · person · body. That triad beats a novel you will forget by breakfast.',
      meta: 'Dream recall craft'
    },
    {
      body: 'Homeland images (Ararat, Yerevan, grandmother) are dense place and attachment files — culture is the scene, not the oracle.',
      meta: 'Place memory · diaspora'
    },
    {
      body: 'Naps longer than ~20 minutes can steal REM pressure from tonight. Short reset; long nap reshuffles the script.',
      meta: 'Ultradian balance'
    },
    {
      body: 'Stress days load threat-simulation nights. A 10-minute walk after work lowers the amygdala dye more than interpretation.',
      meta: 'Threat rehearsal'
    }
  ];

  /* User language → concept boosts (somatic / phase / dream themes) */
  var LEXICON = [
    { re: /\b(can'?t move|cannot move|paralys|paralyz|frozen|immobile|couldn'?t speak|can'?t speak|chest (weight|pressure)|weight on (my )?chest|someone (on|sitting) (on )?(my )?chest)\b/i, tags: ['atonia', 'paralysis', 'immobility', 'chest', 'pressure', 'vocalize'], w: 28 },
    { re: /\b(jolt|jerk|twitch|hypnic|falling (asleep|sensation)|fell (in|through)|elevator|startle|snap awake|body jump)\b/i, tags: ['jolt', 'jerk', 'falling', 'twitch', 'hypnic', 'startle'], w: 26 },
    { re: /\b(teeth|tooth|jaw|grind|clench|brux)\b/i, tags: ['teeth', 'jaw', 'bruxism', 'clench', 'grind', 'oral'], w: 26 },
    { re: /\b(chas(e|ed|ing)|pursu|running away|being chased|can'?t run)\b/i, tags: ['chase', 'threat', 'running', 'pursuer', 'amygdala'], w: 24 },
    { re: /\b(snake|serpent|snake.?bite|bitten)\b/i, tags: ['snake', 'serpent', 'bitten', 'bite'], w: 24 },
    { re: /\b(drown|underwater|flood|tidal|ocean|deep water)\b/i, tags: ['water', 'drown', 'flood', 'ocean'], w: 22 },
    { re: /\b(ex\b|ex[- ]partner|cheating|affair|wedding|marriage|pregnant|pregnancy)\b/i, tags: ['ex', 'partner', 'cheating', 'wedding', 'marriage', 'pregnant'], w: 22 },
    { re: /\b(exam|test|late|miss(ed)? (the )?(bus|train|flight|deadline)|naked|public)\b/i, tags: ['exam', 'late', 'naked', 'anxiety', 'deadline'], w: 20 },
    { re: /\b(bang|explosion|exploding head|loud (noise|bang)|gunshot in head)\b/i, tags: ['bang', 'exploding', 'loud', 'sensory', 'burst'], w: 26 },
    { re: /\b(heart (racing|pounding)|tachycardia|panic on waking|adrenaline)\b/i, tags: ['heartbeat', 'racing', 'tachycardia', 'arousal', 'autonomic'], w: 22 },
    { re: /\b(float(ing)?|limb float|leaving (my )?body|out of body)\b/i, tags: ['float', 'limb', 'hypnagogic'], w: 20 },
    { re: /\b(leg kick|kicking|periodic limb|plm|restless leg)\b/i, tags: ['kick', 'leg', 'limb', 'periodic'], w: 20 },
    { re: /\b(watched|watching me|eyes on me|being watched)\b/i, tags: ['watched', 'watch', 'presence'], w: 20 },
    { re: /\b(death|died|dying|funeral|loved one)\b/i, tags: ['death', 'loved', 'grief'], w: 18 },
    { re: /\b(recurring|same dream|repeat(ing)?|again and again)\b/i, tags: ['recurring', 'repeat', 'loop'], w: 16 },
    { re: /\b(money|wealth|rich|poor|debt)\b/i, tags: ['money', 'wealth'], w: 16 },
    { re: /\b(house|home|room|basement|attic)\b/i, tags: ['house', 'home', 'room'], w: 16 },
    { re: /\b(dog|cat|animal)\b/i, tags: ['dog', 'cat', 'animal'], w: 16 },
    { re: /\b(ararat|armenia|armenian|yerevan|sevan|glendale|etchmiadzin|zvartnots|cascade|homeland|diaspora|exile|grandmother|grandma|passport|border)\b/i, tags: ['ararat', 'armenia', 'armenian', 'homeland', 'diaspora', 'exile', 'grandmother', 'passport', 'border', 'yerevan', 'sevan', 'glendale', 'etchmiadzin', 'zvartnots'], w: 26 },
    { re: /\b(duduk|dhol|kamancha|qyamancha|kemancha|lavash|tonir|soorj|jan)\b/i, tags: ['duduk', 'dhol', 'kamancha', 'qyamancha', 'lavash', 'tonir', 'coffee', 'jan', 'armenian'], w: 28 },
    { re: /\b(rem\b|deep sleep|n1|n2|n3|falling asleep|waking up|middle of the night)\b/i, tags: ['rem', 'n1', 'n2', 'n3', 'onset', 'awakening'], w: 14 }
  ];

  var PHASE_HINTS = [
    { re: /\b(just (as )?i (fell|was falling) asleep|sleep onset|drifting off|as i fell asleep)\b/i, phase: 'n1', context: 'onset', w: 18 },
    { re: /\b(woke up|on waking|when i woke|morning|awakening)\b/i, phase: '', context: 'awakening', w: 14 },
    { re: /\b(middle of the night|3am|3 am|fragmented|kept waking)\b/i, phase: '', context: 'fragmentation', w: 12 },
    { re: /\b(rem|vivid dream|lucid)\b/i, phase: 'rem', context: '', w: 12 }
  ];

  function isDreamDoc(doc) {
    return doc && (doc.kind === 'dream' || doc.kind === 'dream-lf');
  }

  function norm(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokens(s) {
    return norm(s).split(' ').filter(function (t) {
      return t.length > 2 && !STOP[t];
    });
  }

  var STOP = {
    the: 1, and: 1, for: 1, that: 1, this: 1, with: 1, from: 1, have: 1,
    was: 1, were: 1, are: 1, been: 1, being: 1, had: 1, has: 1, then: 1,
    than: 1, into: 1, about: 1, there: 1, their: 1, what: 1, when: 1,
    where: 1, which: 1, while: 1, your: 1, you: 1, my: 1, me: 1, i: 1,
    dream: 1, dreamed: 1, dreamt: 1, dreaming: 1, dreams: 1, night: 1,
    like: 1, just: 1, very: 1, really: 1, somehow: 1, something: 1
  };

  function loadIndex() {
    if (index) return Promise.resolve(index);
    if (loading) return loading;
    loading = fetch(INDEX_URL, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('index ' + r.status);
        return r.json();
      })
      .then(function (data) {
        index = data;
        return index;
      })
      .catch(function (err) {
        loading = null;
        throw err;
      });
    return loading;
  }

  function extractSignals(query) {
    var q = norm(query);
    var tags = [];
    var boosts = [];
    var phase = '';
    var context = '';
    var i, hit;

    for (i = 0; i < LEXICON.length; i++) {
      hit = LEXICON[i];
      if (hit.re.test(q)) {
        tags = tags.concat(hit.tags);
        boosts.push({ tags: hit.tags, w: hit.w, label: hit.tags[0] });
      }
    }
    for (i = 0; i < PHASE_HINTS.length; i++) {
      hit = PHASE_HINTS[i];
      if (hit.re.test(q)) {
        if (hit.phase) phase = hit.phase;
        if (hit.context) context = hit.context;
        boosts.push({ phase: hit.phase, context: hit.context, w: hit.w, label: hit.context || hit.phase });
      }
    }

    return {
      q: q,
      toks: tokens(q),
      tags: uniq(tags),
      boosts: boosts,
      phase: phase,
      context: context
    };
  }

  function uniq(arr) {
    var out = [];
    var seen = {};
    for (var i = 0; i < arr.length; i++) {
      if (!arr[i] || seen[arr[i]]) continue;
      seen[arr[i]] = 1;
      out.push(arr[i]);
    }
    return out;
  }

  function scoreDoc(doc, sig) {
    var score = 0;
    var reasons = [];
    var termSet = {};
    var i, t, m, markerHit, tag;

    for (i = 0; i < doc.terms.length; i++) termSet[doc.terms[i]] = 1;

    /* 1) Somatic markers (highest) */
    markerHit = 0;
    for (i = 0; i < (doc.markers || []).length; i++) {
      m = norm(doc.markers[i]);
      if (!m) continue;
      if (sig.q.indexOf(m) !== -1) {
        markerHit += 1;
        score += 34;
        if (reasons.length < 3) reasons.push('body marker: “' + doc.markers[i] + '”');
      } else {
        var mt = m.split(' ');
        var overlap = 0;
        for (var j = 0; j < mt.length; j++) {
          if (sig.toks.indexOf(mt[j]) !== -1) overlap++;
        }
        if (overlap >= 2 || (overlap === 1 && mt.length === 1)) {
          markerHit += 0.5;
          score += 16;
        }
      }
    }

    /* Lexicon concept tags vs doc terms/markers */
    for (i = 0; i < sig.boosts.length; i++) {
      var b = sig.boosts[i];
      var tagHit = 0;
      if (b.tags) {
        for (var k = 0; k < b.tags.length; k++) {
          tag = b.tags[k];
          if (termSet[tag] || (doc.title && norm(doc.title).indexOf(tag) !== -1)) {
            tagHit = 1;
            break;
          }
          for (var mi = 0; mi < (doc.markers || []).length; mi++) {
            if (norm(doc.markers[mi]).indexOf(tag) !== -1) {
              tagHit = 1;
              break;
            }
          }
          if (isDreamDoc(doc) && norm(doc.id + ' ' + doc.href).indexOf(tag) !== -1) tagHit = 1;
        }
        if (tagHit) {
          score += b.w;
          if (reasons.length < 3) reasons.push('matched “' + b.label + '”');
        }
      }
      if (b.phase && doc.phase === b.phase) {
        score += b.w * 0.7;
        if (reasons.length < 3) reasons.push('phase ' + doc.phase.toUpperCase());
      }
      if (b.context && doc.context === b.context) {
        score += b.w * 0.8;
        if (reasons.length < 3) reasons.push(doc.context);
      }
    }

    /* 2) Phase / context from query */
    if (sig.phase && doc.phase === sig.phase) score += 14;
    if (sig.context && doc.context === sig.context) score += 16;

    /* Dream slug / title direct hits (strong theme signal) */
    if (isDreamDoc(doc)) {
      var slug = String(doc.href || '').replace(/^\/dreams\/|\/$/g, '').replace(/\//g, '-');
      var slugBits = slug.split('-');
      var slugHits = 0;
      for (i = 0; i < slugBits.length; i++) {
        if (slugBits[i].length > 2 && sig.toks.indexOf(slugBits[i]) !== -1) slugHits++;
      }
      if (slugHits >= 2) {
        score += doc.kind === 'dream-lf' ? 42 : 36;
        if (reasons.length < 3) reasons.push('dream theme match');
      } else if (slugHits === 1 && (slugBits.length <= 2 || sig.toks.length <= 4)) {
        score += doc.kind === 'dream-lf' ? 22 : 18;
      }
    }

    /* 3) Token overlap */
    var tokHits = 0;
    for (i = 0; i < sig.toks.length; i++) {
      t = sig.toks[i];
      if (termSet[t]) {
        tokHits++;
        score += isDreamDoc(doc) ? 7 : 5;
      }
    }
    if (tokHits >= 3 && reasons.length < 3) reasons.push(tokHits + ' matching terms');

    /* Quality priors — PSEO dream pages lead the product surface */
    if (doc.indexable) score += 6;
    if (isDreamDoc(doc)) score += 12;
    if (doc.kind === 'dream-lf') score += 6;
    if (isDreamDoc(doc) && tokHits >= 2) score += 10;
    if (doc.density > 100) score += 2;
    if (doc.rank && doc.rank <= 20) score += 3;

    /* Prefer diversity later — mild same-slug dampening handled in rankResults */

    return { score: score, reasons: reasons, markerHit: markerHit, tokHits: tokHits };
  }

  function rankResults(docs, sig) {
    var scored = [];
    var i, doc, s;
    for (i = 0; i < docs.length; i++) {
      doc = docs[i];
      s = scoreDoc(doc, sig);
      if (s.score < 12) continue;
      scored.push({
        doc: doc,
        score: s.score,
        reasons: s.reasons,
        markerHit: s.markerHit,
        tokHits: s.tokHits
      });
    }
    scored.sort(function (a, b) {
      /* Prefer dream PSEO when scores are close */
      var aDream = isDreamDoc(a.doc) ? 1 : 0;
      var bDream = isDreamDoc(b.doc) ? 1 : 0;
      if (Math.abs(a.score - b.score) < 8 && aDream !== bDream) return bDream - aDream;
      return b.score - a.score || (a.doc.rank || 999) - (b.doc.rank || 999);
    });

    /* Prefer PSEO dream pages: up to 2 dream hits, then optional somatic */
    var out = [];
    var seenSymptom = {};
    var dreamCount = 0;
    var somaticCount = 0;
    for (i = 0; i < scored.length && out.length < 3; i++) {
      var item = scored[i];
      var d = item.doc;
      if (isDreamDoc(d)) {
        if (dreamCount >= 2) continue;
        dreamCount++;
      } else {
        if (somaticCount >= 1) continue;
        var sym = (d.href || '').split('/')[2] || d.id;
        if (seenSymptom[sym] && out.length > 0) continue;
        seenSymptom[sym] = 1;
        somaticCount++;
      }
      out.push(item);
    }

    /* If top is dream-only and we have room, inject best somatic */
    if (out.length && isDreamDoc(out[0].doc) && out.length < 3) {
      for (i = 0; i < scored.length; i++) {
        if (scored[i].doc.kind === 'somatic' && scored[i].score >= 18) {
          var exists = out.some(function (x) { return x.doc.id === scored[i].doc.id; });
          if (!exists) {
            out.push(scored[i]);
          }
          break;
        }
      }
    }

    return out.slice(0, 3);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function kindLabel(kind) {
    if (kind === 'dream' || kind === 'dream-lf') return 'Dream PSEO';
    return 'Somatic PSEO';
  }

  function setResultsOpen(root, open) {
    var hero = root.closest('.onx-lab-hero') || document.querySelector('.onx-lab-hero');
    if (hero) {
      if (open) hero.classList.add('has-lab-results');
      else hero.classList.remove('has-lab-results');
    }
  }

  function renderResults(root, items, query) {
    var box = root.querySelector('[data-lab-search-results]');
    if (!box) return;

    if (!items.length) {
      box.hidden = false;
      box.innerHTML =
        '<div class="onx-lab-search__empty">' +
        '<p><strong>No matching PSEO page yet.</strong> Try naming a body sensation (chest pressure, jolt, jaw, can’t move) or a clear image (snake, chase, falling, teeth).</p>' +
        '<p class="onx-lab-search__empty-links">Browse <a href="/dreams/">Dream Meaning</a> · <a href="/somatic/">Somatic library</a> · <a href="/tools/oneirox-dream-mapper">Mapper</a></p>' +
        '</div>';
      setResultsOpen(root, true);
      return;
    }

    var primary = items[0];
    var rest = items.slice(1);
    var html = '';

    html += '<p class="onx-lab-search__status">Why you may have seen this</p>';
    html += '<article class="onx-lab-search__primary">';
    html += '<span class="onx-lab-search__badge">' + escapeHtml(kindLabel(primary.doc.kind)) + ' · strongest match</span>';
    html += '<h3 class="onx-lab-search__hit-title"><a href="' + escapeHtml(primary.doc.href) + '">' + escapeHtml(primary.doc.title) + '</a></h3>';
    if (primary.doc.blurb) {
      html += '<p class="onx-lab-search__blurb">' + escapeHtml(primary.doc.blurb) + '</p>';
    }
    if (primary.reasons.length) {
      html += '<p class="onx-lab-search__why">Matched on: ' + escapeHtml(primary.reasons.join(' · ')) + '</p>';
    }
    html += '<a class="btn btn--primary onx-lab-search__cta" href="' + escapeHtml(primary.doc.href) + '">Read why →</a>';
    html += '</article>';

    if (rest.length) {
      html += '<ul class="onx-lab-search__related">';
      for (var i = 0; i < rest.length; i++) {
        var r = rest[i];
        html += '<li>';
        html += '<span class="onx-lab-search__badge onx-lab-search__badge--sm">' + escapeHtml(kindLabel(r.doc.kind)) + '</span>';
        html += '<a class="onx-lab-search__related-title" href="' + escapeHtml(r.doc.href) + '">' + escapeHtml(r.doc.title) + '</a>';
        if (r.reasons[0]) {
          html += '<span class="onx-lab-search__why-sm">' + escapeHtml(r.reasons[0]) + '</span>';
        }
        html += '</li>';
      }
      html += '</ul>';
    }

    html +=
      '<p class="onx-lab-search__foot">Not a diagnosis · routes you to Oneirox dream &amp; somatic PSEO pages</p>';

    box.hidden = false;
    box.innerHTML = html;
    setResultsOpen(root, true);
  }

  function runSearch(root) {
    var ta = root.querySelector('[data-lab-search-input]');
    var btn = root.querySelector('[data-lab-search-run]');
    var box = root.querySelector('[data-lab-search-results]');
    if (!ta) return;

    var q = ta.value.trim();
    if (q.length < 8) {
      if (box) {
        box.hidden = false;
        box.innerHTML = '<div class="onx-lab-search__empty"><p>Add a bit more — an image <em>and</em> how your body felt on waking.</p></div>';
        setResultsOpen(root, true);
      }
      return;
    }

    var runLabel =
      (btn && btn.getAttribute('data-lab-search-run-label')) || 'Why did I see this? →';

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Searching…';
    }

    loadIndex()
      .then(function (data) {
        var sig = extractSignals(q);
        var items = rankResults(data.docs || [], sig);
        renderResults(root, items, q);
      })
      .catch(function () {
        if (box) {
          box.hidden = false;
          box.innerHTML = '<div class="onx-lab-search__empty"><p>Search index unavailable. Browse <a href="/dreams/">Dream Meaning</a> or <a href="/somatic/">Somatic</a>.</p></div>';
        }
      })
      .finally(function () {
        if (btn) {
          btn.disabled = false;
          btn.textContent = runLabel;
        }
      });
  }

  function bindTip(root) {
    var tipRoot = root.querySelector('[data-lab-search-tip]');
    if (!tipRoot || tipRoot.__onxTipBound) return;
    tipRoot.__onxTipBound = true;

    var bodyEl = tipRoot.querySelector('[data-lab-search-tip-body]');
    var metaEl = tipRoot.querySelector('[data-lab-search-tip-meta]');
    var nextBtn = tipRoot.querySelector('[data-lab-search-tip-next]');
    var lastIdx = -1;

    function pickTip() {
      if (!LAB_TIPS.length || !bodyEl) return;
      var idx = Math.floor(Math.random() * LAB_TIPS.length);
      if (LAB_TIPS.length > 1) {
        var guard = 0;
        while (idx === lastIdx && guard < 6) {
          idx = Math.floor(Math.random() * LAB_TIPS.length);
          guard++;
        }
      }
      lastIdx = idx;
      var tip = LAB_TIPS[idx];
      bodyEl.textContent = tip.body;
      if (metaEl) metaEl.textContent = tip.meta || '';
    }

    pickTip();
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        pickTip();
      });
    }
  }

  function bind(root) {
    var form = root.querySelector('[data-lab-search-form]');
    if (!form || form.__onxBound) return;
    form.__onxBound = true;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      runSearch(root);
    });

    var ta = root.querySelector('[data-lab-search-input]');
    if (ta) {
      ta.addEventListener(
        'keydown',
        function (e) {
          if (e.isComposing || e.keyCode === 229) return;
          var isEnter =
            e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13;
          if (!isEnter || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
          e.preventDefault();
          e.stopPropagation();
          runSearch(root);
        },
        true
      );
    }

    var chips = root.querySelectorAll('[data-lab-search-chip]');
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener('click', function () {
        var text = this.getAttribute('data-lab-search-chip') || '';
        if (!ta || !text) return;
        ta.value = text;
        ta.focus();
        for (var j = 0; j < chips.length; j++) chips[j].classList.remove('is-active');
        this.classList.add('is-active');
      });
    }

    bindTip(root);

    var taPrefill = root.querySelector('[data-lab-search-input]');
    if (taPrefill) {
      try {
        var pre = sessionStorage.getItem('onx_lab_search_prefill');
        if (pre && !taPrefill.value.trim()) {
          taPrefill.value = pre;
          sessionStorage.removeItem('onx_lab_search_prefill');
        }
      } catch (e) {}
    }
  }

  function init() {
    var roots = document.querySelectorAll('[data-lab-search]');
    for (var i = 0; i < roots.length; i++) bind(roots[i]);
    /* Warm index after idle */
    if ('requestIdleCallback' in window) {
      requestIdleCallback(function () { loadIndex().catch(function () {}); }, { timeout: 2500 });
    } else {
      setTimeout(function () { loadIndex().catch(function () {}); }, 1800);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
