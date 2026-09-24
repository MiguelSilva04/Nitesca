import Mark from './Mark.jsx'

export default function Porque() {
  return (
    <section id="porque" className="light">
      <div className="wrap">
        <div className="story">
          <div className="story-text">
            <p className="eyebrow">A HISTÓRIA</p>
            <h2 className="h2" style={{ marginBottom: 32, textWrap: 'balance' }}>Um nome que significa "começar a brilhar"</h2>
            <p className="body-lg">Nitesca vem do latim nitescere, "começar a brilhar". Ligamos isso a um propósito simples: dar mais visibilidade a um negócio online — quer esteja a começar do zero, quer já tenha presença e precise que ela trabalhe melhor a seu favor.</p>
          </div>
          <div className="story-aside">
            <Mark color="#6B7B6E" size={200} inner={140} />
            <div className="definition">
              <p className="definition-word">nitēscere</p>
              <p className="definition-meaning">latim, verbo — começar a brilhar</p>
            </div>
          </div>
        </div>
        <div className="dont">
          <h3>O que não fazemos</h3>
          <p>Não trabalhamos com os modelos genéricos que as ferramentas de IA generativa produzem em segundos. Ficam de fora os gradientes chamativos sem razão de ser, os ícones de banco de imagens repetidos, os testemunhos inventados e as animações em cascata que só servem para parecer moderno. Cada site é desenhado à mão para o negócio específico que representa.</p>
        </div>
      </div>
    </section>
  )
}
