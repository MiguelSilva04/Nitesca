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

// Cloudflare Turnstile: proves a real browser sent the form. The script loads only when the visitor
// nears the form, so it never costs anything on page load. No site key in index.html = off.
const tsSlot = form.querySelector('[data-turnstile]')
const tsKey = tsSlot?.dataset.sitekey
let tsWidget = null, tsToken = '', tsLoading = false
function loadTurnstile() {
  if (!tsKey || tsLoading) return
  tsLoading = true
  window.onTurnstileLoad = () => {
    tsWidget = window.turnstile.render(tsSlot, {
      sitekey: tsKey,
      appearance: 'interaction-only', // invisible unless a click is really needed
      theme: 'light', // the form sits on the cream background
      callback: token => { tsToken = token },
      'expired-callback': () => { tsToken = '' },
      'error-callback': () => { tsToken = '' },
    })
  }
  const s = document.createElement('script')
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit'
  s.async = true
  document.head.append(s)
}
if (tsKey) {
  const io = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { io.disconnect(); loadTurnstile() } }, { rootMargin: '600px' })
  io.observe(form)
  form.addEventListener('focusin', loadTurnstile, { once: true })
}
// Wait (briefly) for the token: the check runs in the background while the visitor types.
async function turnstileToken() {
  if (!tsKey) return ''
  loadTurnstile()
  for (let waited = 0; !tsToken && waited < 15000; waited += 250) await new Promise(r => setTimeout(r, 250))
  return tsToken
}
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
      body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), lang: document.documentElement.lang.startsWith('en') ? 'en' : 'pt', elapsed: Date.now() - openedAt, token: await turnstileToken() }),
    })
    ok = res.ok && (await res.json()).ok
  } catch { /* offline, or no API on the vite dev server: reported below */ }
  say(sendBtn, 'contact.send')
  sendBtn.disabled = false
  say(status, ok ? 'contact.thanks' : 'contact.failed')
  status.hidden = false
  if (ok) form.reset()
  // A token is single-use: get a fresh one for a possible next message.
  if (tsWidget !== null) { tsToken = ''; window.turnstile.reset(tsWidget) }
})
