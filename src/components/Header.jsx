export default function Header() {
  return (
    <header className="header">
      <div className="header-in">
        <a href="#" aria-label="Nitesca — início" className="logo">
          nite<span className="logo-s">s<span className="logo-dot" /></span>ca
        </a>
        <div className="header-right">
          <nav aria-label="Principal" className="nav">
            <a href="#servicos">Serviços</a>
            <a href="#portefolio">Portefólio</a>
            <a href="#processo">Como funciona</a>
            <a href="#contacto">Contacto</a>
          </nav>
          <a href="#contacto" className="btn-cta">Pedir orçamento</a>
        </div>
      </div>
    </header>
  )
}
