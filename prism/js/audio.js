/**
 * Lightweight Web Audio SFX (no external files). Requires a user gesture to unlock (browser policy).
 */
var PM = window.PM || (window.PM = {});

(function () {
  var ctx = null;
  var master = null;

  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.28;
      master.connect(ctx.destination);
    }
    return ctx;
  }

  PM.unlockAudio = function () {
    var c = getCtx();
    if (c && c.state === 'suspended') c.resume();
  };

  function now() {
    var c = getCtx();
    return c ? c.currentTime : 0;
  }

  function tone(freq, dur, t0, type, gainVal) {
    var c = getCtx();
    if (!c || !master || PM.muteSfx) return;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gainVal || 0.12, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(master);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  function chord(freqs, dur, t0, vol) {
    var c = getCtx();
    if (!c || !master || PM.muteSfx) return;
    vol = vol || 0.08;
    freqs.forEach(function (f, i) {
      tone(f, dur, t0 + i * 0.028, 'sine', vol);
    });
  }

  PM.playSfx = function (name) {
    if (PM.muteSfx) return;
    var c = getCtx();
    if (!c || c.state === 'suspended') return;
    var t0 = now();
    switch (name) {
      case 'swap':
        tone(660, 0.06, t0, 'sine', 0.1);
        tone(880, 0.05, t0 + 0.04, 'sine', 0.07);
        break;
      case 'invalid':
        tone(120, 0.14, t0, 'triangle', 0.14);
        tone(90, 0.1, t0 + 0.08, 'triangle', 0.1);
        break;
      case 'match':
        chord([523.25, 659.25, 783.99], 0.09, t0, 0.07);
        break;
      case 'combo':
        tone(440, 0.05, t0, 'sine', 0.09);
        tone(554, 0.05, t0 + 0.06, 'sine', 0.09);
        tone(698, 0.06, t0 + 0.12, 'sine', 0.1);
        break;
      case 'power':
        tone(220, 0.04, t0, 'square', 0.06);
        tone(880, 0.08, t0 + 0.02, 'sine', 0.11);
        tone(1320, 0.1, t0 + 0.05, 'sine', 0.08);
        break;
      case 'win':
        chord([523.25, 659.25, 783.99, 1046.5], 0.12, t0, 0.06);
        chord([659.25, 783.99, 1046.5, 1318.5], 0.15, t0 + 0.14, 0.05);
        break;
      case 'lose':
        tone(392, 0.12, t0, 'triangle', 0.1);
        tone(311, 0.15, t0 + 0.1, 'triangle', 0.12);
        tone(246, 0.2, t0 + 0.22, 'triangle', 0.1);
        break;
      case 'ui':
        tone(523, 0.04, t0, 'sine', 0.08);
        break;
      default:
        break;
    }
  };

  PM.setMuteSfx = function (v) {
    PM.muteSfx = !!v;
    try {
      localStorage.setItem('prism-mute-sfx', PM.muteSfx ? '1' : '0');
    } catch (e) {}
  };

  document.addEventListener(
    'pointerdown',
    function () {
      PM.unlockAudio();
    },
    { once: true, passive: true }
  );
})();
