import Mark from './Mark.jsx'
import { useLang } from '../i18n/LangContext.jsx'

export default function Porque() {
  const { t } = useLang()
  const s = t.story
  return (
    <section id="porque" className="light">
      <div className="wrap">
        <div className="story">
          <div className="story-text">
            <p className="eyebrow">{s.eyebrow}</p>
            <h2 className="h2" style={{ marginBottom: 32, textWrap: 'balance' }}>{s.title}</h2>
            <p className="body-lg">{s.body}</p>
          </div>
          <div className="story-aside">
            <Mark color="#6B7B6E" size={200} inner={140} />
            <div className="definition">
              <p className="definition-word" lang="la">{s.word}</p>
              <p className="definition-meaning">{s.meaning}</p>
            </div>
          </div>
        </div>
        <div className="dont">
          <h3>{s.dontTitle}</h3>
          <p>{s.dontBody}</p>
        </div>
      </div>
    </section>
  )
}
