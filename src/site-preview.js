import { t, onLangChange } from './lang.js'

// Fake browser window with the live demo site in an iframe (the <dialog data-browser> in index.html).
// Traffic lights: red closes, yellow minimises to a chip (iframe state kept), green toggles full screen.

// macOS-style window zoom: the dialog grows out of / shrinks into a point on screen.
// Resolves with the running animations so the caller can cancel their fill after closing.
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

export function initSitePreview() {
  const dialog = document.querySelector('[data-browser]')
  const frame = dialog.querySelector('iframe')
  const url = dialog.querySelector('[data-url]')
  const chip = document.querySelector('[data-chip]')
  const btn = act => dialog.querySelectorAll(`[data-act="${act}"]`)
  const [backBtn] = btn('back'), [fwdBtn] = btn('forward'), [maxBtn] = btn('max')

  let project = null // { site, name, from }
  let max = false, closing = false, minimising = false
  // The iframe shares the tab's session history, so history.back() inside it can walk back
  // the Nitesca page itself. Keep the demo's own stack and navigate it with replace instead.
  let hist = { list: [], i: -1 }

  const win = () => frame.contentWindow
  function render() {
    if (!project) return
    const b = t().browser
    const current = hist.list[hist.i] ? new URL(hist.list[hist.i]).hash : ''
    url.textContent = `nitesca.com/${b.path}/` + project.site.replace(/^portfolio\/|\.html$/g, '') + current
    backBtn.disabled = hist.i <= 0
    fwdBtn.disabled = hist.i >= hist.list.length - 1
    maxBtn.setAttribute('aria-label', max ? b.exitFullscreen : b.fullscreen)
    dialog.classList.toggle('browser-max', max)
    dialog.setAttribute('aria-label', `${project.name} — ${b.demo}`)
    frame.title = `${project.name} (${b.frame})`
  }
  onLangChange(render)

  function record() {
    const href = win()?.location.href
    if (!href || href === 'about:blank') return
    const h = hist
    if (h.list[h.i] === href) return
    if (h.list[h.i - 1] === href) hist = { ...h, i: h.i - 1 } // browser back inside the demo
    else if (h.list[h.i + 1] === href) hist = { ...h, i: h.i + 1 }
    else hist = { list: [...h.list.slice(0, h.i + 1), href], i: h.i + 1 }
    render()
  }
  frame.addEventListener('load', () => {
    if (!project) return
    record()
    win().addEventListener('hashchange', record)
    win().addEventListener('popstate', record)
  })
  function go(delta) {
    const i = hist.i + delta, target = hist.list[i], w = win()
    if (!target || !w) return
    hist = { ...hist, i }
    render()
    const u = new URL(target)
    if (u.pathname !== w.location.pathname) return w.location.replace(target)
    // Same page, different anchor: move without adding a history entry.
    w.history.replaceState(null, '', target)
    const el = u.hash && w.document.getElementById(decodeURIComponent(u.hash.slice(1)))
    el ? el.scrollIntoView({ behavior: 'smooth' }) : w.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function open(next) {
    if (project?.site !== next.site) {
      hist = { list: [], i: -1 }
      frame.src = next.site
    }
    project = next
    chip.hidden = true
    render()
    if (!dialog.open) {
      dialog.showModal()
      zoom(dialog, project.from, 'in')
    }
  }

  // Every close path (red, ✕, Esc, backdrop, minimise) shrinks the window into a point first.
  function shrinkAndClose(point) {
    if (closing || !dialog.open) return
    closing = true
    zoom(dialog, point, 'out').then(anims => {
      dialog.close()
      anims.forEach(a => a.cancel())
      closing = false
    })
  }
  const closeWin = () => shrinkAndClose(project?.from)
  function minimise() {
    minimising = true
    chip.querySelector('[data-chip-name]').textContent = project.name
    chip.hidden = false
    shrinkAndClose(chipPoint())
  }
  chip.addEventListener('click', () => {
    chip.hidden = true
    dialog.showModal()
    zoom(dialog, chipPoint(), 'in')
  })
  dialog.addEventListener('close', () => {
    if (minimising) { minimising = false; return }
    max = false
    project = null
    frame.src = 'about:blank' // unload the demo
    dialog.classList.remove('browser-max')
  })
  dialog.addEventListener('cancel', ev => { ev.preventDefault(); closeWin() })
  dialog.addEventListener('click', ev => { if (ev.target === dialog) closeWin() })

  btn('close').forEach(b => b.addEventListener('click', closeWin))
  btn('minimise')[0].addEventListener('click', minimise)
  maxBtn.addEventListener('click', () => { max = !max; render() })
  backBtn.addEventListener('click', () => go(-1))
  fwdBtn.addEventListener('click', () => go(1))
  btn('reload')[0].addEventListener('click', () => win()?.location.reload())

  return { open }
}
