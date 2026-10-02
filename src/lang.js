import { dict } from './i18n/dictionary.js'

// The URL decides the language: "/" is Portuguese, "/en/" is English. Both are full static HTML
// (scripts/prerender.mjs bakes the English copy at build time), so crawlers see each language
// at its own address. Every string in index.html is tagged:
//   data-i18n="hero.title"                 → textContent
//   data-i18n-attr="aria-label:header.home" → attributes (several separated by ";")
// Clicking the language tab swaps the text in place and pushes the other URL; no reload.

const PATHS = { pt: '/', en: '/en/' }
const listeners = []
const get = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj)
const langFromPath = () => (location.pathname.startsWith('/en') ? 'en' : 'pt')

let lang = langFromPath()

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
    if (v != null && el.textContent !== v) el.textContent = v
  })
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    for (const pair of el.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':')
      const v = text(key)
      if (v != null) el.setAttribute(attr, v)
    }
  })
  document.documentElement.lang = tr.meta.htmlLang
  for (const link of document.querySelectorAll('.lang-tab [data-lang]')) {
    if (link.dataset.lang === lang) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
  }
  listeners.forEach(fn => fn(tr))
}

function show(next) {
  lang = next
  // Cross-fade the whole page between languages where the browser supports it.
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(apply)
  else apply()
}

export function initLang() {
  document.querySelectorAll('.lang-tab [data-lang]').forEach(link => link.addEventListener('click', ev => {
    if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return // let the browser open a tab
    ev.preventDefault()
    const next = link.dataset.lang
    if (next === lang) return
    history.pushState(null, '', PATHS[next] + location.hash)
    show(next)
  }))
  addEventListener('popstate', () => { if (langFromPath() !== lang) show(langFromPath()) })
  apply() // no-op on the built pages; translates "/en/" on the dev server, which only has the PT file
}
