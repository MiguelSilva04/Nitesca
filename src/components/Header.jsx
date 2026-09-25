import { useLang } from '../i18n/LangContext.jsx'

export default function Header() {
  const { t } = useLang()
  const h = t.header
  return (
    <header className="header">
      <div className="header-in">
        <a href="#" aria-label={h.home} className="logo">
          nite<span className="logo-s">s<span className="logo-dot" /></span>ca
        </a>
        <div className="header-right">
          <nav aria-label={h.navLabel} className="nav">
            <a href="#servicos">{h.nav.servicos}</a>
            <a href="#portefolio">{h.nav.portefolio}</a>
            <a href="#processo">{h.nav.processo}</a>
            <a href="#contacto">{h.nav.contacto}</a>
          </nav>
          <a href="#contacto" className="btn-cta">{h.cta}</a>
        </div>
      </div>
    </header>
  )
}
