var PM = window.PM || (window.PM = {});

(function () {
  var boardTiltParallaxCleanup = null;

  PM.stopBoardTiltParallax = function () {
    if (boardTiltParallaxCleanup) {
      boardTiltParallaxCleanup();
      boardTiltParallaxCleanup = null;
    }
    if (typeof gsap !== 'undefined') {
      var tilt = document.getElementById('board-tilt');
      if (tilt) gsap.set(tilt, { clearProps: 'transform,transformPerspective' });
    }
  };

  PM.initBoardTiltParallax = function () {};

  PM.showScreen = function (id) {
    PM.hideRules();
    if (id !== 'game-screen') {
      PM.stopBoardTiltParallax();
      if (PM.stopRush) PM.stopRush();
    }

    var incoming = document.getElementById(id);
    var screens = document.querySelectorAll('.screen');
    var outgoing = Array.from(screens).find(function (s) {
      return !s.classList.contains('hidden');
    });

    if (outgoing && outgoing.id === id) return;

    if (typeof gsap !== 'undefined') {
      var finishOut = function () {
        if (outgoing) {
          outgoing.classList.add('hidden');
          gsap.set(outgoing, { clearProps: 'opacity,scale,y' });
        }
      };

      if (outgoing && outgoing !== incoming) {
        gsap.to(outgoing, {
          opacity: 0,
          y: -10,
          scale: 0.985,
          duration: 0.3,
          ease: 'power3.in',
          onComplete: finishOut,
        });
      } else if (!outgoing) {
        finishOut();
      }

      incoming.classList.remove('hidden');
      gsap.fromTo(
        incoming,
        { opacity: 0, y: 22, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.52,
          ease: 'power4.out',
          delay: outgoing && outgoing !== incoming ? 0.06 : 0,
        }
      );
    } else {
      document.querySelectorAll('.screen').forEach(function (s) {
        s.classList.toggle('hidden', s.id !== id);
      });
    }
  };

  PM.showRules = function () {
    var el = document.getElementById('rules-panel');
    if (el) el.classList.remove('hidden');
  };

  PM.hideRules = function () {
    var el = document.getElementById('rules-panel');
    if (el) el.classList.add('hidden');
  };

  PM.persistUnlockedAfterWin = function () {
    try {
      var beaten = PM.gs.levelIdx;
      var next = Math.min(beaten + 1, PM.LEVELS.length - 1);
      var cur = parseInt(localStorage.getItem('prism-unlocked'), 10);
      var n = isNaN(cur) ? next : Math.max(cur, next);
      localStorage.setItem('prism-unlocked', String(n));
    } catch (e) {}
  };

  PM.loadUnlockedLevelIndex = function () {
    try {
      var v = parseInt(localStorage.getItem('prism-unlocked'), 10);
      if (isNaN(v) || v < 0) return 0;
      return Math.min(v, PM.LEVELS.length - 1);
    } catch (e) {
      return 0;
    }
  };

  /** Clears saved unlock so the campaign starts from level 1 (used by New game). */
  PM.resetProgressToStart = function () {
    try {
      localStorage.removeItem('prism-unlocked');
    } catch (e) {}
    PM.gs.levelIdx = 0;
  };

  PM.showWin = function () {
    var gs = PM.gs;
    PM.persistUnlockedAfterWin();
    var pct = gs.maxMoves > 0 ? gs.moves / gs.maxMoves : 0;
    var stars = pct > 0.5 ? 3 : pct > 0.2 ? 2 : 1;
    document.getElementById('win-score').textContent = gs.score.toLocaleString();
    var starRow = document.getElementById('stars-row');
    starRow.innerHTML = '';
    for (var i = 0; i < 3; i++) {
      var s = document.createElement('span');
      s.className = 'star';
      s.textContent = i < stars ? '⭐' : '☆';
      s.style.opacity = '0';
      s.style.display = 'inline-block';
      starRow.appendChild(s);
    }
    var nextBtn = document.getElementById('next-btn');
    var menuBtn = document.getElementById('complete-menu-btn');
    var isLast = gs.levelIdx >= PM.LEVELS.length - 1;
    if (nextBtn) nextBtn.style.display = isLast ? 'none' : '';
    if (menuBtn) {
      menuBtn.style.display = '';
      if (isLast) {
        menuBtn.textContent = 'BACK TO MENU';
        menuBtn.className = 'btn btn-primary';
      } else {
        menuBtn.textContent = 'MENU';
        menuBtn.className = 'btn btn-secondary';
      }
    }
    PM.showScreen('complete-screen');
    if (PM.playSfx) PM.playSfx('win');
    if (typeof gsap !== 'undefined') {
      gsap.from('#complete-screen .result-title', { y: 28, opacity: 0, duration: 0.58, ease: 'power4.out' });
      gsap.from('#complete-screen .result-score-val', { scale: 0.55, opacity: 0, duration: 0.5, delay: 0.1, ease: 'back.out(1.45)' });
      gsap.from('#stars-row .star', {
        opacity: 0,
        y: 20,
        scale: 0,
        duration: 0.52,
        stagger: 0.11,
        ease: 'back.out(1.65)',
        delay: 0.18,
      });
    }
  };

  PM.showRushOver = function (score, hs, timeSecs, bestTime) {
    var el = document.getElementById('rush-over-score');
    var hsEl = document.getElementById('rush-over-hs');
    var timeEl = document.getElementById('rush-over-time');
    var bestTimeEl = document.getElementById('rush-over-best-time');
    if (el)   el.textContent  = score.toLocaleString();
    if (hsEl) hsEl.textContent = hs.toLocaleString();
    function fmt(s) { var m=Math.floor(s/60),sec=s%60; return m+':'+(sec<10?'0':'')+sec; }
    if (timeEl) timeEl.textContent = fmt(timeSecs || 0);
    if (bestTimeEl) bestTimeEl.textContent = fmt(bestTime || 0);
    var newHs = document.getElementById('rush-new-hs');
    if (newHs) newHs.style.display = (score > 0 && score >= hs) ? '' : 'none';
    PM.showScreen('rush-over-screen');
    if (PM.playSfx) PM.playSfx('lose');
    if (typeof gsap !== 'undefined') {
      gsap.from('#rush-over-screen .result-title', { y: 24, opacity: 0, duration: 0.52, ease: 'power4.out' });
      gsap.from('#rush-over-screen .result-score-val', { scale: 0.58, opacity: 0, duration: 0.46, delay: 0.08, ease: 'power3.out' });
    }
  };

  PM.showLose = function () {
    document.getElementById('over-score').textContent = PM.gs.score.toLocaleString();
    PM.showScreen('gameover-screen');
    if (PM.playSfx) PM.playSfx('lose');
    if (typeof gsap !== 'undefined') {
      gsap.from('#gameover-screen .result-title', { y: 24, opacity: 0, duration: 0.52, ease: 'power4.out' });
      gsap.from('#gameover-screen .result-score-val', { scale: 0.58, opacity: 0, duration: 0.46, delay: 0.08, ease: 'power3.out' });
    }
  };

  PM.nextLevel = function () {
    PM.gs.levelIdx = Math.min(PM.gs.levelIdx + 1, PM.LEVELS.length - 1);
    PM.showLevelIntro();
  };

  PM.retryLevel = function () {
    PM.showLevelIntro();
  };

  PM.showLevelIntro = function () {
    var lv = PM.LEVELS[PM.gs.levelIdx];
    document.getElementById('intro-num').textContent = lv.id;
    document.getElementById('intro-name').textContent = lv.name;
    var subEl = document.getElementById('intro-sub');
    if (subEl) {
      subEl.textContent = lv.subtitle || '';
      subEl.style.display = lv.subtitle ? 'block' : 'none';
    }
    document.getElementById('intro-moves-note').textContent = lv.moves + ' MOVES';
    var list = document.getElementById('intro-obj-list');
    list.innerHTML = '';
    lv.objectives.forEach(function (obj) {
      var row = document.createElement('div');
      row.className = 'intro-obj-row';
      var lbl = document.createElement('span');
      lbl.textContent = obj.label;
      var val = document.createElement('span');
      val.style.color = obj.color >= 0 ? PM.GEM_COLORS_HEX[obj.color] : '#ffd060';
      val.textContent = '× ' + obj.target;
      var icon = document.createElement('div');
      icon.className = 'intro-obj-icon';
      icon.style.background = obj.color >= 0 ? PM.GEM_COLORS_HEX[obj.color] + '33' : 'rgba(200,160,80,0.2)';
      icon.innerHTML =
        obj.color >= 0
          ? '<svg width="16" height="16" viewBox="0 0 32 32">' +
            PM.GEM_SVG[obj.color].replace(/<svg[^>]*>/, '').replace('</svg>', '') +
            '</svg>'
          : '📦';
      row.appendChild(icon);
      row.appendChild(lbl);
      row.appendChild(val);
      list.appendChild(row);
    });
    PM.showScreen('intro-screen');
  };

  PM.startLevel = function () {
    var lv = PM.LEVELS[PM.gs.levelIdx];
    var gs = PM.gs;
    gs.moves = lv.moves;
    gs.maxMoves = lv.moves;
    gs.score = 0;
    gs.selected = null;
    gs.busy = false;
    gs.combo = 0;
    gs.objectives = lv.objectives.map(function (o) {
      return Object.assign({}, o, { current: 0, done: false });
    });
    PM.resetHudForLevel();
    document.getElementById('hud-mv').removeAttribute('data-prev');

    PM.initBoard(lv);
    PM.ensurePlayableBoard();
    PM.renderBoard();
    PM.renderHUD();
    PM.renderObjectives();
    PM.showScreen('game-screen');
    if (PM.playSfx) PM.playSfx('ui');

    /* Pause-bg-eval must run after paint so #bg / orbs / #board-prism animations are present to pause */
    requestAnimationFrame(function () {
      if (PM.resizeParticleCanvas) PM.resizeParticleCanvas();
      requestAnimationFrame(function () {
        PM.runPauseBgEval(PM.pauseBgEvalDurationMs());
      });
    });

    var rows = gs.board.length;
    var cols = gs.board[0].length;
    if (typeof gsap !== 'undefined') {
      gsap.from('#board .cell:not(.blocked)', {
        scale: 0.12,
        opacity: 0,
        duration: 0.5,
        stagger: { amount: 0.62, grid: [cols, rows], from: 'center' },
        ease: 'back.out(1.28)',
      });
      PM.initBoardTiltParallax();
    }
  };

  PM.buildTitleGems = function () {
    var row = document.getElementById('gem-preview-row');
    PM.GEM_SVG.forEach(function (svg, i) {
      var div = document.createElement('div');
      div.className = 'gem-preview-cell';
      div.style.boxShadow = '0 4px 18px rgba(0,0,0,0.4), 0 0 14px ' + PM.GEM_COLORS_HEX[i] + '44';
      var inner = document.createElement('div');
      inner.className = 'gem gem-preview-gem';
      inner.style.filter = 'drop-shadow(0 0 6px ' + PM.GEM_COLORS_HEX[i] + ')';
      inner.innerHTML = svg;
      var glint = document.createElement('div');
      glint.className = 'gem-glint';
      inner.appendChild(glint);
      PM.appendGemSparkles(inner, 4);
      div.appendChild(inner);
      row.appendChild(div);
    });
  };

  PM.initTitleAnim = function () {
    if (typeof gsap === 'undefined') return;
    var intro = { duration: 1.02, ease: 'power4.out', immediateRender: false };
    gsap.from('.logo', Object.assign({ y: -52, opacity: 0 }, intro));
    gsap.from('.logo-sub', { opacity: 0, y: 24, duration: 0.58, delay: 0.26, ease: 'power3.out', immediateRender: false });
    gsap.from('.gem-preview-cell', {
      scale: 0,
      rotation: -14,
      opacity: 0,
      duration: 0.58,
      stagger: 0.085,
      delay: 0.4,
      ease: 'back.out(1.5)',
      immediateRender: false,
    });
    gsap.fromTo(
      '.title-btn-row .btn',
      { y: 26, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.48,
        stagger: 0.1,
        delay: 0.72,
        ease: 'power3.out',
        immediateRender: false,
      }
    );
  };
})();
