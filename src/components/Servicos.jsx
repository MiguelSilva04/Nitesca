import Mark from './Mark.jsx'
import { packages } from '../data.js'
import { useLang } from '../i18n/LangContext.jsx'

export default function Servicos() {
  const { t } = useLang()
  const s = t.services
  return (
    <section id="servicos" className="dark">
      <div className="wrap">
        <p className="eyebrow"><Mark color="#9AB0A0" size={16} inner={10} />{s.eyebrow}</p>
        <h2 className="h2" style={{ marginBottom: 64 }}>{s.title}</h2>
        <div className="packages">
          {packages.map(({ id }) => {
            const p = s.packages[id]
            return (
              <article key={id} id={id} className="pkg">
                <h3>{p.name}</h3>
                <p className="pkg-price"><span className="pkg-from">{p.from}</span>{p.price}</p>
                <p className="pkg-desc">{p.desc}</p>
                <ul>{p.items.map(item => <li key={item}>{item}</li>)}</ul>
              </article>
            )
          })}
        </div>
        <p className="pkg-final">
          {s.final}{' '}
          <a href="#processo">{s.finalLink}</a>
        </p>
        <p className="note">{s.note}</p>
      </div>
    </section>
  )
}
