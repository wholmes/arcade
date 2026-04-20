var PM = window.PM || (window.PM = {});

var fpsHud = null;
var fpsFrames = 0;
var fpsLastT = 0;

var pCanvas = document.getElementById('pcanvas');
var pCtx = pCanvas && pCanvas.getContext && pCanvas.getContext('2d');
var particles = [];
var lastPTime = 0;
/** When true, animParticles is scheduled; when idle + perf-light, we stop to avoid 60fps wakeups. */
var particleLoopRunning = false;

function ensureParticleLoop() {
  if (particleLoopRunning) return;
  particleLoopRunning = true;
  lastPTime = 0;
  requestAnimationFrame(animParticles);
}

function resizeCanvas() {
  if (!pCanvas) return;
  var wrap = document.getElementById('board-wrap');
  if (wrap) {
    var r = wrap.getBoundingClientRect();
    var w = Math.max(1, Math.round(r.width));
    var h = Math.max(1, Math.round(r.height));
    pCanvas.width = w;
    pCanvas.height = h;
  } else {
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;
  }
}
PM.resizeParticleCanvas = resizeCanvas;
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
(function () {
  var wrap = document.getElementById('board-wrap');
  if (wrap && typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(function () {
      resizeCanvas();
    }).observe(wrap);
  }
})();

/** Viewport coords → canvas bitmap coords (canvas is only over #board-wrap). */
function viewportToCanvasSpace(vx, vy) {
  if (!pCanvas) return { x: vx, y: vy };
  var cr = pCanvas.getBoundingClientRect();
  return { x: vx - cr.left, y: vy - cr.top };
}

function getCellCenter(r, c) {
  var el = PM.getCellEl(r, c);
  if (el) {
    var rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }
  var board = document.getElementById('board');
  var bRect = board ? board.getBoundingClientRect() : { left: 0, top: 0 };
  var cs = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cs')) || 56;
  var gap = 4;
  return {
    x: bRect.left + 10 + c * (cs + gap) + cs / 2,
    y: bRect.top + 10 + r * (cs + gap) + cs / 2,
  };
}

/** Cell bounds in canvas pixel space (flames spawn from bottom / smoke from top). */
function getCellRectCanvas(r, c) {
  var el = PM.getCellEl(r, c);
  if (!el || !pCanvas) return null;
  var cr = el.getBoundingClientRect();
  var cc = pCanvas.getBoundingClientRect();
  return {
    x: cr.left - cc.left,
    y: cr.top - cc.top,
    w: cr.width,
    h: cr.height,
  };
}

/** Full-cell overlay: reads as the surface burning (matches .cell border-radius). */
PM.spawnCellBurnOverlay = function (r, c) {
  var wrap = document.getElementById('board-wrap');
  if (!wrap) return;
  var cell = PM.getCellEl(r, c);
  if (!cell) return;
  var wr = wrap.getBoundingClientRect();
  var cr = cell.getBoundingClientRect();
  var outer = document.createElement('div');
  outer.className = 'vfx-cell-burn';
  outer.setAttribute('aria-hidden', 'true');
  outer.style.left = cr.left - wr.left + 'px';
  outer.style.top = cr.top - wr.top + 'px';
  outer.style.width = cr.width + 'px';
  outer.style.height = cr.height + 'px';
  var inner = document.createElement('div');
  inner.className = 'vfx-cell-burn-inner';
  outer.appendChild(inner);
  wrap.appendChild(outer);
  setTimeout(function () {
    if (outer.parentNode) outer.parentNode.removeChild(outer);
  }, 480);
};

PM.spawnParticlesAt = function (r, c, color, count, opts) {
  ensureParticleLoop();
  opts = opts || {};
  var comboTier = opts.comboTier || 0;
  /* Fire/smoke: cascades only (tier ≥ 2). First match is a crisp pop; chain reactions build heat. */
  var chainFire = comboTier >= 2;
  count = count === undefined ? 8 : count;
  if (PM.perfLight) count = Math.min(count, 9);
  resizeCanvas();
  var xy = getCellCenter(r, c);
  var cc = viewportToCanvasSpace(xy.x, xy.y);
  var x = cc.x;
  var y = cc.y;
  var br = getCellRectCanvas(r, c);
  function fireX() {
    return br ? br.x + Math.random() * br.w : x + (Math.random() - 0.5) * 5;
  }
  function fireY() {
    return br ? br.y + br.h * (0.5 + Math.random() * 0.5) : y + (Math.random() - 0.5) * 5;
  }
  function smokeX() {
    return br ? br.x + Math.random() * br.w : x + (Math.random() - 0.5) * 12;
  }
  function smokeY() {
    return br ? br.y + br.h * (0.08 + Math.random() * 0.42) : y + (Math.random() - 0.5) * 12;
  }
  if (chainFire) PM.spawnCellBurnOverlay(r, c);
  var sparkBias = 0.72 - Math.min(comboTier, 4) * 0.04;
  for (var i = 0; i < count; i++) {
    var angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
    var speed = 70 + Math.random() * (110 + comboTier * 12);
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.022 + Math.random() * 0.028,
      size: 3.5 + Math.random() * (4.5 + comboTier * 0.35),
      color: color,
      kind: Math.random() > sparkBias ? 'spark' : 'orb',
    });
  }
  if (particles.length > 400) return;
  var fireCap = PM.perfLight ? 1 : 2;
  if (chainFire) {
    for (var f1 = 0; f1 < fireCap; f1++) {
      particles.push({
        x: fireX(),
        y: fireY(),
        vx: (Math.random() - 0.5) * 22,
        vy: -32 - Math.random() * 38,
        life: 1,
        decay: 0.024 + Math.random() * 0.012,
        size: 2.2 + Math.random() * 2,
        kind: 'fire',
        age: 0,
      });
    }
  }
  if (PM.perfLight) return;
  /* Extra fire from 2nd chain onward */
  if (comboTier >= 2) {
    for (var f0 = 0; f0 < 3; f0++) {
      particles.push({
        x: fireX(),
        y: fireY(),
        vx: (Math.random() - 0.5) * 26,
        vy: -38 - Math.random() * 48,
        life: 1,
        decay: 0.026 + Math.random() * 0.014,
        size: 2.5 + Math.random() * 2.5,
        kind: 'fire',
        age: 0,
      });
    }
  }
  if (comboTier >= 3) {
    for (var f = 0; f < 4; f++) {
      particles.push({
        x: fireX(),
        y: fireY(),
        vx: (Math.random() - 0.5) * 30,
        vy: -45 - Math.random() * 55,
        life: 1,
        decay: 0.028 + Math.random() * 0.016,
        size: 3 + Math.random() * 3,
        kind: 'fire',
        age: 0,
      });
    }
  }
  if (comboTier >= 3 && particles.length < 430) {
    for (var s0 = 0; s0 < 2; s0++) {
      particles.push({
        x: smokeX(),
        y: smokeY(),
        vx: (Math.random() - 0.5) * 28,
        vy: -24 - Math.random() * 30,
        life: 1,
        decay: 0.012 + Math.random() * 0.007,
        size: 5 + Math.random() * 3,
        kind: 'smoke',
        age: 0,
      });
    }
  }
  if (comboTier >= 4 && particles.length < 440) {
    for (var s = 0; s < 3; s++) {
      particles.push({
        x: smokeX(),
        y: smokeY(),
        vx: (Math.random() - 0.5) * 30,
        vy: -28 - Math.random() * 35,
        life: 1,
        decay: 0.011 + Math.random() * 0.008,
        size: 5 + Math.random() * 4,
        kind: 'smoke',
        age: 0,
      });
    }
  }
  if (comboTier >= 5 && particles.length < 450) {
    for (var f2 = 0; f2 < 3; f2++) {
      particles.push({
        x: fireX(),
        y: fireY(),
        vx: (Math.random() - 0.5) * 28,
        vy: -48 - Math.random() * 52,
        life: 1,
        decay: 0.028 + Math.random() * 0.015,
        size: 2.5 + Math.random() * 2.5,
        kind: 'fire',
        age: 0,
      });
    }
    for (var s2 = 0; s2 < 2; s2++) {
      particles.push({
        x: smokeX(),
        y: smokeY(),
        vx: (Math.random() - 0.5) * 35,
        vy: -22 - Math.random() * 25,
        life: 1,
        decay: 0.01 + Math.random() * 0.006,
        size: 6 + Math.random() * 5,
        kind: 'smoke',
        age: 0,
      });
    }
  }
};

/**
 * @param {string[]} matchedKeys — cells that matched (gems)
 * @param {{ keySet: Set|Array, sparedKey: string|null }} [staggerCtx] — use same cluster as renderExploding for sync sparks
 */
PM.spawnMatchParticles = function (matchedKeys, staggerCtx) {
  var gs = PM.gs;
  var keySet = staggerCtx && staggerCtx.keySet ? staggerCtx.keySet : matchedKeys;
  var sparedKey = staggerCtx && staggerCtx.sparedKey !== undefined ? staggerCtx.sparedKey : null;
  var tier = Math.min(gs.combo, 6);
  matchedKeys.forEach(function (key) {
    var parts = key.split(',').map(Number);
    var r = parts[0];
    var c = parts[1];
    var cell = gs.board[r][c];
    var color = cell ? PM.GEM_COLORS_HEX[cell.color] : '#ffffff';
    var count = 6 + tier * 2;
    if (count > 18) count = 18;
    if (PM.perfLight) count = Math.min(count, 8);
    var stagger = PM.getExplodeStaggerDelayMs ? PM.getExplodeStaggerDelayMs(keySet, r, c, sparedKey) : 0;
    var spawn = function () {
      PM.spawnParticlesAt(r, c, color, count, { comboTier: tier });
    };
    if (stagger <= 0) spawn();
    else setTimeout(spawn, stagger);
  });
};

function animParticles(ts) {
  if (!pCanvas || !pCtx) {
    particleLoopRunning = false;
    return;
  }
  if (pCanvas.width < 2 || pCanvas.height < 2) resizeCanvas();
  var dt = Math.min((ts - lastPTime) / 1000, 0.05);
  lastPTime = ts;
  pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);

  for (var i = particles.length - 1; i >= 0; i--) {
    var p = particles[i];
    var k = p.kind;
    if (k === 'fire') {
      p.age = (p.age || 0) + dt;
      p.x += p.vx * dt + Math.sin(p.age * 11 + p.size * 3) * 20 * dt;
      p.y += p.vy * dt;
      p.vy -= 26 * dt;
      p.vx += (Math.random() - 0.5) * 36 * dt;
      p.vx *= 0.992;
      p.life -= p.decay * 1.12;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      var af = p.life * p.life;
      var rCore = p.size * af * 2.1;
      var rGrad = p.size * af * 2.45;
      pCtx.save();
      pCtx.translate(p.x, p.y);
      pCtx.scale(1, 1.38);
      pCtx.translate(-p.x, -p.y);
      /* Base: source-over reads reliably on dark boards; lighter alone often looks invisible. */
      pCtx.globalCompositeOperation = 'source-over';
      var g0 = pCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rGrad);
      g0.addColorStop(0, 'rgba(255,248,200,0.88)');
      g0.addColorStop(0.28, 'rgba(255,150,45,0.55)');
      g0.addColorStop(0.58, 'rgba(255,70,25,0.28)');
      g0.addColorStop(1, 'rgba(255,40,0,0)');
      pCtx.globalAlpha = Math.min(1, 0.42 + af * 0.55);
      pCtx.fillStyle = g0;
      pCtx.beginPath();
      pCtx.arc(p.x, p.y, rCore, 0, Math.PI * 2);
      pCtx.fill();
      /* Halo: additive bloom when supported */
      pCtx.globalCompositeOperation = 'lighter';
      pCtx.globalAlpha = Math.min(1, af * 1.05);
      var gf = pCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rGrad);
      gf.addColorStop(0, 'rgba(255,255,220,0.75)');
      gf.addColorStop(0.35, 'rgba(255,160,40,0.55)');
      gf.addColorStop(0.7, 'rgba(255,60,20,0.25)');
      gf.addColorStop(1, 'rgba(255,40,0,0)');
      pCtx.fillStyle = gf;
      pCtx.beginPath();
      pCtx.arc(p.x, p.y, rCore * 1.05, 0, Math.PI * 2);
      pCtx.fill();
      pCtx.restore();
      continue;
    }
    if (k === 'smoke') {
      p.age = (p.age || 0) + dt;
      p.x += p.vx * dt + Math.sin(p.age * 3.1) * 26 * dt;
      p.y += p.vy * dt;
      p.vy -= 10 * dt;
      p.vx *= 0.995;
      p.size += 24 * dt;
      p.life -= p.decay * 0.88;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      var asm = p.life * p.life * 0.78;
      pCtx.save();
      pCtx.globalCompositeOperation = 'source-over';
      var gsm = pCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 0.85);
      gsm.addColorStop(0, 'rgba(140,138,165,0.5)');
      gsm.addColorStop(0.45, 'rgba(85,82,105,0.28)');
      gsm.addColorStop(1, 'rgba(45,42,62,0)');
      pCtx.globalAlpha = asm;
      pCtx.fillStyle = gsm;
      pCtx.beginPath();
      pCtx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
      pCtx.fill();
      pCtx.restore();
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += k === 'spark' ? 120 * dt : 220 * dt;
    p.vx *= k === 'spark' ? 0.99 : 0.98;
    p.life -= p.decay * (k === 'spark' ? 1.35 : 1);
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    var a = p.life * p.life;
    if (k === 'spark') {
      pCtx.save();
      pCtx.globalCompositeOperation = 'lighter';
      pCtx.globalAlpha = a * 0.95;
      pCtx.strokeStyle = p.color;
      pCtx.lineWidth = 2.2 * a;
      pCtx.beginPath();
      pCtx.moveTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04);
      pCtx.lineTo(p.x, p.y);
      pCtx.stroke();
      pCtx.fillStyle = '#fff';
      pCtx.globalAlpha = a * 0.55;
      pCtx.beginPath();
      pCtx.arc(p.x, p.y, 1.8 * a, 0, Math.PI * 2);
      pCtx.fill();
      pCtx.restore();
    } else {
      var g = pCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * p.life * 1.8);
      g.addColorStop(0, 'rgba(255,255,255,0.95)');
      g.addColorStop(0.35, p.color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      pCtx.globalAlpha = a;
      pCtx.fillStyle = g;
      pCtx.beginPath();
      pCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      pCtx.fill();
    }
  }

  if (!PM.perfLight) drawBgDust(ts);
  pCtx.globalAlpha = 1;
  pCtx.globalCompositeOperation = 'source-over';

  if (PM.showFps) {
    if (!fpsHud) {
      fpsHud = document.createElement('div');
      fpsHud.setAttribute('aria-hidden', 'true');
      fpsHud.style.cssText =
        'position:fixed;bottom:10px;left:10px;z-index:9999;font:12px/1.2 ui-monospace,monospace;' +
        'background:rgba(0,0,0,0.75);color:#7f7;padding:6px 10px;border-radius:6px;pointer-events:none';
      document.body.appendChild(fpsHud);
    }
    fpsFrames++;
    if (!fpsLastT) fpsLastT = ts;
    if (ts - fpsLastT >= 1000) {
      var elapsed = (ts - fpsLastT) / 1000;
      fpsHud.textContent = '~' + Math.round(fpsFrames / elapsed) + ' fps · particles ' + particles.length;
      fpsFrames = 0;
      fpsLastT = ts;
    }
  }

  /* Idle + perf-light: no ambient dust — stop the loop until the next match spawns particles. */
  if (particles.length === 0 && PM.perfLight && !PM.showFps) {
    particleLoopRunning = false;
    return;
  }

  requestAnimationFrame(animParticles);
}

var dustParticles = Array.from({ length: 35 }, function () {
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: 0.8 + Math.random() * 1.4,
    speed: 0.2 + Math.random() * 0.4,
    phase: Math.random() * Math.PI * 2,
  };
});

function drawBgDust(ts) {
  if (!pCtx || !pCanvas) return;
  var cr = pCanvas.getBoundingClientRect();
  dustParticles.forEach(function (d) {
    d.y -= d.speed;
    if (d.y < -10) {
      d.y = window.innerHeight + 10;
      d.x = Math.random() * window.innerWidth;
    }
    var lx = d.x - cr.left;
    var ly = d.y - cr.top;
    if (lx < -8 || ly < -8 || lx > pCanvas.width + 8 || ly > pCanvas.height + 8) return;
    var alpha = 0.1 * (0.5 + 0.5 * Math.sin(ts * 0.001 + d.phase));
    pCtx.globalAlpha = alpha;
    pCtx.fillStyle = '#9080c0';
    pCtx.beginPath();
    pCtx.arc(lx, ly, d.r, 0, Math.PI * 2);
    pCtx.fill();
  });
}

if (!PM.perfLight) {
  ensureParticleLoop();
}
