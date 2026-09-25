import { useGemMotion } from './hooks/useGemMotion.js'
import Header from './components/Header.jsx'
import Gem from './components/Gem.jsx'
import CursorPreview from './components/CursorPreview.jsx'
import Hero from './components/Hero.jsx'
import Porque from './components/Porque.jsx'
import Servicos from './components/Servicos.jsx'
import Portefolio from './components/Portefolio.jsx'
import Processo from './components/Processo.jsx'
import Contacto from './components/Contacto.jsx'
import Footer from './components/Footer.jsx'
import LangTab from './components/LangTab.jsx'
import { LangProvider } from './i18n/LangContext.jsx'

// Former Claude Design props. gemMotion: 'viagem' (glides) | 'salto' (jumps).
const config = { gemMotion: 'viagem', cursorPreview: true, showWordmark: true }

export default function App() {
  const motion = useGemMotion(config)
  return (
    <LangProvider>
      <Header />
      <LangTab />
      <Gem motion={motion} />
      <CursorPreview />
      <main>
        <Hero showWordmark={config.showWordmark} />
        <Porque />
        <Servicos />
        <Portefolio motion={motion} />
        <Processo />
        <Contacto />
      </main>
      <Footer />
    </LangProvider>
  )
}
