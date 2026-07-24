/**
 * ONEIROX SHARE v2
 * Share Card (canvas) + Email — no duplicate action bar (handled by decode-actions)
 */
(function () {
'use strict';

var CLR = {
  bg:      '#3a4435',
  accent:  '#9aaa90',
  accentD: '#73a563',
  muted:   '#b9c6ad',
  white:   '#f8faf5',
  soft:    'rgba(248,250,245,0.78)'
};

var reading = {
  dream: '',
  signal: '',
  body: '',
  morning: '',
  raw: ''
};

function setReading(data) {
  reading.dream = data.dream || '';
  reading.signal = data.signal || '';
  reading.body = data.body || '';
  reading.morning = data.morning || '';
  reading.raw = data.raw || '';
}

function parseFromRaw(raw) {
  function sec(tag) {
    var m = String(raw || '').match(new RegExp('\\[' + tag + '\\]([\\s\\S]*?)(?=\\[|$)'));
    return m ? m[1].trim() : '';
  }
  reading.signal = sec('SIGNAL');
  reading.body = sec('BODY');
  reading.morning = sec('MORNING');
  reading.raw = raw || '';
}

function openCardModal() {
  var modal = document.getElementById('onx-card-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'onx-card-modal';
    modal.className = 'onx-modal-overlay';
    modal.innerHTML = [
      '<div class="onx-modal" role="dialog" aria-modal="true">',
        '<button type="button" class="onx-modal__close" aria-label="Close">✕</button>',
        '<h3 class="onx-modal__title">Your Dream Reading Card</h3>',
        '<p class="onx-modal__sub">Designed to share — full SIGNAL, readable BODY &amp; MORNING.</p>',
        '<div class="onx-canvas-wrap">',
          '<canvas id="onx-share-canvas" width="1080" height="1440"></canvas>',
        '</div>',
        '<div class="onx-modal__actions">',
          '<button type="button" class="onx-modal__btn onx-modal__btn--primary" id="onx-btn-download">',
            svgIcon('download'), ' Download PNG',
          '</button>',
          '<button type="button" class="onx-modal__btn onx-modal__btn--ghost" id="onx-btn-stories">',
            svgIcon('square'), ' Stories 1:1',
          '</button>',
          '<a class="onx-modal__btn onx-modal__btn--tw" id="onx-btn-twitter" target="_blank" rel="noopener">',
            svgIcon('twitter'), ' Twitter / X',
          '</a>',
          '<button type="button" class="onx-modal__btn onx-modal__btn--ghost" id="onx-btn-fullreading">',
            svgIcon('scroll'), ' Full Reading',
          '</button>',
        '</div>',
        '<div class="onx-full-reading" id="onx-full-reading" style="display:none">',
          '<div class="onx-full-reading__inner" id="onx-full-reading-content"></div>',
        '</div>',
      '</div>'
    ].join('');
    modal.querySelector('.onx-modal__close').onclick = function () {
      modal.classList.remove('open');
      modal.style.cssText = 'display:none';
      document.body.classList.remove('onx-modal-lock');
    };
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        modal.classList.remove('open');
        modal.style.cssText = 'display:none';
        document.body.classList.remove('onx-modal-lock');
      }
    });
    document.body.appendChild(modal);
  }
  injectCSS();
  modal.classList.add('open');
  modal.style.cssText =
    'position:fixed;top:0;right:0;bottom:0;left:0;z-index:2147483000;' +
    'display:flex;align-items:center;justify-content:center;' +
    'padding:20px;box-sizing:border-box;margin:0;' +
    'background:rgba(18,24,16,.58);opacity:1;pointer-events:auto;';
  document.body.classList.add('onx-modal-lock');
  renderCanvas();
  var storiesBtn = document.getElementById('onx-btn-stories');
  if (storiesBtn) {
    storiesBtn.onclick = function () {
      modal.classList.remove('open');
      modal.style.cssText = 'display:none';
      document.body.classList.remove('onx-modal-lock');
      openSignalCard();
    };
  }
}

function openSignalCard() {
  injectCSS();
  var modal = document.getElementById('onx-signal-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'onx-signal-modal';
    modal.className = 'onx-modal-overlay';
    modal.innerHTML = [
      '<div class="onx-modal onx-modal--signal" role="dialog" aria-modal="true">',
        '<button type="button" class="onx-modal__close" aria-label="Close">✕</button>',
        '<h3 class="onx-modal__title">SIGNAL · Stories</h3>',
        '<p class="onx-modal__sub">1080×1080 — one clean SIGNAL. Built for Instagram Stories.</p>',
        '<div class="onx-canvas-wrap onx-canvas-wrap--square">',
          '<canvas id="onx-signal-canvas" width="1080" height="1080"></canvas>',
        '</div>',
        '<div class="onx-modal__actions">',
          '<button type="button" class="onx-modal__btn onx-modal__btn--primary" id="onx-btn-signal-dl">',
            svgIcon('download'), ' Download PNG',
          '</button>',
        '</div>',
      '</div>'
    ].join('');
    modal.querySelector('.onx-modal__close').onclick = function () {
      modal.classList.remove('open');
      modal.style.cssText = 'display:none';
      document.body.classList.remove('onx-modal-lock');
    };
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        modal.classList.remove('open');
        modal.style.cssText = 'display:none';
        document.body.classList.remove('onx-modal-lock');
      }
    });
    document.body.appendChild(modal);
  }
  modal.classList.add('open');
  modal.style.cssText =
    'position:fixed;top:0;right:0;bottom:0;left:0;z-index:2147483000;' +
    'display:flex;align-items:center;justify-content:center;' +
    'padding:20px;box-sizing:border-box;margin:0;' +
    'background:rgba(18,24,16,.58);opacity:1;pointer-events:auto;';
  document.body.classList.add('onx-modal-lock');
  renderSignalCanvas();
}

function renderSignalCanvas() {
  var canvas = document.getElementById('onx-signal-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 1080;
  var H = 1080;
  canvas.width = W;
  canvas.height = H;

  var grd = ctx.createLinearGradient(0, 0, W, H);
  grd.addColorStop(0, '#243028');
  grd.addColorStop(0.5, '#3a4435');
  grd.addColorStop(1, '#1c2824');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(255,255,255,.04)';
  for (var g = 0; g < W; g += 48) {
    ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(W, g); ctx.stroke();
  }

  var pad = 78;
  var maxW = W - pad * 2;

  ctx.fillStyle = CLR.accentD;
  ctx.fillRect(pad, 72, 72, 4);

  ctx.fillStyle = CLR.accent;
  ctx.font = '600 22px "Work Sans", system-ui, sans-serif';
  ctx.fillText('ONEIROX  ·  SIGNAL', pad, 130);

  var signal = (reading.signal || 'Your nervous system delivered a precise signal.')
    .replace(/\s+/g, ' ').trim();
  var len = signal.length;
  var fontSize = len > 280 ? 34 : len > 180 ? 40 : len > 110 ? 46 : 52;
  var lineH = Math.round(fontSize * 1.34);
  var maxLines = len > 280 ? 12 : 10;

  ctx.fillStyle = CLR.white;
  ctx.font = '600 ' + fontSize + 'px "Work Sans", system-ui, sans-serif';
  var lines = wrapLines(ctx, signal, maxW, maxLines);
  var blockH = lines.length * lineH;
  var y = Math.max(210, Math.round((H - blockH) / 2) - 20);
  for (var i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], pad, y + i * lineH);
  }

  ctx.fillStyle = CLR.accentD;
  ctx.fillRect(pad, H - 118, maxW, 2);
  ctx.fillStyle = CLR.accent;
  ctx.font = '500 24px "Work Sans", system-ui, sans-serif';
  ctx.fillText('oneirox.com', pad, H - 68);
  drawQRSymbol(ctx, W - pad - 16, H - 70, 40);

  var dl = document.getElementById('onx-btn-signal-dl');
  if (dl) {
    dl.onclick = function () {
      var link = document.createElement('a');
      link.download = 'oneirox-signal-stories.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  }
}

function wrapLines(ctx, text, maxW, maxLines) {
  var clean = String(text || '').replace(/\s+/g, ' ').trim();
  var words = clean.split(' ');
  var lines = [];
  var line = '';
  for (var i = 0; i < words.length; i++) {
    var test = line ? line + ' ' + words[i] : words[i];
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = words[i];
      if (lines.length >= maxLines) break;
    } else {
      line = test;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  var joined = lines.join(' ');
  if (joined.length < clean.length && lines.length) {
    var last = lines[lines.length - 1];
    while (last.length > 3 && ctx.measureText(last + '…').width > maxW) last = last.slice(0, -1);
    lines[lines.length - 1] = last + '…';
  }
  return lines;
}

function drawBlock(ctx, label, text, x, y, maxW, opts) {
  opts = opts || {};
  var fontSize = opts.fontSize || 34;
  var lineH = opts.lineH || Math.round(fontSize * 1.28);
  var maxLines = opts.maxLines || 5;
  var color = opts.color || CLR.white;
  var font = opts.font || '"Work Sans", system-ui, sans-serif';
  var weight = opts.weight || '400';

  ctx.fillStyle = CLR.accentD;
  ctx.font = '700 22px "Work Sans", system-ui, sans-serif';
  ctx.fillText(label, x, y);

  ctx.fillStyle = color;
  ctx.font = weight + ' ' + fontSize + 'px ' + font;
  var lines = wrapLines(ctx, text, maxW, maxLines);
  for (var i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + 36 + i * lineH);
  }
  return y + 36 + lines.length * lineH + 28;
}

function renderCanvas() {
  var canvas = document.getElementById('onx-share-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 1080;
  var H = 1440;
  canvas.width = W;
  canvas.height = H;

  var grd = ctx.createLinearGradient(0, 0, W, H);
  grd.addColorStop(0, '#2f3a2c');
  grd.addColorStop(0.55, CLR.bg);
  grd.addColorStop(1, '#1f2a2e');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(255,255,255,.035)';
  for (var gx = 0; gx < W; gx += 54) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
  }
  for (var gy = 0; gy < H; gy += 54) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
  }

  var pad = 72;
  var maxW = W - pad * 2;
  var y = 88;

  ctx.fillStyle = CLR.accentD;
  ctx.fillRect(pad, y, maxW, 3);
  y += 56;

  ctx.fillStyle = CLR.accent;
  ctx.font = '600 24px "Work Sans", system-ui, sans-serif';
  ctx.fillText('ONEIROX  ·  DREAM READING', pad, y);
  y += 48;

  if (reading.dream) {
    ctx.fillStyle = 'rgba(201,214,186,.75)';
    ctx.font = '400 26px "Work Sans", system-ui, sans-serif';
    var dreamLines = wrapLines(ctx, '"' + reading.dream + '"', maxW, 3);
    for (var d = 0; d < dreamLines.length; d++) ctx.fillText(dreamLines[d], pad, y + d * 36);
    y += dreamLines.length * 36 + 36;
  }

  ctx.strokeStyle = 'rgba(160,177,143,.25)';
  ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
  y += 48;

  var signal = reading.signal || 'Your nervous system delivered a precise signal.';
  var sigSize = signal.length > 220 ? 32 : signal.length > 140 ? 36 : 40;
  y = drawBlock(ctx, 'SIGNAL', signal, pad, y, maxW, {
    fontSize: sigSize,
    lineH: Math.round(sigSize * 1.38),
    maxLines: 8,
    weight: '600',
    color: CLR.white,
    font: '"Work Sans", system-ui, sans-serif'
  });

  if (reading.body) {
    var bodySize = reading.body.length > 500 ? 26 : 28;
    y = drawBlock(ctx, 'BODY', reading.body, pad, y, maxW, {
      fontSize: bodySize,
      lineH: Math.round(bodySize * 1.4),
      maxLines: 10,
      color: CLR.soft,
      font: '"Work Sans", system-ui, sans-serif'
    });
  }

  if (reading.morning && y < H - 220) {
    ctx.fillStyle = CLR.accentD;
    ctx.font = '700 22px "Work Sans", system-ui, sans-serif';
    ctx.fillText('MORNING', pad, y);
    ctx.fillStyle = CLR.muted;
    ctx.font = '500 28px "Work Sans", system-ui, sans-serif';
    var mLines = wrapLines(ctx, reading.morning, maxW, 5);
    for (var mi = 0; mi < mLines.length; mi++) {
      ctx.fillText(mLines[mi], pad, y + 36 + mi * 40);
    }
  }

  ctx.fillStyle = CLR.accentD;
  ctx.fillRect(pad, H - 110, maxW, 2);
  ctx.fillStyle = CLR.accent;
  ctx.font = '500 26px "Work Sans", system-ui, sans-serif';
  ctx.fillText('oneirox.com', pad, H - 58);
  drawQRSymbol(ctx, W - pad - 20, H - 62, 44);

  var dlBtn = document.getElementById('onx-btn-download');
  if (dlBtn) {
    dlBtn.onclick = function () {
      var link = document.createElement('a');
      link.download = 'oneirox-dream-reading.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  }

  var twBtn = document.getElementById('onx-btn-twitter');
  if (twBtn) {
    twBtn.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(
      (reading.signal || '').substring(0, 200) + '\n\nDecoded with Oneirox\noneirox.com'
    );
  }

  var frBtn = document.getElementById('onx-btn-fullreading');
  var frPanel = document.getElementById('onx-full-reading');
  var frContent = document.getElementById('onx-full-reading-content');
  if (frBtn && frPanel && frContent) {
    frContent.innerHTML = buildFullReadingHTML() || '<p style="color:#5a6850;font-style:italic">No reading yet.</p>';
    frBtn.onclick = function () {
      var open = frPanel.style.display === 'block';
      frPanel.style.display = open ? 'none' : 'block';
      frBtn.innerHTML = svgIcon('scroll') + (open ? ' Full Reading' : ' Hide Reading');
    };
  }
}

function buildFullReadingHTML() {
  var html = '<div class="onx-fr-dream">' + (reading.dream ? '&ldquo;' + esc(reading.dream) + '&rdquo;' : '') + '</div>';
  if (reading.signal) html += '<div class="onx-fr-section"><span class="onx-fr-label">SIGNAL</span><p class="onx-fr-text onx-fr-text--signal">' + esc(reading.signal) + '</p></div>';
  if (reading.body) html += '<div class="onx-fr-section"><span class="onx-fr-label">BODY</span><p class="onx-fr-text">' + esc(reading.body) + '</p></div>';
  if (reading.morning) html += '<div class="onx-fr-section"><span class="onx-fr-label">MORNING</span><p class="onx-fr-text onx-fr-text--morning">' + esc(reading.morning) + '</p></div>';
  return html;
}

function drawQRSymbol(ctx, cx, cy, size) {
  var s = Math.floor(size / 4);
  ctx.fillStyle = CLR.accent;
  [[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],[3,3]].forEach(function (c) {
    ctx.fillRect(cx + c[0] * s - size / 2, cy + c[1] * s - size / 2, s - 2, s - 2);
  });
}

function openEmailModal() {
  injectCSS();
  var modal = document.getElementById('onx-email-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'onx-email-modal';
    modal.className = 'onx-modal-overlay onx-modal-overlay--email';
    modal.setAttribute('role', 'presentation');
    modal.innerHTML = [
      '<div class="onx-modal onx-modal--sm onx-modal--email" role="dialog" aria-modal="true" aria-labelledby="onx-email-title">',
        '<button type="button" class="onx-modal__close" aria-label="Close">✕</button>',
        '<p class="onx-modal__kicker">Email</p>',
        '<h3 class="onx-modal__title" id="onx-email-title">Send reading to your email</h3>',
        '<p class="onx-modal__sub">No account needed. One-time send.</p>',
        '<input type="email" id="onx-email-inp" class="onx-modal__input" placeholder="your@email.com" autocomplete="email" inputmode="email">',
        '<button type="button" class="onx-modal__btn onx-modal__btn--primary onx-modal__btn--block" id="onx-email-send-btn">',
          svgIcon('mail'), ' Send Reading',
        '</button>',
        '<p class="onx-modal__msg" id="onx-email-msg"></p>',
      '</div>'
    ].join('');
    modal.querySelector('.onx-modal__close').onclick = function () { closeEmailModal(); };
    modal.addEventListener('click', function (e) { if (e.target === modal) closeEmailModal(); });
    document.addEventListener('keydown', function onEsc(e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeEmailModal();
    });
    document.body.appendChild(modal);
    document.getElementById('onx-email-send-btn').onclick = sendEmail;
  } else if (modal.parentNode !== document.body) {
    document.body.appendChild(modal);
  }

  // Hard center — survives missing injected CSS / weird containing blocks
  modal.style.cssText =
    'position:fixed;top:0;right:0;bottom:0;left:0;z-index:2147483000;' +
    'display:flex;align-items:center;justify-content:center;' +
    'padding:20px;box-sizing:border-box;margin:0;' +
    'background:rgba(18,24,16,.58);backdrop-filter:blur(3px);' +
    '-webkit-backdrop-filter:blur(3px);opacity:1;pointer-events:auto;';

  modal.classList.add('open');
  document.body.classList.add('onx-modal-lock');
  setTimeout(function () {
    var inp = document.getElementById('onx-email-inp');
    if (inp) inp.focus();
  }, 80);
}

function closeEmailModal() {
  var modal = document.getElementById('onx-email-modal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.style.cssText = 'display:none';
  document.body.classList.remove('onx-modal-lock');
}

function sendEmail() {
  var inp = document.getElementById('onx-email-inp');
  var msg = document.getElementById('onx-email-msg');
  var btn = document.getElementById('onx-email-send-btn');
  var email = inp ? inp.value.trim() : '';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msg.className = 'onx-modal__msg err';
    msg.textContent = 'Enter a valid email address.';
    return;
  }
  btn.disabled = true;
  btn.textContent = 'Sending…';
  msg.textContent = '';

  function doSend() {
    emailjs.init({ publicKey: 'tMlXymk6URaGJEHi2' });
    emailjs.send('service_ko3e0sw', 'template_niig6ad', {
      email: email,
      to_email: email,
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      dream_text: reading.dream || '-',
      signal: reading.signal || '-',
      body_text: reading.body || '-',
      morning: reading.morning || '-'
    }).then(function () {
      msg.className = 'onx-modal__msg ok';
      msg.textContent = 'Sent! Check your inbox.';
      inp.value = '';
      btn.disabled = false;
      btn.innerHTML = svgIcon('mail') + ' Send Reading';
    }, function () {
      msg.className = 'onx-modal__msg err';
      msg.textContent = 'Failed to send. Try again.';
      btn.disabled = false;
      btn.innerHTML = svgIcon('mail') + ' Send Reading';
    });
  }

  if (typeof emailjs !== 'undefined') {
    doSend();
  } else {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload = doSend;
    s.onerror = function () {
      msg.className = 'onx-modal__msg err';
      msg.textContent = 'Failed to load email service.';
      btn.disabled = false;
      btn.innerHTML = svgIcon('mail') + ' Send Reading';
    };
    document.head.appendChild(s);
  }
}

function injectCSS() {
  if (document.getElementById('onx-share-css')) return;
  var s = document.createElement('style');
  s.id = 'onx-share-css';
  s.textContent = [
    '.onx-modal-overlay{position:fixed!important;top:0!important;right:0!important;bottom:0!important;left:0!important;z-index:2147483000!important;background:rgba(18,24,16,.58)!important;display:none;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;margin:0;opacity:1;pointer-events:none}',
    '.onx-modal-overlay.open{display:flex!important;pointer-events:auto!important}',
    'body.onx-modal-lock{overflow:hidden!important}',
    '.onx-modal{background:#f7f9f4;border-radius:18px;padding:28px;width:min(820px,96vw);max-height:92vh;overflow-y:auto;position:relative;border:1px solid rgba(58,68,53,.14);box-shadow:0 28px 80px rgba(0,0,0,.28);transform:none!important;margin:0 auto}',
    '.onx-modal--sm,.onx-modal--email{width:min(400px,94vw)!important;max-width:400px;padding:26px 24px 22px}',
    '.onx-modal__kicker{margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#5a7a58}',
    '.onx-modal__close{position:absolute;top:12px;right:14px;width:32px;height:32px;border-radius:8px;background:rgba(58,68,53,.06);border:none;cursor:pointer;font-size:16px;color:rgba(60,72,48,.55);line-height:1}',
    '.onx-modal__close:hover{background:rgba(58,68,53,.12)}',
    '.onx-modal__title{font-family:"Playfair Display",Georgia,serif;font-size:1.35rem;font-weight:600;color:#1e2818;margin:0 0 6px;padding-right:28px;line-height:1.25}',
    '.onx-modal__sub{font-size:.86rem;color:#5a6850;line-height:1.55;margin:0 0 16px}',
    '.onx-canvas-wrap{border-radius:12px;overflow:hidden;border:1px solid rgba(58,68,53,.14);margin-bottom:16px;line-height:0;background:#3a4435}',
    '.onx-canvas-wrap--square{max-width:420px;margin-left:auto;margin-right:auto}',
    '.onx-modal--signal{width:min(520px,96vw)}',
    '.onx-canvas-wrap canvas{width:100%;height:auto;display:block}',
    '.onx-modal__actions{display:flex;gap:10px;flex-wrap:wrap}',
    '.onx-modal__btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:12px 18px;border-radius:999px;border:none;cursor:pointer;font-family:"Work Sans",sans-serif;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;text-decoration:none}',
    '.onx-modal__btn--block{width:100%;box-sizing:border-box}',
    '.onx-modal__btn--primary{background:#3a4435;color:#e8f2de}',
    '.onx-modal__btn--tw{background:#1a1a1a;color:#fff}',
    '.onx-modal__btn--ghost{background:transparent;color:#5a6850;border:1px solid rgba(75,88,62,.2)}',
    '.onx-modal__input{width:100%;padding:13px 14px;margin-bottom:12px;border:1.5px solid rgba(75,88,62,.22);border-radius:12px;font-family:"Work Sans",sans-serif;font-size:.95rem;background:#fff;color:#1e2818;outline:none;box-sizing:border-box}',
    '.onx-modal__input:focus{border-color:#4a6838;box-shadow:0 0 0 3px rgba(115,165,99,.2)}',
    '.onx-modal__msg{font-size:.8rem;text-align:center;margin-top:10px;min-height:18px}',
    '.onx-modal__msg.ok{color:#4a7038}.onx-modal__msg.err{color:#a03030}',
    '.onx-full-reading{margin-top:16px;background:#eef2ea;border-radius:12px;border:1px solid rgba(75,88,62,.12)}',
    '.onx-full-reading__inner{padding:20px 22px;max-height:360px;overflow-y:auto}',
    '.onx-fr-dream{font-family:"Work Sans",sans-serif;font-style:normal;font-size:.95rem;color:#5a6850;margin-bottom:16px;line-height:1.65;padding-bottom:14px;border-bottom:1px solid rgba(75,88,62,.1)}',
    '.onx-fr-section{margin-bottom:16px}',
    '.onx-fr-label{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#6e8557;display:block;margin-bottom:6px;font-weight:700}',
    '.onx-fr-text{font-family:"Work Sans",sans-serif;font-size:.95rem;line-height:1.7;color:#2a3220;margin:0}',
    '.onx-fr-text--signal{font-size:1rem;font-weight:600;color:#1e2818}',
    '.onx-fr-text--morning{font-style:normal;font-weight:500;color:#2a3220;background:rgba(75,88,62,.06);padding:12px 14px;border-radius:8px}'
  ].join('');
  document.head.appendChild(s);
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function svgIcon(name) {
  var icons = {
    mail: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    download: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    twitter: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    scroll: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    square: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>'
  };
  return icons[name] || '';
}

document.addEventListener('onx-decode-result', function (e) {
  var d = e.detail || {};
  if (d.raw) parseFromRaw(d.raw);
  if (d.dream) reading.dream = d.dream;
});

window.OneiroxShare = {
  setReading: setReading,
  openCard: openCardModal,
  openSignalCard: openSignalCard,
  openEmail: openEmailModal,
  closeEmail: closeEmailModal
};

function init() { injectCSS(); }

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
