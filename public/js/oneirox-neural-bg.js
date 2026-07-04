/**
 * Oneirox — colored fireflies + airy neural tapestry
 * Hero background + logo icon overlay
 */
(function () {
  'use strict';

  var PI2 = Math.PI * 2;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(pointer: coarse)').matches;
  var isNarrow = window.matchMedia('(max-width: 820px)').matches;
  var isMobilePerf = isTouch || isNarrow;

  var FIREFLY_TYPES = [
    { rgb: [48, 255, 110], rMin: 1.3, rMax: 3.2, speed: 42, weight: 4 },
    { rgb: [55, 175, 255], rMin: 1.4, rMax: 3.4, speed: 48, weight: 4 },
    { rgb: [175, 70, 255], rMin: 1.2, rMax: 2.8, speed: 38, weight: 3 },
    { rgb: [255, 58, 82], rMin: 0.45, rMax: 1.15, speed: 55, weight: 3 },
    { rgb: [175, 255, 155], rMin: 0.35, rMax: 0.95, speed: 62, weight: 3 }
  ];

  function rand(min, max) { return min + Math.random() * (max - min); }
  function rgba(rgb, a) { return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')'; }

  function pickType() {
    var total = 0;
    var i;
    for (i = 0; i < FIREFLY_TYPES.length; i++) total += FIREFLY_TYPES[i].weight;
    var roll = Math.random() * total;
    for (i = 0; i < FIREFLY_TYPES.length; i++) {
      roll -= FIREFLY_TYPES[i].weight;
      if (roll <= 0) return FIREFLY_TYPES[i];
    }
    return FIREFLY_TYPES[0];
  }

  function makeFirefly(w, h, pad, typeOverride) {
    var type = typeOverride || pickType();
    var padX = pad || 0;
    return {
      x: rand(padX, w - padX),
      y: rand(padX, h - padX),
      vx: rand(-18, 18),
      vy: rand(-18, 18),
      wander: rand(0, PI2),
      wanderRate: rand(1.8, 4.2),
      r: rand(type.rMin, type.rMax),
      color: type.rgb,
      maxSpeed: type.speed,
      twinkle: rand(0, PI2),
      twinkleSpeed: rand(2.5, 6.5),
      jitter: rand(0.6, 1.4),
      brightness: rand(0.82, 1.08)
    };
  }

  function spawnFireflies(count, w, h, pad) {
    var list = [];
    var i;
    for (i = 0; i < count; i++) list.push(makeFirefly(w, h, pad));
    return list;
  }

  function updateFirefly(ff, dt, w, h, pad) {
    pad = pad || 0;
    ff.wander += (rand(-1, 1) * ff.wanderRate + Math.sin(ff.twinkle * 0.7) * 0.4) * dt;
    ff.vx += Math.cos(ff.wander) * 34 * dt * ff.jitter;
    ff.vy += Math.sin(ff.wander * 1.17) * 34 * dt * ff.jitter;
    ff.vx += rand(-12, 12) * dt;
    ff.vy += rand(-12, 12) * dt;
    ff.vx *= 0.988;
    ff.vy *= 0.988;
    var sp = Math.hypot(ff.vx, ff.vy);
    if (sp > ff.maxSpeed) {
      ff.vx = (ff.vx / sp) * ff.maxSpeed;
      ff.vy = (ff.vy / sp) * ff.maxSpeed;
    }
    ff.x += ff.vx * dt;
    ff.y += ff.vy * dt;
    ff.twinkle += ff.twinkleSpeed * dt;

    if (ff.x < pad) { ff.x = pad; ff.vx = Math.abs(ff.vx) * rand(0.5, 1); }
    if (ff.x > w - pad) { ff.x = w - pad; ff.vx = -Math.abs(ff.vx) * rand(0.5, 1); }
    if (ff.y < pad) { ff.y = pad; ff.vy = Math.abs(ff.vy) * rand(0.5, 1); }
    if (ff.y > h - pad) { ff.y = h - pad; ff.vy = -Math.abs(ff.vy) * rand(0.5, 1); }
  }

  function drawFirefly(c, ff, visMul, lite) {
    var pulse = 0.55 + 0.45 * Math.sin(ff.twinkle);
    var flicker = 0.88 + 0.12 * Math.sin(ff.twinkle * 2.7 + ff.wander);
    var a = pulse * flicker * visMul * ff.brightness;
    var r = ff.r;
    var rgb = ff.color;
    var x = ff.x;
    var y = ff.y;

    c.save();
    if (!lite) c.globalCompositeOperation = 'lighter';

    if (lite) {
      c.beginPath();
      c.arc(x, y, r * 4.5, 0, PI2);
      c.fillStyle = rgba(rgb, a * 0.35);
      c.fill();
      c.beginPath();
      c.arc(x, y, r * 0.85, 0, PI2);
      c.fillStyle = 'rgba(255,255,255,' + Math.min(1, a * 0.95) + ')';
      c.fill();
      c.restore();
      return;
    }

    var outer = c.createRadialGradient(x, y, 0, x, y, r * 10);
    outer.addColorStop(0, rgba(rgb, a * 0.55));
    outer.addColorStop(0.12, rgba(rgb, a * 0.32));
    outer.addColorStop(0.35, rgba(rgb, a * 0.1));
    outer.addColorStop(1, rgba(rgb, 0));
    c.fillStyle = outer;
    c.beginPath();
    c.arc(x, y, r * 10, 0, PI2);
    c.fill();

    var mid = c.createRadialGradient(x, y, 0, x, y, r * 3.5);
    mid.addColorStop(0, rgba(rgb, a * 0.95));
    mid.addColorStop(0.35, rgba(rgb, a * 0.5));
    mid.addColorStop(1, rgba(rgb, 0));
    c.fillStyle = mid;
    c.beginPath();
    c.arc(x, y, r * 3.5, 0, PI2);
    c.fill();

    var core = c.createRadialGradient(x, y, 0, x, y, r * 1.1);
    core.addColorStop(0, 'rgba(255,255,255,' + Math.min(1, a * 1.1) + ')');
    core.addColorStop(0.45, rgba(rgb, a * 0.85));
    core.addColorStop(1, rgba(rgb, 0));
    c.fillStyle = core;
    c.beginPath();
    c.arc(x, y, r * 1.1, 0, PI2);
    c.fill();

    c.restore();
  }

  function airy(y, h) {
    if (y >= h * 0.18) return 1;
    return 0.55 + (y / (h * 0.18)) * 0.45;
  }

  /* ── Firefly field (hero + logo) ── */
  function FireflyField(container, opts) {
    opts = opts || {};
    this.container = container;
    this.clipCircle = !!opts.clipCircle;
    this.fireflyCount = opts.count || 28;
    this.pad = opts.pad || 8;
    this.visMul = opts.visMul != null ? opts.visMul : 1;
    this.canvasClass = opts.canvasClass || 'onx-neural-bg__canvas';
    this.minFrameMs = opts.minFrameMs || 16;
    this.lite = !!opts.lite;
    this.maxDpr = opts.maxDpr || 1.25;

    this.canvas = document.createElement('canvas');
    this.canvas.className = this.canvasClass;
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true });

    this.w = 0;
    this.h = 0;
    this.dpr = 1;
    this.fireflies = [];
    this.rafId = 0;
    this.lastTs = 0;
    this.lastPaint = 0;
    this.frozen = true;
    this.inView = false;
    this._boundFrame = this.frame.bind(this);
  }

  FireflyField.prototype.resize = function () {
    var rect = this.container.getBoundingClientRect();
    this.w = Math.max(rect.width, 1);
    this.h = Math.max(rect.height, 1);
    this.dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr);
    if (this.w * this.h > 900000) this.dpr = 1;
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.fireflies = spawnFireflies(this.fireflyCount, this.w, this.h, this.pad);
    this.paint(0.016);
  };

  FireflyField.prototype.paint = function (dtSec) {
    var c = this.ctx;
    var i;
    c.clearRect(0, 0, this.w, this.h);

    if (this.clipCircle) {
      c.save();
      c.beginPath();
      c.arc(this.w * 0.5, this.h * 0.5, Math.min(this.w, this.h) * 0.5 - 1, 0, PI2);
      c.clip();
    }

    for (i = 0; i < this.fireflies.length; i++) {
      if (!reducedMotion) updateFirefly(this.fireflies[i], dtSec, this.w, this.h, this.pad);
      var ff = this.fireflies[i];
      drawFirefly(c, ff, this.visMul * airy(ff.y, this.h), this.lite);
    }

    if (this.clipCircle) c.restore();
  };

  FireflyField.prototype.frame = function (ts) {
    if (!this.lastTs) this.lastTs = ts;
    var dt = (ts - this.lastTs) * 0.001;
    this.lastTs = ts;
    if (!this.frozen && this.inView && !document.hidden) {
      if (ts - this.lastPaint >= this.minFrameMs) {
        this.paint(Math.min(dt, 0.05));
        this.lastPaint = ts;
      }
    }
    if (!this.frozen) this.rafId = requestAnimationFrame(this._boundFrame);
  };

  FireflyField.prototype.start = function () {
    if (reducedMotion || !this.frozen) return;
    this.frozen = false;
    this.lastTs = 0;
    this.lastPaint = 0;
    this.rafId = requestAnimationFrame(this._boundFrame);
  };

  FireflyField.prototype.stop = function () {
    this.frozen = true;
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = 0; }
  };

  FireflyField.prototype.setInView = function (visible) {
    this.inView = visible;
    if (!visible || document.hidden) this.stop();
    else if (!reducedMotion) this.start();
  };

  /* ── Hero: axons + fireflies ── */
  var heroContainer = document.querySelector('.onx-neural-bg');
  var hero = document.getElementById('decode');
  var heroField = null;
  var axonCanvas = null;
  var axonCtx = null;

  if (heroContainer) {
    heroField = new FireflyField(heroContainer, {
      count: isNarrow ? 24 : 40,
      pad: 6,
      visMul: 1.05,
      lite: isTouch,
      maxDpr: isTouch ? 1 : 1.25,
      minFrameMs: isTouch ? 28 : 18
    });

    axonCanvas = document.createElement('canvas');
    axonCanvas.className = 'onx-neural-bg__canvas onx-neural-bg__canvas--axons';
    axonCanvas.style.pointerEvents = 'none';
    heroContainer.insertBefore(axonCanvas, heroContainer.firstChild);

    initAxonLayer();
  }

  /* ── Logo icon fireflies ── */
  var logoIcon = document.querySelector('#decode .onx-decode-panel__icon');
  var logoField = null;
  if (logoIcon) {
    logoField = new FireflyField(logoIcon, {
      count: isMobilePerf ? 7 : 12,
      pad: 12,
      visMul: isMobilePerf ? 1.25 : 1.35,
      clipCircle: true,
      canvasClass: 'onx-neiro-fireflies',
      minFrameMs: isMobilePerf ? 42 : 22,
      lite: isMobilePerf,
      maxDpr: 1
    });
    logoField.resize();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        logoField.setInView(entries[0].isIntersecting);
      }, { threshold: 0.08, rootMargin: '20px' }).observe(logoIcon);
    } else {
      logoField.setInView(true);
    }
    window.addEventListener('resize', function () {
      clearTimeout(logoField._rt);
      logoField._rt = setTimeout(function () { logoField.resize(); }, 200);
    }, { passive: true });
  }

  function initAxonLayer() {
    var w = 0, h = 0, span = 0, dpr = 1;
    var nodes = [], edges = [], edgeKeys = {}, cachedPos = [];
    var nodeId = 0, time = 0, lastTs = 0, lastPaint = 0, rafId = 0;
    var frozen = true, inView = false, isScrolling = false, scrollTimer = 0, sparkTick = 0;
    var MIN_FRAME_MS = isTouch || isNarrow ? 20 : 28;
    var NODE_COLORS = [
      [235, 255, 225], [210, 245, 255], [225, 252, 235],
      [200, 240, 255], [245, 255, 230], [195, 235, 250],
      [180, 250, 245], [220, 255, 215]
    ];

    function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

    function setSize() {
      var rect = heroContainer.getBoundingClientRect();
      w = Math.max(rect.width, 1);
      h = Math.max(rect.height, 1);
      span = Math.min(w, h);
      dpr = w * h > 900000 ? 1 : Math.min(window.devicePixelRatio || 1, 1.12);
      axonCanvas.width = Math.floor(w * dpr);
      axonCanvas.height = Math.floor(h * dpr);
      axonCanvas.style.width = w + 'px';
      axonCanvas.style.height = h + 'px';
      axonCtx = axonCanvas.getContext('2d', { alpha: true, desynchronized: true });
      axonCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNetwork();
      updateCache(0);
      paintFrame(0);
    }

    function minSep() { return span * 0.1; }

    function tooCloseXY(x, y, pad) {
      var m = minSep() + (pad || 0);
      for (var i = 0; i < nodes.length; i++) {
        if (Math.hypot(nodes[i].x - x, nodes[i].y - y) < m) return true;
      }
      return false;
    }

    function addNode(x, y, depth, hub) {
      var n = {
        id: nodeId++, idx: nodes.length,
        x: x, y: y, depth: depth + rand(-0.04, 0.04), hub: !!hub,
        radius: hub ? rand(2.4, 3.6) : rand(1.6, 2.6),
        phase: rand(0, PI2),
        pulseSpeed: rand(0.18, 0.48),
        driftSpeed: rand(0.04, 0.22),
        driftAmp: rand(0.6, 2.2),
        color: pick(NODE_COLORS),
        flash: 0
      };
      nodes.push(n);
      return n;
    }

    function makeEdge(a, b, d, isLong) {
      var depth = (a.depth + b.depth) * 0.5;
      var mx = (a.x + b.x) * 0.5;
      var my = (a.y + b.y) * 0.5;
      var perpX = -(b.y - a.y) / d;
      var perpY = (b.x - a.x) / d;
      var bowAmt = isLong ? rand(0.36, 0.58) : rand(0.22, 0.42);
      var bow = rand(-1, 1) * d * bowAmt;
      var hair = 0.22 + rand(0, 0.18);
      var thick = hair + (isLong ? rand(0.1, 0.22) : rand(0.05, 0.12));
      return {
        a: a, b: b, depth: depth, long: isLong, length: d,
        widthA: hair, widthB: thick,
        cp1x: mx + perpX * bow * 1.1,
        cp1y: my + perpY * bow * 1.1,
        cp2x: mx - perpX * bow * 0.65,
        cp2y: my - perpY * bow * 0.65,
        isBlue: false, shimmer: 0, travelers: []
      };
    }

    function link(a, b, forceLong) {
      var d = dist(a, b);
      if (d < minSep() * 0.85) return;
      var lo = a.id < b.id ? a.id : b.id;
      var hi = a.id < b.id ? b.id : a.id;
      var key = lo + ':' + hi;
      if (edgeKeys[key]) return;
      edgeKeys[key] = 1;
      edges.push(makeEdge(a, b, d, forceLong || d > span * 0.32));
    }

    function makeTraveler() {
      return {
        t: rand(0.14, 0.86),
        speed: rand(0.055, 0.13) * (Math.random() < 0.42 ? -1 : 1),
        size: rand(1.6, 2.6),
        trail: rand(0.1, 0.18)
      };
    }

    function placeHub(px, py) {
      for (var attempt = 0; attempt < 14; attempt++) {
        var x = w * px + rand(-22, 22);
        var y = h * py + rand(-14, 14);
        if (!tooCloseXY(x, y, 0)) return addNode(x, y, 0.2 + rand(0, 0.3), true);
      }
      return null;
    }

    function buildNetwork() {
      nodes = []; edges = []; edgeKeys = {}; nodeId = 0;
      var hubs = [];
      var hubSpots = [
        [0.08, 0.2], [0.92, 0.18], [0.06, 0.52], [0.94, 0.5],
        [0.2, 0.78], [0.8, 0.76], [0.5, 0.88],
        [0.16, 0.4], [0.84, 0.38], [0.5, 0.55]
      ];
      hubSpots.forEach(function (p) {
        var hub = placeHub(p[0], p[1]);
        if (hub) hubs.push(hub);
      });
      hubs.forEach(function (hub) {
        var count = rand(2, 3) | 0;
        for (var s = 0; s < count; s++) {
          for (var attempt = 0; attempt < 10; attempt++) {
            var ang = (PI2 / count) * s + rand(-0.35, 0.35);
            var r = rand(54, 108);
            var x = hub.x + Math.cos(ang) * r;
            var y = hub.y + Math.sin(ang) * r;
            if (x < w * 0.03 || x > w * 0.97 || y < h * 0.09 || y > h * 0.94) continue;
            if (tooCloseXY(x, y, 0)) continue;
            link(hub, addNode(x, y, hub.depth + rand(0.06, 0.18), false), false);
            break;
          }
        }
      });
      for (var i = 0; i < hubs.length; i++) {
        for (var j = i + 1; j < hubs.length; j++) {
          if (dist(hubs[i], hubs[j]) < span * 0.24) continue;
          if (Math.random() < 0.55) link(hubs[i], hubs[j], true);
        }
      }
      var field = Math.max(16, (w * h / 20000) | 0);
      field = Math.min(field, 24);
      var placed = 0, tries = 0;
      while (placed < field && tries < field * 14) {
        tries++;
        var fx = rand(w * 0.04, w * 0.96);
        var fy = rand(h * 0.1, h * 0.94);
        if (tooCloseXY(fx, fy, 0)) continue;
        addNode(fx, fy, 0.15 + rand(0, 0.5), false);
        placed++;
      }
      nodes.forEach(function (n) {
        var nearest = [];
        for (var k = 0; k < nodes.length; k++) {
          if (nodes[k].id === n.id) continue;
          var d = dist(n, nodes[k]);
          if (d > minSep() * 1.1 && d < span * 0.2) nearest.push({ node: nodes[k], d: d });
        }
        nearest.sort(function (x, y) { return x.d - y.d; });
        var maxLinks = n.hub ? 2 : 1;
        for (var m = 0; m < Math.min(maxLinks, nearest.length); m++) {
          link(n, nearest[m].node, false);
        }
      });
      for (var lr = 0; lr < 11; lr++) {
        var a = pick(nodes), b = pick(nodes);
        if (a.id !== b.id && dist(a, b) > span * 0.26) link(a, b, true);
      }
      edges.sort(function (x, y) { return y.depth - x.depth; });
      edges.forEach(function (edge) {
        edge.isBlue = Math.random() < 0.48;
        edge.shimmer = rand(0, PI2);
        edge.travelers = [makeTraveler()];
        if (edge.long && Math.random() < 0.35) edge.travelers.push(makeTraveler());
      });
    }

    function axonAiry(y) {
      if (y >= h * 0.22) return 1;
      return 0.62 + (y / (h * 0.22)) * 0.38;
    }

    function updateCache(animT) {
      cachedPos.length = nodes.length;
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var ox = Math.sin(animT * node.driftSpeed + node.phase) * node.driftAmp;
        var oy = Math.cos(animT * node.driftSpeed * 0.74 + node.phase) * node.driftAmp * 0.65;
        cachedPos[i] = { x: node.x + ox, y: node.y + oy, ox: ox, oy: oy };
      }
    }

    function edgeCtrl(edge) {
      var pa = cachedPos[edge.a.idx];
      var pb = cachedPos[edge.b.idx];
      var mx = (pa.ox + pb.ox) * 0.5;
      var my = (pa.oy + pb.oy) * 0.5;
      return {
        pa: pa, pb: pb,
        c1x: edge.cp1x + mx, c1y: edge.cp1y + my,
        c2x: edge.cp2x + mx, c2y: edge.cp2y + my
      };
    }

    function bezierPt(ctrl, tt) {
      var u = 1 - tt, uu = u * u, uuu = uu * u;
      var t2 = tt * tt, t3 = t2 * tt;
      return {
        x: uuu * ctrl.pa.x + 3 * uu * tt * ctrl.c1x + 3 * u * t2 * ctrl.c2x + t3 * ctrl.pb.x,
        y: uuu * ctrl.pa.y + 3 * uu * tt * ctrl.c1y + 3 * u * t2 * ctrl.c2y + t3 * ctrl.pb.y
      };
    }

    function strokeCurve(c, ctrl, lw, color) {
      c.beginPath();
      c.moveTo(ctrl.pa.x, ctrl.pa.y);
      c.bezierCurveTo(ctrl.c1x, ctrl.c1y, ctrl.c2x, ctrl.c2y, ctrl.pb.x, ctrl.pb.y);
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.lineWidth = lw;
      c.strokeStyle = color;
      c.stroke();
    }

    function drawAxon(c, edge, animT) {
      var ctrl = edgeCtrl(edge);
      var shimmer = 0.92 + Math.sin(animT * 0.75 + edge.shimmer) * 0.08;
      var midY = (edge.a.y + edge.b.y) * 0.5;
      var a = (0.52 + (1 - edge.depth) * 0.38) * shimmer * axonAiry(midY);
      var lw = edge.long ? edge.widthB : edge.widthA;
      if (edge.long) {
        strokeCurve(c, ctrl, lw + 2.2, edge.isBlue
          ? 'rgba(120, 200, 245, ' + (a * 0.28) + ')'
          : 'rgba(140, 220, 130, ' + (a * 0.28) + ')');
      }
      strokeCurve(c, ctrl, lw, edge.isBlue
        ? 'rgba(100, 195, 240, ' + a + ')'
        : 'rgba(120, 210, 110, ' + a + ')');
      strokeCurve(c, ctrl, Math.max(0.12, lw * 0.3), 'rgba(255, 255, 255, ' + (a * 0.72) + ')');
    }

    function drawTraveler(c, edge, tr, dtSec) {
      if (reducedMotion) return;
      tr.t += tr.speed * dtSec;
      if (tr.speed > 0 && tr.t > 1) { tr.t = 0; edge.a.flash = 1; }
      if (tr.speed < 0 && tr.t < 0) { tr.t = 1; edge.b.flash = 1; }
      var ctrl = edgeCtrl(edge);
      var headT = tr.t;
      var tailT = tr.speed > 0 ? headT - tr.trail : headT + tr.trail;
      var t0 = Math.max(0, Math.min(headT, tailT));
      var t1 = Math.min(1, Math.max(headT, tailT));
      var steps = edge.long ? 7 : 5;
      var head = bezierPt(ctrl, headT);
      var alpha = (0.72 + (1 - edge.depth) * 0.28) * axonAiry(head.y);
      c.beginPath();
      for (var s = 0; s <= steps; s++) {
        var tt = t0 + (t1 - t0) * (s / steps);
        var p = bezierPt(ctrl, tt);
        if (s === 0) c.moveTo(p.x, p.y);
        else c.lineTo(p.x, p.y);
      }
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.strokeStyle = edge.isBlue
        ? 'rgba(210, 245, 255, ' + (alpha * 0.82) + ')'
        : 'rgba(230, 255, 210, ' + (alpha * 0.82) + ')';
      c.lineWidth = tr.size * 0.9;
      c.stroke();
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.beginPath();
      c.arc(head.x, head.y, tr.size * 5, 0, PI2);
      c.fillStyle = edge.isBlue
        ? 'rgba(160, 220, 255, ' + (alpha * 0.38) + ')'
        : 'rgba(190, 255, 170, ' + (alpha * 0.38) + ')';
      c.fill();
      c.beginPath();
      c.arc(head.x, head.y, tr.size * 2.2, 0, PI2);
      c.fillStyle = edge.isBlue
        ? 'rgba(200, 240, 255, ' + (alpha * 0.7) + ')'
        : 'rgba(220, 255, 200, ' + (alpha * 0.7) + ')';
      c.fill();
      c.beginPath();
      c.arc(head.x, head.y, tr.size * 0.7, 0, PI2);
      c.fillStyle = 'rgba(255, 255, 255, ' + Math.min(1, alpha) + ')';
      c.fill();
      c.restore();
    }

    function drawSynapse(c, node, pulse) {
      var pos = cachedPos[node.idx];
      if (!node.hub) {
        var crowded = 0;
        for (var ci = 0; ci < nodes.length; ci++) {
          if (ci === node.idx) continue;
          if (dist(pos, cachedPos[ci]) < minSep() * 0.85) crowded++;
        }
        if (crowded > 1) return;
      }
      var flash = node.flash || 0;
      node.flash = Math.max(0, flash - 0.04);
      var vis = (0.75 + (1 - node.depth) * 0.25 + flash * 0.35 + pulse * 0.15) * axonAiry(pos.y);
      var r = node.radius * (0.9 + pulse * 0.2 + flash * 0.25);
      var rgb = node.color;
      var halo = r * (node.hub ? 5.2 : 4.2);
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.beginPath();
      c.arc(pos.x, pos.y, halo, 0, PI2);
      c.fillStyle = rgba(rgb, vis * 0.28);
      c.fill();
      c.beginPath();
      c.arc(pos.x, pos.y, r * 2.4, 0, PI2);
      c.fillStyle = rgba(rgb, vis * 0.42);
      c.fill();
      c.beginPath();
      c.arc(pos.x, pos.y, r, 0, PI2);
      c.fillStyle = 'rgba(255, 255, 255, ' + Math.min(1, vis * 0.95) + ')';
      c.fill();
      c.restore();
    }

    function drawSpark(c, x, y, life, isBlue) {
      var a = life * 0.5;
      c.beginPath();
      c.arc(x, y, 2.5 * life, 0, PI2);
      c.fillStyle = isBlue ? 'rgba(220, 245, 255, ' + a + ')' : 'rgba(235, 255, 220, ' + a + ')';
      c.fill();
    }

    function paintFrame(dtSec) {
      var animT = reducedMotion ? 0 : time * 0.001;
      updateCache(animT);
      axonCtx.clearRect(0, 0, w, h);
      var i, j, edge, node, tr;
      for (i = 0; i < edges.length; i++) drawAxon(axonCtx, edges[i], animT);
      sparkTick++;
      if (!reducedMotion && sparkTick % 18 === 0 && edges.length) {
        var se = edges[(Math.random() * edges.length) | 0];
        var sm = bezierPt(edgeCtrl(se), 0.35 + Math.random() * 0.3);
        drawSpark(axonCtx, sm.x, sm.y, 1, se.isBlue);
      }
      for (i = 0; i < edges.length; i++) {
        edge = edges[i];
        for (j = 0; j < edge.travelers.length; j++) {
          drawTraveler(axonCtx, edge, edge.travelers[j], dtSec);
        }
      }
      for (i = 0; i < nodes.length; i++) {
        node = nodes[i];
        var pulse = reducedMotion ? 0.5 : (Math.sin(animT * node.pulseSpeed * 6.28 + node.phase) + 1) * 0.5;
        drawSynapse(axonCtx, node, pulse);
      }
    }

    function axonFrame(ts) {
      if (!lastTs) lastTs = ts;
      var dt = ts - lastTs;
      lastTs = ts;
      if (!frozen && inView && (!isScrolling || isTouch) && !document.hidden) {
        if (ts - lastPaint >= MIN_FRAME_MS) {
          time += dt;
          paintFrame(dt * 0.001);
          lastPaint = ts;
        }
      }
      if (!frozen) rafId = requestAnimationFrame(axonFrame);
    }

    function axonStart() {
      if (reducedMotion || !frozen) return;
      frozen = false; lastTs = 0; lastPaint = 0;
      rafId = requestAnimationFrame(axonFrame);
    }
    function axonStop() {
      frozen = true;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    }

    setSize();
    window.addEventListener('resize', function () { setTimeout(setSize, 200); }, { passive: true });
    window.addEventListener('scroll', function () {
      if (isTouch) return;
      if (!isScrolling) isScrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () { isScrolling = false; }, 100);
    }, { passive: true });

    if (heroField) {
      var syncView = function (visible) {
        heroField.setInView(visible);
        if (visible && !reducedMotion) { inView = true; axonStart(); }
        else { inView = false; axonStop(); }
      };
      if (hero) {
        var r = hero.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) syncView(true);
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (entries) {
            syncView(entries[0].isIntersecting);
          }, { threshold: [0, 0.01, 0.05], rootMargin: '48px 0px' }).observe(hero);
        } else syncView(true);
      }
    }
  }

  if (heroField) {
    heroField.resize();
    window.addEventListener('resize', function () {
      clearTimeout(heroField._rt);
      heroField._rt = setTimeout(function () { heroField.resize(); }, 200);
    }, { passive: true });

    if (hero) {
      var heroRect = hero.getBoundingClientRect();
      if (heroRect.bottom > 0 && heroRect.top < window.innerHeight) {
        heroField.setInView(true);
        if (!reducedMotion) heroField.start();
      }
    }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (heroField) heroField.stop();
      if (logoField) logoField.stop();
    } else {
      if (heroField && heroField.inView) heroField.start();
      if (logoField) logoField.start();
    }
  });
})();
