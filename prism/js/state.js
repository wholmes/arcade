/** Shared mutable game state (single source of truth for the match loop). */
var PM = window.PM || (window.PM = {});
PM.gs = {
  levelIdx: 0,
  board: [],
  blocked: new Set(),
  moves: 0,
  maxMoves: 0,
  score: 0,
  objectives: [],
  selected: null,
  busy: false,
  combo: 0,
};
PM.rushActive = false;
PM.suppressNextInput = false;
PM.setSuppressNextInput = function (v) {
  PM.suppressNextInput = v;
};
