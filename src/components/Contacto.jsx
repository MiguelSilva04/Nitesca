import { useState } from 'react'
import Mark from './Mark.jsx'

export default function Contacto() {
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
          <p className="eyebrow"><Mark color="#6B7B6E" size={16} inner={10} />FALE CONNOSCO</p>
          <h2 className="h2" style={{ marginBottom: 48, maxWidth: '12ch' }}>Vamos falar sobre o seu negócio</h2>
          <div className="contact-info">
            <span>[email a definir]</span>
            <span>[telefone a definir]</span>
          </div>
        </div>
        <form onSubmit={submit} className="form">
          <div className="form-row">
            <label className="field">Nome<input name="nome" required autoComplete="name" /></label>
            <label className="field">Email<input name="email" type="email" required autoComplete="email" /></label>
          </div>
          <label className="field">Tipo de negócio<input name="tipo" placeholder="Florista, contabilista, personal trainer…" /></label>
          <label className="field">Mensagem<textarea name="mensagem" rows={4} required /></label>
          <div className="form-actions">
            <button type="submit" className="btn-dark">Enviar</button>
            {sent && <p role="status" style={{ margin: 0, fontSize: 16 }}>Obrigado — respondemos em breve.</p>}
          </div>
        </form>
      </div>
    </section>
  )
}
