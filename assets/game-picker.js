/**
 * Small “games” menu: multiple triggers can open the same panel (e.g. desktop logo + mobile FAB).
 * Copyright © Whittfield Holmes. All rights reserved.
 */
;(function () {
  var OPEN = 'is-open'
  var activeMenu = null
  var activeTriggers = []

  function isHidden(el) {
    return !el || el.hasAttribute('hidden') || el.getAttribute('aria-hidden') === 'true'
  }

  function positionPanel(trigger, panel) {
    var r = trigger.getBoundingClientRect()
    var pw = panel.offsetWidth
    var left = r.left + r.width / 2 - pw / 2
    var maxL = window.innerWidth - pw - 8
    if (left < 8) left = 8
    if (left > maxL) left = Math.max(8, maxL)
    panel.style.left = left + 'px'
    panel.style.top = r.bottom + 8 + 'px'
  }

  function closeMenu() {
    if (!activeMenu) return
    activeMenu.hidden = true
    activeMenu.classList.remove(OPEN)
    activeMenu.setAttribute('aria-hidden', 'true')
    activeTriggers.forEach(function (t) {
      t.setAttribute('aria-expanded', 'false')
    })
    activeTriggers = []
    activeMenu = null
    document.removeEventListener('keydown', onDocKey)
    document.removeEventListener('click', onDocClick, true)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('scroll', onScroll, true)
  }

  function onDocKey(e) {
    if (e.key === 'Escape') closeMenu()
  }

  function onDocClick(e) {
    if (!activeMenu) return
    var t = e.target
    if (activeMenu.contains(t)) return
    if (activeTriggers.some(function (tr) { return tr.contains(t) })) return
    closeMenu()
  }

  function onResize() {
    closeMenu()
  }

  function onScroll() {
    closeMenu()
  }

  function openMenu(menu, trigger) {
    if (activeMenu && activeMenu !== menu) closeMenu()
    activeMenu = menu
    activeTriggers = Array.prototype.slice.call(
      document.querySelectorAll('[data-game-picker-panel="' + menu.id + '"]'),
    )
    if (activeTriggers.indexOf(trigger) === -1) activeTriggers.push(trigger)
    menu.hidden = false
    menu.classList.add(OPEN)
    menu.setAttribute('aria-hidden', 'false')
    activeTriggers.forEach(function (t) {
      t.setAttribute('aria-expanded', 'true')
    })
    positionPanel(trigger, menu)
    document.addEventListener('keydown', onDocKey)
    document.addEventListener('click', onDocClick, true)
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, true)
  }

  function init() {
    document.querySelectorAll('[data-game-picker-panel]').forEach(function (trigger) {
      var id = trigger.getAttribute('data-game-picker-panel')
      if (!id) return
      var menu = document.getElementById(id)
      if (!menu) return

      trigger.addEventListener('click', function (e) {
        e.preventDefault()
        e.stopPropagation()
        if (!isHidden(menu) && activeMenu === menu) {
          closeMenu()
          return
        }
        openMenu(menu, trigger)
      })
    })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
