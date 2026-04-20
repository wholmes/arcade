var PM = window.PM || (window.PM = {});
PM.getCellEl = function (r, c) {
  return document.querySelector('#board .cell[data-r="' + r + '"][data-c="' + c + '"]');
};

/** Optional URL: ?matchshake=1 — subtle nudge when combo is low (skipped when perf-light). */
PM.runMatchBoardShake = function () {
  if (!PM.matchShake || PM.perfLight) return;
  var wrap = document.getElementById('board-wrap');
  if (!wrap) return;
  wrap.classList.remove('match-shake');
  void wrap.offsetWidth;
  wrap.classList.add('match-shake');
  clearTimeout(PM._matchShakeTimer);
  PM._matchShakeTimer = setTimeout(function () {
    wrap.classList.remove('match-shake');
  }, 520);
};

/**
 * Board shake scales with combo tier; beats optional ?matchshake=1 when combo ≥ 3.
 */
PM.runClearShake = function (combo) {
  if (PM.perfLight) return;
  var wrap = document.getElementById('board-wrap');
  if (!wrap) return;
  wrap.classList.remove('match-shake', 'combo-shake-sm', 'combo-shake-md', 'combo-shake-lg');
  void wrap.offsetWidth;
  if (combo >= 5) wrap.classList.add('combo-shake-lg');
  else if (combo >= 4) wrap.classList.add('combo-shake-md');
  else if (combo >= 3) wrap.classList.add('combo-shake-sm');
  else if (PM.matchShake) wrap.classList.add('match-shake');
  clearTimeout(PM._clearShakeTimer);
  var ms = combo >= 5 ? 520 : combo >= 3 ? 440 : PM.matchShake ? 520 : 0;
  if (ms <= 0) return;
  PM._clearShakeTimer = setTimeout(function () {
    wrap.classList.remove('match-shake', 'combo-shake-sm', 'combo-shake-md', 'combo-shake-lg');
  }, ms);
};

/** Brief prism rim flash on very long chains (perf-light skips). */
PM.flashBoardPrismForCombo = function (combo) {
  if (PM.perfLight || combo < 5) return;
  var el = document.getElementById('board-prism');
  if (!el) return;
  el.classList.remove('combo-prism-flash');
  void el.offsetWidth;
  el.classList.add('combo-prism-flash');
  clearTimeout(PM._prismFlashTimer);
  PM._prismFlashTimer = setTimeout(function () {
    el.classList.remove('combo-prism-flash');
  }, 480);
};

/**
 * Optional URL: ?matchbeam=1 — flash along a full row or column when the match is collinear (3+).
 * Skipped for L / T clusters and when perf-light.
 */
PM.showMatchBeam = function (matchedKeys) {
  if (!PM.matchBeam || PM.perfLight) return;
  if (!matchedKeys || matchedKeys.size < 3) return;
  var list = [];
  matchedKeys.forEach(function (key) {
    list.push(key.split(',').map(Number));
  });
  var r0 = list[0][0];
  var c0 = list[0][1];
  var sameRow = list.every(function (p) {
    return p[0] === r0;
  });
  var sameCol = list.every(function (p) {
    return p[1] === c0;
  });
  if (!sameRow && !sameCol) return;
  var tilt = document.getElementById('board-tilt');
  var el = document.getElementById('match-beam');
  if (!tilt || !el) return;
  var tr = tilt.getBoundingClientRect();
  el.className = 'match-beam';
  el.removeAttribute('style');
  var elA;
  var elB;
  var a;
  var b;
  if (sameRow) {
    var cols = list
      .map(function (p) {
        return p[1];
      })
      .sort(function (x, y) {
        return x - y;
      });
    elA = PM.getCellEl(r0, cols[0]);
    elB = PM.getCellEl(r0, cols[cols.length - 1]);
    if (!elA || !elB) return;
    a = elA.getBoundingClientRect();
    b = elB.getBoundingClientRect();
    el.style.left = Math.round(a.left - tr.left) + 'px';
    el.style.top = Math.round(a.top - tr.top) + 'px';
    el.style.width = Math.round(b.right - a.left) + 'px';
    el.style.height = Math.round(a.height) + 'px';
  } else {
    var rows = list
      .map(function (p) {
        return p[0];
      })
      .sort(function (x, y) {
        return x - y;
      });
    elA = PM.getCellEl(rows[0], c0);
    elB = PM.getCellEl(rows[rows.length - 1], c0);
    if (!elA || !elB) return;
    a = elA.getBoundingClientRect();
    b = elB.getBoundingClientRect();
    el.style.left = Math.round(a.left - tr.left) + 'px';
    el.style.top = Math.round(a.top - tr.top) + 'px';
    el.style.width = Math.round(a.width) + 'px';
    el.style.height = Math.round(b.bottom - a.top) + 'px';
  }
  void el.offsetWidth;
  el.classList.add('match-beam-active');
  clearTimeout(PM._matchBeamTimer);
  PM._matchBeamTimer = setTimeout(function () {
    el.classList.remove('match-beam-active');
    el.removeAttribute('style');
  }, 480);
};

PM.clearHintHighlights = function () {
  document.querySelectorAll('#board .cell.hint').forEach(function (el) {
    el.classList.remove('hint');
  });
};

/** Wobble two cells that form a valid swap (clears after a few seconds). */
PM.showHintHighlight = function (r1, c1, r2, c2) {
  PM.clearHintHighlights();
  var e1 = PM.getCellEl(r1, c1);
  var e2 = PM.getCellEl(r2, c2);
  if (e1) e1.classList.add('hint');
  if (e2) e2.classList.add('hint');
  clearTimeout(PM._hintClearTimer);
  PM._hintClearTimer = setTimeout(function () {
    PM.clearHintHighlights();
  }, 4500);
};
