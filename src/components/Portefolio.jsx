import { useState } from 'react'
import Mark from './Mark.jsx'
import SitePreview from './SitePreview.jsx'
import { projects } from '../data.js'

export default function Portefolio({ motion }) {
  const [open, setOpen] = useState(null)
  return (
    <section id="portefolio" className="light">
      <div className="wrap">
        <p className="eyebrow"><Mark color="#6B7B6E" size={16} inner={10} />EXEMPLOS</p>
        <h2 className="h2" style={{ marginBottom: 24 }}>Um projeto para cada pacote</h2>
        <p className="body-lg" style={{ marginBottom: 64 }}>Como a Nitesca está a começar, estes três são projetos de demonstração — negócios fictícios, construídos por nós de raiz, para mostrar exatamente o que cada pacote entrega.</p>
        <div className="works">
          {projects.map((p, k) => (
            <div key={p.name} data-row="" className="work" onPointerEnter={() => motion.rowEnter(k)} onPointerLeave={motion.rowLeave}>
              <h3>{p.name}</h3>
              <p>{p.desc}</p>
              <div className="work-links">
                <a href={p.pkg}>{p.pkgLabel}</a>
                <a
                  href={p.site}
                  onClick={ev => { if (ev.button === 0 && !ev.metaKey && !ev.ctrlKey && !ev.shiftKey) { 
                    ev.preventDefault()
                    const r = ev.currentTarget.getBoundingClientRect()
                    setOpen({ ...p, from: { x: r.left + r.width / 2, y: r.top + r.height / 2 } }) // window zooms out of the link
                  } }}
                  onFocus={ev => motion.rowFocus(k, ev)}
                  onBlur={motion.rowBlur}
                >Ver site</a>
              </div>
              <div aria-hidden="true" className="work-thumb" style={p.thumb.style}>{p.thumb.text}</div>
            </div>
          ))}
        </div>
      </div>
      <SitePreview project={open} onClose={() => setOpen(null)} />
    </section>
  )
}
