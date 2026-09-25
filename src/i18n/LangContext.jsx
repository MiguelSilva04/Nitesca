import { createContext, useContext, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { dict } from './dictionary.js'

const LangContext = createContext(null)
const KEY = 'nitesca-lang'

// Saved choice first, then the browser's language; anything that isn't Portuguese gets English.
function initialLang() {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved in dict) return saved
  } catch { /* storage blocked */ }
  return (navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang)
  const t = dict[lang]

  useEffect(() => {
    document.documentElement.lang = t.meta.htmlLang
    document.title = t.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description)
  }, [t])

  const setLang = next => {
    if (next === lang) return
    try { localStorage.setItem(KEY, next) } catch { /* storage blocked */ }
    const apply = () => flushSync(() => setLangState(next))
    // Cross-fade the whole page between languages where the browser supports it.
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(apply)
    else apply()
  }

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
