import { useLang } from '../i18n/LangContext.jsx'

export default function Footer() {
  const { t } = useLang()
  return (
    <footer className="dark">
      <div className="footer-in">
        <div className="footer-top">
          <p aria-label="Nitesca" className="footer-logo">
            nite<span className="logo-s">s<span data-gem="" data-gem-color="#9AB0A0" className="footer-gem"><span /></span></span>ca
          </p>
          <div className="footer-info">
            <div><span>{t.contact.email}</span><span>{t.contact.phone}</span></div>
            <div><span style={{ color: 'var(--sage)' }}>{t.footer.social}</span><span>{t.footer.tbd}</span></div>
          </div>
        </div>
        <p className="footer-copy">© 2026 Nitesca</p>
      </div>
    </footer>
  )
}
