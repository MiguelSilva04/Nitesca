import './index.css'
import { initLang } from './lang.js'
import { initGem } from './gem.js'
import { initSitePreview } from './site-preview.js'

initLang()
const gem = initGem({ gemMotion: 'viagem', cursorPreview: true })
const sitePreview = initSitePreview()

// Portfolio rows: hover/focus drive the cursor preview; "Ver site" opens the demo window.
document.querySelectorAll('[data-row]').forEach((row, k) => {
  row.addEventListener('pointerenter', () => gem.rowEnter(k))
  row.addEventListener('pointerleave', gem.rowLeave)
  const view = row.querySelector('[data-view]')
  view.addEventListener('focus', () => gem.rowFocus(k, row))
  view.addEventListener('blur', gem.rowBlur)
  view.addEventListener('click', ev => {
    if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey) return // let modified clicks open a tab
    ev.preventDefault()
    const r = view.getBoundingClientRect()
    // The window zooms out of the link.
    sitePreview.open({ site: row.dataset.site, name: row.dataset.name, from: { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  })
})

// ponytail: no backend yet — the form only confirms locally. Wire to an email/form service before launch.
const form = document.querySelector('[data-contact-form]')
form.addEventListener('submit', ev => {
  ev.preventDefault()
  form.querySelector('[data-form-status]').hidden = false
  form.reset()
})
