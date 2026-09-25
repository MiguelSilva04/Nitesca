import { useState } from 'react'
import Mark from './Mark.jsx'
import { useLang } from '../i18n/LangContext.jsx'

export default function Contacto() {
  const { t } = useLang()
  const c = t.contact
  const [sent, setSent] = useState(false)

  // ponytail: no backend yet — the form only confirms locally. Wire to an email/form service before launch.
  const submit = ev => {
    ev.preventDefault()
    setSent(true)
    ev.currentTarget.reset()
  }

  return (
    <section id="contacto" className="light">
      <div className="wrap contact">
        <div style={{ flex: '1 1 360px' }}>
          <p className="eyebrow"><Mark color="#6B7B6E" size={16} inner={10} />{c.eyebrow}</p>
          <h2 className="h2" style={{ marginBottom: 48, maxWidth: '12ch' }}>{c.title}</h2>
          <div className="contact-info">
            <span>{c.email}</span>
            <span>{c.phone}</span>
          </div>
        </div>
        <form onSubmit={submit} className="form">
          <div className="form-row">
            <label className="field">{c.fields.name}<input name="nome" required autoComplete="name" /></label>
            <label className="field">{c.fields.email}<input name="email" type="email" required autoComplete="email" /></label>
          </div>
          <label className="field">{c.fields.type}<input name="tipo" placeholder={c.fields.typePlaceholder} /></label>
          <label className="field">{c.fields.message}<textarea name="mensagem" rows={4} required /></label>
          <div className="form-actions">
            <button type="submit" className="btn-dark">{c.send}</button>
            {sent && <p role="status" style={{ margin: 0, fontSize: 16 }}>{c.thanks}</p>}
          </div>
        </form>
      </div>
    </section>
  )
}
