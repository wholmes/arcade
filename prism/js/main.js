/**
 * Entry: wires PM.configureGame, exposes globals for inline HTML handlers.
 * Scripts load in order (classic, non-module) so file:// works without a server.
 */
var PM = window.PM || (window.PM = {});

PM.configureGame({
  render: {
    renderBoard: PM.renderBoard,
    renderHUD: PM.renderHUD,
    renderObjectives: PM.renderObjectives,
    renderExploding: PM.renderExploding,
  },
  ui: {
    showWin: PM.showWin,
    showLose: PM.showLose,
  },
});

PM.gs.levelIdx = PM.loadUnlockedLevelIndex();

function beginNewCampaign() {
  if (!confirm('Start over from level 1? Your saved level progress will be reset.')) return;
  PM.resetProgressToStart();
  PM.showLevelIntro();
}

function requestHint() {
  var gs = PM.gs;
  if (gs.busy) return;
  var gameScreen = document.getElementById('game-screen');
  if (!gameScreen || gameScreen.classList.contains('hidden')) return;
  PM.clearHintHighlights();
  var move = PM.findHintMove();
  if (!move) {
    PM.showHintToast('No valid swaps');
    return;
  }
  PM.showHintHighlight(move.r1, move.c1, move.r2, move.c2);
}

Object.assign(window, {
  showLevelIntro: PM.showLevelIntro,
  showRules: PM.showRules,
  startLevel: PM.startLevel,
  hideRules: PM.hideRules,
  nextLevel: PM.nextLevel,
  retryLevel: PM.retryLevel,
  showScreen: PM.showScreen,
  requestHint: requestHint,
  beginNewCampaign: beginNewCampaign,
});

PM.buildTitleGems();
PM.initTitleAnim();
initGfxToggle();

function initGfxToggle() {
  var row = document.getElementById('gfx-toggle-row');
  if (!row) return;
  var mode = PM.gfxMode || 'auto';
  row.querySelectorAll('.gfx-seg-btn').forEach(function (btn) {
    var m = btn.getAttribute('data-gfx');
    var on = m === mode;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.addEventListener('click', function () {
      if (m === PM.gfxMode) return;
      PM.setGfxMode(m);
    });
  });
  var hint = document.getElementById('gfx-toggle-hint');
  if (
    hint &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    hint.classList.remove('hidden');
    hint.textContent =
      'Reduced motion is on — visuals stay lighter for accessibility. Your choice is still saved.';
  }
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    var panel = document.getElementById('rules-panel');
    if (panel && !panel.classList.contains('hidden')) PM.hideRules();
    return;
  }
  if (e.key === 'h' || e.key === 'H') {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    e.preventDefault();
    requestHint();
  }
});
