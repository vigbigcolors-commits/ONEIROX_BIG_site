/**
 * Oneirox — airy neural tapestry
 * Hair-thin axons · soft fireflies · cached frame loop
 */
(function () {
  'use strict';

  var container = document.querySelector('.onx-neural-bg');
  if (!container) return;

  var hero = document.getElementById('decode');
  var canvas = document.createElement('canvas');
  canvas.className = 'onx-neural-bg__canvas';
  container.appendChild(canvas);

  var ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(pointer: coarse)').matches;
  var isNarrow = window.matchMedia('(max-width: 820px)').matches;
  var dpr = 1;
  var w = 0;
  var h = 0;
  var time = 0;
  var nodes = [];
  var edges = [];
  var edgeKeys = {};
  var cachedPos = [];
  var rafId = 0;
  var lastTs = 0;
  var lastPaint = 0;
  var inView = false;
  var frozen = true;
  var isScrolling = false;
  var scrollTimer = 0;
  var nodeId = 0;
  var span = 0;
  var sparkTick = 0;

  var MIN_FRAME_MS = isTouch || isNarrow ? 20 : 33;
  var NODE_COLORS = [
    [235, 255, 225], [210, 245, 255], [225, 252, 235],
    [200, 240, 255], [245, 255, 230], [195, 235, 250],
    [180, 250, 245], [220, 255, 215]
  ];

  function rand(min, max) { return min + Math.random() * (max - min); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function rgba(rgb, a) { return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')'; }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  function setCanvasSize(c, pw, ph) {
    c.width = Math.floor(pw * dpr);
    c.height = Math.floor(ph * dpr);
    c.style.width = pw + 'px';
    c.style.height = ph + 'px';
    var cctx = c.getContext('2d');
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return cctx;
  }

  function resize() {
    var rect = container.getBoundingClientRect();
    w = Math.max(rect.width, 1);
    h = Math.max(rect.height, 1);
    span = Math.min(w, h);
    dpr = w * h > 900000 ? 1 : Math.min(window.devicePixelRatio || 1, 1.12);
    ctx = setCanvasSize(canvas, w, h);
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
      id: nodeId++,
      idx: nodes.length,
      x: x, y: y,
      depth: depth + rand(-0.04, 0.04),
      hub: !!hub,
      radius: hub ? rand(2.4, 3.6) : rand(1.6, 2.6),
      phase: rand(0, Math.PI * 2),
      pulseSpeed: rand(0.18, 0.48),
      driftSpeed: rand(0.04, 0.22),
      driftAmp: rand(0.6, 2.2),
      color: pick(NODE_COLORS),
      flash: 0
    };
    nodes.push(n);
    return n;
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
      if (!tooCloseXY(x, y, 0)) {
        return addNode(x, y, 0.2 + rand(0, 0.3), true);
      }
    }
    return null;
  }

  function buildNetwork() {
    nodes = [];
    edges = [];
    edgeKeys = {};
    nodeId = 0;

    var hubs = [];
    var hubSpots = [
      [0.08, 0.2], [0.92, 0.18],
      [0.06, 0.52], [0.94, 0.5],
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
          var ang = (Math.PI * 2 / count) * s + rand(-0.35, 0.35);
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
    var placed = 0;
    var tries = 0;
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
      var a = pick(nodes);
      var b = pick(nodes);
      if (a.id !== b.id && dist(a, b) > span * 0.26) link(a, b, true);
    }

    edges.sort(function (x, y) { return y.depth - x.depth; });

    edges.forEach(function (edge) {
      edge.isBlue = Math.random() < 0.48;
      edge.shimmer = rand(0, Math.PI * 2);
      edge.travelers = [makeTraveler()];
      if (edge.long && Math.random() < 0.35) edge.travelers.push(makeTraveler());
    });
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

  function airy(y) {
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
    var u = 1 - tt;
    var uu = u * u;
    var uuu = uu * u;
    var t2 = tt * tt;
    var t3 = t2 * tt;
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
    var a = (0.52 + (1 - edge.depth) * 0.38) * shimmer * airy(midY);
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
    var alpha = (0.72 + (1 - edge.depth) * 0.28) * airy(head.y);

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
    c.arc(head.x, head.y, tr.size * 5, 0, Math.PI * 2);
    c.fillStyle = edge.isBlue
      ? 'rgba(160, 220, 255, ' + (alpha * 0.38) + ')'
      : 'rgba(190, 255, 170, ' + (alpha * 0.38) + ')';
    c.fill();

    c.beginPath();
    c.arc(head.x, head.y, tr.size * 2.2, 0, Math.PI * 2);
    c.fillStyle = edge.isBlue
      ? 'rgba(200, 240, 255, ' + (alpha * 0.7) + ')'
      : 'rgba(220, 255, 200, ' + (alpha * 0.7) + ')';
    c.fill();

    c.beginPath();
    c.arc(head.x, head.y, tr.size * 0.7, 0, Math.PI * 2);
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
    var vis = (0.75 + (1 - node.depth) * 0.25 + flash * 0.35 + pulse * 0.15) * airy(pos.y);
    var r = node.radius * (0.9 + pulse * 0.2 + flash * 0.25);
    var rgb = node.color;
    var halo = r * (node.hub ? 5.2 : 4.2);

    c.save();
    c.globalCompositeOperation = 'lighter';

    c.beginPath();
    c.arc(pos.x, pos.y, halo, 0, Math.PI * 2);
    c.fillStyle = rgba(rgb, vis * 0.28);
    c.fill();

    c.beginPath();
    c.arc(pos.x, pos.y, r * 2.4, 0, Math.PI * 2);
    c.fillStyle = rgba(rgb, vis * 0.42);
    c.fill();

    c.beginPath();
    c.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255, 255, 255, ' + Math.min(1, vis * 0.95) + ')';
    c.fill();

    c.restore();
  }

  function drawSpark(c, x, y, life, isBlue) {
    var a = life * 0.5;
    c.beginPath();
    c.arc(x, y, 2.5 * life, 0, Math.PI * 2);
    c.fillStyle = isBlue ? 'rgba(220, 245, 255, ' + a + ')' : 'rgba(235, 255, 220, ' + a + ')';
    c.fill();
  }

  function paintFrame(dtSec) {
    var animT = reducedMotion ? 0 : time * 0.001;
    updateCache(animT);
    ctx.clearRect(0, 0, w, h);

    var i, j, edge, node, tr;

    for (i = 0; i < edges.length; i++) {
      drawAxon(ctx, edges[i], animT);
    }

    sparkTick++;
    if (!reducedMotion && sparkTick % 18 === 0 && edges.length) {
      var se = edges[(Math.random() * edges.length) | 0];
      var sm = bezierPt(edgeCtrl(se), 0.35 + Math.random() * 0.3);
      drawSpark(ctx, sm.x, sm.y, 1, se.isBlue);
    }

    for (i = 0; i < edges.length; i++) {
      edge = edges[i];
      for (j = 0; j < edge.travelers.length; j++) {
        drawTraveler(ctx, edge, edge.travelers[j], dtSec);
      }
    }

    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];
      var pulse = reducedMotion ? 0.5 : (Math.sin(animT * node.pulseSpeed * 6.28 + node.phase) + 1) * 0.5;
      drawSynapse(ctx, node, pulse);
    }
  }

  function frame(ts) {
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

    if (!frozen) rafId = requestAnimationFrame(frame);
  }

  function stopLoop() {
    frozen = true;
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
  }

  function startLoop() {
    if (reducedMotion || !frozen) return;
    frozen = false;
    lastTs = 0;
    lastPaint = 0;
    rafId = requestAnimationFrame(frame);
  }

  function onScroll() {
    if (isTouch) return;
    if (!isScrolling) isScrolling = true;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () { isScrolling = false; }, 100);
  }

  var resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  }

  function setInView(visible) {
    inView = visible;
    if (!inView || document.hidden) stopLoop();
    else if (!reducedMotion) startLoop();
  }

  resize();

  if (hero) {
    var r = hero.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) setInView(true);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        setInView(entries[0].isIntersecting);
      }, { threshold: [0, 0.01, 0.05], rootMargin: '48px 0px' }).observe(hero);
    } else if (!reducedMotion) {
      setInView(true);
    }
  }

  if (!reducedMotion && hero) {
    var rect = hero.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) startLoop();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopLoop();
    else if (!reducedMotion && inView) startLoop();
  });
})();
