/**
 * Toggle for experimental "action camera" — orbit shifts slightly with play (main bundle reads window.__d21CamSidePlay).
 * Persists to localStorage. Must load before the Dice 21 main chunk.
 *
 * Copyright © Whittfield Holmes. All rights reserved.
 */
;(function () {
  var KEY = 'dice21_cam_side_play_v1'

  function read() {
    try {
      return localStorage.getItem(KEY) === '1'
    } catch (_) {
      return false
    }
  }

  function write(v) {
    try {
      localStorage.setItem(KEY, v ? '1' : '0')
    } catch (_) {}
  }

  function sync() {
    var on = read()
    if (typeof window !== 'undefined') window.__d21CamSidePlay = on
    var b = document.getElementById('d21CamSidePlayBtn')
    if (b) {
      b.setAttribute('aria-pressed', on ? 'true' : 'false')
      b.classList.toggle('is-active', on)
    }
  }

  if (typeof window !== 'undefined') window.__d21CamSidePlay = read()

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn)
    else fn()
  }

  ready(function () {
    sync()
    var b = document.getElementById('d21CamSidePlayBtn')
    if (b) {
      b.addEventListener('click', function () {
        write(!read())
        sync()
      })
    }
  })
})()
