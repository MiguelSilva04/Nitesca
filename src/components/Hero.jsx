import { useLang } from '../i18n/LangContext.jsx'

export default function Hero({ showWordmark }) {
  const { t } = useLang()
  const h = t.hero
  return (
    <section id="topo" className="hero dark">
      <div className="hero-in">
        <p data-enter="line" className="eyebrow" style={{ marginBottom: 32 }}>{h.eyebrow}</p>
        <h1 data-enter="line">{h.title}</h1>
        <div data-enter="line" className="hero-row">
          <p className="lead">{h.lead}</p>
          <div className="btns">
            <a href="#portefolio" className="btn btn-solid">{h.ctaWork}</a>
            <a href="#contacto" className="btn btn-ghost">{h.ctaQuote}</a>
          </div>
        </div>
      </div>
      {showWordmark && (
        <div aria-hidden="true" className="wordmark">
          {[...'nitesca'].map((ch, i) => (
            <span key={i}>
              <span data-enter="letter">{ch}</span>
              {ch === 's' && <span data-gem="" data-gem-hero="" data-gem-color="#9AB0A0" className="wordmark-gem" />}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
