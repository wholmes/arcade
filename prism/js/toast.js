var PM = window.PM || (window.PM = {});
var comboToastTimer = null;
var hintToastTimer = null;
PM.showHintToast = function (msg) {
  var el = document.getElementById('hint-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('visible');
  void el.offsetWidth;
  el.classList.add('visible');
  clearTimeout(hintToastTimer);
  hintToastTimer = setTimeout(function () {
    el.classList.remove('visible');
  }, 1600);
};

/**
 * Arcade-style floating feedback: big +points, combo label when chain ≥ 2.
 * @param {number} comboDepth — 1 = first clear in swap, 2+ = chain
 * @param {number} points — score earned this cascade step
 */
PM.showComboToast = function (comboDepth, points, badge) {
  var el = document.getElementById('combo-toast');
  if (!el) return;
  var tier = Math.min(comboDepth, 5);
  var mega = comboDepth >= 6;
  var lines = {
    2: 'CHAIN ×2',
    3: 'COMBO ×3',
    4: 'BIG ×4',
    5: 'MAX ×5',
  };
  var labelText =
    comboDepth >= 2
      ? mega
        ? 'MEGA ×' + comboDepth
        : lines[comboDepth] || 'COMBO ×' + comboDepth
      : '';

  var isFever = badge === 'FEVER';
  el.className =
    'combo-toast combo-tier-' + tier +
    (mega ? ' combo-chain-mega' : '') +
    (isFever ? ' fever-active' : '');

  el.innerHTML =
    '<div class="combo-toast-bundle">' +
    '<span class="combo-toast-score">+' +
    (points >= 0 ? points.toLocaleString() : '0') +
    '</span>' +
    (isFever
      ? '<span class="combo-toast-label combo-fever-label">⚡ FEVER ×3</span>'
      : labelText
        ? '<span class="combo-toast-label">' + labelText + '</span>'
        : '<span class="combo-toast-label combo-toast-clear">MATCH</span>') +
    '</div>';

  el.classList.remove('visible');
  void el.offsetWidth;
  el.classList.add('visible');
  clearTimeout(comboToastTimer);
  var ms = 820 + tier * 50 + (mega ? 140 : 0);
  comboToastTimer = setTimeout(function () {
    el.classList.remove('visible');
  }, ms);
};
