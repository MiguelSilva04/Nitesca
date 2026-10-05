import './fonts.css'
import './index.css'
import { initLang, t } from './lang.js'
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

// Fonts only the portfolio preview cards use: fetch once the page has loaded, off the critical path.
addEventListener('load', () => setTimeout(() => {
  for (const f of ['400 40px Fraunces', '400 40px Lora', '800 40px Archivo']) document.fonts.load(f)
}, 0))

// Contact form → POST /api/contact (worker/index.js) → email to geral@nitesca.com.
const form = document.querySelector('[data-contact-form]')
const status = form.querySelector('[data-form-status]')
const sendBtn = form.querySelector('[type=submit]')
const openedAt = Date.now() // the Worker drops forms sent implausibly fast (bots)
// Messages carry their dictionary key, so switching language re-translates them too.
const say = (el, key) => { el.dataset.i18n = key; el.textContent = key.split('.').reduce((o, k) => o[k], t()) }
// Validation messages in the page's language instead of the browser's.
form.querySelectorAll('input, textarea').forEach(field => {
  field.addEventListener('invalid', () => {
    const e = t().contact.errors
    field.setCustomValidity(field.validity.valueMissing ? e.required : field.validity.typeMismatch ? e.email : '')
  })
  field.addEventListener('input', () => field.setCustomValidity(''))
})
form.addEventListener('submit', async ev => {
  ev.preventDefault()
  if (sendBtn.disabled) return
  sendBtn.disabled = true
  say(sendBtn, 'contact.sending')
  status.hidden = true
  let ok = false
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), lang: document.documentElement.lang.startsWith('en') ? 'en' : 'pt', elapsed: Date.now() - openedAt }),
    })
    ok = res.ok && (await res.json()).ok
  } catch { /* offline, or no API on the vite dev server: reported below */ }
  say(sendBtn, 'contact.send')
  sendBtn.disabled = false
  say(status, ok ? 'contact.thanks' : 'contact.failed')
  status.hidden = false
  if (ok) form.reset()
})
