import { dict, languages } from './i18n/dictionary.js'

// The HTML ships in Portuguese with every string tagged:
//   data-i18n="hero.title"                 → textContent
//   data-i18n-attr="aria-label:header.home" → attributes (several separated by ";")
// Switching language rewrites those nodes from the dictionary.

const KEY = 'nitesca-lang'
const listeners = []
const get = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj)

function initialLang() {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved in dict) return saved
  } catch { /* storage blocked */ }
  return (navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

let lang = initialLang()

export const t = () => dict[lang]
export const onLangChange = fn => listeners.push(fn)

function apply() {
  const tr = dict[lang]
  const text = key => {
    const v = get(tr, key)
    if (typeof v !== 'string') console.warn(`i18n: missing "${key}" for ${lang}`)
    return v
  }
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = text(el.dataset.i18n)
    if (v != null) el.textContent = v
  })
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    for (const pair of el.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':')
      const v = text(key)
      if (v != null) el.setAttribute(attr, v)
    }
  })
  document.documentElement.lang = tr.meta.htmlLang
  document.title = tr.meta.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', tr.meta.description)

  for (const btn of document.querySelectorAll('.lang-tab [data-lang]')) {
    const on = btn.dataset.lang === lang
    const name = languages.find(l => l.code === btn.dataset.lang).name
    btn.setAttribute('aria-pressed', on)
    btn.setAttribute('aria-label', on ? name : `${tr.lang.switchTo} ${name}`)
  }
  listeners.forEach(fn => fn(tr))
}

export function setLang(next) {
  if (next === lang || !(next in dict)) return
  lang = next
  try { localStorage.setItem(KEY, next) } catch { /* storage blocked */ }
  // Cross-fade the whole page between languages where the browser supports it.
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(apply)
  else apply()
}

export function initLang() {
  document.querySelectorAll('.lang-tab [data-lang]').forEach(btn => btn.addEventListener('click', () => setLang(btn.dataset.lang)))
  apply()
  document.documentElement.classList.remove('i18n-pending')
}
