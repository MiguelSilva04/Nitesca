import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/LangContext.jsx'

// macOS-style window zoom: the dialog grows out of / shrinks into a point on screen.
// Returns the running animations so the caller can cancel their fill after closing.
function zoom(el, point, dir) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve([])
  const r = el.getBoundingClientRect()
  const at = point || { x: innerWidth / 2, y: innerHeight }
  const small = { transform: `translate(${at.x - (r.left + r.width / 2)}px, ${at.y - (r.top + r.height / 2)}px) scale(.06)`, opacity: 0 }
  const full = { transform: 'none', opacity: 1 }
  const opts = dir === 'in'
    ? { duration: 460, easing: 'cubic-bezier(.16,1,.3,1)' }
    : { duration: 280, easing: 'cubic-bezier(.55,0,.8,.2)', fill: 'forwards' }
  const anims = [el.animate(dir === 'in' ? [small, full] : [full, small], opts)]
  try { anims.push(el.animate({ opacity: dir === 'in' ? [0, 1] : [1, 0] }, { ...opts, pseudoElement: '::backdrop' })) } catch { /* no pseudo support */ }
  return Promise.all(anims.map(a => a.finished)).then(() => anims, () => anims)
}
const chipPoint = () => ({ x: 100, y: innerHeight - 38 })

// Fake browser window (native <dialog>: focus trap, Esc to close, backdrop) with the live demo site in an iframe.
// Traffic lights: red closes, yellow minimises to a chip (iframe state kept), green toggles full screen.
export default function SitePreview({ project, onClose }) {
  const b = useLang().t.browser
  const dialog = useRef(null)
  const frame = useRef(null)
  const minimising = useRef(false)
  const closing = useRef(false)
  const [minimised, setMinimised] = useState(false)
  const [max, setMax] = useState(false)
  // The iframe shares the tab's session history, so history.back() inside it can walk back
  // the Nitesca page itself. Keep the demo's own stack and navigate it with replace instead.
  const [hist, setHist] = useState({ list: [], i: -1 })

  const shownSite = useRef(null)

  useEffect(() => {
    if (!project) { shownSite.current = null; return }
    if (shownSite.current !== project.site) {
      shownSite.current = project.site
      setHist({ list: [], i: -1 })
    }
    setMinimised(false)
    if (!dialog.current.open) {
      dialog.current.showModal()
      zoom(dialog.current, project.from, 'in')
    }
  }, [project])

  if (!project) return null

  const win = () => frame.current?.contentWindow
  const record = () => {
    const url = win()?.location.href
    if (!url || url === 'about:blank') return
    setHist(h => {
      if (h.list[h.i] === url) return h
      if (h.list[h.i - 1] === url) return { ...h, i: h.i - 1 } // browser back inside the demo
      if (h.list[h.i + 1] === url) return { ...h, i: h.i + 1 }
      return { list: [...h.list.slice(0, h.i + 1), url], i: h.i + 1 }
    })
  }
  const onLoad = () => {
    record()
    win().addEventListener('hashchange', record)
    win().addEventListener('popstate', record)
  }
  const go = delta => {
    const i = hist.i + delta, url = hist.list[i], w = win()
    if (!url || !w) return
    setHist({ ...hist, i })
    const u = new URL(url)
    if (u.pathname !== w.location.pathname) return w.location.replace(url)
    // Same page, different anchor: move without adding a history entry.
    w.history.replaceState(null, '', url)
    const target = u.hash && w.document.getElementById(decodeURIComponent(u.hash.slice(1)))
    target ? target.scrollIntoView({ behavior: 'smooth' }) : w.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const current = hist.list[hist.i] ? new URL(hist.list[hist.i]).hash : ''
  const address = `nitesca.com/${b.path}/` + project.site.replace(/^portfolio\/|\.html$/g, '') + current

  // Every close path (red, ✕, Esc, backdrop, minimise) shrinks the window into a point first.
  const shrinkAndClose = point => {
    const d = dialog.current
    if (closing.current || !d.open) return
    closing.current = true
    zoom(d, point, 'out').then(anims => {
      d.close()
      anims.forEach(a => a.cancel())
      closing.current = false
    })
  }
  const closeWin = () => shrinkAndClose(project.from)
  const minimise = () => { minimising.current = true; setMinimised(true); shrinkAndClose(chipPoint()) }
  const restore = () => {
    setMinimised(false)
    dialog.current.showModal()
    zoom(dialog.current, chipPoint(), 'in')
  }
  const handleClose = () => {
    if (minimising.current) { minimising.current = false; return }
    setMax(false)
    onClose()
  }

  return (
    <>
      <dialog
        ref={dialog}
        className={max ? 'browser browser-max' : 'browser'}
        aria-label={`${project.name} — ${b.demo}`}
        onClose={handleClose}
        onCancel={ev => { ev.preventDefault(); closeWin() }}
        onClick={ev => { if (ev.target === dialog.current) closeWin() }}
      >
        <div className="browser-bar">
          <div className="browser-dots">
            <button type="button" aria-label={b.close} onClick={closeWin}>×</button>
            <button type="button" aria-label={b.minimise} onClick={minimise}>−</button>
            <button type="button" aria-label={max ? b.exitFullscreen : b.fullscreen} onClick={() => setMax(m => !m)}>+</button>
          </div>
          <div className="browser-nav">
            <button type="button" aria-label={b.back} disabled={hist.i <= 0} onClick={() => go(-1)}>←</button>
            <button type="button" aria-label={b.forward} disabled={hist.i >= hist.list.length - 1} onClick={() => go(1)}>→</button>
            <button type="button" aria-label={b.reload} onClick={() => win()?.location.reload()}>↻</button>
          </div>
          <div className="browser-url"><span className="browser-lock" aria-hidden="true">●</span>{address}</div>
          <button type="button" className="browser-close" aria-label={b.close} onClick={closeWin}>✕</button>
        </div>
        <iframe ref={frame} src={project.site} title={`${project.name} (${b.frame})`} onLoad={onLoad} />
      </dialog>
      {minimised && (
        <button type="button" className="browser-chip" onClick={restore}>
          <span aria-hidden="true">▢</span> {project.name}
        </button>
      )}
    </>
  )
}
