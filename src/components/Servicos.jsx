import Mark from './Mark.jsx'
import { packages } from '../data.js'

export default function Servicos() {
  return (
    <section id="servicos" className="dark">
      <div className="wrap">
        <p className="eyebrow"><Mark color="#9AB0A0" size={16} inner={10} />PACOTES</p>
        <h2 className="h2" style={{ marginBottom: 64 }}>Três formas de começar</h2>
        <div className="packages">
          {packages.map(p => (
            <article key={p.id} id={p.id} className="pkg">
              <h3>{p.name}</h3>
              <p className="pkg-price"><span className="pkg-from">{p.from}</span>{p.price}</p>
              <p className="pkg-desc">{p.desc}</p>
              <ul>{p.items.map(item => <li key={item}>{item}</li>)}</ul>
            </article>
          ))}
        </div>
        <p className="pkg-final">
          O valor final depende do número de páginas e do trabalho de conteúdo — e fica fechado na proposta, antes de começarmos.{' '}
          <a href="#processo">Ver como funciona</a>
        </p>
        <p className="note">Domínio, alojamento e manutenção calculados à parte, consoante o pacote.</p>
      </div>
    </section>
  )
}
