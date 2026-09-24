import Mark from './Mark.jsx'
import { steps } from '../data.js'

export default function Processo() {
  return (
    <section id="processo" className="dark">
      <div className="wrap process">
        <div className="process-head">
          <p className="eyebrow">PROCESSO</p>
          <h2 className="h2" style={{ maxWidth: '12ch' }}>Do primeiro contacto ao site no ar</h2>
        </div>
        <ol className="steps">
          {steps.map((s, i) => (
            <li key={s.title} className="step">
              <Mark color="#9AB0A0" size={24} inner={14} className="step-mark" />
              <div>
                <p className="step-n">{String(i + 1).padStart(2, '0')}</p>
                <h3>{s.title}</h3>
                <p className="step-text">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
