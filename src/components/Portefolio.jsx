import { useState } from 'react'
import Mark from './Mark.jsx'
import SitePreview from './SitePreview.jsx'
import { projects } from '../data.js'
import { useLang } from '../i18n/LangContext.jsx'

export default function Portefolio({ motion }) {
  const { t } = useLang()
  const w = t.work
  const [open, setOpen] = useState(null)
  return (
    <section id="portefolio" className="light">
      <div className="wrap">
        <p className="eyebrow"><Mark color="#6B7B6E" size={16} inner={10} />{w.eyebrow}</p>
        <h2 className="h2" style={{ marginBottom: 24 }}>{w.title}</h2>
        <p className="body-lg" style={{ marginBottom: 64 }}>{w.intro}</p>
        <div className="works">
          {projects.map((p, k) => (
            <div key={p.name} data-row="" className="work" onPointerEnter={() => motion.rowEnter(k)} onPointerLeave={motion.rowLeave}>
              <h3>{p.name}</h3>
              <p>{w.projects[p.id].desc}</p>
              <div className="work-links">
                <a href={p.pkg}>{w.projects[p.id].pkgLabel}</a>
                <a
                  href={p.site}
                  onClick={ev => { if (ev.button === 0 && !ev.metaKey && !ev.ctrlKey && !ev.shiftKey) { 
                    ev.preventDefault()
                    const r = ev.currentTarget.getBoundingClientRect()
                    setOpen({ ...p, from: { x: r.left + r.width / 2, y: r.top + r.height / 2 } }) // window zooms out of the link
                  } }}
                  onFocus={ev => motion.rowFocus(k, ev)}
                  onBlur={motion.rowBlur}
                >{w.view}</a>
              </div>
              <div aria-hidden="true" className="work-thumb" style={p.thumb}>{w.projects[p.id].thumb}</div>
            </div>
          ))}
        </div>
      </div>
      <SitePreview project={open} onClose={() => setOpen(null)} />
    </section>
  )
}
