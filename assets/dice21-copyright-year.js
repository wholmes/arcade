/**
 * Sets .copyright-year text — kept external so extension MV3 CSP allows the page (no inline scripts).
 */
;(function () {
  for (const el of document.querySelectorAll('.copyright-year')) {
    el.textContent = String(new Date().getFullYear())
  }
})()
