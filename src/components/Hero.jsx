export default function Hero({ showWordmark }) {
  return (
    <section id="topo" className="hero dark">
      <div className="hero-in">
        <p data-enter="line" className="eyebrow" style={{ marginBottom: 32 }}>AGÊNCIA DE CRIAÇÃO DE WEBSITES</p>
        <h1 data-enter="line">Mais visibilidade online para o seu negócio — do zero, ou a partir do que já tem.</h1>
        <div data-enter="line" className="hero-row">
          <p className="lead">Seja para começar um site novo, dar mais qualidade ao que já existe nas redes ou no Google, ou refazer um site antigo — o objetivo é sempre o mesmo: a forma mais eficaz de o seu negócio aparecer.</p>
          <div className="btns">
            <a href="#portefolio" className="btn btn-solid">Ver portefólio</a>
            <a href="#contacto" className="btn btn-ghost">Pedir orçamento</a>
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
