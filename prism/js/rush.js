/**
 * rush.js — RUSH mode: gems rain down continuously, survive as long as possible.
 *
 * Mechanics:
 *  • Board starts with 3 rows of gems at the bottom.
 *  • Every RAIN_INTERVAL ms a new gem drops into the top of every column.
 *    Gravity settles each gem to the top of its column's stack.
 *  • Game over when any column's row 0 is occupied when rain fires.
 *  • Player swaps to make matches — all campaign power-ups still work.
 *  • 1-in-8 rain gems are pre-made power gems (lance, nova, prism).
 *  • FEVER: chain 3 combos within 4 s → 10 s of ×3 score + board glow.
 *  • Rain interval starts at 6 s and decreases over time (floor 2 s).
 *  • Score includes time bonus: +1 pt every 2 s survived.
 *  • High score and best time saved to localStorage.
 */

var PM = window.PM || (window.PM = {});

(function () {
  'use strict';

  var ROWS = 8, COLS = 8;
  var RAIN_INTERVAL_START = 5000;   // ms between rain ticks at start
  var RAIN_INTERVAL_MIN   = 1600;   // floor
  var RAIN_SPEEDUP_EVERY  = 12000;  // shave time every N ms
  var RAIN_SPEEDUP_AMOUNT = 300;    // ms removed each step
  var RAIN_DROP_COLS_MIN  = 4;      // columns targeted at start
  var RAIN_DROP_COLS_MAX  = 8;      // columns targeted at peak (full rain)
  var POWER_RAIN_CHANCE   = 0.12;   // 12% chance any rain gem is a power gem
  var FEVER_COMBO_TRIGGER = 3;      // combos needed to enter fever
  var FEVER_WINDOW_MS     = 4000;   // window to chain combos in
  var FEVER_DURATION_MS   = 10000;  // how long fever lasts
  var FEVER_MULTIPLIER    = 3;
  var HS_KEY              = 'prism-rush-hs';
  var HT_KEY              = 'prism-rush-ht'; // best time

  // ── State ────────────────────────────────────────────────────
  var rushActive   = false;
  var rainTimer    = null;
  var speedTimer   = null;
  var timerTick    = null;
  var feverTimer   = null;
  var rainInterval = RAIN_INTERVAL_START;
  var startTime    = 0;
  var elapsedSecs  = 0;
  var feverActive  = false;
  var feverComboCount = 0;
  var lastComboTime   = 0;
  var warnedCols   = new Set();  // columns on their grace cycle
  var nextRainData = null;       // pre-generated preview of next rain

  PM.rushActive = false;

  // ── Helpers ──────────────────────────────────────────────────
  function mkGem(color) { return { type: 'gem', color: color, power: null }; }
  function mkPow(color, p) { return { type: 'power', color: color, power: p }; }
  function rColor() { return Math.floor(Math.random() * PM.NUM_COLORS); }

  var POWER_TYPES = ['lance', 'nova', 'prism'];
  function mkRainGem() {
    if (Math.random() < POWER_RAIN_CHANCE) {
      var p = POWER_TYPES[Math.floor(Math.random() * POWER_TYPES.length)];
      return mkPow(rColor(), p);
    }
    return mkGem(rColor());
  }

  // ── High Score / Best Time ────────────────────────────────────
  PM.getRushHighScore = function () {
    try { return parseInt(localStorage.getItem(HS_KEY), 10) || 0; } catch (e) { return 0; }
  };
  PM.saveRushHighScore = function (score) {
    try { if (score > PM.getRushHighScore()) localStorage.setItem(HS_KEY, String(score)); } catch (e) {}
  };
  PM.getRushBestTime = function () {
    try { return parseInt(localStorage.getItem(HT_KEY), 10) || 0; } catch (e) { return 0; }
  };
  PM.saveRushBestTime = function (secs) {
    try { if (secs > PM.getRushBestTime()) localStorage.setItem(HT_KEY, String(secs)); } catch (e) {}
  };

  function fmtTime(secs) {
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // ── Board init ───────────────────────────────────────────────
  PM.initRushBoard = function () {
    var gs = PM.gs;
    gs.blocked = new Set();
    gs.board = Array.from({ length: ROWS }, function () {
      return Array(COLS).fill(null);
    });
    // Fill bottom 3 rows
    for (var r = ROWS - 3; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        gs.board[r][c] = mkGem(rColor());
      }
    }
    resolveInitRushMatches();
    ensureRushPlayable();
  };

  function resolveInitRushMatches() {
    var gs = PM.gs;
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var cell = gs.board[r][c];
        if (!cell) continue;
        var tries = 0;
        while (tries++ < 20) {
          var hBad = c >= 2 &&
            gs.board[r][c-1] && gs.board[r][c-1].color === cell.color &&
            gs.board[r][c-2] && gs.board[r][c-2].color === cell.color;
          var vBad = r >= 2 &&
            gs.board[r-1][c] && gs.board[r-1][c].color === cell.color &&
            gs.board[r-2][c] && gs.board[r-2][c].color === cell.color;
          if (!hBad && !vBad) break;
          cell.color = rColor();
        }
      }
    }
  }

  function ensureRushPlayable() {
    var gs = PM.gs;
    var tries = 0;
    while (tries++ < 200) {
      if (PM.findHintMove()) return;
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          var cell = gs.board[r][c];
          if (cell && cell.type === 'gem') cell.color = rColor();
        }
      }
      resolveInitRushMatches();
    }
  }

  // ── Target-column selection ───────────────────────────────────
  // Pick the RAIN_DROP_COLS shortest columns (ties broken randomly).
  function currentDropCols() {
    // Linearly interpolate from MIN to MAX as rain interval shrinks
    var t = 1 - (rainInterval - RAIN_INTERVAL_MIN) / (RAIN_INTERVAL_START - RAIN_INTERVAL_MIN);
    t = Math.max(0, Math.min(1, t));
    return Math.round(RAIN_DROP_COLS_MIN + t * (RAIN_DROP_COLS_MAX - RAIN_DROP_COLS_MIN));
  }

  function pickTargetColumns() {
    var gs = PM.gs;
    var n = currentDropCols();
    var info = [];
    for (var c = 0; c < COLS; c++) {
      var h = 0;
      for (var r = 0; r < ROWS; r++) { if (gs.board[r][c]) h++; }
      info.push({ c: c, h: h, rnd: Math.random() });
    }
    info.sort(function (a, b) { return a.h !== b.h ? a.h - b.h : a.rnd - b.rnd; });
    return info.slice(0, n).map(function (x) { return x.c; });
  }

  function genNextRain() {
    var cols = pickTargetColumns();
    var gems = [];
    for (var i = 0; i < COLS; i++) gems.push(null);
    cols.forEach(function (c) { gems[c] = mkRainGem(); });
    return { cols: cols, gems: gems };
  }

  // ── Preview strip ─────────────────────────────────────────────
  function renderRainPreview() {
    var el = document.getElementById('rain-preview');
    if (!el) return;
    if (!nextRainData || !rushActive) { el.innerHTML = ''; return; }
    el.style.gridTemplateColumns = 'repeat(' + COLS + ', var(--cs))';
    el.innerHTML = '';
    for (var c = 0; c < COLS; c++) {
      var cell = document.createElement('div');
      cell.className = 'rain-preview-cell';
      var gem = nextRainData.gems[c];
      if (gem) {
        cell.dataset.color = gem.color;
        if (gem.type === 'power') cell.dataset.power = gem.power;
        if (warnedCols.has(c)) cell.classList.add('warned');
        var inner = document.createElement('div');
        inner.className = 'rain-preview-gem';
        inner.innerHTML = gem.type === 'power' ? PM.POWER_SVG[gem.power] : PM.GEM_SVG[gem.color];
        cell.appendChild(inner);
      }
      el.appendChild(cell);
    }
  }

  // ── Column-warning overlay ────────────────────────────────────
  function updateColWarnings() {
    var board = document.getElementById('board');
    for (var c = 0; c < COLS; c++) {
      var strip = document.querySelector('.col-warn-strip[data-col="' + c + '"]');
      if (!strip) continue;
      strip.classList.toggle('active', warnedCols.has(c));
      // Position strip over the correct column by measuring a cell in that column
      if (board) {
        var cell = board.querySelector('.cell[data-c="' + c + '"]');
        if (cell) {
          var boardRect = board.getBoundingClientRect();
          var cellRect  = cell.getBoundingClientRect();
          strip.style.left  = (cellRect.left - boardRect.left) + 'px';
          strip.style.width = cellRect.width + 'px';
        }
      }
    }
  }

  // ── Rain ─────────────────────────────────────────────────────
  function rainRow() {
    var gs = PM.gs;
    if (!rushActive || gs.busy) {
      clearTimeout(rainTimer);
      rainTimer = setTimeout(rainRow, 400);
      return;
    }

    // Use the pre-generated rain (or create first one)
    if (!nextRainData) nextRainData = genNextRain();
    var rain = nextRainData;
    nextRainData = null;

    // Grace-period check: any targeted column whose row 0 is occupied?
    var overflowCols = rain.cols.filter(function (c) { return !!gs.board[0][c]; });
    if (overflowCols.length > 0) {
      // Second offence → game over
      var fatal = overflowCols.some(function (c) { return warnedCols.has(c); });
      if (fatal) { endRush('overflow'); return; }

      // First offence: warn column, skip it this cycle
      overflowCols.forEach(function (c) { warnedCols.add(c); });
      rain = {
        cols: rain.cols.filter(function (c) { return overflowCols.indexOf(c) === -1; }),
        gems: rain.gems,
      };
    }

    // Clear warnings for columns the player has now dug out
    warnedCols.forEach(function (c) {
      if (!gs.board[0][c]) warnedCols.delete(c);
    });
    updateColWarnings();

    // Drop gems into safe target columns
    rain.cols.forEach(function (c) { gs.board[0][c] = rain.gems[c]; });
    PM.applyRushGravity();

    // Pre-generate next rain preview
    nextRainData = genNextRain();
    renderRainPreview();

    if (PM.playSfx) PM.playSfx('swap');
    PM.renderBoard();
    updateDanger();

    setTimeout(function () {
      if (!rushActive) return;
      for (var r = 0; r < ROWS; r++)
        for (var c = 0; c < COLS; c++)
          if (gs.board[r][c]) delete gs.board[r][c]._fell;
      resolveRainCascade();
    }, PM.GAME_TIMING.gravityFallMs);

    scheduleRain();
  }

  // Match-find: identical to findMatches in game-loop.js, operates on gs.board
  function findRushMatches() {
    var gs = PM.gs;
    var rows = gs.board.length;
    var cols = gs.board[0] ? gs.board[0].length : 0;
    var matched = new Set();
    var r, c, s, e, cell, nc;
    // Horizontal runs
    for (r = 0; r < rows; r++) {
      s = 0;
      while (s < cols) {
        cell = gs.board[r][s];
        if (!cell || cell.type === 'crate') { s++; continue; }
        e = s + 1;
        while (e < cols) {
          nc = gs.board[r][e];
          if (!nc || nc.color !== cell.color) break;
          e++;
        }
        if (e - s >= 3) for (var k = s; k < e; k++) matched.add(r + ',' + k);
        s = e;
      }
    }
    // Vertical runs
    for (c = 0; c < cols; c++) {
      s = 0;
      while (s < rows) {
        cell = gs.board[s] && gs.board[s][c];
        if (!cell || cell.type === 'crate') { s++; continue; }
        e = s + 1;
        while (e < rows) {
          nc = gs.board[e] && gs.board[e][c];
          if (!nc || nc.color !== cell.color) break;
          e++;
        }
        if (e - s >= 3) for (var k2 = s; k2 < e; k2++) matched.add(k2 + ',' + c);
        s = e;
      }
    }
    return matched;
  }

  // Auto-resolve any matches created by rain, with full animation cascade
  async function resolveRainCascade() {
    var gs = PM.gs;
    if (!rushActive) return;

    var matches = findRushMatches();
    if (matches.size === 0) return;

    // Lock the board so the player can't swap mid-resolution
    gs.busy = true;
    gs.combo = 0;

    while (matches.size > 0 && rushActive) {
      gs.combo++;
      var feverMult = PM.getRushScoreMultiplier ? PM.getRushScoreMultiplier() : 1;
      var points = matches.size * 10 * Math.min(gs.combo, 5) * feverMult;
      gs.score += points;

      if (PM.playSfx) PM.playSfx(gs.combo >= 2 ? 'combo' : 'match');
      if (PM.showComboToast) PM.showComboToast(gs.combo, points);
      if (PM.spawnMatchParticles) PM.spawnMatchParticles(matches, { keySet: matches });
      PM.renderExploding(matches, null);
      PM.runClearShake && PM.runClearShake(gs.combo);

      await PM.delay(PM.GAME_TIMING.explodeMs);
      if (!rushActive) break;

      matches.forEach(function (key) {
        var p = key.split(',').map(Number);
        gs.board[p[0]][p[1]] = null;
      });

      PM.applyRushGravity();
      PM.renderBoard();
      PM.renderHUD();
      updateDanger();

      await PM.delay(PM.GAME_TIMING.gravityFallMs);
      if (!rushActive) break;

      // Clear _fell flags
      for (var r = 0; r < ROWS; r++)
        for (var c = 0; c < COLS; c++)
          if (gs.board[r][c]) delete gs.board[r][c]._fell;

      matches = findRushMatches();
    }

    gs.combo = 0;
    gs.busy = false;
  }

  function scheduleRain() {
    clearTimeout(rainTimer);
    rainTimer = setTimeout(rainRow, rainInterval);
  }

  function scheduleSpeedup() {
    clearTimeout(speedTimer);
    speedTimer = setTimeout(function () {
      rainInterval = Math.max(RAIN_INTERVAL_MIN, rainInterval - RAIN_SPEEDUP_AMOUNT);
      scheduleSpeedup();
    }, RAIN_SPEEDUP_EVERY);
  }

  // ── Rush gravity ──────────────────────────────────────────────
  PM.applyRushGravity = function () {
    var gs = PM.gs;
    for (var c = 0; c < COLS; c++) {
      var write = ROWS - 1;
      for (var r = ROWS - 1; r >= 0; r--) {
        if (gs.board[r][c]) {
          if (r !== write) {
            gs.board[write][c] = gs.board[r][c];
            gs.board[write][c]._fell = true;
            gs.board[r][c] = null;
          }
          write--;
        }
      }
    }
  };

  // ── FEVER mode ────────────────────────────────────────────────
  function onRushCombo(combo) {
    if (!rushActive) return;
    var now = Date.now();

    if (feverActive) {
      // Already in fever — extend it on big combos
      if (combo >= 3) {
        clearTimeout(feverTimer);
        feverTimer = setTimeout(endFever, FEVER_DURATION_MS);
      }
      return;
    }

    // Count rapid combos toward fever trigger
    if (now - lastComboTime < FEVER_WINDOW_MS) {
      feverComboCount++;
    } else {
      feverComboCount = 1;
    }
    lastComboTime = now;

    if (feverComboCount >= FEVER_COMBO_TRIGGER) {
      startFever();
    }
  }

  function startFever() {
    feverActive = true;
    feverComboCount = 0;
    document.documentElement.classList.add('rush-fever');
    if (PM.showComboToast) PM.showComboToast(0, 0, 'FEVER!');
    if (PM.playSfx) PM.playSfx('combo');
    clearTimeout(feverTimer);
    feverTimer = setTimeout(endFever, FEVER_DURATION_MS);
  }

  function endFever() {
    feverActive = false;
    document.documentElement.classList.remove('rush-fever');
  }

  PM.getRushScoreMultiplier = function () {
    return feverActive ? FEVER_MULTIPLIER : 1;
  };

  // ── Danger level ──────────────────────────────────────────────
  function updateDanger() {
    if (!rushActive) return;
    var gs = PM.gs;
    // Use the tallest column (fewest empty cells at top) as the danger signal
    var maxStack = 0;
    for (var c = 0; c < COLS; c++) {
      for (var r = 0; r < ROWS; r++) {
        if (gs.board[r][c]) { maxStack = Math.max(maxStack, ROWS - r); break; }
      }
    }
    var pct = maxStack / ROWS; // 0 = empty, 1 = full
    var level = pct >= 1 ? 'critical' : pct >= 0.875 ? 'high' : pct >= 0.75 ? 'medium' : 'low';
    document.documentElement.setAttribute('data-rush-danger', level);
    // Drive CSS danger overlay height via custom property
    document.documentElement.style.setProperty('--rush-danger-pct', (pct * 100).toFixed(1) + '%');
  }

  // ── Survival timer ────────────────────────────────────────────
  function startTimer() {
    elapsedSecs = 0;
    clearInterval(timerTick);
    timerTick = setInterval(function () {
      if (!rushActive) return;
      elapsedSecs++;
      // Time bonus: 1 point every 2 seconds survived
      if (elapsedSecs % 2 === 0) {
        PM.gs.score++;
        PM.renderHUD();
      }
      updateTimerHUD();
    }, 1000);
  }

  function updateTimerHUD() {
    var el = document.getElementById('rush-timer');
    if (el) el.textContent = fmtTime(elapsedSecs);
  }

  // ── HUD ───────────────────────────────────────────────────────
  function buildRushHUD() {
    // Replace the "Moves" block with Speed + Timer
    var hudMv = document.getElementById('hud-mv');
    if (hudMv) {
      hudMv.textContent = fmtTime(0);
      hudMv.id = 'rush-timer';
    }
    document.querySelectorAll('.hud-label').forEach(function (el) {
      if (el.textContent.trim() === 'Moves') el.textContent = 'Time';
    });
    // Level block → shows speed level
    var hudLv = document.getElementById('hud-lv');
    if (hudLv) hudLv.textContent = '1';
    document.querySelectorAll('.hud-label').forEach(function (el) {
      if (el.textContent.trim() === 'Level') el.textContent = 'Level';
    });
  }

  function teardownRushHUD() {
    var rushTimer = document.getElementById('rush-timer');
    if (rushTimer) rushTimer.id = 'hud-mv';
    document.querySelectorAll('.hud-label').forEach(function (el) {
      if (el.textContent.trim() === 'Time') el.textContent = 'Moves';
    });
  }

  function updateSpeedHUD() {
    var speedLevel = Math.round((RAIN_INTERVAL_START - rainInterval) / RAIN_SPEEDUP_AMOUNT) + 1;
    var hudLv = document.getElementById('hud-lv');
    if (hudLv) hudLv.textContent = speedLevel;
  }

  // ── Start ─────────────────────────────────────────────────────
  PM.startRush = function () {
    var gs = PM.gs;
    gs.score    = 0;
    gs.moves    = Infinity;
    gs.maxMoves = Infinity;
    gs.selected = null;
    gs.busy     = false;
    gs.combo    = 0;
    gs.objectives = [];

    rainInterval    = RAIN_INTERVAL_START;
    startTime       = Date.now();
    rushActive      = true;
    PM.rushActive   = true;
    feverActive     = false;
    feverComboCount = 0;
    lastComboTime   = 0;
    warnedCols      = new Set();
    nextRainData    = null;

    PM.hookRushSwap();
    PM.initRushBoard();
    PM.resetHudForLevel();
    PM.renderBoard();
    PM.renderHUD();
    PM.renderObjectives();

    buildRushHUD();

    document.documentElement.setAttribute('data-rush-danger', 'low');
    document.documentElement.style.setProperty('--rush-danger-pct', '0%');
    document.documentElement.classList.add('rush-mode');

    var quitBtn = document.getElementById('game-menu-btn');
    if (quitBtn) quitBtn.classList.remove('hidden');
    var hintBtn = document.querySelector('.game-hint-btn');
    if (hintBtn) hintBtn.style.display = 'none';

    PM.showScreen('game-screen');
    if (PM.playSfx) PM.playSfx('ui');

    requestAnimationFrame(function () {
      if (PM.resizeParticleCanvas) PM.resizeParticleCanvas();
    });

    // Generate first preview before rain starts
    nextRainData = genNextRain();
    renderRainPreview();

    scheduleRain();
    scheduleSpeedup();
    startTimer();

    PM._rushDangerInterval = setInterval(function () {
      updateDanger();
      updateSpeedHUD();
    }, 500);
  };

  // ── End ───────────────────────────────────────────────────────
  function endRush(reason) {
    rushActive    = false;
    PM.rushActive = false;
    clearTimeout(rainTimer);
    clearTimeout(speedTimer);
    clearTimeout(feverTimer);
    clearInterval(timerTick);
    clearInterval(PM._rushDangerInterval);
    endFever();

    document.documentElement.removeAttribute('data-rush-danger');
    document.documentElement.style.removeProperty('--rush-danger-pct');
    document.documentElement.classList.remove('rush-mode');
    warnedCols.clear();
    nextRainData = null;
    var previewEl = document.getElementById('rain-preview');
    if (previewEl) previewEl.innerHTML = '';
    updateColWarnings();

    var quitBtn = document.getElementById('game-menu-btn');
    if (quitBtn) quitBtn.classList.add('hidden');
    var hintBtn = document.querySelector('.game-hint-btn');
    if (hintBtn) hintBtn.style.display = '';

    teardownRushHUD();

    if (reason === 'overflow') {
      PM.saveRushHighScore(PM.gs.score);
      PM.saveRushBestTime(elapsedSecs);
      PM.showRushOver(PM.gs.score, PM.getRushHighScore(), elapsedSecs, PM.getRushBestTime());
    }
  }

  PM.stopRush = function () {
    if (rushActive) endRush('manual');
  };

  // ── Swap hook: fever + danger update ─────────────────────────
  var _origAttemptSwap = null;
  PM.hookRushSwap = function () {
    if (_origAttemptSwap) return;
    _origAttemptSwap = PM.attemptSwap;
    PM.attemptSwap = async function (r1, c1, r2, c2) {
      await _origAttemptSwap.call(this, r1, c1, r2, c2);
      if (rushActive) {
        updateDanger();
        var combo = PM.gs.combo;
        if (combo >= 1) onRushCombo(combo);
      }
    };
  };

})();
