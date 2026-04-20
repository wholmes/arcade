var PM = window.PM || (window.PM = {});

(function () {
  var lastHudScore = -1;

  PM.resetHudForLevel = function () {
    lastHudScore = -1;
  };

  /** Tiny highlight points on jewels; prism power gets extra sparkles. */
  PM.appendGemSparkles = function (gem, count) {
    count = count === undefined ? 4 : count;
    var wrap = document.createElement('div');
    wrap.className = 'gem-sparkles';
    wrap.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < count; i++) {
      var sp = document.createElement('span');
      sp.className = 'gem-spark';
      wrap.appendChild(sp);
    }
    gem.appendChild(wrap);
  };

  PM.renderBoard = function () {
    var gs = PM.gs;
    var board = document.getElementById('board');
    board.innerHTML = '';
    var rows = gs.board.length;
    var cols = gs.board[0].length;
    board.style.gridTemplateColumns = 'repeat(' + cols + ', var(--cs))';
    board.style.gridTemplateRows = 'repeat(' + rows + ', var(--cs))';

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cell = gs.board[r][c];
        var div = document.createElement('div');
        div.className = 'cell';
        div.dataset.r = r;
        div.dataset.c = c;

        if (gs.blocked.has(r + ',' + c)) {
          div.classList.add('blocked');
          board.appendChild(div);
          continue;
        }

        if (!cell) {
          div.classList.add('empty-slot');
          div.addEventListener('click', handleCellClick.bind(null, r, c));
          div.addEventListener(
            'touchend',
            function (e) {
              if (PM.suppressNextInput) {
                e.preventDefault();
                return;
              }
              e.preventDefault();
              handleCellClick(r, c);
            },
            { passive: false }
          );
          board.appendChild(div);
          continue;
        }

        if (cell._fell) div.classList.add('falling');

        var face;
        if (cell.type === 'crate') {
          div.classList.add('crate');
          if (gs.selected && gs.selected.r === r && gs.selected.c === c) div.classList.add('selected');
          face = document.createElement('div');
          face.className = 'cell-face';
          var icon = document.createElement('div');
          icon.className = 'crate-icon';
          icon.textContent = '📦';
          var hp = document.createElement('div');
          hp.className = 'crate-hp';
          hp.textContent = '×' + cell.hp;
          face.appendChild(icon);
          face.appendChild(hp);
          div.appendChild(face);
        } else {
          div.dataset.color = cell.color;
          if (cell.type === 'power') {
            div.classList.add('power');
            div.dataset.power = cell.power;
          }
          if (gs.selected && gs.selected.r === r && gs.selected.c === c) div.classList.add('selected');
          face = document.createElement('div');
          face.className = 'cell-face';
          var gem = document.createElement('div');
          gem.className = 'gem';
          gem.innerHTML = cell.type === 'power' ? PM.POWER_SVG[cell.power] : PM.GEM_SVG[cell.color];
          var glint = document.createElement('div');
          glint.className = 'gem-glint';
          gem.appendChild(glint);
          if (cell.type === 'power' && cell.power === 'prism') {
            PM.appendGemSparkles(gem, 6);
          }
          face.appendChild(gem);
          div.appendChild(face);
        }

        bindCellInput(div, r, c);
        board.appendChild(div);
      }
    }
  };

  /** Center-out stagger for match clears (cheap: O(n) per cell). sparedKey = cell that stays (e.g. new power). */
  PM.getExplodeStaggerDelayMs = function (keySet, r, c, sparedKey) {
    if (PM.perfLight || PM.noMatchStagger) return 0;
    var list = [];
    keySet.forEach(function (key) {
      if (key === sparedKey) return;
      var p = key.split(',').map(Number);
      list.push(p);
    });
    if (list.length <= 1) return 0;
    var sr = 0;
    var sc = 0;
    list.forEach(function (p) {
      sr += p[0];
      sc += p[1];
    });
    sr /= list.length;
    sc /= list.length;
    var maxD = 0;
    list.forEach(function (p) {
      var dr = p[0] - sr;
      var dc = p[1] - sc;
      var d = Math.sqrt(dr * dr + dc * dc);
      if (d > maxD) maxD = d;
    });
    if (maxD < 0.001) return 0;
    var dr = r - sr;
    var dc = c - sc;
    var dist = Math.sqrt(dr * dr + dc * dc);
    return Math.round((dist / maxD) * PM.EXPLODE_STAGGER_MAX_MS);
  };

  PM.renderExploding = function (keySet, sparedKey) {
    keySet.forEach(function (key) {
      if (key === sparedKey) return;
      var p = key.split(',').map(Number);
      var el = PM.getCellEl(p[0], p[1]);
      if (!el) return;
      el.classList.add('exploding');
      var delayMs = PM.getExplodeStaggerDelayMs(keySet, p[0], p[1], sparedKey);
      el.style.setProperty('--explode-delay', delayMs / 1000 + 's');
    });
  };

  PM.renderHUD = function () {
    var gs = PM.gs;
    document.getElementById('hud-lv').textContent = PM.rushActive ? 'RUSH' : gs.levelIdx + 1;

    var scEl = document.getElementById('hud-sc');
    if (lastHudScore !== gs.score) {
      var scoreUp = gs.score > lastHudScore && lastHudScore >= 0;
      if (typeof gsap !== 'undefined' && lastHudScore >= 0) {
        var o = { v: lastHudScore };
        gsap.to(o, {
          v: gs.score,
          duration: 0.42,
          ease: 'power3.out',
          onUpdate: function () {
            scEl.textContent = Math.round(o.v).toLocaleString();
          },
        });
      } else {
        scEl.textContent = gs.score.toLocaleString();
      }
      if (scoreUp) {
        scEl.classList.remove('hud-score-pop');
        void scEl.offsetWidth;
        scEl.classList.add('hud-score-pop');
        clearTimeout(PM._hudScorePopTimer);
        PM._hudScorePopTimer = setTimeout(function () {
          scEl.classList.remove('hud-score-pop');
        }, 620);
      }
      lastHudScore = gs.score;
    }

    var mvEl = document.getElementById('hud-mv');
    if (mvEl && !PM.rushActive) {
      var prevRaw = mvEl.dataset.prev;
      mvEl.textContent = gs.moves;
      mvEl.dataset.prev = String(gs.moves);
      mvEl.className = 'hud-val mv' + (gs.moves <= 5 ? ' warning' : '');
      if (typeof gsap !== 'undefined' && prevRaw !== undefined && Number(prevRaw) > gs.moves) {
        gsap.fromTo(mvEl, { scale: 1.28 }, { scale: 1, duration: 0.42, ease: 'back.out(1.6)' });
      }
    }
  };

  PM.renderObjectives = function () {
    var gs = PM.gs;
    var strip = document.getElementById('obj-strip');
    strip.innerHTML = '';
    gs.objectives.forEach(function (obj) {
      var chip = document.createElement('div');
      chip.className = 'obj-chip' + (obj.done ? ' done' : '');
      var icon = document.createElement('div');
      icon.className = 'chip-gem';
      if (obj.color >= 0) icon.style.background = PM.GEM_COLORS_HEX[obj.color];
      else icon.textContent = obj.type === 'crates' ? '📦' : '✦';
      var txt = document.createElement('span');
      txt.textContent = obj.label + ': ' + obj.current + '/' + obj.target;
      chip.appendChild(icon);
      chip.appendChild(txt);
      strip.appendChild(chip);
    });
  };

  function handleCellClick(r, c) {
    var gs = PM.gs;
    if (PM.suppressNextInput) return;
    if (gs.busy) return;
    var cell = gs.board[r][c];
    if (gs.blocked.has(r + ',' + c)) return;
    if (!cell) {
      gs.selected = null;
      PM.renderBoard();
      return;
    }

    if (!gs.selected) {
      gs.selected = { r: r, c: c };
      PM.renderBoard();
      return;
    }

    var sr = gs.selected.r,
      sc = gs.selected.c;
    if (sr === r && sc === c) {
      gs.selected = null;
      PM.renderBoard();
      return;
    }

    var dr = Math.abs(r - sr);
    var dc = Math.abs(c - sc);
    if (dr + dc !== 1) {
      gs.selected = { r: r, c: c };
      PM.renderBoard();
      return;
    }

    gs.selected = null;
    gs.busy = true;
    PM.attemptSwap(sr, sc, r, c);
  }

  function tryDragSwap(sr, sc, nr, nc) {
    var gs = PM.gs;
    if (gs.busy) return;
    var rows = gs.board.length;
    var cols = gs.board[0].length;
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return;
    if (gs.blocked.has(sr + ',' + sc) || gs.blocked.has(nr + ',' + nc)) return;
    if (!gs.board[sr][sc]) return;
    gs.selected = null;
    gs.busy = true;
    PM.attemptSwap(sr, sc, nr, nc);
  }

  var dragGhostEl = null;
  var dragGhostW = 0;
  var dragGhostH = 0;
  var dragSourceDiv = null;

  function removeDragGhost() {
    if (dragSourceDiv) {
      dragSourceDiv.classList.remove('is-drag-source');
      dragSourceDiv = null;
    }
    if (dragGhostEl) {
      dragGhostEl.remove();
      dragGhostEl = null;
    }
    dragGhostW = 0;
    dragGhostH = 0;
  }

  function positionDragGhost(clientX, clientY) {
    if (!dragGhostEl) return;
    dragGhostEl.style.left = clientX - dragGhostW / 2 + 'px';
    dragGhostEl.style.top = clientY - dragGhostH / 2 + 'px';
  }

  function ensureDragGhost(div, clientX, clientY) {
    if (dragGhostEl) return;
    var face = div.querySelector('.cell-face');
    if (!face) return;
    var rect = div.getBoundingClientRect();
    dragGhostW = rect.width;
    dragGhostH = rect.height;
    dragSourceDiv = div;
    div.classList.add('is-drag-source');
    var wrap = document.createElement('div');
    wrap.className = 'piece-drag-ghost';
    if (div.dataset.color) wrap.setAttribute('data-color', div.dataset.color);
    if (div.classList.contains('crate')) wrap.classList.add('crate');
    if (div.classList.contains('power')) wrap.classList.add('power');
    wrap.style.width = rect.width + 'px';
    wrap.style.height = rect.height + 'px';
    wrap.appendChild(face.cloneNode(true));
    document.body.appendChild(wrap);
    dragGhostEl = wrap;
    positionDragGhost(clientX, clientY);
  }

  function attachDragPointer(div, r, c) {
    var onMove = function (e) {
      if (!div._drag || div._drag.pointerId !== e.pointerId) return;
      var d = Math.hypot(e.clientX - div._drag.x, e.clientY - div._drag.y);
      if (d > PM.DRAG.moveHintPx) {
        div._drag.moved = true;
        ensureDragGhost(div, e.clientX, e.clientY);
      }
      if (dragGhostEl) positionDragGhost(e.clientX, e.clientY);
    };

    var finish = function (e) {
      if (!div._drag || div._drag.pointerId !== e.pointerId) return;
      var st = div._drag;
      div._drag = null;
      removeDragGhost();
      try {
        div.releasePointerCapture(e.pointerId);
      } catch (_) {}
      div.removeEventListener('pointermove', onMove);
      div.removeEventListener('pointerup', finish);
      div.removeEventListener('pointercancel', finish);

      if (PM.gs.busy) return;

      var dx = e.clientX - st.x;
      var dy = e.clientY - st.y;
      var dist = Math.hypot(dx, dy);
      if (!st.moved || dist < PM.DRAG.commitMinPx) return;

      var dr = 0;
      var dc = 0;
      if (Math.abs(dx) >= Math.abs(dy)) dc = dx > 0 ? 1 : -1;
      else dr = dy > 0 ? 1 : -1;

      var nr = st.r + dr;
      var nc = st.c + dc;
      if (nr === st.r && nc === st.c) return;

      PM.setSuppressNextInput(true);
      setTimeout(function () {
        PM.setSuppressNextInput(false);
      }, 120);

      tryDragSwap(st.r, st.c, nr, nc);
    };

    div.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      if (PM.gs.busy) return;
      if (PM.gs.blocked.has(r + ',' + c)) return;
      if (!PM.gs.board[r][c]) return;

      div._drag = { r: r, c: c, x: e.clientX, y: e.clientY, pointerId: e.pointerId, moved: false };
      try {
        div.setPointerCapture(e.pointerId);
      } catch (_) {}
      div.addEventListener('pointermove', onMove);
      div.addEventListener('pointerup', finish);
      div.addEventListener('pointercancel', finish);
    });
  }

  function bindCellInput(div, r, c) {
    var onClick = function () {
      handleCellClick(r, c);
    };
    var onTouchEnd = function (e) {
      if (PM.suppressNextInput) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      handleCellClick(r, c);
    };
    div.addEventListener('click', onClick);
    div.addEventListener('touchend', onTouchEnd, { passive: false });
    attachDragPointer(div, r, c);
  }
})();
