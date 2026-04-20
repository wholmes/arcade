var PM = window.PM || (window.PM = {});

(function () {
  var renderApi = {
    renderBoard: function () {},
    renderHUD: function () {},
    renderObjectives: function () {},
    renderExploding: function () {},
  };
  var uiApi = {
    showWin: function () {},
    showLose: function () {},
  };

  PM.configureGame = function (opts) {
    if (opts.render) Object.assign(renderApi, opts.render);
    if (opts.ui) Object.assign(uiApi, opts.ui);
  };

  PM.delay = function (ms) {
    return new Promise(function (r) {
      setTimeout(r, ms);
    });
  };

  function mkGem(color) {
    return { type: 'gem', color: color, power: null };
  }
  function mkPow(color, p) {
    return { type: 'power', color: color, power: p };
  }
  function mkCrate() {
    return { type: 'crate', color: -1, power: null, hp: 3 };
  }

  function rColor() {
    return Math.floor(Math.random() * PM.NUM_COLORS);
  }

  PM.initBoard = function (lv) {
    var gs = PM.gs;
    var rows = lv.rows;
    var cols = lv.cols;
    var blk = lv.blocked;
    var cratePositions = lv.cratePositions;
    gs.blocked = new Set(
      blk.map(function (o) {
        return o.r + ',' + o.c;
      })
    );
    gs.board = Array.from({ length: rows }, function () {
      return Array(cols).fill(null);
    });

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (!gs.blocked.has(r + ',' + c)) gs.board[r][c] = mkGem(rColor());
      }
    }

    cratePositions.forEach(function (o) {
      var r = o.r,
        c = o.c;
      if (!gs.blocked.has(r + ',' + c)) gs.board[r][c] = mkCrate();
    });

    resolveInitMatches();
  };

  function resolveInitMatches() {
    var gs = PM.gs;
    var rows = gs.board.length;
    var cols = gs.board[0].length;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cell = gs.board[r][c];
        if (!cell || cell.type !== 'gem') continue;
        var tries = 0;
        while (tries++ < 20) {
          var hMatch =
            c >= 2 &&
            isGem(r, c - 1) &&
            isGem(r, c - 2) &&
            gs.board[r][c - 1].color === cell.color &&
            gs.board[r][c - 2].color === cell.color;
          var vMatch =
            r >= 2 &&
            isGem(r - 1, c) &&
            isGem(r - 2, c) &&
            gs.board[r - 1][c].color === cell.color &&
            gs.board[r - 2][c].color === cell.color;
          if (!hMatch && !vMatch) break;
          cell.color = (cell.color + 1) % PM.NUM_COLORS;
        }
      }
    }
  }

  function isGem(r, c) {
    var cell = PM.gs.board[r] && PM.gs.board[r][c];
    return cell && (cell.type === 'gem' || cell.type === 'power');
  }

  function findMatches() {
    var gs = PM.gs;
    var rows = gs.board.length;
    var cols = gs.board[0].length;
    var matched = new Set();

    var r, s, e, c, k, cell, nc;
    for (r = 0; r < rows; r++) {
      s = 0;
      while (s < cols) {
        cell = gs.board[r][s];
        if (!cell || cell.type === 'crate' || cell.type === 'blocked') {
          s++;
          continue;
        }
        e = s + 1;
        while (e < cols) {
          nc = gs.board[r][e];
          if (!nc || (nc.type !== 'gem' && nc.type !== 'power') || nc.color !== cell.color) break;
          e++;
        }
        if (e - s >= 3) for (k = s; k < e; k++) matched.add(r + ',' + k);
        s = e;
      }
    }
    for (c = 0; c < cols; c++) {
      s = 0;
      while (s < rows) {
        cell = gs.board[s] && gs.board[s][c];
        if (!cell || cell.type === 'crate' || cell.type === 'blocked') {
          s++;
          continue;
        }
        e = s + 1;
        while (e < rows) {
          nc = gs.board[e] && gs.board[e][c];
          if (!nc || (nc.type !== 'gem' && nc.type !== 'power') || nc.color !== cell.color) break;
          e++;
        }
        if (e - s >= 3) for (k = s; k < e; k++) matched.add(k + ',' + c);
        s = e;
      }
    }
    return matched;
  }

  function detectPowerUp(matched, swapPos) {
    var gs = PM.gs;
    var rowGroups = {};
    var colGroups = {};
    matched.forEach(function (key) {
      var parts = key.split(',').map(Number);
      var r = parts[0],
        c = parts[1];
      var cell = gs.board[r][c];
      if (!cell) return;
      var color = cell.color;
      var rk = color + '_r' + r;
      var ck = color + '_c' + c;
      if (!rowGroups[rk]) rowGroups[rk] = { color: color, cells: [] };
      rowGroups[rk].cells.push({ r: r, c: c });
      if (!colGroups[ck]) colGroups[ck] = { color: color, cells: [] };
      colGroups[ck].cells.push({ r: r, c: c });
    });

    var best = null;

    function tryGroup(group, dir) {
      var color = group.color;
      var cells = group.cells;
      if (cells.length < 4) return;
      var pos =
        swapPos &&
        cells.some(function (p) {
          return p.r === swapPos.r && p.c === swapPos.c;
        })
          ? swapPos
          : cells[Math.floor(cells.length / 2)];
      var power = null;
      if (cells.length >= 5) power = dir === 'row' ? 'prism' : 'prism';
      else if (cells.length === 4) power = dir === 'row' ? 'lance' : 'lance';
      if (!best || cells.length > best.cells.length)
        best = { r: pos.r, c: pos.c, color: color, power: power, cells: cells };
    }

    Object.values(rowGroups).forEach(function (g) {
      tryGroup(g, 'row');
    });
    Object.values(colGroups).forEach(function (g) {
      tryGroup(g, 'col');
    });

    if (best && best.cells.length >= 5) {
      var rs = new Set(
        best.cells.map(function (x) {
          return x.r;
        })
      );
      var cs = new Set(
        best.cells.map(function (x) {
          return x.c;
        })
      );
      if (rs.size > 1 && cs.size > 1) best.power = 'nova';
    }

    return best;
  }

  async function activatePower(pr, pc, swapDir) {
    var gs = PM.gs;
    var cell = gs.board[pr][pc];
    if (!cell || cell.type !== 'power') return new Set();

    var cleared = new Set();
    var rows = gs.board.length;
    var cols = gs.board[0].length;

    var el = PM.getCellEl(pr, pc);
    if (el) el.classList.add('power-activating');

    var r, c, dr, dc, nr, nc, targets, tc;
    if (cell.power === 'lance') {
      var sweepEl = el ? document.createElement('div') : null;
      if (sweepEl && swapDir) {
        sweepEl.className = swapDir === 'h' ? 'sweep-h' : 'sweep-v';
        sweepEl.style.background = 'radial-gradient(circle, white, ' + PM.GEM_COLORS_HEX[cell.color] + ')';
        el.appendChild(sweepEl);
      }
      if (!swapDir || swapDir === 'h') {
        for (c = 0; c < cols; c++) if (pr + ',' + c !== pr + ',' + pc) cleared.add(pr + ',' + c);
      } else {
        for (r = 0; r < rows; r++) if (r + ',' + pc !== pr + ',' + pc) cleared.add(r + ',' + pc);
      }
    } else if (cell.power === 'nova') {
      for (dr = -2; dr <= 2; dr++)
        for (dc = -2; dc <= 2; dc++) {
          nr = pr + dr;
          nc = pc + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !(dr === 0 && dc === 0)) cleared.add(nr + ',' + nc);
        }
    } else if (cell.power === 'prism') {
      for (r = 0; r < rows; r++)
        for (c = 0; c < cols; c++) {
          tc = gs.board[r][c];
          if (tc && (tc.type === 'gem' || tc.type === 'power') && tc.color === cell.color) cleared.add(r + ',' + c);
        }
    } else if (cell.power === 'drone') {
      targets = [];
      for (r = 0; r < rows; r++)
        for (c = 0; c < cols; c++) {
          tc = gs.board[r][c];
          if (tc && (tc.type === 'gem' || tc.type === 'crate')) targets.push(r + ',' + c);
        }
      targets.sort(function () {
        return Math.random() - 0.5;
      });
      targets.slice(0, 4).forEach(function (k) {
        cleared.add(k);
      });
    }

    cleared.add(pr + ',' + pc);
    return cleared;
  }

  function applyGravity() {
    var gs = PM.gs;
    var rows = gs.board.length;
    var cols = gs.board[0].length;
    var r, c, write, cell;
    for (c = 0; c < cols; c++) {
      write = rows - 1;
      for (r = rows - 1; r >= 0; r--) {
        if (gs.blocked.has(r + ',' + c)) {
          write = r - 1;
          continue;
        }
        cell = gs.board[r][c];
        if (cell && cell.type !== 'empty') {
          gs.board[write][c] = Object.assign({}, cell, { _fell: write !== r });
          if (write !== r) gs.board[r][c] = null;
          write--;
        }
      }
      if (!PM.rushActive) {
        for (r = write; r >= 0; r--) {
          if (gs.blocked.has(r + ',' + c)) continue;
          if (!gs.board[r][c]) {
            gs.board[r][c] = Object.assign(mkGem(rColor()), { _fell: true });
          }
        }
      }
    }
  }

  function updateObjective(type, count, color) {
    if (color === undefined) color = -1;
    PM.gs.objectives.forEach(function (obj) {
      if (obj.done) return;
      if (obj.type === 'gems' && type === 'gems' && (obj.color === -1 || obj.color === color)) {
        obj.current = Math.min(obj.target, obj.current + count);
        if (obj.current >= obj.target) obj.done = true;
      }
      if (obj.type === 'crates' && type === 'crates') {
        obj.current = Math.min(obj.target, obj.current + count);
        if (obj.current >= obj.target) obj.done = true;
      }
    });
  }

  function damageCrates(matchedKeys) {
    var gs = PM.gs;
    var rows = gs.board.length;
    var cols = gs.board[0].length;
    var hit = new Set();
    matchedKeys.forEach(function (key) {
      var p = key.split(',').map(Number);
      var r = p[0],
        c = p[1];
      [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ].forEach(function (coord) {
        var nr = coord[0],
          nc = coord[1];
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return;
        var tc = gs.board[nr][nc];
        if (tc && tc.type === 'crate') hit.add(nr + ',' + nc);
      });
    });
    hit.forEach(function (key) {
      var p = key.split(',').map(Number);
      var rr = p[0],
        cc = p[1];
      var tc = gs.board[rr][cc];
      tc.hp--;
      if (tc.hp <= 0) {
        updateObjective('crates', 1);
        gs.board[rr][cc] = null;
        PM.spawnParticlesAt(rr, cc, '#c8a060', 8);
      }
    });
  }

  PM.allObjectivesDone = function () {
    if (PM.rushActive) return false;
    return PM.gs.objectives.every(function (o) {
      return o.done;
    });
  };

  var GAME_TIMING = PM.GAME_TIMING;

  async function processAfterSwap(r1, c1, r2, c2, dir) {
    var gs = PM.gs;
    gs.combo = 0;
    var swapPos1 = { r: r1, c: c1 };
    var swapPos2 = { r: r2, c: c2 };
    var firstIter = true;

    while (true) {
      var c1cell = gs.board[r1][c1];
      var c2cell = gs.board[r2][c2];
      var powerCleared = new Set();

      if (firstIter) {
        if (c1cell && c1cell.type === 'power') {
          (await activatePower(r1, c1, dir)).forEach(function (k) {
            powerCleared.add(k);
          });
        }
        if (c2cell && c2cell.type === 'power') {
          var pd = dir === 'h' ? 'v' : 'h';
          (await activatePower(r2, c2, pd)).forEach(function (k) {
            powerCleared.add(k);
          });
        }
      }

      var matches = findMatches();
      var allCleared = new Set([].concat(Array.from(matches), Array.from(powerCleared)));

      if (allCleared.size === 0) break;

      gs.combo++;
      if (PM.playSfx) {
        if (firstIter && powerCleared.size > 0) PM.playSfx('power');
        else if (gs.combo >= 2) PM.playSfx('combo');
        else PM.playSfx('match');
      }
      var comboMult = Math.min(gs.combo, 5);
      var feverMult = (PM.rushActive && PM.getRushScoreMultiplier) ? PM.getRushScoreMultiplier() : 1;
      var points = allCleared.size * 10 * comboMult * feverMult;
      gs.score += points;

      if (PM.showComboToast) PM.showComboToast(gs.combo, points, feverMult > 1 ? 'FEVER' : null);

      var newPower = null;
      if (matches.size > 0 && firstIter) {
        newPower = detectPowerUp(matches, swapPos1.r === r1 && swapPos1.c === c1 ? swapPos2 : swapPos1);
      }

      /* Gem objectives: count every gem cell removed this step (matches ∪ powers). Counting only
       * `matches` misses gems cleared solely by line / nova / prism — HUD lagged behind real progress. */
      damageCrates(matches);

      var sparedK = newPower ? newPower.r + ',' + newPower.c : null;
      renderApi.renderExploding(allCleared, sparedK);
      PM.runClearShake(gs.combo);
      PM.flashBoardPrismForCombo(gs.combo);
      PM.showMatchBeam(matches);
      PM.spawnMatchParticles(matches, { keySet: allCleared, sparedKey: sparedK });
      await PM.delay(GAME_TIMING.explodeMs);

      allCleared.forEach(function (key) {
        var p = key.split(',').map(Number);
        var cell = gs.board[p[0]][p[1]];
        if (cell && cell.type === 'gem') updateObjective('gems', 1, cell.color);
        /* Powers (line / nova) can wipe crates in one frame — they never go through damageCrates(matches). */
        if (cell && cell.type === 'crate') updateObjective('crates', 1);
        gs.board[p[0]][p[1]] = null;
      });

      if (newPower) {
        gs.board[newPower.r][newPower.c] = mkPow(newPower.color, newPower.power);
        gs.board[newPower.r][newPower.c]._powerBorn = true;
      }

      applyGravity();
      renderApi.renderBoard();
      if (newPower) {
        var pEl = PM.getCellEl(newPower.r, newPower.c);
        if (pEl) pEl.classList.add('power-born');
      }
      await PM.delay(GAME_TIMING.gravityFallMs);

      for (var ri = 0; ri < gs.board.length; ri++)
        for (var ci = 0; ci < gs.board[0].length; ci++) if (gs.board[ri][ci]) delete gs.board[ri][ci]._fell;

      renderApi.renderHUD();
      renderApi.renderObjectives();
      firstIter = false;

      if (PM.allObjectivesDone()) {
        renderApi.renderBoard();
        await PM.delay(GAME_TIMING.winPauseMs);
        uiApi.showWin();
        return;
      }
    }

    renderApi.renderBoard();
    renderApi.renderHUD();
    renderApi.renderObjectives();

    if (gs.moves <= 0) {
      await PM.delay(GAME_TIMING.endGamePauseMs);
      uiApi.showLose();
      return;
    }
    if (PM.allObjectivesDone()) {
      await PM.delay(GAME_TIMING.endGamePauseMs);
      uiApi.showWin();
      return;
    }

    if (!PM.rushActive && gs.moves > 0 && !PM.allObjectivesDone() && !PM.findHintMove()) {
      PM.ensurePlayableBoard();
      renderApi.renderBoard();
      renderApi.renderHUD();
      renderApi.renderObjectives();
      if (PM.showHintToast) PM.showHintToast('No moves — reshuffled');
      await PM.delay(260);
    }

    gs.busy = false;
  }

  /** Same validity check as the start of attemptSwap (simulated swap + undo). */
  function swapWouldBeValid(r1, c1, r2, c2) {
    var gs = PM.gs;
    var tmp = gs.board[r1][c1];
    gs.board[r1][c1] = gs.board[r2][c2];
    gs.board[r2][c2] = tmp;

    var c1h = gs.board[r1][c1];
    var c2h = gs.board[r2][c2];
    var hasPower = (c1h && c1h.type === 'power') || (c2h && c2h.type === 'power');
    var matches = findMatches();

    gs.board[r2][c2] = gs.board[r1][c1];
    gs.board[r1][c1] = tmp;

    return matches.size > 0 || hasPower;
  }

  /**
   * Reassign random colors to plain gems until a valid swap exists (crates / powers unchanged).
   * Used after cascades and on level load to avoid dead boards.
   */
  PM.ensurePlayableBoard = function () {
    var gs = PM.gs;
    var rows = gs.board.length;
    var cols = gs.board[0].length;
    var tries = 0;
    while (tries++ < 320) {
      if (PM.findHintMove()) return true;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var cell = gs.board[r][c];
          if (cell && cell.type === 'gem') cell.color = rColor();
        }
      }
      resolveInitMatches();
    }
    return !!PM.findHintMove();
  };

  /** First adjacent pair that would create a match or activate a power; null if none (dead board). */
  PM.findHintMove = function () {
    var gs = PM.gs;
    var rows = gs.board.length;
    var cols = gs.board[0].length;
    var r, c, r2, c2;
    for (r = 0; r < rows; r++) {
      for (c = 0; c < cols; c++) {
        if (c + 1 < cols) {
          r2 = r;
          c2 = c + 1;
          if (
            !gs.blocked.has(r + ',' + c) &&
            !gs.blocked.has(r2 + ',' + c2) &&
            gs.board[r][c] &&
            gs.board[r2][c2] &&
            swapWouldBeValid(r, c, r2, c2)
          ) {
            return { r1: r, c1: c, r2: r2, c2: c2 };
          }
        }
        if (r + 1 < rows) {
          r2 = r + 1;
          c2 = c;
          if (
            !gs.blocked.has(r + ',' + c) &&
            !gs.blocked.has(r2 + ',' + c2) &&
            gs.board[r][c] &&
            gs.board[r2][c2] &&
            swapWouldBeValid(r, c, r2, c2)
          ) {
            return { r1: r, c1: c, r2: r2, c2: c2 };
          }
        }
      }
    }
    return null;
  };

  PM.attemptSwap = async function (r1, c1, r2, c2) {
    var gs = PM.gs;
    var dir = r1 === r2 ? 'h' : 'v';
    var tmp = gs.board[r1][c1];
    gs.board[r1][c1] = gs.board[r2][c2];
    gs.board[r2][c2] = tmp;

    var c1h = gs.board[r1][c1];
    var c2h = gs.board[r2][c2];
    var hasPower = (c1h && c1h.type === 'power') || (c2h && c2h.type === 'power');
    var matches = findMatches();

    if (matches.size === 0 && !hasPower) {
      gs.board[r2][c2] = gs.board[r1][c1];
      gs.board[r1][c1] = tmp;
      renderApi.renderBoard();
      if (PM.playSfx) PM.playSfx('invalid');
      var e1 = PM.getCellEl(r1, c1);
      var e2 = PM.getCellEl(r2, c2);
      if (e1) e1.classList.add('invalid');
      if (e2) e2.classList.add('invalid');
      await PM.delay(GAME_TIMING.invalidSwapMs);
      gs.busy = false;
      gs.selected = null;
      renderApi.renderBoard();
      return;
    }

    if (!PM.rushActive) gs.moves--;
    if (PM.playSfx) PM.playSfx('swap');
    renderApi.renderBoard();
    var e1b = PM.getCellEl(r1, c1);
    var e2b = PM.getCellEl(r2, c2);
    if (e1b) e1b.classList.add('swapping');
    if (e2b) e2b.classList.add('swapping');
    await PM.delay(GAME_TIMING.swapFlashMs);

    await processAfterSwap(r1, c1, r2, c2, dir);
  };
})();
