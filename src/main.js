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

// No backend: the form opens the visitor's email app with a message to geral@nitesca.com already written.
const form = document.querySelector('[data-contact-form]')
// Validation messages in the page's language instead of the browser's.
form.querySelectorAll('input, textarea').forEach(field => {
  field.addEventListener('invalid', () => {
    const e = t().contact.errors
    field.setCustomValidity(field.validity.valueMissing ? e.required : field.validity.typeMismatch ? e.email : '')
  })
  field.addEventListener('input', () => field.setCustomValidity(''))
})
form.addEventListener('submit', ev => {
  ev.preventDefault()
  const f = Object.fromEntries(new FormData(form))
  const m = t().contact.mail
  const subject = `${m.subject} — ${f.nome}${f.tipo ? ` (${f.tipo})` : ''}`
  const body = [`${m.name}: ${f.nome}`, `${m.email}: ${f.email}`, `${m.type}: ${f.tipo || '—'}`, '', f.mensagem.replace(/\r?\n/g, '\r\n')].join('\r\n')
  location.href = `mailto:geral@nitesca.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  form.querySelector('[data-form-status]').hidden = false // kept filled in, in case they need to send again
})
