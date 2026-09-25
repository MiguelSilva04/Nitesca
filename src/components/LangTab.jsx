import { useLang } from '../i18n/LangContext.jsx'
import { languages } from '../i18n/dictionary.js'

// Language switcher styled as a dictionary thumb-index tab on the page edge:
// short entries ("pt", "en") that open to the full language name on hover or focus.
export default function LangTab() {
  const { lang, setLang, t } = useLang()
  return (
    <div className="lang-tab" role="group" aria-label={t.lang.group}>
      {languages.map(l => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          aria-pressed={lang === l.code}
          aria-label={lang === l.code ? l.name : `${t.lang.switchTo} ${l.name}`}
          onClick={() => setLang(l.code)}
        >
          <span className="lang-gem" aria-hidden="true" />
          <span className="lang-code">{l.code}</span>
          <span className="lang-name" aria-hidden="true">{l.name}</span>
        </button>
      ))}
    </div>
  )
}
