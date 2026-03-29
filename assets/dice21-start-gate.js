/**
 * Tap-to-start gate: preload gameplay-critical audio, then enable "Tap to play".
 * DJ playlist files load afterward in the background (limited concurrency) so they
 * do not block the gate or spike the network. Click calls window.d21EnterGame().
 *
 * Copyright © Whittfield Holmes. All rights reserved.
 */
;(function () {
  const gate = document.getElementById('d21StartGate')
  const statusEl = document.getElementById('d21StartStatus')
  const btn = document.getElementById('d21StartBtn')
  if (!gate || !btn) return

  /** Resolve paths relative to site root: page lives under /dice-21/, audio and assets are siblings (../audio, ../assets). */
  function publicUrl(rel) {
    const clean = rel.replace(/^\//, '')
    return new URL('../' + clean, document.baseURI).href
  }

  /** Short SFX + room bed needed for first rolls / ambience — gate waits only for these. */
  function preloadCriticalAudio() {
    const paths = [
      'audio/freesound_community-dice-shake-102631.wav',
      'audio/freesound_community-casino-ambiance-19130.wav',
      'audio/freesound_community-dry-dices-38579.wav',
      'audio/freesound_community-dry-dices-solo-38579.wav',
    ]
    const urls = paths.map((p) => publicUrl(p))
    return Promise.all(urls.map((u) => fetch(u, { cache: 'force-cache' }).catch(() => null)))
  }

  /**
   * DJ tracks from manifest — runs after the button is enabled; does not block the gate.
   * Fetches in small batches to avoid saturating the connection.
   */
  function preloadDjBackground() {
    const manifestUrl = publicUrl('audio/dj/dj-manifest.json')
    const concurrency = 2

    fetch(manifestUrl, { cache: 'force-cache' })
      .then((r) => (r.ok ? r.json() : { files: [] }))
      .then((j) => {
        const files = Array.isArray(j.files) ? j.files : []
        const urls = files.map((f) => publicUrl('audio/dj/' + encodeURIComponent(f)))
        if (urls.length === 0) return

        let i = 0
        function runBatch() {
          const batch = urls.slice(i, i + concurrency)
          i += batch.length
          if (batch.length === 0) return
          Promise.all(batch.map((u) => fetch(u, { cache: 'force-cache' }).catch(() => null))).then(runBatch)
        }
        runBatch()
      })
      .catch(() => {})
  }

  function enableButton() {
    btn.disabled = false
    if (statusEl) statusEl.textContent = ''
    try {
      btn.focus()
    } catch {
      /* ignore */
    }
  }

  let bootstrapStarted = false

  function runBootstrap() {
    if (bootstrapStarted) return
    if (typeof window.d21EnterGame !== 'function') return
    bootstrapStarted = true
    window.removeEventListener('d21-ready', onReady)
    if (pollId != null) {
      clearInterval(pollId)
      pollId = null
    }
    if (statusEl) statusEl.textContent = 'Loading audio…'
    preloadCriticalAudio()
      .then(() => {
        enableButton()
        preloadDjBackground()
      })
      .catch(() => {
        enableButton()
        preloadDjBackground()
      })
  }

  function onReady() {
    runBootstrap()
  }

  let pollId = null

  function wire() {
    if (typeof window.d21EnterGame === 'function') {
      runBootstrap()
      return
    }
    window.addEventListener('d21-ready', onReady, { once: true })
    pollId = window.setInterval(() => {
      if (typeof window.d21EnterGame === 'function') runBootstrap()
    }, 40)
  }

  wire()

  btn.addEventListener('click', () => {
    if (typeof window.d21EnterGame !== 'function' || btn.disabled) return
    gate.hidden = true
    gate.setAttribute('aria-hidden', 'true')
    document.body.classList.add('d21-game-started')
    window.d21EnterGame()
  })
})()
