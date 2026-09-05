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
    { re: /\b(just (as )?i (fell|was falling) asleep|sleep onset|drifting off|as i fell asleep|falling asleep)\b/i, phase: 'n1', context: 'onset', w: 18 },
    { re: /\b(woke up|on waking|when i woke|morning|awakening)\b/i, phase: '', context: 'awakening', w: 14 },
    { re: /\b(middle of the night|3am|3 am|fragmented|kept waking)\b/i, phase: '', context: 'fragmentation', w: 12 },
    { re: /\b(rem|vivid dream|lucid)\b/i, phase: 'rem', context: '', w: 12 }
  ];

  /* Small, explicit vocabulary bridge for ordinary dream language. Terms map
     into published titles, slugs, and summaries; no external AI or API call. */
  var CONCEPT_MAP = [
    { re: /\b(someone close|close to me|loved one|family member|relative|partner|friend)\b/i, tags: ['loved', 'partner', 'family', 'friend'], w: 18, label: 'close person' },
    { re: /\b(dead|deceased|died|death|dead relative|lost someone)\b/i, tags: ['deceased', 'death', 'died', 'loved'], w: 26, label: 'loss' },
    { re: /\b(dad|father)\b/i, tags: ['father', 'parent'], w: 16, label: 'father' },
    { re: /\b(mom|mother)\b/i, tags: ['mother', 'parent'], w: 16, label: 'mother' },
    { re: /\b(ex|ex boyfriend|ex girlfriend|former partner)\b/i, tags: ['ex', 'partner', 'former'], w: 22, label: 'former partner' },
    { re: /\b(text(ing|ed)?|message(d)?|phone message)\b/i, tags: ['texting', 'message', 'phone'], w: 22, label: 'message' },
    { re: /\b(snake|snakes|serpent)\b/i, tags: ['snake'], w: 22, label: 'snake' },
    { re: /\b(dog|dogs|puppy)\b/i, tags: ['dog', 'puppy'], w: 22, label: 'dog' },
    { re: /\b(house|home)\b/i, tags: ['house', 'home'], w: 14, label: 'house' },
    { re: /\b(afraid|fear|scared)\b/i, tags: ['fear', 'anxiety', 'threat'], w: 14, label: 'fear' },
    { re: /\b(chasing|chased|running away)\b/i, tags: ['chase', 'running', 'threat'], w: 22, label: 'chase' },
    { re: /\b(exam|test|school exam)\b/i, tags: ['exam', 'test', 'school'], w: 22, label: 'exam' },
    { re: /\b(pregnant|pregnancy)\b/i, tags: ['pregnant', 'pregnancy'], w: 18, label: 'pregnancy' },
    { re: /\b(baby|child)\b/i, tags: ['baby', 'child'], w: 16, label: 'child' },
    { re: /\b(ignored|ignoring|ignore)\b/i, tags: ['ignored', 'ignoring'], w: 20, label: 'ignored' }
  ];

  /* Explicit intent → preferred destination (Gold / pillar). Applied on top of index scoring. */
  var INTENT_RULES = [
    { re: /\b(someone close|close to me|loved one|family member|relative|partner|friend)\b/i, href: '/dreaming-about-someone-you-havent-seen-in-years/', w: 60, label: 'someone in a dream' },
    { re: /\b(someone|person)\b.{0,36}\b(don'?t|do not|didn'?t|did not)\s+talk\b|\b(don'?t|do not|didn'?t|did not)\s+talk\b.{0,36}\b(someone|person)\b/i, href: '/dream-about-someone-you-dont-talk-to-anymore-meaning/', w: 92, label: 'someone you no longer talk to' },
    { re: /\b(ex|former partner|ex boyfriend|ex girlfriend)\b.{0,36}\b(text|texted|texting|message|messaged)\b|\b(text|texted|texting|message|messaged)\b.{0,36}\b(ex|former partner|ex boyfriend|ex girlfriend)\b/i, href: '/dream-about-someone-texting-you-meaning/', w: 92, label: 'message from an ex' },
    { re: /\b(dog|puppy)\b.{0,36}\b(attack|attacked|attacking|bite|bitten)\b|\b(attack|attacked|attacking|bite|bitten)\b.{0,36}\b(dog|puppy)\b/i, href: '/dreams/dogs/attacking/', w: 84, label: 'dog attack' },
    { re: /\b(late|missed|missing)\b.{0,24}\b(exam|test)\b|\b(exam|test)\b.{0,24}\b(late|missed|missing)\b/i, href: '/dreams/exam-anxiety-dreams/', w: 82, label: 'late for an exam' },
    { re: /\b(dead|deceased|died)\b.{0,32}\b(dad|father|mom|mother|parent)\b|\b(dad|father|mom|mother|parent)\b.{0,32}\b(dead|deceased|died)\b/i, href: '/dreams/death-of-a-loved-one/', w: 80, label: 'deceased parent' },
    { re: /\b(snake|serpent).{0,48}\b(bit|bite|bitten|fang)s?\b|\b(bit|bite|bitten|fang)s?.{0,48}\b(snake|serpent)/i, href: '/dreams/snakes/bitten/', w: 70, label: 'snake bite' },
    { re: /\b(snake|serpent).{0,40}\b(bed|sheets|mattress)\b|\b(bed|sheets).{0,40}\b(snake|serpent)/i, href: '/dreams/snakes/in-bed/', w: 65, label: 'snake in bed' },
    { re: /\b(dead|killed|lifeless).{0,24}\b(snake|serpent)|\b(snake|serpent).{0,24}\b(dead|killed)/i, href: '/dreams/snakes/dead-snake/', w: 60, label: 'dead snake' },
    { re: /\b(coil(ed)?|watching|staring|stare).{0,32}\b(snake|serpent)|\b(snake|serpent).{0,32}\b(coil(ed)?|watching|staring)/i, href: '/dreams/snakes/coiled-watching/', w: 58, label: 'coiled watching' },
    { re: /\b(snake|serpent)s?\b/i, href: '/dreams/snakes/', w: 32, label: 'snake theme', theme: true },
    { re: /\b(teeth|tooth).{0,40}\b(blood|bleed|bloody)|\b(blood|bleed|bloody).{0,40}\b(teeth|tooth)/i, href: '/dreams/teeth-falling-out/with-blood/', w: 70, label: 'teeth with blood' },
    { re: /\b(teeth|tooth).{0,24}\b(fall|fell|falling|crumbl)|teeth falling/i, href: '/dreams/teeth-falling-out/', w: 36, label: 'teeth theme', theme: true },
    { re: /\b(someone i know|person i know|known person|my (ex|boss|friend|mom|dad|mother|father|partner|teacher)).{0,48}\b(chas(e|ed|ing)|pursu)|\b(chas(e|ed|ing)|pursu).{0,48}\b(someone i know|person i know|known person|my (ex|boss|friend|mom|dad|mother|father|partner|teacher))/i, href: '/dreams/being-chased/known-person/', w: 70, label: 'known pursuer' },
    { re: /\b(being )?chas(e|ed|ing)|pursu(ed|ing)?\b/i, href: '/dreams/being-chased/', w: 34, label: 'chase theme', theme: true },
    { re: /\b(sleep paralysis|couldn'?t move|cannot move|can'?t move).{0,48}\b(presence|shadow|intruder|figure|someone (in|was) (the )?room)|\b(presence|shadow figure|intruder).{0,40}\b(paralys|paralyz|can'?t move)/i, href: '/dreams/sleep-paralysis/with-presence/', w: 72, label: 'paralysis presence' },
    { re: /\b(sleep paralysis|old hag|can'?t move when i woke|couldn'?t move when i woke)\b/i, href: '/dreams/sleep-paralysis/', w: 36, label: 'paralysis theme', theme: true },
    { re: /\b(falling asleep|as i (fell|was falling) asleep|drifting off|sleep onset).{0,40}\b(jolt|jerk|twitch|startle)|\b(jolt|jerk|hypnic).{0,40}\b(fall(ing)? asleep|onset)|\bfalling (sensation )?when (i )?(fall|falling) asleep\b/i, href: '/dreams/falling/hypnic-onset-jolt/', w: 72, label: 'hypnic jolt' },
    { re: /\b(fell|falling|drop(ped)?).{0,24}\b(woke|wake|jolt|jerk)|\bwoke.{0,24}\b(falling|jolt|jerk)\b/i, href: '/dreams/falling/hypnic-onset-jolt/', w: 48, label: 'fall-wake jolt' },
    { re: /\b(falling|fell from|great height)\b/i, href: '/dreams/falling/', w: 30, label: 'falling theme', theme: true },
    { re: /\b(mount )?ararat\b/i, href: '/dreams/homeland-and-diaspora/mount-ararat/', w: 70, label: 'mount ararat' },
    { re: /\b(childhood (house|home)|house i grew up|old (family )?house)\b/i, href: '/dreams/house-dreams/childhood-house/', w: 65, label: 'childhood house' }
  ];

  function isDreamDoc(doc) {
    return doc && (doc.kind === 'dream' || doc.kind === 'dream-lf');
  }

  /* Bounded typo correction: only common, high-signal dream terms and only
     one edit (including a swapped neighbouring pair). */
  var TYPO_TERMS = ['snake', 'serpent', 'dog', 'puppy', 'house', 'home', 'exam', 'test', 'father', 'mother', 'text', 'message', 'chase', 'late', 'dead', 'ex'];

  function editDistance(a, b) {
    var al = a.length, bl = b.length, i, j;
    var d = Array(al + 1);
    for (i = 0; i <= al; i++) {
      d[i] = Array(bl + 1);
      d[i][0] = i;
    }
    for (j = 0; j <= bl; j++) d[0][j] = j;
    for (i = 1; i <= al; i++) {
      for (j = 1; j <= bl; j++) {
        var cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
      }
    }
    return d[al][bl];
  }

  function correctToken(token) {
    if (token.length < 4) return token;
    for (var i = 0; i < TYPO_TERMS.length; i++) {
      var candidate = TYPO_TERMS[i];
      if (Math.abs(candidate.length - token.length) <= 1 && editDistance(token, candidate) <= 1) return candidate;
    }
    return token;
  }

  function norm(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(correctToken)
      .join(' ');
  }

  /** Light stem so snake↔snakes, bit↔bite↔bitten, tooth↔teeth match. */
  function stem(t) {
    t = String(t || '');
    if (!t) return t;
    var map = {
      snakes: 'snake',
      serpent: 'snake',
      serpents: 'snake',
      bitten: 'bite',
      bites: 'bite',
      bit: 'bite',
      fangs: 'fang',
      teeth: 'tooth',
      teeths: 'tooth',
      chasing: 'chase',
      chased: 'chase',
      pursuer: 'chase',
      pursued: 'chase',
      pursuing: 'chase',
      falling: 'fall',
      fallen: 'fall',
      fell: 'fall',
      jerked: 'jerk',
      jolted: 'jolt',
      twitching: 'twitch',
      paralyzed: 'paralysis',
      paralysed: 'paralysis',
      paralyz: 'paralysis',
      paralys: 'paralysis',
      houses: 'house',
      homes: 'home'
    };
    if (map[t]) return map[t];
    if (t.length > 4 && t.charAt(t.length - 1) === 's' && t.charAt(t.length - 2) !== 's') {
      return t.slice(0, -1);
    }
    return t;
  }

  function tokens(s) {
    return norm(s)
      .split(' ')
      .filter(function (t) {
        return t.length > 2 && !STOP[t];
      })
      .map(stem);
  }

  var STOP = {
    the: 1, and: 1, for: 1, that: 1, this: 1, with: 1, from: 1, have: 1,
    was: 1, were: 1, are: 1, been: 1, being: 1, had: 1, has: 1, then: 1,
    than: 1, into: 1, about: 1, there: 1, their: 1, what: 1, when: 1,
    where: 1, which: 1, while: 1, your: 1, you: 1, my: 1, me: 1, i: 1,
    dream: 1, dreamed: 1, dreamt: 1, dreaming: 1, dreams: 1, night: 1,
    like: 1, just: 1, very: 1, really: 1, somehow: 1, something: 1,
    saw: 1, see: 1, seen: 1, did: 1, does: 1, why: 1
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
        console.error('[Lab Search] failed to load index', err);
        throw err;
      });
    return loading;
  }

  function extractSignals(query) {
    var q = norm(query);
    var tags = [];
    var boosts = [];
    var intents = [];
    var phase = '';
    var context = '';
    var i, hit;
    var strongIntent = false;

    for (i = 0; i < LEXICON.length; i++) {
      hit = LEXICON[i];
      if (hit.re.test(q)) {
        tags = tags.concat(hit.tags);
        boosts.push({ tags: hit.tags, w: hit.w, label: hit.tags[0] });
      }
    }
    for (i = 0; i < CONCEPT_MAP.length; i++) {
      hit = CONCEPT_MAP[i];
      if (hit.re.test(q)) {
        tags = tags.concat(hit.tags);
        boosts.push({ tags: hit.tags, w: hit.w, label: hit.label });
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
    for (i = 0; i < INTENT_RULES.length; i++) {
      hit = INTENT_RULES[i];
      if (hit.re.test(q)) {
        intents.push({ href: hit.href, w: hit.w, label: hit.label, theme: !!hit.theme });
        if (!hit.theme) strongIntent = true;
      }
    }
    /* Drop weak theme intents when a specific scenario intent already matched the same pillar family */
    if (strongIntent) {
      intents = intents.filter(function (it) {
        if (!it.theme) return true;
        var parent = it.href;
        return !intents.some(function (s) {
          return !s.theme && s.href.indexOf(parent) === 0 && s.href !== parent;
        });
      });
    }

    return {
      q: q,
      raw: String(query || '').trim(),
      toks: tokens(q),
      tags: uniq(tags),
      boosts: boosts,
      intents: intents,
      phase: phase,
      context: context,
      strongIntent: strongIntent
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
    var evidence = 0;
    var i, t, m, markerHit, tag;

    for (i = 0; i < doc.terms.length; i++) termSet[stem(doc.terms[i])] = 1;

    /* Intent rules — strongest first-party routing */
    for (i = 0; i < (sig.intents || []).length; i++) {
      var intent = sig.intents[i];
      if (doc.href === intent.href) {
        score += intent.w;
        evidence += 3;
        if (reasons.length < 3) reasons.push('intent: ' + intent.label);
      } else if (intent.theme && doc.href.indexOf(intent.href) === 0 && doc.kind === 'dream-lf') {
        /* mild inheritance for children of a theme pillar when no stronger rule hit them */
        score += Math.min(12, intent.w * 0.25);
      }
    }

    /* 1) Somatic markers (highest) */
    markerHit = 0;
    for (i = 0; i < (doc.markers || []).length; i++) {
      m = norm(doc.markers[i]);
      if (!m) continue;
      if (sig.q.indexOf(m) !== -1) {
        markerHit += 1;
        evidence += 2;
        score += 34;
        if (reasons.length < 3) reasons.push('body marker: “' + doc.markers[i] + '”');
      } else {
        var mt = m.split(' ').map(stem);
        var overlap = 0;
        for (var j = 0; j < mt.length; j++) {
          if (sig.toks.indexOf(mt[j]) !== -1) overlap++;
        }
        if (overlap >= 2 || (overlap === 1 && mt.length === 1)) {
          markerHit += 0.5;
          evidence += 1;
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
          tag = stem(b.tags[k]);
          if (termSet[tag] || (doc.title && norm(doc.title).split(' ').map(stem).indexOf(tag) !== -1)) {
            tagHit = 1;
            break;
          }
          for (var mi = 0; mi < (doc.markers || []).length; mi++) {
            if (norm(doc.markers[mi]).indexOf(b.tags[k]) !== -1) {
              tagHit = 1;
              break;
            }
          }
          if (isDreamDoc(doc) && stem(norm(doc.id + ' ' + doc.href)).indexOf(tag) !== -1) tagHit = 1;
        }
        if (tagHit) {
          evidence += 1;
          score += b.w;
          if (reasons.length < 3) reasons.push('matched “' + b.label + '”');
        }
      }
      if (b.phase && doc.phase === b.phase) {
        evidence += 1;
        score += b.w * 0.7;
        if (reasons.length < 3) reasons.push('phase ' + doc.phase.toUpperCase());
      }
      if (b.context && doc.context === b.context) {
        evidence += 1;
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
      var slugBits = slug.split('-').map(stem);
      var slugHits = 0;
      for (i = 0; i < slugBits.length; i++) {
        if (slugBits[i].length > 2 && sig.toks.indexOf(slugBits[i]) !== -1) slugHits++;
      }
      if (slugHits >= 2) {
        evidence += 2;
        score += doc.kind === 'dream-lf' ? 42 : 36;
        if (reasons.length < 3) reasons.push('dream theme match');
      } else if (slugHits === 1) {
        evidence += 1;
        /* Pillar with single theme token outranks random LF siblings */
        score += doc.kind === 'dream' ? 28 : 18;
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
    if (tokHits) evidence += Math.min(3, tokHits);
    if (tokHits >= 3 && reasons.length < 3) reasons.push(tokHits + ' matching terms');

    /* No evidence → do not rank on quality priors alone (fixes garbage / wrong LF tops) */
    if (evidence < 1) {
      return { score: 0, reasons: [], markerHit: 0, tokHits: 0, evidence: 0 };
    }

    /* Quality priors — only after evidence */
    if (doc.indexable) score += 6;
    if (isDreamDoc(doc)) score += 10;
    if (doc.kind === 'dream' && !sig.strongIntent) score += 8;
    if (doc.kind === 'dream-lf' && sig.strongIntent) score += 8;
    if (isDreamDoc(doc) && tokHits >= 2) score += 10;
    if (doc.density > 100) score += 2;
    if (doc.rank && doc.rank <= 20) score += 3;

    return { score: score, reasons: reasons, markerHit: markerHit, tokHits: tokHits, evidence: evidence };
  }

  function rankResults(docs, sig) {
    var scored = [];
    var i, doc, s;
    var minScore = sig.strongIntent ? 24 : 22;
    for (i = 0; i < docs.length; i++) {
      doc = docs[i];
      s = scoreDoc(doc, sig);
      if (s.evidence < 1 || s.score < minScore) continue;
      scored.push({
        doc: doc,
        score: s.score,
        reasons: s.reasons,
        markerHit: s.markerHit,
        tokHits: s.tokHits,
        evidence: s.evidence
      });
    }
    scored.sort(function (a, b) {
      var aDream = isDreamDoc(a.doc) ? 1 : 0;
      var bDream = isDreamDoc(b.doc) ? 1 : 0;
      if (Math.abs(a.score - b.score) < 8 && aDream !== bDream) return bDream - aDream;
      return b.score - a.score || (a.doc.rank || 999) - (b.doc.rank || 999);
    });

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

    if (out.length && isDreamDoc(out[0].doc) && out.length < 3) {
      for (i = 0; i < scored.length; i++) {
        if (scored[i].doc.kind === 'somatic' && scored[i].score >= 28) {
          var exists = out.some(function (x) { return x.doc.id === scored[i].doc.id; });
          if (!exists) out.push(scored[i]);
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
    if (kind === 'dream' || kind === 'dream-lf') return 'Dream mechanism';
    return 'Somatic marker';
  }

  function setResultsOpen(root, open) {
    var hero = root.closest('.onx-lab-hero') || document.querySelector('.onx-lab-hero');
    if (hero) {
      if (open) hero.classList.add('has-lab-results');
      else hero.classList.remove('has-lab-results');
    }
  }

  function revealResults(box) {
    if (!box) return;
    box.hidden = false;
    if (!box.getAttribute('tabindex')) box.setAttribute('tabindex', '-1');
    if (!box.getAttribute('aria-live')) box.setAttribute('aria-live', 'polite');
    if (!box.getAttribute('role')) box.setAttribute('role', 'status');
  }

  function renderResults(root, items, query) {
    var box = root.querySelector('[data-lab-search-results]');
    if (!box) return;

    if (!items.length) {
      box.innerHTML =
        '<div class="onx-lab-search__empty">' +
        '<p><strong>No strong match yet.</strong> Try renaming the dream with one clear image (snake, chase, teeth) and one body note (jolt, jaw, can’t move, chest pressure).</p>' +
        '<p class="onx-lab-search__empty-links">Or browse <a href="/dreams/">Dream Meaning</a> · start from the body in <a href="/tools/oneirox-dream-mapper">Sensory Dream Mapper</a></p>' +
        '</div>';
      setResultsOpen(root, true);
      revealResults(box);
      return;
    }

    var primary = items[0];
    var rest = items.slice(1);
    var html = '';

    html += '<p class="onx-lab-search__status">Closest match</p>';
    html += '<article class="onx-lab-search__primary">';
    html += '<span class="onx-lab-search__badge">' + escapeHtml(kindLabel(primary.doc.kind)) + '</span>';
    html += '<h3 class="onx-lab-search__hit-title"><a href="' + escapeHtml(primary.doc.href) + '">' + escapeHtml(primary.doc.title) + '</a></h3>';
    if (primary.doc.blurb) {
      html += '<p class="onx-lab-search__blurb">' + escapeHtml(primary.doc.blurb) + '</p>';
    }
    if (primary.reasons.length) {
      html += '<p class="onx-lab-search__why">Why this fits: ' + escapeHtml(primary.reasons.join(' · ')) + '</p>';
    }
    html += '<a class="btn btn--primary onx-lab-search__cta" href="' + escapeHtml(primary.doc.href) + '">Open result →</a>';
    html += '</article>';

    if (rest.length) {
      html += '<p class="onx-lab-search__status" style="margin-top:1rem">Also close</p>';
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
      '<p class="onx-lab-search__foot">Not a diagnosis · routes you to Oneirox dream &amp; somatic pages</p>';

    box.innerHTML = html;
    setResultsOpen(root, true);
    revealResults(box);
  }

  var searchBusy = false;

  function runSearch(root) {
    var ta = root.querySelector('[data-lab-search-input]');
    var btn = root.querySelector('[data-lab-search-run]');
    var box = root.querySelector('[data-lab-search-results]');
    if (!ta) return;
    if (searchBusy) return;

    var q = ta.value.trim();
    if (q.length < 3) {
      if (box) {
        box.innerHTML = '<div class="onx-lab-search__empty"><p>Type a short description of the dream or body sensation, then search.</p></div>';
        setResultsOpen(root, true);
        revealResults(box);
      }
      return;
    }

    var runLabel =
      (btn && btn.getAttribute('data-lab-search-run-label')) || 'Why did I see this? →';

    searchBusy = true;
    if (btn) {
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.textContent = 'Searching…';
    }

    loadIndex()
      .then(function (data) {
        var sig = extractSignals(q);
        var items = rankResults(data.docs || [], sig);
        renderResults(root, items, q);
      })
      .catch(function (err) {
        console.error('[Lab Search] index/search failed', err);
        if (box) {
          box.innerHTML =
            '<div class="onx-lab-search__empty"><p><strong>Search hit a temporary problem.</strong> Browse <a href="/dreams/">Dream Meaning</a> or <a href="/somatic/">Somatic</a> while we recover.</p></div>';
          setResultsOpen(root, true);
          revealResults(box);
        }
      })
      .finally(function () {
        searchBusy = false;
        if (btn) {
          btn.disabled = false;
          btn.removeAttribute('aria-busy');
          btn.textContent = runLabel;
        }
      });
  }

  function ensureTipSlot(tipRoot, attr, className) {
    var el = tipRoot.querySelector('[' + attr + ']');
    if (el) return el;
    el = document.createElement('p');
    el.className = className;
    el.setAttribute(attr, '');
    tipRoot.appendChild(el);
    return el;
  }

  function bindTip(root) {
    var tipRoot = root.querySelector('[data-lab-search-tip]');
    if (!tipRoot || tipRoot.__onxTipBound) return;
    tipRoot.__onxTipBound = true;

    var bodyEl = ensureTipSlot(tipRoot, 'data-lab-search-tip-body', 'onx-lab-tip__body');
    var metaEl = ensureTipSlot(tipRoot, 'data-lab-search-tip-meta', 'onx-lab-tip__meta');
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

  /* The homepage is partly deferred. Keep a document-level fallback so a
     browser never falls through to the form's native reload if binding races. */
  function bindDocumentFallback() {
    if (document.__onxLabSearchFallbackBound) return;
    document.__onxLabSearchFallbackBound = true;

    document.addEventListener('submit', function (e) {
      var form = e.target && e.target.closest && e.target.closest('[data-lab-search-form]');
      if (!form) return;
      e.preventDefault();
      var root = form.closest('[data-lab-search]');
      if (root) runSearch(root);
    }, true);

    document.addEventListener('keydown', function (e) {
      var ta = e.target && e.target.closest && e.target.closest('[data-lab-search-input]');
      var isEnter = e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13;
      if (!ta || !isEnter || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || e.isComposing || e.keyCode === 229) return;
      e.preventDefault();
      var root = ta.closest('[data-lab-search]');
      if (root) runSearch(root);
    }, true);
  }

  bindDocumentFallback();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Test/debug hook (no behavior change in browsers that ignore it) */
  try {
    if (typeof globalThis !== 'undefined') {
      globalThis.__ONX_LAB_SEARCH__ = {
        extractSignals: extractSignals,
        rankResults: rankResults,
        norm: norm,
        tokens: tokens
      };
    }
  } catch (e) {}
})();
