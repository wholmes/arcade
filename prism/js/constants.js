/** Board dimensions & palette — keep NUM_COLORS aligned with GEM_* arrays in assets.js */
var PM = window.PM || (window.PM = {});
PM.ROWS = 8;
PM.COLS = 8;
PM.NUM_COLORS = 5;
PM.GEM_NAMES = ['Ruby', 'Sapphire', 'Emerald', 'Amber', 'Amethyst'];
PM.GEM_COLORS_HEX = ['#ff3854', '#2080ff', '#00e676', '#ffa726', '#c070e8'];
/**
 * Max delay before a cell’s explode starts (center-out stagger). Must stay in sync with CSS
 * (.cell.exploding animation-duration + this ≤ explodeMs).
 */
PM.EXPLODE_STAGGER_MAX_MS = 100;
/**
 * Async waits while gs.busy — they must be ≥ the matching CSS animation length in prism-match.css.
 */
PM.GAME_TIMING = {
  swapFlashMs: 260,
  invalidSwapMs: 380,
  /** ≥ EXPLODE_STAGGER_MAX_MS + explode-anim duration (~280ms) */
  explodeMs: 420,
  gravityFallMs: 380,
  winPauseMs: 240,
  endGamePauseMs: 160,
};
/** Drag-to-swap: movement past moveHintPx sets “dragging”; commitMinPx required to trigger swap */
PM.DRAG = { moveHintPx: 10, commitMinPx: 18 };

/**
 * Graphics mode (see prism-match.css html.perf-light):
 *   PM.gfxMode — 'auto' | 'quality' | 'performance' (saved under PM.GFX_STORAGE_KEY in localStorage).
 *   auto — performance-style visuals on touch / coarse pointer; full effects on typical desktop.
 *   quality — full effects everywhere (battery-heavy on phones).
 *   performance — lighter visuals everywhere.
 *   ?gfx=auto|quality|performance — set mode and save to localStorage for next visits.
 *   ?fullfx=1 — this session only: same as quality (does not change saved mode).
 *   ?perf=1 or ?lightbg=1 — this session only: same as performance (does not change saved mode).
 *   prefers-reduced-motion — forces performance visuals (accessibility).
 *   PM.setGfxMode('auto'|'quality'|'performance') — save preference and reload.
 *   ?fps=1 — show a small FPS readout (uses same rAF as particles)
 * Optional match polish (query string):
 *   ?nomatchstagger=1 — all matched cells pop at once (no center-out delay)
 *   ?matchshake=1 — subtle board nudge on clears (skipped when perf-light / reduced-motion path)
 *   ?matchbeam=1 — flash along a full row or column when the match is a straight line (3+)
 *   ?matchfx=1 — shorthand: enables matchshake + matchbeam
 *   ?mute=1 — disable Web Audio SFX
 */
PM.GFX_STORAGE_KEY = 'prism-gfx-mode';

(function () {
  PM.perfLight = false;
  PM.gfxMode = 'auto';
  PM.muteSfx = false;
  PM.showFps = false;
  PM.noMatchStagger = false;
  PM.matchShake = false;
  PM.matchBeam = false;
  try {
    var q = new URLSearchParams(location.search);
    var legacyFull = q.get('fullfx') === '1';
    var legacyPerf = q.get('perf') === '1' || q.get('lightbg') === '1';

    if (legacyFull) {
      PM.perfLight = false;
      PM.gfxMode = 'quality';
      document.documentElement.classList.remove('perf-light');
    } else if (legacyPerf) {
      PM.perfLight = true;
      PM.gfxMode = 'performance';
      document.documentElement.classList.add('perf-light');
    } else {
      var mode = 'auto';
      var g = q.get('gfx');
      if (g === 'quality' || g === 'performance' || g === 'auto') {
        mode = g;
        try {
          localStorage.setItem(PM.GFX_STORAGE_KEY, mode);
        } catch (e) {}
      } else {
        try {
          var stored = localStorage.getItem(PM.GFX_STORAGE_KEY);
          if (stored === 'quality' || stored === 'performance' || stored === 'auto') mode = stored;
        } catch (e) {}
      }
      PM.gfxMode = mode;

      var reduced =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var touchCoarse =
        window.matchMedia &&
        window.matchMedia('(hover: none) and (pointer: coarse)').matches;

      if (reduced) {
        PM.perfLight = true;
      } else if (mode === 'performance') {
        PM.perfLight = true;
      } else if (mode === 'quality') {
        PM.perfLight = false;
      } else {
        PM.perfLight = !!touchCoarse;
      }

      if (PM.perfLight) document.documentElement.classList.add('perf-light');
      else document.documentElement.classList.remove('perf-light');
    }

    if (q.get('fps') === '1') PM.showFps = true;
    if (q.get('nomatchstagger') === '1') PM.noMatchStagger = true;
    if (q.get('matchshake') === '1') PM.matchShake = true;
    if (q.get('matchbeam') === '1') PM.matchBeam = true;
    /** Shorthand: line beam + board nudge (still respects perf / reduced-motion for heavy stuff) */
    if (q.get('matchfx') === '1') {
      PM.matchShake = true;
      PM.matchBeam = true;
    }
    if (q.get('mute') === '1') PM.muteSfx = true;
  } catch (e) {}
  try {
    if (localStorage.getItem('prism-mute-sfx') === '1') PM.muteSfx = true;
  } catch (e) {}
})();

/**
 * Persist graphics mode and reload so CSS + particle loop pick up perf-light consistently.
 */
PM.setGfxMode = function (mode) {
  if (mode !== 'quality' && mode !== 'performance' && mode !== 'auto') return;
  try {
    localStorage.setItem(PM.GFX_STORAGE_KEY, mode);
  } catch (e) {}
  location.reload();
};

/**
 * Freeze moving gradients (#bg, orbs, prism ring) for eval. ?nobgpause=1 — never pause.
 * ?pausebg=2500 — duration in ms (100–60000), default 1500.
 */
PM.pauseBgEvalDurationMs = function () {
  try {
    var custom = parseInt(new URLSearchParams(location.search).get('pausebg'), 10);
    if (custom >= 100 && custom <= 60000) return custom;
  } catch (e) {}
  return 1500;
};
PM.runPauseBgEval = function (ms) {
  try {
    if (new URLSearchParams(location.search).get('nobgpause') === '1') return;
  } catch (e) {}
  ms = ms !== undefined && ms !== null ? ms : PM.pauseBgEvalDurationMs();
  if (ms <= 0) return;
  document.documentElement.classList.add('pause-bg-eval');
  clearTimeout(PM._pauseBgEvalTimer);
  PM._pauseBgEvalTimer = setTimeout(function () {
    document.documentElement.classList.remove('pause-bg-eval');
  }, ms);
};

(function () {
  try {
    PM.runPauseBgEval(PM.pauseBgEvalDurationMs());
  } catch (e) {}
})();
