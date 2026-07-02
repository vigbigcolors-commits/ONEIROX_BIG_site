/**
 * ONEIROX SHARE v1.0
 * Fetch intercept → Canvas card → Share buttons
 * Colors: #4b583e (main), #6b7a5d, #a0b18f, #6e8557, #66725b
 */
(function () {
'use strict';

/* ═══════════════════════════
   CONFIG
═══════════════════════════ */
var CLR = {
  bg:      '#4b583e',
  bgDark:  '#3a4530',
  accent:  '#a0b18f',
  accentD: '#6e8557',
  light:   '#e8f0de',
  muted:   '#7a8a6a',
  white:   '#f5f8f0'
};

/* ═══════════════════════════
   STATE
═══════════════════════════ */
var reading = {
  dream:    '',
  response: '',
  signal:   '',
  body:     '',
  morning:  ''
};
var interceptReady = false;

/* ═══════════════════════════
   1. DOM WATCHER (safe — no fetch wrapping)
═══════════════════════════ */
function interceptFetch() {
  /* Watch for decode result appearing in DOM */
  watchDecodeResult();
}

function watchDecodeResult() {
  var debounce;
  var lastLen = 0;

  new MutationObserver(function() {
    clearTimeout(debounce);
    debounce = setTimeout(function() {
      /* Find the result container — try all known selectors */
      var resultEl =
        document.getElementById('onx-decode-result') ||
        document.querySelector('[id*="result"][id*="decode"]') ||
        document.querySelector('[class*="decode"][class*="result"]');

      /* Broad fallback: newest substantial text block after the input */
      if (!resultEl) {
        var input = document.querySelector('input[placeholder*="snake" i], input[placeholder*="dream" i]');
        if (input) {
          var parent = input.closest('section, div[class*="wrap"], div[class*="hero"]') || document.body;
          var blocks = parent.querySelectorAll('div, article, section');
          for (var i = blocks.length - 1; i >= 0; i--) {
            var el = blocks[i];
            var txt = (el.innerText || '').trim();
            if (txt.length > 150 && el !== input.parentElement) {
              resultEl = el;
              break;
            }
          }
        }
      }

      if (!resultEl) return;
      var currentLen = (resultEl.innerText || '').trim().length;
      if (currentLen < 80 || currentLen === lastLen) return;
      lastLen = currentLen;

      /* Capture dream from input */
      var inp = document.querySelector('input[placeholder*="snake" i]') ||
                document.querySelector('input[placeholder*="dream" i]') ||
                document.querySelector('.onx-search-wrap input');
      reading.dream = inp ? inp.value.trim() : '';

      /* Parse sections from DOM */
      parseSections(resultEl.innerText || resultEl.textContent || '');

      /* Inject buttons */
      injectShareBar(resultEl);
    }, 700);
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
}

/* ═══════════════════════════
   2. PARSE SECTIONS
═══════════════════════════ */
function parseSections(text) {
  if (!text) return;

  var sigM = text.match(/\[SIGNAL\]([\s\S]*?)(?=\[BODY\]|\[MORNING\]|$)/i);
  var bodM = text.match(/\[BODY\]([\s\S]*?)(?=\[SIGNAL\]|\[MORNING\]|$)/i);
  var morM = text.match(/\[MORNING\]([\s\S]*?)(?=\[SIGNAL\]|\[BODY\]|$)/i);

  reading.signal  = sigM ? sigM[1].trim() : '';
  reading.body    = bodM ? bodM[1].trim() : '';
  reading.morning = morM ? morM[1].trim() : '';

  /* fallback: first sentence = signal, rest = body */
  if (!reading.signal) {
    var clean = text.replace(/\[.*?\]/g, '').trim();
    var dot = clean.search(/[.!?]\s/);
    if (dot > 0 && dot < 200) {
      reading.signal = clean.substring(0, dot + 1).trim();
      reading.body   = clean.substring(dot + 2).trim();
    } else {
      reading.signal = clean.substring(0, 180).trim();
      reading.body   = clean;
    }
  }
}

/* ═══════════════════════════
   3. INJECT SHARE BAR
═══════════════════════════ */
function injectShareBar(resultEl) {
  /* remove old bar */
  var old = document.getElementById('onx-share-bar');
  if (old) old.remove();

  if (!resultEl) return;

  /* build bar */
  var bar = document.createElement('div');
  bar.id = 'onx-share-bar';
  bar.className = 'onx-share-bar';

  bar.innerHTML = [
    '<span class="onx-share-bar__label">Save &amp; share your reading</span>',
    '<div class="onx-share-bar__btns">',
      '<button class="onx-share-btn onx-share-btn--primary" id="onx-btn-card">',
        svgIcon('image'), ' Share Card',
      '</button>',
      '<button class="onx-share-btn onx-share-btn--secondary" id="onx-btn-email">',
        svgIcon('mail'), ' Email to self',
      '</button>',
      '<a class="onx-share-btn onx-share-btn--secondary" id="onx-btn-reddit" target="_blank" rel="noopener">',
        svgIcon('reddit'), ' Reddit',
      '</a>',
      '<button class="onx-share-btn onx-share-btn--ghost" id="onx-btn-copy">',
        svgIcon('copy'), ' Copy',
      '</button>',
    '</div>',
  ].join('');

  /* insert AFTER result */
  resultEl.parentNode.insertBefore(bar, resultEl.nextSibling);

  /* bind events */
  document.getElementById('onx-btn-card').onclick  = openCardModal;
  document.getElementById('onx-btn-email').onclick = openEmailModal;
  document.getElementById('onx-btn-copy').onclick  = copyReading;

  /* Reddit pre-fill */
  var redditText = encodeURIComponent(
    '"' + (reading.dream || 'My dream') + '"\n\n' +
    'Oneirox decoded it as: ' + reading.signal + '\n\n' +
    'Full reading: https://oneirox.com'
  );
  document.getElementById('onx-btn-reddit').href =
    'https://www.reddit.com/r/Dreams/submit?selftext=true&title=' +
    encodeURIComponent((reading.dream || 'Dream reading').substring(0, 80)) +
    '&text=' + redditText;
}

/* ═══════════════════════════
   4. CANVAS SHARE CARD
═══════════════════════════ */
function openCardModal() {
  var modal = document.getElementById('onx-card-modal');
  if (modal) { modal.classList.add('open'); renderCanvas(); return; }

  modal = document.createElement('div');
  modal.id = 'onx-card-modal';
  modal.className = 'onx-modal-overlay';
  modal.innerHTML = [
    '<div class="onx-modal">',
      '<button class="onx-modal__close">✕</button>',
      '<h3 class="onx-modal__title">Your Dream Reading Card</h3>',
      '<p class="onx-modal__sub">Download and share anywhere — Instagram, Stories, WhatsApp.</p>',
      '<div class="onx-canvas-wrap">',
        '<canvas id="onx-share-canvas" width="1080" height="1080"></canvas>',
      '</div>',
      '<div class="onx-modal__actions">',
        '<button class="onx-modal__btn onx-modal__btn--primary" id="onx-btn-download">',
          svgIcon('download'), ' Download PNG',
        '</button>',
        '<a class="onx-modal__btn onx-modal__btn--tw" id="onx-btn-twitter" target="_blank" rel="noopener">',
          svgIcon('twitter'), ' Twitter / X',
        '</a>',
        '<button class="onx-modal__btn onx-modal__btn--ghost" id="onx-btn-fullreading">',
          svgIcon('scroll'), ' Full Reading',
        '</button>',
      '</div>',
      '<div class="onx-full-reading" id="onx-full-reading" style="display:none">',
        '<div class="onx-full-reading__inner" id="onx-full-reading-content"></div>',
      '</div>',
    '</div>'
  ].join('');

  modal.querySelector('.onx-modal__close').onclick = function() { modal.classList.remove('open'); };
  modal.addEventListener('click', function(e){ if(e.target===modal) modal.classList.remove('open'); });
  document.body.appendChild(modal);
  modal.classList.add('open');

  renderCanvas();
}

function renderCanvas() {
  var canvas = document.getElementById('onx-share-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 1080, H = 1080;

  /* ── Background ── */
  ctx.fillStyle = CLR.bg;
  ctx.fillRect(0, 0, W, H);

  /* ── Subtle grid texture ── */
  ctx.strokeStyle = 'rgba(255,255,255,.04)';
  ctx.lineWidth = 1;
  for (var x = 0; x < W; x += 54) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (var y = 0; y < H; y += 54) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  /* ── Top accent line ── */
  ctx.fillStyle = CLR.accentD;
  ctx.fillRect(80, 88, 920, 2);

  /* ── Eyebrow ── */
  ctx.fillStyle = CLR.accent;
  ctx.font = '600 26px "Work Sans", system-ui, sans-serif';
  ctx.letterSpacing = '6px';
  ctx.fillText('⊹ ONEIROX · DREAM READING ⊹', 80, 148);

  /* ── Dream text (the user's input) ── */
  if (reading.dream) {
    ctx.fillStyle = 'rgba(160,177,143,.65)';
    ctx.font = 'italic 32px Georgia, serif';
    ctx.letterSpacing = '0px';
    drawWrappedText(ctx, '\u201c' + reading.dream + '\u201d', 80, 220, 920, 46, 2);
  }

  /* ── Divider ── */
  var divY = reading.dream ? 340 : 220;
  ctx.strokeStyle = 'rgba(160,177,143,.2)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(80, divY); ctx.lineTo(1000, divY); ctx.stroke();

  /* ── Signal label ── */
  ctx.fillStyle = CLR.accentD;
  ctx.font = '700 22px "Work Sans", system-ui, sans-serif';
  ctx.fillText('◈  THE SIGNAL', 80, divY + 64);

  /* ── Signal text (main insight) ── */
  ctx.fillStyle = CLR.white;
  ctx.font = '300 52px Georgia, serif';
  var signalText = reading.signal ? reading.signal.substring(0, 160) : 'Your brain was precise.';
  var signalLines = drawWrappedText(ctx, signalText, 80, divY + 120, 920, 66, 3);
  var signalBottom = divY + 120 + signalLines * 66;

  /* ── Body preview ── */
  if (reading.body && signalBottom < 800) {
    ctx.fillStyle = CLR.muted;
    ctx.font = '400 30px Georgia, serif';
    drawWrappedText(ctx, reading.body.substring(0, 200) + '…', 80, signalBottom + 48, 920, 44, 3);
  }

  /* ── Bottom line ── */
  ctx.fillStyle = CLR.accentD;
  ctx.fillRect(80, 990, 920, 2);

  /* ── URL ── */
  ctx.fillStyle = CLR.accent;
  ctx.font = '500 28px "Work Sans", system-ui, sans-serif';
  ctx.fillText('oneirox.com', 80, 1042);

  /* ── QR placeholder (drawn as a mini grid symbol) ── */
  drawQRSymbol(ctx, 960, 1008, 46);

  /* bind download */
  var dlBtn = document.getElementById('onx-btn-download');
  if (dlBtn) {
    dlBtn.onclick = function() {
      var link = document.createElement('a');
      link.download = 'oneirox-dream-reading.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  }

  /* bind twitter */
  var twBtn = document.getElementById('onx-btn-twitter');
  if (twBtn) {
    var tweet = encodeURIComponent(
      reading.signal.substring(0, 200) + '\n\nDecoded by @Oneirox_com\noneirox.com'
    );
    twBtn.href = 'https://twitter.com/intent/tweet?text=' + tweet;
  }

  /* bind full reading */
  var frBtn = document.getElementById('onx-btn-fullreading');
  var frPanel = document.getElementById('onx-full-reading');
  var frContent = document.getElementById('onx-full-reading-content');
  if (frBtn && frPanel && frContent) {
    frContent.innerHTML = buildFullReadingHTML() || '<p style="color:#5a6850;font-style:italic">Reading content loading...</p>';
    frBtn.onclick = function() {
      if (frPanel.style.display === 'block') {
        frPanel.style.display = 'none';
        frBtn.innerHTML = svgIcon('scroll') + ' Full Reading';
      } else {
        frPanel.style.display = 'block';
        frBtn.innerHTML = svgIcon('scroll') + ' Hide Reading';
        frPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };
  }
}

function buildFullReadingHTML() {
  var html = '<div class="onx-fr-dream">' +
    (reading.dream ? '&ldquo;' + esc(reading.dream) + '&rdquo;' : '') +
  '</div>';
  if (reading.signal) html +=
    '<div class="onx-fr-section">' +
      '<span class="onx-fr-label">◈ The Signal</span>' +
      '<p class="onx-fr-text onx-fr-text--signal">' + esc(reading.signal) + '</p>' +
    '</div>';
  if (reading.body) html +=
    '<div class="onx-fr-section">' +
      '<span class="onx-fr-label">◈ Body</span>' +
      '<p class="onx-fr-text">' + esc(reading.body) + '</p>' +
    '</div>';
  if (reading.morning) html +=
    '<div class="onx-fr-section">' +
      '<span class="onx-fr-label">◈ Morning</span>' +
      '<p class="onx-fr-text onx-fr-text--morning">' + esc(reading.morning) + '</p>' +
    '</div>';
  return html;
}

/* text wrap helper → returns line count */
function drawWrappedText(ctx, text, x, y, maxW, lineH, maxLines) {
  var words = text.split(' ');
  var line  = '';
  var lines = 0;
  for (var i = 0; i < words.length; i++) {
    var test = line + (line ? ' ' : '') + words[i];
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y + lines * lineH);
      line = words[i]; lines++;
      if (lines >= maxLines) { ctx.fillText(line + '…', x, y + lines * lineH); lines++; break; }
    } else {
      line = test;
    }
  }
  if (line && lines < maxLines) { ctx.fillText(line, x, y + lines * lineH); lines++; }
  return lines;
}

/* mini QR-like symbol */
function drawQRSymbol(ctx, cx, cy, size) {
  var s = Math.floor(size / 4);
  ctx.fillStyle = CLR.accent;
  var cells = [[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],[3,3]];
  cells.forEach(function(c) {
    ctx.fillRect(cx + c[0]*s - size/2, cy + c[1]*s - size/2, s-2, s-2);
  });
}

/* ═══════════════════════════
   5. EMAIL MODAL
═══════════════════════════ */
function openEmailModal() {
  var modal = document.getElementById('onx-email-modal');
  if (modal) { modal.classList.add('open'); return; }

  modal = document.createElement('div');
  modal.id = 'onx-email-modal';
  modal.className = 'onx-modal-overlay';
  modal.innerHTML = [
    '<div class="onx-modal onx-modal--sm">',
      '<button class="onx-modal__close">✕</button>',
      '<h3 class="onx-modal__title">Send reading to your email</h3>',
      '<p class="onx-modal__sub">No account needed. One-time send.</p>',
      '<input type="email" id="onx-email-inp" class="onx-modal__input" placeholder="your@email.com" autocomplete="email">',
      '<button class="onx-modal__btn onx-modal__btn--primary" id="onx-email-send-btn">',
        svgIcon('mail'), ' Send Reading',
      '</button>',
      '<p class="onx-modal__msg" id="onx-email-msg"></p>',
    '</div>'
  ].join('');

  modal.querySelector('.onx-modal__close').onclick = function() { modal.classList.remove('open'); };
  modal.addEventListener('click', function(e){ if(e.target===modal) modal.classList.remove('open'); });
  document.body.appendChild(modal);
  document.getElementById('onx-email-send-btn').onclick = sendEmail;
  modal.classList.add('open');
  setTimeout(function(){ document.getElementById('onx-email-inp').focus(); }, 100);
}

function sendEmail() {
  var inp  = document.getElementById('onx-email-inp');
  var msg  = document.getElementById('onx-email-msg');
  var btn  = document.getElementById('onx-email-send-btn');
  var email = inp ? inp.value.trim() : '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msg.className = 'onx-modal__msg err';
    msg.textContent = 'Enter a valid email address.';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Sending…';
  msg.className = '';
  msg.textContent = '';

  function doSend() {
    emailjs.init({ publicKey: 'tMlXymk6URaGJEHi2' });
    emailjs.send(
      'service_ko3e0sw',
      'template_niig6ad',
      {
        email:      email,
        to_email:   email,
        date:       new Date().toLocaleString('en-US', {
                      month:'short', day:'numeric', year:'numeric',
                      hour:'2-digit', minute:'2-digit'
                    }),
        dream_text: reading.dream   || '-',
        signal:     reading.signal  || '-',
        body_text:  reading.body    || '-',
        morning:    reading.morning || '-'
      }
    ).then(
      function() {
        msg.className = 'onx-modal__msg ok';
        msg.textContent = '✓ Sent! Check your inbox.';
        inp.value = '';
        btn.disabled = false;
        btn.innerHTML = svgIcon('mail') + ' Send Reading';
        setTimeout(function() {
          var m = document.getElementById('onx-email-modal');
          if (m) m.classList.remove('open');
        }, 2500);
      },
      function(err) {
        msg.className = 'onx-modal__msg err';
        msg.textContent = 'Failed to send. Try again.';
        btn.disabled = false;
        btn.innerHTML = svgIcon('mail') + ' Send Reading';
        console.error('EmailJS error:', err);
      }
    );
  }

  if (typeof emailjs !== 'undefined') {
    doSend();
  } else {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload = function() { emailjs.init({ publicKey: 'tMlXymk6URaGJEHi2' }); doSend(); };
    s.onerror = function() {
      msg.className = 'onx-modal__msg err';
      msg.textContent = 'Failed to load email service.';
      btn.disabled = false;
      btn.innerHTML = svgIcon('mail') + ' Send Reading';
    };
    document.head.appendChild(s);
  }
}

/* ═══════════════════════════
   6. COPY
═══════════════════════════ */
function copyReading() {
  var text = [
    reading.dream ? '\u201c' + reading.dream + '\u201d' : '',
    reading.signal  ? '── SIGNAL ──\n' + reading.signal  : '',
    reading.body    ? '── BODY ──\n'   + reading.body    : '',
    reading.morning ? '── MORNING ──\n'+ reading.morning : '',
    '\noneirox.com'
  ].filter(Boolean).join('\n\n');

  var btn = document.getElementById('onx-btn-copy');

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() {
      btn.innerHTML = svgIcon('check') + ' Copied!';
      setTimeout(function(){ btn.innerHTML = svgIcon('copy') + ' Copy'; }, 2000);
    });
  } else {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    btn.innerHTML = svgIcon('check') + ' Copied!';
    setTimeout(function(){ btn.innerHTML = svgIcon('copy') + ' Copy'; }, 2000);
  }
}

/* ═══════════════════════════
   7. STYLES
═══════════════════════════ */
function injectCSS() {
  if (document.getElementById('onx-share-css')) return;
  var s = document.createElement('style');
  s.id = 'onx-share-css';
  s.textContent = [
    '\n',
    '/* ── Share Bar ── */\n',
    '.onx-share-bar {\n',
    '  padding: 28px 0 8px;\n',
    '  text-align: center;\n',
    '}\n',
    '.onx-share-bar__label {\n',
    '  display: flex; align-items: center; justify-content: center; gap: 12px;\n',
    '  font-family: "DM Mono", monospace;\n',
    '  font-size: 10px; letter-spacing: .28em; text-transform: uppercase;\n',
    '  color: rgba(75,88,62,.4);\n',
    '  margin-bottom: 18px;\n',
    '}\n',
    '.onx-share-bar__label::before,\n',
    '.onx-share-bar__label::after {\n',
    '  content: \'\'; display: block; height: 1px; width: 48px;\n',
    '  background: rgba(75,88,62,.15);\n',
    '}\n',
    '.onx-share-bar__btns {\n',
    '  display: flex; align-items: center; justify-content: center;\n',
    '  gap: 10px; flex-wrap: wrap;\n',
    '}\n',
    '\n',
    '/* ── Share Buttons ── */\n',
    '.onx-share-btn {\n',
    '  display: inline-flex !important;\n',
    '  align-items: center !important;\n',
    '  gap: 8px !important;\n',
    '  padding: 14px 26px !important;\n',
    '  border-radius: 50px !important;\n',
    '  border: none !important;\n',
    '  cursor: pointer !important;\n',
    '  font-family: "Work Sans", -apple-system, sans-serif !important;\n',
    '  font-size: 14px !important;\n',
    '  font-weight: 500 !important;\n',
    '  letter-spacing: .01em !important;\n',
    '  text-transform: none !important;\n',
    '  text-decoration: none !important;\n',
    '  transition: background .2s, transform .15s !important;\n',
    '  white-space: nowrap !important;\n',
    '}\n',
    '.onx-share-btn:hover { transform: translateY(-2px) !important; text-decoration: none !important; }\n',
    '.onx-share-btn:active { transform: translateY(0) !important; }\n',
    '\n',
    '.onx-share-btn--primary {\n',
    '  background: #6b7a5d !important;\n',
    '  color: #f0f5e8 !important;\n',
    '}\n',
    '.onx-share-btn--primary:hover { background: #7a8a6a !important; }\n',
    '\n',
    '.onx-share-btn--secondary {\n',
    '  background: rgba(255,255,255,.7) !important;\n',
    '  color: #3a4830 !important;\n',
    '  border: 1px solid rgba(75,88,62,.2) !important;\n',
    '}\n',
    '.onx-share-btn--secondary:hover { background: #fff !important; }\n',
    '\n',
    '.onx-share-btn--ghost {\n',
    '  background: transparent !important;\n',
    '  color: #5a6850 !important;\n',
    '  border: 1px solid rgba(75,88,62,.18) !important;\n',
    '}\n',
    '.onx-share-btn--ghost:hover { background: rgba(75,88,62,.06) !important; }\n',
    '\n',
    '/* ── Modals ── *//* ── Modals ── */\n',
    '.onx-modal-overlay {\n',
    '  position: fixed; top:0; left:0; right:0; bottom:0; z-index: 99999;\n',
    '  background: rgba(20,30,15,.6);\n',
    '  display: flex; align-items: center; justify-content: center;\n',
    '  opacity: 0; pointer-events: none; transition: opacity .2s;\n',
    '}\n',
    '.onx-modal-overlay.open { opacity: 1; pointer-events: all; }\n',
    '\n',
    '.onx-modal {\n',
    '  background: #f5f2ea; border-radius: 18px;\n',
    '  padding: 32px; width: 820px; max-width: 94vw; max-height: 90vh; overflow-y: auto;\n',
    '  position: relative;\n',
    '  border: 1px solid rgba(75,88,62,.15);\n',
    '  transform: translateY(14px); transition: transform .2s;\n',
    '}\n',
    '.onx-modal-overlay.open .onx-modal { transform: translateY(0); }\n',
    '.onx-modal--sm { width: 360px; }\n',
    '\n',
    '.onx-modal__close {\n',
    '  position: absolute; top: 16px; right: 18px;\n',
    '  background: none; border: none; cursor: pointer;\n',
    '  font-size: 17px; color: rgba(60,72,48,.3); transition: color .15s;\n',
    '}\n',
    '.onx-modal__close:hover { color: rgba(60,72,48,.7); }\n',
    '\n',
    '.onx-modal__title {\n',
    '  font-family: "Cormorant Garamond", Georgia, serif;\n',
    '  font-size: 1.4rem; font-weight: 300; color: #1e2818; margin-bottom: 6px;\n',
    '}\n',
    '.onx-modal__sub {\n',
    '  font-size: .82rem; color: #5a6850; line-height: 1.6; margin-bottom: 22px;\n',
    '}\n',
    '\n',
    '/* Canvas wrapper */\n',
    '.onx-canvas-wrap {\n',
    '  border-radius: 10px; overflow: hidden;\n',
    '  border: 1px solid rgba(75,88,62,.15);\n',
    '  margin-bottom: 18px;\n',
    '  line-height: 0;\n',
    '}\n',
    '.onx-canvas-wrap canvas {\n',
    '  width: 100%; height: auto; display: block;\n',
    '}\n',
    '\n',
    '/* Modal actions */\n',
    '.onx-modal__actions {\n',
    '  display: flex; gap: 10px; flex-wrap: wrap;\n',
    '}\n',
    '.onx-modal__btn {\n',
    '  display: inline-flex; align-items: center; gap: 7px;\n',
    '  padding: 12px 22px; border-radius: 8px; border: none; cursor: pointer;\n',
    '  font-family: "Work Sans", sans-serif;\n',
    '  font-size: 12px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;\n',
    '  text-decoration: none; transition: opacity .18s;\n',
    '}\n',
    '.onx-modal__btn:hover { opacity: .82; }\n',
    '.onx-modal__btn--primary { background: #4b583e; color: #d8ebb8; }\n',
    '.onx-modal__btn--tw      { background: #1a1a1a; color: #fff; }\n',
    '\n',
    '/* Email input */\n',
    '.onx-modal__input {\n',
    '  width: 100%; padding: 12px 14px; margin-bottom: 12px;\n',
    '  border: 1.5px solid rgba(75,88,62,.2); border-radius: 8px;\n',
    '  font-family: "Work Sans", sans-serif; font-size: .94rem;\n',
    '  background: #fff; color: #1e2818; outline: none;\n',
    '  transition: border-color .2s; box-sizing: border-box;\n',
    '}\n',
    '.onx-modal__input:focus { border-color: #6e8557; }\n',
    '\n',
    '.onx-modal__msg {\n',
    '  font-size: .8rem; text-align: center; margin-top: 10px; min-height: 18px;\n',
    '}\n',
    '.onx-modal__msg.ok  { color: #4a7038; }\n',
    '.onx-modal__msg.err { color: #a03030; }\n',
    '\n',
    '/* ── Full Reading Panel ── */\n',
    '.onx-full-reading {\n',
    '  margin-top: 18px;\n',
    '  background: #f0ede4;\n',
    '  border-radius: 10px;\n',
    '  border: 1px solid rgba(75,88,62,.12);\n',
    '  overflow: hidden;\n',
    '}\n',
    '.onx-full-reading__inner {\n',
    '  padding: 24px 28px;\n',
    '  max-height: 380px;\n',
    '  overflow-y: auto;\n',
    '}\n',
    '.onx-full-reading__inner::-webkit-scrollbar { width: 4px; }\n',
    '.onx-full-reading__inner::-webkit-scrollbar-thumb { background: rgba(75,88,62,.2); border-radius: 2px; }\n',
    '\n',
    '.onx-fr-dream {\n',
    '  font-family: "Cormorant Garamond", Georgia, serif;\n',
    '  font-style: italic; font-size: 1.05rem; color: #5a6850;\n',
    '  margin-bottom: 20px; line-height: 1.7;\n',
    '  padding-bottom: 16px; border-bottom: 1px solid rgba(75,88,62,.1);\n',
    '}\n',
    '.onx-fr-section { margin-bottom: 18px; }\n',
    '.onx-fr-label {\n',
    '  font-family: "DM Mono", monospace;\n',
    '  font-size: 9px; letter-spacing: .22em; text-transform: uppercase;\n',
    '  color: #6e8557; display: block; margin-bottom: 8px;\n',
    '}\n',
    '.onx-fr-text {\n',
    '  font-size: .9rem; line-height: 1.82; color: #2a3220; margin: 0;\n',
    '}\n',
    '.onx-fr-text--signal {\n',
    '  font-size: 1rem; font-weight: 600; color: #1e2818;\n',
    '}\n',
    '.onx-fr-text--morning {\n',
    '  font-style: italic; color: #4a5838;\n',
    '  background: rgba(75,88,62,.06); padding: 12px 16px; border-radius: 6px;\n',
    '}\n',
    '.onx-modal__btn--ghost {\n',
    '  background: transparent; color: #5a6850;\n',
    '  border: 1px solid rgba(75,88,62,.2);\n',
    '}\n',
    '.onx-modal__btn--ghost:hover { background: rgba(75,88,62,.06); }\n',
    '\n'
  ].join('');
  document.head.appendChild(s);
}

/* ═══════════════════════════
   HELPERS
═══════════════════════════ */
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ═══════════════════════════
   8. SVG ICONS
═══════════════════════════ */
function svgIcon(name) {
  var icons = {
    image:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    mail:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    reddit:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path fill="#f5f8f0" d="M15.9 9.5c.5 0 .9-.4.9-.9s-.4-.9-.9-.9-.9.4-.9.9.4.9.9.9zm-8 0c.5 0 .9-.4.9-.9s-.4-.9-.9-.9-.9.4-.9.9.4.9.9.9zm8.8-.4c-.1-.8-.8-1.4-1.7-1.4-.4 0-.8.2-1.1.4-.8-.5-1.9-.8-3-.8s-2.2.3-3 .8c-.3-.3-.7-.4-1.1-.4-.9 0-1.6.6-1.7 1.4-.5.3-.8.9-.8 1.5 0 .9.6 1.7 1.5 2.1v.1c0 1.9 2.2 3.4 5 3.4s5-1.5 5-3.4v-.1c.9-.4 1.5-1.2 1.5-2.1 0-.6-.3-1.2-.6-1.5zm-5 3.9c-1.6 0-2.9-.4-2.9-.9s1.3-.9 2.9-.9 2.9.4 2.9.9-1.3.9-2.9.9z"/></svg>',
    copy:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>',
    download: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    twitter:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    check:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    scroll:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>'
  };
  return icons[name] || '';
}

/* ═══════════════════════════
   INIT
═══════════════════════════ */
function init() {
  injectCSS();
  interceptFetch();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();