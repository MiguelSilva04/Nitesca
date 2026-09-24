// Card that follows the cursor over portfolio rows. Order matches `projects` in data.js.
export default function CursorPreview() {
  return (
    <div data-preview="" aria-hidden="true" className="preview">
      <div data-thumb="" className="thumb" style={{ background: '#E4D2B8', color: '#2B2118' }}>
        <div className="thumb-meta"><span>ESTÚDIO BARRO</span><span>ÉVORA</span></div>
        <div style={{ position: 'absolute', right: -56, bottom: -56, width: 200, height: 200, border: '2px solid #A85C32', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', right: 4, bottom: 4, width: 88, height: 88, border: '2px solid #A85C32', borderRadius: '50%' }} />
        <div style={{ font: '400 40px/1.02 Fraunces,serif', color: '#A85C32', maxWidth: '7ch' }}>Ateliê de cerâmica</div>
      </div>
      <div data-thumb="" className="thumb" style={{ background: '#1A1A18', color: '#F2F0EA' }}>
        <div className="thumb-meta"><span>SESSÃO EXPERIMENTAL</span><span>SEG–SEX 07–21H</span></div>
        <div style={{ font: '800 64px/.9 Archivo,sans-serif', color: '#D9491F', letterSpacing: '-.01em' }}>NÚCLEO<br />FIT</div>
      </div>
      <div data-thumb="" className="thumb" style={{ background: '#F4EDE0', color: '#3F4A34' }}>
        <div className="thumb-meta"><span>9 EXPERIÊNCIAS</span><span>ALENTEJO</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ height: 2, width: 56, background: '#8A6D3B' }} />
          <div style={{ font: '400 40px/1.05 Lora,serif' }}>Terra Alentejana</div>
        </div>
      </div>
    </div>
  )
}
